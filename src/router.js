// @flow

import Router from 'koa-router'
import * as t from './types'
import * as e from './env'
import * as n from './net'
import * as a from './auth'
import * as db from './db'

const {SESSION_COOKIE_NAME, SCHEMA, HOST, PORT} = e.properties

const router: t.Router = new Router()

const authRequired: t.Middleware = async (ctx: t.Context, next: () => Promise<void>) => {
  const sessionId: string = a.getCookie(ctx, SESSION_COOKIE_NAME)
  const session: t.Session = await db.sessionById(sessionId)

  if (!session) {
    // const {header: {host}, url} = ctx.request
    // const redirectUri: string = `http://${host}${url}`
    // ctx.redirect(`/auth/login?redirectUri=${redirectUri}`)
    ctx.throw(401)
  }
  ctx._session = session
  await next()
}

/**
 * GET
 */

router
  .get('/',
    authRequired,
    async (ctx: t.Context): Promise<void> | void => {
      const {list, from, to} = ctx.query
      if (!list || !from || !to) {
        ctx.throw(400)
      }

      const session: t.Session = ((ctx._session: any): t.Session)
      const token: t.AuthToken = session.externalToken
      const oAuth2Client = a.createOAuth2Client(token)

      ctx.body = await n.fetchValues(oAuth2Client, {
        spreadsheetId: e.properties.SPREADSHEET_ID,
        range: `${list}!${from}:${to}`,
      })
    }
  )
  .get('/auth/login', (ctx: t.Context): Promise<void> | void => {
    if (false) {
      ctx.redirect('/')
      return
    }
    const redirectTo = ctx.query.redirectTo || `${SCHEMA}://${HOST}:${PORT}`
    const authUrl: string = a.generateAuthUrl(encodeURIComponent(redirectTo))
    ctx.redirect(authUrl)
  })
  .get('/auth/code', async (ctx: t.Context): Promise<void> | void => {
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
  })
  .get('/transactions', (ctx: t.Context) => {
    ctx.body = 'Transactions'
  })
  .get('/transactions/:id', (ctx: t.Context) => {
    const id: string = ctx.params.id
    ctx.body = `Transaction: ${id}`
  })

/**
 * POST
 */

router
  .post('/transactions/:id', (ctx: t.Context): Promise<void> | void => {
    const id: string | void = ctx.params.id
    if (!id) {
      ctx.body = `Insert transaction`
      return
    }
    ctx.body = `Update transaction: ${id || ''}`
  })
  .del('/transactions/:id', (ctx: t.Context): Promise<void> | void => {
    const id: string = ctx.params.id
    ctx.body = `Delete transaction: ${id}`
  })

export const routes = router.routes()
export const allowedMethods = router.allowedMethods()
