# Group 5 Verification Notes: Dashboard Panels & Feed

This document records the empirical verification, computed CSS property checks, responsive behavior, theme toggling, and layout assertions for Group 5 (Dashboard).

---

## 1. Components Implemented

### Domain & Calculation Helpers (`src/lib/progress-derived.ts`)
- **`calculateStreak(workoutDates: Date[])`**: Pure helper to calculate continuous weekly workout streak without altering existing `src/lib/progress.ts`.
- **`calculateVolumeBars(workouts: { date: Date; sets: { reps: number; weight: number; addedWeight?: number | null }[] }[])`**: Aggregates trailing 5 calendar weeks and 5 calendar months for the interactive bar chart.

### Dashboard Feed Components (`src/components/dashboard/`)
- **`WorkoutCover` (`workout-cover.tsx`)**:
  - Distinct SVG gradient mesh with tone-matched `MuscleGlyph` for `Chest`, `Back`, `Legs`, `Shoulders`, `Arms`, `Core`, and `Cardio`.
  - Normalizes raw muscle group strings with `normalizeMuscleGroup`.
- **`HeroBanner` (`hero-banner.tsx`)**:
  - Recovery-keyed hero banner supporting 4 variants (`optimal`, `normal`, `warning`, `critical`) derived from `getWorkoutRecommendation(todayRecovery).level`, plus a default welcoming fallback when no recovery log exists.
  - Tone-on-tone SVG background mesh, micro-label eyebrow, dynamic headline, sub-copy, "Start Workout ->" CTA linking to `/workouts/new`, and intensity badge.
  - Development recovery-state switcher explicitly omitted per guardrails.
- **`StatChipRow` (`stat-chip-row.tsx`)**:
  - 4 metric chips using the `StatChip` primitive:
    1. **This Week**: workout count vs weekly goal of 4 (`Mon–Sun · goal 4`).
    2. **This Month**: workout count vs monthly pacing of 14 sessions.
    3. **Body Weight**: latest recorded weight (`BodyWeightLog` or User profile) with height caption.
    4. **Days Since Last**: days elapsed since latest workout date (`Trained today`, `Last: <date>`, or `No workouts yet`).
  - Three-dot overflow menus removed per DECISIONS 9.
- **`RecentWorkouts` (`recent-workouts.tsx`)**:
  - Horizontal carousel with snap-scrolling (`overflow-x-auto snap-x no-scrollbar`).
  - Circular `<` and `>` arrow navigation buttons that smoothly scroll the carousel by card width.
  - Workout card featuring `WorkoutCover`, muscle tag badge, duration, exercise count, sets progress bar (`setsDone / setsTotal`), top lift with volume, and link to `/workouts/[id]`.
  - Favorite heart icons removed per DECISIONS 9.
- **`WorkoutTable` (`workout-table.tsx`)**:
  - Desktop 5-column grid layout (`grid-cols-[1.7fr_0.9fr_0.8fr_0.6fr_auto]`) with uppercase tracking headers.
  - Mobile stacked card view with responsive breakpoints.
  - "See all" header link to `/workouts/history`.
- **`RecoveryGauge` (`recovery-gauge.tsx`)**:
  - Circular `RingProgress` showing 0–100 score, dynamic color, verdict caption, and factor weights breakdown (`Sleep 40% · quality 30% · stress 20% · gut 10%`).
- **`RecoveryCard` (`recovery-card.tsx`)**:
  - Today's recovery right-rail card.
  - Renders `RecoveryGauge`, factor breakdown progress bars with dynamic score colors, "Log" quick pill linking to `/recovery`, and "Open Recovery ↗" CTA button.
- **`StatisticCard` (`statistic-card.tsx`)**:
  - User initials inside a weekly goal progress ring with percentage pill.
  - Time-of-day greeting ("Good Morning, QA 🔥") with streak caption.
  - SVG volume bar chart showing trailing 5 intervals with formatted totals (e.g. `5-WEEK TOTAL 1.6K KG`).
  - Interactive `Segmented` control ("Week" / "Month") to switch between weekly and monthly volume aggregations.
