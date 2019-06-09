'use strict'
const {pool} = require('./connection')

/**
 * Stores and loads the executed migrations in the database. The table
 * migrations is only one row and stores a JSON of the data that the
 * migrate package uses to know which migrations have been executed.
 */

function PgStore() {}

PgStore.prototype.load = async function (fn) {
  const client = await pool.connect()

  await client.query(`
  create table if not exists migrations (
    id          integer        PRIMARY KEY,
    data        jsonb          NOT NULL
  )
  `)

  const {rows} = await client.query(`select data from migrations`)

  await client.release()

  if (rows.length !== 1) {
    console.log('Cannot read migrations from database. If this is the first time you run migrations, then this is normal.')
    fn(null, {})
  }
  else {
    fn(null, rows[0].data)
  }
}

PgStore.prototype.save = async function (set, fn) {
  const client = await pool.connect()

  await client.query(`
  create table if not exists migrations (
    id          integer        PRIMARY KEY,
    data        jsonb          NOT NULL
  )
  `)

  await client.query(`
  insert into migrations
    (id, data)
  values
    (1, $1)
  on conflict (id) do update set
    data = $1
  `,
  [{lastRun: set.lastRun, migrations: set.migrations}]
  )

  await client.release()

  fn()
}

module.exports = PgStore
