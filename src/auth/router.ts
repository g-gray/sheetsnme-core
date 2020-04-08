import Router from 'koa-router'

import * as c from './controller'

export const authRouter: Router = new Router({
  prefix: '/auth'
})

authRouter
  .get('/login',  c.authLogin)
  .get('/logout', c.authLogout)
  .get('/code',   c.authCode)

export const authRoutes = authRouter.routes()
export const authAllowedMethods = authRouter.allowedMethods()
