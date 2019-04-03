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

  .get('/api/user',                       api.jsonOnly, api.authRequired, api.getUser)

  .get('/api/accounts',                   api.jsonOnly, api.authRequired, api.getAccounts)
  .get('/api/accounts/:id',               api.jsonOnly, api.authRequired, api.getAccount)

  .get('/api/categories',                 api.jsonOnly, api.authRequired, api.getCategories)
  .get('/api/categories/:id',             api.jsonOnly, api.authRequired, api.getCategory)

  .get('/api/payees',                     api.jsonOnly, api.authRequired, api.getPayees)

  .get('/api/transactions',               api.jsonOnly, api.authRequired, api.getTransactions)
  .get('/api/transactions/:id',           api.jsonOnly, api.authRequired, api.getTransaction)

/**
 * POST
 */

router
  .post('/api/transactions',              api.jsonOnly, api.authRequired, api.createTransaction)
  .post('/api/transactions/:id',          api.jsonOnly, api.authRequired, api.updateTransaction)

  .post('/api/accounts',                  api.jsonOnly, api.authRequired, api.createAccount)
  .post('/api/accounts/:id',              api.jsonOnly, api.authRequired, api.updateAccount)

  .post('/api/categories',                api.jsonOnly, api.authRequired, api.createCategory)
  .post('/api/categories/:id',            api.jsonOnly, api.authRequired, api.updateCategory)

/**
 * DEL
 */

router
  .del('/api/transactions/:id',           api.jsonOnly, api.authRequired, api.deleteTransaction)

  .del('/api/accounts/:id',               api.jsonOnly, api.authRequired, api.deleteAccount)

  .del('/api/categories/:id',             api.jsonOnly, api.authRequired, api.deleteCategory)

export const routes = router.routes()
export const allowedMethods = router.allowedMethods()