- **`loading.tsx` (`src/app/(dashboard)/dashboard/loading.tsx`)**:
  - Next.js streaming Suspense skeleton matching the exact 3-column dashboard layout using `Skeleton` primitives.
- **`page.tsx` (`src/app/(dashboard)/dashboard/page.tsx`)**:
  - Server Component querying real Prisma records (user, workouts, bodyweight, daily recovery).
  - Mounts right-rail cards into `ShellRail` (`sticky`).
  - Renders `EmptyState` when user has 0 workouts logged.

---

## 2. Empirical Verification Results

Automated headless Chrome DevTools Protocol verification and live browser sessions were conducted:

| Test Target | Viewport | Mode | Measured Property / Selector | Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Populated User (`qa@fitx.local`)** | 1280x800 | Dark | `#hero` banner headline | Present & styled | **PASS** |
| **Populated User (`qa@fitx.local`)** | 1280x800 | Dark | Stat chips count (`article.lift`) | 4 chips | **PASS** |
| **Populated User (`qa@fitx.local`)** | 1280x800 | Dark | Recent workouts cards | Present (`Chest & Triceps Power`) | **PASS** |
| **Populated User (`qa@fitx.local`)** | 1280x800 | Dark | Workout table log rows | Present (`Sep 21`, `55 min`, `CHEST`) | **PASS** |
| **Populated User (`qa@fitx.local`)** | 1280x800 | Dark | Right-rail `StatisticCard` | Present (`QU` avatar, 25% goal, 1.6k kg) | **PASS** |
| **Populated User (`qa@fitx.local`)** | 1280x800 | Dark | Right-rail `RecoveryCard` | Present (`0 SCORE`, factor weights) | **PASS** |
| **Interactive Segmented Toggle** | 1280x800 | Dark | Click "Month" radio button | Switches chart to 5-month aggregation | **PASS** |
| **Brand-New User (`newuser@fitx.local`)** | 1280x800 | Dark | Empty state card (`[role="status"]`) | Present ("No workouts logged yet") | **PASS** |
| **Brand-New User (`newuser@fitx.local`)** | 1280x800 | Dark | "Log First Workout" button | Present & links to `/workouts/new` | **PASS** |
| **Brand-New User (`newuser@fitx.local`)** | 1280x800 | Dark | Stat chips on 0-data user | `0 of 4`, `0 sessions`, `75 kg`, `— days` | **PASS** |
| **Brand-New User (`newuser@fitx.local`)** | 1280x800 | Dark | Right rail on 0-data user | `NA` avatar, 0% ring, `0.0K KG` | **PASS** |
| **Responsive Mobile** | 360x800 | Dark & Light | Layout stacking | Single column feed, stacked table cards | **PASS** |
| **Responsive Tablet** | 768x1024 | Dark & Light | Layout stacking | 2-col chips, rail below feed | **PASS** |
| **Responsive Ultrawide** | 1600x900 | Dark & Light | Max container width | `.app-window` contained with frame tint | **PASS** |

---

## 3. Visual Verification Captures

Screenshots captured and archived in `design/verification/5/`:
- `dashboard-360-dark.png`: Mobile (360x800), Populated user, Dark mode
- `dashboard-768-dark.png`: Tablet (768x1024), Populated user, Dark mode
- `dashboard-1280-dark.png`: Desktop (1280x800), Populated user, Dark mode
- `dashboard-1600-dark.png`: Ultrawide (1600x900), Populated user, Dark mode
- `dashboard-360-light.png`: Mobile (360x800), Populated user, Light mode
- `dashboard-768-light.png`: Tablet (768x1024), Populated user, Light mode
- `dashboard-1280-light.png`: Desktop (1280x800), Populated user, Light mode
- `dashboard-1600-light.png`: Ultrawide (1600x900), Populated user, Light mode
- `dashboard-empty-1280-dark.png`: Desktop (1280x800), Brand-new user with 0 workouts, Dark mode
- `dashboard-empty-360-dark.png`: Mobile (360x800), Brand-new user with 0 workouts, Dark mode
