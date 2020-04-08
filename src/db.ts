import * as t from './types'

import * as pg from 'pg'

import * as e from './env'

const {
  DB_HOST,
  DB_NAME,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  DATABASE_URL,
} = e.properties

const config: t.PGClientConfig = DATABASE_URL
  ? {connectionString: DATABASE_URL, ssl: true}
  : {
    host    : DB_HOST,
    database: DB_NAME,
    user    : POSTGRES_USER,
    password: POSTGRES_PASSWORD,
  }

const pool: t.PGPool = new pg.Pool(config)

export function query(
  text: string,
  values?: any[]
): Promise<t.PGQueryResult> {
  return pool.query(text, values)
}
