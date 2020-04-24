import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as e from '../env'
import * as u from '../utils'

import * as um from '../user/model'

import * as m from './model'
import * as n from './net'


const {
  SESSION_HEADER_NAME,
  SESSION_COOKIE_NAME,
  CRYPTO_ALGORITHM,
  CRYPTO_PASSWORD,
  CRYPTO_SALT,
  CRYPTO_KEYLENGTH,
} = e.properties

export async function authRequired(ctx: t.KContext, next: t.KNext): Promise<void> {
  const headerSessionId: void | string = ctx.headers[SESSION_HEADER_NAME]
  const cookieSessionId: void | string = n.getCookie(ctx, SESSION_COOKIE_NAME)
  const sessionId: void | string = headerSessionId || cookieSessionId
  if (!sessionId) {
    throw new u.PublicError(401, t.AUTH_ERROR.UNAUTHORIZED)
  }

  const session: void | t.Session = await m.sessionById(sessionId)
  if (!session) {
    throw new u.PublicError(401, t.AUTH_ERROR.UNAUTHORIZED)
  }

  const user: void | t.User = await um.userBySessionId(session.id)
  if (!user) {
    throw new u.PublicError(400, t.AUTH_ERROR.SESSION_ID_REQUIRED)
  }

  const decryptedToken: string = u.decrypt(
    CRYPTO_ALGORITHM,
    CRYPTO_PASSWORD,
    CRYPTO_SALT,
    CRYPTO_KEYLENGTH,
    user.externalToken,
  )
  const token: t.IGAuthToken = JSON.parse(decryptedToken)

  const scopes: string[] = (token.scope || '').split(' ')
  const isScopesDifferent: boolean = !fpx.every(
    n.SCOPES,
    (scope: string) => fpx.includes(scopes, scope)
  )

  if (isScopesDifferent) {
    throw new u.PublicError(401, t.AUTH_ERROR.UNAUTHORIZED)
  }

  const isExpired: boolean = token.expiry_date
    ? token.expiry_date - Date.now() <= 0
    : true

  if (isExpired) {
    const newToken: t.IGAuthToken = await n.refreshToken(token)

    const encryptedNewToken: string = u.encrypt(
      CRYPTO_ALGORITHM,
      CRYPTO_PASSWORD,
      CRYPTO_SALT,
      CRYPTO_KEYLENGTH,
      JSON.stringify(newToken),
    )

    await um.upsertUser({...user, externalToken: encryptedNewToken})
    ctx.client = n.createOAuth2Client(newToken)
  }
  else {
    ctx.client = n.createOAuth2Client(token)
  }

  ctx.sessionId = session.id

  await next()
}

export async function handleAuthError(_: t.KContext, next: t.KNext): Promise<void> {
  try {
    await next()
  }
  catch (error) {
    if (error.message === t.AUTH_ERROR.G_INVALID_GRANT) {
      throw new u.PublicError(401, t.AUTH_ERROR.UNAUTHORIZED)
    }
    throw error
  }
}
