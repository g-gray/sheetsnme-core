import * as t from '../types'

import * as db from '../db'

export async function upsertUser(
  user: t.UserQueryFields
): Promise<t.User> {
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
  const result: t.PGQueryResult = await db.query(q, v)
  const row: t.PGQueryResultRow = result.rows[0]
  const upsertedUser: t.User = rowToUser(row)
  return upsertedUser
}

export async function userByExternalId(
  externalId: string
): Promise<void | t.User> {
  const q: string = `
  select *
  from users
  where external_id = $1
  `
  const v: any[] = [externalId]
  const result: t.PGQueryResult = await db.query(q, v)
  const row: void | t.PGQueryResultRow = result.rows[0]
  if (!row) {
    return undefined
  }

  const user: t.User = rowToUser(row)
  return user
}

export async function userBySessionId(
  sessionId: string
): Promise<void | t.User> {
  const q: string = `
  select *
  from users u
  left join sessions s on s.user_id = u.id
  where s.id = $1
  `
  const v: any[] = [sessionId]
  const result: t.PGQueryResult = await db.query(q, v)
  const row: void | t.PGQueryResultRow = result.rows[0]
  if (!row) {
    return undefined
  }

  const user: t.User = rowToUser(row)
  return user
}

function rowToUser(row: t.PGQueryResultRow): t.User {
  return {
    id           : row.id             as string,
    externalId   : row.external_id    as string,
    pictureUrl   : row.picture_url    as string,
    email        : row.email          as string,
    emailVerified: row.email_verified as boolean,
    firstName    : row.first_name     as string,
    lastName     : row.last_name      as string,
    externalToken: row.external_token as string,
    createdAt    : row.created_at     as Date,
    updatedAt    : row.updated_at     as Date,
  }
}
