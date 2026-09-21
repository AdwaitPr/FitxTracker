# FitxTracker — Phase 0 port audit

Source of truth: prototype source tree (`src/index.css`, `src/ui.tsx`, `src/forms.tsx`, `src/charts.tsx`,
`src/icons.tsx`, `src/chrome.tsx`, `src/panels.tsx`, `src/pages/*.tsx`, `src/data.ts`, `src/data2.ts`) —
this is the code the single-file `prototype.html` is generated from (vite-plugin-singlefile inlines it into
`dist/index.html`), so line-level content is identical.

Target: Next.js 16 App Router + React 19 + Tailwind v4 + lucide-react + Prisma/SQLite + NextAuth.
Nothing is ported yet. **Phase 0 = audit only.** The gap list (§4) is blocking: I need decisions before Phase 4/5.

---

## 1. Token inventory (from `src/index.css`)

### 1.1 Colour — light (`:root`) / dark (`.dark` → will become `[data-theme="dark"]`)

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--frame` | `#B9BFCA` | `#07070C` | page backdrop outside the app window (only visible ≥1600px) |
| `--canvas` | `#F5F6FB` | `#0E0E16` | main canvas |
| `--surface` | `#FFFFFF` | `#171724` | cards |
| `--inset` | `#F7F8FC` | `#1E1E2E` | inset panels (chart wells, KPI wells) |
| `--ink` | `#0F0F14` | `#F3F3F8` | primary text |
| `--ink-soft` | `#4A4F63` | `#C3C6D6` | secondary text |
| `--muted` | `#6B7086` | `#9A9FB5` | micro labels/captions — deliberately darker than the reference `#8A8FA3` for 4.9:1 |
| `--hairline` | `#E8EAF2` | `#262638` | rules & input borders |
| `--primary` | `#6C5CE1` | `#8577F0` | |
| `--primary-dark` | `#5A4BD1` | `#6C5CE1` | |
| `--primary-soft` | `#E9E6FB` | `rgba(133,119,240,.16)` | |
| `--primary-soft-2` | `#C9C3F5` | `rgba(133,119,240,.38)` | solid-ish bar / chart "light" bar |
| `--danger` | `#F26B3A` | `#F26B3A` | logout, destructive |
| `--tag-violet-bg/fg` | `#EAE7FB` / `#5A4BD1` | `rgba(133,119,240,.16)` / `#B4A9FF` | |
| `--tag-cyan-bg/fg` | `#E3F4F8` / `#1A6F8A` | `rgba(47,164,199,.16)` / `#7FD3EC` | |
| `--tag-pink-bg/fg` | `#FCE7F6` / `#B02E92` | `rgba(217,70,181,.16)` / `#F49BDD` | |
| `--tag-amber-bg/fg` | `#FFF3DC` / `#8F5A00` | `rgba(217,138,0,.16)` / `#F2C071` | |
| `--tag-green-bg/fg` | `#E2F7EC` / `#0A6E47` | `rgba(18,166,106,.16)` / `#6FE0AE` | recovery "optimal", completed sets |
| danger tag (inline only) | `#FDE9E1` / `#B03A16` | `rgba(242,107,58,.2)` / `#FFA183` | **needs promoting to a real token** `--tag-danger-bg/fg` |

Tag foregrounds were darkened vs. the reference swatches so every tint hits ≥4.5:1 on its own tint.
Do not "restore" `#2FA4C7 / #D946B5 / #D98A00 / #12A66A` for text — those are the *fills*, keep them for bars/dots.

### 1.2 Radii / shadows / type

| Token | Value |
|---|---|
| `--r-tag` | 12px |
| `--r-panel` | 16px |
| `--r-card` | 20px |
| `--r-hero` | 28px |
| (full) | 9999px — pills, chips, inputs, buttons |
| `--fx-shadow-soft` | `0 8px 30px rgba(20,20,60,.06)` / dark `0 8px 30px rgba(0,0,0,.35)` |
| `--fx-shadow-lift` | `0 14px 38px rgba(20,20,60,.10)` / dark `0 14px 38px rgba(0,0,0,.5)` |
| `--fx-shadow-window` | `0 40px 90px rgba(20,24,45,.28)` / dark `0 40px 90px rgba(0,0,0,.55)` |
| `--fx-font-display` | Plus Jakarta Sans, Manrope, Inter, system-ui |

