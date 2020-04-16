import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as u from '../utils'

import * as tn from '../transaction/net'

import * as m from './net'

export async function getCategories(ctx: t.KContext): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const categories: t.Categories = await m.fetchCategories(client, gSpreadsheetId)
  ctx.body = fpx.map(categories, m.categoryToFields)
}

export async function getCategory(ctx: t.KContext): Promise<void> {
  const id: void | string = ctx.params.id
  if (!id) {
    throw new u.PublicError(400, t.CATEGORY_ERROR.ID_REQUIRED)
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const category: void | t.Category = await m.fetchCategory(client, gSpreadsheetId, id)
  if (!category) {
    throw new u.PublicError(404, t.CATEGORY_ERROR.NOT_FOUND)
  }

  ctx.body = m.categoryToFields(category)
}

export async function createCategory(ctx: t.KContext): Promise<void> {
  const errors: t.ValidationErrors = m.validateCategoryFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.ValidationError({errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const category: t.Category = await m.createCategory(
    client,
    gSpreadsheetId,
    m.fieldsToCategory(ctx.request.body)
  )

  ctx.body = m.categoryToFields(category)
}

export async function updateCategory(ctx: t.KContext): Promise<void> {
  const id: void | string = ctx.params.id
  if (!id) {
    throw new u.PublicError(400, t.CATEGORY_ERROR.ID_REQUIRED)
  }

  const errors: t.ValidationErrors = m.validateCategoryFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.ValidationError({errors})
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const category: t.Category = await m.updateCategory(
    client,
    gSpreadsheetId,
    id,
    m.fieldsToCategory(ctx.request.body)
  )

  ctx.body = m.categoryToFields(category)
}

export async function deleteCategory(ctx: t.KContext): Promise<void> {
  const id: void | string = ctx.params.id
  if (!id) {
    throw new u.PublicError(400, t.CATEGORY_ERROR.ID_REQUIRED)
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transactions: t.Transactions = await tn.fetchTransactions(
    client,
    gSpreadsheetId,
    {categoryId: id}
  )

  if (transactions.length) {
    throw new u.PublicError(400, t.CATEGORY_ERROR.THERE_ARE_RELATED_ENTITIES)
  }

  const category: t.Category = await m.deleteCategory(client, gSpreadsheetId, id)
  ctx.body = m.categoryToFields(category)
}
