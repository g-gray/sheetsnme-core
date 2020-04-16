import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as u from '../utils'
import * as tn from '../transaction/net'

import * as n from './net'

export async function getPayees(ctx: t.KContext): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payees: t.Payees = await n.fetchPayees(client, gSpreadsheetId)

  const payeeIds = fpx.map(payees, (payee: t.Payee) => payee.id)
  const debts: t.DebtsById = await n.fetchDebtsByPayeeIds(client, gSpreadsheetId, payeeIds)

  ctx.body = fpx.map(payees, (payee: t.Payee) => ({
    ...n.payeeToFields(payee),
    debt: debts[payee.id] ? debts[payee.id].debt : 0,
  }))
}

export async function getPayee(ctx: t.KContext): Promise<void> {
  const id: void | string = ctx.params.id
  if (!id) {
    throw new u.PublicError(400, t.PAYEE_ERROR.ID_REQUIRED)
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payee: void | t.Payee = await n.fetchPayee(client, gSpreadsheetId, id)
  if (!payee) {
    throw new u.PublicError(404, t.PAYEE_ERROR.NOT_FOUND)
  }

  const debts: t.DebtsById = await n.fetchDebtsByPayeeIds(client, gSpreadsheetId, [payee.id])

  ctx.body = {
    ...n.payeeToFields(payee),
    debt: debts[payee.id] ? debts[payee.id].debt : 0,
  }
}

export async function createPayee(ctx: t.KContext): Promise<void> {
  const errors: t.ValidationErrors = n.validatePayeeFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.ValidationError({errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payee: t.Payee = await n.createPayee(
    client,
    gSpreadsheetId,
    n.fieldsToPayee(ctx.request.body)
  )

  ctx.body = n.payeeToFields(payee)
}

export async function updatePayee(ctx: t.KContext): Promise<void> {
  const id: void | string = ctx.params.id
  if (!id) {
    throw new u.PublicError(400, t.PAYEE_ERROR.ID_REQUIRED)
  }

  const errors: t.ValidationErrors = n.validatePayeeFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.ValidationError({errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const payee: t.Payee = await n.updatePayee(
    client,
    gSpreadsheetId,
    id,
    n.fieldsToPayee(ctx.request.body)
  )

  ctx.body = n.payeeToFields(payee)
}

export async function deletePayee(ctx: t.KContext): Promise<void> {
  const id: void | string = ctx.params.id
  if (!id) {
    throw new u.PublicError(400, t.PAYEE_ERROR.ID_REQUIRED)
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transactions: t.Transactions = await tn.fetchTransactions(
    client,
    gSpreadsheetId,
    {payeeId: id}
  )

  if (transactions.length) {
    throw new u.PublicError(400, t.PAYEE_ERROR.THERE_ARE_RELATED_ENTITIES)
  }

  const payee: t.Payee = await n.deletePayee(client, gSpreadsheetId, id)
  ctx.body = payee
}
