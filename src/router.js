// @flow
import Router from 'koa-router'
import * as t from './types'
import * as a from './auth'
import * as n from './net'

const router: Router = new Router()

const authRequired: t.Middleware = async (ctx: t.Context, next: () => Promise<void>) => {
  if (!a.isAuthorized()) {
    // const {header: {host}, url} = ctx.request
    // const redirectUri: string = `http://${host}${url}`
    // ctx.redirect(`/auth/login?redirectUri=${redirectUri}`)
    ctx.throw(401, 'Unauthorized')
  }
  await next()
}

/*
 * GET
 */

router
  .get('/',
    authRequired,
    async (ctx: t.Context): Promise<void> | void => {
      console.info('-- /')
      const oAuth2Client = a.authWithToken()
      const sheets = await n.fetchSheets(oAuth2Client)

      const {list, from, to} = ctx.query
      console.info(`-- list:`, list)
      console.info(`-- from:`, from)
      console.info(`-- to:`, to)
      ctx.body = await n.fetchValues(sheets, {
        spreadsheetId: global.env.SPREADSHEET_ID,
        range: `${list}!${from}:${to}`,
      })
    }
  )
  .get('/auth/login', (ctx: t.Context): Promise<void> | void => {
    if (a.isAuthorized()) {
      ctx.redirect('/')
      return
    }
    a.login(ctx)
  })
  .get('/auth/code', async (ctx: t.Context): Promise<void> | void => {
    await a.exchangeCodeForToken(ctx)
    const {redirectTo} = ctx.query
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

/*
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
