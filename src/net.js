// @flow
import {google} from 'googleapis'
import * as f from 'fpx'
import uuid from 'uuid/v4'
import qs from 'query-string'
import * as t from './types'
import * as e from './env'
import * as u from './utils'
import * as s from './sheets'

const {SPREADSHEET_NAME} = e.properties

/**
 * Accounts
 */

export async function fetchAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Account | void> {
  const result: t.Account | void = await queryEntityById<t.Account>(
    client,
    spreadsheetId,
    s.ACCOUNTS_SHEET_ID,
    id,
    rowToAccount,
  )
  return result
}

export async function createAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  fields       : t.JSONObject,
): Promise<t.Account> {
  const result: t.Account = await createEntity<t.Account>(
    client,
    spreadsheetId,
    s.ACCOUNTS_SHEET_ID,
    {...fields, id: uuid()},
    accountToRow,
    rowToAccount,
  )
  return result
}

export async function updateAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  fields       : t.JSONObject,
): Promise<t.Account> {
  const result: t.Account = await updateEntityById<t.Account>(
    client,
    spreadsheetId,
    s.ACCOUNTS_SHEET_ID,
    id,
    {...fields},
    accountToRow,
    rowToAccount,
  )
  return result
}

export async function deleteAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Account> {
  const result: t.Account = await deleteEntityById<t.Account>(
    client,
    spreadsheetId,
    s.ACCOUNTS_SHEET_ID,
    id,
    rowToAccount,
  )
  return result
}

export async function fetchAccounts(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
): Promise<t.Accounts> {
  const result: t.Accounts = await queryEntities<t.Account>(
    client,
    spreadsheetId,
    s.ACCOUNTS_SHEET_ID,
    rowToAccount,
    `select * where A != 'id' AND A !='${s.DEBT_ACCOUNT_ID}' order by B`
  )
  return result
}


function rowToAccount(row: t.GQueryRow): t.Account {
  return {
    id          : row.c[0] ? String(row.c[0].v) : '',
    title       : row.c[1] ? String(row.c[1].v) : '',
    currencyCode: row.c[2] ? String(row.c[2].v) : '',
    createdAt   : row.c[3] ? String(row.c[3].v) : '',
    updatedAt   : row.c[4] ? String(row.c[4].v) : '',
    row         : row.c[5] ? Number(row.c[5].v) : 0,
  }
}

function accountToRow(account: t.Account): t.GRowData {
  const date: string = new Date().toJSON()
  const createdAt: string = account.createdAt
    ? new Date(account.createdAt).toJSON()
    : date
  return {
    values: [
      {userEnteredValue: {stringValue: account.id}},
      {userEnteredValue: {stringValue: account.title}},
      // {userEnteredValue: {stringValue: account.currencyCode}},
      {userEnteredValue: {stringValue: 'RUB'}},
      {userEnteredValue: {stringValue: createdAt}},
      {userEnteredValue: {stringValue: date}},
    ],
  }
}


export async function fetchBalancesByAccountIds(
  client: t.GOAuth2Client,
  spreadsheetId: string,
  accountIds: Array<string>,
): Promise<t.BalancesById> {
  const outcomeIdsCond: string = f.map(accountIds, id => `F = '${id}'`).join(' OR ')
  const outcomeTable: t.GQueryTable | void = await querySheet(
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    `
    select F, sum(G)
    where ${outcomeIdsCond}
    group by F
    `,
  )
  const outcomeBalances: t.BalancesById = outcomeTable
   ? f.keyBy(f.map(outcomeTable.rows, rowToBalance), ({accountId}) => accountId)
   : {}

  const incomeIdsCond: string = f.map(accountIds, id => `H = '${id}'`).join(' OR ')
  const incomeTable: t.GQueryTable | void = await querySheet(
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    `
    select H, sum(I)
    where ${incomeIdsCond}
    group by H
    `,
  )
  const incomeBalances: t.BalancesById = incomeTable
    ? f.keyBy(f.map(incomeTable.rows, rowToBalance), ({accountId}) => accountId)
    : {}

  const ids = f.uniq(f.concat(f.keys(outcomeBalances), f.keys(incomeBalances)))

  const result: t.BalancesById = f.fold(ids, {}, (acc, id) => {
    const incomeBalance: t.Balance | void = incomeBalances[id]
    const outcomeBalance: t.Balance | void = outcomeBalances[id]
    const income = incomeBalance ? incomeBalance.balance : 0
    const outcome = outcomeBalance ? outcomeBalance.balance : 0

    /**
     * TODO Probably we have to use libs like Bignumber: https://github.com/MikeMcl/bignumber.js/
     * to solve problem related to floating numbers and precisions instead of
     * Math.round((income - outcome) * 100) / 100,
     */
    return {
      ...acc,
      [id]: {
        accountId: id,
        balance: Math.round((income - outcome) * 100) / 100,
      },
    }
  })

  return result
}


