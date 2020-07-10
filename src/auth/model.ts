import * as t from '../types'

import * as u from '../utils'
import * as db from '../db'

export async function sessionById(
  id: string
): Promise<void | t.Session> {
  const q: string = `
  SELECT *
  FROM sessions
  WHERE id = $1
  `
  const v: any[] = [id]
  const result: t.PGQueryResult = await db.query(q, v)
  const row: void | t.PGQueryResultRow = result.rows[0]
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
  INSERT INTO sessions
    (user_id)
  VALUES
    ($1)
  RETURNING *
  `
  let v: any[] = [session.userId]

  if (session.id) {
    q = `
    INSERT INTO sessions
      (id, user_id)
    VALUES
      ($1, $2)
    ON CONFLICT (id) DO UPDATE SET
      user_id    = $2,
      updated_at = current_timestamp
    RETURNING *
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
): Promise<void | t.Session> {
  const q: string = `
  DELETE
  FROM sessions
  WHERE id = $1
  RETURNING *
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
  DELETE
  FROM sessions
  WHERE
    user_id = $1
    AND (EXTRACT(EPOCH FROM (SELECT LOCALTIMESTAMP)) - EXTRACT(EPOCH FROM created_at)) * 1000 >= $2
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
