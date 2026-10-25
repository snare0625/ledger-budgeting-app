# Handoff: Ledger — Zero-Based Budgeting App

## Overview
Ledger is a personal-finance app built around **budget cycles**. Each cycle (typically a month) has an income, a set of **line items** (planned allocations grouped into Fixed / Variable / Savings), and a "left to allocate" figure. Users also track **savings goals** and review **past cycles** in a read-only history. This handoff covers a 10-screen mobile flow: Sign in → Home (current cycle) → Line items → Add/Edit item → New cycle → Goals → Goal detail → Add/Edit goal → History → Past cycle → Settings.

## About the Design Files
The file in this bundle (`Ledger.dc.html`) is a **design reference created in HTML** — an interactive prototype showing intended look, layout, and behavior. It is **not production code to copy directly**. The task is to **recreate this design in your target codebase** using its established patterns, component library, and conventions (React, React Native, SwiftUI, Flutter, etc.). If no environment exists yet, pick the framework most appropriate to the project and implement the designs there. The prototype renders all screens through a client-side router with in-memory state; your implementation should wire the same screens to your real data layer (the schema/backend from your master prompt).

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii, and interactions are specified below with exact values. Recreate the UI pixel-perfectly using your codebase's libraries. The prototype is sized for a 390 × 844 viewport (iPhone 14/15 logical resolution).

---

## Design Tokens

### Color
| Token | Hex | Usage |
|---|---|---|
| `ink` | `#0e1113` | Primary text, primary buttons, dark avatar |
| `sub` | `#868b92` | Secondary text, labels, inactive icons |
| `line` | `#edeff2` | Hairline dividers, input borders |
| `sheet` | `#ffffff` | White content-sheet background |
| `soft` | `#f5f6f8` | Cards, list groups, inputs, chips |
| `blue` | `#2f66f5` | Links, active goal progress, insight accent |
| `green` | `#12a150` | Positive amounts, savings, success, "Open"/"Funded" |
| `red` | `#d64f3a` | Errors, negative net, destructive actions |
| `dark` | `#0b0c0e` | Hero background base |
| `darkCard` | `rgba(255,255,255,.055)` | Translucent card on dark hero |
| `darkLine` | `rgba(255,255,255,.12)` | Border on dark hero elements |
| `darkSub` | `rgba(255,255,255,.55)` | Secondary text on dark hero |
| `nav` | `#17191d` | Floating bottom-nav bar |
| `tintBlue` | `#eef3ff` | Insight card, note card backgrounds |
| `tintRed` | `#fdeeeb` | Sign-out button background |
| Hero gradient | `radial-gradient(130% 80% at 15% 0%, #1c2027 0%, #0b0c0e 60%)` | Home hero |
| Sign-in gradient | `radial-gradient(120% 70% at 25% 0%, #1b1f25 0%, #0b0c0e 58%)` | Sign in |

**Category accent colors** (used for icon tiles + dots):
Fixed `#5b6b8c` · Variable `#c98a2b` · Savings `#12a150` · Income `#2f66f5`. Icon tiles use the accent at ~12% opacity (`accent + "1f"`) as background with the accent as the glyph stroke.

### Typography
- **Family:** `Plus Jakarta Sans` (weights 400/500/600/700/800). Load from Google Fonts.
- Display / big numbers: 42px / 800 / letter-spacing `-.03em`
- Page title (h1): 26–28px / 800 / `-.02em`
- Section heading (h2): 17px / 800
- Card title: 17px / 800 / `-.01em`
- Row label / body: 15–15.5px / 700 (values) or 600 (labels)
- Secondary / sub: 13.5–14px / 500–600 / color `sub`
- Overline label: 12.5–13px / 800 / uppercase / letter-spacing `.03–.04em`
- Tab / pill label: 13–13.5px / 700

### Spacing & Radius
- Screen horizontal padding: **22px**
- Card padding: 16–20px
- Radius scale: inputs/small cards **14px**, cards **18px**, large cards / sheets **20–22px**, sheet top corners **28px**, pills/toggles/nav **999px**, icon tiles **12px**
- Toggle: 44 × 26px track, 21px knob, 2.5px inset
- Icon tile: 36–38px square

### Shadow
- Bottom nav: `0 16px 34px -10px rgba(10,12,14,.5)`
- Active tab pill: `0 1px 4px rgba(10,12,14,.1)`
- Success circle: `0 12px 30px -6px rgba(18,161,80,.5)`
- Toast: `0 12px 28px rgba(10,12,14,.4)`

### Motion
- `popIn` (success circle): 0.5s `cubic-bezier(.2,1.4,.4,1)` — scale 0.4→1.08→1, fade in
- `drawCheck` (checkmark): stroke-dashoffset 24→0 over 0.4s, 0.25s delay, ease
- `fadeUp` (toast): translateY(10px)→0 + fade, 0.3s ease
- `shake` (passcode error): 0.4s horizontal shake
- Toggle knob & progress fills: `.2s` / `.6s` transitions
- Toast auto-dismiss: 1900ms

