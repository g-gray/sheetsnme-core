import * as t from './types'

import {google} from 'googleapis'
// @ts-ignore
import * as fpx from 'fpx'
import qs from 'query-string'

import * as e from './env'
import * as u from './utils'
import * as s from './sheets'

const {SPREADSHEET_NAME} = e.properties



/**
 * Spreadsheet
 */

export async function createAppSpreadsheet(
  client: t.GOAuth2Client,
  lang: t.Lang
): Promise<t.GSpreadsheetRes> {
  const spreadsheet: t.GSpreadsheetRes = await createSpreadsheet(client, {
    requestBody: {
      properties: {
        title: SPREADSHEET_NAME,
      },
      sheets: [
        s.createTransactionsSheet(lang),
        s.createAccountsSheet(lang),
        s.createCategoriesSheet(lang),
        s.createPayeesSheet(lang),
        s.createVersionsSheet(),
      ],
    },
  })

  // TODO Check return value
  await addPermissions(client, {
    fileId: spreadsheet.spreadsheetId || undefined,
    requestBody: {
      type: 'anyone',
      role: 'reader',
    },
  })

  return spreadsheet
}



/**
 * Utils
 */

// TODO Probably replace generic by a common type for all key entities
export async function queryEntityById<T extends t.Entity>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  id           : string,
  rowToEntity  : (row: t.GQueryRow) => T,
): Promise<T | void> {
  if (!id) {
    throw new Error('Entity id required')
  }

  const query: string = `select * where A = '${id}'`
  const entities: T[] = await queryEntities<T>(
    client,
    spreadsheetId,
    sheetId,
    rowToEntity,
    query,
  )
  const entity: T | void = fpx.first(entities)

  return entity
}

// TODO Probably replace generic by a common type for all key entities
export async function queryEntities<T>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  rowToEntity  : (row: t.GQueryRow) => T,
  query?: string,
): Promise<T[]> {
  const table: t.GQueryTable | void = await querySheet(
    spreadsheetId,
    sheetId,
    query || `select * where A != 'id'`,
  )
  const entities: T[] = table
    ? fpx.map(
      table.rows,
      (row: t.GQueryRow): T => rowToEntity(row)
    )
    : []

  return entities
}

// TODO Probably replace generic by a common type for all key entities
export async function queryEntitiesNumber(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  query?: string,
): Promise<number> {
  const table: t.GQueryTable | void = await querySheet(
    spreadsheetId,
    sheetId,
    query || `select count(A) where A != 'id'`,
  )

  const rows: t.GQueryRow[] = table
    ? table.rows
    : []
  const row: t.GQueryRow | void = fpx.first(rows)
  const size: number = row && row.c[0] ? Number(row.c[0].v) : 0

  return size
}

// TODO Probably replace generic by a common type for all key entities
export async function createEntity<T extends t.Entity>(
  client        : t.GOAuth2Client,
  spreadsheetId : string,
  sheetId       : number,
  entity        : T,
  entityToRow   : (entity: T) => t.GRowData,
  rowToEntity   : (row: t.GQueryRow) => T,
): Promise<T> {
  await appendRow(client, spreadsheetId, sheetId, entityToRow(entity))

  const created: T | void = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    entity.id,
    rowToEntity,
  )
  if (!created) {
    throw new Error('Entity was not created')
  }

  return created
}

// TODO Probably replace generic by a common type for all key entities
export async function deleteEntityById<T extends t.Entity>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  id           : string,
  rowToEntity  : (row: t.GQueryRow) => T,
): Promise<T> {
  if (!id) {
    throw new Error('Entity id required')
  }

  const toDelete: T | void = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    id,
    rowToEntity,
  )
  if (!toDelete) {
    throw new Error('Entity not found')
  }

  const rowNumber: number = toDelete.row || 0
  if (!rowNumber) {
    throw new Error('Row number not found')
  }

  await deleteRow(client, spreadsheetId, sheetId, rowNumber)

  return toDelete
}

