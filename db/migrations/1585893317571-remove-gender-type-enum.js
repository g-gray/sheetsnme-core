'use strict'
const {runMigration} = require('../connection')

module.exports.up = () => runMigration(`
  begin;
  drop type gender;
  commit;
`)

module.exports.down = () => runMigration(`
  begin;
  create type gender as enum ('male', 'female');
  commit;
`)
