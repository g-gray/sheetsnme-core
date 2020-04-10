import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'
import uuid from 'uuid/v4'

import * as u from '../utils'
import * as tr from '../translations'

import * as ss from '../sheet/sheets'
import * as sn from '../sheet/net'
import * as en from '../entity/net'

/**
 * Accounts
 */

export async function fetchAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Account | void> {
  const result: t.Account | void = await en.queryEntityById<t.Account>(
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
  account      : t.Account,
): Promise<t.Account> {
  const result: t.Account = await en.createEntity<t.Account>(
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
  account      : t.Account,
): Promise<t.Account> {
  const result: t.Account = await en.updateEntityById<t.Account>(
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
): Promise<t.Account> {
  const result: t.Account = await en.deleteEntityById<t.Account>(
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
): Promise<t.Accounts> {
  const result: t.Accounts = await en.queryEntities<t.Account>(
    client,
    spreadsheetId,
    ss.ACCOUNTS_SHEET_ID,
    rowToAccount,
    `
    select *
    where A != 'id' and A !='${ss.DEBT_ACCOUNT_ID}'
    `
  )
  return result
}


function rowToAccount(row: t.GQueryRow): t.Account {
  return {
    id          : row.c[0] ? String(row.c[0].v) : '',
    title       : row.c[1] ? String(row.c[1].v) : '',
    currencyCode: row.c[2] ? String(row.c[2].v) : '',
    createdAt   : row.c[3] ? String(row.c[3].v) : '',
    updatedAt   : row.c[4] ? String(row.c[4].v) : '',
    row         : row.c[5] ? Number(row.c[5].v) : 0,
  }
}

function accountToRow(account: t.Account): t.GRowData {
  const date: string = new Date().toJSON()
  const createdAt: string = account.createdAt
    ? new Date(account.createdAt).toJSON()
    : date
  return {
    values: [
      {userEnteredValue: {stringValue: account.id}},
      {userEnteredValue: {stringValue: account.title}},
      {userEnteredValue: {stringValue: account.currencyCode}},
      {userEnteredValue: {stringValue: createdAt}},
      {userEnteredValue: {stringValue: date}},
    ],
  }
}


export async function fetchBalancesByAccountIds(
  client: t.GOAuth2Client,
  spreadsheetId: string,
  accountIds: string[],
): Promise<t.BalancesById> {
  const outcomeIdsCond: string = fpx.map(
    accountIds,
    (id: string) => `F = '${id}'`
  ).join(' OR ')
  const outcomeTable: t.GQueryTable | void = await sn.querySheet(
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    `
    select F, sum(G)
    where ${outcomeIdsCond}
    group by F
    `,
  )
  const outcomeBalances: t.BalancesById = outcomeTable
    ? fpx.keyBy(
      fpx.map(outcomeTable.rows, rowToBalance),
      (balance: t.Balance) => balance.accountId
    )
    : {}

  const incomeIdsCond: string = fpx.map(
    accountIds,
    (id: string) => `H = '${id}'`
  ).join(' OR ')
  const incomeTable: t.GQueryTable | void = await sn.querySheet(
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    `
    select H, sum(I)
    where ${incomeIdsCond}
    group by H
    `,
  )
  const incomeBalances: t.BalancesById = incomeTable
    ? fpx.keyBy(
      fpx.map(incomeTable.rows, rowToBalance),
      (balance: t.Balance) => balance.accountId)
    : {}

  const ids = fpx.uniq(fpx.concat(fpx.keys(outcomeBalances), fpx.keys(incomeBalances)))

  const result: t.BalancesById = fpx.fold(
    ids,
    {},
    (acc: t.BalancesById, id: string) => {
      const incomeBalance: t.Balance | void = incomeBalances[id]
      const income = incomeBalance ? incomeBalance.balance : 0
      const outcomeBalance: t.Balance | void = outcomeBalances[id]
      const outcome = outcomeBalance ? outcomeBalance.balance : 0

      return {
        ...acc,
        [id]: {
          accountId: id,
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
    errors.push({text: u.xln(lang, tr.TITLE_MUST_BE_NON_EMPTY_STRING)})
  }

  return errors
}

export function accountToFields(account: t.Account): t.AccountFields {
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

export function fieldsToAccount(fields: t.AccountFields): t.Account {
  const {
    id,
    title,
    currencyCode,
    createdAt,
    updatedAt,
  }: t.AccountFields = fields

  return {
    id          : id || uuid(),
    title       : title || '',
    currencyCode: currencyCode || '',
    createdAt,
    updatedAt,
  }
}
