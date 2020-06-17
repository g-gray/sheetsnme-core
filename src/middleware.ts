import * as t from './types'

import * as err from './error'

export async function jsonOnly(ctx: t.KContext, next: t.KNext): Promise<void> {
  if (!ctx.accepts('application/json')) {
    throw new err.NotAcceptable(t.APP_ERROR.NOT_ACCEPTABLE)
  }

  await next()
}

export async function bodyAsResponse(ctx: t.KContext, next: t.KNext): Promise<void> {
  const body = await next()
  if (body) {
    ctx.body = body
  }
}