function rowToBalance(row: t.GQueryRow): t.Balance {
  return {
    accountId: row.c[0] ? String(row.c[0].v) : '',
    balance  : row.c[1] ? Number(row.c[1].v) : 0,
  }
}



/**
 * Categories
 */

export async function fetchCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Category | void> {
  const result: t.Category | void = await queryEntityById<t.Category>(
    client,
    spreadsheetId,
    s.CATEGORIES_SHEET_ID,
    id,
    rowToCategory,
  )
  return result
}

export async function createCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  fields       : t.JSONObject,
): Promise<t.Category> {
  const result: t.Category = await createEntity<t.Category>(
    client,
    spreadsheetId,
    s.CATEGORIES_SHEET_ID,
    {...fields, id: uuid()},
    categoryToRow,
    rowToCategory,
  )
  return result
}

export async function updateCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  fields       : t.JSONObject,
): Promise<t.Category> {
  const result: t.Category = await updateEntityById<t.Category>(
    client,
    spreadsheetId,
    s.CATEGORIES_SHEET_ID,
    id,
    {...fields},
    categoryToRow,
    rowToCategory,
  )
  return result
}

export async function deleteCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Category> {
  const result: t.Category = await deleteEntityById<t.Category>(
    client,
    spreadsheetId,
    s.CATEGORIES_SHEET_ID,
    id,
    rowToCategory,
  )
  return result
}

export async function fetchCategories(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
): Promise<t.Categories> {
  const result: t.Categories = await queryEntities<t.Category>(
    client,
    spreadsheetId,
    s.CATEGORIES_SHEET_ID,
    rowToCategory,
    `select * where A != 'id' order by B`
  )
  return result
}


function rowToCategory(row: t.GQueryRow): t.Category {
  return {
    id          : row.c[0] ? String(row.c[0].v) : '',
    title       : row.c[1] ? String(row.c[1].v) : '',
    createdAt   : row.c[2] ? String(row.c[2].v) : '',
    updatedAt   : row.c[3] ? String(row.c[3].v) : '',
    row         : row.c[4] ? Number(row.c[4].v) : 0,
  }
}

function categoryToRow(category: t.Category): t.GRowData {
  const date: string = new Date().toJSON()
  const createdAt: string = category.createdAt
    ? new Date(category.createdAt).toJSON()
    : date
  return {
    values: [
      {userEnteredValue: {stringValue: category.id}},
      {userEnteredValue: {stringValue: category.title}},
      {userEnteredValue: {stringValue: createdAt}},
      {userEnteredValue: {stringValue: date}},
    ],
  }
}



/**
 * Payees
 */

export async function fetchPayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Payee | void> {
  const result: t.Payee | void = await queryEntityById<t.Payee>(
    client,
    spreadsheetId,
    s.PAYEES_SHEET_ID,
    id,
    rowToPayee,
  )
  return result
}

export async function createPayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  fields       : t.JSONObject,
): Promise<t.Payee> {

  const result: t.Payee = await createEntity<t.Payee>(
    client,
    spreadsheetId,
    s.PAYEES_SHEET_ID,
    {...fields, id: uuid()},
    payeeToRow,
    rowToPayee,
  )
  return result
}

export async function updatePayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  fields       : t.JSONObject,
): Promise<t.Payee> {
  const result: t.Payee = await updateEntityById<t.Payee>(
    client,
    spreadsheetId,
    s.PAYEES_SHEET_ID,
    id,
    {...fields},
    payeeToRow,
    rowToPayee,
  )
  return result
}

export async function deletePayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Payee> {
  const result: t.Payee = await deleteEntityById<t.Payee>(
    client,
    spreadsheetId,
    s.PAYEES_SHEET_ID,
    id,
    rowToPayee,
  )
  return result
}

export async function fetchPayees(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
): Promise<t.Payees> {
  const result: t.Payees = await queryEntities<t.Payee>(
    client,
    spreadsheetId,
    s.PAYEES_SHEET_ID,
    rowToPayee,
    `select * where A != 'id' order by B`
  )
  return result
}


