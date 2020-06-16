import * as t from '../types'

import {PublicError} from './utils'

export async function handlePublicError(ctx: t.KContext, next: t.KNext): Promise<void> {
  try {
    await next()
  }
  catch (error) {
    if (error instanceof PublicError) {
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
