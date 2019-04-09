// @flow

import {Pool} from 'pg'
import f from 'fpx'
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



/**
 * Auth
 */

export async function login(user: t.User, token: t.GAuthToken): Promise<t.Session> {
  const q: string = `
  with
    ur as (select id from roles where sym='user'),
    u as (
      insert into users
        (
          external_id,
          picture_url,
          email,
          email_verified,
          first_name,
          last_name,
          role_id
        )
      values
        ($1, $2, $3, $4, $5, $6, (select id from ur))
      on conflict (external_id) do update set
        picture_url    = $2,
        email          = $3,
        email_verified = $4,
        first_name     = $5,
        last_name      = $6,
        updated_at     = current_timestamp
      returning id
    )
  insert into sessions
    (user_id, external_token)
  values
    ((select id from u), $7)
  returning *
  `
  const v: Array<mixed> = [
    user.externalId,
    user.pictureUrl,
    user.email,
    user.emailVerified,
    user.firstName,
    user.lastName,
    token,
  ]
  const result: t.ResultSet = await query(q, v)
  const row: t.Row = result.rows[0]
  const session: t.Session = rowToSession(row)

  await deleteExpiredSessions(session.userId)

  return session
}

export async function logout(id: string): Promise<t.Session | void> {
  const q: string = `
  delete
  from sessions
  where id = $1
  returning *
  `
  const v: Array<mixed> = [id]
  const result: t.ResultSet = await query(q, v)
  const row: t.Row = result.rows[0]
  if (!row) {
    return undefined
  }

  const userId = ((row.user_id: any): string)
  await deleteExpiredSessions(userId)

  const session: t.Session = rowToSession(row)
  return session
}

async function deleteExpiredSessions(userId: string): Promise<void> {
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

export async function sessionById(id: string): Promise<t.Session | void> {
  const q: string = `
  select *
  from sessions
  where id = $1
  `
  const v: Array<mixed> = [id]
  const result: t.ResultSet = await query(q, v)
  const row: t.Row | void = result.rows[0]
  if (!row) {
    return undefined
  }

  const session: t.Session = rowToSession(row)
  return session
}

function rowToSession(row: t.Row): t.Session {
  return {
    id            : ((row.id            : any): string),
    userId        : ((row.user_id       : any): string),
    externalToken : ((row.external_token: any): t.GAuthToken),
    createdAt     : ((row.created_at    : any): Date),
    updatedAt     : ((row.updated_at    : any): Date),
  }
}



/**
 * User
 */

export async function userBySessionId(sessionId: string): Promise<t.User | void> {
  const q: string = `
  select *
  from users u
  left join sessions s on s.user_id = u.id
  where s.id = $1
  `
  const v: Array<mixed> = [sessionId]
  const result: t.ResultSet = await query(q, v)
  const row: t.Row | void = result.rows[0]
  if (!row) {
    return undefined
  }

  const user: t.User = rowToUser(row)
  return user
}

function rowToUser(row: t.Row): t.User {
  return {
    id           :((row.id            : any): string),
    externalId   :((row.external_id   : any): string),
    pictureUrl   :((row.picture_url   : any): string),
    email        :((row.email         : any): string),
    emailVerified:((row.email_verified: any): boolean),
    firstName    :((row.first_name    : any): string),
    lastName     :((row.last_name     : any): string),
    userRoleId   :((row.role_id       : any): string),
    createdAt    :((row.created_at    : any): Date),
    updatedAt    :((row.updated_at    : any): Date),
  }
}

/**
 * Sheets
 */

export async function spreadsheetsBySessionId(sessionId: string): Promise<t.Spreadsheets> {
  const q: string = `
  select sh.*
  from spreadsheets sh
  left join sessions s on s.user_id = sh.user_id
  where s.id = $1
  `
  const v: Array<mixed> = [sessionId]
  const result: t.ResultSet = await query(q, v)
  const rows: Array<t.Row> = result.rows

  const spreadsheets = f.map(rows, rowToSpreadsheet)
  return spreadsheets
}

export async function createSpreadsheet(sessionId: string, spreadsheetId: string): Promise<t.Spreadsheet | void> {
  const q: string = `
  with
    s as (select user_id from sessions where id = $1)
  insert into spreadsheets
    (user_id, external_id)
  values
    ((select user_id from s), $2)
  returning *
  `
  const v: Array<mixed> = [sessionId, spreadsheetId]
  const result: t.ResultSet = await query(q, v)
  const row: t.Row = result.rows[0]
  if (!row) {
    return undefined
  }

  const spreadsheet: t.Spreadsheet = rowToSpreadsheet(row)
  return spreadsheet
}

function rowToSpreadsheet(row: t.Row): t.Spreadsheet {
  return {
    id        :((row.id         : any): string),
    userId    :((row.user_id    : any): string),
    externalId:((row.external_id: any): string),
    createdAt :((row.created_at : any): Date),
    updatedAt :((row.updated_at : any): Date),
  }
}
