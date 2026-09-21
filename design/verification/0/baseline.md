# Group 0: Baseline Verification Record

## Environment & Git Metadata
- **Date**: 2026-09-21
- **Node Version**: `v24.1.0`
- **npm Version**: `11.4.2`
- **Git Commit**: `0907ba23980ab3b4261a748092f9bda9da8f2a83`
- **Branch**: `ui-redesign`
- **Environment Variables**: Confirmed present in `.env.local` (`DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`).

---

## 1. `npm run lint` Output

Exit Code: `1`

```
> fitness-tracker@0.1.0 lint
> eslint


/Users/adwaitpratapsingh/FitxTracker/src/app/(dashboard)/cognitype/analytics/page.tsx
   7:5  warning  'Brain' is defined but never used               @typescript-eslint/no-unused-vars
   8:5  warning  'TrendingUp' is defined but never used          @typescript-eslint/no-unused-vars
   9:5  warning  'Clock' is defined but never used               @typescript-eslint/no-unused-vars
  35:7  warning  'timeIcons' is assigned a value but never used  @typescript-eslint/no-unused-vars

/Users/adwaitpratapsingh/FitxTracker/src/app/(dashboard)/cognitype/page.tsx
    8:5   warning  'Brain' is defined but never used              @typescript-eslint/no-unused-vars
    9:5   warning  'Play' is defined but never used               @typescript-eslint/no-unused-vars
   58:11  warning  'router' is assigned a value but never used    @typescript-eslint/no-unused-vars
  514:35  warning  'DiffIcon' is assigned a value but never used  @typescript-eslint/no-unused-vars

/Users/adwaitpratapsingh/FitxTracker/src/app/(dashboard)/cognitype/sessions/page.tsx
  6:17  warning  'Clock' is defined but never used               @typescript-eslint/no-unused-vars
  6:24  warning  'Target' is defined but never used              @typescript-eslint/no-unused-vars
  6:32  warning  'Zap' is defined but never used                 @typescript-eslint/no-unused-vars
  7:30  warning  'getFocusScoreLabel' is defined but never used  @typescript-eslint/no-unused-vars

/Users/adwaitpratapsingh/FitxTracker/src/app/(dashboard)/progress/page.tsx
   98:22  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

/Users/adwaitpratapsingh/FitxTracker/src/app/(dashboard)/progress/page.tsx:98:22
   96 |
   97 |     useEffect(() => {
>  98 |         Promise.all([fetchOverview(), fetchExercises()]).finally(() =>
      |                      ^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
   99 |             setLoading(false)
  100 |         );
  101 |     }, [fetchOverview, fetchExercises]);  react-hooks/set-state-in-effect
  119:13  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

/Users/adwaitpratapsingh/FitxTracker/src/app/(dashboard)/progress/page.tsx:119:13
  117 |     useEffect(() => {
  118 |         if (selectedExercise) {
> 119 |             fetchProgression(selectedExercise);
      |             ^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  120 |         } else {
  121 |             setProgression([]);
  122 |         }                     react-hooks/set-state-in-effect

/Users/adwaitpratapsingh/FitxTracker/src/app/(dashboard)/recovery/page.tsx
  11:5  warning  'AlertTriangle' is defined but never used  @typescript-eslint/no-unused-vars

/Users/adwaitpratapsingh/FitxTracker/src/app/(dashboard)/workouts/[id]/page.tsx
  10:5  warning  'Calendar' is defined but never used  @typescript-eslint/no-unused-vars
  13:5  warning  'Trash2' is defined but never used    @typescript-eslint/no-unused-vars

/Users/adwaitpratapsingh/FitxTracker/src/app/api/cognitype/passages/route.ts
  2:10  warning  'getServerSession' is defined but never used  @typescript-eslint/no-unused-vars
  3:10  warning  'authOptions' is defined but never used       @typescript-eslint/no-unused-vars

/Users/adwaitpratapsingh/FitxTracker/src/components/layout/mobile-nav.tsx
  10:5  warning  'TrendingUp' is defined but never used  @typescript-eslint/no-unused-vars

✖ 20 problems (2 errors, 18 warnings)
```

---

## 2. `npx tsc --noEmit` Output

Exit Code: `0`

```
(No errors found)
```

---

## 3. `npm run build` Output

Exit Code: `0`

```
> fitness-tracker@0.1.0 build
> next build

▲ Next.js 16.1.6 (Turbopack)
- Environments: .env.local, .env

  Creating an optimized production build ...
✓ Compiled successfully in 2.3s
  Finished TypeScript in 2.5s    ✓ Finished TypeScript in 2.5s 
  Collecting page data using 7 workers in 1179.2ms    ✓ Collecting page data using 7 workers in 1179.2ms 
prisma:query SELECT "public"."Exercise"."id", "public"."Exercise"."name", "public"."Exercise"."muscleGroup", "public"."Exercise"."equipment" FROM "public"."Exercise" WHERE 1=1 ORDER BY "public"."Exercise"."muscleGroup" ASC, "public"."Exercise"."name" ASC OFFSET $1
✓ Generating static pages using 7 workers (25/25) in 1727.7ms
  Finalizing page optimization in 6.3ms    ✓ Finalizing page optimization in 6.3ms 

Route (app)
┌ ƒ /
├ ○ /_not-found
├ ƒ /api/auth/[...nextauth]
├ ƒ /api/cognitype/analytics
├ ƒ /api/cognitype/passages
├ ƒ /api/cognitype/sessions
├ ƒ /api/cognitype/sessions/[id]
├ ƒ /api/exercises
├ ƒ /api/profile
├ ƒ /api/progress
├ ƒ /api/recovery
├ ƒ /api/register
├ ƒ /api/workouts
├ ƒ /api/workouts/[id]
├ ○ /cognitype
├ ○ /cognitype/analytics
├ ○ /cognitype/sessions
├ ƒ /cognitype/sessions/[id]
├ ƒ /dashboard
├ ○ /exercises
├ ○ /login
├ ○ /profile
├ ○ /progress
├ ○ /recovery
├ ○ /register
├ ƒ /workouts/[id]
├ ƒ /workouts/history
└ ○ /workouts/new


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

---

## Summary of Baseline Rules
1. **Rule**: No NEW errors or warnings versus this baseline in future task groups.
2. **Rule**: Fix pre-existing errors only in files being rewritten as part of a task.
