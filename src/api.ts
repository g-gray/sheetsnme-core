import * as t from './types'

// @ts-ignore
import * as fpx from 'fpx'
import uuid from 'uuid/v4'

import * as e from './env'
import * as u from './utils'
import * as n from './net'
import * as a from './auth'
import * as s from './sheets'
import * as db from './db'
import * as tr from './translations'

const {
  LOGOUT_URL,
  SESSION_HEADER_NAME,
  SESSION_COOKIE_NAME,
  LANG_HEADER_NAME,
  CRYPTO_ALGORITHM,
  CRYPTO_PASSWORD,
  CRYPTO_SALT,
  CRYPTO_KEYLENGTH,
} = e.properties

/**
 * Middlewares
 */

export async function authRequired(ctx: t.KContext, next: t.KNext): Promise<void> {
  const headerSessionId: string | void = ctx.headers[SESSION_HEADER_NAME]
  const cookieSessionId: string | void = a.getCookie(ctx, SESSION_COOKIE_NAME)
  const sessionId: string | void = headerSessionId || cookieSessionId
  if (!sessionId) {
    ctx.throw(401, 'Unauthorized')
    return
  }

  const session: t.Session | void = await db.sessionById(sessionId)
  if (!session) {
    ctx.throw(401, 'Unauthorized')
    return
  }

  const user: t.User | void = await db.userBySessionId(session.id)
  if (!user) {
    ctx.throw(400, 'User not found')
    return
  }

  const decryptedToken: string = u.decrypt(
    CRYPTO_ALGORITHM,
    CRYPTO_PASSWORD,
    CRYPTO_SALT,
    CRYPTO_KEYLENGTH,
    user.externalToken,
  )
  const token: t.GAuthToken = JSON.parse(decryptedToken)

  const scopes: string[] = (token.scope || '').split(' ')
  const isScopesDifferent: boolean = !fpx.every(
    a.SCOPES,
    (scope: string) => fpx.includes(scopes, scope)
  )

  if (isScopesDifferent) {
    ctx.throw(401, 'Unauthorized')
    return
  }

  const isExpired: boolean = token.expiry_date
    ? token.expiry_date - Date.now() <= 0
    : true

  if (isExpired) {
    let newToken: t.GAuthToken
    try {
      newToken = await a.refreshToken(token)
    } catch (err) {
      if (err.message === t.ERROR.INVALID_GRANT) {
        ctx.throw(401, 'Unauthorized')
        return
      }

      throw err
    }
    const encryptedNewToken: string = u.encrypt(
      CRYPTO_ALGORITHM,
      CRYPTO_PASSWORD,
      CRYPTO_SALT,
      CRYPTO_KEYLENGTH,
      JSON.stringify(newToken),
    )

    await db.upsertUser({...user, externalToken: encryptedNewToken})
    ctx.client = a.createOAuth2Client(newToken)
  }
  else {
    ctx.client = a.createOAuth2Client(token)
  }

  ctx.sessionId = session.id

  await next()
}

