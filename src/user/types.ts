import {oauth2_v2} from 'googleapis'

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



export type GUserRes = oauth2_v2.Schema$Userinfoplus
