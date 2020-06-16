import * as t from './types'

// @ts-ignore
import * as fpx from 'fpx'

import * as e from './env'
import * as u from './utils'
import * as err from './error'

const {
  LANG_HEADER_NAME,
} = e.properties

export async function jsonOnly(ctx: t.KContext, next: t.KNext): Promise<void> {
  if (!ctx.accepts('application/json')) {
    throw new err.NotAcceptable(t.APP_ERROR.NOT_ACCEPTABLE)
  }

  await next()
}

export async function setLang(ctx: t.KContext, next: t.KNext): Promise<void> {
  const lang: void | string = ctx.headers[LANG_HEADER_NAME]

  ctx.lang = u.AVAILABLE_LANGS[0]
  if (fpx.includes(u.AVAILABLE_LANGS), lang) {
    ctx.lang = lang
  }

  await next()
}

export async function bodyAsResponse(ctx: t.KContext, next: t.KNext): Promise<void> {
  const body = await next()
  if (body) {
    ctx.body = body
  }
}
