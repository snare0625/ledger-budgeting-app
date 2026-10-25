# Ledger

Zero-based budgeting built around monthly **cycles**: income → line items (Fixed / Variable / Savings) → "left to allocate". Includes savings goals and a read-only history of past cycles.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres + Auth) · Vercel

- Build plan: [BUILD_PLAN.md](BUILD_PLAN.md)
- Design handoff: [design/README.md](design/README.md) (tokens and per-screen spec) and `design/Ledger.dc.html` (interactive prototype, the source of truth)

## Getting started

Prerequisites: Node 20+, and Docker running if you want the local Supabase stack.

```bash
npm install
npm run db:start            # local Supabase; prints the API URL + publishable key
cp .env.example .env.local  # paste those values in
npm run db:types            # regenerate src/lib/supabase/database.types.ts
npm run dev
```

To use a hosted Supabase project instead, run `npx supabase link --project-ref <ref>` and `npx supabase db push`, then put the project URL and publishable key in `.env.local`.

## Scripts

| Script | What it does |
|---|---|
| `dev` / `build` / `start` | Next.js |
| `lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `db:start` / `db:stop` | Start or stop the local Supabase stack |
| `db:reset` | Recreate the local DB from `supabase/migrations` |
| `db:types` | Generate TypeScript types from the local DB |

## Project layout

```
design/                     design handoff (reference only)
supabase/migrations/        schema: tables, RLS, view, RPC
src/app/globals.css         Tailwind theme: Ledger tokens + shadcn variable mapping
src/lib/supabase/           browser/server clients, proxy session refresh, DB types
src/proxy.ts                Next.js proxy (formerly middleware): refreshes the auth session
```

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