> The raw layer is `--fx-`/`--r-` prefixed **only** because `@theme` emits `--shadow-soft` and `--font-display`
> and a same-named raw var would be a circular `var()`. In Next.js this maps to `next/font`'s
> `--font-display` (Plus Jakarta Sans) with `Inter` kept as `--font-inter` until pages are migrated.

Type scale used everywhere: display 25/32/38px (hero) · page title 26–30px · section 17–19px ·
card title 15–17px · body 13.5–15px · caption 12–12.5px · micro 11px uppercase `letter-spacing:.14em` weight 600.
Headings: `font-semibold`, `letter-spacing:-0.02em`. Numeric text uses `font-variant-numeric: tabular-nums`.

### 1.3 Utilities / motion (must survive the port)

| Name | Purpose |
|---|---|
| `.micro` | 11px uppercase tracked label |
| `.tnum` | tabular figures |
| `.dashrule` | 1px dashed bottom rule (row separators) |
| `.no-scrollbar` | scroll-snap rails without visible scrollbar |
| `.app-window` | ≥1600px: max-width 1720px, 32px radius, window shadow, `overflow: clip` |
| `.fx-range` | styled `input[type=range]` incl. `-moz-range-progress`, `--pct` filled track |
| `.check-pop / .check-draw / .check-ripple` | set-complete tick animation (scale pop, stroke draw, ripple) |
| `.caret` | blinking insertion caret in the typing canvas |
| `.rise` | 480ms fade-up; used with inline `animation-delay` for stagger |
| `.lift` | hover `translateY(-2px)` + `--fx-shadow-lift` (200ms ease-out) |
| `prefers-reduced-motion` | global kill-switch for animation/transition/`scroll-behavior` |

---

## 2. Component inventory (prototype → proposed location)

### 2.1 Primitives (Phase 2)
| Prototype | Props worth keeping | Target |
|---|---|---|
| `Card` (`ui.tsx`) | `as`, `className` | `components/ui/card.tsx` |
| `IconButton` | `icon, label*, variant outline\|solid\|ghost\|soft, size, badge` | `components/ui/icon-button.tsx` |
| `Tag` | `tone violet\|cyan\|pink\|amber\|green\|danger, icon` | `components/ui/tag.tsx` |
| `Menu` / `Popover` | `trigger render-prop, align` | `components/ui/popover.tsx` (+ `menu.tsx`) |
| `RingProgress` | `value 0–1, size, stroke, color, label, badge` | `components/ui/ring-progress.tsx` |
| `SectionHeader` | `title, id, actions` | `components/ui/section-header.tsx` |
| `Segmented` | `options, value, onChange, label` | `components/ui/segmented.tsx` |
| `Button` (`forms.tsx`) | `variant black\|primary\|soft\|outline\|ghost\|danger\|dangerSoft, size, icon, arrow` | `components/ui/button.tsx` |
| `Input / Select / Textarea` | `label, hint, error, icon, suffix`, pill shape | `components/ui/input.tsx` (keep `cn()`) |
| `Slider / Stepper / Toggle / Chip / Disclosure` | | `components/ui/controls.tsx` |
| `Modal` | `open, onClose, title, footer, danger, size`, Esc + focus + scroll-lock | `components/ui/modal.tsx` |
| `Skeleton` | `className` | `components/ui/skeleton.tsx` |
| `Toast` | `message, tone` | `components/ui/toast.tsx` |
| `EmptyState` | `icon, title, body, action` | `components/ui/empty-state.tsx` |
| `ProgressBar` (extracted from inline bars) | `value, max, color, label` | `components/ui/progress-bar.tsx` |
| `StatChip` (`panels.tsx`) | `label, value, unit, caption, tone, icon` | `components/ui/stat-chip.tsx` |

### 2.2 Charts (hand-rolled SVG, shared)
`components/charts/{line-chart,bar-chart,donut,calendar-heatmap,grid-heatmap,scatter,sparkline}.tsx`
— all already expose `summary` (sr text), hover **and focus** tooltips (`tabIndex=0` hit rects),
dashed gridlines, alternating `--primary-soft-2` / `--primary` bars, animated `stroke-dashoffset` / `scaleY`.
`LineChart` supports a `goal` line + `goalLabel`; `Bars` supports a second `line` series with a right axis.

