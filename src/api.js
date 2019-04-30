// @flow
import * as f from 'fpx'
import * as t from './types'
import * as e from './env'
import * as u from './utils'
import * as n from './net'
import * as a from './auth'
import * as s from './sheets'
import * as db from './db'

const {
  SESSION_HEADER_NAME,
  SESSION_COOKIE_NAME,
  CRYPTO_ALGORITHM,
  CRYPTO_PASSWORD,
  CRYPTO_SALT,
  CRYPTO_KEYLENGTH,
} = e.properties

/**
 * Middlewares
 */

export async function authRequired(ctx: t.Context, next: () => Promise<void>): Promise<void> {
  const headerSessionId: string | void = ctx.headers[SESSION_HEADER_NAME]
  const cookieSessionId: string | void = a.getCookie(ctx, SESSION_COOKIE_NAME)
  const sessionId: string | void = headerSessionId || cookieSessionId
  const session: t.Session | void = sessionId
    ? await db.sessionById(sessionId)
    : undefined

  if (!session) {
    ctx.throw(401, 'Unauthorized')
    return
  }

  const encryptedToken: string | void = session.externalToken
  if (!encryptedToken) {
    ctx.throw(400, 'Token is required')
    return
  }

  const decryptedToken: string = u.decrypt(
    CRYPTO_ALGORITHM,
    CRYPTO_PASSWORD,
    CRYPTO_SALT,
    CRYPTO_KEYLENGTH,
    encryptedToken
  )

  const token: t.GAuthToken | void = JSON.parse(decryptedToken)

  ctx.client = a.createOAuth2Client(token)
  ctx.sessionId = session.id

  await next()
}

export async function spreadsheetIdRequired(ctx: t.Context, next: () => Promise<void>): Promise<void> {
  const sessionId: string = ctx.sessionId
  // const spreadsheetId: string | void = ctx.query.spreadsheetId
  // if (!spreadsheetId) {
  //   ctx.throw(400, 'Spreadsheet id is required')
  //   return
  // }

  const spreadsheets: t.Spreadsheets = await db.spreadsheetsBySessionId(sessionId)
  // const spreadsheet: t.Spreadsheet | void = spreadsheets.filter(s => s.id === spreadsheetId)
  const spreadsheet: t.Spreadsheet | void = spreadsheets[0]
  if (!spreadsheet) {
    ctx.throw(400, 'Spreadsheet not found')
    return
  }

  ctx.gSpreadsheetId = spreadsheet.externalId

  await next()
}

export async function jsonOnly(ctx: t.Context, next: () => Promise<void>): Promise<void> {
  if (!ctx.accepts('application/json')) {
    ctx.throw(406, 'Not acceptable')
    return
  }

  await next()
}



/**
 * Auth
 */

export function authLogin(ctx: t.Context): void {
  const redirectTo: string | void = ctx.query.redirectTo
    ? encodeURIComponent(ctx.query.redirectTo)
    : undefined
  const authUrl: string = a.generateAuthUrl(redirectTo)
  ctx.redirect(authUrl)
}

export async function authLogout(ctx: t.Context): Promise<void> {
  const sessionId: string | void = a.getCookie(ctx, SESSION_COOKIE_NAME)
  if (!sessionId) {
    ctx.throw(400, 'Session id is required')
    return
  }

  const session: t.Session | void = await db.logout(sessionId)
  if (!session) {
    ctx.throw(404, 'Session not found')
    return
  }

  a.setCookieExpired(ctx, SESSION_COOKIE_NAME)
  ctx.body = 'Success'
}

