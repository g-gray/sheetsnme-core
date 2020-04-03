'use strict'
const pg = require('pg')

require('dotenv').config({path: '.env.properties'})

const properties = {
  DB_NAME          : process.env.DB_NAME           || '',
  DB_HOST          : process.env.DB_HOST           || '',
  POSTGRES_USER    : process.env.POSTGRES_USER     || '',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || '',
  PGSCRIPT_DB_URL  : process.env.PGSCRIPT_DB_URL   || '',
  DATABASE_URL     : process.env.DATABASE_URL      || '',
}

const config = properties.DATABASE_URL
  ? {connectionString: properties.DATABASE_URL, ssl: true}
  : {
    host    : properties.DB_HOST,
    database: properties.DB_NAME,
    user    : properties.POSTGRES_USER,
    password: properties.POSTGRES_PASSWORD,
  }

const pool = new pg.Pool(config)
module.exports.pool = pool

module.exports.runMigration = async (query) => {
  const client = await pool.connect()
  try {
    await client.query(query)
  } catch (e) {
    await client.query(`ROLLBACK`)
    throw e
  }
  client.release()
}
