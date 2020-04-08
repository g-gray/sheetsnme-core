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
 * Categories
 */

export async function fetchCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Category | void> {
  const result: t.Category | void = await queryEntityById<t.Category>(
    client,
    spreadsheetId,
    s.CATEGORIES_SHEET_ID,
    id,
    rowToCategory,
  )
  return result
}

export async function createCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  category     : t.Category,
): Promise<t.Category> {
  const result: t.Category = await createEntity<t.Category>(
    client,
    spreadsheetId,
    s.CATEGORIES_SHEET_ID,
    category,
    categoryToRow,
    rowToCategory,
  )
  return result
}

export async function updateCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  category     : t.Category,
): Promise<t.Category> {
  const result: t.Category = await updateEntityById<t.Category>(
    client,
    spreadsheetId,
    s.CATEGORIES_SHEET_ID,
    id,
    category,
    categoryToRow,
    rowToCategory,
  )
  return result
}

export async function deleteCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Category> {
  const result: t.Category = await deleteEntityById<t.Category>(
    client,
    spreadsheetId,
    s.CATEGORIES_SHEET_ID,
    id,
    rowToCategory,
  )
  return result
}

export async function fetchCategories(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
): Promise<t.Categories> {
  const result: t.Categories = await queryEntities<t.Category>(
    client,
    spreadsheetId,
    s.CATEGORIES_SHEET_ID,
    rowToCategory,
    `select * where A != 'id' order by B`
  )
  return result
}


function rowToCategory(row: t.GQueryRow): t.Category {
  return {
    id          : row.c[0] ? String(row.c[0].v) : '',
    title       : row.c[1] ? String(row.c[1].v) : '',
    createdAt   : row.c[2] ? String(row.c[2].v) : '',
    updatedAt   : row.c[3] ? String(row.c[3].v) : '',
    row         : row.c[4] ? Number(row.c[4].v) : 0,
  }
}

function categoryToRow(category: t.Category): t.GRowData {
  const date: string = new Date().toJSON()
  const createdAt: string = category.createdAt
    ? new Date(category.createdAt).toJSON()
    : date
  return {
    values: [
      {userEnteredValue: {stringValue: category.id}},
      {userEnteredValue: {stringValue: category.title}},
      {userEnteredValue: {stringValue: createdAt}},
      {userEnteredValue: {stringValue: date}},
    ],
  }
}



/**
 * Payees
 */

export async function fetchPayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Payee | void> {
  const result: t.Payee | void = await queryEntityById<t.Payee>(
    client,
    spreadsheetId,
    s.PAYEES_SHEET_ID,
    id,
    rowToPayee,
  )
  return result
}

export async function createPayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  payee        : t.Payee
): Promise<t.Payee> {

  const result: t.Payee = await createEntity<t.Payee>(
    client,
    spreadsheetId,
    s.PAYEES_SHEET_ID,
    payee,
    payeeToRow,
    rowToPayee,
  )
  return result
}

export async function updatePayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  payee        : t.Payee
): Promise<t.Payee> {
  const result: t.Payee = await updateEntityById<t.Payee>(
    client,
    spreadsheetId,
    s.PAYEES_SHEET_ID,
    id,
    payee,
    payeeToRow,
    rowToPayee,
  )
  return result
}

export async function deletePayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Payee> {
  const result: t.Payee = await deleteEntityById<t.Payee>(
    client,
    spreadsheetId,
    s.PAYEES_SHEET_ID,
    id,
    rowToPayee,
  )
  return result
}

export async function fetchPayees(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
): Promise<t.Payees> {
  const result: t.Payees = await queryEntities<t.Payee>(
    client,
    spreadsheetId,
    s.PAYEES_SHEET_ID,
    rowToPayee,
    `select * where A != 'id' order by B`
  )
  return result
}


function rowToPayee(row: t.GQueryRow): t.Payee {
  return {
    id          : row.c[0] ? String(row.c[0].v) : '',
    title       : row.c[1] ? String(row.c[1].v) : '',
    createdAt   : row.c[2] ? String(row.c[2].v) : '',
    updatedAt   : row.c[3] ? String(row.c[3].v) : '',
    row         : row.c[4] ? Number(row.c[4].v) : 0,
  }
}

function payeeToRow(payee: t.Payee): t.GRowData {
  const date: string = new Date().toJSON()
  const createdAt: string = payee.createdAt
    ? new Date(payee.createdAt).toJSON()
    : date
  return {
    values: [
      {userEnteredValue: {stringValue: payee.id}},
      {userEnteredValue: {stringValue: payee.title}},
      {userEnteredValue: {stringValue: createdAt}},
      {userEnteredValue: {stringValue: date}},
    ],
  }
}


export async function fetchDebtsByPayeeIds(
  client: t.GOAuth2Client,
  spreadsheetId: string,
  payeeIds: string[],
): Promise<t.DebtsById> {
  const loansTable: t.GQueryTable | void = await querySheet(
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    `
    select D, sum(G)
    where F = '${s.DEBT_ACCOUNT_ID}'
    group by D
    `,
  )
  const loanDebts: t.DebtsById = loansTable
    ? fpx.keyBy(
        fpx.map(loansTable.rows, rowToDebt),
        (debt: t.Debt) => debt.payeeId
      )
    : {}

  const borrowsTable: t.GQueryTable | void = await querySheet(
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    `
    select D, sum(I)
    where H = '${s.DEBT_ACCOUNT_ID}'
    group by D
    `,
  )
  const borrowDebts: t.DebtsById = borrowsTable
    ? fpx.keyBy(
        fpx.map(borrowsTable.rows, rowToDebt),
        (debt: t.Debt) => debt.payeeId
      )
    : {}

  const ids = fpx.uniq(fpx.concat(fpx.keys(loanDebts), fpx.keys(borrowDebts)))

  const result: t.DebtsById = fpx.fold(
    ids,
    {},
    (acc: t.DebtsById, id: string) => {
      const borrowDebt: t.Debt | void = borrowDebts[id]
      const borrowAmount = borrowDebt ? borrowDebt.debt : 0

      const loanDebt: t.Debt | void = loanDebts[id]
      const loanAmount = loanDebt ? loanDebt.debt : 0

      return {
        ...acc,
        [id]: {
          payeeId: id,
          debt: u.round(loanAmount - borrowAmount, 2),
        },
      }
    })

  return result
}

function rowToDebt(row: t.GQueryRow): t.Debt {
  return {
    payeeId: row.c[0]  ? String(row.c[0].v)  : '',
    debt   : row.c[1]  ? Number(row.c[1].v)  : 0,
  }
}



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
