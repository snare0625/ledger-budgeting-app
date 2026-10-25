-- Ledger — initial schema
-- Tables: cycles, items, goals, activity (see BUILD_PLAN.md "Data model").
-- Derived values (planned, left, savings, pct, net) are computed in the app;
-- cycle_summaries exposes the activity rollups History needs.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.item_category as enum ('Fixed', 'Variable', 'Savings');
create type public.activity_category as enum ('Fixed', 'Variable', 'Savings', 'Income');

-- ---------------------------------------------------------------------------
-- cycles: one budget period (typically a month). At most one open per user.
-- ---------------------------------------------------------------------------
create table public.cycles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 80),
  income      numeric(12, 2) not null default 0 check (income >= 0),
  closed      boolean not null default false,
  created_at  timestamptz not null default now()
);

create unique index cycles_one_open_per_user on public.cycles (user_id) where not closed;
create index cycles_user_created_idx on public.cycles (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- items: planned allocations within a cycle
-- ---------------------------------------------------------------------------
create table public.items (
  id          uuid primary key default gen_random_uuid(),
  cycle_id    uuid not null references public.cycles (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 80),
  category    public.item_category not null,
  amount      numeric(12, 2) not null check (amount >= 0),
  enabled     boolean not null default true,
  created_at  timestamptz not null default now()
);

create index items_cycle_id_idx on public.items (cycle_id);

-- ---------------------------------------------------------------------------
-- goals: savings targets, independent of cycles
-- ---------------------------------------------------------------------------
create table public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 80),
  target      numeric(12, 2) not null check (target > 0),
  saved       numeric(12, 2) not null default 0 check (saved >= 0),
  note        text check (note is null or char_length(note) <= 500),
  created_at  timestamptz not null default now()
);

create index goals_user_id_idx on public.goals (user_id);

-- ---------------------------------------------------------------------------
-- activity: transactions in a cycle. amount is signed: negative = spend.
-- ---------------------------------------------------------------------------
create table public.activity (
  id           uuid primary key default gen_random_uuid(),
  cycle_id     uuid not null references public.cycles (id) on delete cascade,
  item_id      uuid references public.items (id) on delete set null,
  name         text not null check (char_length(btrim(name)) between 1 and 80),
  category     public.activity_category not null,
  amount       numeric(12, 2) not null check (amount <> 0),
  occurred_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index activity_cycle_occurred_idx on public.activity (cycle_id, occurred_at desc);
create index activity_item_id_idx on public.activity (item_id);

-- ---------------------------------------------------------------------------
-- Closed cycles are read-only: block item/activity writes that touch one.
-- (Deleting a whole cycle still cascades — the parent row is gone by then.)
-- ---------------------------------------------------------------------------
create function public.guard_closed_cycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    if exists (select 1 from public.cycles c where c.id = old.cycle_id and c.closed) then
      raise exception 'Cycle is closed and read-only' using errcode = 'P0001';
    end if;
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    if exists (select 1 from public.cycles c where c.id = new.cycle_id and c.closed) then
      raise exception 'Cycle is closed and read-only' using errcode = 'P0001';
    end if;
    return new;
  end if;
  return old;
end;
$$;

create trigger items_guard_closed_cycle
  before insert or update or delete on public.items
  for each row execute function public.guard_closed_cycle();

create trigger activity_guard_closed_cycle
  before insert or update or delete on public.activity
  for each row execute function public.guard_closed_cycle();

-- ---------------------------------------------------------------------------
-- Row level security: every row belongs to auth.uid(), directly or via its cycle.
-- ---------------------------------------------------------------------------
alter table public.cycles   enable row level security;
alter table public.items    enable row level security;
alter table public.goals    enable row level security;
alter table public.activity enable row level security;

create policy "Users manage their own cycles"
  on public.cycles for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users manage their own goals"
  on public.goals for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users manage items in their own cycles"
  on public.items for all to authenticated
  using (exists (
    select 1 from public.cycles c
    where c.id = items.cycle_id and c.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.cycles c
    where c.id = items.cycle_id and c.user_id = (select auth.uid())
  ));

create policy "Users manage activity in their own cycles"
  on public.activity for all to authenticated
  using (exists (
    select 1 from public.cycles c
    where c.id = activity.cycle_id and c.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.cycles c
    where c.id = activity.cycle_id and c.user_id = (select auth.uid())
  ));

-- Explicit grants: signed-in users only, nothing for anon.
revoke all on public.cycles, public.items, public.goals, public.activity from anon;
grant select, insert, update, delete
  on public.cycles, public.items, public.goals, public.activity to authenticated;

-- ---------------------------------------------------------------------------
-- cycle_summaries: per-cycle rollups for Home / History / Past cycle.
-- security_invoker so the caller's RLS applies.
--   planned = Σ enabled item amounts
--   spent   = Σ |spend| on Fixed + Variable activity
--   saved   = Σ |amount| moved to Savings
-- ---------------------------------------------------------------------------
create view public.cycle_summaries
with (security_invoker = true)
as
select
  c.id,
  c.user_id,
  c.name,
  c.income,
  c.closed,
  c.created_at,
  coalesce((
    select sum(i.amount) from public.items i
    where i.cycle_id = c.id and i.enabled
  ), 0)::numeric(12, 2) as planned,
  coalesce((
    select sum(-a.amount) from public.activity a
    where a.cycle_id = c.id and a.amount < 0 and a.category in ('Fixed', 'Variable')
  ), 0)::numeric(12, 2) as spent,
  coalesce((
    select sum(-a.amount) from public.activity a
    where a.cycle_id = c.id and a.amount < 0 and a.category = 'Savings'
  ), 0)::numeric(12, 2) as saved
from public.cycles c;

revoke all on public.cycle_summaries from anon;
grant select on public.cycle_summaries to authenticated;

-- ---------------------------------------------------------------------------
-- open_new_cycle: atomically close the current cycle, open a new one, and
-- carry over its enabled line items. Income defaults to the previous cycle's.
-- ---------------------------------------------------------------------------
create function public.open_new_cycle(p_name text, p_income numeric default null)
returns public.cycles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_prev public.cycles;
  v_new  public.cycles;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select * into v_prev
  from public.cycles
  where user_id = v_uid and not closed
  for update;

  if v_prev.id is not null then
    update public.cycles set closed = true where id = v_prev.id;
  end if;

  insert into public.cycles (user_id, name, income)
  values (v_uid, btrim(p_name), coalesce(p_income, v_prev.income, 0))
  returning * into v_new;

  if v_prev.id is not null then
    insert into public.items (cycle_id, name, category, amount, enabled)
    select v_new.id, i.name, i.category, i.amount, true
    from public.items i
    where i.cycle_id = v_prev.id and i.enabled
    order by i.created_at;
  end if;

  return v_new;
end;
$$;

revoke execute on function public.open_new_cycle(text, numeric) from public, anon;
grant execute on function public.open_new_cycle(text, numeric) to authenticated;
