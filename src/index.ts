import * as t from './types'

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'

import * as e from './env'

import * as am from './auth/middleware'

import * as r from './router'
import * as m from './middleware'

// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/36161
const app: Koa<Koa.DefaultState, t.CustomContext> = new Koa<Koa.DefaultState, t.CustomContext>()
app
  .use(bodyParser())
  .use(am.handleAuthError)
  .use(m.handlePublicError)
  .use(r.appRoutes)
  .use(r.appAllowedMethods)

const {HOST, PORT} = e.properties
app.listen(PORT, HOST, undefined, () => {
  // tslint:disable-next-line:no-console
  console.log(`Server listening on ${HOST}:${PORT}`)
})
