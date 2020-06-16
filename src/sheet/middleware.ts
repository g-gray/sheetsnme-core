import * as t from '../types'

import * as err from '../error'

import * as m from './model'

export async function spreadsheetIdRequired(ctx: t.KContext, next: t.KNext): Promise<void> {
  const sessionId: string = ctx.sessionId
  // TODO: Add ability to have multiple spreadsheets under one account
  // const spreadsheetId: void | string = ctx.query.spreadsheetId
  // if (!spreadsheetId) {
  //   throw new err.BadRequest('Spreadsheet id required')
  // }

  const spreadsheets: t.SpreadsheetResult[] = await m.spreadsheetsBySessionId(sessionId)
  // const spreadsheet: void | t.SpreadsheetResult = spreadsheets.filter(s => s.id === spreadsheetId)
  const spreadsheet: void | t.SpreadsheetResult = spreadsheets[0]
  if (!spreadsheet) {
    throw new err.BadRequest(t.SHEET_ERROR.SPREADSHEET_NOT_FOUND)
  }

  ctx.gSpreadsheetId = spreadsheet.externalId

  await next()
}
