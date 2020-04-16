import * as t from '../types'

import * as u from '../utils'

import * as m from './model'

export async function spreadsheetIdRequired(ctx: t.KContext, next: t.KNext): Promise<void> {
  const sessionId: string = ctx.sessionId
  // TODO: Add ability to have multiple spreadsheets under one account
  // const spreadsheetId: void | string = ctx.query.spreadsheetId
  // if (!spreadsheetId) {
  //   throw new u.PublicError(400, 'Spreadsheet id required')
  // }

  const spreadsheets: t.Spreadsheets = await m.spreadsheetsBySessionId(sessionId)
  // const spreadsheet: void | t.Spreadsheet = spreadsheets.filter(s => s.id === spreadsheetId)
  const spreadsheet: void | t.Spreadsheet = spreadsheets[0]
  if (!spreadsheet) {
    throw new u.PublicError(400, t.SHEET_ERROR.SPREADSHEET_NOT_FOUND)
  }

  ctx.gSpreadsheetId = spreadsheet.externalId

  await next()
}
