import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as u from '../utils'
import * as m from './model'

export async function getTransactions(ctx: t.KContext): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  // TODO Add validation of filter values
  const filter: t.TransactionsFilter = ctx.query
  const gSpreadsheetId: string = ctx.gSpreadsheetId

  const transactionsNumber: number = await m.fetchTransactionsNumber(client, gSpreadsheetId, filter)
  const transactionsAmounts: t.TransactionsAmounts = await m.fetchTransactionsAmounts(client, gSpreadsheetId, filter)
  const transactions: t.Transactions = await m.fetchTransactions(client, gSpreadsheetId, filter)

  const limit: number = parseInt(filter.limit || '', 10)
  if (filter.limit && (!fpx.isInteger(limit) || limit < 0)) {
    ctx.throw(400, 'Limit must be a positive integer')
    return
  }

  const offset: number = parseInt(filter.offset || '', 10)
  if (filter.offset && (!fpx.isInteger(offset) || offset < 0)) {
    ctx.throw(400, 'Offset must be a positive integer')
    return
  }

  ctx.body = {
    limit: limit || u.DEFAULT_LIMIT,
    offset: offset || 0,
    total: transactionsNumber,
    items: fpx.map(transactions, m.transactionToFields),
    outcomeAmount: transactionsAmounts.outcomeAmount,
    incomeAmount: transactionsAmounts.incomeAmount,
  }
}

export async function getTransaction(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Transaction id required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transaction: t.Transaction | void = await m.fetchTransaction(client, gSpreadsheetId, id)
  if (!transaction) {
    ctx.throw(404, 'Transaction not found')
    return
  }

  ctx.body = m.transactionToFields(transaction)
}

export async function createTransaction(ctx: t.KContext): Promise<void> {
  const errors: t.ResErrors = m.validateTransactionFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId

  const transaction: t.Transaction = await m.createTransaction(
    client,
    gSpreadsheetId,
    m.fieldsToTransaction(ctx.request.body)
  )

  ctx.body = m.transactionToFields(transaction)
}

export async function updateTransaction(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Transaction id required')
    return
  }

  const errors: t.ResErrors = m.validateTransactionFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transaction: t.Transaction = await m.updateTransaction(
    client,
    gSpreadsheetId,
    id,
    m.fieldsToTransaction(ctx.request.body)
  )

  ctx.body = m.transactionToFields(transaction)
}

export async function deleteTransaction(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Transaction id required')
    return
  }

  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const client: t.GOAuth2Client = ctx.client
  const transaction: t.Transaction = await m.deleteTransaction(client, gSpreadsheetId, id)
  ctx.body = transaction
}
