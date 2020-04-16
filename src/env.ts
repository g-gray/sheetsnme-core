import * as t from './types'

import dotenv from 'dotenv'
dotenv.config({path: '.env.properties'})

export const properties: t.EnvProperties = {
  HOST: process.env.HOST         || '',
  PORT: Number(process.env.PORT) || 0,

  DB_HOST     : process.env.DB_HOST      || '',
  DB_NAME     : process.env.DB_NAME      || '',
  DB_USER     : process.env.DB_USER      || '',
  DB_PASSWORD : process.env.DB_PASSWORD  || '',
  DATABASE_URL: process.env.DATABASE_URL || '',

  CLIENT_ID    : process.env.CLIENT_ID     || '',
  CLIENT_SECRET: process.env.CLIENT_SECRET || '',
  REDIRECT_URL : process.env.REDIRECT_URL  || '',
  LOGOUT_URL   : process.env.LOGOUT_URL    || '',

  CRYPTO_ALGORITHM: process.env.CRYPTO_ALGORITHM         || '',
  CRYPTO_PASSWORD : process.env.CRYPTO_PASSWORD          || '',
  CRYPTO_SALT     : process.env.CRYPTO_SALT              || '',
  CRYPTO_KEYLENGTH: Number(process.env.CRYPTO_KEYLENGTH) || 0,

  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || '',
  SESSION_HEADER_NAME: process.env.SESSION_HEADER_NAME || '',
  LANG_HEADER_NAME   : process.env.LANG_HEADER_NAME    || '',

  SPREADSHEET_NAME: process.env.SPREADSHEET_NAME || '',
}
