'use strict'
const {pool} = require('../connection')

module.exports.up = async function () {
  const client = await pool.connect()
  try {
    await client.query(`
    begin;

    alter table users
    drop column role_id;

    drop table roles;

    commit;
    `)
  }
  catch (e) {
    await client.query(`rollback`)
    throw e
  }
  client.release()
}

module.exports.down = async function () {
  const client = await pool.connect()
  try {
    await client.query(`
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
  }
  catch (e) {
    await client.query('rollback')
    throw e
  }
  await client.release()
}
