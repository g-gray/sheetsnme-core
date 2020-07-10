import * as t from '../types'

import * as err from '../error'

import * as s from '../sheet/sheets'
import * as tn from '../transaction/net'

import * as n from './net'

export async function getAccounts(ctx: t.KContext): Promise<t.AccountWithBalanceRes[]> {
  const {client, gSpreadsheetId} = ctx

  const accounts = await n.fetchAccounts(client, gSpreadsheetId)
  const balancesByAccountId = await n.fetchBalancesByAccountId(gSpreadsheetId)

  const response = accounts.map(
    (account) => ({
      ...n.accountToFields(account),
      balance: balancesByAccountId[account.id]
        ? balancesByAccountId[account.id].balance
        : 0,
    })
  )
  return response
}

export async function getAccount(ctx: t.KContext): Promise<t.AccountRes> {
  const {params: {id}, client, gSpreadsheetId} = ctx
  if (!id) {
    throw new err.BadRequest(t.ACCOUNT_ERROR.ID_REQUIRED)
  }

  const account: void | t.AccountResult = await n.fetchAccount(
    client,
    gSpreadsheetId,
    id
  )
  if (!account) {
    throw new err.NotFound(t.ACCOUNT_ERROR.NOT_FOUND)
  }

  const response = n.accountToFields(account)
  return response
}

export async function createAccount(ctx: t.KContext): Promise<t.AccountRes> {
  const {request: {body}, client, gSpreadsheetId, lang} = ctx

  const errors: t.ValidationErrors = n.validateAccountFields(body, lang)
  if (errors.length) {
    throw new err.ValidationError({errors})
  }

  const account: t.AccountResult = await n.createAccount(
    client,
    gSpreadsheetId,
    n.fieldsToAccount(body)
  )

  const response = n.accountToFields(account)
  return response
}

export async function updateAccount(ctx: t.KContext): Promise<t.AccountRes> {
  const {params: {id}, request: {body}, client, gSpreadsheetId, lang} = ctx
  if (!id) {
    throw new err.BadRequest(t.ACCOUNT_ERROR.ID_REQUIRED)
  }

  if (id === s.DEBT_ACCOUNT_ID) {
    throw new err.BadRequest(t.ACCOUNT_ERROR.CAN_NOT_CHANGE)
  }

  const errors: t.ValidationErrors = n.validateAccountFields(body, lang)
  if (errors.length) {
    throw new err.ValidationError({errors})
  }

  const account: t.AccountResult = await n.updateAccount(
    client,
    gSpreadsheetId,
    id,
    n.fieldsToAccount(body)
  )

  const response = n.accountToFields(account)
  return response
}

export async function deleteAccount(ctx: t.KContext): Promise<t.AccountRes> {
  const {params: {id}, client, gSpreadsheetId} = ctx
  if (!id) {
    throw new err.BadRequest(t.ACCOUNT_ERROR.ID_REQUIRED)
  }

  if (id === s.DEBT_ACCOUNT_ID) {
    throw new err.BadRequest(t.ACCOUNT_ERROR.CAN_NOT_DELETE)
  }

  const transactions: t.TransactionResult[] = await tn.fetchTransactions(
    client,
    gSpreadsheetId,
    {accountId: id}
  )
  if (transactions.length) {
    throw new err.BadRequest(t.ACCOUNT_ERROR.THERE_ARE_RELATED_ENTITIES)
  }

  const account: t.AccountResult = await n.deleteAccount(
    client,
    gSpreadsheetId,
    id
  )

  const response = n.accountToFields(account)
  return response
}
