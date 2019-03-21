// @flow

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import * as t from './types'
import * as e from './env'
import * as u from './utils'
import * as r from './router'


/**
 * App entry
 * @type {Koa}
 */

const app: t.Koa = new Koa()
app.use(bodyParser())

app
  .use(r.routes)
  .use(r.allowedMethods)

const {SCHEMA, HOST, PORT} = e.properties
app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${SCHEMA}://${HOST}:${PORT}`)
})
