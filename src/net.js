// @flow
import {google} from 'googleapis'
import * as f from 'fpx'
import uuid from 'uuid/v4'
import * as t from './types'
import * as e from './env'
import * as u from './utils'
import * as s from './sheets'

const {SPREADSHEET_NAME} = e.properties

/**
 * Accounts
 */

export async function fetchAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Account | void> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Accounts')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Account | void = await queryEntityById<t.Account>(spreadsheetId, sheet, id, rowToAccount)
  return result
}

export async function createAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  fields       : any,
): Promise<t.Account | void> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Accounts')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const account: t.Account = fields
  const result: t.Account | void = await createEntity<t.Account>(
    client,
    spreadsheetId,
    sheet,
    {...account, id: uuid()},
    validateAccountFields,
    accountToRow,
    rowToAccount,
  )
  return result
}

export async function updateAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  fields       : any,
): Promise<t.Account | void> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Accounts')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Account = await updateEntityById<t.Account>(
    client,
    spreadsheetId,
    sheet,
    id,
    validateAccountFields,
    fields,
    accountToRow,
    rowToAccount,
  )
  return result
}

export async function deleteAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Account | void> {
  // TODO Don't allow if there are transactions with this account id
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Accounts')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Account = await deleteEntityById<t.Account>(client, spreadsheetId, sheet, id, rowToAccount)
  return result
}

export async function fetchAccounts(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
): Promise<t.Accounts> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Accounts')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Accounts = await queryEntities<t.Account>(spreadsheetId, sheet, rowToAccount)
  return result
}


function rowToAccount(row: t.GRow): t.Account {
  // TODO Think about casting to Number. Potentially footgun
  return {
    id          : row[0],
    title       : row[1],
    currencyCode: row[2],
    initial     : Number(row[3]),
    createdAt   : row[4],
    updatedAt   : row[5],
    row         : Number(row[6]),
  }
}

function accountToRow(account: t.Account): t.GRow {
  const date: Date = new Date()
  return [
    account.id           || '',
    account.title        || '',
    account.currencyCode || '',
    account.initial      || 0,
    account.createdAt    || u.formatDateTime(date),
    u.formatDateTime(date),
  ]
}

function validateAccountFields(fields: any): t.ResErrors {
  const errors = []

  if (f.isNil(fields.title) || !f.isString(fields.title) || !f.size(fields.title)) {
    errors.push({text: 'Title must be non empty string'})
  }

  if (fields.currencyCode === 'RUB') {
    errors.push({text: 'Currency Code must be one of these: \'RUB\''})
  }

  if (f.isNil(fields.initial) || !f.isNumber(fields.initial) || fields.initial < 0) {
    errors.push({text: 'Initial amount must be a positive number'})
  }

  return errors
}


/**
 * Categories
 */

export async function fetchCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Category | void> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Categories')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Category | void = await queryEntityById<t.Category>(spreadsheetId, sheet, id, rowToCategory)
  return result
}

export async function createCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  fields       : any,
): Promise<t.Category | void> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Categories')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Category | void = await createEntity<t.Category>(
    client,
    spreadsheetId,
    sheet,
    {...fields, id: uuid()},
    validateCategoryFields,
    categoryToRow,
    rowToCategory,
  )
  return result
}

export async function updateCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  fields       : any,
): Promise<t.Category | void> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client,  spreadsheetId, 'Categories')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Category = await updateEntityById<t.Category>(
    client,
    spreadsheetId,
    sheet,
    id,
    fields,
    validateCategoryFields,
    categoryToRow,
    rowToCategory,
  )
  return result
}

export async function deleteCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Category | void> {
  // TODO Don't allow if there are transactions with this category id
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Categories')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Category = await deleteEntityById<t.Category>(client, spreadsheetId, sheet, id, rowToCategory)
  return result
}

export async function fetchCategories(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
): Promise<t.Categories> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Categories')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Categories = await queryEntities<t.Category>(spreadsheetId, sheet, rowToCategory)
  return result
}