export async function spreadsheetIdRequired(ctx: t.KContext, next: t.KNext): Promise<void> {
  const sessionId: string = ctx.sessionId
  // const spreadsheetId: string | void = ctx.query.spreadsheetId
  // if (!spreadsheetId) {
  //   ctx.throw(400, 'Spreadsheet id required')
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

export async function jsonOnly(ctx: t.KContext, next: t.KNext): Promise<void> {
  if (!ctx.accepts('application/json')) {
    ctx.throw(406, 'Not acceptable')
    return
  }

  await next()
}

export async function setLang(ctx: t.KContext, next: t.KNext): Promise<void> {
  const lang: string | void = ctx.headers[LANG_HEADER_NAME]

  ctx.lang = u.AVAILABLE_LANGS[0]
  if (fpx.includes(u.AVAILABLE_LANGS), lang) {
    ctx.lang = lang
  }

  await next()
}



/**
 * Auth
 */

export function authLogin(ctx: t.KContext, next: t.KNext): void {
  // TODO Add a CSRF token generation here and pass within ctx.state to check in
  // exchangeCodeForToken function later
  const redirectTo: string = ctx.query.redirectTo
    ? encodeURIComponent(ctx.query.redirectTo)
    : ''
  const authUrl: string = a.generateAuthUrl(redirectTo)
  ctx.redirect(authUrl)
}

export async function authLogout(ctx: t.KContext): Promise<void> {
  const headerSessionId: string | void = ctx.headers[SESSION_HEADER_NAME]
  const cookieSessionId: string | void = a.getCookie(ctx, SESSION_COOKIE_NAME)
  const sessionId: string | void = headerSessionId || cookieSessionId
  if (!sessionId) {
    ctx.throw(400, 'Session id required')
    return
  }

  const session: t.Session | void = await db.deleteSessionById(sessionId)
  if (!session) {
    ctx.throw(400, 'Session not found')
    return
  }

  await db.deleteExpiredSessions(session.userId)

  a.setCookieExpired(ctx, SESSION_COOKIE_NAME)
  ctx.redirect(LOGOUT_URL || '/')
}

export async function authCode (ctx: t.KContext): Promise<void> {
  // TODO Add checking of a CSRF token here got from ctx.state
  const code: string | void = ctx.query.code
  if (!code) {
    ctx.throw(400, 'Code required')
    return
  }

  let newToken: t.GAuthToken = await a.exchangeCodeForToken(code)
  const client: t.GOAuth2Client = a.createOAuth2Client(newToken)
  const gUser: t.GUserRes | void = await n.fetchUserInfo(client)
  if (!gUser) {
    ctx.throw(400, 'User not found')
    return
  }

  if (!gUser.id) {
    ctx.throw(400, 'User id required')
    return
  }

  const externalId: string = gUser.id

  const user: void | t.User = await db.userByExternalId(externalId)
  if (user) {
    const decryptedToken: string = u.decrypt(
      CRYPTO_ALGORITHM,
      CRYPTO_PASSWORD,
      CRYPTO_SALT,
      CRYPTO_KEYLENGTH,
      user.externalToken,
    )
    const token: t.GAuthToken = JSON.parse(decryptedToken)
    newToken = {...token, ...newToken}
  }

  const encryptedNewToken: string = u.encrypt(
    CRYPTO_ALGORITHM,
    CRYPTO_PASSWORD,
    CRYPTO_SALT,
    CRYPTO_KEYLENGTH,
    JSON.stringify(newToken)
  )

  const upsertedUser: t.User = await db.upsertUser({
    externalId,
    pictureUrl   : gUser.picture        || '',
    email        : gUser.email          || '',
    emailVerified: gUser.verified_email || false,
    firstName    : gUser.given_name     || '',
    lastName     : gUser.family_name    || '',
    externalToken: encryptedNewToken,
  })

  const session: t.Session = await db.upsertSession({userId: upsertedUser.id})

  await db.deleteExpiredSessions(session.userId)

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

export async function getUser(ctx: t.KContext) {
  const sessionId: string = ctx.sessionId
  const user: t.User | void = await db.userBySessionId(sessionId)
  if (!user) {
    ctx.throw(404, 'User not found')
    return
  }

  const spreadsheets: t.Spreadsheets = await db.spreadsheetsBySessionId(sessionId)
  let spreadsheet: t.Spreadsheet | void = spreadsheets[0]
  let gSpreadsheet: t.GSpreadsheetRes | void

  const client: t.GOAuth2Client = ctx.client

  if (spreadsheet) {
    try {
      gSpreadsheet = await n.fetchSpreadsheet(
        client,
        {spreadsheetId: spreadsheet.externalId}
      )
    }
    catch (error) {
      if (error.code === 401) {
        ctx.throw(401, 'Unauthorized')
        return
      }
      throw error
    }
  }

  if (!gSpreadsheet) {
    gSpreadsheet = await n.createAppSpreadsheet(client, ctx.lang)

    if (!gSpreadsheet.spreadsheetId) {
      ctx.throw(400, 'Spreadsheet id required')
      return
    }

    spreadsheet = await db.createSpreadsheet(
      sessionId,
      gSpreadsheet.spreadsheetId
    )
  }

  ctx.body = {...user, spreadsheets: [{id: spreadsheet.id}]}
}



/**
 * Accounts
 */

export async function getAccounts(ctx: t.KContext): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const accounts: t.Accounts = await n.fetchAccounts(client, gSpreadsheetId)

  const accountIds = fpx.map(accounts, (account: t.Account) => account.id)
  const balances: t.BalancesById = await n.fetchBalancesByAccountIds(client, gSpreadsheetId, accountIds)

  ctx.body = fpx.map(accounts, (account: t.Account) => ({
    ...accountToFields(account),
    balance: balances[account.id] ? balances[account.id].balance : 0,
  }))
}

export async function getAccount(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Account id required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const account: t.Account | void = await n.fetchAccount(client, gSpreadsheetId, id)
  if (!account) {
    ctx.throw(404, 'Account not found')
    return
  }

  const balances: t.BalancesById = await n.fetchBalancesByAccountIds(client, gSpreadsheetId, [account.id])

  ctx.body = {
    ...accountToFields(account),
    balance: balances[account.id] ? balances[account.id].balance : 0,
  }
}

export async function createAccount(ctx: t.KContext): Promise<void> {
  const errors: t.ResErrors = validateAccountFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const account: t.Account = await n.createAccount(
    client,
    gSpreadsheetId,
    fieldsToAccount(ctx.request.body)
  )

  ctx.body = accountToFields(account)
}

export async function updateAccount(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Account id required')
    return
  }

  if (id === s.DEBT_ACCOUNT_ID) {
    ctx.throw(400, 'You can not change this account')
  }

  const errors: t.ResErrors = validateAccountFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const account: t.Account = await n.updateAccount(
    client,
    gSpreadsheetId,
    id,
    fieldsToAccount(ctx.request.body)
  )

  ctx.body = accountToFields(account)
}

