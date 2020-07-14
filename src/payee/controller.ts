import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as u from '../utils'
import * as err from '../error'

import * as tn from '../transaction/net'

import * as n from './net'

export async function getPayeesWithDebts(
  ctx: t.KContext
): Promise<t.PayeeWithDebtRes[]> {
  const {client, gSpreadsheetId} = ctx

  const payees: t.PayeeResult[] = await n.fetchPayees(client, gSpreadsheetId)
  const debtsByPayeeId: t.DebtsByPayeeId = await n.fetchDebtsByPayeeIds(gSpreadsheetId)

  const response: t.PayeeWithDebtRes[] = payees.map((payee) => ({
    ...n.payeeToFields(payee),
    debt: debtsByPayeeId[payee.id]
      ? debtsByPayeeId[payee.id].debt
      : 0,
  }))

  return response
}

export async function getPayee(ctx: t.KContext): Promise<t.PayeeRes> {
  const {params: {id}, client, gSpreadsheetId} = ctx
  if (!id) {
    throw new err.BadRequest(t.PAYEE_ERROR.ID_REQUIRED)
  }

  const payee: void | t.PayeeResult = await n.fetchPayee(
    client,
    gSpreadsheetId,
    id
  )
  if (!payee) {
    throw new err.NotFound(t.PAYEE_ERROR.NOT_FOUND)
  }

  const response = n.payeeToFields(payee)
  return response
}

export async function createPayee(ctx: t.KContext): Promise<t.PayeeRes> {
  const {request: {body}, client, gSpreadsheetId, lang} = ctx

  // TODO Replace validation by parsing with error throwing
  const errors: t.ValidationErrors = n.validatePayeeFields(body, lang)
  if (errors.length) {
    throw new err.ValidationError({errors})
  }

  const payee: t.PayeeResult = await n.createPayee(
    client,
    gSpreadsheetId,
    n.fieldsToPayee(body)
  )

  const response = n.payeeToFields(payee)
  return response
}

export async function updatePayee(ctx: t.KContext): Promise<t.PayeeRes> {
  const {params: {id}, request: {body}, client, gSpreadsheetId, lang} = ctx
  if (!id) {
    throw new err.BadRequest(t.PAYEE_ERROR.ID_REQUIRED)
  }

  // TODO Replace validation by parsing with error throwing
  const errors: t.ValidationErrors = n.validatePayeeFields(body, lang)
  if (errors.length) {
    throw new err.ValidationError({errors})
  }

  const payee: t.PayeeResult = await n.updatePayee(
    client,
    gSpreadsheetId,
    id,
    n.fieldsToPayee(body)
  )

  const response = n.payeeToFields(payee)
  return response
}

export async function deletePayee(ctx: t.KContext): Promise<t.PayeeRes> {
  const {params: {id}, client, gSpreadsheetId} = ctx
  if (!id) {
    throw new err.BadRequest(t.PAYEE_ERROR.ID_REQUIRED)
  }

  const transactions: t.TransactionResult[] = await tn.fetchTransactions(
    client,
    gSpreadsheetId,
    {payeeId: id}
  )
  if (transactions.length) {
    throw new err.BadRequest(t.PAYEE_ERROR.THERE_ARE_RELATED_ENTITIES)
  }

  const response = await n.deletePayee(client, gSpreadsheetId, id)
  return response
}



/**
 * Debts
 */

export async function getPayeesDebts(
  ctx: t.KContext
): Promise<t.PayeesDebtsRes> {
  const {client, gSpreadsheetId} = ctx

  const payees: t.PayeeResult[] = await n.fetchPayees(client, gSpreadsheetId)
  const debtsByPayeeId: t.DebtsByPayeeId = await n.fetchDebtsByPayeeIds(gSpreadsheetId)

  const response: t.PayeesDebtsRes = fpx.keyBy(
    payees.map((payee) => {
      const debt = debtsByPayeeId[payee.id]
        ? debtsByPayeeId[payee.id].debt
        : 0

      return {
        payeeId: payee.id,
        debt: u.round(debt, 2),
      }
    }),
    (debt: t.Debt) => debt.payeeId
  )

  return response
}
