'use strict'
const pg = require('pg')

require('dotenv').config({path: '.env.properties'})

const properties = {
  DB_HOST    : process.env.DB_HOST      || '',
  DB_NAME    : process.env.DB_NAME      || '',
  DB_USER    : process.env.DB_USER      || '',
  DB_PASSWORD: process.env.DB_PASSWORD  || '',
  // Heroku specific
  DATABASE_URL: process.env.DATABASE_URL || '',
}

const config = properties.DATABASE_URL
  ? {connectionString: properties.DATABASE_URL, ssl: true}
  : {
    host    : properties.DB_HOST,
    database: properties.DB_NAME,
    user    : properties.DB_USER,
    password: properties.DB_PASSWORD,
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
