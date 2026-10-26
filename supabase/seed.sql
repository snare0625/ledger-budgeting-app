-- Local demo data, mirroring design/Ledger.dc.html. Runs on `npm run db:reset`.
-- Sign in: demo@ledger.app / ledger-demo · passcode 2026

do $$
declare
  v_uid   uuid := '5e9a1f3c-7d2b-4c8e-9f10-1a2b3c4d5e6f';
  v_cycle uuid;
  v_rent  uuid;
  v_roth  uuid;
begin
  -- Auth user + email identity (token columns must be '' rather than null for GoTrue)
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) values (
    '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
    'demo@ledger.app', extensions.crypt('ledger-demo', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"display_name":"Morgan"}', now(), now(),
    '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), v_uid, v_uid::text,
    jsonb_build_object('sub', v_uid::text, 'email', 'demo@ledger.app', 'email_verified', true),
    'email', now(), now(), now()
  );

  -- profiles row is created by the on_auth_user_created trigger
  insert into private.passcodes (user_id, hash)
  values (v_uid, extensions.crypt('2026', extensions.gen_salt('bf', 10)));

  -- Closed cycles: rollups only. Each is inserted open, filled, then closed
  -- (closed cycles reject activity writes).
  insert into public.cycles (user_id, name, income, created_at)
    values (v_uid, 'May 2026', 5000, '2026-05-01') returning id into v_cycle;
  insert into public.activity (cycle_id, name, category, amount, occurred_at) values
    (v_cycle, 'Salary', 'Income', 5000, '2026-05-01'),
    (v_cycle, 'Spending', 'Variable', -4120, '2026-05-31'),
    (v_cycle, 'Savings transfer', 'Savings', -600, '2026-05-31');
  update public.cycles set closed = true where id = v_cycle;

  insert into public.cycles (user_id, name, income, created_at)
    values (v_uid, 'June 2026', 5000, '2026-06-01') returning id into v_cycle;
  insert into public.activity (cycle_id, name, category, amount, occurred_at) values
    (v_cycle, 'Salary', 'Income', 5000, '2026-06-01'),
    (v_cycle, 'Spending', 'Variable', -3980, '2026-06-30'),
    (v_cycle, 'Savings transfer', 'Savings', -700, '2026-06-30');
  update public.cycles set closed = true where id = v_cycle;

  insert into public.cycles (user_id, name, income, created_at)
    values (v_uid, 'July 2026', 5200, '2026-07-01') returning id into v_cycle;
  insert into public.activity (cycle_id, name, category, amount, occurred_at) values
    (v_cycle, 'Salary', 'Income', 5200, '2026-07-01'),
    (v_cycle, 'Spending', 'Variable', -3610, '2026-07-31'),
    (v_cycle, 'Savings transfer', 'Savings', -900, '2026-07-31');
  update public.cycles set closed = true where id = v_cycle;

  -- Current (open) cycle with the prototype's line items and activity
  insert into public.cycles (user_id, name, income, created_at)
    values (v_uid, 'August 2026', 5200, '2026-08-01') returning id into v_cycle;

  insert into public.items (cycle_id, name, category, amount, enabled, created_at)
    values (v_cycle, 'Rent', 'Fixed', 1850, true, '2026-08-01 00:00:01') returning id into v_rent;
  insert into public.items (cycle_id, name, category, amount, enabled, created_at) values
    (v_cycle, 'Utilities', 'Fixed', 180, true, '2026-08-01 00:00:02'),
    (v_cycle, 'Groceries', 'Variable', 520, true, '2026-08-01 00:00:03'),
    (v_cycle, 'Dining out', 'Variable', 240, true, '2026-08-01 00:00:04'),
    (v_cycle, 'Transit', 'Variable', 95, false, '2026-08-01 00:00:05'),
    (v_cycle, 'Emergency fund', 'Savings', 400, true, '2026-08-01 00:00:06');
  insert into public.items (cycle_id, name, category, amount, enabled, created_at)
    values (v_cycle, 'Roth IRA', 'Savings', 500, true, '2026-08-01 00:00:07') returning id into v_roth;

  insert into public.activity (cycle_id, item_id, name, category, amount, occurred_at) values
    (v_cycle, null, 'Salary', 'Income', 5200, '2026-08-01 09:00'),
    (v_cycle, v_roth, 'Roth IRA', 'Savings', -500, '2026-08-01 09:05'),
    (v_cycle, v_rent, 'Rent', 'Fixed', -1850, '2026-08-01 09:10'),
    (v_cycle, null, 'Whole Foods', 'Variable', -64.20, now());

  insert into public.goals (user_id, name, target, saved, note, created_at) values
    (v_uid, 'Emergency fund', 12000, 8400, 'Six months of essentials.', '2026-01-01'),
    (v_uid, 'Kyoto trip', 4500, 1650, 'Two weeks, next spring.', '2026-02-01'),
    (v_uid, 'New laptop', 2400, 2400, 'Done — waiting on the sale.', '2026-03-01');
end;
$$;
