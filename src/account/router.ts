import Router from 'koa-router'

import * as c from './controller'

export const accountRouter: Router = new Router({
  prefix: '/accounts'
})

accountRouter
  .get('/',    c.getAccountsWithBalances)
  .get('/:id', c.getAccount)

  .post('/',   c.createAccount)
  .post('/:id',c.updateAccount)

  .del('/:id', c.deleteAccount)

export const accountsRoutes = accountRouter.routes()
export const accountsAllowedMethods = accountRouter.allowedMethods()