// TODO Probably replace generic by a common type for all key entities
export async function updateEntityById<T extends t.Entity>(
  client        : t.GOAuth2Client,
  spreadsheetId : string,
  sheetId       : number,
  id            : string,
  entity        : T,
  entityToRow   : (entity: T) => t.GRowData,
  rowToEntity   : (row: t.GQueryRow) => T,
): Promise<T> {
  if (!id) {
    throw new Error('Entity id required')
  }

  const toUpdate: T | void = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    id,
    rowToEntity,
  )
  if (!toUpdate) {
    throw new Error('Entity not found')
  }

  const rowNumber: number = toUpdate.row || 0
  if (!rowNumber) {
    throw new Error('Row number not found')
  }

  await updateRow(client, spreadsheetId, sheetId, rowNumber, entityToRow(entity))

  const updated: T | void = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    entity.id,
    rowToEntity,
  )
  if (!updated) {
    throw new Error('Entity was not updated')
  }

  return updated
}


async function appendRow(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  row          : t.GRowData,
): Promise<void> {
  await batchUpdateSpreadsheet(client, {
    spreadsheetId,
    requestBody: {
      requests: [{
        appendCells: {
          sheetId,
          rows: [row],
          fields: '*',
        },
      }],
    },
  })
}

async function updateRow(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  rowNumber    : number,
  row          : t.GRowData,
): Promise<void> {
  await batchUpdateSpreadsheet(client, {
    spreadsheetId,
    requestBody: {
      requests: [{
        updateCells: {
          rows: [row],
          start: {
            sheetId,
            rowIndex: rowNumber - 1,
            columnIndex: 0,
          },
          fields: '*',
        },
      }],
    },
  })
}

async function deleteRow(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  rowNumber    : number,
): Promise<void> {
  await batchUpdateSpreadsheet(client, {
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowNumber - 1,
            endIndex: rowNumber,
          },
        },
      }],
    },
  })
}

export function fetchSpreadsheet(
  client: t.GOAuth2Client,
  options: t.GSpreadsheetsGetReq
): Promise<t.GSpreadsheetRes | void> {
  return google
    .sheets({version: 'v4', auth: client})
    .spreadsheets
    .get(options)
    .then(({data}) => data)
    .catch(error => {
      if (error.code === 404) return
      throw error
    })
}

export function createSpreadsheet(
  client: t.GOAuth2Client,
  options: t.GSpreadsheetsCreateReq
): Promise<t.GSpreadsheetRes> {
  return google
    .sheets({version: 'v4', auth: client})
    .spreadsheets
    .create(options)
    .then(({data}) => data)
}

export function batchUpdateSpreadsheet(
  client: t.GOAuth2Client,
  options: t.GSpreadsheetsBatchUpdateReq
): Promise<t.GSpreadsheetsBatchUpdateRes> {
  return google
    .sheets({version: 'v4', auth: client})
    .spreadsheets
    .batchUpdate(options)
    .then(({data}) => data)
}

export async function querySheet(
  spreadsheetId: string,
  sheetId: number,
  query?: string
): Promise<t.GQueryTable | void> {
  const queryString: string = qs.stringify({tq: query, gid: sheetId})
  const url: string = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?${queryString}`

  // TODO Find a better solution to query sheets
  return await u.fetch({url}).then(({body}) => {
    const stringified = body && String(body)
    const matches = stringified.match(/google\.visualization\.Query\.setResponse\((.*)\);$/)
    const match: string | null = matches && matches[1]
    if (!match) {
      return undefined
    }

    const data: t.GQueryRes = JSON.parse(match)
    if (!data) {
      return undefined
    }

    return data.table
  })
}

export function addPermissions(
  client: t.GOAuth2Client,
  options: t.GPermissionsCreateReq
): Promise<t.GPermissionsRes> {
  return google
    .drive({version: 'v3', auth: client})
    .permissions
    .create(options)
    .then(({data}) => data)
}

export function fetchUserInfo(
  client: t.GOAuth2Client
): Promise<t.GUserRes> {
  return google
    .oauth2({version: 'v2', auth: client})
    .userinfo
    .get()
    .then(({data}) => data)
}
