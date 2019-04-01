// @flow
import {google} from 'googleapis'
import * as f from 'fpx'
import * as t from './types'
import * as e from './env'
import * as u from './utils'

const {SPREADSHEET_ID} = e.properties

/**
 * User
 */

export function fetchGUserInfo(client: t.GOAuth2Client): Promise<t.GUser | void> {
  return new Promise(resolve => {
    google.oauth2({version: 'v2', auth: client}).userinfo.get((err, res) => {
      if (err) throw Error(err)
      resolve(res.data)
    })
  })
}



/**
 * Accounts
 */

export async function fetchAccount(client: t.GOAuth2Client, id: string): Promise<t.Account | void> {
  const spreadsheet: t.GSpreadsheet | void = await getSpreadsheet(client)
  if (!spreadsheet) {
    throw new u.PublicError('Spreadsheet not found')
  }

  const sheet = findSheetByTitle(spreadsheet.sheets, 'Accounts')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const data = await querySheet(sheet.properties.sheetId, filterAccountsQuery({id}))
  const filtered: t.Accounts = f.map(data.rows, row => rowToAccount(queryRowToRow(row)))
  const result: t.Account | void = f.first(filtered)

  return result
}

export async function createAccount(client: t.GOAuth2Client, account: t.Account): Promise<t.Account | void> {
  const Rows: t.GRows = await appendValues(
    client,
    `Accounts!A:G`,
    [accountToRow(account)]
  )
  const row: t.GRow | void = Rows[0]

  if (!row) {
    throw new u.PublicError('Row not found')
  }

  const created: t.Account = rowToAccount(row)
  return created
}

export async function updateAccount(client: t.GOAuth2Client, id: string, account: t.Account): Promise<t.Account | void> {
  const spreadsheet: t.GSpreadsheet | void = await getSpreadsheet(client)
  if (!spreadsheet) {
    throw new u.PublicError('Spreadsheet not found')
  }

  const sheet = findSheetByTitle(spreadsheet.sheets, 'Accounts')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  // TODO Add return type
  const data = await querySheet(sheet.properties.sheetId, filterAccountsQuery({id}))
  const filtered: t.Accounts = f.map(data.rows, row => rowToAccount(queryRowToRow(row)))
  const toUpdate: t.Account | void = f.first(filtered)
  if (!toUpdate) {
    throw new u.PublicError('Account not found')
  }

  const rowNumber: number = toUpdate.row
  if (!rowNumber) {
    throw new u.PublicError('Row number not found')
  }

  const frozenRows: number = sheet.properties.gridProperties.frozenRowCount || 0

  const rows: t.GRows = await updateValues(
    client,
    `Accounts!A${frozenRows + rowNumber}:K${frozenRows + rowNumber}`,
    [accountToRow({...toUpdate, ...account})]
  )

  const row: t.GRow | void = rows[0]
  if (!row) {
    throw new u.PublicError('Row not found')
  }

  const updated: t.Account = rowToAccount(row)
  return updated
}

export async function deleteAccount(client: t.GOAuth2Client, id: string): Promise<t.Account | void> {
  // TODO Don't allow if there are transactions with this account id
  const spreadsheet: t.GSpreadsheet | void = await getSpreadsheet(client)
  if (!spreadsheet) {
    throw new u.PublicError('Spreadsheet not found')
  }

  const sheet = findSheetByTitle(spreadsheet.sheets, 'Accounts')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  // TODO Add return type
  const sheetId = sheet.properties.sheetId
  const data = await querySheet(sheetId, filterAccountsQuery({id}))
  const accounts: t.Accounts = f.map(data.rows, row => rowToAccount(queryRowToRow(row)))
  const toDelete: t.Account | void = f.first(accounts)
  if (!toDelete) {
    throw new u.PublicError('Account not found')
  }

  const rowNumber: number = toDelete.row
  if (!rowNumber) {
    throw new u.PublicError('Row number not found')
  }

  const frozenRows: number = sheet.properties.gridProperties.frozenRowCount || 0

  const requests: t.GRequests = [{
    deleteDimension: {
      range: {
        sheetId,
        dimension: 'ROWS',
        startIndex: frozenRows + rowNumber - 1,
        endIndex: frozenRows + rowNumber,
      },
    },
  }]

  await batchUpdateSpreadsheet(client, requests)

  return toDelete
}

export async function fetchAccounts(client: t.GOAuth2Client): Promise<t.Accounts> {
  const spreadsheet: t.GSpreadsheet | void = await getSpreadsheet(client)
  if (!spreadsheet) {
    throw new u.PublicError('Spreadsheet not found')
  }

  const sheet = findSheetByTitle(spreadsheet.sheets, 'Accounts')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const frozenRows: number = sheet.properties.gridProperties.frozenRowCount || 0

  const rows: t.GRows = await getValues(
    client,
    `Accounts!A${frozenRows + 1}:G`
  )

  const accounts: t.Accounts = f.map(rows, rowToAccount)
  return accounts
}


