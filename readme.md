## Overview

Backend core for sheetsn.me.

## Dependencies

- Node, Yarn
- Postgresql

## Development Setup

These instructions are for MacOS.

### Postgres
https://www.postgresql.org

    brew install postgres

Launch in foreground and leave running:

    /usr/local/opt/postgres/bin/postgres -D /usr/local/var/postgres

Launch a REPL and create the database:

    psql postgres  # default DB
    create database sheetsnme;
    \c sheetsnme

When launching the REPL in the future, connect to the app database right away:

    psql sheetsnme

### Env

    cp .env.properties.example .env.properties

Change these properties:

```
POSTGRES_USER=<your MacOS username>
POSTGRES_PASSWORD=
```

## Run

```bash
yarn
yarn run db:repopulate
yarn run start
```
