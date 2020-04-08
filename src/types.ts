import * as Koa from 'koa'
import {oauth2_v2, drive_v3, sheets_v4} from 'googleapis'
import {OAuth2Client, Credentials} from 'google-auth-library';

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
 * Auth
 */

export type Session = {
  id        : string,
  userId    : string,
  createdAt?: Date,
  updatedAt?: Date,
}

export type SessionQueryFields = {
  id?       : string,
  userId    : string,
  createdAt?: Date,
  updatedAt?: Date,
}



/**
 * User
 */

export type User = {
  id           : string,
  externalId   : string,
  pictureUrl   : string,
  email        : string,
  emailVerified: boolean,
  firstName    : string,
  lastName     : string,
  externalToken: string,
  createdAt    : Date,
  updatedAt    : Date,
}

export type UserQueryFields = {
  externalId   : string,
  pictureUrl   : string,
  email        : string,
  emailVerified: boolean,
  firstName    : string,
  lastName     : string,
  externalToken: string,
  createdAt?   : Date,
  updatedAt?   : Date,
}



/**
 * Spreadsheet
 */

export type Spreadsheet = {
  id        : string,
  userId    : string,
  externalId: string,
  createdAt : Date,
  updatedAt : Date,
}

export type Spreadsheets = Spreadsheet[]



/**
 * Entity
 */

export type Entity = {
  id  : string,
  row?: number,
}

/**
 * Account
 */

export type Account = {
  id          : string,
  title       : string,
  currencyCode: string,
  createdAt?  : string,
  updatedAt?  : string,
  row?        : number,
}

export type Accounts = Account[]

export type AccountFields = {
  id?          : string,
  title        : string,
  currencyCode?: string,
  createdAt?   : string,
  updatedAt?   : string,
}


/**
 * Balance
 */

export type Balance = {
  accountId: string,
  balance  : number,
}

export type BalancesById = {[key: string]: Balance}



/**
 * Category
 */

export type Category = {
  id        : string,
  title     : string,
  createdAt?: string,
  updatedAt?: string,
  row?      : number,
}

export type Categories = Category[]

export type CategoryFields = {
  id        : string,
  title     : string,
  createdAt?: string,
  updatedAt?: string,
}



/**
 * Payee
 */

export type Payee = {
  id        : string,
  title     : string,
  createdAt?: string,
  updatedAt?: string,
  row?      : number,
}

export type Payees = Payee[]

export type PayeeFields = {
  id?       : string,
  title     : string,
  createdAt?: string,
  updatedAt?: string,
}


/**
 * Debt
 */

export type Debt = {
  payeeId: string,
  debt: number,
}

export type DebtsById = {[key: string]: Debt}



/**
 * Transacation
 */

export enum TRANSACTION_TYPE {
  OUTCOME  = 'OUTCOME',
  INCOME   = 'INCOME',
  TRANSFER = 'TRANSFER',
  LOAN     = 'LOAN',
  BORROW   = 'BORROW',
}

export type Transaction = {
  id              : string,
  date            : string,
  categoryId      : string,
  payeeId         : string,
  comment         : string,
  outcomeAccountId: string,
  outcomeAmount   : number,
  incomeAccountId : string,
  incomeAmount    : number,
  createdAt       : string,
  updatedAt       : string,
  row?            : number,
}

export type Transactions = Transaction[]

export type TransactionFields = {
  id?              : string,
  type             : TRANSACTION_TYPE,
  date             : string,
  categoryId?      : string,
  payeeId?         : string,
  outcomeAccountId?: string,
  outcomeAmount?   : number,
  incomeAccountId? : string,
  incomeAmount?    : number,
  comment?         : string,
  createdAt?       : string,
  updatedAt?       : string,
}

export type TransactionsAmounts = {
  outcomeAmount: number,
  incomeAmount: number,
}


export type TransactionsFilter = {
  id?        : string,
  dateFrom?  : string,
  dateTo?    : string,
  categoryId?: string,
  payeeId?   : string,
  comment?   : string,
  accountId? : string,
  amountFrom?: string,
  amountTo?  : string,
  limit?     : string,
  offset?    : string,
}


/**
 * Google
 */

export interface GAuthToken extends Credentials {
  scope?: string,
}

export type GOAuth2Client = OAuth2Client


export type GUserRes = oauth2_v2.Schema$Userinfoplus


export type GPermissionsCreateReq = drive_v3.Params$Resource$Permissions$Create
export type GPermissionsRes = drive_v3.Schema$Permission


export type GSheet = sheets_v4.Schema$Sheet

export type GSpreadsheetRes = sheets_v4.Schema$Spreadsheet

export type GSpreadsheetsGetReq = sheets_v4.Params$Resource$Spreadsheets$Get
export type GSpreadsheetsCreateReq = sheets_v4.Params$Resource$Spreadsheets$Create

export type GSpreadsheetsBatchUpdateReq = sheets_v4.Params$Resource$Spreadsheets$Batchupdate
export type GSpreadsheetsBatchUpdateRes = sheets_v4.Schema$BatchUpdateSpreadsheetResponse

export type GRowData = sheets_v4.Schema$RowData


export type GQueryCol = {
  id     : string,
  label  : string,
  type   : string,
  pattern: string,
}

export type GQueryCell = {
  v: string | number,
  f?: string,
}

export type GQueryRow = {
  c: (GQueryCell| null)[]
}

export type GQueryTable = {
  cols: GQueryCol[],
  rows: GQueryRow[],
  parsedNumHeaders: number,
}

export type GQueryRes = {
  table: GQueryTable,
}



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
 * Errors
 */

export type ResError = {
  text: string,
}

export type ResErrors = ResError[]



/**
 * i18n
 */

export type Lang = 'en' | 'ru'

export type Translations = {
  en: string,
  ru: string,
}



/**
 * Misc
 */

export enum ERROR {
  INVALID_GRANT = 'invalid_grant',
}
