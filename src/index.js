// @flow

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import * as t from './types'
import * as e from './env'
import * as r from './router'
import * as u from './utils'


/**
 * App entry
 * @type {Koa}
 */

const app: t.Koa = new Koa()
app
  .use(bodyParser())
  .use(handlePublicError)
  .use(r.authRoutes)
  .use(r.authAllowedMethods)
  .use(r.apiRoutes)
  .use(r.apiAllowedMethods)


const {SCHEMA, HOST, PORT} = e.properties
app.listen(PORT, HOST, undefined, () => {
  console.log(`Server listening on ${SCHEMA}://${HOST}:${PORT}`)
})

export async function handlePublicError(ctx: t.Context, next: () => Promise<void>): Promise<void> {
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
