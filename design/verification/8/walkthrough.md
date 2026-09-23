# Walkthrough - Group 8: Recovery (`/recovery`)

## Overview
Group 8 ported the Recovery visual prototype into Next.js App Router:
- **Route**: `/recovery`
- **Server Component**: `src/app/(dashboard)/recovery/page.tsx`
- **Client Island**: `src/components/recovery/recovery-client.tsx` (wrapped in `ToastProvider`)
- **Exports**: `src/components/recovery/index.ts`

---

## Changes Implemented

### 1. Recovery Gauge & Live Recommendation
- Central `RingProgress` (size 228px, 12px stroke) dynamically evaluating the recovery score as the user interacts with the form.
- Score and recommendation level evaluated using `calculateRecoveryScore` and `getWorkoutRecommendation` from `@/lib/alerts`.
- Real score-band label used exclusively: `getWorkoutRecommendation().level` in Title Case (`Optimal`, `Normal`, `Warning`, `Critical`).
- Tag with icon and alert suggested intensity: `<Tag tone={meta.tone} icon={<Zap size={13} />}>{meta.label} — {alert.suggestedIntensity}</Tag>`.
- Suggested intensity card callout and factor contribution progress bars (Sleep 40%, Quality 30%, Stress 20%, Gut 10%).

### 2. Daily Log Form (Group 2b Controls)
- **Sleep Hours**: Labelled `Slider` (min 3, max 11, step 0.1) paired with a precision `Stepper` (step 0.25).
- **Sleep Quality**: `Segmented` control matching exact literal values: `["Poor", "Fair", "Good", "Excellent"]`.
- **Stress Level**: Labelled `Slider` (1 to 10) with `aria-valuetext` plus 10 touch-friendly stress dots radiogroup with micro labels (`Calm (1)` to `Overloaded (10)`).
- **Gut Status**: `Chip` group matching exact literal values: `["Good", "Bloated", "Uncomfortable"]` with respective green, amber, and pink tones.
- **Notes**: `Textarea` for optional sleep/daily notes.
- **Client-Side Validation**: Clamps and validates ranges before submitting, triggering error toasts for out-of-range inputs.

### 3. Static Calculation Explainer Popover
- "How this is calculated" button opens an accessible `Popover` with static copy detailing the 40/30/20/10 weighting and the 80/60/40 threshold bands.

### 4. Sleep vs. Stress Trend Chart
- Reuses shared `LineChart` from Group 3 (`src/components/charts/line-chart.tsx`) with:
  - Sleep series (area fill, primary color)
  - Stress series (dashed line, danger color)
  - Accessible screen-reader summary text and dynamic averages.

### 5. 14-Day History Table
- Displays past 14 days, deduplicated by calendar day.
- Shows relative date (`formatRelativeDate`), mini `ProgressBar`, score, sleep hours, stress level, gut status, and real score-band `<Tag>`.
- Empty state with `Sparkles` icon when no logs exist.

---

## Visual Verification

### Desktop (1280px)
Dark Theme:
![Recovery Desktop Dark](/Users/adwaitpratapsingh/FitxTracker/design/verification/8/recovery-1280-full-dark.png)

Light Theme:
![Recovery Desktop Light](/Users/adwaitpratapsingh/FitxTracker/design/verification/8/recovery-1280-full-light.png)

### Popover Open
![Recovery Popover](/Users/adwaitpratapsingh/FitxTracker/design/verification/8/recovery-popover-open.png)

### Mobile & Tablet
Mobile (360px Dark):
![Recovery Mobile 360 Dark](/Users/adwaitpratapsingh/FitxTracker/design/verification/8/recovery-360-dark.png)

Tablet (768px Dark):
![Recovery Tablet 768 Dark](/Users/adwaitpratapsingh/FitxTracker/design/verification/8/recovery-768-dark.png)

---

## Validation Commands
1. `npx tsc --noEmit` passed with 0 errors.
2. `npm run lint` passed with 0 errors/warnings in Group 8 files.
3. `npm run build` passed with Turbopack compilation.
4. Form submission tested via CDP: saved recovery log, displayed toast, updated gauge, and updated 14-day history in place without reload.
