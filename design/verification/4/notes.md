# Group 4 Verification Notes: Shell Architecture

This document records the empirical verification, computed CSS property checks, responsive behavior, theme toggling, and layout assertions for Group 4 (Shell).

---

## 1. Components Implemented in `src/components/layout/`

- **`Logo` (`src/components/layout/logo.tsx`)**:
  - Re-exports `Logo` and `LogoProps` from `src/components/ui/logo.tsx`.
  - Supports `compact` and `light` modes.

- **`PageHeader` (`src/components/layout/page-header.tsx`)**:
  - Server Component with `rise` animation.
  - Micro uppercase tracked eyebrow label, `text-[26px] sm:text-[30px]` semibold title, `text-[14px]` subtext, and actions slot.

- **`Sidebar` (`src/components/layout/sidebar.tsx`)**:
  - Full navigation rail supporting 260px expanded desktop and 76px collapsed tablet viewports.
  - 3 primary sections: **OVERVIEW** (Dashboard, New Workout, History, Exercises, Recovery, Progress), **COGNITIVE** (CogniType, Sessions, Analytics), and **ACCOUNT** (Profile).
  - Path matching via `activeIdFor(pathname)` with `aria-current="page"`.
  - Footer with Settings link (`/profile?tab=settings`) and destructive orange-red Logout button (`text-danger hover:bg-tag-danger-bg`, wired to NextAuth `signOut`).
  - Icons mapped 1:1 to `lucide-react` per `PORT-AUDIT.md` section 2.3.

- **`TopBar` (`src/components/layout/top-bar.tsx`)**:
  - Mobile compact logo (`md:hidden`).
  - Global Search input (`hidden sm:flex`) submitting to `/exercises?q=...` (DECISIONS 8), with mobile search icon button (`sm:hidden`).
  - Log Workout outline icon button (`hidden sm:inline-grid`).
  - Notifications Bell Popover: shows active recovery alert verdict derived from `alerts.ts` (DECISIONS 5) with dot badge on warning/critical alerts.
  - Theme Toggle icon button: switches between light/dark themes via `setTheme` server action and updates `document.documentElement.dataset.theme`.
  - User avatar with initials and display name/goal linking to `/profile`.

- **`MobileNav` (`src/components/layout/mobile-nav.tsx`)**:
  - Fixed mobile bottom navigation with safe-area padding (`pb-[env(safe-area-inset-bottom)]`).
  - 5 slots: Home, History, Log (elevated center button with `-mt-7`, `h-14 w-14`, `bg-primary`, `shadow-lift`), Recovery, Profile.
  - Active color `text-primary`, inactive `text-ink-muted`.

- **`Shell` & `ShellRail` (`src/components/layout/shell.tsx`)**:
  - Outer layout frame (`min-h-screen bg-frame`) and `.app-window` container.
  - 3-column architecture: Sidebar (col 1), main content area (col 2), right-rail aside (col 3: 356px width, border-l).
  - `ShellRail` client portal component enabling child pages (e.g. Dashboard, NewWorkout) to render content directly into the right-rail slot.

- **`(dashboard)/layout.tsx` (`src/app/(dashboard)/layout.tsx`)**:
  - Server Component reading user session via `getServerSession(authOptions)`.
  - Queries user's today recovery log and computes workout recommendation alert for TopBar notifications.

---

## 2. Empirical Verification Results (Chrome DevTools Protocol)

Automated headless verification was conducted across all 4 responsive tiers in both dark and light modes:

| Viewport | Mode | Measured Property / Selector | Computed Value | Expected Value | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Desktop (1280x800)** | Dark & Light | Sidebar width (`nav[aria-label="Primary"]`) | `260px` | `260px` (`xl:w-[260px]`) | **PASS** |
| **Desktop (1280x800)** | Dark & Light | Mobile nav display (`nav[aria-label="Mobile"]`) | `none` | `none` (`md:hidden`) | **PASS** |
| **Desktop (1280x800)** | Dark & Light | TopBar search input (`#global-search`) | Present & visible | Present & visible | **PASS** |
| **Desktop (1280x800)** | Dark & Light | Active navigation link | `Dashboard` (`/dashboard`) | `Dashboard` (`/dashboard`) | **PASS** |
| **Tablet (768x1024)** | Dark & Light | Sidebar width (`nav[aria-label="Primary"]`) | `76px` | `76px` (`w-[76px]`) | **PASS** |
| **Tablet (768x1024)** | Dark & Light | Sidebar labels text | `display: none` | `display: none` (`hidden xl:block`) | **PASS** |
| **Tablet (768x1024)** | Dark & Light | Mobile nav display | `none` | `none` (`md:hidden`) | **PASS** |
| **Mobile (360x800)** | Dark & Light | Sidebar display | `none` | `none` (`hidden md:flex`) | **PASS** |
| **Mobile (360x800)** | Dark & Light | Mobile nav display | Visible | Visible | **PASS** |
| **Mobile (360x800)** | Dark & Light | Center Log button height | `56px` | `56px` (`h-14`) | **PASS** |
| **Mobile (360x800)** | Dark & Light | Center Log elevation | `-mt-7` (`margin-top: -28px`) | `-mt-7` | **PASS** |
| **Ultrawide (1600x900)** | Dark & Light | App window max width (`.app-window`) | `1720px` | `1720px` | **PASS** |
| **Ultrawide (1600x900)** | Dark & Light | App window corner radius (`.app-window`) | `32px` | `32px` | **PASS** |
| **Ultrawide (1600x900)** | Dark & Light | App window outer backdrop | Visible `--frame` tint | Visible `--frame` tint | **PASS** |

---

## 3. Visual Verification Captures

Eight screenshots were captured and archived in `design/verification/4/`:
- `dashboard-360-dark.png`: Mobile (360x800), Dark mode
- `dashboard-768-dark.png`: Tablet (768x1024), Dark mode
- `dashboard-1280-dark.png`: Desktop (1280x800), Dark mode
- `dashboard-1600-dark.png`: Ultrawide (1600x900), Dark mode
- `dashboard-360-light.png`: Mobile (360x800), Light mode
- `dashboard-768-light.png`: Tablet (768x1024), Light mode
- `dashboard-1280-light.png`: Desktop (1280x800), Light mode
- `dashboard-1600-light.png`: Ultrawide (1600x900), Light mode