---

## Global Layout & Chrome

- **Device frame:** 390 × 844 viewport, black bezel, dynamic-island pill (122 × 34) centered at top.
- **Status bar:** 54px tall, time left, signal/wifi/battery SVGs right. Text color is **white** on dark screens (Sign in, Home) and `ink` on white screens (computed per-route).
- **Floating bottom nav** (present on Home, Items, Goals, History, Settings): fixed 20px from bottom, 16px side insets, 62px tall, bg `nav`, radius 999. Five tabs: Home, Items, Goals, History, Settings. **Active** tab renders as a white pill (`padding:10px 15px`) with icon (`ink`) + label; **inactive** tabs are icon-only (`rgba(255,255,255,.55)`). Sub-screens (forms, detail, past cycle, new cycle) hide the nav and show a pill **back button** instead.
- Content scrolls; nav floats above with `paddingBottom:110` on scroll containers.
- Icons are inline stroke SVGs (24×24 viewBox, `stroke-width` ~2, round caps/joins). No icon font.

---

## Screens / Views

### 1. Sign in
- **Purpose:** Passcode unlock.
- **Layout:** Full dark gradient. Centered column: rounded-square logo tile (66px, translucent white, wallet icon) → "Ledger" (26/800) → "Enter your passcode" (`darkSub`) → 4 passcode dots (13px, 18px gap) → error line → numeric keypad pushed to bottom (`margin-top:auto`) → "hint: 2026".
- **Keypad:** 3-col grid, 70px circular keys, 16px gap, translucent white bg + border, 26px digits; bottom-right is backspace icon; bottom-left empty.
- **Behavior:** Tapping digits fills dots. On 4th digit (140ms later): if `"2026"` → set loading, 650ms → navigate Home; else → error state (`passErr`): dots + border turn `red`, container plays `shake`, message "Incorrect passcode — try again", passcode clears. Any keypress clears the error first.
- **Dots:** filled = white (or red in error); empty = transparent with `rgba(255,255,255,.5)` border.

### 2. Home (current cycle)
- **Purpose:** Snapshot of the active cycle.
- **Layout:** Dark hero (top) + white sheet overlapping upward by 14px (`margin-top:-14`, top radius 28), single scroll.
- **Hero:**
  - Row: greeting "Morning, Morgan 👋" (22/800 white) + subline "You're on track this cycle" (`darkSub`); right: 42px circular bell button (`flash("No new alerts.")`).
  - **Balance card** (`darkCard`, border `darkLine`, radius 22): label "Left to allocate · {cycleName}" + **"Open"** green status pill; big number = `income − planned` (42/800 white); green line "{income} income · {planned} planned"; full-width ghost button "+ Open new cycle" → New cycle screen.
- **Sheet:**
  - **Segmented tabs** (Overview / Fixed / Variable / Savings) in a `soft` pill track; active = white pill with soft shadow. Controls the list below.
  - **Insight card** (`tintBlue`, radius 18): blue dot + "Insight" overline; bold "You're set to save {savingsTotal} this cycle"; sub "Spending is down 8% from last month"; "View goals →" link → Goals.
  - **List:** Overview shows 3 category summary rows (icon tile, name, total, chevron → Items). A category tab shows that category's active line items (tap → edit). Empty category → "No active items in this category."
  - **Recent activity:** heading + "View all" (→ History). Rows: icon tile, name + date, signed amount (green if positive, else `ink`).

### 3. Line items
- **Purpose:** Manage all cycle allocations.
- **Layout:** White. Page header "Line items" / "{cycleName}" + dark "+ Add" pill (→ Add item). Groups for Fixed / Variable / Savings, each: uppercase group label + group total (sum of **enabled** items) → `soft` card containing rows.
- **Row:** toggle switch (green when on, `#d3d6db` off) · item name (button → edit; strikethrough + 50% opacity when off) · amount. Rows separated by `line` hairlines.
- **Empty state:** inbox icon + "No line items yet. Add your first expense to start the ledger."
- **Behavior:** Toggle flips `item.on` (affects Home totals & group totals). Tapping the name opens Edit item.

### 4. Add / Edit item
- **Purpose:** Create or edit a line item.
- **Layout:** White, back bar ("Line items"), title "New item" / "Edit item". Fields: **Name** (text), **Category** (3 segmented buttons Fixed/Variable/Savings; selected = `ink` bg, white text), **Amount** (decimal, strips non-numeric). Primary button "Add item"/"Save changes". Edit mode adds a red "Delete item" text button.
- **Validation:** Name and amount required, else toast "Name and amount are required." New items default `on:true`. Save → toast + return to Items.

