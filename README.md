# Ledger

Zero-based budgeting built around monthly **cycles**: income → line items (Fixed / Variable / Savings) → "left to allocate". Includes savings goals and a read-only history of past cycles.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres + Auth) · Vercel

- Build plan: [BUILD_PLAN.md](BUILD_PLAN.md)
- Design handoff: [design/README.md](design/README.md) (tokens and per-screen spec) and `design/Ledger.dc.html` (interactive prototype, the source of truth)

## Getting started

Prerequisites: Node 22+, and Docker running if you want the local Supabase stack.

```bash
npm install
npm run db:start            # local Supabase; prints the API URL + publishable key
cp .env.example .env.local  # paste those values in, and set LOCK_COOKIE_SECRET
npm run db:reset            # apply migrations + seed the demo user
npm run db:types            # regenerate src/lib/supabase/database.types.ts
npm run dev
```

**Demo account** (local seed): `demo@ledger.app` / `ledger-demo`, passcode `2026`.

To use a hosted Supabase project instead, run `npx supabase link --project-ref <ref>` and `npx supabase db push`, then put the project URL and publishable key in `.env.local`. For sign-up confirmation emails, set the "Confirm signup" email template's link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` so links work on any device, and add your site URL to the Auth redirect allow-list.

## Scripts

| Script | What it does |
|---|---|
| `dev` / `build` / `start` | Next.js |
| `lint` / `typecheck` / `test` | ESLint / `tsc --noEmit` / Vitest unit tests |
| `db:start` / `db:stop` | Start or stop the local Supabase stack |
| `db:reset` | Recreate the local DB from `supabase/migrations` |
| `db:types` | Generate TypeScript types from the local DB |

## Project layout

```
design/                     design handoff (reference only)
supabase/migrations/        schema: tables, RLS, view, RPCs, passcode lock
supabase/seed.sql           local demo user + prototype data
src/app/(auth)/             login, unlock, passcode setup (shared dark shell)
src/app/auth/confirm/       email-link landing route
src/app/globals.css         Tailwind theme: Ledger tokens + shadcn variable mapping
src/components/auth/        passcode keypad
src/lib/auth/               unlock cookie, session helpers, auth Server Actions
src/lib/supabase/           browser/server clients, proxy session logic, DB types
src/proxy.ts                Next.js proxy (formerly middleware): session refresh + route gating
```

## Auth: email sign-in + passcode lock

Supabase Auth (email + password) is the identity. The design's 4-digit passcode is an **app lock** on top of a signed-in session, like a banking app.

```
no session ──────────────► /login ── email sign-in / sign-up ──┐
session, locked ─────────► /unlock ── correct passcode ────────┤──► app
session, no passcode yet ► /passcode/setup ── create + confirm ┘
```

- **Gating** happens in `src/proxy.ts` on every request. Pages re-check the session as a fallback.
- **Unlocked state** is an HttpOnly cookie, HMAC-signed with `LOCK_COOKIE_SECRET` and bound to the user id. It expires after 30 minutes of inactivity, sliding while the app is in use. A fresh email sign-in also unlocks.
- **Passcodes** are bcrypt-hashed (`pgcrypto`) in a `private` schema that the Data API doesn't expose. They're only reachable through `has_passcode()`, `set_passcode()` and `verify_passcode()`.
- **Brute force:** 5 wrong passcodes lock verification for 5 minutes. This is enforced in Postgres.
- **Forgot passcode:** sign out, sign in with email, set a new one. `set_passcode` only allows replacing a passcode with the current one or after a password sign-in in the last 10 minutes (checked from the JWT's `amr` claim).
- **Scope:** the passcode locks the UI. It doesn't protect data from someone who already controls the browser's Supabase session; RLS and the session handle data access.

## Data model

| Table | Notes |
|---|---|
| `cycles` | One budget period per row; owned by `user_id`. A partial unique index allows only **one open cycle per user**. |
| `items` | Planned allocations in a cycle (`category`: Fixed / Variable / Savings, `enabled`). |
| `goals` | Savings targets (`target > 0`, `saved >= 0`). |
| `activity` | Signed transactions in a cycle (negative = spend); optional link to an item. |

- **RLS** on every table: users only see their own rows (`items` and `activity` through their cycle). `anon` has no access.
- **Closed cycles are read-only**: a trigger rejects any item or activity write that touches a closed cycle.
- **`cycle_summaries`** view (security invoker) gives `planned`, `spent` and `saved` per cycle for Home and History.
- **`open_new_cycle(name, income?)`** RPC closes the current cycle, opens a new one and carries over the enabled items, all in one transaction.

Everything else is derived in the app: `left = income − planned`, goal `pct`, cycle `net = income − spent`.

## Theme tokens

Tokens live in `src/app/globals.css` (Tailwind v4 `@theme`, no `tailwind.config`). Examples: `bg-ink`, `text-sub`, `border-line`, `bg-soft`, `text-green`, `bg-cat-fixed/12`, `px-gutter`, `rounded-card`, `rounded-t-sheet`, `text-display`, `text-title`, `text-overline`, `shadow-nav`, `animate-pop-in`, `bg-hero-gradient`. The shadcn semantic variables (`primary`, `muted`, `border`, …) are mapped onto the same palette.
