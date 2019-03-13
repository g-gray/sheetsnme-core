// @flow
import dotenv from 'dotenv'
import Koa from 'koa'
import * as t from './types'
import * as r from './router'

dotenv.load({path: '.env.properties'})
global.env = {
  SCHEMA        : process.env.SCHEMA         || '',
  HOST          : process.env.HOST           || '',
  PORT          : process.env.PORT           || '',
}

const app: t.Application = new Koa()

/*
 * App
 */

app
  .use(r.routes)
  .use(r.allowedMethods)

app.listen(global.env.PORT, global.env.HOST, () => {
  console.log(`Server listening on ${global.env.SCHEMA}://${global.env.HOST}:${global.env.PORT}`)
})
