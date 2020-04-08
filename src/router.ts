import * as t from './types'

import Router from 'koa-router'
import Koa from 'koa'

import * as api from './api'
import {accountsRoutes, accountsAllowedMethods} from './account/router'
import {transactionsRoutes, transactionsAllowedMethods} from './transaction/router'

const authRouter: Router<Koa.DefaultState, Koa.Context> = new Router<Koa.DefaultState, Koa.Context>()

authRouter
  .get('/auth/login',                     api.authLogin)
  .get('/auth/logout',                    api.authLogout)
  .get('/auth/code',                      api.authCode)

export const authRoutes = authRouter.routes()
export const authAllowedMethods = authRouter.allowedMethods()


const apiRouter: Router = new Router({
  prefix: '/api'
})

apiRouter
  .use(api.setLang)
  .use(api.jsonOnly)
  .use(api.authRequired)

apiRouter
  .get('/user',                       api.getUser)



apiRouter
  .use(api.spreadsheetIdRequired)
  .use(accountsRoutes).use(accountsAllowedMethods)
  .use(transactionsRoutes).use(transactionsAllowedMethods)

/**
 * GET
 */

apiRouter
  .get('/categories',                 api.getCategories)
  .get('/categories/:id',             api.getCategory)

  .get('/payees',                     api.getPayees)
  .get('/payees/:id',                 api.getPayee)

/**
 * POST
 */

apiRouter
  .post('/categories',                api.createCategory)
  .post('/categories/:id',            api.updateCategory)

  .post('/payees',                    api.createPayee)
  .post('/payees/:id',                api.updatePayee)

/**
 * DEL
 */

apiRouter
  .del('/categories/:id',             api.deleteCategory)

  .del('/payees/:id',                 api.deletePayee)

export const apiRoutes = apiRouter.routes()
export const apiAllowedMethods = apiRouter.allowedMethods()