function rowToCategory(row: t.GRow): t.Category {
  return {
    id       : row[0],
    title    : row[1],
    createdAt: row[2],
    updatedAt: row[3],
  }
}

function categoryToRow(category: t.Category): t.GRow {
  const date: Date = new Date()
  return [
    category.id           || '',
    category.title        || '',
    category.createdAt    || u.formatDateTime(date),
    u.formatDateTime(date),
  ]
}

function validateCategoryFields(fields: any): t.ResErrors {
  const errors = []

  if (f.isNil(fields.title) || !f.isString(fields.title) || !f.size(fields.title)) {
    errors.push({text: 'Title must be non empty string'})
  }

  if (f.isNil(fields.initial) || !f.isNumber(fields.initial) || fields.initial < 0) {
    errors.push({text: 'Initial amount must be a positive number'})
  }

  return errors
}



/**
 * Payees
 */

export async function fetchPayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Payee | void> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Payees')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Payee | void = await queryEntityById<t.Payee>(spreadsheetId, sheet, id, rowToPayee)
  return result
}

export async function createPayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  fields       : any,
): Promise<t.Payee | void> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Payees')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Payee | void = await createEntity<t.Payee>(
    client,
    spreadsheetId,
    sheet,
    {...fields, id: uuid()},
    validatePayeeFields,
    payeeToRow,
    rowToPayee,
  )
  return result
}

export async function updatePayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  fields       : any,
): Promise<t.Payee | void> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Payees')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Payee = await updateEntityById<t.Payee>(
    client,
    spreadsheetId,
    sheet,
    id,
    fields,
    validatePayeeFields,
    payeeToRow,
    rowToPayee,
  )
  return result
}

export async function deletePayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Payee | void> {
  // TODO Don't allow if there are transactions with this payee id
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Payees')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Payee = await deleteEntityById<t.Payee>(client, spreadsheetId, sheet, id, rowToPayee)
  return result
}

export async function fetchPayees(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
): Promise<t.Payees> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client,  spreadsheetId, 'Payees')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Payees = await queryEntities<t.Payee>(spreadsheetId, sheet, rowToPayee)
  return result
}


function rowToPayee(row: t.GRow): t.Payee {
  return {
    id       : row[0],
    title    : row[1],
    createdAt: row[2],
    updatedAt: row[3],
  }
}

function payeeToRow(payee: t.Payee): t.GRow {
  const date: Date = new Date()
  return [
    payee.id        || '',
    payee.title     || '',
    payee.createdAt || u.formatDateTime(date),
    u.formatDateTime(date),
  ]
}

function validatePayeeFields(fields: any): t.ResErrors {
  const errors = []

  if (f.isNil(fields.title) || !f.isString(fields.title) || !f.size(fields.title)) {
    errors.push({text: 'Title must be non empty string'})
  }

  if (f.isNil(fields.initial) || !f.isNumber(fields.initial) || fields.initial < 0) {
    errors.push({text: 'Initial amount must be a positive number'})
  }

  return errors
}



/**
 * Transactions
 */

export async function fetchTransaction(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Transaction | void> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Transactions')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Transaction | void = await queryEntityById<t.Transaction>(spreadsheetId, sheet, id, rowToTransaction)
  return result
}

export async function createTransaction(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  fields       : any,
): Promise<t.Transaction | void> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Transactions')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Transaction | void = await createEntity<t.Transaction>(
    client,
    spreadsheetId,
    sheet,
    {...fields, id: uuid()},
    validateTransactionFields,
    transactionToRow,
    rowToTransaction,
  )
  return result
}

export async function updateTransaction(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  fields       : any,
): Promise<t.Transaction | void> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Transactions')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Transaction = await updateEntityById<t.Transaction>(
    client,
    spreadsheetId,
    sheet,
    id,
    fields,
    validateTransactionFields,
    transactionToRow,
    rowToTransaction,
  )
  return result
}

export async function deleteTransaction(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Transaction | void> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Transactions')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const result: t.Transaction = await deleteEntityById<t.Transaction>(client, spreadsheetId, sheet, id, rowToTransaction)
  return result
}

