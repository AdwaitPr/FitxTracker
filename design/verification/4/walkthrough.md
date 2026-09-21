# Group 4 Walkthrough: Shell Architecture

This walkthrough summarizes the implementation, empirical testing, and visual verification performed for **Group 4 (Shell)** of the FitxTracker UI redesign.

---

## 1. Components Implemented

The application navigation frame was ported from `design/prototype/src/chrome.tsx` into `src/components/layout/` and wired to real data in `src/app/(dashboard)/layout.tsx`:

- **`Logo` (`src/components/layout/logo.tsx`)**:
  - Re-exported from `src/components/ui/logo.tsx` with compact and light variant support.

- **`PageHeader` (`src/components/layout/page-header.tsx`)**:
  - Reusable Server Component supporting eyebrow label, primary title, subtitle, and an actions button slot.

- **`Sidebar` (`src/components/layout/sidebar.tsx`)**:
  - Responsive rail: 260px expanded on desktop (`xl`), 76px collapsed icon-only rail on tablet (`md`), hidden on mobile.
  - Groups navigation into **OVERVIEW**, **COGNITIVE**, and **ACCOUNT** sections with active highlighting via `activeIdFor(pathname)`.
  - Settings link and orange-red destructive Logout button connected to NextAuth `signOut`.

- **`TopBar` (`src/components/layout/top-bar.tsx`)**:
  - Compact mobile logo.
  - Navigation search input linking to `/exercises?q=...` (with mobile search icon button).
  - Quick "Log workout" button linking to `/workouts/new`.
  - Notifications Bell Popover showing today's single recovery alert verdict from `alerts.ts`.
  - Theme Toggle icon button (Sun/Moon) synchronizing light and dark mode with the `setTheme` server action.
  - User avatar with initials and profile link.

- **`MobileNav` (`src/components/layout/mobile-nav.tsx`)**:
  - Fixed mobile bottom navigation with safe-area padding (`env(safe-area-inset-bottom)`).
  - 5 slots: Home, History, elevated center Log button (`-mt-7`, `h-14 w-14`, `shadow-lift`), Recovery, Profile.

- **`Shell` & `ShellRail` (`src/components/layout/shell.tsx`)**:
  - 3-column architecture (Sidebar, Main content, 356px Right Rail).
  - `ShellRail` client portal component allowing child dashboard pages to dynamically populate the right rail without breaking Server Component tree boundaries.
  - `.app-window` styling active at viewports $\ge 1600\text{px}$.

- **`DashboardLayout` (`src/app/(dashboard)/layout.tsx`)**:
  - Server Component querying user session and today's recovery data from Prisma, passing authenticated user details and smart recovery alert to the Shell.

---

## 2. Quality Gates & Validation

- **TypeScript Strict Check**: `npx tsc --noEmit` passed with 0 errors.
- **ESLint**: `npm run lint` passed with 0 new errors or warnings (all 19 remaining warnings/errors are isolated to unmigrated legacy pages).
- **Responsive Tiers**:
  - 360px: Sidebar hidden, mobile nav visible with elevated center Log button (height 56px, -mt-7).
  - 768px: Sidebar rendered as 76px rail with icons only; mobile nav hidden.
  - 1280px: Sidebar rendered as 260px expanded menu with section titles and labels; top search input visible.
  - 1600px: `.app-window` container centered at 1720px max-width with 32px border radius, window shadow, and visible `--frame` backdrop.
- **Visual Capture**: 8 screenshots (4 viewports $\times$ 2 themes) saved in `design/verification/4/`.
