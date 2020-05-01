import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'
import uuid from 'uuid/v4'

import * as u from '../utils'
import * as tr from '../translations'

import * as ss from '../sheet/sheets'
import * as sn from '../sheet/net'
import * as en from '../entity/net'

export async function fetchPayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<void | t.PayeeResult> {
  const result: void | t.PayeeResult = await en.queryEntityById<t.PayeeResult>(
    client,
    spreadsheetId,
    ss.PAYEES_SHEET_ID,
    id,
    rowToPayee,
  )
  return result
}

export async function createPayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  payee        : t.PayeeQuery
): Promise<t.PayeeResult> {

  const result: t.PayeeResult = await en.createEntity<t.PayeeQuery, t.PayeeResult>(
    client,
    spreadsheetId,
    ss.PAYEES_SHEET_ID,
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
  payee        : t.PayeeQuery
): Promise<t.PayeeResult> {
  const result: t.PayeeResult = await en.updateEntityById<t.PayeeReq, t.PayeeResult>(
    client,
    spreadsheetId,
    ss.PAYEES_SHEET_ID,
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
): Promise<t.PayeeResult> {
  const result: t.PayeeResult = await en.deleteEntityById<t.PayeeResult>(
    client,
    spreadsheetId,
    ss.PAYEES_SHEET_ID,
    id,
    rowToPayee,
  )
  return result
}

export async function fetchPayees(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
): Promise<t.PayeeResult[]> {
  const result: t.PayeeResult[] = await en.queryEntities<t.PayeeResult>(
    client,
    spreadsheetId,
    ss.PAYEES_SHEET_ID,
    rowToPayee,
    `select * where A != 'id' order by B`
  )
  return result
}


function rowToPayee(row: t.GQueryRow): t.PayeeRowDataResult {
  return {
    id          : row.c[0] ? String(row.c[0].v) : '',
    title       : row.c[1] ? String(row.c[1].v) : '',
    createdAt   : row.c[2] ? String(row.c[2].v) : '',
    updatedAt   : row.c[3] ? String(row.c[3].v) : '',
    row         : row.c[4] ? Number(row.c[4].v) : 0,
  }
}

function payeeToRow(rowData: t.PayeeRowDataQuery): t.GRowData {
  return {
    values: [
      {userEnteredValue: {stringValue: rowData.id}},
      {userEnteredValue: {stringValue: rowData.title}},
      {userEnteredValue: {stringValue: rowData.createdAt}},
      {userEnteredValue: {stringValue: rowData.updatedAt}},
    ],
  }
}


export async function fetchDebtsByPayeeIds(
  client: t.GOAuth2Client,
  spreadsheetId: string,
  payeeIds: string[],
): Promise<t.DebtsById> {
  const loansTable: void | t.GQueryTable = await sn.querySheet(
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    `
    select D, sum(G)
    where F = '${ss.DEBT_ACCOUNT_ID}'
    group by D
    `,
  )
  const loanDebts: t.DebtsById = loansTable
    ? fpx.keyBy(
        fpx.map(loansTable.rows, rowToDebt),
        (debt: t.Debt) => debt.payeeId
      )
    : {}

  const borrowsTable: void | t.GQueryTable = await sn.querySheet(
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    `
    select D, sum(I)
    where H = '${ss.DEBT_ACCOUNT_ID}'
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
      const borrowDebt: void | t.Debt = borrowDebts[id]
      const borrowAmount = borrowDebt ? borrowDebt.debt : 0

      const loanDebt: void | t.Debt = loanDebts[id]
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


export function validatePayeeFields(fields: any, lang: t.Lang): t.ValidationErrors {
  const errors: t.ValidationErrors = []
  const {title} = fields

  if (!fpx.isString(title) || !title.length) {
    errors.push({text: u.xln(lang, tr.TITLE_MUST_BE_NON_EMPTY_STRING)})
  }

  return errors
}

export function payeeToFields(payee: t.PayeeResult): t.PayeeRes {
  const {
    id,
    title,
    createdAt,
    updatedAt,
  } = payee

  return {
    id,
    title,
    createdAt,
    updatedAt,
  }
}

export function fieldsToPayee(fields: t.PayeeReq): t.PayeeQuery {
  const {
    id,
    title,
    createdAt,
    updatedAt,
  } = fields

  return {
    id,
    title,
    createdAt,
    updatedAt,
  }
}
