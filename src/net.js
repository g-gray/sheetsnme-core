// @flow
import {google} from 'googleapis'
import * as f from 'fpx'
import * as t from './types'
import * as e from './env'
import * as u from './utils'

const {SPREADSHEET_ID} = e.properties

const TXS_FRZ_ROWS         : number = 1
const FILTERED_TXS_FRZ_ROWS: number = 1
const ACCOUNTS_FRZ_ROWS    : number = 1
const CATEGORIES_FRZ_ROWS  : number = 1
const PAYEES_FRZ_ROWS      : number = 1

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

export async function fetchAccounts(client: t.GOAuth2Client): Promise<t.Accounts> {
  const rows: t.GRows = await fetchValues(
    client,
    `Accounts!A${ACCOUNTS_FRZ_ROWS + 1}:G`
  )

  const accounts: t.Accounts = f.map(rows, rowToAccount)
  return accounts
}


function rowToAccount(row: t.GRow): t.Account {
  return {
    id          : row[0],
    title       : row[1],
    currencyCode: row[2],
    rubRate     : row[3],
    initial     : row[4],
    createdAt   : row[5],
    updatedAt   : row[6],
  }
}



/**
 * Categories
 */

export async function fetchCategories(client: t.GOAuth2Client): Promise<t.Categories> {
  const rows: t.GRows = await fetchValues(
    client,
    `Categories!A${CATEGORIES_FRZ_ROWS + 1}:D`
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
  const rows: t.GRows = await fetchValues(
    client,
    `Payees!A${PAYEES_FRZ_ROWS + 1}:D`
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
  await updateValues(
    client,
    `FilteredTransactions!B2`,
    [[filteredTransactionsQuery({id})]]
  )

  const filteredRows: t.GRows = await fetchValues(
    client,
    `FilteredTransactions!A${FILTERED_TXS_FRZ_ROWS + 1}:L${FILTERED_TXS_FRZ_ROWS + 1}`
  )
  const filteredRow: t.GRow | void = f.first(filteredRows)

  if (!filteredRow) {
    // TODO Throw an error
    return undefined
  }

  const resultTx: t.Transaction = filteredRowToTransaction(filteredRow)
  return resultTx
}

export async function createTransaction(client: t.GOAuth2Client, tx: t.Transaction): Promise<t.Transaction | void> {
  const txRows: t.GRows = await appendValues(
    client,
    `Transactions!A:K`,
    [transactionToRow(tx)]
  )
  const txRow: t.GRow | void = txRows[0]

  if (!txRow) {
    // TODO Throw an error
    return undefined
  }

  const createdTx: t.Transaction = rowToTransaction(txRow)
  return createdTx
}

export async function updateTransaction(client: t.GOAuth2Client, id: string, tx: t.Transaction): Promise<t.Transaction | void> {
  await updateValues(
    client,
    `FilteredTransactions!B2`,
    [[filteredTransactionsQuery({id})]]
  )

  const filteredRows: t.GRows = await fetchValues(
    client,
    `FilteredTransactions!A${FILTERED_TXS_FRZ_ROWS + 1}:L${FILTERED_TXS_FRZ_ROWS + 1}`
  )
  const filteredRow: t.GRow | void = f.first(filteredRows)

  if (!filteredRow) {
    // TODO Throw an error
    return undefined
  }

  const txRowNumber: number = Number(filteredRow[0]) + TXS_FRZ_ROWS
  const txToUpdate: t.Transaction = filteredRowToTransaction(filteredRow)

  if (!txRowNumber) {
    // TODO Throw an error
    return undefined
  }

  const txRows: t.GRows = await updateValues(
    client,
    `Transactions!A${TXS_FRZ_ROWS + txRowNumber}:K${TXS_FRZ_ROWS + txRowNumber}`,
    [transactionToRow({...txToUpdate, ...tx})]
  )
  const txRow: t.GRow | void = txRows[0]

  if (!txRow) {
    // TODO Throw an error
    return undefined
  }

  const updatedTx: t.Transaction = rowToTransaction(txRow)
  return updatedTx
}

export async function deleteTransaction(client: t.GOAuth2Client, id: string): Promise<t.Transaction | void> {
  await updateValues(
    client,
    `FilteredTransactions!B2`,
    [[filteredTransactionsQuery({id})]]
  )

  const filteredRows: t.GRows = await fetchValues(
    client,
    `FilteredTransactions!A${FILTERED_TXS_FRZ_ROWS + 1}:L${FILTERED_TXS_FRZ_ROWS + 1}`
  )

  const filteredRow: t.GRow | void = f.first(filteredRows)

  if (!filteredRow) {
    // TODO Throw an error
    return undefined
  }

  const deletedTx: t.Transaction = filteredRowToTransaction(filteredRow)
  const txRowNumber: number = Number(filteredRow[0]) + TXS_FRZ_ROWS

  if (!txRowNumber) {
    // TODO Throw an error
    return undefined
  }

  const requests: t.GRequests = [{
    deleteDimension: {
      range: {
        sheetId: 0,
        dimension: 'ROWS',
        startIndex: txRowNumber - 1,
        endIndex: txRowNumber,
      },
    },
  }]

  await batchUpdate(client, requests)

  return deletedTx
}

export async function fetchTransactions(client: t.GOAuth2Client, filter: t.Filter): Promise<t.Transactions> {
  await updateValues(
    client,
    `FilteredTransactions!B2`,
    [[filteredTransactionsQuery(filter)]]
  )

  const filteredRows: t.GRows = await fetchValues(
    client,
    `FilteredTransactions!A${FILTERED_TXS_FRZ_ROWS + 1}:L`
  )

  const filteredTxs: t.Transactions = f.map(filteredRows, filteredRowToTransaction)
  return filteredTxs
}


function filteredRowToTransaction(row: t.GRow): t.Transaction {
  // We slice the filtered row here, because it contains a row number as the first element
  return rowToTransaction(row.slice(1))
}

function rowToTransaction(row: t.GRow): t.Transaction {
  return {
    id                : row[0],
    date              : row[1],
    categoryId        : row[2],
    payeeId           : row[3],
    comment           : row[4],
    outcomeAccountId  : row[5],
    outcomeAmount     : row[6],
    incomeAccountId   : row[7],
    incomeAmount      : row[8],
    createdAt         : row[9],
    updatedAt         : row[10],
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

function filteredTransactionsQuery(filter: t.Filter): string {
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
  ]).join(' AND\n    ')

  return query(
    `Transactions!A${TXS_FRZ_ROWS + 1}:K`,
    `
    select *
    ${where ? 'where\n    ' + where : ''}
    order by B, J desc`,
  )
}


/**
 * Utils
 */

export function fetchValues(client: t.GOAuth2Client, range: string): Promise<t.GRows> {
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

export function appendValues(client: t.GOAuth2Client, range: string, values: t.GRow): Promise<any> {
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

export function updateValues(client: t.GOAuth2Client, range: string, values: t.GRow): Promise<any> {
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


export function batchUpdate(client: t.GOAuth2Client, requests: t.GRequests): Promise<any> {
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



function query(range: string, query: string):string {
  // TODO handle #VALUE! gsheets error
  return `=IFNA(QUERY(${range}, "${query}", -1), "")`
}
