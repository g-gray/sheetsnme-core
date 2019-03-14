// @flow
import {Pool} from 'pg'
import * as t from './types'
import * as e from './env'

const {DB_HOST, DB_NAME, POSTGRES_USER, POSTGRES_PASSWORD} = e.properties

const config: t.PgPoolConfig = {
  host: DB_HOST,
  database: DB_NAME,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
}
const pool: t.Pool = new Pool(config)

export const query = (text: string, values: Array<any>): Promise<t.ResultSet> => {
  return pool.query(text, values)
}
