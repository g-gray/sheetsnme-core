import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as m from './model'
import * as u from '../utils'
import * as s from '../sheets'

import {fetchTransactions} from '../transaction/model'

export async function getAccounts(ctx: t.KContext): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const accounts: t.Accounts = await m.fetchAccounts(client, gSpreadsheetId)

  const accountIds = fpx.map(accounts, (account: t.Account) => account.id)
  const balances: t.BalancesById = await m.fetchBalancesByAccountIds(client, gSpreadsheetId, accountIds)

  ctx.body = fpx.map(accounts, (account: t.Account) => ({
    ...m.accountToFields(account),
    balance: balances[account.id] ? balances[account.id].balance : 0,
  }))
}

export async function getAccount(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Account id required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const account: t.Account | void = await m.fetchAccount(client, gSpreadsheetId, id)
  if (!account) {
    ctx.throw(404, 'Account not found')
    return
  }

  const balances: t.BalancesById = await m.fetchBalancesByAccountIds(client, gSpreadsheetId, [account.id])

  ctx.body = {
    ...m.accountToFields(account),
    balance: balances[account.id] ? balances[account.id].balance : 0,
  }
}

export async function createAccount(ctx: t.KContext): Promise<void> {
  const errors: t.ResErrors = m.validateAccountFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const account: t.Account = await m.createAccount(
    client,
    gSpreadsheetId,
    m.fieldsToAccount(ctx.request.body)
  )

  ctx.body = m.accountToFields(account)
}

export async function updateAccount(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Account id required')
    return
  }

  if (id === s.DEBT_ACCOUNT_ID) {
    ctx.throw(400, 'You can not change this account')
  }

  const errors: t.ResErrors = m.validateAccountFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const account: t.Account = await m.updateAccount(
    client,
    gSpreadsheetId,
    id,
    m.fieldsToAccount(ctx.request.body)
  )

  ctx.body = m.accountToFields(account)
}

export async function deleteAccount(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Account id required')
    return
  }

  if (id === s.DEBT_ACCOUNT_ID) {
    ctx.throw(400, 'You can not delete this account')
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transactions: t.Transactions = await fetchTransactions(client, gSpreadsheetId, {accountId: id})
  if (transactions.length) {
    ctx.throw(400, 'Can not delete. There are related transactions')
    return
  }

  const account: t.Account = await m.deleteAccount(client, gSpreadsheetId, id)
  ctx.body = m.accountToFields(account)
}
