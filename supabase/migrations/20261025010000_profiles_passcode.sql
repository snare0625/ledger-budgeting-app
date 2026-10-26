-- Ledger — profiles + passcode app lock
--
-- Email/password (Supabase Auth) establishes identity. The 4-digit passcode is
-- an app lock on top of a signed-in session, like a banking app: it gates the
-- UI, it is not a replacement for the session.
--
-- Passcode hashes live in the `private` schema, which is not exposed through
-- the Data API. Only the security-definer functions below can read them.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- profiles: public per-user data (greeting name; Settings fields land here later)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null check (char_length(btrim(display_name)) between 1 and 60),
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke all on public.profiles from anon;
grant select, update (display_name) on public.profiles to authenticated;

-- Create a profile for every new auth user. display_name comes from sign-up
-- metadata, falling back to the email's local part.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1),
      'there'
    ), 60)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- private.passcodes: bcrypt hash + brute-force lockout state
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.passcodes (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  hash             text not null,
  failed_attempts  smallint not null default 0,
  locked_until     timestamptz,
  updated_at       timestamptz not null default now()
);

-- has_passcode(): has the current user set a passcode yet?
create function public.has_passcode()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from private.passcodes where user_id = auth.uid());
$$;

-- set_passcode(new, current?): create or change the passcode.
-- Changing an existing passcode requires either the current passcode or a
-- recent password sign-in (≤ 10 min, from the JWT's amr claim) — the
-- "forgot passcode" path is: sign out → sign in with email → set a new one.
create function public.set_passcode(p_new text, p_current text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid      uuid := auth.uid();
  v_existing private.passcodes;
  v_recent   boolean;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if p_new is null or p_new !~ '^[0-9]{4}$' then
    raise exception 'Passcode must be exactly 4 digits' using errcode = '22023';
  end if;

  select * into v_existing from private.passcodes where user_id = v_uid for update;

  if v_existing.user_id is not null then
    v_recent := exists (
      select 1
      from jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb)) as e
      where e ->> 'method' = 'password'
        and (e ->> 'timestamp')::bigint >= extract(epoch from now()) - 600
    );
    if not v_recent and (
      p_current is null or v_existing.hash <> extensions.crypt(p_current, v_existing.hash)
    ) then
      raise exception 'Current passcode is incorrect' using errcode = '28000';
    end if;
  end if;

  insert into private.passcodes (user_id, hash)
  values (v_uid, extensions.crypt(p_new, extensions.gen_salt('bf', 10)))
  on conflict (user_id) do update
    set hash = excluded.hash,
        failed_attempts = 0,
        locked_until = null,
        updated_at = now();
end;
$$;

-- verify_passcode(code): check the passcode with lockout.
-- 5 consecutive failures lock verification for 5 minutes.
-- Returns { ok, attempts_left, locked_until }.
create function public.verify_passcode(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid       uuid := auth.uid();
  v_row       private.passcodes;
  v_max       constant smallint := 5;
  v_lock_for  constant interval := interval '5 minutes';
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select * into v_row from private.passcodes where user_id = v_uid for update;
  if v_row.user_id is null then
    raise exception 'No passcode set' using errcode = 'P0002';
  end if;

  if v_row.locked_until is not null and v_row.locked_until > now() then
    return jsonb_build_object('ok', false, 'attempts_left', 0, 'locked_until', v_row.locked_until);
  end if;

  if p_code is not null and v_row.hash = extensions.crypt(p_code, v_row.hash) then
    update private.passcodes
      set failed_attempts = 0, locked_until = null
      where user_id = v_uid;
    return jsonb_build_object('ok', true, 'attempts_left', v_max, 'locked_until', null);
  end if;

  if v_row.failed_attempts + 1 >= v_max then
    update private.passcodes
      set failed_attempts = 0, locked_until = now() + v_lock_for
      where user_id = v_uid
      returning locked_until into v_row.locked_until;
    return jsonb_build_object('ok', false, 'attempts_left', 0, 'locked_until', v_row.locked_until);
  end if;

  update private.passcodes
    set failed_attempts = failed_attempts + 1, locked_until = null
    where user_id = v_uid;
  return jsonb_build_object(
    'ok', false,
    'attempts_left', v_max - v_row.failed_attempts - 1,
    'locked_until', null
  );
end;
$$;

revoke execute on function public.has_passcode() from public, anon;
revoke execute on function public.set_passcode(text, text) from public, anon;
revoke execute on function public.verify_passcode(text) from public, anon;
grant execute on function public.has_passcode() to authenticated;
grant execute on function public.set_passcode(text, text) to authenticated;
grant execute on function public.verify_passcode(text) to authenticated;

-- handle_new_user is trigger-only
revoke execute on function public.handle_new_user() from public, anon, authenticated;
