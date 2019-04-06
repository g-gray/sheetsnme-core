// @flow

export type * from 'koa'
import type KoaT from 'koa'
export type Koa = KoaT

export type * from 'koa-router'
import type RouterT from 'koa-router'
export type Router = RouterT

export type * from 'koa-bodyparser'
import type KoaBodyparserT from 'koa-bodyparser'
export type KoaBodyparser = KoaBodyparserT

export type * from 'pg'
import typeof PGT from 'pg'
export type PG = PGT

export type * from 'uuid'
import type UuidT from 'uuid'
export type Uuid = UuidT

export type * from 'dotenv'
export type * from 'googleapis'
export type * from 'fpx'

/**
 * Env
 */

export type Env = {|
  vars: EnvProperties
|}

export type EnvProperties = {|
  SCHEMA             : string,
  HOST               : string,
  PORT               : number,
  CLIENT_ID          : string,
  CLIENT_SECRET      : string,
  SPREADSHEET_ID     : string,
  DB_NAME            : string,
  DB_HOST            : string,
  POSTGRES_USER      : string,
  POSTGRES_PASSWORD  : string,
  PGSCRIPT_DB_URL    : string,
  SESSION_COOKIE_NAME: string,
  SESSION_HEADER_NAME: string,
|}



/**
 * Auth
 */

export type GAuthToken = {|
  access_token : string,
  refresh_token: string,
  scope        : string,
  token_type   : string,
  expiry_date  : number,
|}

export type GOAuth2Client = {|
  _events                    : Array<any>,
  _eventsCount               : number,
  _maxListeners              : number,
  transporter                : any,
  credentials                : any,
  certificateCache           : any,
  certificateExpiry          : any,
  refreshTokenPromises       : Map<Promise<any>>,
  _clientId                  : string,
  _clientSecret              : string,
  redirectUri                : string | void,
  authBaseUrl                : string | void,
  tokenUrl                   : string | void,
  eagerRefreshThresholdMillis: number,
  setCredentials             : (GAuthToken) => void,
  generateAuthUrl            : ({access_type: string, scope: Array<string>}) => string,
  getToken                   : (string, (Error, GAuthToken) => void) => void,
  getToken                   : (string) => Promise<{tokens: GAuthToken}>,
|}

export type Session = {|
  id           : string,
  userId       : string,
  externalToken: GAuthToken,
  createdAt?   : Date,
  updatedAt?   : Date,
|}



/**
 * User
 */

export type GUser = {|
  id            : string,
  email         : string,
  verified_email: true,
  name          : string,
  given_name    : string,
  family_name   : string,
  picture       : string,
  locale        : string,
|}

export type User = {|
  id?          : string,
  externalId   : string,
  pictureUrl   : string,
  email        : string,
  emailVerified: boolean,
  firstName    : string,
  lastName     : string,
  userRoleId?  : string,
  createdAt?   : Date,
  updatedAt?   : Date,
|}



/**
 * Context
 */

export type Context = {|
  ...Context,
  sessionId?: string,
  client?   : GOAuth2Client,
|}


/**
 * Accounts
 */

export type Account = {|
  id          : string,
  title       : string,
  currencyCode: string,
  initial     : number,
  createdAt   : Date,
  updatedAt   : Date,
  row         : number,
|}

export type Accounts = Array<Account>



/**
 * Categories
 */

export type Category = {|
  id          : string,
  title       : string,
  createdAt   : Date,
  updatedAt   : Date,
|}

export type Categories = Array<Category>



/**
 * Payees
 */

export type Payee = {|
  id       : string,
  title    : string,
  createdAt: Date,
  updatedAt: Date,
|}

export type Payees = Array<Payee>



/**
 * Transacations
 */

export type Transaction = {|
  id              : string,
  date            : Date,
  categoryId      : string,
  payeeId         : string,
  comment         : string,
  outcomeAccountId: string,
  outcomeAmount   : number,
  incomeAccountId : string,
  incomeAmount    : number,
  createdAt       : Date,
  updatedAt       : Date,
  row             : number,
|}

export type Transactions = Array<Transaction>


export type TransactionsFilter = {|
  id?        : string,
  dateFrom?  : string,
  dateTo?    : string,
  categoryId?: string,
  payeeId?   : string,
  comment?   : string,
  accountId? : string,
  amountFrom?: string,
  amountTo?  : string,
|}


/**
 * Google
 */

export type GRow = Array<any>

export type GRows = Array<GRow>

export type GValueRange = {
  range: string,
  majorDimension: 'ROWS' | 'COLUMNS',
  values: GRows,
}

export type GValuesRequest = {
  spreadsheetId            : string,
  range                    : string,
  resource?                : {values: GRows},
  valueInputOption?        : 'RAW' | 'USER_ENTERED',
  includeValuesInResponse? : boolean,
  valueRanges?             : Array<GValueRange>,
}

export type GRequest = {
  deleteDimension: {
    range: {
      sheetId    : number,
      dimension  : 'ROWS' | 'COLUMNS',
      startIndex?: number,
      endIndex?  : number,
    }
  },
}

export type GErrorType = 'ERROR_TYPE_UNSPECIFIED' | 'ERROR' | 'NULL_VALUE' | 'DIVIDE_BY_ZERO' | 'VALUE' | 'REF' | 'NAME' | 'NUM' | 'N_A' | 'LOADING'

export type GErrorValue = {
  type: GErrorType,
  message: string
}

export type GExtendedValue = {
  numberValue? : number,
  stringValue? : string,
  boolValue?   : boolean,
  formulaValue?: string,
  errorValue?  : GErrorValue
}

export type GCellData = {
  userEnteredValue: GExtendedValue,
}

export type GRowData = {
  values: Array<GCellData>,
}

export type GGridData = {
  startRow: number,
  startColumn: number,
  rowData: Array<GRowData>,
}

export type GGridProperties = {
  rowCount      : number,
  columnCount   : number,
  frozenRowCount: number,
}


export type GSheetProperties = {
  sheetId?      : number,
  title         : string,
  index?        : number,
  sheetType?    : 'GRID',
  gridProperties: GGridProperties,
}

export type GSheet = {
  properties  : GSheetProperties,
  data: Array<GGridData>,
}

export type GSpreadsheetProperties = {
  title        : string,
  locale       : string,
  autoRecalc   : 'ON_CHANGE',
  timeZone     : string,
  defaultFormat: any
}

export type GSpreadsheet = {
  spreadsheetId : string,
  properties    : GSpreadsheetProperties,
  sheets        : Array<GSheet>,
  spreadsheetUrl: string,
}

export type GQueryResCol = {
  id     : string,
  label  : string,
  type   : string,
  pattern: string,
}

export type GQueryResRow = {
  c: Array<{ v: string, f: string }>
}

export type GQueryTable = {
  cols: Array<GQueryResCol>,
  rows: Array<GQueryResRow>,
  parsedNumHeaders: number,
}

export type GQueryRes = {
  table: GQueryTable,
}

/**
 * XHttp
 */

export type XHttpParams = {|
  url     : string,
  method? : string,
  headers?: {[string]: string},
  timeout?: number,
  body?   : (Object | string),
|}

export type XHttpResponse = {|
  ok        : boolean,
  status    : string,
  statusText: string,
  reason    : string,
  headers   : {[string]: string},
  body      : (Object | string),
  params    : XHttpParams,
|}

/**
 * Errors
 */

export type ResError = {|
  text: string,
|}

export type ResErrors = Array<ResError>
