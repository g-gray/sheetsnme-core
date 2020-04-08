import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as db from '../db'

export async function spreadsheetsBySessionId(
  sessionId: string
): Promise<t.Spreadsheets> {
const q: string = `
  select sh.*
  from spreadsheets sh
  left join sessions s on s.user_id = sh.user_id
  where s.id = $1
  order by created_at desc
  `
  const v: any[] = [sessionId]
  const result: t.PGQueryResult = await db.query(q, v)
  const rows: t.PGQueryResultRow[] = result.rows

  const spreadsheets = fpx.map(rows, rowToSpreadsheet)
  return spreadsheets
}

export async function createSpreadsheet(
  sessionId: string,
  spreadsheetId: string
): Promise<t.Spreadsheet> {
  const q: string = `
  with
      s as (select user_id from sessions where id = $1)
  insert into spreadsheets
      (user_id, external_id)
  values
      ((select user_id from s), $2)
  returning *
  `
  const v: any[] = [sessionId, spreadsheetId]
  const result: t.PGQueryResult = await db.query(q, v)
  const row: t.PGQueryResultRow = result.rows[0]
  const spreadsheet: t.Spreadsheet = rowToSpreadsheet(row)
  return spreadsheet
}

function rowToSpreadsheet(row: t.PGQueryResultRow): t.Spreadsheet {
  return {
      id        : row.id          as string,
      userId    : row.user_id     as string,
      externalId: row.external_id as string,
      createdAt : row.created_at  as Date,
      updatedAt : row.updated_at  as Date,
  }
}
