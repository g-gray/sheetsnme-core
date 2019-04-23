const pt = require('path')
const fs = require('fs')
const pg = require('pg')

require('dotenv').config({path: '.env.properties'})

const properties = {
  DB_NAME          : process.env.DB_NAME           || '',
  DB_HOST          : process.env.DB_HOST           || '',
  POSTGRES_USER    : process.env.POSTGRES_USER     || '',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || '',
  PGSCRIPT_DB_URL  : process.env.PGSCRIPT_DB_URL   || '',
}

const config = {
  host    : properties.DB_HOST,
  database: properties.DB_NAME,
  user    : properties.POSTGRES_USER,
  password: properties.POSTGRES_PASSWORD,
}
const pool = new pg.Pool(config)

function query(text, values) {
  return pool.query(text, values)
}

async function repopulate() {
  console.info(`Repopulate: Started`)
  const setup       = fs.readFileSync(pt.resolve(__dirname, '../sql/setup.pgsql')).toString()
  const resetSchema = fs.readFileSync(pt.resolve(__dirname, '../sql/reset-schema.pgsql')).toString()
  const seed        = fs.readFileSync(pt.resolve(__dirname, '../sql/seed.pgsql')).toString()
  await query(setup)
  await query(resetSchema)
  await query(seed)
  console.info(`Repopulate: Finished`)
}

repopulate()