### 5. New cycle
- **Purpose:** Close current cycle, open a new one.
- **Layout:** White, back bar ("Cancel"), title "Open a new cycle", explainer "Your current cycle will be closed and moved to history. Active line items carry over." Field: **Cycle name** (placeholder "September 2026"). **Carrying over** `soft` card lists first 3 enabled items + "+ N more items". Primary button "Open cycle".
- **Behavior:** On submit → `stamp` overlay (white 85% + blur): green 96px circle (`popIn`) with animated drawn checkmark, "Cycle opened" label. After 1500ms: prepend new open cycle to history (all others become `closed:true`), set `cycleName`, navigate Home, toast "New cycle opened." Button shows "Opening…" while loading.

### 6. Goals
- **Purpose:** List savings goals.
- **Layout:** White, header "Goals" / "Saving toward" + "+ Add". Vertical stack of `soft` cards (radius 20). Card: name + "{saved} of {target}"; right = **big % (blue)** or **"Funded" green pill** if `saved ≥ target`; full-width progress bar (9px, track `#e2e5ea`, fill blue or green). Tap → Goal detail.

### 7. Goal detail
- **Layout:** White, back bar ("Goals"), title (goal name) + soft "Edit" pill. Centered **156px progress ring** (13px stroke, track `#e2e5ea`, fill blue/green, rounded caps, rotated -90°) with centered "{pct}%" (34/800) + "saved"/"Funded" overline. Three stat cards: **Saved** (green), **Target** (ink), **Left** (blue). Optional **note** in a `tintBlue` card.

### 8. Add / Edit goal
- **Layout:** White, back bar ("Goals"), title "New goal"/"Edit goal". Fields: **Name**; **Target** + **Saved** side by side (decimal); **Note** (textarea, 3 rows). Primary "Add goal"/"Save changes"; edit adds red "Delete goal".
- **Validation:** Name and target required, else toast "Name and target are required."

### 9. History
- **Layout:** White, header "History" / "Past cycles". Stack of `soft` cards: cycle name + "Spent {x} · Saved {y}"; right = **"Open" green** or **"Closed" gray** status pill. Tap → Past cycle.

### 10. Past cycle (read-only)
- **Layout:** White, back bar ("History"), title (cycle name) + "Closed" pill (if closed), "Read-only" subline. `soft` summary card with rows: **Income** (ink), **Spent** (red), **Saved** (green), **Net** = income − spent (green if ≥0 else red), separated by hairlines.

### Settings
- **Layout:** White, header "Settings" / "Account". Profile card (`soft`): 52px `ink` avatar with initial "M", name "Morgan Ledger", "morgan@ledger.app". Group 1 (`soft` card): Currency "USD $", Monthly income "$5,200", Cycle starts on "1st", **Face ID unlock** toggle (on). Group 2: Export ledger "CSV", Help & support. Each row: label + value + chevron, hairline separators. All non-toggle rows fire a toast placeholder. **Sign out** button (`tintRed` bg, `red` text) → returns to Sign in and clears passcode.

---

## Interactions & Behavior (summary)
- **Navigation:** client-side route switch; the active bottom-nav item is derived by mapping sub-routes to their parent tab (e.g. `itemForm`→Items, `goalDetail`/`goalForm`→Goals, `pastCycle`→History, `newcycle`→Home).
- **Toast:** single global toast, bottom-center, auto-dismiss 1900ms, `fadeUp` in. Used for confirmations, validation errors, and placeholder actions.
- **Forms:** controlled inputs; amount/number fields strip to `[0-9.]`; required-field validation via toast before save.
- **Loading:** Sign in (650ms) and New cycle (1500ms) simulate async; replace with real requests.

## State Management
Prototype in-memory state (map to your schema/backend):
- `route`, `tab` (Home segmented control), `toast`, `loading`, `stamp` (success overlay), `passErr`, `pass`
- `cycleName` (current cycle label)
- `items[]`: `{ id, name, cat: 'Fixed'|'Variable'|'Savings', amt: number, on: boolean }`
- `goals[]`: `{ id, name, target: number, saved: number, note: string }`
- `activity[]`: `{ id, name, cat, when: string, amt: number }` (signed; negative = spend)
- `history[]`: `{ id, name, income, spent, saved, closed: boolean }`
- Form scratch: `form`, plus `editItem` / `editGoal` / `activeGoal` / `viewCycle` id pointers
- **Derived:** `planned = Σ enabled item amt`; `left = income − planned`; `savings = Σ enabled Savings amt`; goal `pct = min(100, round(saved/target*100))`, `done = saved ≥ target`; cycle `net = income − spent`.

## Assets
- **Fonts:** Plus Jakarta Sans (Google Fonts).
- **Icons:** inline stroke SVGs authored in the prototype (home, list, target, clock, gear, chevron, back, backspace, bell, wallet, arrow up/down, inbox, checkmark) — reimplement with your icon library (e.g. Lucide/SF Symbols) matching the stroke-2, round-cap style.
- No raster images. Avatar is a text initial. No third-party brand assets.

## Files
- `Ledger.dc.html` — the full interactive prototype (all 10 screens, router, state, styles). All exact values above are drawn from this file; open it as the source of truth for anything ambiguous.
