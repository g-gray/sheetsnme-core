import * as t from '../types'

import * as sm from '../sheet/model'
import * as sn from '../sheet/net'

import * as m from './model'

export async function getUser(ctx: t.KContext) {
  const sessionId: string = ctx.sessionId
  const user: t.User | void = await m.userBySessionId(sessionId)
  if (!user) {
    ctx.throw(404, 'User not found')
    return
  }

  const spreadsheets: t.Spreadsheets = await sm.spreadsheetsBySessionId(sessionId)
  let spreadsheet: t.Spreadsheet | void = spreadsheets[0]
  let gSpreadsheet: t.GSpreadsheetRes | void

  const client: t.GOAuth2Client = ctx.client

  if (spreadsheet) {
    try {
      gSpreadsheet = await sn.fetchSpreadsheet(
        client,
        {spreadsheetId: spreadsheet.externalId}
      )
    }
    catch (error) {
      if (error.code === 401) {
        ctx.throw(401, 'Unauthorized')
        return
      }
      throw error
    }
  }

  if (!gSpreadsheet) {
    gSpreadsheet = await sn.createAppSpreadsheet(client, ctx.lang)

    if (!gSpreadsheet.spreadsheetId) {
      ctx.throw(400, 'Spreadsheet id required')
      return
    }

    spreadsheet = await sm.createSpreadsheet(
      sessionId,
      gSpreadsheet.spreadsheetId
    )
  }

  ctx.body = {...user, spreadsheets: [{id: spreadsheet.id}]}
}
