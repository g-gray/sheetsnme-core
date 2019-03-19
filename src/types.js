// @flow

export type * from 'koa'
import type KoaT from 'koa'
export type Koa = KoaT

export type * from 'koa-router'
import type RouterT from 'koa-router'
export type Router = RouterT

export type * from 'pg'
import typeof PGT from 'pg'
export type PG = PGT

export type * from 'dotenv'
export type * from 'googleapis'

/**
 * Env
 */

export type Env = {
  vars: EnvProperties
}

export type EnvProperties = {
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
}



/**
 * Auth
 */

export type GAuthToken = {
  access_token : string,
  refresh_token: string,
  scope        : string,
  token_type   : string,
  expiry_date  : number,
}

export type GOAuth2Client = {
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
}

export type Session = {
  id?          : string,
  userId       : string,
  externalToken: GAuthToken,
  createdAt?   : Date,
  updatedAt?   : Date,
}



/**
 * User
 */

export type GUser = {
  id            : string,
  email         : string,
  verified_email: true,
  name?         : string,
  given_name?   : string,
  family_name?  : string,
  picture       : string,
  locale        : string,
}

export type User = {
  id?          : string,
  externalId   : string,
  email        : string,
  emailVerified: boolean,
  firstName?   : string,
  lastName?    : string,
  userRoleId?  : string,
  createdAt?   : Date,
  updatedAt?   : Date,
}



/**
 * Context
 */

export type Context = {
  ...Context,
  session?: string,
}



/**
 * Transacations
 */

export type Transaction = {
  id?            : string,
  date           : Date,
  category?      : string,
  payee?         :string,
  comment?       : string,
  accountOutcome?: string,
  accountIncome? : string,
  amountOutcome? : string,
  amountIncome?  : string,
  createdAt      : Date,
  updatedAt      : Date,
  index?         : number,
}

export type GRow = Array<any>

export type GRows = Array<GRow>

export type GValueRange = {
  "range": string,
  "majorDimension": 'ROWS' | 'COLUMNS',
  "values": GRows,
}

export type GReqOptions = {
  spreadsheetId    : string,
  range?           : string,
  resourse?        : {values: GRows},
  valueInputOption?: 'RAW' | 'USER_ENTERED',
  valueRanges?     : Array<GValueRange>,
}
