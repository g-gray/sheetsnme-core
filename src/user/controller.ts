import * as t from '../types'

import * as u from '../utils'

import * as sm from '../sheet/model'
import * as sn from '../sheet/net'

import * as m from './model'

export async function getUser(ctx: t.KContext) {
  const sessionId: string = ctx.sessionId
  const user: void | t.User = await m.userBySessionId(sessionId)
  if (!user) {
    throw new u.PublicError(404, 'User not found')
  }

  const spreadsheets: t.Spreadsheets = await sm.spreadsheetsBySessionId(sessionId)
  let spreadsheet: void | t.Spreadsheet = spreadsheets[0]
  let gSpreadsheet: void | t.GSpreadsheetRes

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
        throw new u.PublicError(401, 'Unauthorized')
      }
      throw error
    }
  }

  if (!gSpreadsheet) {
    gSpreadsheet = await sn.createAppSpreadsheet(client, ctx.lang)

    if (!gSpreadsheet.spreadsheetId) {
      throw new u.PublicError(400, 'Spreadsheet id required')
    }

    spreadsheet = await sm.createSpreadsheet(
      sessionId,
      gSpreadsheet.spreadsheetId
    )
  }

  ctx.body = {...user, spreadsheets: [{id: spreadsheet.id}]}
}
