insert into user_roles
  (sym,     name)
values
  ('admin', 'Admin'),
  ('user',  'User');

insert into users
  (external_id,                            email,              email_verified, first_name, last_name, user_role_id)
values
  ('5f3b202a-90e8-47d2-85b1-74c4482184ec', 'mail@example.com', true,           'Foo',      'Bar',     (select id from user_roles where sym = 'user'));
