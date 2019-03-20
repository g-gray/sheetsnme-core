// @flow
import {google} from 'googleapis'
import * as f from 'fpx'
import * as t from './types'
import * as e from './env'

const {SPREADSHEET_ID} = e.properties

const TX_ROWS_OFFSET: number = 4

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
  await updateValues(client, `Transactions!A1`, [[id]])

  const rows: t.GRows = await fetchValues(client, `Transactions!A3:K3`)
  const row: t.GRow | void = rows[0]

  if (!row) {
    // TODO Throw an error
    return undefined
  }

  const tx: t.Transaction = rowToTransaction(row)
  return tx
}

export async function createTransaction(client: t.GOAuth2Client, tx: t.Transaction): Promise<t.Transaction | void> {
  console.info(`createTransaction`)
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

  const resultTx: t.Transaction = rowToTransaction(txRow)
  return resultTx
}

export async function updateTransaction(client: t.GOAuth2Client, id: string, tx: t.Transaction): Promise<t.Transaction | void> {
  await updateValues(client, `Transactions!A1`, [[id]])

  const txIndexRows: t.GRows = await fetchValues(client, `Transactions!A2:K2`)
  const txIndexRow: t.GRow | void = txIndexRows[0]

  if (!txIndexRow) {
    // TODO Throw an error
    return undefined
  }

  const txIndex: number = Number(txIndexRow)
  const txRows: t.GRows = await updateValues(
    client,
    `Transactions!A${TX_ROWS_OFFSET + txIndex}:K${TX_ROWS_OFFSET + txIndex}`,
    [transactionToRow(tx)]
  )
  const txRow: t.GRow | void = txRows[0]

  if (!txRow) {
    // TODO Throw an error
    return undefined
  }

  const resultTx: t.Transaction = rowToTransaction(txRow)
  console.info(`resultTx:`, resultTx)
  return resultTx
}

export async function fetchTransactions(client: t.GOAuth2Client): Promise<t.Transactions> {
  const rows: t.GRows = await fetchValues(client, `Transactions!A5:K`)
  const txs: t.Transactions = f.map(rows, rowToTransaction)
  return txs
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

export function clearValues(client: t.GOAuth2Client, options: t.GReqOptions): Promise<any> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.values.clear(options, (err, res) => {
      if (err) if (err) throw Error(err)
      resolve(res.data.clearedRange)
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
      resolve(res.data.updates.updatedData)
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

function rowToTransaction(row: t.GRow): t.Transaction {
  return {
    id            : row[0],
    date          : row[1],
    category      : row[2],
    payee         : row[3],
    comment       : row[4],
    accountOutcome: row[5],
    accountIncome : row[6],
    amountOutcome : row[7],
    amountIncome  : row[8],
    createdAt     : row[9],
    updatedAt     : row[10],
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