function rowToPayee(row: t.GQueryRow): t.Payee {
  return {
    id          : row.c[0] ? String(row.c[0].v) : '',
    title       : row.c[1] ? String(row.c[1].v) : '',
    createdAt   : row.c[2] ? String(row.c[2].v) : '',
    updatedAt   : row.c[3] ? String(row.c[3].v) : '',
    row         : row.c[4] ? Number(row.c[4].v) : 0,
  }
}

function payeeToRow(payee: t.Payee): t.GRowData {
  const date: string = new Date().toJSON()
  const createdAt: string = payee.createdAt
    ? new Date(payee.createdAt).toJSON()
    : date
  return {
    values: [
      {userEnteredValue: {stringValue: payee.id}},
      {userEnteredValue: {stringValue: payee.title}},
      {userEnteredValue: {stringValue: createdAt}},
      {userEnteredValue: {stringValue: date}},
    ],
  }
}


export async function fetchDebtsByPayeeIds(
  client: t.GOAuth2Client,
  spreadsheetId: string,
  payeeIds: Array<string>,
): Promise<t.DebtsById> {
  const payeeIdsCond: string = f.map(payeeIds, id => `D = '${id}'`).join(' OR ')

  const loansTable: t.GQueryTable | void = await querySheet(
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    `
    select D, sum(G)
    where F = '${s.DEBT_ACCOUNT_ID}' AND (${payeeIdsCond})
    group by D
    `,
  )
  const loanDebts: t.DebtsById = loansTable
   ? f.keyBy(f.map(loansTable.rows, rowToDebt), ({payeeId}) => payeeId)
   : {}

  const borrowsTable: t.GQueryTable | void = await querySheet(
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    `
    select D, sum(I)
    where H = '${s.DEBT_ACCOUNT_ID}' AND (${payeeIdsCond})
    group by D
    `,
  )
  const borrowDebts: t.DebtsById = borrowsTable
    ? f.keyBy(f.map(borrowsTable.rows, rowToDebt), ({payeeId}) => payeeId)
    : {}

  const ids = f.uniq(f.concat(f.keys(loanDebts), f.keys(borrowDebts)))

  const result: t.DebtsById = f.fold(ids, {}, (acc, id) => {
    const borrowDebt: t.Debt | void = borrowDebts[id]
    const borrowAmount = borrowDebt ? borrowDebt.debt : 0

    const loanDebt: t.Debt | void = loanDebts[id]
    const loanAmount = loanDebt ? loanDebt.debt : 0

    /**
     * TODO Probably we have to use libs like Bignumber: https://github.com/MikeMcl/bignumber.js/
     * to solve problem related to floating numbers and precisions instead of
     * Math.round((borrowAmount - loanAmount) * 100) / 100,
     */
    return {
      ...acc,
      [id]: {
        payeeId: id,
        debt: Math.round((borrowAmount - loanAmount) * 100) / 100,
      },
    }
  })

  return result
}

function rowToDebt(row: t.GQueryRow): t.Debt {
  return {
    payeeId: row.c[0]  ? String(row.c[0].v)  : '',
    debt   : row.c[1]  ? Number(row.c[1].v)  : 0,
  }
}



/**
 * Transactions
 */

