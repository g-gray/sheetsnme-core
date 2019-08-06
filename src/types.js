// @flow

export type * from 'koa'
import type KoaT from 'koa'
export type Koa = KoaT

export type * from 'koa-router'
import type RouterT from 'koa-router'
export type Router = RouterT

export type * from 'koa-bodyparser'
import typeof KoaBodyparserT from 'koa-bodyparser'
export type KoaBodyparser = KoaBodyparserT

export type * from 'pg'
import typeof PGT from 'pg'
export type PG = PGT

export type * from 'uuid'
import type UuidT from 'uuid'
export type Uuid = UuidT

export type * from 'query-string'
import typeof QueryStringT from 'query-string'
export type QueryString = QueryStringT

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
|}



/**
 * Context
 */

export type Context = {|
  ...Context,
  lang         : string,
  sessionId    : string,
  client       : GOAuth2Client,
  spreadsheetId: string,
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
  refreshAccessToken         : () => Promise<{credentials: GAuthToken}>,
|}

export type Session = {|
  id?          : string,
  userId       : string,
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
  externalToken: string,
  createdAt?   : Date,
  updatedAt?   : Date,
|}



/**
 * Spreadsheet
 */

export type Spreadsheet = {|
  id        : string,
  userId    : string,
  externalId: string,
  createdAt : Date,
  updatedAt : Date,
|}

export type Spreadsheets = Array<Spreadsheet>



/**
 * Account
 */

export type Account = {|
  id          : string,
  title       : string,
  currencyCode: string,
  createdAt   : string,
  updatedAt   : string,
  row?        : number,
|}

export type Accounts = Array<Account>


export type Balance = {|
  accountId: string,
  balance  : number,
|}

export type BalancesById = {[string]: Balance}



/**
 * Category
 */

export type Category = {|
  id       : string,
  title    : string,
  createdAt: string,
  updatedAt: string,
  row?     : number,
|}

export type Categories = Array<Category>



/**
 * Payee
 */

export type Payee = {|
  id       : string,
  title    : string,
  createdAt: string,
  updatedAt: string,
  row?     : number,
|}

export type Payees = Array<Payee>


/**
 * Debt
 */

export type Debt = {|
  payeeId: string,
  debt: number,
|}

export type DebtsById = {[string]: Debt}



/**
 * Transacation
 */

export type TransactionType = 'OUTCOME' | 'INCOME' | 'TRANSFER' | 'LOAN' | 'BORROW'

export type Transaction = {|
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
|}

export type Transactions = Array<Transaction>

export type TransactionsAmounts = {|
  outcomeAmount: number,
  incomeAmount: number,
|}


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
  limit?     : string,
  offset?    : string,
|}


/**
 * Google
 */

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
  sheetId       : number,
  title         : string,
  index?        : number,
  sheetType?    : 'GRID',
  gridProperties: GGridProperties,
}

export type GGridRange = {
  sheetId          : number,
  startRowIndex?   : number,
  endRowIndex?     : number,
  startColumnIndex?: number,
  endColumnIndex?  : number,
}

export type GEditor = {
  users             : Array<string>,
  groups            : Array<string>,
  domainUsersCanEdit: boolean
}

export type GSheetProtectedRange = {
  protectedRangeId?     : number,
  range                 : GGridRange,
  namedRangeId?         : string,
  description?          : string,
  warningOnly?          : boolean,
  requestingUserCanEdit?: boolean,
  unprotectedRanges?    : Array<GGridRange>,
  editors?              : Array<GEditor>
}

export type GSheet = {
  properties      : GSheetProperties,
  protectedRanges?: Array<GSheetProtectedRange>,
  data            : Array<GGridData>,
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
  c: Array<GQueryCell | null>
}

export type GQueryTable = {
  cols: Array<GQueryCol>,
  rows: Array<GQueryRow>,
  parsedNumHeaders: number,
}

export type GQueryRes = {
  table: GQueryTable,
}

/**
 * Net
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



/**
 * i18n
 */

export type Translations = {|
  en: string,
  ru: string,
|}
