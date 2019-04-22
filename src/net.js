// @flow
import {google} from 'googleapis'
import * as f from 'fpx'
import uuid from 'uuid/v4'
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
  fields       : any,
): Promise<t.Account> {
  const result: t.Account = await createEntity<t.Account>(
    client,
    spreadsheetId,
    s.ACCOUNTS_SHEET_ID,
    {...fields, id: uuid()},
    validateAccountFields,
    accountToRow,
    rowToAccount,
  )
  return result
}

export async function updateAccount(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  fields       : any,
): Promise<t.Account> {
  const result: t.Account = await updateEntityById<t.Account>(
    client,
    spreadsheetId,
    s.ACCOUNTS_SHEET_ID,
    id,
    fields,
    validateAccountFields,
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

function validateAccountFields(fields: any): t.ResErrors {
  const errors = []

  if (!fields.title || !f.isString(fields.title) || !fields.title.length) {
    errors.push({text: 'Title must be non empty string'})
  }

  // if (fields.currencyCode !== 'RUB') {
  //   errors.push({text: 'Currency Code must be one of these: \'RUB\''})
  // }

  return errors
}


export async function fetchBalancesByAccountIds(
  client: t.GOAuth2Client,
  spreadsheetId: string,
  accountIds: Array<string>,
): t.Balances {
  const outcomeIdsCond: string = f.map(accountIds, id => `F = '${id}'`).join(' OR ')
  const outcomeTable: t.GQueryTable = await querySheet(
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    `select F, sum(G) where ${outcomeIdsCond} group by F`,
  )
  const outcomeBalances: t.Balances = f.keyBy(
    f.map(outcomeTable && outcomeTable.rows, rowToBalance),
    ({accountId}) => accountId
  )

  const incomeIdsCond: string = f.map(accountIds, id => `H = '${id}'`).join(' OR ')
  const incomeTable: t.GQueryTable = await querySheet(
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    `select H, sum(I) where ${incomeIdsCond} group by H`,
  )
  const incomeBalances: t.Balances = f.keyBy(
    f.map(incomeTable && incomeTable.rows, rowToBalance),
    ({accountId}) => accountId
  )

  const ids = f.uniq(f.concat(f.keys(outcomeBalances), f.keys(incomeBalances)))

  const result: t.Balances = f.fold(ids, {}, (acc, id) => {
    const incomeBalance: t.Balance | void = incomeBalances[id]
    const outcomeBalance: t.Balance | void = outcomeBalances[id]
    const income = incomeBalance ? incomeBalance.balance : 0
    const outcome = outcomeBalance ? outcomeBalance.balance : 0
    return {
      ...acc,
      [id]: {
        accountId: id,
        balance: income - outcome,
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
  fields       : any,
): Promise<t.Category> {
  const result: t.Category = await createEntity<t.Category>(
    client,
    spreadsheetId,
    s.CATEGORIES_SHEET_ID,
    {...fields, id: uuid()},
    validateCategoryFields,
    categoryToRow,
    rowToCategory,
  )
  return result
}

export async function updateCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  fields       : any,
): Promise<t.Category> {
  const result: t.Category = await updateEntityById<t.Category>(
    client,
    spreadsheetId,
    s.CATEGORIES_SHEET_ID,
    id,
    fields,
    validateCategoryFields,
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

function validateCategoryFields(fields: any): t.ResErrors {
  const errors = []

  if (!fields.title || !f.isString(fields.title) || !fields.title.length) {
    errors.push({text: 'Title must be non empty string'})
  }

  return errors
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
  fields       : any,
): Promise<t.Payee> {

  const result: t.Payee = await createEntity<t.Payee>(
    client,
    spreadsheetId,
    s.PAYEES_SHEET_ID,
    {...fields, id: uuid()},
    validatePayeeFields,
    payeeToRow,
    rowToPayee,
  )
  return result
}

export async function updatePayee(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  fields       : any,
): Promise<t.Payee> {
  const result: t.Payee = await updateEntityById<t.Payee>(
    client,
    spreadsheetId,
    s.PAYEES_SHEET_ID,
    id,
    fields,
    validatePayeeFields,
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

function validatePayeeFields(fields: any): t.ResErrors {
  const errors = []

  if (!fields.title || !f.isString(fields.title) || !fields.title.length) {
    errors.push({text: 'Title must be non empty string'})
  }

  return errors
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
  fields       : any,
): Promise<t.Transaction> {
  const result: t.Transaction = await createEntity<t.Transaction>(
    client,
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    {...fields, id: uuid()},
    validateTransactionFields,
    transactionToRow,
    rowToTransaction,
  )
  return result
}

export async function updateTransaction(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  fields       : any,
): Promise<t.Transaction> {
  const result: t.Transaction = await updateEntityById<t.Transaction>(
    client,
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
    id,
    fields,
    validateTransactionFields,
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
  const query: string = filterTransactionsQuery(filter)
  const result: t.Transactions = await queryEntities<t.Transaction>(
    client,
    spreadsheetId,
    s.TRANSACTIONS_SHEET_ID,
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

function filterTransactionsQuery(filter: t.TransactionsFilter): string {
  const where = f.compact([
    `A != 'id'`,
    filter.id         ? `A = '${filter.id}'`                                       : undefined,
    filter.dateFrom   ? `B >= date '${filter.dateFrom}'`                           : undefined,
    filter.dateTo     ? `B <= date '${filter.dateTo}'`                             : undefined,
    filter.categoryId ? `C = '${filter.categoryId}'`                               : undefined,
    filter.payeeId    ? `lower(D) like lower('%${filter.payeeId}%')`               : undefined,
    filter.comment    ? `lower(E) like lower('%${filter.comment}%')`               : undefined,
    filter.accountId  ? `(F = '${filter.accountId}' OR H = '${filter.accountId}')` : undefined,
    filter.amountFrom ? `G >= ${filter.amountFrom}`                                : undefined,
    filter.amountTo   ? `I <= ${filter.amountTo}`                                  : undefined,
  ]).join(' AND ')

  const query: string = [
    `select *`,
    `where ${where}`,
    `order by B desc, J desc`,
  ].join(' ')
  return query
}

function validateTransactionFields(fields: any): t.ResErrors {
  const errors = []

  if (!fields.date || !f.isValidDate(new Date(fields.date))) {
    errors.push({text: 'Date must be non empty and valid'})
  }

  if (!fields.outcomeAccountId && !fields.incomeAccountId) {
    errors.push({text: 'Outcome/Income account required'})
  }

  if (fields.outcomeAccountId && !f.isNumber(fields.outcomeAmount)) {
    errors.push({text: 'Outcome amount must be a valid number'})
  }

  if (fields.incomeAccountId && !f.isNumber(fields.incomeAmount)) {
    errors.push({text: 'Income amount must be a valid number'})
  }

  return errors
}



/**
 * Spreadsheet
 */

export async function createAppSpreadsheet(client: t.GOAuth2Client): Promise<t.GSpreadsheet> {
  const spreadsheet: t.GSpreadsheet | void = await createSpreadsheet(client, {
    resource: {
      properties: {
        title: SPREADSHEET_NAME,
      },
      sheets: [
        s.createTransactionsSheet(),
        s.createAccountsSheet(),
        s.createCategoriesSheet(),
        s.createPayeesSheet(),
        s.createVersionsSheet(),
      ],
    },
  })

  if (!spreadsheet) {
    throw new u.PublicError('Spreadsheet not found')
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
    throw new u.PublicError('Entity id is required')
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
  const table: t.GQueryTable = await querySheet(
    spreadsheetId,
    sheetId,
    query || `select * where A != 'id'`,
  )
  const entities: Array<T> = f.map(table.rows, row => rowToEntity(row))
  return entities
}

// TODO Probably replace generic by a common type for all key entities
async function createEntity<T>(
  client        : t.GOAuth2Client,
  spreadsheetId : string,
  sheetId       : number,
  fields        : any,
  validateFields: (fields: any) => t.ResErrors,
  entityToRow   : (entity: T) => t.GRowData,
  rowToEntity   : (row: t.GQueryRow) => T,
): Promise<T> {
  const errors: t.ResErrors = validateFields(fields)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const entity: T = fields
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
    throw new u.PublicError('Entity was not created')
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
    throw new u.PublicError('Entity id is required')
  }

  const toDelete: T | void = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    id,
    rowToEntity,
  )
  if (!toDelete) {
    throw new u.PublicError('Entity not found')
  }

  // $FlowFixMe
  const rowNumber: number = toDelete.row
  if (!rowNumber) {
    throw new u.PublicError('Row number not found')
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
  fields        : any,
  validateFields: (fields: any) => t.ResErrors,
  entityToRow   : (entity: T) => t.GRowData,
  rowToEntity   : (row: t.GQueryRow) => T,
): Promise<T> {
  if (!id) {
    throw new u.PublicError('Entity id is required')
  }

  const errors: t.ResErrors = validateFields(fields)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
  }

  const toUpdate: T | void = await queryEntityById<T>(
    client,
    spreadsheetId,
    sheetId,
    id,
    rowToEntity,
  )
  if (!toUpdate) {
    throw new u.PublicError('Entity not found')
  }

  // $FlowFixMe
  const rowNumber: number = toUpdate.row
  if (!rowNumber) {
    throw new u.PublicError('Row number not found')
  }

  const entity: T = fields
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
    throw new u.PublicError('Entity was not updated')
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

// TODO It is unused currently. Candidate to be deleted
export function fetchSpreadsheet(client: t.GOAuth2Client, options: any): Promise<t.GSpreadsheet | void> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.get(options, (err, res) => {
      if (err) throw Error(err)
      resolve(res.data)
    })
  })
}

export function createSpreadsheet(client: t.GOAuth2Client, options: any): Promise<t.GSpreadsheet | void> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.create(options, (err, res) => {
      if (err) throw Error(err)
      resolve(res.data)
    })
  })
}

export function batchUpdateSpreadsheet(client: t.GOAuth2Client, options: any): Promise<any> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth: client}).spreadsheets.batchUpdate(options, (err, res) => {
      if (err) throw Error(err)
      resolve(res.data.replies)
    })
  })
}

export function addPermissions(client: t.GOAuth2Client, options: any): Promise<void> {
  return new Promise(resolve => {
    google.drive({version: 'v3', auth: client}).permissions.create(options, err => {
      if (err) throw Error(err)
      resolve()
    })
  })
}


async function querySheet(spreadsheetId: string, sheetId: number, query?: string): Promise<t.GQueryTable> {
  const encodedQuery: string = encodeURIComponent(query || '')
  // TODO Use util to join query params instead of inline them
  const url: string = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tq=${encodedQuery}&gid=${sheetId}`

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
  return new Promise(resolve => {
    google.oauth2({version: 'v2', auth: client}).userinfo.get((err, res) => {
      if (err) throw Error(err)
      resolve(res.data)
    })
  })
}
