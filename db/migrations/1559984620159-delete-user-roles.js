'use strict'
const {runMigration} = require('../connection')

module.exports.up = () => runMigration(`
  begin;

  alter table users
  drop column role_id;

  drop table roles;

  commit;
`)

module.exports.down = () => runMigration(`
  begin;

  create table roles (
    id                 uuid         primary key default gen_random_uuid(),
    sym                text         not null unique check (sym <> ''),
    name               text         not null check (name <> ''),
    description        text         not null default ''
  );

  insert into roles
    (sym,     name)
  values
    ('admin', 'Admin'),
    ('user',  'User');

  alter table users
  add column role_id   uuid         references roles(id);

  update users
  set role_id = (select id from roles where sym='user');

  alter table users alter column role_id set not null;

  commit;
`)
