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
): Promise<t.Payee | void> {
  const result: t.Payee | void = await en.queryEntityById<t.Payee>(
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
  payee        : t.Payee
): Promise<t.Payee> {

  const result: t.Payee = await en.createEntity<t.Payee>(
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
  payee        : t.Payee
): Promise<t.Payee> {
  const result: t.Payee = await en.updateEntityById<t.Payee>(
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
): Promise<t.Payee> {
  const result: t.Payee = await en.deleteEntityById<t.Payee>(
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
): Promise<t.Payees> {
  const result: t.Payees = await en.queryEntities<t.Payee>(
    client,
    spreadsheetId,
    ss.PAYEES_SHEET_ID,
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
  const loansTable: t.GQueryTable | void = await sn.querySheet(
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

  const borrowsTable: t.GQueryTable | void = await sn.querySheet(
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


export function validatePayeeFields(fields: any, lang: t.Lang): t.ValidationErrors {
  const errors: t.ValidationErrors = []
  const {title} = fields

  if (!fpx.isString(title) || !title.length) {
    errors.push({text: u.xln(lang, tr.TITLE_MUST_BE_NON_EMPTY_STRING)})
  }

  return errors
}

export function payeeToFields(payee: t.Payee): t.PayeeFields {
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

export function fieldsToPayee(fields: t.PayeeFields): t.Payee {
  const {
    id,
    title,
  }: t.PayeeFields = fields

  return {
    id   : id || uuid(),
    title: title || '',
  }
}