export async function deleteAccount(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Account id required')
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
  ctx.body = accountToFields(account)
}


function validateAccountFields(fields: any, lang: t.Lang): t.ResErrors {
  const errors: t.ResErrors = []
  const {title} = fields

  if (!fpx.isString(title) || !title.length) {
    errors.push({text: u.xln(lang, tr.TITLE_MUST_BE_NON_EMPTY_STRING)})
  }

  return errors
}

function accountToFields(account: t.Account): t.AccountFields {
  const {
    id,
    title,
    currencyCode,
    createdAt,
    updatedAt,
  } = account

  return {
    id,
    title,
    currencyCode,
    createdAt,
    updatedAt,
  }
}

function fieldsToAccount(fields: t.AccountFields): t.Account {
  const {
    id,
    title,
    currencyCode,
    createdAt,
    updatedAt,
  }: t.AccountFields = fields

  return {
    id          : id || uuid(),
    title       : title || '',
    currencyCode: currencyCode || '',
    createdAt,
    updatedAt,
  }
}



/**
 * Categories
 */

export async function getCategories(ctx: t.KContext): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const categories: t.Categories = await n.fetchCategories(client, gSpreadsheetId)
  ctx.body = fpx.map(categories, categoryToFields)
}

export async function getCategory(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Category id required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const category: t.Category | void = await n.fetchCategory(client, gSpreadsheetId, id)
  if (!category) {
    ctx.throw(404, 'Category not found')
    return
  }

  ctx.body = categoryToFields(category)
}

export async function createCategory(ctx: t.KContext): Promise<void> {
  const errors: t.ResErrors = validateCategoryFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const category: t.Category = await n.createCategory(
    client,
    gSpreadsheetId,
    fieldsToCategory(ctx.request.body)
  )

  ctx.body = categoryToFields(category)
}

export async function updateCategory(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Category id required')
    return
  }

  const errors: t.ResErrors = validateCategoryFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const category: t.Category = await n.updateCategory(
    client,
    gSpreadsheetId,
    id,
    fieldsToCategory(ctx.request.body)
  )

  ctx.body = categoryToFields(category)
}

export async function deleteCategory(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Category id required')
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
  ctx.body = categoryToFields(category)
}