### 2.3 Shell
`chrome.tsx` → `components/layout/{shell,sidebar,top-bar,mobile-nav,page-header,logo}.tsx`.
Keeps: active-nav `pathname === href || pathname.startsWith(href + "/")`, OVERVIEW / COGNITIVE / ACCOUNT
sections, Settings + orange-red Logout, mobile 5-slot bar with centre floating Log, 260px / 76px / 3-col
responsive behaviour.

### 2.4 Feature composites
`panels.tsx` (dashboard: `HeroBanner`, `StatChipRow`, `WorkoutCover`+`WorkoutCard`, `WorkoutTable`,
`StatisticCard`, `RecoveryCard`) and the per-screen composites (`EntryCard` set grid, `RestTimer`,
`CompleteButton`, `LibraryModal`, `Results`, `StressDots`, `HistoryRow`, `SetTable`, `DeleteWorkoutDialog`)
→ `components/{dashboard,workouts,recovery,progress,cognitype,exercises}/*`.

Icons: the prototype uses a 55-name hand-drawn 1.5px stroke set. **In the real app these become `lucide-react`
names 1:1** (grid→LayoutGrid, dumbbell→Dumbbell, history→History, list→List, pulse→Activity, trend→TrendingUp,
user→User, sparkle→Sparkles, calendar→Calendar, bars→ChartNoAxesColumn, gear→Settings, logout→LogOut,
search→Search, bell→Bell, moon/sun, check, close→X, scale→Scale, clock→Clock, zap→Zap, copy→Copy, trash→Trash2,
eye/eyeOff, play/pause, timer→Timer, edit→Pencil, info→Info, keyboard→Keyboard, volume→Volume2, lock→Lock,
save→Save, trophy→Trophy, flame→Flame, target→Target, refresh→RotateCcw, home→House, shield→ShieldAlert,
chevrons, arrows, more→EllipsisVertical). The two **drawn** assets stay SVG (they are brand/illustration, not icons):
`Logo` (4-point sparkle mark) and `MuscleGlyph` (7 tone-on-tone line glyphs used in workout covers & exercise tiles).

---

## 3. Screen inventory & route mapping

| # | Prototype route | Real route | Server/Client today | Notes |
|---|---|---|---|---|
| 1 | `#/` | `/` | server | marketing landing |
| 2 | `#/login` | `/login` | server + client form | |
| 3 | `#/register` | `/register` | server + client form | 2-step |
| 4 | `#/dashboard` | `/dashboard` | server + client bits | hero, 4 stat chips, carousel, table, right rail |
| 5 | `#/workouts/new` | `/workouts/new` | **client (852 ln)** | two-pane logger |
| 6 | `#/workouts/history` | `/workouts/history` | server + client filters | grouped list |
| 7 | `#/workouts/:id` | `/workouts/[id]` | server + client dialog | accordion + delete |
| 8 | `#/recovery` | `/recovery` | server + client form | gauge + log + 14-day history |
| 9 | `#/progress` | `/progress` | **client (804 ln)** | 5 chart modules, skeletons |
| 10 | `#/exercises` | `/exercises` | server + client filters | library grid |
| 11 | `#/profile` | `/profile` | server + client form | profile / settings tabs |
| 12 | `#/cognitype` | `/cognitype` | **client (1040 ln)** | setup → typing canvas → results |
| 13 | `#/cognitype/sessions` | `/cognitype/sessions` | client filters + table | |
| 14 | `#/cognitype/sessions/:id` | `/cognitype/sessions/[id]` | server | results composite |
| 15 | `#/cognitype/analytics` | `/cognitype/analytics` | client charts | 4 modules |

---

## 4. GAP LIST — UI with no backing data (blocking; need a decision per row)

Legend: **(a)** remove · **(b)** derive from existing data · **(c)** schema change (or new API route — flagged where that matters).

### 4.1 Global (shell & landing)

