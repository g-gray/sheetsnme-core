import * as t from '../types'

import {oauth2_v2} from 'googleapis'

export type UserWithSpreadsheeetsRes = UserRes & {
  spreadsheets: t.SpreadsheetRes[],
}

export type UserRes = {
  id           : string,
  pictureUrl   : string,
  email        : string,
  firstName    : string,
  lastName     : string,
  createdAt    : Date,
  updatedAt    : Date,
}

export type UserQuery = {
  id?          : string,
  externalId   : string,
  externalToken: string,
  email        : string,
  emailVerified: boolean,
  firstName    : string,
  lastName     : string,
  pictureUrl   : string,
  createdAt?   : Date,
  updatedAt?   : Date,
}

export type UserResult = {
  id           : string,
  externalId   : string,
  externalToken: string,
  email        : string,
  emailVerified: boolean,
  firstName    : string,
  lastName     : string,
  pictureUrl   : string,
  createdAt    : Date,
  updatedAt    : Date,
}


export enum USER_ERROR {
  SPREADSHEET_ID_REQUIRED = 'SPREADSHEET_ID_REQUIRED',
  NOT_FOUND = 'USER_NOT_FOUND',
}



export type GUserRes = oauth2_v2.Schema$Userinfoplus
