import * as t from '../types'

import * as u from '../utils'
import * as err from '../error'

import * as n from './net'

export async function getTransactions(ctx: t.KContext): Promise<t.TransactionListRes> {
  const {query, client, gSpreadsheetId} = ctx

  // TODO Replace validation by parsing with error throwing
  const errors: t.ValidationErrors = n.validateTransactionsFilter(query)
  if (errors.length) {
    throw new err.ValidationError({errors})
  }

  const filter: t.TransactionsFilter = query
  const limit: number = parseInt(filter.limit || '')
  const offset: number = parseInt(filter.offset || '')

  const transactionsNumber: number = await n.fetchTransactionsNumber(
    client,
    gSpreadsheetId,
    filter
  )
  const transactionsAmounts: t.TransactionsAmounts = await n.fetchTransactionsAmounts(
    client,
    gSpreadsheetId,
    filter
  )
  const transactions: t.TransactionResult[] = await n.fetchTransactions(
    client,
    gSpreadsheetId,
    filter
  )

  const response = {
    limit: limit || u.DEFAULT_LIMIT,
    offset: offset || 0,
    total: transactionsNumber,
    items: transactions.map(n.transactionToFields),
    outcomeAmount: transactionsAmounts.outcomeAmount,
    incomeAmount: transactionsAmounts.incomeAmount,
  }
  return response
}

export async function getTransaction(ctx: t.KContext): Promise<t.TransactionRes> {
  const {params: {id}, client, gSpreadsheetId} = ctx
  if (!id) {
    throw new err.BadRequest(t.TRANSACTION_ERROR.ID_REQUIRED)
  }

  const transaction: void | t.TransactionResult = await n.fetchTransaction(
    client,
    gSpreadsheetId,
    id
  )
  if (!transaction) {
    throw new err.NotFound(t.TRANSACTION_ERROR.NOT_FOUND)
  }

  const response = n.transactionToFields(transaction)
  return response
}

export async function createTransaction(ctx: t.KContext): Promise<t.TransactionRes> {
  const {request: {body}, client, gSpreadsheetId, lang} = ctx

  // TODO Replace validation by parsing with error throwing
  const errors: t.ValidationErrors = n.validateTransactionFields(body, lang)
  if (errors.length) {
    throw new err.ValidationError({errors})
  }

  const transaction: t.TransactionResult = await n.createTransaction(
    client,
    gSpreadsheetId,
    n.fieldsToTransaction(body)
  )

  const response = n.transactionToFields(transaction)
  return response
}

export async function updateTransaction(ctx: t.KContext): Promise<t.TransactionRes> {
  const {params: {id}, request: {body}, client, gSpreadsheetId, lang} = ctx
  if (!id) {
    throw new err.BadRequest(t.TRANSACTION_ERROR.ID_REQUIRED)
  }

  // TODO Replace validation by parsing with error throwing
  const errors: t.ValidationErrors = n.validateTransactionFields(body, lang)
  if (errors.length) {
    throw new err.ValidationError({errors})
  }

  const transaction: t.TransactionResult = await n.updateTransaction(
    client,
    gSpreadsheetId,
    id,
    n.fieldsToTransaction(body)
  )

  const response = n.transactionToFields(transaction)
  return response
}

export async function deleteTransaction(ctx: t.KContext): Promise<t.TransactionRes> {
  const {params: {id}, client, gSpreadsheetId} = ctx
  if (!id) {
    throw new err.BadRequest(t.TRANSACTION_ERROR.ID_REQUIRED)
  }

  const transaction: t.TransactionResult = await n.deleteTransaction(
    client,
    gSpreadsheetId,
    id
  )

  const response = n.transactionToFields(transaction)
  return response
}
