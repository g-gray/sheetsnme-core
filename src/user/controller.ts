import * as t from '../types'

import * as u from '../utils'

import * as sm from '../sheet/model'
import * as sn from '../sheet/net'

import * as m from './model'

export async function getUser(ctx: t.KContext) {
  const sessionId: string = ctx.sessionId
  const user: void | t.UserResult = await m.userBySessionId(sessionId)
  if (!user) {
    throw new u.PublicError(404, t.USER_ERROR.NOT_FOUND)
  }

  const spreadsheets: t.SpreadsheetResult[] = await sm.spreadsheetsBySessionId(sessionId)
  let spreadsheet: void | t.SpreadsheetResult = spreadsheets[0]
  let gSpreadsheet: void | t.GSpreadsheetRes

  const client: t.GOAuth2Client = ctx.client

  if (spreadsheet) {
    gSpreadsheet = await sn.fetchSpreadsheet(
      client,
      {spreadsheetId: spreadsheet.externalId}
    )
  }

  if (!gSpreadsheet) {
    gSpreadsheet = await sn.createAppSpreadsheet(client, ctx.lang)

    if (!gSpreadsheet.spreadsheetId) {
      throw new u.PublicError(400, t.USER_ERROR.SPREADSHEET_ID_REQUIRED)
    }

    spreadsheet = await sm.createSpreadsheet(
      sessionId,
      gSpreadsheet.spreadsheetId
    )
  }

  // TODO Rethink
  const response: t.GetUserRes = {
    ...m.userToFields(user),
    spreadsheets: [sm.spreadsheetToFields(spreadsheet)],
  }
  ctx.body = response
}
