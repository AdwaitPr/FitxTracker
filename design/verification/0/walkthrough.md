# Group 0: Baseline Verification Walkthrough

## Summary of Changes
- **Environment Verification**: Confirmed presence of `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` in `.env.local` without exposing secret values (Task 0.1).
- **Design Exclusions**: Updated `tsconfig.json` to exclude `"design"` and `eslint.config.mjs` to ignore `"design/**"`. This ensures TypeScript and ESLint do not typecheck or lint the prototype reference code during Next.js builds (Task 0.2).
- **Tooling Baseline**: Generated Prisma client, executed lint, tsc, and build checks, and logged complete outputs in `design/verification/0/baseline.md` (Task 0.3).
  - Lint: 2 pre-existing errors in `src/app/(dashboard)/progress/page.tsx` (`react-hooks/set-state-in-effect`), 18 warnings across existing files.
  - TSC: 0 errors (`npx tsc --noEmit` passed clean).
  - Build: Next.js 16 build succeeded with 0 errors.
- **Visual Baseline Capture**: Seeded test data for QA user (`qa@fitx.local`) and captured dark-mode screenshots at 1280x800 and 360x800 for all 15 routes (both logged-out and logged-in) (Task 0.4).

---

## Files Touched
- [`tsconfig.json`](file:///Users/adwaitpratapsingh/FitxTracker/tsconfig.json) — Excluded `"design"` folder.
- [`eslint.config.mjs`](file:///Users/adwaitpratapsingh/FitxTracker/eslint.config.mjs) — Added `"design/**"` to `globalIgnores`.
- [`design/verification/0/baseline.md`](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/baseline.md) — Recorded baseline environment and tooling outputs.
- [`design/TASKS.md`](file:///Users/adwaitpratapsingh/FitxTracker/design/TASKS.md) — Ticked Group 0 tasks (0.1, 0.2, 0.3, 0.4).

---

## Baseline Screenshots Captured (Dark Mode)

### Logged-Out Routes
- **Landing (`/`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/home-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/home-360x800-dark.png)
- **Login (`/login`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/login-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/login-360x800-dark.png)
- **Register (`/register`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/register-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/register-360x800-dark.png)

### Logged-In Routes (User `qa@fitx.local`)
- **Dashboard (`/dashboard`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/dashboard-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/dashboard-360x800-dark.png)
- **Workout Logger (`/workouts/new`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/workouts-new-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/workouts-new-360x800-dark.png)
- **Workout History (`/workouts/history`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/workouts-history-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/workouts-history-360x800-dark.png)
- **Workout Detail (`/workouts/[id]`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/workouts-detail-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/workouts-detail-360x800-dark.png)
- **Recovery (`/recovery`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/recovery-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/recovery-360x800-dark.png)
- **Progress (`/progress`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/progress-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/progress-360x800-dark.png)
- **Exercises (`/exercises`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/exercises-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/exercises-360x800-dark.png)
- **Profile (`/profile`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/profile-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/profile-360x800-dark.png)
- **CogniType Hub (`/cognitype`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/cognitype-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/cognitype-360x800-dark.png)
- **CogniType Sessions (`/cognitype/sessions`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/cognitype-sessions-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/cognitype-sessions-360x800-dark.png)
- **CogniType Session Detail (`/cognitype/sessions/[id]`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/cognitype-session-detail-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/cognitype-session-detail-360x800-dark.png)
- **CogniType Analytics (`/cognitype/analytics`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/cognitype-analytics-1280x800-dark.png)
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/cognitype-analytics-360x800-dark.png)

---

## Decisions & Deviations Applied
- Captured in dark mode only as the existing app does not have light mode support.
- Pre-existing lint errors in `src/app/(dashboard)/progress/page.tsx` were preserved as the baseline and not touched, in accordance with user instructions.