function rowToAccount(row: t.GRow): t.Account {
  // TODO Think about casting to Number. Potentially footgun
  return {
    id          : row[0],
    title       : row[1],
    currencyCode: row[2],
    rubRate     : Number(row[3]),
    initial     : Number(row[4]),
    createdAt   : row[5],
    updatedAt   : row[6],
    row         : Number(row[7]),
  }
}

function accountToRow(account: t.Account): t.GRow {
  const date: Date = new Date()
  return [
    account.id           || '',
    account.title        || '',
    account.currencyCode || '',
    account.rubRate      || 1,
    account.initial      || 0,
    account.createdAt    || u.formatDateTime(date),
    u.formatDateTime(date),
  ]
}

function filterAccountsQuery(filter: t.Filter): string {
  const where = f.compact([
    filter.id ? `A = '${filter.id}'` : undefined,
  ]).join(' AND ')

  const query: string = `select * ${where ? 'where ' + where : ''} order by B desc`
  return query
}

/**
 * Categories
 */

export async function fetchCategories(client: t.GOAuth2Client): Promise<t.Categories> {
  const spreadsheet: t.GSpreadsheet | void = await getSpreadsheet(client)
  if (!spreadsheet) {
    throw new u.PublicError('Spreadsheet not found')
  }

  const sheet = findSheetByTitle(spreadsheet.sheets, 'Categories')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const frozenRows: number = sheet.properties.gridProperties.frozenRowCount || 0

  const rows: t.GRows = await getValues(
    client,
    `Categories!A${frozenRows + 1}:D`
  )

  const categories: t.Categories = f.map(rows, rowToCategory)
  return categories
}


function rowToCategory(row: t.GRow): t.Category {
  return {
    id          : row[0],
    title       : row[1],
    createdAt   : row[2],
    updatedAt   : row[3],
  }
}



/**
 * Payees
 */

export async function fetchPayees(client: t.GOAuth2Client): Promise<t.Payees> {
  const spreadsheet: t.GSpreadsheet | void = await getSpreadsheet(client)
  if (!spreadsheet) {
    throw new u.PublicError('Spreadsheet not found')
  }

  const sheet = findSheetByTitle(spreadsheet.sheets, 'Payees')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  const frozenRows: number = sheet.properties.gridProperties.frozenRowCount || 0

  const rows: t.GRows = await getValues(
    client,
    `Payees!A${frozenRows + 1}:D`
  )

  const payees: t.Payees = f.map(rows, rowToPayee)
  return payees
}


function rowToPayee(row: t.GRow): t.Payee {
  return {
    id          : row[0],
    title       : row[1],
    createdAt   : row[2],
    updatedAt   : row[3],
  }
}



/**
 * Transactions
 */

export async function fetchTransaction(client: t.GOAuth2Client, id: string): Promise<t.Transaction | void> {
  const spreadsheet: t.GSpreadsheet | void = await getSpreadsheet(client)
  if (!spreadsheet) {
    throw new u.PublicError('Spreadsheet not found')
  }

  const sheet = findSheetByTitle(spreadsheet.sheets, 'Transactions')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  // TODO Add return type
  const data = await querySheet(sheet.properties.sheetId, filterTransactionsQuery({id}))
  const filtered: t.Transactions = f.map(data.rows, row => rowToTransaction(queryRowToRow(row)))
  const result: t.Transaction | void = f.first(filtered)

  return result
}

export async function createTransaction(client: t.GOAuth2Client, transaction: t.Transaction): Promise<t.Transaction | void> {
  const rows: t.GRows = await appendValues(
    client,
    `Transactions!A:K`,
    [transactionToRow(transaction)]
  )
  const row: t.GRow | void = rows[0]

  if (!row) {
    throw new u.PublicError('Row not found')
  }

  const created: t.Transaction = rowToTransaction(row)
  return created
}

export async function updateTransaction(client: t.GOAuth2Client, id: string, transaction: t.Transaction): Promise<t.Transaction | void> {
  const spreadsheet: t.GSpreadsheet | void = await getSpreadsheet(client)
  if (!spreadsheet) {
    throw new u.PublicError('Spreadsheet not found')
  }

  const sheet = findSheetByTitle(spreadsheet.sheets, 'Transactions')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  // TODO Add return type
  const data = await querySheet(sheet.properties.sheetId, filterTransactionsQuery({id}))
  const filtered: t.Transactions = f.map(data.rows, row => rowToTransaction(queryRowToRow(row)))
  const toUpdate: t.Transaction | void = f.first(filtered)
  if (!toUpdate) {
    throw new u.PublicError('Transaction not found')
  }

  const rowNumber: number = toUpdate.row
  if (!rowNumber) {
    throw new u.PublicError('Row number not found')
  }

  const frozenRows: number = sheet.properties.gridProperties.frozenRowCount || 0

  const rows: t.GRows = await updateValues(
    client,
    `Transactions!A${frozenRows + rowNumber}:K${frozenRows + rowNumber}`,
    [transactionToRow({...toUpdate, ...transaction})]
  )

  const row: t.GRow | void = rows[0]
  if (!row) {
    throw new u.PublicError('Row not found')
  }

  const updated: t.Transaction = rowToTransaction(row)
  return updated
}

