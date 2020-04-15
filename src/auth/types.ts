import {OAuth2Client, Credentials} from 'google-auth-library'

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



export interface IGAuthToken extends Credentials {
  scope?: string,
}

export type GOAuth2Client = OAuth2Client



export enum AUTH_ERROR {
  UNAUTHORIZED        = 'UNAUTHORIZED',
  SESSION_ID_REQUIRED = 'SESSION_ID_REQUIRED',
  SESSION_NOT_FOUND   = 'SESSION_NOT_FOUND',
  CODE_REQUIRED       = 'CODE_REQUIRED',
  USER_ID_REQUIRED    = 'USER_ID_REQUIRED',
  USER_NOT_FOUND      = 'USER_NOT_FOUND',

  G_INVALID_GRANT = 'invalid_grant',
}
