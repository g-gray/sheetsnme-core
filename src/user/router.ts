import Router from 'koa-router'

import * as c from './controller'

export const userRouter: Router = new Router({
  prefix: '/user'
})

userRouter
    .get('/', c.getUser)

export const userRoutes = userRouter.routes()
export const userAllowedMethods = userRouter.allowedMethods()