export async function fetchTransactions(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  filter       : t.TransactionsFilter,
): Promise<t.Transactions> {
  const sheet: t.GSheet | void = await fetchSheetByTitle(client, spreadsheetId, 'Transactions')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const query: string = filterTransactionsQuery(filter)
  const result: t.Transactions = await queryEntities<t.Transaction>(spreadsheetId, sheet, rowToTransaction, query)
  return result
}


function rowToTransaction(row: t.GRow): t.Transaction {
  return {
    id                : row[0],
    date              : row[1],
    categoryId        : row[2],
    payeeId           : row[3],
    comment           : row[4],
    outcomeAccountId  : row[5],
    outcomeAmount     : Number(row[6]),
    incomeAccountId   : row[7],
    incomeAmount      : Number(row[8]),
    createdAt         : row[9],
    updatedAt         : row[10],
    row               : Number(row[11]),
  }
}

function transactionToRow(tx: t.Transaction): t.GRow {
  const date: Date = new Date()
  return [
    tx.id               || '',
    tx.date             || '',
    tx.categoryId       || '',
    tx.payeeId          || '',
    tx.comment          || '',
    tx.outcomeAccountId || '',
    tx.outcomeAmount    || '',
    tx.incomeAccountId  || '',
    tx.incomeAmount     || '',
    tx.createdAt        || u.formatDateTime(date),
    u.formatDateTime(date),
  ]
}

function filterTransactionsQuery(filter: t.TransactionsFilter): string {
  const where = f.compact([
    `A != 'id'`,
    filter.id         ? `A = '${filter.id}'`                                       : undefined,
    filter.dateFrom   ? `B >= date '${filter.dateFrom}'`                           : undefined,
    filter.dateTo     ? `B <= date '${filter.dateTo}'`                             : undefined,
    filter.categoryId ? `C = '${filter.categoryId}'`                               : undefined,
    filter.payeeId    ? `lower(D) like lower('%${filter.payeeId}%')`               : undefined,
    filter.comment    ? `lower(E) like lower('%${filter.comment}%')`               : undefined,
    filter.accountId  ? `(F = '${filter.accountId}' OR H = '${filter.accountId}')` : undefined,
    filter.amountFrom ? `G >= ${filter.amountFrom}`                                : undefined,
    filter.amountTo   ? `I <= ${filter.amountTo}`                                  : undefined,
  ]).join(' AND ')

  const query: string = [
    `select *`,
    `where ${where}`,
    `order by B desc, J desc`,
  ].join(' ')
  return query
}

function validateTransactionFields(fields: any): t.ResErrors {
  const errors = []

  if (f.isNil(fields.date) || !f.isValidDate(new Date(fields.date))) {
    errors.push({text: 'Date must be non empty and valid'})
  }

  if (f.isNil(fields.outcomeAccountId) && f.isNil(fields.incomeAccountId)) {
    errors.push({text: 'Outcome/Income account required'})
  }

  if (!f.isNil(fields.outcomeAccountId) && !f.isNumber(fields.outcomeAmount)) {
    errors.push({text: 'Outcome amount must be a valid number'})
  }

  if (!f.isNil(fields.incomeAccountId) && !f.isNumber(fields.incomeAmount)) {
    errors.push({text: 'Income amount must be a valid number'})
  }

  return errors
}



/**
 * Spreadsheet
 */

