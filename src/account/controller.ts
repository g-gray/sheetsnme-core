import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as u from '../utils'

import * as s from '../sheet/sheets'
import * as tn from '../transaction/net'

import * as n from './net'

export async function getAccounts(ctx: t.KContext): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const accounts: t.Accounts = await n.fetchAccounts(client, gSpreadsheetId)

  const accountIds = fpx.map(accounts, (account: t.Account) => account.id)
  const balances: t.BalancesById = await n.fetchBalancesByAccountIds(client, gSpreadsheetId, accountIds)

  ctx.body = fpx.map(accounts, (account: t.Account) => ({
    ...n.accountToFields(account),
    balance: balances[account.id] ? balances[account.id].balance : 0,
  }))
}

export async function getAccount(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    throw new u.PublicError(400, t.ACCOUNT_ERROR.ID_REQUIRED)
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const account: t.Account | void = await n.fetchAccount(client, gSpreadsheetId, id)
  if (!account) {
    throw new u.PublicError(404, 'Account not found')
  }

  const balances: t.BalancesById = await n.fetchBalancesByAccountIds(client, gSpreadsheetId, [account.id])

  ctx.body = {
    ...n.accountToFields(account),
    balance: balances[account.id] ? balances[account.id].balance : 0,
  }
}

export async function createAccount(ctx: t.KContext): Promise<void> {
  const errors: t.ValidationErrors = n.validateAccountFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.ValidationError({errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const account: t.Account = await n.createAccount(
    client,
    gSpreadsheetId,
    n.fieldsToAccount(ctx.request.body)
  )

  ctx.body = n.accountToFields(account)
}

export async function updateAccount(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    throw new u.PublicError(400, t.ACCOUNT_ERROR.ID_REQUIRED)
  }

  if (id === s.DEBT_ACCOUNT_ID) {
    throw new u.PublicError(400, t.ACCOUNT_ERROR.CAN_NOT_CHANGE)
  }

  const errors: t.ValidationErrors = n.validateAccountFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.ValidationError({errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const account: t.Account = await n.updateAccount(
    client,
    gSpreadsheetId,
    id,
    n.fieldsToAccount(ctx.request.body)
  )

  ctx.body = n.accountToFields(account)
}

export async function deleteAccount(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    throw new u.PublicError(400, t.ACCOUNT_ERROR.ID_REQUIRED)
  }

  if (id === s.DEBT_ACCOUNT_ID) {
    throw new u.PublicError(400, t.ACCOUNT_ERROR.CAN_NOT_DELETE)
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transactions: t.Transactions = await tn.fetchTransactions(client, gSpreadsheetId, {accountId: id})
  if (transactions.length) {
    throw new u.PublicError(400, t.ACCOUNT_ERROR.THERE_ARE_RELATED_ENTITIES)
  }

  const account: t.Account = await n.deleteAccount(client, gSpreadsheetId, id)
  ctx.body = n.accountToFields(account)
}