function validateCategoryFields(fields: any, lang: t.Lang): t.ResErrors {
  const errors: t.ResErrors = []
  const {title} = fields

  if (!fpx.isString(title) || !title.length) {
    errors.push({text: u.xln(lang, tr.TITLE_MUST_BE_NON_EMPTY_STRING)})
  }

  return errors
}

function categoryToFields(category: t.Category): t.CategoryFields {
  const {
    id,
    title,
    createdAt,
    updatedAt,
  } = category

  return {
    id,
    title,
    createdAt,
    updatedAt,
  }
}

function fieldsToCategory(fields: t.CategoryFields): t.Category {
  const {
    id,
    title,
  }: t.CategoryFields = fields

  return {
    id   : id || uuid(),
    title: title || '',
  }
}



/**
 * Payees
 */

export async function getPayees(ctx: t.KContext): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payees: t.Payees = await n.fetchPayees(client, gSpreadsheetId)

  const payeeIds = fpx.map(payees, (payee: t.Payee) => payee.id)
  const debts: t.DebtsById = await n.fetchDebtsByPayeeIds(client, gSpreadsheetId, payeeIds)

  ctx.body = fpx.map(payees, (payee: t.Payee) => ({
    ...payeeToFields(payee),
    debt: debts[payee.id] ? debts[payee.id].debt : 0,
  }))
}

export async function getPayee(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Payee id required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payee: t.Payee | void = await n.fetchPayee(client, gSpreadsheetId, id)
  if (!payee) {
    ctx.throw(404, 'Payee not found')
    return
  }

  const debts: t.DebtsById = await n.fetchDebtsByPayeeIds(client, gSpreadsheetId, [payee.id])

  ctx.body = {
    ...payeeToFields(payee),
    debt: debts[payee.id] ? debts[payee.id].debt : 0,
  }
}

export async function createPayee(ctx: t.KContext): Promise<void> {
  const errors: t.ResErrors = validatePayeeFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payee: t.Payee = await n.createPayee(
    client,
    gSpreadsheetId,
    fieldsToPayee(ctx.request.body)
  )

  ctx.body = payeeToFields(payee)
}

export async function updatePayee(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Payee id required')
    return
  }

  const errors: t.ResErrors = validatePayeeFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payee: t.Payee = await n.updatePayee(
    client,
    gSpreadsheetId,
    id,
    fieldsToPayee(ctx.request.body)
  )

  ctx.body = payeeToFields(payee)
}

export async function deletePayee(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Payee id required')
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


function validatePayeeFields(fields: any, lang: t.Lang): t.ResErrors {
  const errors: t.ResErrors = []
  const {title} = fields

  if (!fpx.isString(title) || !title.length) {
    errors.push({text: u.xln(lang, tr.TITLE_MUST_BE_NON_EMPTY_STRING)})
  }

  return errors
}

function payeeToFields(payee: t.Payee): t.PayeeFields {
  const {
    id,
    title,
    createdAt,
    updatedAt,
  } = payee

  return {
    id,
    title,
    createdAt,
    updatedAt,
  }
}

function fieldsToPayee(fields: t.PayeeFields): t.Payee {
  const {
    id,
    title,
  }: t.PayeeFields = fields

  return {
    id   : id || uuid(),
    title: title || '',
  }
}



/**
 * Transactions
 */

export async function getTransactions(ctx: t.KContext): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  // TODO Add validation of filter values
  const filter: t.TransactionsFilter = ctx.query
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transactionsNumber: number = await n.fetchTransactionsNumber(client, gSpreadsheetId, filter)
  const transactionsAmounts: t.TransactionsAmounts = await n.fetchTransactionsAmounts(client, gSpreadsheetId, filter)
  const transactions: t.Transactions = await n.fetchTransactions(client, gSpreadsheetId, filter)

  const limit: number = parseInt(filter.limit || '', 10)
  if (filter.limit && (!fpx.isInteger(limit) || limit < 0)) {
    ctx.throw(400, 'Limit must be a positive integer')
    return
  }

  const offset: number = parseInt(filter.offset || '', 10)
  if (filter.offset && (!fpx.isInteger(offset) || offset < 0)) {
    ctx.throw(400, 'Offset must be a positive integer')
    return
  }

  ctx.body = {
    limit: limit || u.DEFAULT_LIMIT,
    offset: offset || 0,
    total: transactionsNumber,
    items: fpx.map(transactions, transactionToFields),
    outcomeAmount: transactionsAmounts.outcomeAmount,
    incomeAmount: transactionsAmounts.incomeAmount,
  }
}

