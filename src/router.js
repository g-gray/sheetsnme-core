// @flow
import Router from 'koa-router'
import * as t from './types'
import * as api from './api'

const router: t.Router = new Router()

/**
 * GET
 */

router
  .get('/auth/login',                     api.authLogin)
  .get('/auth/logout',                    api.authLogout)
  .get('/auth/code',                      api.authCode)

  .get('/api/transactions',               api.authRequired, api.getTransactions)
  .get('/api/transactions/:id',           api.authRequired, api.getTransaction)

/**
 * POST
 */

router
  .post('/api/transactions',              api.authRequired, api.upsertTransaction)
  .post('/api/transactions/:id',          api.authRequired, api.upsertTransaction)

/**
 * DEL
 */

router
  .del('/api/transactions/:id',           api.authRequired, api.deleteTransaction)

export const routes = router.routes()
export const allowedMethods = router.allowedMethods()
