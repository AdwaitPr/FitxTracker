# Group 6 Verification Notes: Workout Logger (`/workouts/new`)

This document records the empirical verification, computed CSS property checks, responsive behavior, theme toggling, database persistence, and interactive flow assertions for Group 6 (Workout Logger).

---

## 1. Components Implemented

### Backend API Route (`src/app/api/workouts/route.ts`)
- **Option (b) Extension**:
  - Unpacks optional `date` (defaults to current date if omitted) and `duration` (in minutes).
  - Persists each set's individual `completed` boolean flag rather than hard-coding `completed: true`.
  - Preserves full backward compatibility with existing clients and test fixtures.

### Pure Data Mapper (`src/lib/workout-mapper.ts`)
- **`mapApiWorkoutToDraft(workout)`**:
  - Converts Prisma-nested workout shapes (`Workout` -> `WorkoutExercise` -> `Set`) into editable `Entry[]` client drafts.
  - Resets `done: false` so prefilled workouts can be re-executed cleanly.
  - Assigns unique client IDs (`crypto.randomUUID()`) to each entry and set.
  - Automatically expands the `advanced` disclosure for exercises containing non-default set metadata (`variationType`, `tempo`, `addedWeight`, or `perceivedDifficulty`).
  - Validated with pure Node unit testing.

### Workout Logger Components (`src/components/workouts/`)
- **`CompleteButton` (`complete-button.tsx`)**:
  - 44px circular check button meeting capacitor touch target minimums.
  - Plays CSS animations: `.check-pop`, `.check-ripple`, and `.check-draw` SVG stroke animation upon completion.
  - Accessible `aria-label="Mark set X complete"` / `"Mark set X incomplete"`.
- **`RestTimer` (`rest-timer.tsx`)**:
  - Timestamp-based floating countdown pill (`targetEndTime = Date.now() + sec * 1000`) floating above the viewport.
  - `visibilitychange` listener recalculates remaining time upon tab focus to prevent background timer drift.
  - Features 32px circular `RingProgress` (0–100%), `+30s` increment button, pause/resume toggle, and skip/dismiss action.
  - Accessible `role="timer"` with live `aria-label`.
- **`EntryCard` (`entry-card.tsx`)**:
  - Exercise card header with tone-matched `MuscleGlyph` (normalized via `normalizeMuscleGroup`), name, muscle badge, and equipment label.
  - Responsive set grid: set index, previous target indicator, weight input (`inputMode="decimal"`), reps input (`inputMode="numeric"`), and `CompleteButton`.
  - "Advanced" disclosure revealing `Variation` selector, `Tempo` input (`3-1-3`), `Added Wt` input, and `RPE` dropdown (6–10 scale).
  - Copy set and delete set actions with minimum set protection.
- **`LiveSessionCard` (`live-session-card.tsx`)**:
  - Desktop right-rail card (`ShellRail sticky`) with 152px elapsed timer ring (`RingProgress`).
  - Live metric KPI grid: Volume (kg), Sets Done / Total, and Average RPE.
  - Exercise breakdown list showing real-time set completion progress.
  - Primary "Finish workout" CTA button.
- **`LibraryModal` (`library-modal.tsx`)**:
  - Searchable exercise library dialog (`role="dialog"`).
  - Real-time text search filter, equipment filter dropdown, and horizontal muscle chips (`All`, `Chest`, `Back`, `Legs`, etc.).
  - Exercise item with tone-matched `MuscleGlyph`, equipment tag, and `+` add action.
- **`StickyActionBar` (`sticky-action-bar.tsx`)**:
  - Mobile/tablet sticky bottom bar (`xl:hidden`) elevated at `bottom-[calc(76px+env(safe-area-inset-bottom))]` to clear bottom navigation.
  - Displays set progress, volume counter, "+ Add exercise" trigger, and "Finish" button.
- **`SavedSummaryModal` (`saved-summary-modal.tsx`)**:
  - Post-save celebration modal displaying success badge, workout name, metric chips (date, duration, exercise count, sets count, volume), notes snippet, and quick navigation links ("Log another", "View history").