| # | UI element | Where | Backing today | Proposed | Question |
|---|---|---|---|---|---|
| G1 | Recovery-state **dev switcher** (`DevSwitcher`, "PROTOTYPE · RECOVERY STATE", 4 buttons) | dashboard above hero | none (dev-only) | **(a) remove** — explicitly not shipped | confirm |
| G2 | Notification bell + unread dot + popover copy ("Two nights under 6 h…") | top bar | `src/lib/alerts.ts` (scoring/alerts exist) | **(b) derive** — dot shown when `alerts.ts` returns ≥1 active alert for today; popover lists the alert titles/descriptions only. No persistence, no acknowledgement, no unread counter | does `alerts.ts` return a list of alert objects with `title`+`message`, or a single verdict? |
| G3 | Global search field ("Search workouts, exercises…") | top bar | exercise + workout queries | **(b) derive** — decorative on dashboard is not allowed, so: submit navigates to `/exercises?q=` (and `/workouts/history?q=`), filters applied in the existing `searchParams`-driven queries. No new route/API | OK to make it a *navigation* search rather than an instant omnibox? Otherwise **(a) remove** |
| G4 | "Log workout" icon button in top bar | top bar | route `/workouts/new` exists | **(b)** plain link | confirm |
| G5 | Landing stats "4.9 App Store rating · 2.1M sets logged · 31% fewer missed sessions" | `/` | none | **(a) replace** with non-numeric claims or real self-hosted stats; hard-coding unverifiable numbers in production copy is the risk here | which copy do you want? |
| L6 | Landing testimonials (3 rotating quotes + named people + result tags) | `/` (also `/login`,`/register` panel) | none | **(c) static marketing content** (no schema) — keep, but they are fictional people; **(a)** replace with anonymised roles, or **(c)** a `Testimonial` model later | keep fictional names or anonymise? |
| L7 | "Continue with demo account" button on `/login` | `/login` | auth | **(a) remove** (touches auth behaviour, which I must not change) | confirm |

### 4.2 Dashboard

| # | UI element | Backing today | Proposed | Question |
|---|---|---|---|---|
| D1 | Hero headline/subcopy/CTA **variant per recovery level** (optimal/normal/warning/critical) | `alerts.ts` verdict | **(b) derive** — the 4 copy variants become a map keyed by the existing level/verdict; driven by today's real recovery row | does `alerts.ts` expose the level as a 4-value enum or as a score? |
| D2 | Stat chip "This Week 3 of 4" + `caption "Mon–Sun · goal 4"` | workouts by date | **(b) derive count** + **(c) for the goal** | see G8 |
| D3 | Stat chip "This Month 11" + `goal 14` | workouts by date | **(b) derive count** + **(c) for the goal** | see G8 |
| D4 | Stat chip "Body Weight 74.5 kg · 178 cm · last weigh-in 17 Feb" | needs a weight log | **(b)** if a body-weight table exists → latest row; else **(c) add `BodyWeightLog`**; else **(a)** replace chip with "Total Volume this month" derived from sets | biggest schema question — see G8/G9 |
| D5 | Stat chip "Days Since Last 1" | workout dates | **(b) derive** | confirm |
| D6 | Statistic rail: **weekly goal ring 3/4 = 75% + % badge** | none (goal not stored) | **(c)** `weeklyGoal Int @default(4)` on user/profile, or **(b)** constant default 4 with the % derived | which? |
| D7 | "Good Morning, Aarav 🔥" + `streakLine "4-week streak · 3 sessions logged this week"` | name + workout dates | **(b) derive** — greeting from local hour, streak from `progress.ts` | confirm |
| D8 | Bar chart "Volume · '000 kg", Week/Month toggle, 5 bars (21.4k … 26.7k) | sets (weight × reps) + dates | **(b) derive** via `progress.ts` | confirm bucketing (ISO week / calendar month) |
| D9 | "Today's Recovery" card: gauge + 4 factor bars with weights 40/30/20/10 | recovery log + `alerts.ts` | **(b) derive** | confirm |
| D10 | Recovery card **"Log"** pill button | no route/action in prototype | **(b)** link to `/recovery` (the form lives there) | or **(c)** open a modal that POSTs to your existing recovery action |
| D11 | Recent-workout cards: **heart / favourite button** (top-right of cover) | none | **(a) remove** (nothing to derive) — or **(c)** `favourite Boolean` on `Workout` | which? |
| D12 | Workout card **progress bar "18/20 sets"** | `Set.completed` exists? | **(b) derive** if sets carry a completed flag; else **(a) remove bar** and show sets count | is there a `completed` column on `Set`? |
| D13 | Workout card footer "top lift + total volume" | sets | **(b) derive** | confirm |
| D14 | Card **cover artwork** (SVG gradient mesh + muscle glyph) | none | **(b) derive** — deterministic tint by muscle group (pure CSS/SVG, no data). Not a gap, listed for clarity | confirm |
| D15 | Three-dot `Menu` (View / Duplicate / Delete) on chips, cards, statistic card | no actions wired | **(b)** wire to real actions where they exist: View→`/workouts/[id]`, Delete→existing delete action (**needs an API route if none exists**), Duplicate→`/workouts/new?from=<id>` (client prefill). Otherwise **(a)** drop the menu from stat chips (it is decorative there) | which actions really exist today? |
| D16 | Workouts-per-week "2/8 watched"-style caption on chips | — | covered by D2/D3 | — |

