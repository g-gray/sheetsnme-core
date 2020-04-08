import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as m from './model'
import * as u from '../utils'

import {fetchTransactions} from '../transaction/model'

export async function getPayees(ctx: t.KContext): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payees: t.Payees = await m.fetchPayees(client, gSpreadsheetId)

  const payeeIds = fpx.map(payees, (payee: t.Payee) => payee.id)
  const debts: t.DebtsById = await m.fetchDebtsByPayeeIds(client, gSpreadsheetId, payeeIds)

  ctx.body = fpx.map(payees, (payee: t.Payee) => ({
    ...m.payeeToFields(payee),
    debt: debts[payee.id] ? debts[payee.id].debt : 0,
  }))
}

export async function getPayee(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Payee id required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payee: t.Payee | void = await m.fetchPayee(client, gSpreadsheetId, id)
  if (!payee) {
    ctx.throw(404, 'Payee not found')
    return
  }

  const debts: t.DebtsById = await m.fetchDebtsByPayeeIds(client, gSpreadsheetId, [payee.id])

  ctx.body = {
    ...m.payeeToFields(payee),
    debt: debts[payee.id] ? debts[payee.id].debt : 0,
  }
}

export async function createPayee(ctx: t.KContext): Promise<void> {
  const errors: t.ResErrors = m.validatePayeeFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payee: t.Payee = await m.createPayee(
    client,
    gSpreadsheetId,
    m.fieldsToPayee(ctx.request.body)
  )

  ctx.body = m.payeeToFields(payee)
}

export async function updatePayee(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Payee id required')
    return
  }

  const errors: t.ResErrors = m.validatePayeeFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payee: t.Payee = await m.updatePayee(
    client,
    gSpreadsheetId,
    id,
    m.fieldsToPayee(ctx.request.body)
  )

  ctx.body = m.payeeToFields(payee)
}

export async function deletePayee(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Payee id required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transactions: t.Transactions = await fetchTransactions(client, gSpreadsheetId, {payeeId: id})
  if (transactions.length) {
    ctx.throw(400, 'Can not delete. There are related transactions')
    return
  }

  const payee: t.Payee = await m.deletePayee(client, gSpreadsheetId, id)
  ctx.body = payee
}
