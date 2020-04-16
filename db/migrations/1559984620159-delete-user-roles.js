'use strict'
const {runMigration} = require('../connection')

module.exports.up = () => runMigration(`
  BEGIN;

  ALTER TABLE users
  DROP COLUMN role_id;

  DROP TABLE roles;

  COMMIT;
`)

module.exports.down = () => runMigration(`
  BEGIN;

  CREATE TABLE roles (
    id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
    sym            text    NOT NULL UNIQUE CHECK (sym <> ''),
    name           text    NOT NULL CHECK (name <> ''),
    description    text    NOT NULL DEFAULT ''
  );

  INSERT INTO roles
    (sym,     name)
  VALUES
    ('admin', 'Admin'),
    ('user',  'User');

  ALTER TABLE users
  ADD COLUMN role_id uuid REFERENCES roles(id);

  UPDATE users
  SET role_id = (SELECT id FROM roles WHERE sym='user');

  ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;

  COMMIT;
`)