### 4.3 workouts/new (logger)

| # | UI element | Backing today | Proposed | Question |
|---|---|---|---|---|
| N1 | **Planned duration** vs elapsed ring ("Planned 60 min · 12 min left") | `Workout.durationMin` exists | **(b) derive, no schema** — the entered duration *is* the field; the ring compares the client-side session timer against it | confirm |
| N2 | Set fields **rest seconds** | likely absent on `Set` | **(c)** `restSeconds Int?` on `Set` — or **(a)** keep rest as client-only hint feeding the rest timer (not saved) | which? |
| N3 | **Advanced block**: variation (Standard/Diamond/Weighted/Slow-Tempo), tempo "3-1-3", added weight kg, RPE 1–10 | likely absent | **(c)** add `variation String?`, `tempo String?`, `addedWeightKg Float?`, `rpe Int?` to `Set`; **or (b)** keep RPE only (feeds "avg RPE" KPI) and fold the rest into notes; **or (a)** drop the Advanced disclosure entirely | which subset? |
| N4 | **Completed checkbox** on sets | ? | **(b)** if `Set.completed` exists; **(c)** `completed Boolean @default(false)` otherwise | confirm |
| N5 | "Copy previous set" / "Add set" / per-set delete | client ops on a draft | **(b)** client state, persisted on save via your existing create-workout path | does the existing save path accept arbitrary set counts? |
| N6 | **Rest timer floating pill** (+30s / pause / skip) | client only | **(b)** pure client (Capacitor-friendly); no data | confirm |
| N7 | **Elapsed session timer ring** + "Start timer" | client only | **(b)** pure client | confirm |
| N8 | **"Use last workout" template** button | needs last workout + its sets | **(b) derive** from most recent workout | confirm |
| N9 | **Exercise library search + muscle + equipment filters** in the picker | `Exercise` table | **(b) derive** | are `muscle` + `equipment` columns on `Exercise` today? |
| N10 | Saved-summary modal + toast | client | **(b)** | confirm |
| N11 | Sticky bottom action bar (mobile) | client | **(b)** | confirm |

### 4.4 workouts/history & workouts/[id]

