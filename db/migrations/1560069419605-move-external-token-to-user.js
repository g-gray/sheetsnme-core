'use strict'
const {pool} = require('../connection')

module.exports.up = async function () {
  const client = await pool.connect()
  try {
    await client.query(`
    begin;

    alter table users
    add column external_token    text     default '';

    update users as u
    set external_token = (
      select external_token
      from sessions as s
      where s.user_id = u.id
      order by created_at desc
      limit 1
    );

    update users
    set external_token = default
    where external_token is null;

    alter table users alter column external_token set not null;

    alter table sessions
    drop column external_token;

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

    alter table sessions
    add column external_token    text     default '';

    update sessions as s
    set external_token = (
      select external_token
      from users as u
      where u.id = s.user_id
    );

    update sessions
    set external_token = default
    where external_token is null;

    alter table sessions alter column external_token set not null;

    alter table users
    drop column external_token;

    commit;
    `)
  }
  catch (e) {
    await client.query(`rollback`)
    throw e
  }
  client.release()
}
