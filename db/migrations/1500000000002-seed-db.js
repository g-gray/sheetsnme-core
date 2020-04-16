'use strict'
const {runMigration} = require('../connection')

module.exports.up = () => runMigration(`
  BEGIN;

  INSERT INTO users
    (
      external_id,
      email,
      email_verified,
      first_name,
      last_name,
      role_id
    )
  VALUES
    (
      '5f3b202a-90e8-47d2-85b1-74c4482184ec',
      'mail@example.com',
      true,
      'Foo',
      'Bar',
      (SELECT id FROM roles WHERE sym = 'user')
    );

  COMMIT;
`)

module.exports.down = () => runMigration(`
  BEGIN;

  DELETE FROM sessions
  WHERE user_id = '5f3b202a-90e8-47d2-85b1-74c4482184ec';

  DELETE FROM users
  WHERE id = '5f3b202a-90e8-47d2-85b1-74c4482184ec';

  COMMIT;
`)
