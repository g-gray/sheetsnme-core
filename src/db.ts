import * as t from './types'

import * as pg from 'pg'
import * as fpx from 'fpx'

import * as e from './env'
import * as u from './utils'

const {DB_HOST, DB_NAME, POSTGRES_USER, POSTGRES_PASSWORD, DATABASE_URL} = e.properties

const config: pg.ClientConfig = DATABASE_URL
  ? {connectionString: DATABASE_URL, ssl: true}
  : {
    host    : DB_HOST,
    database: DB_NAME,
    user    : POSTGRES_USER,
    password: POSTGRES_PASSWORD,
  }

const pool: pg.Pool = new pg.Pool(config)

export function query(text: string, values?: any[]): Promise<pg.QueryResult> {
  return pool.query(text, values)
}



/**
 * Sessions
 */

export async function sessionById(id: string): Promise<t.Session | void> {
  const q: string = `
  select *
  from sessions
  where id = $1
  `
  const v: any[] = [id]
  const result: pg.QueryResult = await query(q, v)
  const row: pg.QueryResultRow | void = result.rows[0]
  if (!row) {
    return undefined
  }

  const session: t.Session = rowToSession(row)
  return session
}

export async function upsertSession(session: t.Session): Promise<t.Session> {
  let q: string = `
  insert into sessions
    (user_id)
  values
    ($1)
  returning *
  `
  let v: any[] = [session.userId]

  if (session.id) {
    q = `
    insert into sessions
      (id, user_id)
    values
      ($1, $2)
    on conflict (id) do update set
      user_id        = $2,
      updated_at     = current_timestamp
    returning *
    `
    v = [session.id, session.userId]
  }

  const result: pg.QueryResult = await query(q, v)
  const row: pg.QueryResultRow = result.rows[0]
  const upsertedSession: t.Session = rowToSession(row)
  return upsertedSession
}

export async function deleteSessionById(id: string): Promise<t.Session | void> {
  const q: string = `
  delete
  from sessions
  where id = $1
  returning *
  `
  const v: any[] = [id]
  const result: pg.QueryResult = await query(q, v)
  const row: pg.QueryResultRow = result.rows[0]
  if (!row) {
    return undefined
  }

  const session: t.Session = rowToSession(row)
  return session
}

export async function deleteExpiredSessions(userId: string): Promise<void> {
  const q: string = `
  delete
  from sessions
  where
    user_id = $1
    and (extract(epoch from (select localtimestamp)) - extract(epoch from created_at)) * 1000 >= $2
  `
  const v: any[] = [userId, u.WEEK]

  await query(q, v)
}


function rowToSession(row: pg.QueryResultRow): t.Session {
  return {
    id       : row.id as string,
    userId   : row.user_id as string,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  }
}



/**
 * User
 */

export async function upsertUser(user: t.User): Promise<t.User> {
  const q: string = `
  insert into users
    (
      external_id,
      picture_url,
      email,
      email_verified,
      first_name,
      last_name,
      external_token
    )
  values
    ($1, $2, $3, $4, $5, $6, $7)
  on conflict (external_id) do update set
    picture_url    = $2,
    email          = $3,
    email_verified = $4,
    first_name     = $5,
    last_name      = $6,
    external_token = $7,
    updated_at     = current_timestamp
  returning *
  `
  const v: any[] = [
    user.externalId,
    user.pictureUrl,
    user.email,
    user.emailVerified,
    user.firstName,
    user.lastName,
    user.externalToken,
  ]
  const result: pg.QueryResult = await query(q, v)
  const row: pg.QueryResultRow = result.rows[0]
  const upsertedUser: t.User = rowToUser(row)
  return upsertedUser
}

export async function userBySessionId(sessionId: string): Promise<t.User | void> {
  const q: string = `
  select *
  from users u
  left join sessions s on s.user_id = u.id
  where s.id = $1
  `
  const v: any[] = [sessionId]
  const result: pg.QueryResult = await query(q, v)
  const row: pg.QueryResultRow | void = result.rows[0]
  if (!row) {
    return undefined
  }

  const user: t.User = rowToUser(row)
  return user
}

function rowToUser(row: pg.QueryResultRow): t.User {
  return {
    id           : row.id             as string,
    externalId   : row.external_id    as string,
    pictureUrl   : row.picture_url    as string,
    email        : row.email          as string,
    emailVerified: row.email_verified as boolean,
    firstName    : row.first_name     as string,
    lastName     : row.last_name      as string,
    userRoleId   : row.role_id        as string,
    externalToken: row.external_token as string,
    createdAt    : row.created_at     as Date,
    updatedAt    : row.updated_at     as Date,
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
  order by created_at desc
  `
  const v: any[] = [sessionId]
  const result: pg.QueryResult = await query(q, v)
  const rows: pg.QueryResultRow[] = result.rows

  const spreadsheets = fpx.map(rows, rowToSpreadsheet)
  return spreadsheets
}

export async function createSpreadsheet(sessionId: string, spreadsheetId: string): Promise<t.Spreadsheet> {
  const q: string = `
  with
    s as (select user_id from sessions where id = $1)
  insert into spreadsheets
    (user_id, external_id)
  values
    ((select user_id from s), $2)
  returning *
  `
  const v: any[] = [sessionId, spreadsheetId]
  const result: pg.QueryResult = await query(q, v)
  const row: pg.QueryResultRow = result.rows[0]
  const spreadsheet: t.Spreadsheet = rowToSpreadsheet(row)
  return spreadsheet
}

function rowToSpreadsheet(row: pg.QueryResultRow): t.Spreadsheet {
  return {
    id        : row.id          as string,
    userId    : row.user_id     as string,
    externalId: row.external_id as string,
    createdAt : row.created_at  as Date,
    updatedAt : row.updated_at  as Date,
  }
}
