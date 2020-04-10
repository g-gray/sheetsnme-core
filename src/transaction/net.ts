import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'
import uuid from 'uuid/v4'

import * as u from '../utils'
import * as tr from '../translations'

import * as ss from '../sheet/sheets'
import * as sn from '../sheet/net'
import * as en from '../entity/net'

export async function fetchTransaction(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Transaction | void> {
  const result: t.Transaction | void = await en.queryEntityById<t.Transaction>(
    client,
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    id,
    rowToTransaction,
  )
  return result
}

export async function createTransaction(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  transaction  : t.Transaction,
): Promise<t.Transaction> {
  const result: t.Transaction = await en.createEntity<t.Transaction>(
    client,
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    transaction,
    transactionToRow,
    rowToTransaction,
  )
  return result
}

export async function updateTransaction(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  transaction  : t.Transaction,
): Promise<t.Transaction> {
  const result: t.Transaction = await en.updateEntityById<t.Transaction>(
    client,
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    id,
    transaction,
    transactionToRow,
    rowToTransaction,
  )
  return result
}

export async function deleteTransaction(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Transaction> {
  const result: t.Transaction = await en.deleteEntityById<t.Transaction>(
    client,
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    id,
    rowToTransaction,
  )
  return result
}

export async function fetchTransactions(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  filter       : t.TransactionsFilter,
): Promise<t.Transactions> {
  const query: string = transactionsQuery(filter)
  const result: t.Transactions = await en.queryEntities<t.Transaction>(
    client,
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    rowToTransaction,
    query,
  )
  return result
}

function rowToTransaction(row: t.GQueryRow): t.Transaction {
  return {
    id              : row.c[0]  ? String(row.c[0].v)  : '',
    date            : row.c[1]  ? String(row.c[1].v)  : '',
    categoryId      : row.c[2]  ? String(row.c[2].v)  : '',
    payeeId         : row.c[3]  ? String(row.c[3].v)  : '',
    comment         : row.c[4]  ? String(row.c[4].v)  : '',
    outcomeAccountId: row.c[5]  ? String(row.c[5].v)  : '',
    outcomeAmount   : row.c[6]  ? Number(row.c[6].v)  : 0,
    incomeAccountId : row.c[7]  ? String(row.c[7].v)  : '',
    incomeAmount    : row.c[8]  ? Number(row.c[8].v)  : 0,
    createdAt       : row.c[9]  ? String(row.c[9].v)  : '',
    updatedAt       : row.c[10] ? String(row.c[10].v) : '',
    row             : row.c[11] ? Number(row.c[11].v) : 0,
  }
}

function transactionToRow(transaction: t.Transaction): t.GRowData {
  const date: string = new Date().toJSON()
  const createdAt: string = transaction.createdAt
    ? new Date(transaction.createdAt).toJSON()
    : date
  return {
    values: [
      {userEnteredValue: {stringValue: transaction.id}},
      {userEnteredValue: {stringValue: transaction.date}},
      {userEnteredValue: {stringValue: transaction.categoryId}},
      {userEnteredValue: {stringValue: transaction.payeeId}},
      {userEnteredValue: {stringValue: transaction.comment}},
      {userEnteredValue: {stringValue: transaction.outcomeAccountId}},
      {userEnteredValue: {numberValue: transaction.outcomeAmount}},
      {userEnteredValue: {stringValue: transaction.incomeAccountId}},
      {userEnteredValue: {numberValue: transaction.incomeAmount}},
      {userEnteredValue: {stringValue: createdAt}},
      {userEnteredValue: {stringValue: date}},
    ],
  }
}

function transactionsQuery(filter: t.TransactionsFilter): string {
  const where = transactionsWhere(filter)

  const limit: number = parseInt(filter.limit || '', 10) || u.DEFAULT_LIMIT
  const offset: number = parseInt(filter.offset || '', 10)

  const query: string = fpx.compact([
    `select *`,
    `where ${where}`,
    `order by B desc, J desc`,
    limit  ? `limit ${limit}`   : undefined,
    offset ? `offset ${offset}` : undefined,
  ]).join(' ')

  return query
}


export async function fetchTransactionsNumber(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  filter       : t.TransactionsFilter,
): Promise<number> {
  const query: string = transactionsNumberQuery(filter)
  const result: number = await en.queryEntitiesNumber(
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    query,
  )
  return result
}

function transactionsNumberQuery(filter: t.TransactionsFilter): string {
  const where = transactionsWhere(filter)

  const query: string = fpx.compact([
    `select count(A)`,
    `where ${where}`,
  ]).join(' ')

  return query
}


export async function fetchTransactionsAmounts(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  filter       : t.TransactionsFilter,
): Promise<t.TransactionsAmounts> {
  const query: string = transactionsAmountsQuery(filter)

  const table: t.GQueryTable | void = await sn.querySheet(
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    query,
  )

  const rows: t.GQueryRow[] = table
    ? table.rows
    : []
  const row: t.GQueryRow | void = fpx.first(rows)

  const outcomeAmount: number = row && row.c[0] ? Number(row.c[0].v) : 0
  const incomeAmount: number = row && row.c[1] ? Number(row.c[1].v) : 0

  return {
    outcomeAmount: u.round(outcomeAmount, 2),
    incomeAmount: u.round(incomeAmount, 2),
  }
}

function transactionsAmountsQuery(filter: t.TransactionsFilter): string {
  const where = transactionsWhere(filter)

  const query: string = fpx.compact([
    `select sum(G), sum(I)`,
    `where ${[
      // Ignore debts
      `(F != '${ss.DEBT_ACCOUNT_ID}' and H != '${ss.DEBT_ACCOUNT_ID}')`,
      // Ignore transfers
      `((F != '' and H = '') or (F = '' and H != ''))`,
      where,
    ].join(' and ')}`,
  ]).join(' ')

  return query
}


function transactionsWhere(filter: t.TransactionsFilter): string {
  return fpx.compact([
    `A != 'id'`,
    filter.id         ? `A = '${filter.id}'`                                       : undefined,
    filter.dateFrom   ? `B >= '${filter.dateFrom}'`                                : undefined,
    filter.dateTo     ? `B <= '${filter.dateTo}'`                                  : undefined,
    filter.categoryId ? `C = '${filter.categoryId}'`                               : undefined,
    filter.payeeId    ? `D = '${filter.payeeId}'`                                  : undefined,
    filter.comment    ? `lower(E) like lower('%${filter.comment}%')`               : undefined,
    filter.accountId  ? `(F = '${filter.accountId}' OR H = '${filter.accountId}')` : undefined,
    filter.amountFrom ? `G >= ${filter.amountFrom}`                                : undefined,
    filter.amountTo   ? `I <= ${filter.amountTo}`                                  : undefined,
  ]).join(' and ')
}

export function validateTransactionFields(fields: any, lang: t.Lang): t.ValidationErrors {
  const errors: t.ValidationErrors = []
  const transactionTypes: t.TRANSACTION_TYPE[] = fpx.values(t.TRANSACTION_TYPE)
  const {
    type,
    date,
    outcomeAccountId,
    outcomeAmount,
    incomeAccountId,
    incomeAmount,
    payeeId,
  } = fields

  if (!fpx.includes(transactionTypes, type)) {
    errors.push({text: `${u.xln(lang, tr.TYPE_MUST_BE_ONE_OF)}: [${transactionTypes.join(', ')}]`})
  }

  if (!date || !fpx.isValidDate(new Date(date))) {
    errors.push({text: u.xln(lang, tr.DATE_MUST_BE_NON_EMPTY_AND_VALID)})
  }

  if (fpx.includes([
    t.TRANSACTION_TYPE.OUTCOME,
    t.TRANSACTION_TYPE.TRANSFER,
    t.TRANSACTION_TYPE.LOAN,
  ], type)) {
    if (!outcomeAccountId) {
      errors.push({text: u.xln(lang, tr.OUTCOME_ACCOUNT_REQUIRED)})
    }

    if (!fpx.isNumber(outcomeAmount)) {
      errors.push({text: u.xln(lang, tr.OUTCOME_AMOUNT_MUST_BE_A_VALID_NUMBER)})
    }
  }

  if (fpx.includes([
    t.TRANSACTION_TYPE.INCOME,
    t.TRANSACTION_TYPE.TRANSFER,
    t.TRANSACTION_TYPE.BORROW,
  ], type)) {
    if (!incomeAccountId) {
      errors.push({text: u.xln(lang, tr.INCOME_ACCOUNT_REQUIRED)})
    }

    if (!fpx.isNumber(incomeAmount)) {
      errors.push({text: u.xln(lang, tr.INCOME_AMOUNT_MUST_BE_A_VALID_NUMBER)})
    }
  }

  if (fpx.includes([
    t.TRANSACTION_TYPE.LOAN,
    t.TRANSACTION_TYPE.BORROW,
  ], type) && !payeeId) {
    errors.push({text: u.xln(lang, tr.PAYEE_REQUIRED)})
  }

  return errors
}

function defTransactionType(transaction: t.Transaction): t.TRANSACTION_TYPE {
  const {outcomeAccountId, incomeAccountId} = transaction
  return outcomeAccountId && !incomeAccountId
    ? t.TRANSACTION_TYPE.OUTCOME
    : outcomeAccountId && incomeAccountId === ss.DEBT_ACCOUNT_ID
    ? t.TRANSACTION_TYPE.LOAN
    : incomeAccountId && !outcomeAccountId
    ? t.TRANSACTION_TYPE.INCOME
    : incomeAccountId && outcomeAccountId === ss.DEBT_ACCOUNT_ID
    ? t.TRANSACTION_TYPE.BORROW
    : outcomeAccountId && incomeAccountId
    ? t.TRANSACTION_TYPE.TRANSFER
    : t.TRANSACTION_TYPE.OUTCOME
}

export function transactionToFields(transaction: t.Transaction): t.TransactionFields {
  const {
    id,
    date,
    categoryId,
    payeeId,
    comment,
    outcomeAccountId,
    outcomeAmount,
    incomeAccountId,
    incomeAmount,
    createdAt,
    updatedAt,
  } = transaction

  return {
    id,
    type: defTransactionType(transaction),
    date,
    categoryId,
    payeeId,
    comment,
    outcomeAccountId,
    outcomeAmount,
    incomeAccountId,
    incomeAmount,
    createdAt,
    updatedAt,
  }
}

export function fieldsToTransaction(fields: t.TransactionFields): t.Transaction {
  const {
    id,
    type,
    date,
    categoryId,
    payeeId,
    outcomeAccountId,
    outcomeAmount,
    incomeAccountId,
    incomeAmount,
    comment,
    createdAt,
    updatedAt,
  }: t.TransactionFields = fields

  // TODO Think how to split t.Transaction on t.IncomeTransaction, t.OutcomeTransaction, etc.
  if (type === t.TRANSACTION_TYPE.INCOME) {
    return {
      id              : id || uuid(),
      date            : date || '',

      categoryId      : categoryId || '',
      payeeId         : payeeId || '',

      outcomeAccountId : '',
      outcomeAmount    : 0,
      incomeAccountId : incomeAccountId || '',
      incomeAmount    : incomeAmount || 0,

      comment         : comment || '',
      createdAt       : createdAt || '',
      updatedAt       : updatedAt || '',
    }
  }

  if (type === t.TRANSACTION_TYPE.LOAN) {
    return {
      id              : id || uuid(),
      date            : date || '',

      categoryId      : '',
      payeeId         : payeeId || '',

      outcomeAccountId: outcomeAccountId || '',
      outcomeAmount   : outcomeAmount || 0,
      incomeAccountId : ss.DEBT_ACCOUNT_ID,
      incomeAmount    : outcomeAmount || 0,

      comment         : comment || '',
      createdAt       : createdAt || '',
      updatedAt       : updatedAt || '',
    }
  }

  if (type === t.TRANSACTION_TYPE.BORROW) {
    return {
      id              : id || uuid(),
      date            : date || '',

      categoryId      : '',
      payeeId         : payeeId || '',

      outcomeAccountId: ss.DEBT_ACCOUNT_ID,
      outcomeAmount   : incomeAmount || 0,
      incomeAccountId : '',
      incomeAmount    : incomeAmount || 0,

      comment         : comment || '',
      createdAt       : createdAt || '',
      updatedAt       : updatedAt || '',
    }
  }

  if (type === t.TRANSACTION_TYPE.TRANSFER) {
    return {
      id              : id || uuid(),
      date            : date || '',

      categoryId      : '',
      payeeId         : '',

      outcomeAccountId: outcomeAccountId || '',
      outcomeAmount   : outcomeAmount || 0,
      incomeAccountId : incomeAccountId || '',
      incomeAmount    : incomeAmount || 0,

      comment         : comment || '',
      createdAt       : createdAt || '',
      updatedAt       : updatedAt || '',
    }
  }

  return {
    id              : id || uuid(),
    date            : date || '',

    categoryId      : categoryId || '',
    payeeId         : payeeId || '',

    outcomeAccountId: outcomeAccountId || '',
    outcomeAmount   : outcomeAmount || 0,
    incomeAccountId : '',
    incomeAmount    : 0,

    comment         : comment || '',
    createdAt       : createdAt || '',
    updatedAt       : updatedAt || '',
  }
}
