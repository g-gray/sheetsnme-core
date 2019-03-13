// @flow
import dotenv from 'dotenv'
import Koa from 'koa'
import * as t from './types'
import * as u from './utils'
import * as r from './router'

dotenv.load({path: '.env.properties'})
global.env = {
  SCHEMA        : process.env.SCHEMA         || '',
  HOST          : process.env.HOST           || '',
  PORT          : process.env.PORT           || '',
  SPREADSHEET_ID: process.env.SPREADSHEET_ID || '',
}

const app: t.Application = new Koa()

/*
 * App
 */

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

app.listen(global.env.PORT, global.env.HOST, () => {
  console.log(`Server listening on ${global.env.SCHEMA}://${global.env.HOST}:${global.env.PORT}`)
})