export async function authCode (ctx: t.Context): Promise<void>  {
  const code: string | void = ctx.query.code
  if (!code) {
    ctx.throw(400, 'Code is required')
    return
  }

  const token: t.GAuthToken | void = await a.exchangeCodeForToken(code)
  if (!token) {
    ctx.throw(400, 'Token is required')
    return
  }

  const oAuth2Client = a.createOAuth2Client(token)
  const gUser: t.GUser | void = await n.fetchUserInfo(oAuth2Client)
  if (!gUser) {
    ctx.throw(400, 'User not found')
    return
  }

  const user: t.User = {
    externalId   : gUser.id,
    pictureUrl   : gUser.picture,
    email        : gUser.email,
    emailVerified: gUser.verified_email,
    firstName    : gUser.given_name,
    lastName     : gUser.family_name,
  }

  const encryptedToken: string = u.encrypt(
    CRYPTO_ALGORITHM,
    CRYPTO_PASSWORD,
    CRYPTO_SALT,
    CRYPTO_KEYLENGTH,
    JSON.stringify(token)
  )

  const session: t.Session = await db.login(user, encryptedToken)

  a.setCookie(ctx, SESSION_COOKIE_NAME, session.id)

  const redirectTo: string | void = ctx.query.state
  if (redirectTo) {
    ctx.redirect(decodeURIComponent(redirectTo))
    return
  }

  ctx.redirect('/')
}



/**
 * User
 */

export async function getUser(ctx: t.Context) {
  const sessionId: string = ctx.sessionId
  const user: t.User | void = await db.userBySessionId(sessionId)
  if (!user) {
    ctx.throw(404, 'User not found')
    return
  }

  const spreadsheets: t.Spreadsheets = await db.spreadsheetsBySessionId(sessionId)
  let spreadsheet: t.Spreadsheet | void = spreadsheets[0]

  if (!spreadsheet) {
    const client: t.GOAuth2Client = ctx.client
    const gSpreadsheet: t.GSpreadsheet = await n.createAppSpreadsheet(client)
    spreadsheet = await db.createSpreadsheet(sessionId, gSpreadsheet.spreadsheetId)
  }

  ctx.body = {...user, spreadsheets: [{id: spreadsheet.id}]}
}



/**
 * Accounts
 */

export async function getAccounts(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const accounts: t.Accounts = await n.fetchAccounts(client, gSpreadsheetId)

  const accountIds = f.map(accounts, ({id}) => id)
  const balances: t.Balances = await n.fetchBalancesByAccountIds(client, gSpreadsheetId, accountIds)

  ctx.body = f.map(accounts, account => ({
    ...account,
    balance: balances[account.id] ? balances[account.id].balance : 0,
  }))
}

export async function getAccount(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Account id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const account: t.Account | void = await n.fetchAccount(client, gSpreadsheetId, id)
  if (!account) {
    ctx.throw(404, 'Account not found')
    return
  }

  const balances: t.Balances = await n.fetchBalancesByAccountIds(client, gSpreadsheetId, [account.id])

  ctx.body = {
    ...account,
    balance: balances[account.id] ? balances[account.id].balance : 0,
  }
}

export async function createAccount(ctx: t.Context): Promise<void> {
  const errors: t.ResErrors = validateAccountFields(ctx.request.body)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const account: t.Account = await n.createAccount(client, gSpreadsheetId, ctx.request.body)

  ctx.body = account
}

export async function updateAccount(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Account id is required')
    return
  }

  if (id === s.DEBT_ACCOUNT_ID) {
    ctx.throw(400, 'You can not change this account')
  }

  const errors: t.ResErrors = validateAccountFields(ctx.request.body)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const account: t.Account = await n.updateAccount(client, gSpreadsheetId, id, ctx.request.body)

  ctx.body = account
}

export async function deleteAccount(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Account id is required')
    return
  }

  if (id === s.DEBT_ACCOUNT_ID) {
    ctx.throw(400, 'You can not delete this account')
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transactions: t.Transactions = await n.fetchTransactions(client, gSpreadsheetId, {accountId: id})
  if (transactions.length) {
    ctx.throw(400, 'Can not delete. There are related transactions')
    return
  }

  const account: t.Account = await n.deleteAccount(client, gSpreadsheetId, id)
  ctx.body = account
}


function validateAccountFields(fields: Object): t.ResErrors {
  const errors: t.ResErrors = []

  if (!f.isString(fields.title) || !fields.title.length) {
    errors.push({text: 'Title must be non empty string'})
  }

  return errors
}



/**
 * Categories
 */

export async function getCategories(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const categories: t.Categories = await n.fetchCategories(client, gSpreadsheetId)
  ctx.body = categories
}

export async function getCategory(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Category id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const category: t.Category | void = await n.fetchCategory(client, gSpreadsheetId, id)
  if (!category) {
    ctx.throw(404, 'Category not found')
    return
  }

  ctx.body = category
}

