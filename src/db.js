// @flow

import {Pool} from 'pg'
import * as t from './types'
import * as e from './env'
import * as u from './utils'

const {DB_HOST, DB_NAME, POSTGRES_USER, POSTGRES_PASSWORD} = e.properties

const config: t.ClientConfig = {
  host: DB_HOST,
  database: DB_NAME,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
}
const pool: t.Pool = new Pool(config)

export function query(text: string, values: Array<mixed> | void): Promise<t.ResultSet> {
  return pool.query(text, values)
}



export async function login(user: t.User, token: t.GAuthToken): Promise<string> {
  const q: string = `
  with
    ur as (select id from user_roles where sym='user'),
    u as (
      insert into users
        (
          external_id,
          email,
          email_verified,
          first_name,
          last_name,
          user_role_id
        )
      values
        ($1, $2, $3, $4, $5, (select id from ur))
      on conflict (external_id) do update set
        email          = $2,
        email_verified = $3,
        first_name     = $4,
        last_name      = $5,
        updated_at     = current_timestamp
      returning id
    )
  insert into sessions
    (user_id, external_token)
  values
    ((select id from u), $6)
  returning *
  `
  const v: Array<mixed> = [
    user.externalId,
    user.email,
    user.emailVerified,
    user.firstName,
    user.lastName,
    token,
  ]

  const result: t.ResultSet = await query(q, v)
  const row: t.GRow = result.rows[0]
  const userId = ((row.user_id: any): string)
  await deleteExpiredSessions(userId)
  const sessionId = ((row.id: any): string)

  return sessionId
}

export async function logout(id: string): Promise<void> {
  const q: string = `
  delete
  from sessions
  where id = $1
  returning *
  `
  const v: Array<mixed> = [id]

  const result: t.ResultSet = await query(q, v)
  const row: t.GRow = result.rows[0]
  const userId = ((row.user_id: any): string)
  await deleteExpiredSessions(userId)
}

async function deleteExpiredSessions(userId) {
  const q: string = `
  delete
  from sessions
  where
    user_id = $1
    and (extract(epoch from (select localtimestamp)) - extract(epoch from created_at)) * 1000 >= $2
  `
  const v: Array<mixed> = [userId, u.DAY]

  await query(q, v)
}

export async function sessionById(id: string): Promise<t.Session> {
  const q: string = `
  select *
  from sessions
  where id = $1
  `
  const v: Array<mixed> = [id]

  const result: t.ResultSet = await query(q, v)
  const row: t.GRow = result.rows[0]

  const session: t.Session = {
    id            : ((row.id: any): string),
    userId        : ((row.user_id: any): string),
    externalToken : ((row.external_token: any): t.GAuthToken),
    createdAt     : ((row.created_at: any): Date),
    updatedAt     : ((row.updated_at: any): Date),
  }

  return session
}

