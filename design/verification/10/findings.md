# Group 10 (Exercises & Profile) Verification Findings

## 1. Overview
- **Routes**: `/exercises` and `/profile`
- **Components**:
  - `src/app/(dashboard)/exercises/page.tsx` (Server Component querying Prisma exercises with searchParams)
  - `src/components/exercises/exercises-client.tsx` (Client island handling search, equipment select, muscle chips, and exercise card grid)
  - `src/app/(dashboard)/profile/page.tsx` (Server Component querying user profile, workouts count, total volume, PRs count, and weight logs)
  - `src/components/profile/profile-client.tsx` (Client island handling Profile / Settings tabs, personal details form validation, inline body weight logging, and dark theme switch)
  - `src/components/ui/controls.tsx` / `src/components/ui/toggle.tsx` (Accessible toggle switch component)
- **Tested Viewports**:
  - `360x800` (Mobile) in Dark & Light
  - `768x1024` (Tablet) in Dark & Light
  - `1280x800` (Desktop) in Dark & Light (viewport + full page)
  - `1600x900` (Ultrawide) in Dark & Light
- **Prototype Reference**: `http://localhost:5173/#/exercises` and `http://localhost:5173/#/profile`

---

## 2. Behavioral & Architectural Verification

### 10.1 Exercises (`/exercises`)
- **Server Component Architecture**:
  - `src/app/(dashboard)/exercises/page.tsx` runs on the server, reads optional `searchParams` promise, queries `prisma.exercise.findMany({ orderBy: { name: 'asc' } })`, and passes serializable props to `ExercisesClient`.
- **Search & Filter Controls**:
  - Live text search filtering by exercise name and equipment.
  - Equipment select dropdown supporting All equipment, Barbell, Dumbbell, Cable, Machine, Bodyweight, etc.
  - Canonical muscle group filter chips (`All`, `Chest`, `Back`, `Legs`, `Shoulders`, `Arms`, `Core`, `Cardio`) with active state and count indicators.
- **Exercise Card Grid**:
  - Responsive card grid (1 col on mobile, 2 cols on tablet, 3 cols on desktop, 4 cols on ultrawide).
  - 96px header banner with subtle background tint and centered `MuscleGlyph` icon matching the exercise's muscle group.
  - Card body displaying exercise name, equipment subtitle, uppercase muscle group tag, and "Log ->" button linking directly to `/workouts/new?exerciseId=...`.
- **Empty State**:
  - When no movements match query/filters, displays `EmptyState` with `Search` icon, "No exercises match the filter", and a "Clear filters" action button.
- **Guardrails Observed**:
  - Omitted favourite heart buttons per Decision 8.
  - Omitted "Custom exercise" creation button per Decision 4.

### 10.2 Profile (`/profile`)
- **Server Component Architecture**:
  - `src/app/(dashboard)/profile/page.tsx` runs on the server, retrieves authenticated user session, and queries:
    - User record (`name`, `email`, `height`, `weight`, `age`, `gender`, `fitnessGoal`, `createdAt`).
    - Workouts count (`prisma.workout.count`).
    - Total lifted volume across all completed sets.
    - Personal records count.
    - Recent body weight logs (`prisma.bodyWeightLog.findMany`).
- **Profile Header Card**:
  - Initials avatar (`QU`) with purple tint.
  - User full name and email display.
  - Metadata badges: Fitness goal pill (`STRENGTH`), Streak pill (`1-WEEK STREAK`), Member since pill (`MEMBER SINCE SEP 2026`).
  - Stat summary strip displaying Workouts (`3`), Volume (`3k kg`), PRs (`1`).
- **Tab Navigation**:
  - `Segmented` control switching between "Profile" and "Settings" views.
- **Personal Details Form**:
  - Fields: Full name, Email (disabled with helper note "Account email is managed by your provider."), Height (cm), Weight (kg), Age, Gender, Fitness goal.
  - Client-side validation: Height (100–250 cm), Weight (30–250 kg), Age (10–120 yr). Rejects out-of-range inputs with toast warnings.
  - Submits updates via `PUT /api/profile`. On success, displays "Profile saved" toast and syncs server state with router refresh.
  - "Discard" button resets any uncommitted form changes back to baseline user data.
- **Body-Weight Log**:
  - Card with "Open trend" link to `/progress`.
  - Today's weight entry input with "+ Add entry" button.
  - Submitting appends weight entry via `PUT /api/profile` and displays "Weight logged" toast.
  - History list showing date, logged weight (`kg`), and delta comparison with previous entry.
- **Settings Tab**:
  - "Preferences" card with accessible `Toggle` switch for "Dark theme".
  - Reactive sync with `data-theme` attribute on `<html>` and cookies. Changes take effect instantly without hydration errors.
- **Guardrails Observed**:
  - Omitted avatar edit button per Decision 3.
  - Omitted unit toggles (imperial/metric) per Decision 9.
  - Omitted notification/email toggles per Decision 9.
  - Omitted change-password section per Decision 9.
  - Omitted delete-account modal per Decision 9.

---

## 3. Visual & Aesthetic Parity with Prototype
| Element | Prototype Reference | Real Implementation | Status |
|---|---|---|---|
| Exercises Header | Eyebrow "LIBRARY" + "Exercises" + movement count | `PageHeader` with matching typography & count | Exact match |
| Exercises Filters | Search input + Equipment select + Muscle chips | Group 2b `Input`, `Select`, `Chip` components | Exact match |
| Exercise Cards | 96px banner with glyph + title + tag + log action | 96px banner with `MuscleGlyph` + tag + `Button` | Exact match |
| Empty State | Empty state illustration + clear filters action | Group 2a `EmptyState` component | Exact match |
| Profile Header | Avatar + Name + Email + Pills + 3 Stats | Avatar initials + pills + stats strip | Exact match |
| Profile Tabs | Segmented control (Profile / Settings) | Group 2b `Segmented` control | Exact match |
| Personal Form | Inputs with icons & unit adornments + Discard/Save | Group 2b `Input` + `Select` + `Button` | Exact match |
| Body Weight Card| Weight input + Add entry + History list + deltas | Card with input + button + formatted history | Exact match |
| Settings Tab | Appearance card with dark theme switch | `Toggle` switch with reactive theme sync | Exact match |

---

## 4. Test & Build Status
- `npm run lint`: **0 errors**, 14 pre-existing warnings in cognitype.
- `npx tsc --noEmit`: **0 errors**.
- `npm run build`: **0 errors**, all 25 routes generated successfully.
- Verification script `design/verification/10/verify-group10.mjs`: **Passed 100%**.