| # | UI element | Backing today | Proposed | Question |
|---|---|---|---|---|
| H1 | Search + muscle-group chips + date range filters | queries | **(b)** via `searchParams` | confirm |
| H2 | Grouped-by-week headers ("This week / Last week / N weeks ago") | dates | **(b) derive** | confirm |
| H3 | Row "top set" + "volume" columns | sets | **(b) derive** | confirm |
| H4 | **"Repeat workout"** button | client prefill | **(b)** → `/workouts/new?from=<id>` | OK to add a query param (no new route)? |
| H5 | **"Edit"** button on detail | **no edit route exists** | **(a) remove** — or **(c)** `/workouts/[id]/edit` (a new route ⇒ behaviour change, needs your OK) | which? |
| H6 | **Delete workout** flow + type-DELETE confirmation | ? | **(b)** if a delete action/API exists → wire it; **(c)** add one otherwise (new API route ⇒ needs OK) | does a delete endpoint exist? |
| H7 | KPI chip **"Avg RPE"** | needs `Set.rpe` | **(c)/(b)** per N3; if RPE is dropped → **(a)** swap chip for "Total reps" derived | — |
| H8 | "Session facts" card: **Started 18:05 / Finished 18:47** | needs timestamps | **(b)** derive from `createdAt`/`updatedAt` + `durationMin` if columns exist; else **(a) remove those two rows** | which timestamp columns exist? |
| H9 | "Session facts": **"Recovery that day 79 · Normal"** | recovery log | **(b) derive** by date join | confirm |
| H10 | "Session facts": **"Body weight 74.5 kg"** | weight log | **(b)** if weight log exists; else **(a) remove row** | see G9 |
| H11 | Exercise accordion "best 82.5 kg × 5" | sets | **(b) derive** | confirm |

### 4.5 Recovery

| # | UI element | Backing today | Proposed | Question |
|---|---|---|---|---|
| R1 | Daily log form (sleep hours, quality, stress 1–10, gut, notes) | recovery log | **(b)** map to the existing columns you already score in `alerts.ts` | exact column names for quality / stress / gut (enum vs string vs int)? |
| R2 | Gauge bands ≥80 / 60–79 / 40–59 / <40 + copy | `alerts.ts` | **(b)** — thresholds/copy must come from `alerts.ts` so the two never disagree | confirm thresholds live in `alerts.ts` |
| R3 | "How this is calculated" popover (40/30/20/10) | `alerts.ts` | **(b)** — render the weights it exposes (or document as static copy) | are the weights exported? |
| R4 | **14-day history rows** | recovery log | **(b)** last 14 rows | confirm |
| R5 | **Sleep vs stress trend chart** (14 d, dual line) | recovery log | **(b)** | confirm |
| R6 | "Suggested intensity" text (RPE 8–9 etc.) | none | **(b)** map from level (static copy table keyed by level) | confirm |

### 4.6 Progress

| # | UI element | Backing today | Proposed | Question |
|---|---|---|---|---|
| P1 | Body-weight line + **goal line** + **log-weight modal** | needs weight log **and a goal weight** | **(b)/(c)** per G9; goal line can use profile `weight` target or **(a)** drop the goal line | see G9 |
| P2 | Strength module: **estimated 1RM** (Epley) + volume bars, exercise selector | `progress.ts` | **(b)** — e1RM formula must come from `progress.ts`, not re-implemented | confirm |
| P3 | **PR list** with deltas (+5 kg) | `progress.ts` | **(b)** | confirm |
| P4 | **Frequency heatmap** (52 w GitHub-style) | workout dates | **(b)** | confirm |
| P5 | **Muscle-group donut** | sets × exercise.muscle | **(b)** | confirm |
| P6 | Range selector 4W/3M/6M/1Y + **skeleton loading states** | client | **(b)** + `loading.tsx` / Suspense skeletons | confirm |
| P7 | KPI strip incl. "New PRs 6 / last 30 days" | `progress.ts` | **(b)** | confirm |

### 4.7 Exercises / Profile

| # | UI element | Backing today | Proposed | Question |
|---|---|---|---|---|
| E1 | **"Create custom" exercise button** | `Exercise` may be seeded/global | **(a) remove** — or **(c)** `Exercise.userId` nullable (a schema change) | which? |
| E2 | **Favourite hearts** on exercise cards ("favourites float to the top of the picker") | none | **(a) remove** — or **(c)** `favourite Boolean` on a user↔exercise join | which? |
| E3 | Muscle + equipment filters | `Exercise` | **(b)** | confirm columns |
| U1 | Profile fields **age, gender** | ? | **(b)** if `dateOfBirth`/`gender` exist (age derived from DOB); **(c)** add nullable columns; **(a)** drop the two fields | which? |
| U2 | Profile fields height/weight/goal | ? | **(b)** if on user; **(c)** otherwise | confirm |
| U3 | Tag **"4-week streak"** + **"Member since Oct 2025"** + stats (126 workouts / 1.2M kg / 31 PRs) | streak & counts **(b)** derivable; "member since" needs `createdAt` | **(b)** | confirm `user.createdAt` exists |
| U4 | **Body-weight log entry** list + add form | see G9 | see G9 | — |
| U5 | Settings: **units kg/lb**, **recovery reminders**, **weekly summary email** toggles | no preference store | **(a) remove all three** for now — or **(c)** `UserPreference` model (schema) ; reminders/summary also imply email jobs ⇒ behaviour change | which? |
| U6 | **Dark theme toggle** in settings | cookie | **(b)** cookie via Phase 1 server action — no schema | confirm |
| U7 | Security: **change password** form | auth | **(a) remove** or **(b)** wire to existing credential flow if one exists | does a password-update endpoint exist? |
| U8 | **Delete account** with "14-day grace period" | none | **(a) remove** — or **(c)** `deletedAt` + new API route (behaviour change) | which? |
| U9 | Avatar **"change avatar"** button | none | **(a) remove** — or **(c)** file storage (out of scope) | recommend (a) |

