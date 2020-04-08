import * as t from '../types'

import * as e from '../env'
import * as u from '../utils'

import * as um from '../user/model'
import * as un from '../user/net'

import * as m from './model'
import * as n from './net'

const {
  LOGOUT_URL,
  SESSION_HEADER_NAME,
  SESSION_COOKIE_NAME,
  CRYPTO_ALGORITHM,
  CRYPTO_PASSWORD,
  CRYPTO_SALT,
  CRYPTO_KEYLENGTH,
} = e.properties

export function authLogin(ctx: t.KContext, next: t.KNext): void {
  // TODO Add a CSRF token generation here and pass within ctx.state to check in
  // exchangeCodeForToken function later
  const redirectTo: string = ctx.query.redirectTo
      ? encodeURIComponent(ctx.query.redirectTo)
      : ''
  const authUrl: string = n.generateAuthUrl(redirectTo)
  ctx.redirect(authUrl)
}

export async function authLogout(ctx: t.KContext): Promise<void> {
  const headerSessionId: string | void = ctx.headers[SESSION_HEADER_NAME]
  const cookieSessionId: string | void = n.getCookie(ctx, SESSION_COOKIE_NAME)
  const sessionId: string | void = headerSessionId || cookieSessionId
  if (!sessionId) {
    ctx.throw(400, 'Session id required')
    return
  }

  const session: t.Session | void = await m.deleteSessionById(sessionId)
  if (!session) {
    ctx.throw(400, 'Session not found')
    return
  }

  await m.deleteExpiredSessions(session.userId)

  n.setCookieExpired(ctx, SESSION_COOKIE_NAME)
  ctx.redirect(LOGOUT_URL || '/')
}

export async function authCode (ctx: t.KContext): Promise<void> {
  // TODO Add checking of a CSRF token here got from ctx.state
  const code: string | void = ctx.query.code
  if (!code) {
      ctx.throw(400, 'Code required')
      return
  }

  let newToken: t.GAuthToken = await n.exchangeCodeForToken(code)
  const client: t.GOAuth2Client = n.createOAuth2Client(newToken)
  const gUser: t.GUserRes | void = await un.fetchUserInfo(client)
  if (!gUser) {
      ctx.throw(400, 'User not found')
      return
  }

  if (!gUser.id) {
      ctx.throw(400, 'User id required')
      return
  }

  const externalId: string = gUser.id

  const user: void | t.User = await um.userByExternalId(externalId)
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

  const upsertedUser: t.User = await um.upsertUser({
      externalId,
      pictureUrl   : gUser.picture        || '',
      email        : gUser.email          || '',
      emailVerified: gUser.verified_email || false,
      firstName    : gUser.given_name     || '',
      lastName     : gUser.family_name    || '',
      externalToken: encryptedNewToken,
  })

  const session: t.Session = await m.upsertSession({userId: upsertedUser.id})

  await m.deleteExpiredSessions(session.userId)

  n.setCookie(ctx, SESSION_COOKIE_NAME, session.id)

  const redirectTo: string | void = ctx.query.state
  if (redirectTo) {
      ctx.redirect(decodeURIComponent(redirectTo))
      return
  }

  ctx.redirect('/')
}