export async function createCategory(ctx: t.Context): Promise<void> {
  const errors: t.ResErrors = validateCategoryFields(ctx.request.body)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const category: t.Category = await n.createCategory(client, gSpreadsheetId, ctx.request.body)

  ctx.body = category
}

export async function updateCategory(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Category id is required')
    return
  }

  const errors: t.ResErrors = validateCategoryFields(ctx.request.body)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const category: t.Category = await n.updateCategory(client, gSpreadsheetId, id, ctx.request.body)

  ctx.body = category
}

export async function deleteCategory(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Category id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transactions: t.Transactions = await n.fetchTransactions(client, gSpreadsheetId, {categoryId: id})
  if (transactions.length) {
    ctx.throw(400, 'Can not delete. There are related transactions')
    return
  }

  const category: t.Category = await n.deleteCategory(client, gSpreadsheetId, id)
  ctx.body = category
}


function validateCategoryFields(fields: Object): t.ResErrors {
  const errors: t.ResErrors = []

  if (!f.isString(fields.title) || !fields.title.length) {
    errors.push({text: 'Title must be non empty string'})
  }

  return errors
}



/**
 * Payees
 */

export async function getPayees(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payees: t.Payees = await n.fetchPayees(client, gSpreadsheetId)
  ctx.body = payees
}

export async function getPayee(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Payee id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payee: t.Payee | void = await n.fetchPayee(client, gSpreadsheetId, id)
  if (!payee) {
    ctx.throw(404, 'Payee not found')
    return
  }

  ctx.body = payee
}

export async function createPayee(ctx: t.Context): Promise<void> {
  const errors: t.ResErrors = validatePayeeFields(ctx.request.body)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payee: t.Payee = await n.createPayee(client, gSpreadsheetId, ctx.request.body)

  ctx.body = payee
}

export async function updatePayee(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Payee id is required')
    return
  }

  const errors: t.ResErrors = validatePayeeFields(ctx.request.body)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payee: t.Payee = await n.updatePayee(client, gSpreadsheetId, id, ctx.request.body)

  ctx.body = payee
}

export async function deletePayee(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Payee id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transactions: t.Transactions = await n.fetchTransactions(client, gSpreadsheetId, {payeeId: id})
  if (transactions.length) {
    ctx.throw(400, 'Can not delete. There are related transactions')
    return
  }

  const payee: t.Payee = await n.deletePayee(client, gSpreadsheetId, id)
  ctx.body = payee
}


function validatePayeeFields(fields: Object): t.ResErrors {
  const errors: t.ResErrors = []

  if (!f.isString(fields.title) || !fields.title.length) {
    errors.push({text: 'Title must be non empty string'})
  }

  return errors
}



/**
 * Transactions
 */

const OUTCOME  = 'OUTCOME'
const INCOME   = 'INCOME'
const TRANSFER = 'TRANSFER'
const LOAN     = 'LOAN'
const BORROW   = 'BORROW'

const TRANSACTON_TYPES: Array<t.TransactionType> = [OUTCOME, INCOME, TRANSFER, LOAN, BORROW]

export async function getTransactions(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const filter: t.TransactionsFilter = ctx.query
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transactions: t.Transactions = await n.fetchTransactions(client, gSpreadsheetId, filter)

  ctx.body = f.map(
    transactions,
    transaction => ({...transaction, type: defTransactionType(transaction)})
  )
}

export async function getTransaction(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Transaction id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transaction: t.Transaction | void = await n.fetchTransaction(client, gSpreadsheetId, id)
  if (!transaction) {
    ctx.throw(404, 'Transaction not found')
    return
  }

  ctx.body = {...transaction, type: defTransactionType(transaction)}
}

export async function createTransaction(ctx: t.Context): Promise<void> {
  const errors: t.ResErrors = validateTransactionFields(ctx.request.body)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  let fields: Object = ctx.request.body

  if (fields.type === LOAN) {
    fields = {...fields, incomeAccountId: s.DEBT_ACCOUNT_ID, incomeAmount: fields.outcomeAmount}
  }

  if (fields.type === BORROW) {
    fields = {...fields, outcomeAccountId: s.DEBT_ACCOUNT_ID, outcomeAmount: fields.incomeAmount}
  }

  fields = pickTransactionFields(fields)

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId

  const transaction: t.Transaction = await n.createTransaction(client, gSpreadsheetId, fields)

  ctx.body = transaction
}