export async function fetchTransaction(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Transaction | void> {
  const result: t.Transaction | void = await queryEntityById<t.Transaction>(
    client,
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    id,
    rowToTransaction,
  )
  return result
}

export async function createTransaction(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  fields       : t.JSONObject,
): Promise<t.Transaction> {
  const result: t.Transaction = await createEntity<t.Transaction>(
    client,
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    {...fields, id: uuid()},
    transactionToRow,
    rowToTransaction,
  )
  return result
}

export async function updateTransaction(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  fields       : t.JSONObject,
): Promise<t.Transaction> {
  const result: t.Transaction = await updateEntityById<t.Transaction>(
    client,
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    id,
    {...fields},
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
  const result: t.Transaction = await deleteEntityById<t.Transaction>(
    client,
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
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
  const result: t.Transactions = await queryEntities<t.Transaction>(
    client,
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    rowToTransaction,
    query,
  )
  return result
}

export async function fetchTransactionsNumber(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  filter       : t.TransactionsFilter,
): Promise<number> {
  const query: string = transactionsNumberQuery(filter)
  const result: number = await queryEntitiesNumber(
    client,
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
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

  const limit: number = parseInt(filter.limit, 10) || u.DEFAULT_LIMIT
  const offset: number = parseInt(filter.offset, 10)

  const query: string = f.compact([
    `select *`,
    `where ${where}`,
    `order by B desc, J desc`,
    limit  ? `limit ${limit}`   : undefined,
    offset ? `offset ${offset}` : undefined,
  ]).join(' ')

  return query
}

function transactionsNumberQuery(filter: t.TransactionsFilter): string {
  const where = transactionsWhere(filter)

  const query: string = f.compact([
    `select count(A)`,
    `where ${where}`,
  ]).join(' ')

  return query
}

function transactionsWhere(filter: t.TransactionsFilter): string {
  return f.compact([
    `A != 'id'`,
    filter.id         ? `A = '${filter.id}'`                                       : undefined,
    filter.dateFrom   ? `B >= '${filter.dateFrom}'`                           : undefined,
    filter.dateTo     ? `B <= '${filter.dateTo}'`                             : undefined,
    filter.categoryId ? `C = '${filter.categoryId}'`                               : undefined,
    filter.payeeId    ? `D = '${filter.payeeId}'`                                  : undefined,
    filter.comment    ? `lower(E) like lower('%${filter.comment}%')`               : undefined,
    filter.accountId  ? `(F = '${filter.accountId}' OR H = '${filter.accountId}')` : undefined,
    filter.amountFrom ? `G >= ${filter.amountFrom}`                                : undefined,
    filter.amountTo   ? `I <= ${filter.amountTo}`                                  : undefined,
  ]).join(' AND ')
}



/**
 * Spreadsheet
 */

export async function createAppSpreadsheet(client: t.GOAuth2Client, lang: string): Promise<t.GSpreadsheet> {
  const spreadsheet: t.GSpreadsheet | void = await createSpreadsheet(client, {
    resource: {
      properties: {
        title: SPREADSHEET_NAME,
      },
      sheets: [
        s.createTransactionsSheet(lang),
        s.createAccountsSheet(lang),
        s.createCategoriesSheet(lang),
        s.createPayeesSheet(lang),
        s.createVersionsSheet(),
      ],
    },
  })

  if (!spreadsheet) {
    throw new Error('Spreadsheet not found')
  }

  // TODO Check return value
  await addPermissions(client, {
    fileId: spreadsheet.spreadsheetId,
    resource: {
      type: 'anyone',
      role: 'reader',
    },
  })

  return spreadsheet
}



/**
 * Utils
 */

// TODO Probably replace generic by a common type for all key entities
async function queryEntityById<T>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  id           : string,
  rowToEntity  : (row: t.GQueryRow) => T,
): Promise<T | void> {
  if (!id) {
    throw new Error('Entity id required')
  }

  const query: string = `select * where A = '${id}'`
  const entities: Array<T> = await queryEntities<T>(
    client,
    spreadsheetId,
    sheetId,
    rowToEntity,
    query,
  )
  const entity: T | void = f.first(entities)

  return entity
}

// TODO Probably replace generic by a common type for all key entities
async function queryEntities<T>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  rowToEntity  : (row: t.GQueryRow) => T,
  query?: string,
): Promise<Array<T>> {
  const table: t.GQueryTable | void = await querySheet(
    spreadsheetId,
    sheetId,
    query || `select * where A != 'id'`,
  )
  const entities: Array<T> = table
   ? f.map(table.rows, row => rowToEntity(row))
   : []

  return entities
}

// TODO Probably replace generic by a common type for all key entities
export async function queryEntitiesNumber(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  query?: string,
): Promise<number> {
  const table: t.GQueryTable | void = await querySheet(
    spreadsheetId,
    sheetId,
    query || `select count(A) where A != 'id'`,
  )

  const rows: Array<t.GQueryRow> = table
    ? table.rows
    : []
  const row: t.GQueryRow | void = f.first(rows)
  const size: number = row && row.c[0] ? Number(row.c[0].v) : 0

  return size
}

// TODO Probably replace generic by a common type for all key entities
async function createEntity<T>(
  client        : t.GOAuth2Client,
  spreadsheetId : string,
  sheetId       : number,
  entity        : T,
  entityToRow   : (entity: T) => t.GRowData,
  rowToEntity   : (row: t.GQueryRow) => T,
): Promise<T> {
  await appendRow(client, spreadsheetId, sheetId, entityToRow(entity))

  const created: T | void = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    // $FlowFixMe
    entity.id,
    rowToEntity,
  )
  if (!created) {
    throw new Error('Entity was not created')
  }

  return created
}

// TODO Probably replace generic by a common type for all key entities
async function deleteEntityById<T>(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  id           : string,
  rowToEntity  : (row: t.GQueryRow) => T,
): Promise<T> {
  if (!id) {
    throw new Error('Entity id required')
  }

  const toDelete: T | void = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    id,
    rowToEntity,
  )
  if (!toDelete) {
    throw new Error('Entity not found')
  }

  // $FlowFixMe
  const rowNumber: number = toDelete.row
  if (!rowNumber) {
    throw new Error('Row number not found')
  }

  await deleteRow(client, spreadsheetId, sheetId, rowNumber)

  return toDelete
}

