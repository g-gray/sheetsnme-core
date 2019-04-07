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
  .use(api.jsonOnly)
  .use(api.authRequired)

/**
 * GET
 */

apiRouter
  .get('/api/user',                       api.getUser)

  .get('/api/accounts',                   api.spreadsheetIdRequired, api.getAccounts)
  .get('/api/accounts/:id',               api.spreadsheetIdRequired, api.getAccount)

  .get('/api/categories',                 api.spreadsheetIdRequired, api.getCategories)
  .get('/api/categories/:id',             api.spreadsheetIdRequired, api.getCategory)

  .get('/api/payees',                     api.spreadsheetIdRequired, api.getPayees)
  .get('/api/payees/:id',                 api.spreadsheetIdRequired, api.getPayee)

  .get('/api/transactions',               api.spreadsheetIdRequired, api.getTransactions)
  .get('/api/transactions/:id',           api.spreadsheetIdRequired, api.getTransaction)

/**
 * POST
 */

apiRouter
  .post('/api/transactions',              api.spreadsheetIdRequired, api.createTransaction)
  .post('/api/transactions/:id',          api.spreadsheetIdRequired, api.updateTransaction)

  .post('/api/accounts',                  api.spreadsheetIdRequired, api.createAccount)
  .post('/api/accounts/:id',              api.spreadsheetIdRequired, api.updateAccount)

  .post('/api/categories',                api.spreadsheetIdRequired, api.createCategory)
  .post('/api/categories/:id',            api.spreadsheetIdRequired, api.updateCategory)

  .post('/api/payees',                    api.spreadsheetIdRequired, api.createPayee)
  .post('/api/payees/:id',                api.spreadsheetIdRequired, api.updatePayee)

/**
 * DEL
 */

apiRouter
  .del('/api/accounts/:id',               api.spreadsheetIdRequired, api.deleteAccount)

  .del('/api/categories/:id',             api.spreadsheetIdRequired, api.deleteCategory)

  .del('/api/payees/:id',                 api.spreadsheetIdRequired, api.deletePayee)

  .del('/api/transactions/:id',           api.spreadsheetIdRequired, api.deleteTransaction)

export const apiRoutes = apiRouter.routes()
export const apiAllowedMethods = apiRouter.allowedMethods()
