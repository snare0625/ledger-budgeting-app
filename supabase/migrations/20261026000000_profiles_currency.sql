-- Ledger — display currency (Settings → Currency)
-- Amounts are stored as plain numbers; currency only changes how they render.

alter table public.profiles
  add column currency text not null default 'USD'
  check (currency in ('USD', 'ZAR', 'EUR', 'GBP'));

grant update (currency) on public.profiles to authenticated;
