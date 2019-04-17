/*
TODO
  auto-update `updated_at`
*/

create type gender as enum ('male', 'female');

-- TODO: normalize to lowercase before inserting?
create domain email as text
check (
  value = '' or
  value ~ '^[^@\s]+@([^.\s]+\.)+\w+$'
);



create table roles (
  id                 uuid         primary key default gen_random_uuid(),
  sym                text         not null unique check (sym <> ''),
  name               text         not null check (name <> ''),
  description        text         not null default ''
);

create table users (
  id                 uuid         primary key default gen_random_uuid(),
  external_id        text         not null unique check (external_id <> ''),
  picture_url        text         not null default '',
  email              text         not null default '', -- intentionally "text"
  email_verified     bool         not null default false,
  first_name         text         not null default '',
  last_name          text         not null default '',
  role_id            uuid         not null references roles(id),
  created_at         timestamp    null default current_timestamp,
  updated_at         timestamp    null default current_timestamp
);

create table spreadsheets (
  id                 uuid         primary key default gen_random_uuid(),
  user_id            uuid         not null references users(id),
  external_id        text         not null unique check (external_id <> ''),
  created_at         timestamp    null default current_timestamp,
  updated_at         timestamp    null default current_timestamp
);

create table sessions (
  id                 uuid         primary key default gen_random_uuid(),
  user_id            uuid         not null references users(id),
  external_token     text         not null default '',
  created_at         timestamp    null default current_timestamp,
  updated_at         timestamp    null default current_timestamp
);

