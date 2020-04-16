import * as t from '../types'

import uuid from 'uuid/v4'

import * as sn from '../sheet/net'

export async function queryEntityById<TR extends t.EntityResult>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  id           : string,
  rowToEntity  : (row: t.GQueryRow) => TR,
): Promise<void | TR> {
  if (!id) {
    throw new Error(t.ENTITY_ERROR.ID_REQUIRED)
  }

  const query: string = `SELECT * WHERE A = '${id}'`
  const entities: TR[] = await queryEntities<TR>(
    client,
    spreadsheetId,
    sheetId,
    rowToEntity,
    query,
  )
  const entity: void | TR = entities[0]
  return entity
}

export async function queryEntities<TR extends t.EntityResult>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  rowToEntity  : (row: t.GQueryRow) => TR,
  query?       : string,
): Promise<TR[]> {
  const table: void | t.GQueryTable = await sn.querySheet(
    spreadsheetId,
    sheetId,
    query || `SELECT * WHERE A != 'id'`,
  )
  if (!table) {
    return []
  }

  const entities: TR[] = table
    ? table.rows.map((row: t.GQueryRow): TR => rowToEntity(row))
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
    query || `SELECT count(A) WHERE A != 'id'`,
  )
  const rows: t.GQueryRow[] = table
    ? table.rows
    : []
  const row: void | t.GQueryRow = rows[0]
  const size: number = row && row.c[0] ? Number(row.c[0].v) : 0

  return size
}

export async function createEntity<TQ extends t.EntityQuery, TR extends t.EntityResult>(
  client        : t.GOAuth2Client,
  spreadsheetId : string,
  sheetId       : number,
  entity        : TQ,
  entityToRow   : (entity: TQ) => t.GRowData,
  rowToEntity   : (row: t.GQueryRow) => TR,
): Promise<TR> {
  const id: string = uuid()
  await sn.appendRow(client, spreadsheetId, sheetId, entityToRow({
    id,
    ...entity,
  }))

  const created: void | TR = await queryEntityById<TR>(
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

export async function deleteEntityById<TR extends t.EntityResult>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  id           : string,
  rowToEntity  : (row: t.GQueryRow) => TR,
): Promise<TR> {
  if (!id) {
    throw new Error(t.ENTITY_ERROR.ID_REQUIRED)
  }

  const toDelete: void | TR = await queryEntityById<TR>(
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

export async function updateEntityById<TQ extends t.EntityQuery, TR extends t.EntityResult>(
  client        : t.GOAuth2Client,
  spreadsheetId : string,
  sheetId       : number,
  id            : string,
  entity        : TQ,
  entityToRow   : (entity: TQ) => t.GRowData,
  rowToEntity   : (row: t.GQueryRow) => TR,
): Promise<TR> {
  if (!id) {
    throw new Error(t.ENTITY_ERROR.ID_REQUIRED)
  }

  const toUpdate: void | t.EntityResult = await queryEntityById<t.EntityResult>(
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

  await sn.updateRow(client, spreadsheetId, sheetId, rowNumber, entityToRow(entity))

  const updated: void | TR = await queryEntityById<TR>(
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