- **`WorkoutLoggerClient` (`workout-logger-client.tsx`)**:
  - Client orchestrator with debounced `sessionStorage` persistence (`fitx_active_workout_draft`).
  - `beforeunload` unsaved draft protection preventing accidental navigation during active workouts.
  - Validation routed through `ToastProvider` (`role="alert"`), enforcing non-empty names, valid exercises, and completed sets.
- **`page.tsx` (`src/app/(dashboard)/workouts/new/page.tsx`)**:
  - Server Component querying real Prisma records (exercise library, user's latest workout for "Use last workout", and `?from=<id>` template prefill).

---

## 2. Empirical Verification Results

Automated headless Chrome DevTools Protocol verification and live database assertions were conducted:

| Test Target | Viewport | Mode | Measured Property / Action | Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Initial Load** | 1280x800 | Dark & Light | Layout rendering & ShellRail | Two-pane layout with sticky right rail | **PASS** |
| **Responsive Tablet** | 768x1024 | Dark | Mobile action bar (`StickyActionBar`) | Elevated above bottom bar; rail collapsed | **PASS** |
| **Responsive Mobile** | 360x800 | Dark | Touch targets & stacking | Full-width inputs, 44px complete button | **PASS** |
| **Responsive Ultrawide** | 1600x900 | Dark | Max container width | `.app-window` contained with frame tint | **PASS** |
| **Library Modal** | 1280x800 | Dark | Search "Bench" & select exercise | Barbell Bench Press added to workout | **PASS** |
| **Advanced Disclosure** | 1280x800 | Dark | Expand "Advanced" | Tempo input & RPE select visible & editable | **PASS** |
| **Set Completion** | 1280x800 | Dark | Click CompleteButton on Set 1 | Animation played, set marked done, rest timer triggered | **PASS** |
| **Rest Timer** | 1280x800 | Dark | Floating pill & countdown | `role="timer"`, `aria-label="Rest timer, 1:59 remaining"` | **PASS** |
| **Live Session KPIs** | 1280x800 | Dark | Right-rail metric recalculation | Volume: `800 kg`, Sets: `1/3`, Avg RPE: `8.0` | **PASS** |
| **Finish Workout** | 1280x800 | Dark | Submit workout POST | Saved to PostgreSQL database | **PASS** |
| **Saved Modal** | 1280x800 | Dark | `SavedSummaryModal` appearance | `role="dialog"`, title `"Workout saved"`, stats displayed | **PASS** |
| **PostgreSQL Record** | DB | N/A | Direct Prisma query verification | `duration: 60`, `Barbell Bench Press`, `reps: 10`, `weight: 80`, `completed: true`, `tempo: "3-1-3"`, `perceivedDifficulty: 8` | **PASS** |
| **Template Prefill** | 1280x800 | Dark | Navigate to `?from=<saved_id>` | Title: `"Automated E2E Chest Workout (Copy)"`, exercise prefilled | **PASS** |

---

## 3. Visual Verification Captures

Screenshots captured and archived in `design/verification/6/`:
- `workout-new-1280-dark.png`: Desktop (1280x800), Initial state, Dark mode
- `workout-new-1280-light.png`: Desktop (1280x800), Initial state, Light mode
- `workout-new-768-dark.png`: Tablet (768x1024), Initial state with mobile action bar, Dark mode
- `workout-new-360-dark.png`: Mobile (360x800), Initial state, Dark mode
- `workout-new-1600-dark.png`: Ultrawide (1600x900), Initial state, Dark mode
- `workout-new-active-session.png`: Active workout session showing floating RestTimer, marked complete set, and live KPI updates (800 kg volume, 1/3 sets, 8.0 RPE)
- `workout-new-saved-modal.png`: Post-save celebration modal displaying workout stats and navigation CTAs
- `workout-new-prefilled.png`: Prefilled workout loaded from template query `?from=<id>`
