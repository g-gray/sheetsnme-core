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
  const headerSessionId: string | void = ctx.headers[SESSION_HEADER_NAME]
  const cookieSessionId: string | void = n.getCookie(ctx, SESSION_COOKIE_NAME)
  const sessionId: string | void = headerSessionId || cookieSessionId
  if (!sessionId) {
    ctx.throw(401, 'Unauthorized')
    return
  }

  const session: t.Session | void = await m.sessionById(sessionId)
  if (!session) {
    ctx.throw(401, 'Unauthorized')
    return
  }

  const user: t.User | void = await um.userBySessionId(session.id)
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
    n.SCOPES,
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
      newToken = await n.refreshToken(token)
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

    await um.upsertUser({...user, externalToken: encryptedNewToken})
    ctx.client = n.createOAuth2Client(newToken)
  }
  else {
    ctx.client = n.createOAuth2Client(token)
  }

  ctx.sessionId = session.id

  await next()
}
