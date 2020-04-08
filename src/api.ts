import * as t from './types'

// @ts-ignore
import * as fpx from 'fpx'

import * as e from './env'
import * as u from './utils'
import * as n from './net'
import * as a from './auth'
import * as db from './db'

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