export async function createAppSpreadsheet(client: t.GOAuth2Client) {
  const spreadsheet: t.GSpreadsheet | void = await createSpreadsheet(client, {
    resource: {
      properties: {
        title: SPREADSHEET_NAME,
      },
      sheets: [
        s.transactions,
        s.accounts,
        s.categories,
        s.payees,
      ],
    },
  })

  if (!spreadsheet) {
    throw new u.PublicError('Spreadsheet not found')
  }

  // TODO Check return value
  await addPermissions(client, {
    fileId: spreadsheet.spreadsheetId,
    resource: {
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
async function queryEntityById<T>(
  spreadsheetId: string,
  sheet        : t.GSheet,
  id           : string,
  rowToEntity  : (row: t.GRow) => T,
): Promise<T | void> {
  if (!id) {
    throw new u.PublicError('Entity id is required')
  }

  const query: string = `select * where A = '${id}'`
  const entities: Array<T> = await queryEntities<T>(spreadsheetId, sheet, rowToEntity, query)
  const entity: T | void = f.first(entities)

  return entity
}

// TODO Probably replace generic by a common type for all key entities
async function queryEntities<T>(
  spreadsheetId: string,
  sheet        : t.GSheet,
  rowToEntity  : (row: t.GRow) => T,
  query?: string,
): Promise<Array<T>> {
  const table: t.GQueryTable = await querySheet(
    spreadsheetId,
    sheet.properties.sheetId,
    query || `select * where A != 'id'`
  )
  const entities: Array<T> = f.map(table.rows, row => rowToEntity(queryRowToRow(row)))
  return entities
}

// TODO Probably replace generic by a common type for all key entities
async function createEntity<T>(
  client        : t.GOAuth2Client,
  spreadsheetId : string,
  sheet         : t.GSheet,
  fields        : any,
  validateFields: (fields: any) => t.ResErrors,
  entityToRow   : (entity: T) => t.GRow,
  rowToEntity   : (row: t.GRow) => T,
): Promise<T> {
  const errors: t.ResErrors = validateFields(fields)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const entity: T = fields
  const row: t.GRow | void = await appendRow(client, spreadsheetId, sheet, entityToRow(entity))
  if (!row) {
    throw new u.PublicError('Row not found')
  }

  const result: T = rowToEntity(row)
  return result
}

// TODO Probably replace generic by a common type for all key entities
async function deleteEntityById<T>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheet        : t.GSheet,
  id           : string,
  rowToEntity  : (row: t.GRow) => T,
): Promise<T> {
  if (!id) {
    throw new u.PublicError('Entity id is required')
  }

  const toDelete: T | void = await queryEntityById<T>(spreadsheetId, sheet, id, rowToEntity)
  if (!toDelete) {
    throw new u.PublicError('Entity not found')
  }

  const rowNumber: number = toDelete.row
  if (!rowNumber) {
    throw new u.PublicError('Row number not found')
  }

  const frozenRows: number = sheet.properties.gridProperties.frozenRowCount || 0
  await deleteRow(client, spreadsheetId, sheet, frozenRows + rowNumber)

  return toDelete
}

// TODO Probably replace generic by a common type for all key entities
async function updateEntityById<T>(
  client        : t.GOAuth2Client,
  spreadsheetId : string,
  sheet         : t.GSheet,
  id            : string,
  fields        : any,
  validateFields: (fields: any) => t.ResErrors,
  entityToRow   : (entity: T) => t.GRow,
  rowToEntity   : (row: t.GRow) => T,
): Promise<T> {
  if (!id) {
    throw new u.PublicError('Entity id is required')
  }

  const errors: t.ResErrors = validateFields(fields)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const toUpdate: T | void = await queryEntityById<T>(spreadsheetId, sheet, id, rowToEntity)
  if (!toUpdate) {
    throw new u.PublicError('Entity not found')
  }

  const rowNumber: number = toUpdate.row
  if (!rowNumber) {
    throw new u.PublicError('Row number not found')
  }

  const entity: T = fields
  const frozenRows: number = sheet.properties.gridProperties.frozenRowCount || 0
  const row: t.GRow | void = await updateRow(
    client,
    spreadsheetId,
    sheet,
    frozenRows + rowNumber,
    entityToRow({...toUpdate, ...entity}),
  )
  if (!row) {
    throw new u.PublicError('Row not found')
  }

  const updated: T = rowToEntity(row)
  return updated
}


async function appendRow(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheet        : t.GSheet,
  row          : t.GRow,
): Promise<t.GRow | void> {
  // TODO Replace by batchUpdateSpreadsheet
  const sheetTitle : string = sheet.properties.title
  const range      : string = `${sheetTitle}`
  const rows       : t.GRows = await appendValues(client, spreadsheetId, range, [row])
  const appendedRow: t.GRow | void = rows[0]
  return appendedRow
}

async function updateRow(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheet        : t.GSheet,
  rowNumber    : number,
  row          : t.GRow,
): Promise<t.GRow | void> {
  // TODO Replace by batchUpdateSpreadsheet
  const sheetTitle: string = sheet.properties.title
  const range     : string = `${sheetTitle}!A${rowNumber}:${rowNumber}`
  const rows      : t.GRows = await updateValues(client, spreadsheetId, range, [row])
  const updatedRow: t.GRow | void = rows[0]
  return updatedRow

}

async function deleteRow(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheet        : t.GSheet,
  rowNumber    : number,
): Promise<void> {
  await batchUpdateSpreadsheet(client, {
    spreadsheetId,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheet.properties.sheetId,
            dimension: 'ROWS',
            startIndex: rowNumber - 1,
            endIndex: rowNumber,
          },
        },
      }],
    },
  })
}


