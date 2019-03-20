// @flow
import {google} from 'googleapis'
import * as f from 'fpx'
import * as t from './types'
import * as e from './env'

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
 * Transactions
 */

export async function fetchTransactionById(client: t.GOAuth2Client, id: string): Promise<t.Transaction | void> {
  const updateOptions: t.GReqOptions = {
    spreadsheetId: SPREADSHEET_ID,
    range: `Transactions!A1`,
    valueInputOption: 'RAW',
    resource: {
      values: [[id]],
    },
  }
  await updateValues(client, updateOptions)

  const fetchTxOptions: t.GReqOptions = {
    spreadsheetId: SPREADSHEET_ID,
    range: `Transactions!A3:K3`,
  }
  const rows: t.GRows | void = await fetchValues(client, fetchTxOptions)
  const row: t.GRow | void = f.first(rows)

  if (typeof row === 'undefined') {
    return undefined
  }

  const tx: t.Transaction = rowToTransaction(row)
  return tx
}

export async function fetchTransactions(client: t.GOAuth2Client): Promise<t.Transactions> {
  const fetchTxOptions: t.GReqOptions = {
    spreadsheetId: SPREADSHEET_ID,
    range: `Transactions!A5:K`,
  }
  const rows: t.GRows | void = await fetchValues(client, fetchTxOptions)
  const txs: t.Transactions = f.map(rows, rowToTransaction)
  return txs
}



/**
 * Utils
 */

export function fetchValues(client: t.GOAuth2Client, options: t.GReqOptions): Promise<t.GRows | void> {
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

export function appendValues(client: t.GOAuth2Client, options: t.GReqOptions): Promise<any> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.values.append(options, (err, res) => {
      if (err) if (err) throw Error(err)
      resolve(res.data.updates.updatedData)
    })
  })
}

export function updateValues(client: t.GOAuth2Client, options: t.GReqOptions): Promise<any> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.values.update(options, (err, res) => {
      if (err) if (err) throw Error(err)
      resolve(res.data.updatedData)
    })
  })
}

function rowToTransaction(row: t.GRow): t.Transaction {
  return {
    id: row[0],
    date: row[1],
    category: row[2],
    payee: row[3],
    comment: row[4],
    accountOutcome: row[5],
    accountIncome: row[6],
    amountOutcome: row[7],
    amountIncome: row[8],
    createdAt: row[9],
    updatedAt: row[10],
  }
}
