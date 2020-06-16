import * as t from '../types'

import * as err from '../error'

import * as sm from '../sheet/model'
import * as sn from '../sheet/net'

import * as m from './model'

export async function getUser(ctx: t.KContext): Promise<t.UserWithSpreadsheeetsRes> {
  const sessionId: string = ctx.sessionId
  const user: void | t.UserResult = await m.userBySessionId(sessionId)
  if (!user) {
    throw new err.NotFound(t.USER_ERROR.NOT_FOUND)
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
      throw new err.BadRequest(t.USER_ERROR.SPREADSHEET_ID_REQUIRED)
    }

    spreadsheet = await sm.createSpreadsheet(
      sessionId,
      gSpreadsheet.spreadsheetId
    )
  }

  // TODO Rethink
  const response: t.UserWithSpreadsheeetsRes = {
    ...m.userToFields(user),
    spreadsheets: [sm.spreadsheetToFields(spreadsheet)],
  }
  return response
}