async function fetchSheetByTitle(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  title        : string,
): Promise<t.GSheet | void> {
  const spreadsheet: t.GSpreadsheet | void = await fetchSpreadsheet(client, {spreadsheetId})
  if (!spreadsheet) {
    throw new u.PublicError('Spreadsheet not found')
  }

  const sheet = findSheetByTitle(spreadsheet.sheets, title)
  return sheet
}

function findSheetByTitle(sheets: Array<t.GSheet>, title: string): t.GSheet | void {
  return f.find(sheets, sheet => sheet.properties.title === title)
}

export function fetchSpreadsheet(client: t.GOAuth2Client, options: any): Promise<t.GSpreadsheet | void> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.get(options, (err, res) => {
      if (err) if (err) throw Error(err)
      resolve(res.data)
    })
  })
}

export function createSpreadsheet(client: t.GOAuth2Client, options: any): Promise<t.GSpreadsheet | void> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.create(options, (err, res) => {
      if (err) if (err) throw Error(err)
      resolve(res.data)
    })
  })
}

export function batchUpdateSpreadsheet(client: t.GOAuth2Client, options: any): Promise<any> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.batchUpdate(options, (err, res) => {
      if (err) if (err) throw Error(err)
      resolve(res.data.replies)
    })
  })
}

export function addPermissions(client: t.GOAuth2Client, options: any): Promise<void> {
  return new Promise(resolve => {
    google.drive({version: 'v3', auth: client}).permissions.create(options, err => {
      if (err) if (err) throw Error(err)
      resolve()
    })
  })
}


export function appendValues(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  range        : string,
  values       : t.GRow,
): Promise<t.GRows> {
  const options: t.GValuesRequest = {
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    includeValuesInResponse: true,
    resource: {values},
  }

  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.values.append(options, (err, res) => {
      if (err) if (err) throw Error(err)
      resolve(res.data.updates.updatedData.values)
    })
  })
}

export function updateValues(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  range        : string,
  values       : t.GRow,
): Promise<t.GRows> {
  const options: t.GValuesRequest = {
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    includeValuesInResponse: true,
    resource: {values},
  }

  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.values.update(options, (err, res) => {
      if (err) if (err) throw Error(err)
      resolve(res.data.updatedData.values)
    })
  })
}


async function querySheet(spreadsheetId: string, sheetId: number, query?: string): Promise<t.GQueryTable> {
  const encodedQuery: string = encodeURIComponent(query || '')
  // TODO Use util to join query params instead of inline them
  const url: string = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tq=${encodedQuery}&gid=${sheetId}`

  return await u.fetch({url}).then(({body}) => {
    const matches = body && body.match(/google\.visualization\.Query\.setResponse\((.*)\);$/)
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

function queryRowToRow(queryRow) {
  return f.map(queryRow.c, col => col ? (col.f || col.v) : undefined)
}


export function fetchUserInfo(client: t.GOAuth2Client): Promise<t.GUser | void> {
  return new Promise(resolve => {
    google.oauth2({version: 'v2', auth: client}).userinfo.get((err, res) => {
      if (err) throw Error(err)
      resolve(res.data)
    })
  })
}
