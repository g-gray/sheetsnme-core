import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as u from '../utils'

import * as n from './net'

export async function getTransactions(ctx: t.KContext): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  // TODO Add validation of filter values
  const filter: t.TransactionsFilter = ctx.query
  const gSpreadsheetId: string = ctx.gSpreadsheetId

  const transactionsNumber: number = await n.fetchTransactionsNumber(client, gSpreadsheetId, filter)
  const transactionsAmounts: t.TransactionsAmounts = await n.fetchTransactionsAmounts(
    client,
    gSpreadsheetId,
    filter
  )
  const transactions: t.Transactions = await n.fetchTransactions(client, gSpreadsheetId, filter)

  const limit: number = parseInt(filter.limit || '', 10)
  if (filter.limit && (!fpx.isInteger(limit) || limit < 0)) {
    throw new u.PublicError(400, t.TRANSACTION_ERROR.LIMIT_MUST_BE_A_POSITIVE_INTEGER)
  }

  const offset: number = parseInt(filter.offset || '', 10)
  if (filter.offset && (!fpx.isInteger(offset) || offset < 0)) {
    throw new u.PublicError(400, t.TRANSACTION_ERROR.OFFSET_MUST_BE_A_POSITIVE_INTEGER)
  }

  ctx.body = {
    limit: limit || u.DEFAULT_LIMIT,
    offset: offset || 0,
    total: transactionsNumber,
    items: fpx.map(transactions, n.transactionToFields),
    outcomeAmount: transactionsAmounts.outcomeAmount,
    incomeAmount: transactionsAmounts.incomeAmount,
  }
}

export async function getTransaction(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    throw new u.PublicError(400, t.TRANSACTION_ERROR.ID_REQUIRED)
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transaction: t.Transaction | void = await n.fetchTransaction(client, gSpreadsheetId, id)
  if (!transaction) {
    throw new u.PublicError(404, t.TRANSACTION_ERROR.NOT_FOUND)
  }

  ctx.body = n.transactionToFields(transaction)
}

export async function createTransaction(ctx: t.KContext): Promise<void> {
  const errors: t.ValidationErrors = n.validateTransactionFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.ValidationError({errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId

  const transaction: t.Transaction = await n.createTransaction(
    client,
    gSpreadsheetId,
    n.fieldsToTransaction(ctx.request.body)
  )

  ctx.body = n.transactionToFields(transaction)
}

export async function updateTransaction(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    throw new u.PublicError(400, t.TRANSACTION_ERROR.ID_REQUIRED)
  }

  const errors: t.ValidationErrors = n.validateTransactionFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.ValidationError({errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transaction: t.Transaction = await n.updateTransaction(
    client,
    gSpreadsheetId,
    id,
    n.fieldsToTransaction(ctx.request.body)
  )

  ctx.body = n.transactionToFields(transaction)
}

export async function deleteTransaction(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    throw new u.PublicError(400, t.TRANSACTION_ERROR.ID_REQUIRED)
  }

  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const client: t.GOAuth2Client = ctx.client
  const transaction: t.Transaction = await n.deleteTransaction(client, gSpreadsheetId, id)
  ctx.body = transaction
}
