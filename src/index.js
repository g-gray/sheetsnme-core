// @flow

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import * as t from './types'
import * as e from './env'
import * as r from './router'


/**
 * App entry
 * @type {Koa}
 */

const app: t.Koa = new Koa()
app
  .use(bodyParser())
  .use(handlePublicError)
  .use(r.routes)
  .use(r.allowedMethods)


const {SCHEMA, HOST, PORT} = e.properties
app.listen(PORT, HOST, undefined, () => {
  console.log(`Server listening on ${SCHEMA}://${HOST}:${PORT}`)
})

export async function handlePublicError(ctx: t.Context, next: () => Promise<void>): Promise<void> {
  try {
    await next()
  }
  catch (error) {
    if (error.name === 'PublicError') {
      ctx.throw(400, error.message)
      return
    }
    throw error
  }
}
