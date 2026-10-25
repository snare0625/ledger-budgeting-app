# Ledger — Build Plan

Portfolio/side project. Zero-based budgeting app built around monthly "cycles": income → line items (Fixed / Variable / Savings) → "left to allocate". Includes savings goals and read-only cycle history. Repo: `snare0625/ledger-budgeting-app` (public, empty — just created).

Goal: production-grade portfolio piece for remote/international dev role applications — real architecture, not a throwaway MVP. Build this first, then the same stack gets reused for a product-research-tool project next.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (Postgres + Auth)
- Deploy target: Vercel

## Design source
A full high-fidelity design handoff exists: `Ledger.dc.html` (interactive HTML prototype — reference only, not production code) + `README.md` (exact design tokens: colors, Plus Jakarta Sans type scale, spacing/radius, shadows, motion timings, per-screen behavior spec). Drop both into the repo (e.g. `/design/`) and have the agent read `README.md` first, then open `Ledger.dc.html` as the source of truth for anything ambiguous, before writing any UI code.

Key tokens, for quick reference while scaffolding Tailwind config:
- Colors: ink `#0e1113`, sub `#868b92`, line `#edeff2`, sheet `#ffffff`, soft `#f5f6f8`, blue `#2f66f5`, green `#12a150`, red `#d64f3a`, dark `#0b0c0e`, nav `#17191d`
- Category accents: Fixed `#5b6b8c` · Variable `#c98a2b` · Savings `#12a150` · Income `#2f66f5`
- Font: Plus Jakarta Sans (Google Fonts), weights 400–800
- Radius scale: inputs/small cards 14px, cards 18px, large/sheets 20–22px, pills/nav 999px
- Screen horizontal padding: 22px

## Screens (10 + Settings)
Sign in (passcode) → Home (current cycle) → Line items → Add/Edit item → New cycle → Goals → Goal detail → Add/Edit goal → History → Past cycle (read-only) → Settings.

Floating bottom nav (Home/Items/Goals/History/Settings) on main screens; sub-screens (forms, detail, past cycle, new cycle) hide nav, show a back pill instead.

## Data model (Supabase)
Map directly from the prototype's in-memory shape:
- `cycles`: id, user_id, name, income, closed (bool), created_at
- `items`: id, cycle_id, name, category ('Fixed'|'Variable'|'Savings'), amount, enabled (bool)
- `goals`: id, user_id, name, target, saved, note
- `activity`: id, cycle_id, item_id?, name, category, occurred_at, amount (signed — negative = spend)

Derived values (compute in app, not stored): `planned = Σ enabled item amounts`, `left = income − planned`, `savings = Σ enabled Savings amounts`, goal `pct = min(100, round(saved/target*100))`, cycle `net = income − spent`.

Auth: the design shows a 4-digit passcode unlock (hardcoded `2026` in the prototype) — replace with real Supabase Auth (email/password or magic link) for the actual build; keep a passcode-style lock screen as the UI if you want to preserve the design, just back it with a real session check.

## Build order
1. `npx create-next-app` scaffold + Tailwind + shadcn/ui init + Plus Jakarta Sans
2. Tailwind theme config with the tokens above
3. Supabase project + schema (tables above) + Supabase client setup
4. Auth screen (Sign in)
5. Home (hero + balance card + segmented tabs + insight card + recent activity)
6. Line items (list + toggle) → Add/Edit item
7. New cycle flow (closes current, carries over enabled items)
8. Goals list → Goal detail → Add/Edit goal
9. History list → Past cycle (read-only)
10. Settings
11. Deploy to Vercel, connect to Supabase env vars

## After this project
Next portfolio project in the queue, same stack (Next.js/Tailwind/shadcn/Supabase/Vercel), plus Nimble for scraping: a self-hosted product research tool (Minea/PiPiADS alternative) for ecommerce product discovery.
