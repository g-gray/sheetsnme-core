import Router from 'koa-router'

import * as c from './controller'

export const categoryRouter: Router = new Router({
  prefix: '/categories'
})

categoryRouter
  .get('/spendings', c.getCategoriesSpendings)

  .get('/',    c.getCategories)
  .get('/:id', c.getCategory)

  .post('/',    c.createCategory)
  .post('/:id', c.updateCategory)

  .del('/:id', c.deleteCategory)

export const categoriesRoutes = categoryRouter.routes()
export const categoriesAllowedMethods = categoryRouter.allowedMethods()