### 4.8 CogniType

| # | UI element | Backing today | Proposed | Question |
|---|---|---|---|---|
| C1 | Passage library (3 categories × 3 difficulties) | `src/lib/cognitype/*` | **(b)** use the real library; if it is code-level, fine; if DB-backed, query it | where do passages live today? |
| C2 | Sound / difficulty / category / time-of-day setup | session columns? | **(b)** map to the real session columns | confirm column names |
| C3 | Typing canvas + per-char highlighting + HUD (WPM/accuracy/progress) | capture logic (do not touch) | **(b)** visual only | confirm |
| C4 | Metrics: mean latency, latency σ, pause entropy, error rate, attention events | `cognitype/*` | **(b)** render exactly what the lib returns; **do not re-derive** | which fields does the result object expose? |
| C5 | Focus Stability Score + sub-scores (Attention Stability, Rhythm, Accuracy, Pause Control) | `cognitype/*` | **(b)** | are sub-scores persisted per session or recomputed? |
| C6 | Latency **sparkline** (60 keystrokes) | depends on whether per-keystroke latencies are persisted | **(b)** if stored; **(a) drop sparkline** otherwise (it must not synthesise data) | is the latency array persisted? |
| C7 | Sessions filters (search / sound / level) | queries | **(b)** `searchParams` | confirm |
| C8 | Analytics: bars by sound, heatmap by time-of-day × weekday, trend + moving average | sessions | **(b)** | confirm |
| C9 | Analytics: **recovery-vs-focus scatter** | sessions + recovery log | **(b)** by date join | confirm both are date-keyed |
| C10 | Analytics chips "Best sound / Best time / Sessions / Trend" | derived | **(b)** | confirm |
| C11 | Session detail "Repeat setup" | link | **(b)** | confirm |

### 4.9 Consolidated schema asks (only if you choose (c))

1. **`BodyWeightLog`** (`date`, `weightKg`, `userId`) — backs G9/D4/U4/P1. Biggest one; four surfaces depend on it.
2. **`Set` extensions** — `restSeconds`, `rpe`, (`variation`, `tempo`, `addedWeightKg`) — backs N2/N3/H7.
3. **`User`/`Profile` extensions** — `weeklyGoal Int?`, `heightCm`, `gender`/`dateOfBirth`, optional `UserPreference`.
4. **`Workout.favourite` / exercise favourite** — only if hearts stay (D11/E2).
5. **`Exercise.userId`** — only if custom exercises stay (E1).
6. **`User.deletedAt`** — only if delete-account stays (U8) + a new API route.
7. New API routes needed regardless of schema: **delete workout** (H6) and **delete account** (U8) — flagged because adding routes is a behaviour change.

---

## 5. Proposed component folder structure

