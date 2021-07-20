import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as u from '../utils'
import * as i18n from '../i18n'

import * as ss from '../sheet/sheets'
import * as sn from '../sheet/net'
import * as en from '../entity/net'

export async function fetchTransaction(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<void | t.TransactionResult> {
  const result: void | t.TransactionResult = await en.queryEntityById<t.TransactionResult>(
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
  transaction  : t.TransactionQuery,
): Promise<t.TransactionResult> {
  const result: t.TransactionResult = await en.createEntity<t.TransactionQuery, t.TransactionResult>(
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
  transaction  : t.TransactionQuery,
): Promise<t.TransactionResult> {
  const result: t.TransactionResult = await en.updateEntityById<t.TransactionQuery, t.TransactionResult>(
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
): Promise<t.TransactionResult> {
  const result: t.TransactionResult = await en.deleteEntityById<t.TransactionResult>(
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
): Promise<t.TransactionResult[]> {
  const query: string = transactionsQuery(filter)
  const result: t.TransactionResult[] = await en.queryEntities<t.TransactionResult>(
    client,
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    rowToTransaction,
    query,
  )
  return result
}

function transactionsQuery(filter: t.TransactionsFilter): string {
  const where = transactionsWhere(filter)

  const limit: number = parseInt(filter.limit || '', 10) || u.DEFAULT_LIMIT
  const offset: number = parseInt(filter.offset || '', 10)

  const query: string = fpx.compact([
    `SELECT *`,
    `WHERE ${where}`,
    `ORDER BY B DESC, J DESC`,
    limit  ? `LIMIT ${limit}`   : '',
    offset ? `OFFSET ${offset}` : '',
  ]).join(' ')

  return query
}

function transactionsWhere(filter: t.TransactionsFilter): string {
  return fpx.compact([
    `A != 'id'`,
    filter.id         ? `A = '${filter.id}'`                                       : '',
    filter.dateFrom   ? `B >= '${filter.dateFrom}'`                                : '',
    filter.dateTo     ? `B <= '${filter.dateTo}'`                                  : '',
    filter.categoryId ? `C = '${filter.categoryId}'`                               : '',
    filter.payeeId    ? `D = '${filter.payeeId}'`                                  : '',
    filter.comment    ? `LOWER(E) LIKE LOWER('%${filter.comment}%')`               : '',
    filter.accountId  ? `(F = '${filter.accountId}' OR H = '${filter.accountId}')` : '',
    filter.amountFrom ? `G >= ${filter.amountFrom}`                                : '',
    filter.amountTo   ? `I <= ${filter.amountTo}`                                  : '',
  ]).join(' AND ')
}


function rowToTransaction(row: t.GQueryRow): t.TransactionRowDataResult {
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

function transactionToRow(rowData: t.TransactionRowDataQuery): t.GRowData {
  return {
    values: [
      {userEnteredValue: {stringValue: rowData.id}},
      {userEnteredValue: {stringValue: rowData.date}},
      {userEnteredValue: {stringValue: rowData.categoryId}},
      {userEnteredValue: {stringValue: rowData.payeeId}},
      {userEnteredValue: {stringValue: rowData.comment}},
      {userEnteredValue: {stringValue: rowData.outcomeAccountId}},
      {userEnteredValue: {numberValue: rowData.outcomeAmount}},
      {userEnteredValue: {stringValue: rowData.incomeAccountId}},
      {userEnteredValue: {numberValue: rowData.incomeAmount}},
      {userEnteredValue: {stringValue: rowData.createdAt}},
      {userEnteredValue: {stringValue: rowData.updatedAt}},
    ],
  }
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

  const query: string = `
    SELECT COUNT(A)
    WHERE ${where}
  `

  return query
}


export async function fetchTransactionsAmounts(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  filter       : t.TransactionsFilter,
): Promise<t.TransactionsAmounts> {
  const query: string = transactionsAmountsQuery(filter)

  const table: void | t.GQueryTable = await sn.querySheet(
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    query,
  )

  const rows: t.GQueryRow[] = table
    ? table.rows
    : []
  const row: void | t.GQueryRow = fpx.first(rows)

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
    `SELECT SUM(G), SUM(I)`,
    `WHERE ${[
      // Ignore debts
      `(F != '${ss.DEBT_ACCOUNT_ID}' AND H != '${ss.DEBT_ACCOUNT_ID}')`,
      // Ignore transfers
      `((F != '' AND H = '') or (F = '' AND H != ''))`,
      where,
    ].join(' AND ')}`,
  ]).join(' ')

  return query
}


export function validateTransactionFields(
  fields: any,
  lang: t.Lang
): t.ValidationErrors {
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
    errors.push({text: `${i18n.xln(lang, i18n.TYPE_MUST_BE_ONE_OF)}: [${transactionTypes.join(', ')}]`})
  }

  if (!date || !fpx.isValidDate(new Date(date))) {
    errors.push({text: i18n.xln(lang, i18n.DATE_MUST_BE_NON_EMPTY_AND_VALID)})
  }

  if (fpx.includes([
    t.TRANSACTION_TYPE.OUTCOME,
    t.TRANSACTION_TYPE.TRANSFER,
    t.TRANSACTION_TYPE.LOAN,
  ], type)) {
    if (!outcomeAccountId) {
      errors.push({text: i18n.xln(lang, i18n.OUTCOME_ACCOUNT_REQUIRED)})
    }

    if (!fpx.isNumber(outcomeAmount)) {
      errors.push({text: i18n.xln(lang, i18n.OUTCOME_AMOUNT_MUST_BE_A_VALID_NUMBER)})
    }
  }

  if (fpx.includes([
    t.TRANSACTION_TYPE.INCOME,
    t.TRANSACTION_TYPE.TRANSFER,
    t.TRANSACTION_TYPE.BORROW,
  ], type)) {
    if (!incomeAccountId) {
      errors.push({text: i18n.xln(lang, i18n.INCOME_ACCOUNT_REQUIRED)})
    }

    if (!fpx.isNumber(incomeAmount)) {
      errors.push({text: i18n.xln(lang, i18n.INCOME_AMOUNT_MUST_BE_A_VALID_NUMBER)})
    }
  }

  if (fpx.includes([
    t.TRANSACTION_TYPE.LOAN,
    t.TRANSACTION_TYPE.BORROW,
  ], type) && !payeeId) {
    errors.push({text: i18n.xln(lang, i18n.PAYEE_REQUIRED)})
  }

  return errors
}

export function transactionToFields(transaction: t.TransactionResult): t.TransactionRes {
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

function defTransactionType(transaction: t.TransactionResult): t.TRANSACTION_TYPE {
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

export function fieldsToTransaction(fields: t.TransactionReq): t.TransactionQuery {
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
  } = fields

  const transaction: t.TransactionQuery = {
    id,
    date,
    categoryId      : categoryId       || '',
    payeeId         : payeeId          || '',
    outcomeAccountId: outcomeAccountId || '',
    outcomeAmount   : outcomeAmount    || 0,
    incomeAccountId : incomeAccountId  || '',
    incomeAmount    : incomeAmount     || 0,
    comment         : comment          || '',
    createdAt,
    updatedAt,
  }

  if (type === t.TRANSACTION_TYPE.INCOME) {
    return {
      ...transaction,
      outcomeAccountId: '',
      outcomeAmount   : 0,
      incomeAccountId : incomeAccountId || '',
      incomeAmount    : incomeAmount    || 0,
    }
  }

  if (type === t.TRANSACTION_TYPE.LOAN) {
    return {
      ...transaction,
      categoryId      : '',
      outcomeAccountId: outcomeAccountId || '',
      outcomeAmount   : outcomeAmount    || 0,
      incomeAccountId : ss.DEBT_ACCOUNT_ID,
      incomeAmount    : outcomeAmount || 0,
    }
  }

  if (type === t.TRANSACTION_TYPE.BORROW) {
    return {
      ...transaction,
      categoryId      : '',
      outcomeAccountId: ss.DEBT_ACCOUNT_ID,
      outcomeAmount   : incomeAmount    || 0,
      incomeAccountId : incomeAccountId || '',
      incomeAmount    : incomeAmount    || 0,
    }
  }

  if (type === t.TRANSACTION_TYPE.TRANSFER) {
    return {
      ...transaction,
      categoryId      : '',
      payeeId         : '',
      outcomeAccountId: outcomeAccountId || '',
      outcomeAmount   : outcomeAmount    || 0,
      incomeAccountId : incomeAccountId  || '',
      incomeAmount    : incomeAmount     || 0,
    }
  }

  // TRANSACTION_TYPE.OUTCOME by default
  return {
    ...transaction,
    outcomeAccountId: outcomeAccountId || '',
    outcomeAmount   : outcomeAmount || 0,
    incomeAccountId : '',
    incomeAmount    : 0,
  }
}

export function validateTransactionsFilter(filter: any): t.ValidationErrors {
  const errors: t.ValidationErrors = []

  if (filter.dateFrom && !fpx.isValidDate(new Date(filter.dateFrom))) {
    errors.push({text: t.TRANSACTION_ERROR.DATE_FROM_MUST_BE_A_VALID_DATE})
  }

  if (filter.dateTo && !fpx.isValidDate(new Date(filter.dateTo))) {
    errors.push({text: t.TRANSACTION_ERROR.DATE_TO_MUST_BE_A_VALID_DATE})
  }

  if (filter.amountFrom) {
    const amountFrom: number = parseFloat(filter.amountFrom || '')
    if (!fpx.isFinite(amountFrom) || amountFrom < 0) {
      errors.push({text: t.TRANSACTION_ERROR.AMOUNT_FROM_MUST_BE_A_POSTITIVE_NUMBER})
    }
  }

  if (filter.amountTo) {
    const amountTo: number = parseFloat(filter.amountTo || '')
    if (!fpx.isFinite(amountTo) || amountTo < 0) {
      errors.push({text: t.TRANSACTION_ERROR.AMOUNT_TO_MUST_BE_A_POSTITIVE_NUMBER})
    }
  }

  if (filter.limit && !fpx.isNatural(parseInt(filter.limit || ''))) {
    errors.push({text: t.TRANSACTION_ERROR.LIMIT_MUST_BE_A_POSITIVE_INTEGER})
  }

  if (filter.offset && !fpx.isNatural(parseInt(filter.offset || ''))) {
    errors.push({text: t.TRANSACTION_ERROR.OFFSET_MUST_BE_A_POSITIVE_INTEGER})
  }

  return errors
}
