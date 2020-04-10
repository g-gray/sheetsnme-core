import * as t from '../types'

import * as u from '../utils'

import * as m from './model'

export async function spreadsheetIdRequired(ctx: t.KContext, next: t.KNext): Promise<void> {
  const sessionId: string = ctx.sessionId
  // const spreadsheetId: string | void = ctx.query.spreadsheetId
  // if (!spreadsheetId) {
  //   throw new u.PublicError(400, 'Spreadsheet id required')
  // }

  const spreadsheets: t.Spreadsheets = await m.spreadsheetsBySessionId(sessionId)
  // const spreadsheet: t.Spreadsheet | void = spreadsheets.filter(s => s.id === spreadsheetId)
  const spreadsheet: t.Spreadsheet | void = spreadsheets[0]
  if (!spreadsheet) {
    throw new u.PublicError(400, t.SHEET_ERROR.SPREADSHEET_NOT_FOUND)
  }

  ctx.gSpreadsheetId = spreadsheet.externalId

  await next()
}