```
src/
  app/
    globals.css                  # Phase 1: tokens + @theme inline + deprecated aliases
    (marketing)/page.tsx         # /
    (auth)/login/page.tsx
    (auth)/register/page.tsx     # 2-step
    (dashboard)/
      layout.tsx                 # Phase 3: Shell (sidebar + top bar + rail slot + mobile nav)
      dashboard/page.tsx
      workouts/new/page.tsx
      workouts/history/page.tsx
      workouts/[id]/page.tsx
      recovery/page.tsx
      progress/page.tsx
      exercises/page.tsx
      profile/page.tsx
      cognitype/page.tsx
      cognitype/sessions/page.tsx
      cognitype/sessions/[id]/page.tsx
      cognitype/analytics/page.tsx
    actions/theme.ts             # server action: set theme cookie
  components/
    ui/            button card input select textarea tag icon-button segmented
                   popover menu modal skeleton toast empty-state progress-bar
                   ring-progress stat-chip section-header controls (slider/stepper/toggle/chip/disclosure)
    charts/        line-chart bar-chart donut calendar-heatmap grid-heatmap scatter sparkline
    layout/        shell sidebar top-bar mobile-nav page-header logo theme-toggle
    dashboard/     hero-banner stat-chip-row workout-card workout-cover muscle-glyph
                   workout-table statistic-card recovery-card
    workouts/      entry-card set-row-grid rest-timer complete-button library-modal
                   workout-kpis set-table workout-accordion delete-workout-dialog
    recovery/      recovery-gauge recovery-form stress-dots recovery-history sleep-stress-chart
    progress/      body-weight-chart strength-chart records-list frequency-heatmap muscle-donut log-weight-modal
    cognitype/     setup-card typing-canvas results-panel sessions-table analytics-*
    exercises/     exercise-card exercise-filters
    profile/       profile-form weight-log settings-card danger-zone
    auth/          auth-shell register-steps login-form
    marketing/     hero features dashboard-mock testimonials
  lib/             alerts.ts progress.ts cognitype/* utils.ts (unchanged)
  prisma/          (unchanged)
```

Server/Client rule for the port: **pages stay server components**; every interactive island above is a
client component with the smallest possible surface (e.g. `<SetRowGrid>` takes plain serialisable props).
`workouts/new`, `progress`, `cognitype` keep their client nature but are cut into the composites above.

---

## 6. Deprecated alias map (Phase 1, `globals.css`)

Old vars kept as `/* deprecated */` until all pages migrate, then deleted in the final phase:

| Existing | New |
|---|---|
| `--bg-dark` | `--canvas` |
| `--bg-card` | `--surface` |
| `--purple-primary` | `--primary` |
| `--text-muted` (assumed) | `--muted` |
| `--font-inter` | kept, `--font-display` added (Plus Jakarta Sans) |
| `.gradient-text` | removed per design direction (no gradient text) — replaced by plain `text-ink` |
| `.gradient-purple` | `bg-primary` |
| `.glass` | `bg-surface` + `shadow-soft` (glassmorphism dropped) |
| `.glow-purple` | `shadow-soft` / `shadow-lift` (neon glow dropped) |
| `fadeIn` / `slideUp` / `pulse-glow` | `fx-rise` (+ new `fx-pop`, `fx-draw`, `fx-ripple`, `fx-caret`); `pulse-glow` deleted |

Theme application (Phase 1): `data-theme` on `<html>` set from a `theme` cookie in the root layout, with an
inline pre-hydration script falling back to `prefers-color-scheme` when the cookie is absent; a server action
writes the cookie. No `localStorage`, no flash. `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`.

## 7. Open questions blocking Phase 4–5 (summary)
1. Body weight: stored today? (G9/D4/U4/P1/H10/P1)
2. `Set` columns: `completed`, `restSeconds`, `rpe`, `variation`, `tempo`, `addedWeightKg`? (N2–N4, H7)
3. User profile columns: `heightCm`, `age`/`dateOfBirth`, `gender`, `goal`, `weeklyGoal`, `createdAt`? (U1–U3, D6)
4. Which actions exist: delete workout (H6), edit workout (H5), change password (U7), delete account (U8)?
5. `alerts.ts` API shape + where the 40/30/20/10 weights and band thresholds live (D1, R2, R3).
6. `progress.ts` API shape: e1RM formula, PR detection, streak (P2, P3, D7).
7. `cognitype/*` result shape: which metrics & sub-scores are persisted; is the per-keystroke latency array stored? (C4–C6)
8. Keep or drop: favourites (D11/E2), custom exercises (E1), units/reminders/summary toggles (U5), marketing numbers (G5), demo login (L7).
