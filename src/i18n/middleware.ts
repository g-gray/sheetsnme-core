import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as e from '../env'
import {AVAILABLE_LANGS} from './utils'

const {
  LANG_HEADER_NAME,
} = e.properties

export async function setLang(ctx: t.KContext, next: t.KNext): Promise<void> {
  const lang: void | string = ctx.headers[LANG_HEADER_NAME]

  ctx.lang = AVAILABLE_LANGS[0]
  if (fpx.includes(AVAILABLE_LANGS), lang) {
    ctx.lang = lang
  }

  await next()
}
