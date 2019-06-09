'use strict'
const pt = require('path')
const fs = require('fs')

const {pool} = require('./connection')

async function repopulate() {
  console.info(`Repopulate: Started`)
  const setup       = fs.readFileSync(pt.resolve(__dirname, 'sql/setup.pgsql')).toString()
  const resetSchema = fs.readFileSync(pt.resolve(__dirname, 'sql/reset-schema.pgsql')).toString()
  const seed        = fs.readFileSync(pt.resolve(__dirname, 'sql/seed.pgsql')).toString()
  await pool.query(setup)
  await pool.query(resetSchema)
  await pool.query(seed)
  pool.end()
  console.info(`Repopulate: Finished`)
}

repopulate()
