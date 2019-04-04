// @flow
import * as t from './types'
import * as e from './env'
import * as n from './net'
import * as a from './auth'
import * as db from './db'

const {SESSION_HEADER_NAME, SESSION_COOKIE_NAME} = e.properties

/**
 * Auth
 */

export async function authRequired(ctx: t.Context, next: () => Promise<void>): Promise<void> {
  const headerSessionId: string | void = ctx.headers[SESSION_HEADER_NAME]
  const cookieSessionId: string | void = a.getCookie(ctx, SESSION_COOKIE_NAME)
  const sessionId: string | void = headerSessionId || cookieSessionId
  const session: t.Session | void = sessionId
    ? await db.sessionById(sessionId)
    : undefined

  if (!session) {
    // const redirectUri: string = ctx.headers.referer
    //   ? encodeURIComponent(ctx.headers.referer)
    //   : '/'
    // const redirectUri: string = encodeURIComponent(ctx.url)
    // ctx.redirect(`/auth/login?redirectUri=${redirectUri}`)
    ctx.throw(401, 'Unauthorized')
    return
  }

  const token: t.GAuthToken | void = session
    ? session.externalToken
    : undefined
  if (!token) {
    ctx.throw(400, 'Token is required')
  }

  ctx.client = a.createOAuth2Client(token)
  ctx.sessionId = session.id

  await next()
}

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
  const gUser: t.GUser | void = await n.fetchGUserInfo(oAuth2Client)
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

  const session: t.Session | void = await db.login(user, token)
  if (!session) {
    ctx.throw(400, 'Session not found')
    return
  }

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

  ctx.body = user
}



/**
 * Accounts
 */

export async function getAccounts(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const accounts: t.Accounts = await n.fetchAccounts(client)
  ctx.body = accounts
}

export async function getAccount(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Account id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const account: t.Account | void = await n.fetchAccount(client, id)
  if (!account) {
    ctx.throw(404, 'Account not found')
    return
  }

  ctx.body = account
}

export async function createAccount(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const account: t.Account | void = await n.createAccount(client, ctx.request.body)
  if (!account) {
    ctx.throw(404, 'Account not found')
    return
  }

  ctx.body = account
}

export async function updateAccount(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Account id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const account: t.Account | void = await n.updateAccount(client, id, ctx.request.body)
  if (!account) {
    ctx.throw(404, 'Account not found')
    return
  }

  ctx.body = account
}

export async function deleteAccount(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Account id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client

  const transactions: t.Transactions = await n.fetchTransactions(client, {accountId: id})
  if (transactions.length) {
    ctx.throw(400, 'Can not delete. There are related transactions')
    return
  }

  const account: t.Account | void = await n.deleteAccount(client, id)
  if (!account) {
    ctx.throw(404, 'Account not found')
    return
  }

  ctx.body = account
}



/**
 * Categories
 */

export async function getCategories(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const categories: t.Categories = await n.fetchCategories(client)
  ctx.body = categories
}

export async function getCategory(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Category id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const category: t.Category | void = await n.fetchCategory(client, id)
  if (!category) {
    ctx.throw(404, 'Category not found')
    return
  }

  ctx.body = category
}

export async function createCategory(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const category: t.Category | void = await n.createCategory(client, ctx.request.body)
  if (!category) {
    ctx.throw(404, 'Category not found')
    return
  }

  ctx.body = category
}

export async function updateCategory(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Category id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const category: t.Category | void = await n.updateCategory(client, id, ctx.request.body)
  if (!category) {
    ctx.throw(404, 'Category not found')
    return
  }

  ctx.body = category
}

export async function deleteCategory(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Category id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client

  const transactions: t.Transactions = await n.fetchTransactions(client, {categoryId: id})
  if (transactions.length) {
    ctx.throw(400, 'Can not delete. There are related transactions')
    return
  }

  const category: t.Category | void = await n.deleteCategory(client, id)
  if (!category) {
    ctx.throw(404, 'Category not found')
    return
  }

  ctx.body = category
}



/**
 * Payees
 */

export async function getPayees(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const payees: t.Payees = await n.fetchPayees(client)
  ctx.body = payees
}

export async function getPayee(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Payee id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const payee: t.Payee | void = await n.fetchPayee(client, id)
  if (!payee) {
    ctx.throw(404, 'Payee not found')
    return
  }

  ctx.body = payee
}

export async function createPayee(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const payee: t.Payee | void = await n.createPayee(client, ctx.request.body)
  if (!payee) {
    ctx.throw(404, 'Payee not found')
    return
  }

  ctx.body = payee
}

export async function updatePayee(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Payee id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const payee: t.Payee | void = await n.updatePayee(client, id, ctx.request.body)
  if (!payee) {
    ctx.throw(404, 'Payee not found')
    return
  }

  ctx.body = payee
}

export async function deletePayee(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Payee id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client

  const transactions: t.Transactions = await n.fetchTransactions(client, {payeeId: id})
  if (transactions.length) {
    ctx.throw(400, 'Can not delete. There are related transactions')
    return
  }

  const payee: t.Payee | void = await n.deletePayee(client, id)
  if (!payee) {
    ctx.throw(404, 'Payee not found')
    return
  }

  ctx.body = payee
}



/**
 * Transactions
 */

export async function getTransactions(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const filter: t.TransactionsFilter = ctx.query
  const transactions: t.Transactions = await n.fetchTransactions(client, filter)
  ctx.body = transactions
}

export async function getTransaction(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Transaction id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const transaction: t.Transaction | void = await n.fetchTransaction(client, id)
  if (!transaction) {
    ctx.throw(404, 'Transaction not found')
    return
  }

  ctx.body = transaction
}

export async function createTransaction(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const transaction: t.Transaction | void = await n.createTransaction(client, ctx.request.body)
  if (!transaction) {
    ctx.throw(404, 'Transaction not found')
    return
  }

  ctx.body = transaction
}

export async function updateTransaction(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Transaction id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const transaction: t.Transaction | void = await n.updateTransaction(client, id, ctx.request.body)
  if (!transaction) {
    ctx.throw(404, 'Transaction not found')
    return
  }

  ctx.body = transaction
}

export async function deleteTransaction(ctx: t.Context): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Transaction id is required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const transaction: t.Transaction | void = await n.deleteTransaction(client, id)
  if (!transaction) {
    ctx.throw(404, 'Transaction not found')
    return
  }

  ctx.body = transaction
}



/**
 *
 */
export async function jsonOnly(ctx: t.Context, next: () => Promise<void>): Promise<void> {
  if (!ctx.accepts('application/json')) {
    ctx.throw(406, 'Not acceptable')
    return
  }

  await next()
}

