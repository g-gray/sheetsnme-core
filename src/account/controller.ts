import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as u from '../utils'

import * as s from '../sheet/sheets'
import * as tn from '../transaction/net'

import * as n from './net'

export async function getAccounts(ctx: t.KContext): Promise<void> {
  const {client, gSpreadsheetId} = ctx
  const accounts: t.AccountWithBalanceResult[] = await n.fetchAccountsWithBalance(
    client,
    gSpreadsheetId
  )

  const response: t.AccountWithBalanceRes[] = accounts.map(n.accountWithBalanceToFields)
  ctx.body = response
}

export async function getAccount(ctx: t.KContext): Promise<void> {
  const {params: {id}, client, gSpreadsheetId} = ctx
  if (!id) {
    throw new u.PublicError(400, t.ACCOUNT_ERROR.ID_REQUIRED)
  }

  const account: void | t.AccountWithBalanceResult = await n.fetchAccountWithBalance(
    client,
    gSpreadsheetId,
    id
  )
  if (!account) {
    throw new u.PublicError(404, t.ACCOUNT_ERROR.NOT_FOUND)
  }

  const response: t.AccountRes = n.accountToFields(account)
  ctx.body = response
}

export async function createAccount(ctx: t.KContext): Promise<void> {
  const {request: {body}, client, gSpreadsheetId, lang} = ctx

  const errors: t.ValidationErrors = n.validateAccountFields(body, lang)
  if (errors.length) {
    throw new u.ValidationError({errors})
  }

  const account: t.AccountResult = await n.createAccount(
    client,
    gSpreadsheetId,
    n.fieldsToAccount(body)
  )

  const response: t.AccountRes = n.accountToFields(account)
  ctx.body = response
}

export async function updateAccount(ctx: t.KContext): Promise<void> {
  const {params: {id}, request: {body}, client, gSpreadsheetId, lang} = ctx
  if (!id) {
    throw new u.PublicError(400, t.ACCOUNT_ERROR.ID_REQUIRED)
  }

  if (id === s.DEBT_ACCOUNT_ID) {
    throw new u.PublicError(400, t.ACCOUNT_ERROR.CAN_NOT_CHANGE)
  }

  const errors: t.ValidationErrors = n.validateAccountFields(body, lang)
  if (errors.length) {
    throw new u.ValidationError({errors})
  }

  const account: t.AccountResult = await n.updateAccount(
    client,
    gSpreadsheetId,
    id,
    n.fieldsToAccount(body)
  )

  const response: t.AccountRes = n.accountToFields(account)
  ctx.body = response
}

export async function deleteAccount(ctx: t.KContext): Promise<void> {
  const {params: {id}, client, gSpreadsheetId} = ctx
  if (!id) {
    throw new u.PublicError(400, t.ACCOUNT_ERROR.ID_REQUIRED)
  }

  if (id === s.DEBT_ACCOUNT_ID) {
    throw new u.PublicError(400, t.ACCOUNT_ERROR.CAN_NOT_DELETE)
  }

  const transactions: t.Transactions = await tn.fetchTransactions(
    client,
    gSpreadsheetId,
    {accountId: id}
  )
  if (transactions.length) {
    throw new u.PublicError(400, t.ACCOUNT_ERROR.THERE_ARE_RELATED_ENTITIES)
  }

  const account: t.AccountResult = await n.deleteAccount(
    client,
    gSpreadsheetId,
    id
  )

  const response: t.AccountRes = n.accountToFields(account)
  ctx.body = response
}
