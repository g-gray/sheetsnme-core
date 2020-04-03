import * as t from './types'

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'

import * as e from './env'
import * as r from './router'
import * as u from './utils'

// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/36161
const app: Koa<Koa.DefaultState, t.CustomContext> = new Koa<Koa.DefaultState, t.CustomContext>()
app
  .use(bodyParser())
  .use(handlePublicError)
  .use(r.authRoutes)
  .use(r.authAllowedMethods)
  .use(r.apiRoutes)
  .use(r.apiAllowedMethods)


const {HOST, PORT} = e.properties
app.listen(PORT, HOST, undefined, () => {
  // tslint:disable-next-line:no-console
  console.log(`Server listening on ${HOST}:${PORT}`)
})

export async function handlePublicError(ctx: t.Context, next: t.Next): Promise<void> {
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
