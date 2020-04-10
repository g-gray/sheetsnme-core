import * as Koa from 'koa'
import * as pg from 'pg'

import {GOAuth2Client} from './auth/types'
export * from './auth/types'

export * from './user/types'

export * from './sheet/types'

export * from './entity/types'
export * from './account/types'
export * from './category/types'
export * from './payee/types'
export * from './transaction/types'

/**
 * Env
 */

export type EnvProperties = {
  HOST               : string,
  PORT               : number,
  LOGOUT_URL         : string,
  CLIENT_ID          : string,
  CLIENT_SECRET      : string,
  REDIRECT_URL       : string,
  SPREADSHEET_NAME   : string,
  DB_NAME            : string,
  DB_HOST            : string,
  POSTGRES_USER      : string,
  POSTGRES_PASSWORD  : string,
  PGSCRIPT_DB_URL    : string,
  SESSION_COOKIE_NAME: string,
  SESSION_HEADER_NAME: string,
  LANG_HEADER_NAME   : string,
  CRYPTO_ALGORITHM   : string,
  CRYPTO_PASSWORD    : string,
  CRYPTO_SALT        : string,
  CRYPTO_KEYLENGTH   : number,
  DATABASE_URL       : string,
}

/**
 * Context
 */

export type KContext = Koa.Context

export type CustomContext = {
  lang          : Lang,
  sessionId     : string,
  client        : GOAuth2Client,
  gSpreadsheetId: string,
}

/**
 * Middleware
 */

export type KNext = Koa.Next

/**
 * Database
 */

export type PGClientConfig = pg.ClientConfig
export type PGPool = pg.Pool
export type PGQueryResult = pg.QueryResult
export type PGQueryResultRow = pg.QueryResultRow

/**
 * Net
 */

export type XHttpParams = {
  url     : string,
  method? : string,
  headers?: {[key: string]: string},
  timeout?: number,
  body?   : (object | string),
}

export type XHttpResponse = {
  ok        : boolean,
  status    : string,
  statusText: string,
  reason    : string,
  headers   : {[key: string]: string},
  body      : (object | string),
  params    : XHttpParams,
}

/**
 * i18n
 */

export type Lang = 'en' | 'ru'

export type Translations = {
  en: string,
  ru: string,
}

/**
 * Errors
 */



export interface IPublicError extends Error {
  status: number
  body: any
}

export interface IPublicErrorConstructor extends ErrorConstructor {
  new (status: number, message: string, body?: any): IPublicError
  (status: number, message: string, body?: any): IPublicError
  readonly prototype: IPublicError
}

export type ValidationError = {
  text: string,
}

export type ValidationErrors = ValidationError[]

export type ValidationErrorBody = {errors: ValidationErrors}

export interface IValidationError extends IPublicError {}

export interface IValidationErrorConstructor extends IPublicErrorConstructor {
  new (body?: ValidationErrorBody): IValidationError
  (body?: ValidationErrorBody): IValidationError
  readonly prototype: IValidationError
}

export enum APP_ERROR {
  NOT_ACCEPTABLE = 'NOT_ACCEPTABLE',
}
