import * as t from '../types'

import * as u from '../utils'
import * as db from '../db'

export async function sessionById(
  id: string
): Promise<t.Session | void> {
  const q: string = `
  select *
  from sessions
  where id = $1
  `
  const v: any[] = [id]
  const result: t.PGQueryResult = await db.query(q, v)
  const row: t.PGQueryResultRow | void = result.rows[0]
  if (!row) {
    return undefined
  }

  const session: t.Session = rowToSession(row)
  return session
}

export async function upsertSession(
  session: t.SessionQueryFields
): Promise<t.Session> {
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
      user_id    = $2,
      updated_at = current_timestamp
    returning *
    `
    v = [session.id, session.userId]
  }

  const result: t.PGQueryResult = await db.query(q, v)
  const row: t.PGQueryResultRow = result.rows[0]
  const upsertedSession: t.Session = rowToSession(row)
  return upsertedSession
}

export async function deleteSessionById(
  id: string
): Promise<t.Session | void> {
  const q: string = `
  delete
  from sessions
  where id = $1
  returning *
  `
  const v: any[] = [id]
  const result: t.PGQueryResult = await db.query(q, v)
  const row: t.PGQueryResultRow = result.rows[0]
  if (!row) {
    return undefined
  }

  const session: t.Session = rowToSession(row)
  return session
}

export async function deleteExpiredSessions(
  userId: string
): Promise<void> {
  const q: string = `
  delete
  from sessions
  where
    user_id = $1
    and (extract(epoch from (select localtimestamp)) - extract(epoch from created_at)) * 1000 >= $2
  `
  const v: any[] = [userId, u.WEEK]

  await db.query(q, v)
}


function rowToSession(row: t.PGQueryResultRow): t.Session {
  return {
    id       : row.id as string,
    userId   : row.user_id as string,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  }
}
