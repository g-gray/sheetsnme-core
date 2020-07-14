import * as t from '../types'

import uuid from 'uuid/v4'

import * as sn from '../sheet/net'

export async function queryEntityById<R extends t.EntityRowDataRes>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  id           : string,
  rowToEntity  : (row: t.GQueryRow) => R,
): Promise<void | R> {
  if (!id) {
    throw new Error(t.ENTITY_ERROR.ID_REQUIRED)
  }

  const query: string = `
    SELECT *
    WHERE A = '${id}'
  `
  const entities: R[] = await queryEntities<R>(
    client,
    spreadsheetId,
    sheetId,
    rowToEntity,
    query,
  )
  const entity: void | R = entities[0]
  return entity
}

export async function queryEntities<R extends t.EntityRowDataRes>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  rowToEntity  : (row: t.GQueryRow) => R,
  query?       : string,
): Promise<R[]> {
  const table: void | t.GQueryTable = await sn.querySheet(
    spreadsheetId,
    sheetId,
    query || `SELECT * WHERE A != 'id'`,
  )
  if (!table) {
    return []
  }

  const entities: R[] = table
    ? table.rows.map((row: t.GQueryRow): R => rowToEntity(row))
    : []
  return entities
}

export async function queryEntitiesNumber(
  spreadsheetId: string,
  sheetId      : number,
  query?       : string,
): Promise<number> {
  const table: void | t.GQueryTable = await sn.querySheet(
    spreadsheetId,
    sheetId,
    query || `SELECT COUNT(A) WHERE A != 'id'`,
  )
  const rows: t.GQueryRow[] = table
    ? table.rows
    : []
  const row: void | t.GQueryRow = rows[0]
  const size: number = row && row.c[0] ? Number(row.c[0].v) : 0

  return size
}

export async function createEntity<Q, R extends t.EntityRowDataRes>(
  client        : t.GOAuth2Client,
  spreadsheetId : string,
  sheetId       : number,
  entity        : Q,
  entityToRow   : (entity: t.EntityRowDataReq<Q>) => t.GRowData,
  rowToEntity   : (row: t.GQueryRow) => R,
): Promise<R> {
  const id: string = uuid()
  const date: string = new Date().toJSON()
  await sn.appendRow(client, spreadsheetId, sheetId, entityToRow({
    ...entity,
    id,
    createdAt: date,
    updatedAt: date,
  }))

  const created: void | R = await queryEntityById<R>(
    client,
    spreadsheetId,
    sheetId,
    id,
    rowToEntity,
  )
  if (!created) {
    throw new Error(t.ENTITY_ERROR.WAS_NOT_CREATED)
  }

  return created
}

export async function deleteEntityById<R extends t.EntityRowDataRes>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  id           : string,
  rowToEntity  : (row: t.GQueryRow) => R,
): Promise<R> {
  if (!id) {
    throw new Error(t.ENTITY_ERROR.ID_REQUIRED)
  }

  const toDelete: void | R = await queryEntityById<R>(
    client,
    spreadsheetId,
    sheetId,
    id,
    rowToEntity,
  )
  if (!toDelete) {
    throw new Error(t.ENTITY_ERROR.NOT_FOUND)
  }

  const rowNumber: number = toDelete.row
  if (!rowNumber) {
    throw new Error(t.ENTITY_ERROR.ROW_NUMBER_NOT_FOUND)
  }

  await sn.deleteRow(client, spreadsheetId, sheetId, rowNumber)

  return toDelete
}

export async function updateEntityById<Q, R extends t.EntityRowDataRes>(
  client        : t.GOAuth2Client,
  spreadsheetId : string,
  sheetId       : number,
  id            : string,
  entity        : Q,
  entityToRow   : (entity: t.EntityRowDataReq<Q>) => t.GRowData,
  rowToEntity   : (row: t.GQueryRow) => R,
): Promise<R> {
  if (!id) {
    throw new Error(t.ENTITY_ERROR.ID_REQUIRED)
  }

  const toUpdate: void | t.EntityRowDataRes = await queryEntityById<t.EntityRowDataRes>(
    client,
    spreadsheetId,
    sheetId,
    id,
    rowToEntity,
  )
  if (!toUpdate) {
    throw new Error(t.ENTITY_ERROR.NOT_FOUND)
  }

  const rowNumber: number = toUpdate.row
  if (!rowNumber) {
    throw new Error(t.ENTITY_ERROR.ROW_NUMBER_NOT_FOUND)
  }

  const date: string = new Date().toJSON()

  await sn.updateRow(
    client,
    spreadsheetId,
    sheetId,
    rowNumber,
    entityToRow({
      ...entity,
      id,
      createdAt: toUpdate.createdAt,
      updatedAt: date,
    })
  )

  const updated: void | R = await queryEntityById<R>(
    client,
    spreadsheetId,
    sheetId,
    id,
    rowToEntity,
  )
  if (!updated) {
    throw new Error(t.ENTITY_ERROR.WAS_NOT_CREATED)
  }

  return updated
}
