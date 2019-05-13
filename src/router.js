// @flow
import Router from 'koa-router'
import * as t from './types'
import * as api from './api'

const authRouter: t.Router = new Router()

authRouter
  .get('/auth/login',                     api.authLogin)
  .get('/auth/logout',                    api.authLogout)
  .get('/auth/code',                      api.authCode)

export const authRoutes = authRouter.routes()
export const authAllowedMethods = authRouter.allowedMethods()


const apiRouter: t.Router = new Router()

apiRouter
  .use(api.lang)
  .use(api.jsonOnly)
  .use(api.authRequired)
  .use(api.spreadsheetIdRequired)

/**
 * GET
 */

apiRouter
  .get('/api/user',                       api.getUser)

  .get('/api/accounts',                   api.getAccounts)
  .get('/api/accounts/:id',               api.getAccount)

  .get('/api/categories',                 api.getCategories)
  .get('/api/categories/:id',             api.getCategory)

  .get('/api/payees',                     api.getPayees)
  .get('/api/payees/:id',                 api.getPayee)

  .get('/api/transactions',               api.getTransactions)
  .get('/api/transactions/:id',           api.getTransaction)

/**
 * POST
 */

apiRouter
  .post('/api/transactions',              api.createTransaction)
  .post('/api/transactions/:id',          api.updateTransaction)

  .post('/api/accounts',                  api.createAccount)
  .post('/api/accounts/:id',              api.updateAccount)

  .post('/api/categories',                api.createCategory)
  .post('/api/categories/:id',            api.updateCategory)

  .post('/api/payees',                    api.createPayee)
  .post('/api/payees/:id',                api.updatePayee)

/**
 * DEL
 */

apiRouter
  .del('/api/accounts/:id',               api.deleteAccount)

  .del('/api/categories/:id',             api.deleteCategory)

  .del('/api/payees/:id',                 api.deletePayee)

  .del('/api/transactions/:id',           api.deleteTransaction)

export const apiRoutes = apiRouter.routes()
export const apiAllowedMethods = apiRouter.allowedMethods()
