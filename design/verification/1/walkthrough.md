# Group 1: Tokens Walkthrough

## Summary of Changes
1. **Universal Reset Resolution (`ui(1a)`)**:
   - Discovered and empirically verified that the unlayered `* { margin:0; padding:0 }` rule in `src/app/globals.css` was silencing Tailwind v4 utilities (`p-*`, `m-*`, `space-*`).
   - Moved the reset inside `@layer base { *, ::before, ::after { box-sizing: border-box; margin: 0; padding: 0; } }`, restoring intended spacing across 22 direct usages and all 6 pages consuming the `Button` component.
   - Documented the empirical findings and complete usage inventory in [`design/verification/1/notes.md`](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/notes.md).
2. **Tokens & Theming (`ui(1b)`)**:
   - **Globals CSS**: Rewrote `src/app/globals.css` with a strictly additive diff. Preserved all legacy variables at original dark hex values with `/* deprecated */` annotations.
   - Added prototype tokens: surfaces (`--frame`, `--canvas`, `--surface`, `--inset`), ink (`--ink`, `--ink-soft`, `--muted`, `--hairline`), brand (`--primary`, `--primary-dark`, `--primary-soft`, `--primary-soft-2`, `--danger`), tag pairs (including `--tag-danger-bg`/`--tag-danger-fg`), radii (`--r-tag`, `--r-panel`, `--r-card`, `--r-hero`), shadows, and motion utilities.
   - Added `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));`.
   - Resolved token collision: preserved `--color-muted: var(--text-muted);` for legacy classes and mapped the new prototype token to `--color-ink-muted: var(--muted);`.
   - **Fonts**: Loaded `Plus_Jakarta_Sans` via `next/font/google` with `--font-plus-jakarta` on `<html>`, defined `--fx-font-display: var(--font-plus-jakarta), "Manrope", Inter, system-ui, sans-serif;`, and mapped `--font-display: var(--fx-font-display);` in `@theme inline`. Added `.font-display` utility class (empirically verified resolving to Plus Jakarta Sans).
   - **Theme Cookie Architecture**: Implemented server action `setTheme(theme: "light" | "dark")` in `src/app/actions/theme.ts`. Root layout reads cookie server-side and sets `data-theme` on `<html>`, with a synchronous pre-hydration fallback in `<head>` for first-time visitors (zero flash).
   - Verified `--canvas` switches dynamically between `#f5f6fb` (light) and `#0e0e16` (dark).

---

## Files Touched
- [`src/app/globals.css`](file:///Users/adwaitpratapsingh/FitxTracker/src/app/globals.css) — Tokens, `@theme inline`, `@layer base` reset, prototype & legacy utilities.
- [`src/app/actions/theme.ts`](file:///Users/adwaitpratapsingh/FitxTracker/src/app/actions/theme.ts) — Server action for theme cookie persistence.
- [`src/app/layout.tsx`](file:///Users/adwaitpratapsingh/FitxTracker/src/app/layout.tsx) — RootLayout with Plus Jakarta Sans, `data-theme`, and pre-hydration script.
- [`design/verification/1/notes.md`](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/notes.md) — Reset audit and token collision notes.
- [`design/verification/1/walkthrough.md`](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/walkthrough.md) — Verification summary.
- [`design/TASKS.md`](file:///Users/adwaitpratapsingh/FitxTracker/design/TASKS.md) — Ticked Group 1 tasks.

---

## Verification Screenshots (Compared to Group 0 Baseline)

### Logged-Out Routes
- **Login (`/login`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/login-1280x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/login-1280x800-dark.png) — Sign In button now renders with full `px-5 py-2.5` padding.
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/login-360x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/login-360x800-dark.png) — Responsive button padding restored.
- **Register (`/register`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/register-1280x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/register-1280x800-dark.png) — Continue button padding restored.
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/register-360x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/register-360x800-dark.png) — Clean mobile layout.

### Logged-In Routes
- **Dashboard (`/dashboard`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/dashboard-1280x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/dashboard-1280x800-dark.png) — Sidebar navigation items and dashboard card icon wells now render with intended padding.
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/dashboard-360x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/dashboard-360x800-dark.png) — Center floating Log button offset (`-mt-6`) restored.
- **Workout Logger (`/workouts/new`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/workouts-new-1280x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/workouts-new-1280x800-dark.png) — Button sizes and action bar spacing restored.
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/workouts-new-360x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/workouts-new-360x800-dark.png)
- **Recovery (`/recovery`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/recovery-1280x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/recovery-1280x800-dark.png) — Save button padding restored.
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/recovery-360x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/recovery-360x800-dark.png)
- **Profile (`/profile`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/profile-1280x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/profile-1280x800-dark.png) — Save changes button padding restored.
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/profile-360x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/profile-360x800-dark.png)
- **CogniType Hub (`/cognitype`)**:
  - [1280x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/cognitype-1280x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/cognitype-1280x800-dark.png) — Start test button padding restored.
  - [360x800](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/1/cognitype-360x800-dark.png) vs [Group 0](file:///Users/adwaitpratapsingh/FitxTracker/design/verification/0/cognitype-360x800-dark.png)

---

## Tooling Checks
- `npm run lint`: Exactly 20 problems (2 pre-existing errors in `progress/page.tsx`, 18 warnings). Zero new errors or warnings.
- `npx tsc --noEmit`: Exited with code 0.
- `npm run build`: Exited with code 0.