// TODO Probably replace generic by a common type for all key entities
async function updateEntityById<T>(
  client        : t.GOAuth2Client,
  spreadsheetId : string,
  sheetId       : number,
  id            : string,
  entity        : T,
  entityToRow   : (entity: T) => t.GRowData,
  rowToEntity   : (row: t.GQueryRow) => T,
): Promise<T> {
  if (!id) {
    throw new Error('Entity id required')
  }

  const toUpdate: T | void = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    id,
    rowToEntity,
  )
  if (!toUpdate) {
    throw new Error('Entity not found')
  }

  // $FlowFixMe
  const rowNumber: number = toUpdate.row
  if (!rowNumber) {
    throw new Error('Row number not found')
  }

  await updateRow(client, spreadsheetId, sheetId, rowNumber, entityToRow(entity))

  const updated: T | void = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    // $FlowFixMe
    entity.id,
    rowToEntity,
  )
  if (!updated) {
    throw new Error('Entity was not updated')
  }

  return updated
}


async function appendRow(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  row          : t.GRowData,
): Promise<void> {
  await batchUpdateSpreadsheet(client, {
    spreadsheetId,
    resource: {
      requests: [{
        appendCells: {
          sheetId,
          rows: [row],
          fields: '*',
        },
      }],
    },
  })
}

async function updateRow(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  rowNumber    : number,
  row          : t.GRowData,
): Promise<void> {
  await batchUpdateSpreadsheet(client, {
    spreadsheetId,
    resource: {
      requests: [{
        updateCells: {
          rows: [row],
          start: {
            sheetId,
            rowIndex: rowNumber - 1,
            columnIndex: 0,
          },
          fields: '*',
        },
      }],
    },
  })
}

async function deleteRow(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  rowNumber    : number,
): Promise<void> {
  await batchUpdateSpreadsheet(client, {
    spreadsheetId,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowNumber - 1,
            endIndex: rowNumber,
          },
        },
      }],
    },
  })
}

export function fetchSpreadsheet(client: t.GOAuth2Client, options: any): Promise<t.GSpreadsheet | void> {
  return google.sheets({version: 'v4', auth: client}).spreadsheets.get(options)
    .then(({data}) => data)
    .catch(error => {
      if (error.code === 404) return
      throw error
    })
}

export function createSpreadsheet(client: t.GOAuth2Client, options: any): Promise<t.GSpreadsheet | void> {
  return google.sheets({version: 'v4', auth: client}).spreadsheets.create(options)
    .then(({data}) => data)
}

export function batchUpdateSpreadsheet(client: t.GOAuth2Client, options: any): Promise<any> {
  return google.sheets({version: 'v4', auth: client}).spreadsheets.batchUpdate(options)
    .then(({data: {replies}}) => replies)
}

export function addPermissions(client: t.GOAuth2Client, options: any): Promise<void> {
  return google.drive({version: 'v3', auth: client}).permissions.create(options)
}


async function querySheet(spreadsheetId: string, sheetId: number, query?: string): Promise<t.GQueryTable | void> {
  const queryString: string = qs.stringify({tq: query, gid: sheetId})
  const url: string = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?${queryString}`

  return await u.fetch({url}).then(({body}) => {
    const matches = body && body.match(/google\.visualization\.Query\.setResponse\((.*)\);$/)
    const match: string | null = matches && matches[1]
    if (!match) {
      return undefined
    }

    const data: t.GQueryRes = JSON.parse(match)
    if (!data) {
      return undefined
    }

    return data.table
  })
}


export function fetchUserInfo(client: t.GOAuth2Client): Promise<t.GUser | void> {
  return google.oauth2({version: 'v2', auth: client}).userinfo.get()
    .then(({data}) => data)
}
