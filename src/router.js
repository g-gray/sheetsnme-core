// @flow
import Router from 'koa-router'
import * as t from './types'
import * as api from './api'

const router: t.Router = new Router()

/**
 * GET
 */

router
  .get('/',                           api.authRequired, api.index)
  .get('/auth/login',                 api.authLogin)
  .get('/auth/logout',                api.authLogout)
  .get('/auth/code',                  api.authCode)
  .get('/transactions',               api.getTransactions)
  .get('/transactions/:id',           api.authRequired, api.getTransaction)

/**
 * POST
 */

router
  .post('/transactions/:id',          api.upsertTransaction)
  .del('/transactions/:id',           api.deleteTransaction)

export const routes = router.routes()
export const allowedMethods = router.allowedMethods()
