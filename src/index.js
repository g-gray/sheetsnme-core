// @flow
import Koa from 'koa'
import * as t from './types'
import * as e from './env'
import * as u from './utils'
import * as r from './router'


/*
 * App
 */
const app: t.Koa = new Koa()

app
  .use(async (_, next: () => Promise<void>): Promise<void> => {
    console.info('-- request')
    await next()
    console.info('-- response')
  })
  .use(async (_, next: () => Promise<void>): Promise<void> => {
    console.info('-- wait on request')
    await u.wait(300)
    console.info('-- end wait on request')

    await next()

    console.info('-- wait on response')
    await u.wait(300)
    console.info('-- end wait on response')
  })
  .use(r.routes)
  .use(r.allowedMethods)

const {SCHEMA, HOST, PORT} = e.properties
app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${SCHEMA}://${HOST}:${PORT}`)
})
