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

  .get('/api/user',                       api.authRequired, api.getUser)

  .get('/api/accounts',                   api.authRequired, api.getAccounts)

  .get('/api/categories',                 api.authRequired, api.getCategories)

  .get('/api/payees',                     api.authRequired, api.getPayees)

  .get('/api/transactions',               api.authRequired, api.getTransactions)
  .get('/api/transactions/:id',           api.authRequired, api.getTransaction)

/**
 * POST
 */

router
  .post('/api/transactions',              api.authRequired, api.createTransaction)
  .post('/api/transactions/:id',          api.authRequired, api.updateTransaction)

/**
 * DEL
 */

router
  .del('/api/transactions/:id',           api.authRequired, api.deleteTransaction)

export const routes = router.routes()
export const allowedMethods = router.allowedMethods()
