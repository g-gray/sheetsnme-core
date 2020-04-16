import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as sn from '../sheet/net'

// TODO Probably replace generic by a common type for all key entities
export async function queryEntityById<T extends t.Entity>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  id           : string,
  rowToEntity  : (row: t.GQueryRow) => T,
): Promise<void | T> {
  if (!id) {
    throw new Error(t.ENTITY_ERROR.ID_REQUIRED)
  }

  const query: string = `select * where A = '${id}'`
  const entities: T[] = await queryEntities<T>(
    client,
    spreadsheetId,
    sheetId,
    rowToEntity,
    query,
  )
  const entity: void | T = fpx.first(entities)

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
  const table: void | t.GQueryTable = await sn.querySheet(
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
  spreadsheetId: string,
  sheetId      : number,
  query?: string,
): Promise<number> {
  const table: void | t.GQueryTable = await sn.querySheet(
    spreadsheetId,
    sheetId,
    query || `select count(A) where A != 'id'`,
  )

  const rows: t.GQueryRow[] = table
    ? table.rows
    : []
  const row: void | t.GQueryRow = fpx.first(rows)
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
  await sn.appendRow(client, spreadsheetId, sheetId, entityToRow(entity))

  const created: void | T = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    entity.id,
    rowToEntity,
  )
  if (!created) {
    throw new Error(t.ENTITY_ERROR.WAS_NOT_CREATED)
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
    throw new Error(t.ENTITY_ERROR.ID_REQUIRED)
  }

  const toDelete: void | T = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    id,
    rowToEntity,
  )
  if (!toDelete) {
    throw new Error(t.ENTITY_ERROR.NOT_FOUND)
  }

  const rowNumber: number = toDelete.row || 0
  if (!rowNumber) {
    throw new Error(t.ENTITY_ERROR.ROW_NUMBER_NOT_FOUND)
  }

  await sn.deleteRow(client, spreadsheetId, sheetId, rowNumber)

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
    throw new Error(t.ENTITY_ERROR.ID_REQUIRED)
  }

  const toUpdate: void | T = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    id,
    rowToEntity,
  )
  if (!toUpdate) {
    throw new Error(t.ENTITY_ERROR.NOT_FOUND)
  }

  const rowNumber: number = toUpdate.row || 0
  if (!rowNumber) {
    throw new Error(t.ENTITY_ERROR.ROW_NUMBER_NOT_FOUND)
  }

  await sn.updateRow(client, spreadsheetId, sheetId, rowNumber, entityToRow(entity))

  const updated: void | T = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    entity.id,
    rowToEntity,
  )
  if (!updated) {
    throw new Error(t.ENTITY_ERROR.WAS_NOT_CREATED)
  }

  return updated
}
