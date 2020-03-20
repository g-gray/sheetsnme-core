import * as t from './types'

import Router from 'koa-router'
import Koa from 'koa'

import * as api from './api'

const authRouter: Router<Koa.DefaultState, Koa.Context> = new Router<Koa.DefaultState, Koa.Context>()

authRouter
  .get('/auth/login',                     api.authLogin)
  .get('/auth/logout',                    api.authLogout)
  .get('/auth/code',                      api.authCode)

export const authRoutes = authRouter.routes()
export const authAllowedMethods = authRouter.allowedMethods()


const apiRouter: Router = new Router()

apiRouter
  .use(api.setLang)
  .use(api.jsonOnly)
  .use(api.authRequired)



apiRouter
  .get('/api/user',                       api.getUser)



apiRouter
  .use(api.spreadsheetIdRequired)

/**
 * GET
 */

apiRouter
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
