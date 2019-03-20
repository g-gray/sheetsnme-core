// @flow
import Router from 'koa-router'
import * as t from './types'
import * as api from './api'

const router: t.Router = new Router()

/**
 * GET
 */

router
  .redirect('/', '/transactions')
  .get('/auth/login',                 api.authLogin)
  .get('/auth/logout',                api.authLogout)
  .get('/auth/code',                  api.authCode)
  .get('/transactions',               api.authRequired, api.getTransactions)
  .get('/transactions/:id',           api.authRequired, api.getTransaction)

/**
 * POST
 */

router
  .post('/transactions',              api.authRequired, api.upsertTransaction)
  .post('/transactions/:id',          api.authRequired, api.upsertTransaction)

/**
 * DEL
 */

router
  .del('/transactions/:id',           api.authRequired, api.deleteTransaction)

export const routes = router.routes()
export const allowedMethods = router.allowedMethods()
