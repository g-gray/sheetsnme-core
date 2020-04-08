import {OAuth2Client, Credentials} from 'google-auth-library';

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



export interface GAuthToken extends Credentials {
  scope?: string,
}

export type GOAuth2Client = OAuth2Client
