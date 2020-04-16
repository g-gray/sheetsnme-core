'use strict'
const {runMigration} = require('../connection')

module.exports.up = () => runMigration(`
  BEGIN;
  DROP TYPE gender;
  COMMIT;
`)

module.exports.down = () => runMigration(`
  BEGIN;
  CREATE TYPE gender AS enum ('male', 'female');
  COMMIT;
`)
