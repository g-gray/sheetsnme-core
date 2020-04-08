import Router from 'koa-router'
import Koa from 'koa'

import {setLang, jsonOnly} from './middleware'

import {authRequired} from './auth/middleware'
import {authRoutes, authAllowedMethods} from './auth/router'

import {userRoutes, userAllowedMethods} from './user/router'

import {spreadsheetIdRequired} from './sheet/middleware'

import {accountsRoutes, accountsAllowedMethods} from './account/router'
import {categoriesRoutes, categoriesAllowedMethods} from './category/router'
import {payeesRoutes, payeesAllowedMethods} from './payee/router'
import {transactionsRoutes, transactionsAllowedMethods} from './transaction/router'

const apiRouter: Router = new Router({
  prefix: '/api'
})

apiRouter
  .use(setLang)
  .use(jsonOnly)
  .use(authRequired)

apiRouter
  .use(userRoutes).use(userAllowedMethods)

apiRouter
  .use(spreadsheetIdRequired)
  .use(accountsRoutes).use(accountsAllowedMethods)
  .use(categoriesRoutes).use(categoriesAllowedMethods)
  .use(payeesRoutes).use(payeesAllowedMethods)
  .use(transactionsRoutes).use(transactionsAllowedMethods)

const apiRoutes = apiRouter.routes()
const apiAllowedMethods = apiRouter.allowedMethods()



const appRouter: Router<Koa.DefaultState, Koa.Context> = new Router<Koa.DefaultState, Koa.Context>()

appRouter
  .use(authRoutes)
  .use(authAllowedMethods)
  .use(apiRoutes)
  .use(apiAllowedMethods)

export const appRoutes = appRouter.routes()
export const appAllowedMethods = appRouter.allowedMethods()
