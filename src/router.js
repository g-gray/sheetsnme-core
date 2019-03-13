// @flow
import Router from 'koa-router'
import * as t from './types'

const router: Router = new Router()

/*
 * GET
 */

router
  .get('/', (ctx: t.Context): Promise<void> | void => {
    ctx.body = 'Hello World'
  })

export const routes = router.routes()
export const allowedMethods = router.allowedMethods()
