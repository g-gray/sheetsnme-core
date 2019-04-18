// @flow

import * as t from './types'
import dotenv from 'dotenv'
dotenv.config({path: '.env.properties'})

export const properties: t.EnvProperties = {
  SCHEMA              : process.env.SCHEMA                   || '',
  HOST                : process.env.HOST                     || '',
  PORT                : Number(process.env.PORT)             || 0,
  CLIENT_ID           : process.env.CLIENT_ID                || '',
  CLIENT_SECRET       : process.env.CLIENT_SECRET            || '',
  SPREADSHEET_NAME    : process.env.SPREADSHEET_NAME         || '',
  DB_NAME             : process.env.DB_NAME                  || '',
  DB_HOST             : process.env.DB_HOST                  || '',
  POSTGRES_USER       : process.env.POSTGRES_USER            || '',
  POSTGRES_PASSWORD   : process.env.POSTGRES_PASSWORD        || '',
  PGSCRIPT_DB_URL     : process.env.PGSCRIPT_DB_URL          || '',
  SESSION_COOKIE_NAME : process.env.SESSION_COOKIE_NAME      || '',
  SESSION_HEADER_NAME : process.env.SESSION_HEADER_NAME      || '',
  CRYPTO_ALGORITHM    : process.env.CRYPTO_ALGORITHM         || '',
  CRYPTO_PASSWORD     : process.env.CRYPTO_PASSWORD          || '',
  CRYPTO_SALT         : process.env.CRYPTO_SALT              || '',
  CRYPTO_KEYLENGTH    : Number(process.env.CRYPTO_KEYLENGTH) || 0,
}
