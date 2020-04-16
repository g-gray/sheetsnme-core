'use strict'
const {runMigration} = require('../connection')

module.exports.up = () => runMigration(`
  BEGIN;

  CREATE TYPE gender AS enum ('male', 'female');

  -- TODO: normalize to lowercase before inserting?
  CREATE DOMAIN email AS text
  CHECK (
    VALUE = '' OR
    VALUE ~ '^[^@\s]+@([^.\s]+\.)+\w+$'
  );

  CREATE TABLE roles (
    id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
    sym            text    NOT NULL UNIQUE CHECK (sym <> ''),
    name           text    NOT NULL CHECK (name <> ''),
    description    text    NOT NULL DEFAULT ''
  );

  INSERT INTO roles
    (sym, name)
  VALUES
    ('admin', 'Admin'),
    ('user', 'User');

  CREATE TABLE users (
    id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id       text         NOT NULL UNIQUE CHECK (external_id <> ''),
    picture_url       text         NOT NULL DEFAULT '',
    email             text         NOT NULL DEFAULT '', -- intentionally "text"
    email_verified    bool         NOT NULL DEFAULT false,
    first_name        text         NOT NULL DEFAULT '',
    last_name         text         NOT NULL DEFAULT '',
    role_id           uuid         NOT NULL REFERENCES roles(id),
    created_at        timestamp    NULL DEFAULT current_timestamp,
    updated_at        timestamp    NULL DEFAULT current_timestamp
  );

  CREATE TABLE spreadsheets (
    id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        uuid         NOT NULL REFERENCES users(id),
    external_id    text         NOT NULL UNIQUE CHECK (external_id <> ''),
    created_at     timestamp    NULL DEFAULT current_timestamp,
    updated_at     timestamp    NULL DEFAULT current_timestamp
  );

  CREATE TABLE sessions (
    id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           uuid         NOT NULL REFERENCES users(id),
    external_token    text         NOT NULL DEFAULT '',
    created_at        timestamp    NULL DEFAULT current_timestamp,
    updated_at        timestamp    NULL DEFAULT current_timestamp
  );

  COMMIT;
`)

module.exports.down = () => runMigration(`
  BEGIN;

  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  COMMIT;
`)