export async function getTransaction(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Transaction id required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transaction: t.Transaction | void = await n.fetchTransaction(client, gSpreadsheetId, id)
  if (!transaction) {
    ctx.throw(404, 'Transaction not found')
    return
  }

  ctx.body = transactionToFields(transaction)
}

export async function createTransaction(ctx: t.KContext): Promise<void> {
  const errors: t.ResErrors = validateTransactionFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId

  const transaction: t.Transaction = await n.createTransaction(
    client,
    gSpreadsheetId,
    fieldsToTransaction(ctx.request.body)
  )

  ctx.body = transactionToFields(transaction)
}

export async function updateTransaction(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Transaction id required')
    return
  }

  const errors: t.ResErrors = validateTransactionFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transaction: t.Transaction = await n.updateTransaction(
    client,
    gSpreadsheetId,
    id,
    fieldsToTransaction(ctx.request.body)
  )

  ctx.body = transactionToFields(transaction)
}

export async function deleteTransaction(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Transaction id required')
    return
  }

  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const client: t.GOAuth2Client = ctx.client
  const transaction: t.Transaction = await n.deleteTransaction(client, gSpreadsheetId, id)
  ctx.body = transaction
}


function validateTransactionFields(fields: any, lang: t.Lang): t.ResErrors {
  const errors: t.ResErrors = []
  const transactionTypes: t.TRANSACTION_TYPE[] = fpx.values(t.TRANSACTION_TYPE)
  const {
    type,
    date,
    outcomeAccountId,
    outcomeAmount,
    incomeAccountId,
    incomeAmount,
    payeeId,
  } = fields

  if (!fpx.includes(transactionTypes, type)) {
    errors.push({text: `${u.xln(lang, tr.TYPE_MUST_BE_ONE_OF)}: [${transactionTypes.join(', ')}]`})
  }

  if (!date || !fpx.isValidDate(new Date(date))) {
    errors.push({text: u.xln(lang, tr.DATE_MUST_BE_NON_EMPTY_AND_VALID)})
  }

  if (fpx.includes([
    t.TRANSACTION_TYPE.OUTCOME,
    t.TRANSACTION_TYPE.TRANSFER,
    t.TRANSACTION_TYPE.LOAN,
  ], type)) {
    if (!outcomeAccountId) {
      errors.push({text: u.xln(lang, tr.OUTCOME_ACCOUNT_REQUIRED)})
    }

    if (!fpx.isNumber(outcomeAmount)) {
      errors.push({text: u.xln(lang, tr.OUTCOME_AMOUNT_MUST_BE_A_VALID_NUMBER)})
    }
  }

  if (fpx.includes([
    t.TRANSACTION_TYPE.INCOME,
    t.TRANSACTION_TYPE.TRANSFER,
    t.TRANSACTION_TYPE.BORROW,
  ], type)) {
    if (!incomeAccountId) {
      errors.push({text: u.xln(lang, tr.INCOME_ACCOUNT_REQUIRED)})
    }

    if (!fpx.isNumber(incomeAmount)) {
      errors.push({text: u.xln(lang, tr.INCOME_AMOUNT_MUST_BE_A_VALID_NUMBER)})
    }
  }

  if (fpx.includes([
    t.TRANSACTION_TYPE.LOAN,
    t.TRANSACTION_TYPE.BORROW,
  ], type) && !payeeId) {
    errors.push({text: u.xln(lang, tr.PAYEE_REQUIRED)})
  }

  return errors
}

