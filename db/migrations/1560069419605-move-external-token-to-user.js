'use strict'
const {runMigration} = require('../connection')

module.exports.up = () => runMigration(`
  BEGIN;

  ALTER TABLE users
  ADD COLUMN external_token text DEFAULT '';

  UPDATE users AS u
  SET external_token = (
    SELECT external_token
    FROM sessions AS s
    WHERE s.user_id = u.id
    ORDER BY created_at DESC
    LIMIT 1
  );

  UPDATE users
  SET external_token = DEFAULT
  WHERE external_token IS NULL;

  ALTER TABLE users ALTER COLUMN external_token SET NOT NULL;

  ALTER TABLE sessions
  DROP COLUMN external_token;

  COMMIT;
`)

module.exports.down = () => runMigration(`
  BEGIN;

  ALTER TABLE sessions
  ADD COLUMN external_token text DEFAULT '';

  UPDATE sessions AS s
  SET external_token = (
    SELECT external_token
    FROM users AS u
    WHERE u.id = s.user_id
  );

  UPDATE sessions
  SET external_token = DEFAULT
  WHERE external_token IS NULL;

  ALTER TABLE sessions ALTER COLUMN external_token SET NOT NULL;

  ALTER TABLE users
  DROP COLUMN external_token;

  COMMIT;
`)
