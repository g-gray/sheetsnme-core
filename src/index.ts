import * as t from './types'

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'

import * as e from './env'
import * as u from './utils'
import * as r from './router'

// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/36161
const app: Koa<Koa.DefaultState, t.CustomContext> = new Koa<Koa.DefaultState, t.CustomContext>()
app
  .use(bodyParser())
  .use(handlePublicError)
  .use(r.appRoutes)
  .use(r.appAllowedMethods)

const {HOST, PORT} = e.properties
app.listen(PORT, HOST, undefined, () => {
  // tslint:disable-next-line:no-console
  console.log(`Server listening on ${HOST}:${PORT}`)
})

export async function handlePublicError(ctx: t.KContext, next: t.KNext): Promise<void> {
  try {
    await next()
  }
  catch (error) {
    if (error instanceof u.PublicError) {
      ctx.status = 400
      ctx.body = error.message
      if (error.body) {
        ctx.body = error.body
      }

      ctx.app.emit('error', error, ctx)
      return
    }
    throw error
  }
}
