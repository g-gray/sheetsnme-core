// @flow
import * as t from './types'
import * as e from './env'
import * as n from './net'
import * as a from './auth'
import * as db from './db'

const {SESSION_COOKIE_NAME} = e.properties

/**
 * Auth
 */

export async function authRequired(ctx: t.Context, next: () => Promise<void>): Promise<void> {
  const sessionId: string | void = a.getCookie(ctx, SESSION_COOKIE_NAME)
  const session: t.Session | void = sessionId
    ? await db.sessionById(sessionId)
    : undefined

  if (typeof session === 'undefined') {
    // const redirectUri: string = ctx.headers.referer
    //   ? encodeURIComponent(ctx.headers.referer)
    //   : '/'
    const redirectUri: string = encodeURIComponent(ctx.url)
    ctx.redirect(`/auth/login?redirectUri=${redirectUri}`)
    return
  }

  ctx.session = session
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

  if (typeof sessionId === 'string') {
    await db.logout(sessionId)
    a.setCookieExpired(ctx, SESSION_COOKIE_NAME)
    ctx.redirect('/')
    return
  }

  ctx.throw(400)
}

export async function authCode (ctx: t.Context): Promise<void>  {
  const {code, state: redirectTo} = ctx.query

  const token: t.AuthToken = await a.exchangeCodeForToken(code)
  const oAuth2Client = a.createOAuth2Client(token)
  const gUser: t.GUser = await n.fetchGUserInfo(oAuth2Client)

  if (!gUser) {
    ctx.throw(400, 'User not found')
  }

  const user: t.User = {
    externalId: gUser.id,
    email: gUser.email,
    emailVerified: gUser.verified_email,
    firstName: gUser.given_name,
    lastName: gUser.family_name,
  }

  const sessionId: string = await db.login(user, token)
  a.setCookie(ctx, SESSION_COOKIE_NAME, sessionId)

  if (redirectTo) {
    ctx.redirect(decodeURIComponent(redirectTo))
    return
  }

  ctx.redirect('/')
}



/**
 * Index
 */

export async function index (ctx: t.Context): Promise<void> {
  const session: t.Session | void = ctx.session
  const token: t.AuthToken | void = session
    ? session.externalToken
    : undefined
  const oAuth2Client = a.createOAuth2Client(token)

  const {list, from, to} = ctx.query
  if (!list || !from || !to) {
    ctx.body = 'list, from, to query params are required'
    return
  }

  ctx.body = await n.fetchValues(oAuth2Client, {
    spreadsheetId: e.properties.SPREADSHEET_ID,
    range: `${list}!${from}:${to}`,
  })
}



/**
 * Transactions
 */

export function getTransactions(ctx: t.Context): void {
  ctx.body = 'Transactions'
}

export function getTransaction(ctx: t.Context): void {
  const id: string = ctx.params.id
  ctx.body = `Transaction: ${id}`
}

export function upsertTransaction(ctx: t.Context): void {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.body = `Insert transaction`
    return
  }
  ctx.body = `Update transaction: ${id || ''}`
}

export function deleteTransaction(ctx: t.Context): void {
  const id: string = ctx.params.id
  ctx.body = `Delete transaction: ${id}`
}
