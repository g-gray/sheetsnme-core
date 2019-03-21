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
  ctx.body = {}
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
    email        : gUser.email,
    emailVerified: gUser.verified_email,
    firstName    : gUser.given_name,
    lastName     : gUser.family_name,
  }

  const session: t.Session | void = await db.login(user, token)
  if (!session) {
    ctx.throw(404, 'Session not found')
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
 * Transactions
 */

export async function getTransactions(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const txs: t.Transactions = await n.fetchTransactions(client)
  ctx.body = `Transactions: ${JSON.stringify(txs)}`
}

export async function getTransaction(ctx: t.Context): Promise<void> {
  const client: t.GOAuth2Client = ctx.client

  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Transaction id is required')
    return
  }

  const tx: t.Transaction | void = await n.fetchTransaction(client, id)
  if (!tx) {
    ctx.throw(404, 'Transaction not found')
    return
  }

  ctx.body = `Transaction: ${JSON.stringify(tx)}`
}

export async function upsertTransaction(ctx: t.Context): Promise<void> {
  console.info(`upsertTransaction`)
  const client: t.GOAuth2Client = ctx.client

  const id: string | void = ctx.params.id
  // TODO Replace by insert
  if (!id) {
    // TODO Add validation of transaction
    // Arbitrary data can be passed as transaction, we must validate it
    const newTx: t.Transaction = ctx.request.body
    const tx: t.Transaction | void = await n.createTransaction(client, newTx)
    if (!tx) {
      ctx.throw(404, 'Transaction not found')
    }
    return
  }

  // TODO Add validation of transaction
  // Arbitrary data can be passed as transaction, we must validate it
  const newTx: t.Transaction = ctx.request.body
  const tx: t.Transaction | void = await n.updateTransaction(client, id, newTx)
  if (!tx) {
    ctx.throw(404, 'Transaction not found')
  }
}

export function deleteTransaction(ctx: t.Context): void {
  const id: string = ctx.params.id
  ctx.body = `Delete transaction: ${id}`
}
