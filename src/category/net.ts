import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as i18n from '../i18n'

import * as ss from '../sheet/sheets'
import * as sn from '../sheet/net'
import * as en from '../entity/net'

/**
 * Category
 */

export async function fetchCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<void | t.CategoryResult> {
  const result: void | t.CategoryResult = await en.queryEntityById<t.CategoryResult>(
    client,
    spreadsheetId,
    ss.CATEGORIES_SHEET_ID,
    id,
    rowToCategory,
  )
  return result
}

export async function createCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  category     : t.CategoryQuery,
): Promise<t.CategoryResult> {
  const result: t.CategoryResult = await en.createEntity<t.CategoryQuery, t.CategoryResult>(
    client,
    spreadsheetId,
    ss.CATEGORIES_SHEET_ID,
    category,
    categoryToRow,
    rowToCategory,
  )
  return result
}

export async function updateCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
  category     : t.CategoryQuery,
): Promise<t.CategoryResult> {
  const result: t.CategoryResult = await en.updateEntityById<t.CategoryQuery, t.CategoryResult>(
    client,
    spreadsheetId,
    ss.CATEGORIES_SHEET_ID,
    id,
    category,
    categoryToRow,
    rowToCategory,
  )
  return result
}

export async function deleteCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.CategoryResult> {
  const result: t.CategoryResult = await en.deleteEntityById<t.CategoryResult>(
    client,
    spreadsheetId,
    ss.CATEGORIES_SHEET_ID,
    id,
    rowToCategory,
  )
  return result
}

export async function fetchCategories(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
): Promise<t.CategoryResult[]> {
  const result: t.CategoryResult[] = await en.queryEntities<t.CategoryResult>(
    client,
    spreadsheetId,
    ss.CATEGORIES_SHEET_ID,
    rowToCategory,
    `SELECT * WHERE A != 'id' ORDER BY B`
  )
  return result
}


function rowToCategory(row: t.GQueryRow): t.CategoryRowDataResult {
  return {
    id          : row.c[0] ? String(row.c[0].v) : '',
    title       : row.c[1] ? String(row.c[1].v) : '',
    createdAt   : row.c[2] ? String(row.c[2].v) : '',
    updatedAt   : row.c[3] ? String(row.c[3].v) : '',
    row         : row.c[4] ? Number(row.c[4].v) : 0,
  }
}

function categoryToRow(rowData: t.CategoryRowDataQuery): t.GRowData {
  return {
    values: [
      {userEnteredValue: {stringValue: rowData.id}},
      {userEnteredValue: {stringValue: rowData.title}},
      {userEnteredValue: {stringValue: rowData.createdAt}},
      {userEnteredValue: {stringValue: rowData.updatedAt}},
    ],
  }
}


export function validateCategoryFields(fields: any, lang: t.Lang): t.ValidationErrors {
  const errors: t.ValidationErrors = []
  const {title} = fields

  if (!fpx.isString(title) || !title.length) {
    errors.push({text: i18n.xln(lang, i18n.TITLE_MUST_BE_NON_EMPTY_STRING)})
  }

  return errors
}

export function categoryToFields(category: t.CategoryResult): t.CategoryRes {
  const {
    id,
    title,
    createdAt,
    updatedAt,
  } = category

  return {
    id,
    title,
    createdAt,
    updatedAt,
  }
}

export function fieldsToCategory(fields: t.CategoryReq): t.CategoryQuery {
  const {
    id,
    title,
    createdAt,
    updatedAt,
  } = fields

  return {
    id,
    title,
    createdAt,
    updatedAt,
  }
}



/**
 * Spendings
 */

export async function fetchSpendingsByCategoryId(
  spreadsheetId: string,
  filter       : t.SpendingsByCategoryIdFilter,
): Promise<t.SpendingsByCategoryId> {
  const query: string = spendingsByCategoryIdQuery(filter)
  const spendingsTable: void | t.GQueryTable = await sn.querySheet(
    spreadsheetId,
    ss.TRANSACTIONS_SHEET_ID,
    query
  )

  let spendingsByCategoryId: t.SpendingsByCategoryId = {}
  if (spendingsTable) {
    spendingsByCategoryId = fpx.keyBy(
      spendingsTable.rows.map(rowToSpending),
      (spending: t.Spending) => spending.categoryId
    )
  }

  return spendingsByCategoryId
}


function spendingsByCategoryIdQuery(
  filter: t.SpendingsByCategoryIdFilter
): string {
  const where = spendingsByCategoryIdWhere(filter)

  const query: string = `
    SELECT C, SUM(G)
    WHERE ${where}
    GROUP BY C
  `

  return query
}

function spendingsByCategoryIdWhere(
  filter: t.SpendingsByCategoryIdFilter
): string {
  return fpx.compact([
    `A != 'id'`,
    filter.dateFrom ? `B >= '${filter.dateFrom}'`: '',
    filter.dateTo   ? `B <= '${filter.dateTo}'`  : '',
  ]).join(' AND ')
}


function rowToSpending(row: t.GQueryRow): t.Spending {
  return {
    categoryId: row.c[0] ? String(row.c[0].v): '',
    spending  : row.c[1] ? Number(row.c[1].v): 0,
  }
}


export function validateSpendingsByCategoryIdFilter(
  filter: any
): t.ValidationErrors {
  const errors: t.ValidationErrors = []

  if (filter.dateFrom && !fpx.isValidDate(new Date(filter.dateFrom))) {
    errors.push({text: t.CATEGORY_ERROR.DATE_FROM_MUST_BE_A_VALID_DATE})
  }

  if (filter.dateTo && !fpx.isValidDate(new Date(filter.dateTo))) {
    errors.push({text: t.CATEGORY_ERROR.DATE_TO_MUST_BE_A_VALID_DATE})
  }

  return errors
}
