drop schema public cascade;
create schema public;

-- Enables various cryptographic functions such as `gen_random_uuid()`.
create extension if not exists pgcrypto;
