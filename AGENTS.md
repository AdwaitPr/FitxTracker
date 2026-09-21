# FitxTracker: agent rules

## Mission
Port the finished visual prototype in `design/prototype/` into this Next.js app.
This is a VISUAL port. Behaviour, data, auth and business logic stay as they are.

## Read before every task (in this order)
1. `design/DECISIONS.md`   (authoritative answers; overrides the audit)
2. `design/TASKS.md`       (the checklist you execute; update it as you go)
3. `design/PORT-AUDIT.md`  (tokens, component inventory, route map)
4. The specific `design/prototype/src/**` files named in the task. Read only those.

## Stack facts (verified)
- Next.js 16 App Router, React 19, Tailwind v4, lucide-react, Prisma (schema provider is
  `postgresql`, env `DATABASE_URL`), NextAuth v4 (credentials), TypeScript strict.
- Global CSS: `src/app/globals.css` (legacy vars: --bg-dark, --bg-card, --purple-primary, ...).
- Shared UI: `src/components/ui/{button,card,input}.tsx`. Shell: `src/components/layout/*`.
- `cn()` lives in `src/lib/utils.ts`. No chart library is installed; charts are hand-rolled SVG.
- Business logic that must not change: `src/lib/alerts.ts`, `src/lib/progress.ts`,
  `src/lib/cognitype/*`, `src/lib/auth-options.ts`, `src/lib/prisma.ts`, `prisma/schema.prisma`,
  all existing `src/app/api/**` handlers.
- The prototype is Vite + React with mock data and a hash router. It is a REFERENCE only.
  Never copy `router.tsx`, `data.ts`, `data2.ts`, or any mock data into `src/`.

## Hard guardrails (never do these)
- Never edit `prisma/schema.prisma` or create migrations. If a UI element needs data that
  does not exist, follow `design/DECISIONS.md`. If it is not covered there, STOP and ask.
- Never add or change API routes unless `design/DECISIONS.md` explicitly allows it.
- Never modify the CogniType keystroke-capture logic; restyle only.
- Never install a dependency without asking. Allowed without asking: none.
- Never run destructive commands (`rm -rf` outside build folders, `git push`, `git reset --hard`,
  `prisma migrate reset`, `prisma db push --force-reset`, dropping tables).
- Never ship prototype-only UI: recovery-state dev switcher, demo-login button, mock users.
- Never touch `.env*` files or print secrets.
- Never edit anything inside `design/` except `design/TASKS.md` and `design/verification/**`.

## Design overrides (important)
Ignore any built-in preference for glassmorphism, neon glows, gradient text, or "premium
dynamic" flourishes. Match the prototype's tokens, radii, shadows and motion EXACTLY:
- Tokens come from the prototype `src/index.css`; map to Tailwind v4 `@theme`.
- Light + dark themes. Theme is a cookie read server-side -> `data-theme` on `<html>`.
  No localStorage, no flash of wrong theme.
- Icons: lucide-react (mapping table in PORT-AUDIT.md section 2.3). Only `Logo` and
  `MuscleGlyph` remain custom SVG. No emoji as UI icons (the greeting flame is allowed).
- Motion respects `prefers-reduced-motion`.

## Code conventions
- Pages stay Server Components. Interactivity goes in small `"use client"` islands that take
  plain serialisable props.
- No inline `style` except for dynamic values (ring offsets, bar heights, widths).
- Keep the old prop APIs of Card/Button/Input backward compatible until the final cleanup task.
- Data comes from existing Prisma queries and existing lib functions. No mock data in `src/`.
- Real column names: Set = reps, weight, restTime, completed, variationType, tempo,
  addedWeight, perceivedDifficulty. User = height, weight, age, gender, fitnessGoal, createdAt.
  Exercise = name, muscleGroup, equipment. DailyRecovery = sleepHours, sleepQuality,
  gutStatus, stressLevel, notes. Always confirm against `prisma/schema.prisma`.
- Mobile-ready (this app will be wrapped with Capacitor later): respect
  `env(safe-area-inset-*)`, 44px touch targets, no hover-only interactions, `100dvh` not `100vh`.

## Definition of done for every task
1. `npm run lint` passes.
2. `npx tsc --noEmit` passes.
3. `npm run build` passes (run at the end of each phase).
4. `/verify-ui` run for every route the task touched; screenshots saved.
5. Real data path checked (no mock data reachable).
6. Task boxes ticked in `design/TASKS.md`, atomic commit made via `/checkpoint`.

## Git
Work only on branch `ui-redesign`. One commit per task group, message format
`ui(<task-id>): <summary>`. Never push. Never force anything.

## When to stop and ask the human
- Anything on the guardrail list would be required.
- A UI element has no backing data and no rule in DECISIONS.md.
- Lint/type/build fails twice after fixes.
- After every `/checkpoint` (always wait for approval before the next task group).
