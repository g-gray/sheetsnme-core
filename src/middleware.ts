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
    throw new u.PublicError(406, t.APP_ERROR.NOT_ACCEPTABLE)
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

export async function handlePublicError(ctx: t.KContext, next: t.KNext): Promise<void> {
  try {
    await next()
  }
  catch (error) {
    if (error instanceof u.PublicError) {
      ctx.status = error.status
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
