import * as t from '../types'

import * as u from '../utils'

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
    throw new u.PublicError(400, t.CATEGORY_ERROR.ID_REQUIRED)
  }

  const category: void | t.CategoryResult = await m.fetchCategory(
    client,
    gSpreadsheetId,
    id
  )
  if (!category) {
    throw new u.PublicError(404, t.CATEGORY_ERROR.NOT_FOUND)
  }

  const response = m.categoryToFields(category)
  return response
}

export async function createCategory(ctx: t.KContext): Promise<t.CategoryRes> {
  const {request: {body}, client, gSpreadsheetId, lang} = ctx

  const errors: t.ValidationErrors = m.validateCategoryFields(body, lang)
  if (errors.length) {
    throw new u.ValidationError({errors})
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
    throw new u.PublicError(400, t.CATEGORY_ERROR.ID_REQUIRED)
  }

  const errors: t.ValidationErrors = m.validateCategoryFields(body, lang)
  if (errors.length) {
    throw new u.ValidationError({errors})
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
  const {paras: {id}, client, gSpreadsheetId} = ctx
  if (!id) {
    throw new u.PublicError(400, t.CATEGORY_ERROR.ID_REQUIRED)
  }

  const transactions: t.TransactionResult[] = await tn.fetchTransactions(
    client,
    gSpreadsheetId,
    {categoryId: id}
  )
  if (transactions.length) {
    throw new u.PublicError(400, t.CATEGORY_ERROR.THERE_ARE_RELATED_ENTITIES)
  }

  const category: t.CategoryResult = await m.deleteCategory(
    client,
    gSpreadsheetId,
    id
  )

  const response = m.categoryToFields(category)
  return response
}