function defTransactionType(transaction: t.Transaction): t.TRANSACTION_TYPE {
  const {outcomeAccountId, incomeAccountId} = transaction
  return outcomeAccountId && !incomeAccountId
    ? t.TRANSACTION_TYPE.OUTCOME
    : outcomeAccountId && incomeAccountId === s.DEBT_ACCOUNT_ID
    ? t.TRANSACTION_TYPE.LOAN
    : incomeAccountId && !outcomeAccountId
    ? t.TRANSACTION_TYPE.INCOME
    : incomeAccountId && outcomeAccountId === s.DEBT_ACCOUNT_ID
    ? t.TRANSACTION_TYPE.BORROW
    : outcomeAccountId && incomeAccountId
    ? t.TRANSACTION_TYPE.TRANSFER
    : t.TRANSACTION_TYPE.OUTCOME
}

function transactionToFields(transaction: t.Transaction): t.TransactionFields {
  const {
    id,
    date,
    categoryId,
    payeeId,
    comment,
    outcomeAccountId,
    outcomeAmount,
    incomeAccountId,
    incomeAmount,
    createdAt,
    updatedAt,
  } = transaction

  return {
    id,
    type: defTransactionType(transaction),
    date,
    categoryId,
    payeeId,
    comment,
    outcomeAccountId,
    outcomeAmount,
    incomeAccountId,
    incomeAmount,
    createdAt,
    updatedAt,
  }
}

function fieldsToTransaction(fields: t.TransactionFields): t.Transaction {
  const {
    id,
    type,
    date,
    categoryId,
    payeeId,
    outcomeAccountId,
    outcomeAmount,
    incomeAccountId,
    incomeAmount,
    comment,
    createdAt,
    updatedAt,
  }: t.TransactionFields = fields

  // TODO Think how to split t.Transaction on t.IncomeTransaction, t.OutcomeTransaction, etc.
  if (type === t.TRANSACTION_TYPE.INCOME) {
    return {
      id              : id || uuid(),
      date            : date || '',

      categoryId      : categoryId || '',
      payeeId         : payeeId || '',

      outcomeAccountId : '',
      outcomeAmount    : 0,
      incomeAccountId : incomeAccountId || '',
      incomeAmount    : incomeAmount || 0,

      comment         : comment || '',
      createdAt       : createdAt || '',
      updatedAt       : updatedAt || '',
    }
  }

  if (type === t.TRANSACTION_TYPE.LOAN) {
    return {
      id              : id || uuid(),
      date            : date || '',

      categoryId      : '',
      payeeId         : payeeId || '',

      outcomeAccountId: outcomeAccountId || '',
      outcomeAmount   : outcomeAmount || 0,
      incomeAccountId : s.DEBT_ACCOUNT_ID,
      incomeAmount    : outcomeAmount || 0,

      comment         : comment || '',
      createdAt       : createdAt || '',
      updatedAt       : updatedAt || '',
    }
  }

  if (type === t.TRANSACTION_TYPE.BORROW) {
    return {
      id              : id || uuid(),
      date            : date || '',

      categoryId      : '',
      payeeId         : payeeId || '',

      outcomeAccountId: s.DEBT_ACCOUNT_ID,
      outcomeAmount   : incomeAmount || 0,
      incomeAccountId : '',
      incomeAmount    : incomeAmount || 0,

      comment         : comment || '',
      createdAt       : createdAt || '',
      updatedAt       : updatedAt || '',
    }
  }

  if (type === t.TRANSACTION_TYPE.TRANSFER) {
    return {
      id              : id || uuid(),
      date            : date || '',

      categoryId      : '',
      payeeId         : '',

      outcomeAccountId: outcomeAccountId || '',
      outcomeAmount   : incomeAmount || 0,
      incomeAccountId : incomeAccountId || '',
      incomeAmount    : incomeAmount || 0,

      comment         : comment || '',
      createdAt       : createdAt || '',
      updatedAt       : updatedAt || '',
    }
  }

  return {
    id              : id || uuid(),
    date            : date || '',

    categoryId      : categoryId || '',
    payeeId         : payeeId || '',

    outcomeAccountId: outcomeAccountId || '',
    outcomeAmount   : outcomeAmount || 0,
    incomeAccountId : '',
    incomeAmount    : 0,

    comment         : comment || '',
    createdAt       : createdAt || '',
    updatedAt       : updatedAt || '',
  }
}