export async function updateTransaction(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Transaction id is required')
    return
  }

  const errors: t.ResErrors = validateTransactionFields(ctx.request.body)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  let fields: t.JSONObject = ctx.request.body

  if (fields.type === LOAN) {
    fields = {...fields, incomeAccountId: s.DEBT_ACCOUNT_ID, incomeAmount: fields.outcomeAmount}
  }

  if (fields.type === BORROW) {
    fields = {...fields, outcomeAccountId: s.DEBT_ACCOUNT_ID, outcomeAmount: fields.incomeAmount}
  }

  fields = pickTransactionFields(fields)

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transaction: t.Transaction = await n.updateTransaction(client, gSpreadsheetId, id, fields)

  ctx.body = transaction
}

export async function deleteTransaction(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Transaction id is required')
    return
  }

  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const client: t.GOAuth2Client = ctx.client
  const transaction: t.Transaction = await n.deleteTransaction(client, gSpreadsheetId, id)
  ctx.body = transaction
}


function validateTransactionFields(fields: Object): t.ResErrors {
  const errors: t.ResErrors = []
  const transactionTypes: Array<t.TransactionType> = [OUTCOME, INCOME, TRANSFER, LOAN, BORROW]
  const {type, date, outcomeAccountId, outcomeAmount, incomeAccountId, incomeAmount, payeeId} = fields

  if (!f.includes(transactionTypes, type)) {
    errors.push({text: `Type must be one of [${transactionTypes.join(', ')}]`})
  }

  if (!date || !f.isValidDate(new Date(date))) {
    errors.push({text: 'Date must be non empty and valid'})
  }

  if (f.includes([OUTCOME, TRANSFER, LOAN], type)) {
    if (!outcomeAccountId) {
      errors.push({text: 'Outcome account required'})
    }

    if (!f.isNumber(outcomeAmount)) {
      errors.push({text: 'Outcome amount must be a valid number'})
    }
  }

  if (f.includes([INCOME, TRANSFER, BORROW], type)) {
    if (!incomeAccountId) {
      errors.push({text: 'Income account required'})
    }

    if (!f.isNumber(incomeAmount)) {
      errors.push({text: 'Income amount must be a valid number'})
    }
  }

  if (f.includes([LOAN, BORROW], type) && !payeeId) {
    errors.push({text: 'Payee required'})
  }

  return errors
}

function defTransactionType(transaction: t.Transaction): t.TransactionType | void {
  const {outcomeAccountId, incomeAccountId} = transaction
  return outcomeAccountId && !incomeAccountId
    ? OUTCOME
    : outcomeAccountId && incomeAccountId === s.DEBT_ACCOUNT_ID
    ? LOAN
    : incomeAccountId && !outcomeAccountId
    ? INCOME
    : incomeAccountId && outcomeAccountId === s.DEBT_ACCOUNT_ID
    ? BORROW
    : outcomeAccountId && incomeAccountId
    ? TRANSFER
    : undefined
}

function pickTransactionFields(fields: Object): Object {
  const {id, type, date, categoryId, payeeId, outcomeAccountId, outcomeAmount, incomeAccountId, incomeAmount, comment, createdAt, updatedAt} = fields
  const whitlistedFields: Object = {id, date, comment, createdAt, updatedAt}

  return type === OUTCOME
    ? {...whitlistedFields, categoryId, payeeId, outcomeAccountId, outcomeAmount}
    : type === INCOME
    ? {...whitlistedFields, categoryId, payeeId, incomeAccountId, incomeAmount}
    : f.includes([LOAN, BORROW], type)
    ? {...whitlistedFields, payeeId, outcomeAccountId, outcomeAmount, incomeAccountId, incomeAmount}
    : type === TRANSFER
    ? {...whitlistedFields, outcomeAccountId, outcomeAmount, incomeAccountId, incomeAmount}
    : {}
}
