import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as u from '../utils'
import * as tr from '../translations'

import * as ss from '../sheet/sheets'
import * as sn from '../sheet/net'
import * as en from '../entity/net'

/**
 * Account
 */

export async function fetchAccountWithBalance(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<void | t.AccountWithBalanceResult> {
  const account: void | t.AccountResult = await fetchAccount(
    client,
    spreadsheetId,
    id
  )
  if (!account) {
    return undefined
  }

  const balances: t.BalancesById = await fetchBalancesByAccountIds(
    client,
    spreadsheetId,
    [account.id]
  )
  const accountWithBalance: t.AccountWithBalanceResult = {
    ...account,
    balance: balances[account.id] ? balances[account.id].balance : 0,
  }
  return accountWithBalance
}

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

export async function fetchAccountsWithBalance(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
): Promise<t.AccountWithBalanceResult[]> {
  const accounts: t.AccountResult[] = await fetchAccounts(client, spreadsheetId)
  const accountIds: string[] = accounts.map((account: t.AccountResult) => account.id)
  const balances: t.BalancesById = await fetchBalancesByAccountIds(
    client,
    spreadsheetId,
    accountIds
  )
  const accountsWithBalance: t.AccountWithBalanceResult[] = fpx.map(
    accounts,
    (account: t.AccountResult) => ({
      ...account,
      balance: balances[account.id] ? balances[account.id].balance : 0,
    })
  )
  return accountsWithBalance
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


function rowToAccount(row: t.GQueryRow): t.AccountResult {
  return {
    id          : row.c[0] ? String(row.c[0].v) : '',
    title       : row.c[1] ? String(row.c[1].v) : '',
    currencyCode: row.c[2] ? String(row.c[2].v) : '',
    createdAt   : row.c[3] ? String(row.c[3].v) : '',
    updatedAt   : row.c[4] ? String(row.c[4].v) : '',
    row         : row.c[5] ? Number(row.c[5].v) : 0,
  }
}

function accountToRow(account: t.AccountQuery): t.GRowData {
  return {
    values: [
      {userEnteredValue: {stringValue: account.id}},
      {userEnteredValue: {stringValue: account.title}},
      {userEnteredValue: {stringValue: account.currencyCode}},
      {userEnteredValue: {stringValue: account.createdAt}},
      {userEnteredValue: {stringValue: account.updatedAt}},
    ],
  }
}



/**
 * Balance
 */

export async function fetchBalancesByAccountIds(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  accountIds   : string[],
): Promise<t.BalancesById> {
  // TODO Remove the condition below
  const outcomeIdsCond: string = fpx.map(
    accountIds,
    (id: string) => `F = '${id}'`
  ).join(' OR ')
  const outcomeTable: void | t.GQueryTable = await sn.querySheet(
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    `
    SELECT F, sum(G)
    WHERE ${outcomeIdsCond}
    GROUP BY F
    `,
  )
  const outcomeBalances: t.BalancesById = outcomeTable
    ? fpx.keyBy(
      fpx.map(outcomeTable.rows, rowToBalance),
      (balance: t.Balance) => balance.accountId
    )
    : {}

  // TODO Remove the condition below
  const incomeIdsCond: string = fpx.map(
    accountIds,
    (id: string) => `H = '${id}'`
  ).join(' OR ')
  const incomeTable: void | t.GQueryTable = await sn.querySheet(
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    `
    SELECT H, sum(I)
    WHERE ${incomeIdsCond}
    GROUP BY H
    `,
  )
  const incomeBalances: t.BalancesById = incomeTable
    ? fpx.keyBy(
      fpx.map(incomeTable.rows, rowToBalance),
      (balance: t.Balance) => balance.accountId)
    : {}

  const ids: string[] = fpx.uniq(fpx.concat(fpx.keys(outcomeBalances), fpx.keys(incomeBalances)))

  const result: t.BalancesById = fpx.fold(
    ids,
    {},
    (acc: t.BalancesById, id: string) => {
      const incomeBalance: void | t.Balance = incomeBalances[id]
      const income = incomeBalance ? incomeBalance.balance : 0
      const outcomeBalance: void | t.Balance = outcomeBalances[id]
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

export function accountWithBalanceToFields(account: t.AccountWithBalanceResult): t.AccountWithBalanceRes {
  const {
    id,
    title,
    currencyCode,
    balance,
    createdAt,
    updatedAt,
  } = account

  return {
    id,
    title,
    currencyCode,
    balance,
    createdAt,
    updatedAt,
  }
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
    title       : title || '',
    currencyCode: currencyCode || '',
    createdAt,
    updatedAt,
  }
}
