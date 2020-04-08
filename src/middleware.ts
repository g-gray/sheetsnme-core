import * as t from './types'

// @ts-ignore
import * as fpx from 'fpx'

import * as e from './env'
import * as u from './utils'

const {
  LANG_HEADER_NAME,
} = e.properties

export async function jsonOnly(ctx: t.KContext, next: t.KNext): Promise<void> {
  if (!ctx.accepts('application/json')) {
    ctx.throw(406, 'Not acceptable')
    return
  }

  await next()
}

export async function setLang(ctx: t.KContext, next: t.KNext): Promise<void> {
  const lang: string | void = ctx.headers[LANG_HEADER_NAME]

  ctx.lang = u.AVAILABLE_LANGS[0]
  if (fpx.includes(u.AVAILABLE_LANGS), lang) {
    ctx.lang = lang
  }

  await next()
}
