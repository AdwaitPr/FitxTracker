# TASKS: FitxTracker UI port
Execute with `/next-task`. Tick boxes as you finish. Stop after each group (`/checkpoint`).
Prototype paths are relative to `design/prototype/src/`. Real routes are in PORT-AUDIT.md section 3.

## Group 0: Baseline (before any UI change)
- [ ] 0.1 Confirm `.env.local` has DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET (do NOT print values).
      If missing, STOP and ask the human.
- [ ] 0.2 Add `"design"` to `exclude` in tsconfig.json and `"design/**"` to globalIgnores in
      eslint.config.mjs. Verify `npm run build` ignores the design folder.
- [ ] 0.3 `npm install`, `npx prisma generate`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.
      Record baseline results in `design/verification/0/baseline.md`. If the app cannot start
      because the DB is unreachable or migrations do not match the postgres provider, STOP and
      report (the human handles the database baseline; do not touch migrations).
- [ ] 0.4 Screenshot every existing route (logged in) as the "before" set.

## Group 1: Tokens (files: index.css)
- [ ] 1.1 Rewrite `src/app/globals.css`: light + dark tokens from the prototype `index.css`
      (--frame, --canvas, --surface, --inset, --ink, --ink-soft, --muted, --hairline, --primary*,
      --danger, all --tag-* pairs incl. a new --tag-danger-*), radii, shadows, `@theme inline`
      mapping, `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`.
- [ ] 1.2 Keep old variable names as `/* deprecated */` aliases (map in PORT-AUDIT.md section 6).
- [ ] 1.3 Port utilities and motion: .micro .tnum .dashrule .no-scrollbar .app-window .fx-range
      .check-pop/.check-draw/.check-ripple .caret .rise .lift + reduced-motion kill switch.
- [ ] 1.4 Fonts via next/font/google: Plus Jakarta Sans as `--font-display`, keep Inter.
- [ ] 1.5 Theme: `src/app/actions/theme.ts` server action writes a `theme` cookie; root layout
      sets `data-theme` from the cookie with a pre-hydration fallback to prefers-color-scheme.
- Verify: all existing pages still render, no flash on hard refresh in dark mode.

## Group 2: Primitives (files: ui.tsx, forms.tsx, icons.tsx)
- [ ] 2.1 Refactor Card, Button, Input (same props as today + new variants). Remove JS hover
      handlers in favour of hover: classes.
- [ ] 2.2 Add: Tag, IconButton, Segmented, ProgressBar, RingProgress, SectionHeader, StatChip.
- [ ] 2.3 Add: Popover, Menu, Modal (Esc, focus trap, scroll lock), Skeleton, Toast, EmptyState.
- [ ] 2.4 Add controls: Slider, Stepper, Toggle, Chip, Disclosure, Select, Textarea.
- [ ] 2.5 Custom SVGs: `Logo`, `MuscleGlyph`. All other icons via lucide-react.
- Verify: temporary `/dev/ui` showcase route is allowed during this group ONLY; delete it before
  the checkpoint.

## Group 3: Charts (files: charts.tsx)
- [ ] 3.1 Port to `src/components/charts/`: line-chart, bar-chart, donut, calendar-heatmap,
      grid-heatmap, scatter, sparkline. Keep `summary` text, focus+hover tooltips, animations.

## Group 4: Shell (files: chrome.tsx)
- [ ] 4.1 Sidebar (OVERVIEW / COGNITIVE / ACCOUNT, Settings, orange Logout), 260px / 76px rail.
- [ ] 4.2 Top bar: search (navigation search per DECISIONS 8), log-workout link, bell, avatar, theme toggle.
- [ ] 4.3 Mobile bottom nav with centre Log button and safe-area padding.
- [ ] 4.4 `(dashboard)/layout.tsx`: 3-column shell with right-rail slot; `.app-window` >=1600px.
- Verify: 360 / 768 / 1280 / 1600, light + dark. Active-nav logic unchanged.

## Group 5: Dashboard (files: panels.tsx, pages/Dashboard.tsx)  route /dashboard
- [ ] 5.1 Hero banner variants keyed by `getWorkoutRecommendation().level`. No dev switcher.
- [ ] 5.2 Stat chips from real queries (DECISIONS 3, weeklyGoal constant 4).
- [ ] 5.3 Recent workouts carousel (no hearts), workout table, statistic card, recovery card.
- [ ] 5.4 Empty state for a brand-new user; loading skeletons.
- Verify with a brand-new account AND an account with logged workouts + recovery.

## Group 6: Workout logger (files: pages/NewWorkout.tsx)  route /workouts/new
- [ ] 6.1 Two-pane layout; keep the EXISTING save path and payload shape (POST /api/workouts).
- [ ] 6.2 Set grid with completed, restTime and the Advanced columns using real field names.
- [ ] 6.3 Rest timer pill, elapsed ring, live KPIs, library modal (search + muscle + equipment).
- [ ] 6.4 `?from=<id>` prefill, "Use last workout", mobile sticky action bar, saved summary.
- Verify: save a workout end to end and confirm it appears in history with all set fields.

## Group 7: History + detail (files: pages/History.tsx)  routes /workouts/history, /workouts/[id]
- [ ] 7.1 Filters via searchParams, week grouping, top set + volume derived.
- [ ] 7.2 Detail: KPIs, accordion set tables, session facts (only rows with real data).
- [ ] 7.3 Delete flow wired to existing DELETE with type-DELETE confirmation. No Edit button.

## Group 8: Recovery (files: pages/Recovery.tsx)  route /recovery
- [ ] 8.1 Gauge + bands from alerts.ts. Form maps to existing POST /api/recovery.
- [ ] 8.2 14-day history and sleep-vs-stress chart. Static "how it is calculated" popover.

## Group 9: Progress (files: pages/Progress.tsx)  route /progress
- [ ] 9.1 Modules from progress.ts data; range selector; skeleton/Suspense loading.
- [ ] 9.2 Body-weight chart from BodyWeightLog; log-weight modal per DECISIONS 1.

## Group 10: Exercises + Profile (files: pages/Account.tsx)  routes /exercises, /profile
- [ ] 10.1 Exercises grid with filters, no favourites, no custom-exercise button.
- [ ] 10.2 Profile form on existing GET/PUT /api/profile; remove settings toggles, password,
      delete-account, avatar change. Theme toggle stays.

## Group 11: CogniType (files: pages/Cognitype.tsx)  4 routes under /cognitype
- [ ] 11.1 Setup card + typing canvas: visual only, capture logic untouched.
- [ ] 11.2 Results with FocusBreakdown real fields; sparkline from KeystrokeEvent.
- [ ] 11.3 Sessions list + detail; analytics charts from real sessions.

## Group 12: Auth + Landing (files: pages/Marketing.tsx)  routes /, /login, /register
- [ ] 12.1 Login and 2-step register on the EXISTING NextAuth + /api/register flows. No demo button.
- [ ] 12.2 Landing per DECISIONS 8 (no unverifiable numbers, anonymised testimonials).

## Group 13: Cleanup
- [ ] 13.1 Delete deprecated aliases and unused utilities (.gradient-text, .glass, .glow-purple,
      pulse-glow) after confirming zero references.
- [ ] 13.2 Full pass: lint, tsc, build; every route at 360/768/1280/1600 in light + dark;
      keyboard-only pass; write `design/verification/final/walkthrough.md`.
