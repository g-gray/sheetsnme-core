'use strict'
const {runMigration} = require('../connection')

module.exports.up = () => runMigration(`
  begin;

  insert into users
    (
      external_id,
      email,
      email_verified,
      first_name,
      last_name,
      role_id
    )
  values
    (
      '5f3b202a-90e8-47d2-85b1-74c4482184ec',
      'mail@example.com',
      true,
      'Foo',
      'Bar',
      (select id from roles where sym = 'user')
    );

  commit;
`)

module.exports.down = () => runMigration(`
  begin;

  delete from sessions
  where user_id = '5f3b202a-90e8-47d2-85b1-74c4482184ec';

  delete from users
  where id = '5f3b202a-90e8-47d2-85b1-74c4482184ec';

  commit;
`)
