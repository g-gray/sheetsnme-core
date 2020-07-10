import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as u from '../utils'
import * as i18n from '../i18n'

import * as ss from '../sheet/sheets'
import * as sn from '../sheet/net'
import * as en from '../entity/net'

/**
 * Account
 */

export async function fetchAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<void | t.AccountResult> {
  const result: void | t.AccountResult = await en.queryEntityById<t.AccountResult>(
    client,
    spreadsheetId,
    ss.ACCOUNTS_SHEET_ID,
    id,
    rowToAccount,
  )
  return result
}

export async function createAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  account      : t.AccountQuery,
): Promise<t.AccountResult> {
  const result: t.AccountResult = await en.createEntity<t.AccountQuery, t.AccountResult>(
    client,
    spreadsheetId,
    ss.ACCOUNTS_SHEET_ID,
    account,
    accountToRow,
    rowToAccount,
  )
  return result
}

export async function updateAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  account      : t.AccountQuery,
): Promise<t.AccountResult> {
  const result: t.AccountResult = await en.updateEntityById<t.AccountQuery, t.AccountResult>(
    client,
    spreadsheetId,
    ss.ACCOUNTS_SHEET_ID,
    id,
    account,
    accountToRow,
    rowToAccount,
  )
  return result
}

export async function deleteAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.AccountResult> {
  const result: t.AccountResult = await en.deleteEntityById<t.AccountResult>(
    client,
    spreadsheetId,
    ss.ACCOUNTS_SHEET_ID,
    id,
    rowToAccount,
  )
  return result
}

export async function fetchAccounts(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
): Promise<t.AccountResult[]> {
  const result: t.AccountResult[] = await en.queryEntities<t.AccountResult>(
    client,
    spreadsheetId,
    ss.ACCOUNTS_SHEET_ID,
    rowToAccount,
    `
    SELECT *
    WHERE A != 'id' and A !='${ss.DEBT_ACCOUNT_ID}'
    `
  )
  return result
}


function rowToAccount(row: t.GQueryRow): t.AccountRowDataResult {
  return {
    id          : row.c[0] ? String(row.c[0].v) : '',
    title       : row.c[1] ? String(row.c[1].v) : '',
    currencyCode: row.c[2] ? String(row.c[2].v) : '',
    createdAt   : row.c[3] ? String(row.c[3].v) : '',
    updatedAt   : row.c[4] ? String(row.c[4].v) : '',
    row         : row.c[5] ? Number(row.c[5].v) : 0,
  }
}

function accountToRow(rowData: t.AccountRowDataQuery): t.GRowData {
  return {
    values: [
      {userEnteredValue: {stringValue: rowData.id}},
      {userEnteredValue: {stringValue: rowData.title}},
      {userEnteredValue: {stringValue: rowData.currencyCode || t.CURRENCY.RUB}},
      {userEnteredValue: {stringValue: rowData.createdAt}},
      {userEnteredValue: {stringValue: rowData.updatedAt}},
    ],
  }
}



/**
 * Balance
 */

export async function fetchBalancesByAccountId(
  spreadsheetId: string,
): Promise<t.BalancesByCategoryId> {
  const outcomeBalancesTable: void | t.GQueryTable = await sn.querySheet(
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    `
    SELECT F, sum(G)
    GROUP BY F
    `,
  )
  let outcomeBalancesByCategoryId: t.BalancesByCategoryId = {}
  if (outcomeBalancesTable) {
    outcomeBalancesByCategoryId = fpx.keyBy(
      outcomeBalancesTable.rows.map(rowToBalance),
      (balance: t.Balance) => balance.accountId
    )
  }

  const incomeBalancesTable: void | t.GQueryTable = await sn.querySheet(
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    `
    SELECT H, sum(I)
    GROUP BY H
    `,
  )
  let incomeBalancesById: t.BalancesByCategoryId = {}
  if (incomeBalancesTable) {
    incomeBalancesById = fpx.keyBy(
      incomeBalancesTable.rows.map(rowToBalance),
      (balance: t.Balance) => balance.accountId
    )
  }

  const accountIds: string[] = fpx.uniq(fpx.concat(
    fpx.keys(outcomeBalancesByCategoryId),
    fpx.keys(incomeBalancesById)
  ))

  const result: t.BalancesByCategoryId = fpx.fold(
    accountIds,
    {},
    (acc: t.BalancesByCategoryId, accountId: string) => {
      const income = incomeBalancesById[accountId]
        ? incomeBalancesById[accountId].balance
        : 0
      const outcome = outcomeBalancesByCategoryId[accountId]
        ? outcomeBalancesByCategoryId[accountId].balance
        : 0

      return {
        ...acc,
        [accountId]: {
          accountId,
          balance: u.round(income - outcome, 2),
        },
      }
  })

  return result
}


function rowToBalance(row: t.GQueryRow): t.Balance {
  return {
    accountId: row.c[0] ? String(row.c[0].v) : '',
    balance  : row.c[1] ? Number(row.c[1].v) : 0,
  }
}



export function validateAccountFields(fields: any, lang: t.Lang): t.ValidationErrors {
  const errors: t.ValidationErrors = []
  const {title} = fields

  if (!fpx.isString(title) || !title.length) {
    errors.push({text: i18n.xln(lang, i18n.TITLE_MUST_BE_NON_EMPTY_STRING)})
  }

  return errors
}

export function accountToFields(account: t.AccountResult): t.AccountRes {
  const {
    id,
    title,
    currencyCode,
    createdAt,
    updatedAt,
  } = account

  return {
    id,
    title,
    currencyCode,
    createdAt,
    updatedAt,
  }
}

export function fieldsToAccount(fields: t.AccountReq): t.AccountQuery {
  const {
    id,
    title,
    currencyCode,
    createdAt,
    updatedAt,
  }: t.AccountReq = fields

  return {
    id,
    title,
    currencyCode,
    createdAt,
    updatedAt,
  }
}
