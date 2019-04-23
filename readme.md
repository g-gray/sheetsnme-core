## Overview

Backend core for Accountant.

## Dependencies

- Node, Yarn
- Postgresql

## Development Setup

These instructions are for MacOS.

### Postgres
https://www.postgresql.org

    brew install posgres

Launch in foreground and leave running:

    /usr/local/opt/postgres/bin/postgres -D /usr/local/var/postgres

Create the database:

    createdb accountant

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
yarn run db:reset-and-seed
yarn run dev
```
