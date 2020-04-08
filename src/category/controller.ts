import * as t from '../types'

// @ts-ignore
import * as fpx from 'fpx'

import * as m from './model'
import * as u from '../utils'
import * as s from '../sheets'

import {fetchTransactions} from '../transaction/model'

export async function getCategories(ctx: t.KContext): Promise<void> {
  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const categories: t.Categories = await m.fetchCategories(client, gSpreadsheetId)
  ctx.body = fpx.map(categories, m.categoryToFields)
}

export async function getCategory(ctx: t.KContext): Promise<void> {
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Category id required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const category: t.Category | void = await m.fetchCategory(client, gSpreadsheetId, id)
  if (!category) {
    ctx.throw(404, 'Category not found')
    return
  }

  ctx.body = m.categoryToFields(category)
}

export async function createCategory(ctx: t.KContext): Promise<void> {
  const errors: t.ResErrors = m.validateCategoryFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
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
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Category id required')
    return
  }

  const errors: t.ResErrors = m.validateCategoryFields(ctx.request.body, ctx.lang)
  if (errors.length) {
    throw new u.PublicError('Validation error', {errors})
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
  const id: string | void = ctx.params.id
  if (!id) {
    ctx.throw(400, 'Category id required')
    return
  }

  const client: t.GOAuth2Client = ctx.client
  const gSpreadsheetId: string = ctx.gSpreadsheetId
  const transactions: t.Transactions = await fetchTransactions(client, gSpreadsheetId, {categoryId: id})
  if (transactions.length) {
    ctx.throw(400, 'Can not delete. There are related transactions')
    return
  }

  const category: t.Category = await m.deleteCategory(client, gSpreadsheetId, id)
  ctx.body = m.categoryToFields(category)
}
