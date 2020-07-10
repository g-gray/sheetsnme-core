import * as t from '../types'

import * as err from '../error'

import * as tn from '../transaction/net'

import * as m from './net'

export async function getCategories(ctx: t.KContext): Promise<t.CategoryRes[]> {
  const {client, gSpreadsheetId} = ctx
  const categories: t.CategoryResult[] = await m.fetchCategories(
    client,
    gSpreadsheetId
  )

  const response = categories.map(m.categoryToFields)
  return response
}

export async function getCategory(ctx: t.KContext): Promise<t.CategoryRes> {
  const {params: {id}, client, gSpreadsheetId} = ctx
  if (!id) {
    throw new err.BadRequest(t.CATEGORY_ERROR.ID_REQUIRED)
  }

  const category: void | t.CategoryResult = await m.fetchCategory(
    client,
    gSpreadsheetId,
    id
  )
  if (!category) {
    throw new err.NotFound(t.CATEGORY_ERROR.NOT_FOUND)
  }

  const response = m.categoryToFields(category)
  return response
}

export async function createCategory(ctx: t.KContext): Promise<t.CategoryRes> {
  const {request: {body}, client, gSpreadsheetId, lang} = ctx

  // TODO Replace validation by parsing with error throwing
  const errors: t.ValidationErrors = n.validateCategoryFields(body, lang)
  if (errors.length) {
    throw new err.ValidationError({errors})
  }

  const category: t.CategoryResult = await m.createCategory(
    client,
    gSpreadsheetId,
    m.fieldsToCategory(body)
  )

  const response = m.categoryToFields(category)
  return response
}

export async function updateCategory(ctx: t.KContext): Promise<t.CategoryRes> {
  const {params: {id}, request: {body}, client, gSpreadsheetId, lang} = ctx
  if (!id) {
    throw new err.BadRequest(t.CATEGORY_ERROR.ID_REQUIRED)
  }

  // TODO Replace validation by parsing with error throwing
  const errors: t.ValidationErrors = n.validateCategoryFields(body, lang)
  if (errors.length) {
    throw new err.ValidationError({errors})
  }

  const category: t.CategoryResult = await m.updateCategory(
    client,
    gSpreadsheetId,
    id,
    m.fieldsToCategory(body)
  )

  const response = m.categoryToFields(category)
  return response
}

export async function deleteCategory(ctx: t.KContext): Promise<t.CategoryRes> {
  const {params: {id}, client, gSpreadsheetId} = ctx
  if (!id) {
    throw new err.BadRequest(t.CATEGORY_ERROR.ID_REQUIRED)
  }

  const transactions: t.TransactionResult[] = await tn.fetchTransactions(
    client,
    gSpreadsheetId,
    {categoryId: id}
  )
  if (transactions.length) {
    throw new err.BadRequest(t.CATEGORY_ERROR.THERE_ARE_RELATED_ENTITIES)
  }

  const category: t.CategoryResult = await m.deleteCategory(
    client,
    gSpreadsheetId,
    id
  )

  const response = m.categoryToFields(category)
  return response
}
