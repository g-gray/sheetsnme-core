// @flow
import {google} from 'googleapis'
import * as f from 'fpx'
import * as t from './types'
import * as e from './env'

const {SPREADSHEET_ID} = e.properties

const TXS_FRX_ROWS         : number = 1
const FILTERED_TXS_FRZ_ROWS: number = 2

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
 * Transactions
 */

export async function fetchTransaction(client: t.GOAuth2Client, id: string): Promise<t.Transaction | void> {
  await updateValues(
    client,
    `FilteredTransactions!A1:L1`,
    [['', id, '', '', '', '', '', '', '', '', '', '']]
  )

  const filteredRows: t.GRows = await fetchValues(
    client,
    `FilteredTransactions!A${FILTERED_TXS_FRZ_ROWS + 1}:L${FILTERED_TXS_FRZ_ROWS + 1}`
  )
  const filteredRow: t.GRow | void = filteredRows[0]

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
    `FilteredTransactions!A1:L1`,
    [['', id, '', '', '', '', '', '', '', '', '', '']]
  )

  const filteredRows: t.GRows = await fetchValues(
    client,
    `FilteredTransactions!A${FILTERED_TXS_FRZ_ROWS + 1}:L${FILTERED_TXS_FRZ_ROWS + 1}`
  )
  const filteredRow: t.GRow | void = filteredRows[0]

  if (!filteredRow) {
    // TODO Throw an error
    return undefined
  }

  const txRowNumber: number = Number(filteredRow[0])

  if (!txRowNumber) {
    // TODO Throw an error
    return undefined
  }

  const txRows: t.GRows = await updateValues(
    client,
    `Transactions!A${TXS_FRX_ROWS + txRowNumber}:K${TXS_FRX_ROWS + txRowNumber}`,
    [transactionToRow(tx)]
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
    `FilteredTransactions!A1:L1`,
    [['', id, '', '', '', '', '', '', '', '', '', '']]
  )

  const filteredRows: t.GRows = await fetchValues(
    client,
    `FilteredTransactions!A${FILTERED_TXS_FRZ_ROWS + 1}:L${FILTERED_TXS_FRZ_ROWS + 1}`
  )
  const filteredRow: t.GRow | void = filteredRows[0]

  if (!filteredRow) {
    // TODO Throw an error
    return undefined
  }

  const deletedTx: t.Transaction = filteredRowToTransaction(filteredRow)
  const txRowNumber: number = Number(filteredRow[0])

  if (!txRowNumber) {
    // TODO Throw an error
    return undefined
  }

  await clearValues(
    client,
    `Transactions!A${TXS_FRX_ROWS + txRowNumber}:K${TXS_FRX_ROWS + txRowNumber}`,
  )

  return deletedTx
}

export async function fetchTransactions(client: t.GOAuth2Client, filter: t.Filter): Promise<t.Transactions> {
  await updateValues(
    client,
    `FilteredTransactions!A1:L1`,
    [['',
      filter.id             || '',
      filter.date           || '',
      filter.category       || '',
      filter.payee          || '',
      filter.comment        || '',
      filter.outcomeAccount || '',
      filter.outcomeAmount  || '',
      filter.incomeAccount  || '',
      filter.incomeAmount   || '',
      filter.createdAt      || '',
      filter.changedAt      || '',
    ]]
  )

  const filteredRows: t.GRows = await fetchValues(
    client,
    `FilteredTransactions!A${FILTERED_TXS_FRZ_ROWS + 1}:L`
  )

  const filteredTxs: t.Transactions = f.map(filteredRows, filteredRowToTransaction)
  return filteredTxs
}



/**
 * Utils
 */

export function fetchValues(client: t.GOAuth2Client, range: string): Promise<t.GRows> {
  const options: t.GReqOptions = {
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
  const options: t.GReqOptions = {
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
  const options: t.GReqOptions = {
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
  const options: t.GReqOptions = {
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

function filteredRowToTransaction(row: t.GRow): t.Transaction {
  // We slice the filtered row here, because it contains a row number as the first element
  return rowToTransaction(row.slice(1))
}

function rowToTransaction(row: t.GRow): t.Transaction {
  return {
    id                : row[0],
    date              : row[1],
    category          : row[2],
    payee             : row[3],
    comment           : row[4],
    accountOutcome    : row[5],
    amountOutcome     : row[6],
    accountIncome     : row[7],
    amountIncome      : row[8],
    createdAt         : row[9],
    updatedAt         : row[10],
  }
}

function transactionToRow(tx: t.Transaction): t.GRow {
  return [
    tx.id,
    tx.date,
    tx.category,
    tx.payee,
    tx.comment,
    tx.accountOutcome,
    tx.accountIncome,
    tx.amountOutcome,
    tx.amountIncome,
    tx.createdAt,
    tx.updatedAt,
  ]
}
