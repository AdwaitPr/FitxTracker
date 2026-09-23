# Group 10 (Exercises & Profile) Walkthrough

## Summary
Successfully implemented and verified **Group 10: Exercises (`/exercises`) and Profile (`/profile`)**, porting the visual prototype into the Next.js App Router architecture with strict adherence to all project guardrails and decisions.

---

## Visual Comparison & Evidence

### 1. Exercises Desktop 1280px (Dark Theme)
![Exercises 1280 Dark](/Users/adwaitpratapsingh/FitxTracker/design/verification/10/exercises-1280-dark.png)

### 2. Exercises Desktop 1280px (Light Theme)
![Exercises 1280 Light](/Users/adwaitpratapsingh/FitxTracker/design/verification/10/exercises-1280-light.png)

### 3. Exercises Mobile 360px (Dark Theme)
![Exercises 360 Dark](/Users/adwaitpratapsingh/FitxTracker/design/verification/10/exercises-360-dark.png)

### 4. Profile Desktop 1280px (Dark Theme - Full Page)
![Profile 1280 Dark Full](/Users/adwaitpratapsingh/FitxTracker/design/verification/10/profile-1280-full-dark.png)

### 5. Profile Desktop 1280px (Light Theme - Full Page)
![Profile 1280 Light Full](/Users/adwaitpratapsingh/FitxTracker/design/verification/10/profile-1280-full-light.png)

### 6. Profile Settings Tab (Dark Theme Switch)
![Profile Settings Tab](/Users/adwaitpratapsingh/FitxTracker/design/verification/10/profile-settings-tab.png)

### 7. Profile Mobile 360px (Dark Theme)
![Profile 360 Dark](/Users/adwaitpratapsingh/FitxTracker/design/verification/10/profile-360-dark.png)

---

## Verification Highlights
1. **Exercises Library**:
   - Clean Server Component loading real Prisma exercises.
   - Client island supporting live keyword search, equipment dropdown select, and canonical muscle group filter chips.
   - Rich exercise cards featuring 96px header banner with matching `MuscleGlyph`, tags, and quick-action "Log ->" button.
   - Omitted favourite buttons (Decision 8) and custom exercise creation (Decision 4).
2. **Profile & Account**:
   - Server Component querying user details, workouts count, total volume, PRs count, and weight logs.
   - Rich avatar header with initials, metadata badges (goal, streak, member since), and 3 metrics.
   - Segmented tab control switching between "Profile" and "Settings".
   - Personal details form with field validation (Height 100–250, Weight 30–250, Age 10–120), toast alerts, and `PUT /api/profile` updates.
   - Inline body-weight log submission updating user weight and creating a `bodyWeightLog` entry.
   - Accessible `Toggle` switch in Settings syncing `data-theme` and theme cookie instantly.
   - Omitted avatar edit, imperial unit toggle, notification toggles, change password, and delete account per Decisions 3 and 9.
3. **Full Quality Checks**:
   - `npm run lint`: 0 errors.
   - `npx tsc --noEmit`: 0 errors.
   - `npm run build`: 0 errors (all 25 routes built).
   - Automated CDP verification across 360px, 768px, 1280px, and 1600px in both dark and light modes.
