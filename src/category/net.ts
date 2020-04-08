import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'
import uuid from 'uuid/v4'

import * as u from '../utils'
import * as tr from '../translations'

import * as ss from '../sheet/sheets'
import * as en from '../entity/net'

export async function fetchCategory(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  id           : string,
): Promise<t.Category | void> {
  const result: t.Category | void = await en.queryEntityById<t.Category>(
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
  category     : t.Category,
): Promise<t.Category> {
  const result: t.Category = await en.createEntity<t.Category>(
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
  category     : t.Category,
): Promise<t.Category> {
  const result: t.Category = await en.updateEntityById<t.Category>(
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
): Promise<t.Category> {
  const result: t.Category = await en.deleteEntityById<t.Category>(
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
): Promise<t.Categories> {
  const result: t.Categories = await en.queryEntities<t.Category>(
    client,
    spreadsheetId,
    ss.CATEGORIES_SHEET_ID,
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


export function validateCategoryFields(fields: any, lang: t.Lang): t.ResErrors {
  const errors: t.ResErrors = []
  const {title} = fields

  if (!fpx.isString(title) || !title.length) {
    errors.push({text: u.xln(lang, tr.TITLE_MUST_BE_NON_EMPTY_STRING)})
  }

  return errors
}

export function categoryToFields(category: t.Category): t.CategoryFields {
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

export function fieldsToCategory(fields: t.CategoryFields): t.Category {
  const {
    id,
    title,
  }: t.CategoryFields = fields

  return {
    id   : id || uuid(),
    title: title || '',
  }
}
