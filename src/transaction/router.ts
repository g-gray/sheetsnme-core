import Router from 'koa-router'

import * as c from './controller'

export const transactionRouter: Router = new Router({
  prefix: '/transactions'
})

/**
 * GET
 */

transactionRouter
  .get('/',    c.getTransactions)
  .get('/:id', c.getTransaction)

  .post('/',   c.createTransaction)
  .post('/:id',c.updateTransaction)

  .del('/:id', c.deleteTransaction)

export const transactionsRoutes = transactionRouter.routes()
export const transactionsAllowedMethods = transactionRouter.allowedMethods()
