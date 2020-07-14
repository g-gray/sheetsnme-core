import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as u from '../utils'
import * as err from '../error'

import * as tn from '../transaction/net'

import * as n from './net'

export async function getCategories(ctx: t.KContext): Promise<t.CategoryRes[]> {
  const {client, gSpreadsheetId} = ctx

  const categories: t.CategoryResult[] = await n.fetchCategories(
    client,
    gSpreadsheetId
  )

  const response: t.CategoryRes[] = categories.map(n.categoryToFields)

  return response
}

export async function getCategory(ctx: t.KContext): Promise<t.CategoryRes> {
  const {params: {id}, client, gSpreadsheetId} = ctx
  if (!id) {
    throw new err.BadRequest(t.CATEGORY_ERROR.ID_REQUIRED)
  }

  const category: void | t.CategoryResult = await n.fetchCategory(
    client,
    gSpreadsheetId,
    id
  )
  if (!category) {
    throw new err.NotFound(t.CATEGORY_ERROR.NOT_FOUND)
  }

  const response = n.categoryToFields(category)
  return response
}

export async function createCategory(ctx: t.KContext): Promise<t.CategoryRes> {
  const {request: {body}, client, gSpreadsheetId, lang} = ctx

  // TODO Replace validation by parsing with error throwing
  const errors: t.ValidationErrors = n.validateCategoryFields(body, lang)
  if (errors.length) {
    throw new err.ValidationError({errors})
  }

  const category: t.CategoryResult = await n.createCategory(
    client,
    gSpreadsheetId,
    n.fieldsToCategory(body)
  )

  const response = n.categoryToFields(category)
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

  const category: t.CategoryResult = await n.updateCategory(
    client,
    gSpreadsheetId,
    id,
    n.fieldsToCategory(body)
  )

  const response = n.categoryToFields(category)
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

  const category: t.CategoryResult = await n.deleteCategory(
    client,
    gSpreadsheetId,
    id
  )

  const response = n.categoryToFields(category)
  return response
}



/**
 * Spendings
 */

export async function getCategoriesSpendings(
  ctx: t.KContext
): Promise<t.CategoriesSpendingsRes> {
  const {query, client, gSpreadsheetId} = ctx

  // TODO Replace validation by parsing with error throwing
  const errors = n.validateSpendingsByCategoryIdFilter(query)
  if (errors.length) {
    throw new err.ValidationError({errors})
  }
  const filter: t.SpendingsByCategoryIdFilter = query

  const categories = await n.fetchCategories(client, gSpreadsheetId)
  const spendingsByCategoryId = await n.fetchSpendingsByCategoryId(
    gSpreadsheetId,
    filter
  )

  const response: t.CategoriesSpendingsRes = fpx.keyBy(
    categories.map((category) => {
      const spending = spendingsByCategoryId[category.id]
        ? spendingsByCategoryId[category.id].spending
        : 0

      return {
        categoryId: category.id,
        spending: u.round(spending, 2),
      }
    }),
    (spending: t.Spending) => spending.categoryId
  )

  return response
}
