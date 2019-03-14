// @flow
import * as t from './types'
import dotenv from 'dotenv'
dotenv.load({path: '.env.properties'})

export const properties: t.EnvProperties = {
  SCHEMA            : process.env.SCHEMA || '',
  HOST              : process.env.HOST || '',
  PORT              : process.env.PORT || '',
  SPREADSHEET_ID    : process.env.SPREADSHEET_ID || '',
  DB_NAME           : process.env.DB_NAME || '',
  DB_HOST           : process.env.DB_HOST || '',
  POSTGRES_USER     : process.env.POSTGRES_USER || '',
  POSTGRES_PASSWORD : process.env.POSTGRES_PASSWORD || '',
  PGSCRIPT_DB_URL   : process.env.PGSCRIPT_DB_URL || '',
}