export async function deleteTransaction(client: t.GOAuth2Client, id: string): Promise<t.Transaction | void> {
  const spreadsheet: t.GSpreadsheet | void = await getSpreadsheet(client)
  if (!spreadsheet) {
    throw new u.PublicError('Spreadsheet not found')
  }

  const sheet = findSheetByTitle(spreadsheet.sheets, 'Transactions')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  // TODO Add return type
  const sheetId = sheet.properties.sheetId
  const data = await querySheet(sheetId, filterTransactionsQuery({id}))
  const filtered: t.Transactions = f.map(data.rows, row => rowToTransaction(queryRowToRow(row)))
  const toDelete: t.Transaction | void = f.first(filtered)
  if (!toDelete) {
    throw new u.PublicError('Transaction not found')
  }

  const rowNumber: number = toDelete.row
  if (!rowNumber) {
    throw new u.PublicError('Row number not found')
  }

  const frozenRows: number = sheet.properties.gridProperties.frozenRowCount || 0

  const requests: t.GRequests = [{
    deleteDimension: {
      range: {
        sheetId,
        dimension: 'ROWS',
        startIndex: frozenRows + rowNumber - 1,
        endIndex: frozenRows + rowNumber,
      },
    },
  }]

  await batchUpdateSpreadsheet(client, requests)

  return toDelete
}

export async function fetchTransactions(client: t.GOAuth2Client, filter: t.Filter): Promise<t.Transactions> {
  const spreadsheet: t.GSpreadsheet | void = await getSpreadsheet(client)
  if (!spreadsheet) {
    throw new u.PublicError('Spreadsheet not found')
  }

  const sheet = findSheetByTitle(spreadsheet.sheets, 'Transactions')
  if (!sheet) {
    throw new u.PublicError('Sheet not found')
  }

  // TODO Add return type
  const data = await querySheet(sheet.properties.sheetId, filterTransactionsQuery(filter))
  const filtered: t.Transactions = f.map(data.rows, row => rowToTransaction(queryRowToRow(row)))

  return filtered
}


// TODO Better name
function queryRowToRow(queryRow) {
  return f.map(queryRow.c, col => col ? (col.f || col.v) : undefined)
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

function filterTransactionsQuery(filter: t.Filter): string {
  const where = f.compact([
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

  const query: string = `select * ${where ? 'where ' + where : ''} order by B desc, J desc`
  return query
}



/**
 * Utils
 */

export function getSpreadsheet(client: t.GOAuth2Client, ranges: ?string): Promise<t.GSpreadsheet | void> {
  const options = {
    spreadsheetId: SPREADSHEET_ID,
    ranges,
  }

  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.get(options, (err, res) => {
      if (err) if (err) throw Error(err)
      resolve(res.data)
    })
  })
}

export function batchUpdateSpreadsheet(client: t.GOAuth2Client, requests: t.GRequests): Promise<any> {
  const options: t.GBatchRequest = {
    spreadsheetId: SPREADSHEET_ID,
    resource: {requests},
  }

  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.batchUpdate(options, (err, res) => {
      if (err) if (err) throw Error(err)
      resolve(res.data.replies)
    })
  })
}


export function getValues(client: t.GOAuth2Client, range: string): Promise<t.GRows> {
  const options: t.GValuesRequest = {
    spreadsheetId: SPREADSHEET_ID,
    range,
  }

  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.values.get(options, (err, res) => {
      if (err) throw Error(err)
      resolve(res.data.values)
    })
  })
}

export function clearValues(client: t.GOAuth2Client, range: string): Promise<void> {
  const options: t.GValuesRequest = {
    spreadsheetId: SPREADSHEET_ID,
    range,
  }

  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.values.clear(options, err => {
      if (err) if (err) throw Error(err)
      resolve()
    })
  })
}

export function appendValues(client: t.GOAuth2Client, range: string, values: t.GRow): Promise<t.GRows> {
  const options: t.GValuesRequest = {
    spreadsheetId: SPREADSHEET_ID,
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

export function updateValues(client: t.GOAuth2Client, range: string, values: t.GRow): Promise<t.GRows> {
  const options: t.GValuesRequest = {
    spreadsheetId: SPREADSHEET_ID,
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


function findSheetByTitle(sheets: Array<t.GSheet>, title: string): t.GSheet | void {
  return f.find(sheets, sheet => sheet.properties.title === title)
}

// TODO Add return type
async function querySheet(sheetId: number, query: string | void) {
  const encodedQuery: string = encodeURIComponent(query || '')
  const url: string = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tq=${encodedQuery}&gid=${sheetId}`

  return await u.fetch({url}).then(({body}) => {
    const matches = body && body.match(/google\.visualization\.Query\.setResponse\((.*)\);$/)
    const match = matches && matches[1]

    if (!match) return undefined

    const json = JSON.parse(match)

    if (!json) return undefined

    return json.table
  })
}
