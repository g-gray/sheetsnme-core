import Router from 'koa-router'

import * as c from './controller'

export const payeeRouter: Router = new Router({
  prefix: '/payees'
})

payeeRouter
  .get('/debts', c.getPayeesDebts)

  .get('/',     c.getPayeesWithDebts)
  .get('/:id',  c.getPayee)

  .post('/',    c.createPayee)
  .post('/:id', c.updatePayee)

  .del('/:id',  c.deletePayee)

export const payeesRoutes = payeeRouter.routes()
export const payeesAllowedMethods = payeeRouter.allowedMethods()
