# Group 2a Walkthrough: UI Primitives Refactoring & Additions

This walkthrough summarizes the implementation, empirical testing, and visual verification performed for **Group 2a** of the FitxTracker UI redesign.

---

## 1. Changes Overview

### Group 1 Follow-up
- **`src/app/layout.tsx`**: Updated both server cookie check and client inline script fallback so unmigrated pages default to `"dark"` when no cookie is set, adding `/* TODO Group 13: restore prefers-color-scheme */`.
- **`.gitignore`**: Added `design/verification/**/*.png` to avoid tracking heavy binary verification assets.

### Primitives Refactoring (Server/Client Compatible, No `"use client"`)
- **`Card` (`src/components/ui/card.tsx`)**:
  - Removed `"use client"` to allow Server Components to render cards directly.
  - Replaced legacy JS `onMouseEnter`/`onMouseLeave` handlers with pure CSS `hover:border-primary/40`.
  - Border radius updated to `rounded-card` (20px) with `shadow-soft` and hairline border.
  - Maintained `p-6` (24px) default padding while allowing overrides (e.g. `p-4`, `p-5`) to merge cleanly via `twMerge`.
  - Kept all backward-compatible props (`as`, `hover`, `glow`, `style`, HTML attributes).
- **`Button` (`src/components/ui/button.tsx`)**:
  - Removed `"use client"`.
  - Converted shape to pill `rounded-full` with active micro-scaling (`active:scale-[0.98]`).
  - Added full prototype variant suite: `black`, `primary`, `secondary` (alias/outline), `soft`, `outline`, `ghost`, `danger` (solid high-contrast), `dangerSoft`.
  - Added prototype height scale: `sm` (h-9 desktop, enlarged to h-11 / 44px on mobile `<md`), `md` (h-11), `lg` (h-12).
  - Added accessible focus outline: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`.
  - Added `arrow` support with `ArrowRight` icon animation on hover.
  - Maintained `isLoading`, `fullWidth`, `icon?: ReactNode`, and standard HTML button props.
- **`Input` (`src/components/ui/input.tsx`)**:
  - Removed `"use client"`.
  - Converted shape to pill `rounded-full` with 44px (`h-11`) height.
  - Replaced JS focus/blur event handlers with pure CSS classes (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary` and `border-primary/50`).
  - Replaced legacy dark text with `placeholder:text-ink-muted`.
  - Implemented accessibility: linked `label` (`htmlFor`), `error` (`role="alert"`), and `hint` via `useId()` and `aria-describedby`.

### New Primitives Added
- **`Tag` (`src/components/ui/tag.tsx`)** (Server Component):
  - 6 status tones (`violet`, `cyan`, `pink`, `amber`, `green`, `danger`) with token-based background and foreground.
  - Micro uppercase tracked typography with optional `icon` slot.
- **`IconButton` (`src/components/ui/icon-button.tsx`)** (Server Component):
  - 4 variants (`outline`, `solid`, `ghost`, `soft`), optional notification `badge`, and touch target compliance (`max-md:min-h-11 max-md:min-w-11`).
- **`Segmented` (`src/components/ui/segmented.tsx`)** (Client Component):
  - Full WAI-ARIA Radio Group pattern (`role="radiogroup"`, `role="radio"`, `aria-checked`, roving `tabindex`).
  - Keyboard navigation with ArrowLeft/Right, ArrowUp/Down, Home, and End keys.
  - Mobile touch target compliance (`min-h-9 max-md:min-h-11`).
- **`ProgressBar` (`src/components/ui/progress-bar.tsx`)** (Server Component):
  - Accessible `role="progressbar"`, dynamic CSS width transition (`duration-500`), accepting CSS color string (`color`).
- **`RingProgress` (`src/components/ui/ring-progress.tsx`)** (Server Component):
  - Purely CSS-driven keyframe animation (`@keyframes ring-fill` and `transition: stroke-dashoffset 500ms ease-out`).
  - Value strictly `0–100`, zero React state or effects, center slot for arbitrary React children, and optional badge.
- **`SectionHeader` (`src/components/ui/section-header.tsx`)** (Server Component):
  - Eyebrow, section heading (`text-[19px]`), optional description, and actions slot.
  - Also exported as `SectionHeading` for prototype parity.
- **`StatChip` (`src/components/ui/stat-chip.tsx`)** (Server Component):
  - KPI metric tile with tone-tinted icon badge, micro label, tabular bold value, unit, caption, and staggered CSS rise animation.
  - Menus omitted per DECISIONS.md item 9.

---

## 2. Validation & Quality Gates

1. **TypeScript Typecheck**:
   ```bash
   npx tsc --noEmit
   ```
   Result: **PASSED (0 errors)**.
2. **ESLint**:
   ```bash
   npm run lint
   ```
   Result: **20 problems (2 pre-existing errors, 18 warnings)** — exactly identical to `design/verification/0/baseline.md`. **Zero new errors or warnings**.
3. **WCAG AA Contrast**:
   - All 6 Tag tone pairs verified in light and dark mode ($\ge 4.5:1$ contrast ratio).
4. **Computed Styles**:
   - Verified in headless Chrome: `rounded-card` (20px), `rounded-tag` (12px), `shadow-soft` (0 8px 30px rgba(0,0,0,0.35)), `bg-surface` (`#171724`), `text-ink-muted`, etc.
5. **Keyboard Navigation**:
   - Verified in headless Chrome with native OS keys: `ArrowRight` advances selection and roving tabindex, `End` jumps to last option, `Home` jumps to first option.
6. **Temporary Showcase Route (`/dev/ui`)**:
   - Created, tested and screenshotted at 1280x800 and 360x800 in both light and dark mode.
   - Cleanly deleted before commit.
7. **Regression Screen Captures**:
   - Captured dark mode screenshots across `/login`, `/register`, `/dashboard`, `/workouts/new`, `/recovery`, `/profile`, `/cognitype`, `/workouts/history`, and `/progress`.
   - Detailed visible differences recorded in `design/verification/2/notes.md`.

---

## 3. Group 2b Additions (Overlays, Controls & Brand SVGs)

### 3.1 Overlays & Floating Components (`createPortal`)
- **`Modal` (`src/components/ui/modal.tsx`)** (Client Component):
  - Portaled directly to `document.body`.
  - Nested scroll lock counter preventing body jitter across multiple open modals.
  - Accessible focus trap with initial focus into the first interactive element.
  - Global `Escape` key listener with focus return to the trigger element.
  - Uses `--overlay` token and safe-area inset mobile bottom sheet styles.
- **`Menu` (`src/components/ui/menu.tsx`)** (Client Component):
  - Portaled directly to `document.body`, avoiding clipping by parent container overflow.
  - Position calculated via `getBoundingClientRect()` from trigger; flips upward when space below is tight.
  - Closes on pointerdown outside, resize, or scroll.
  - First enabled item focused on open; ArrowUp/Down/Home/End keyboard navigation.
  - Supports both `onClick` and `href` (renders Next.js `<Link role="menuitem">`).
- **`Popover` (`src/components/ui/popover.tsx`)** (Client Component):
  - Portaled to `document.body` with dynamic alignment and edge flipping.
  - Server-friendly default trigger button (`triggerLabel`, `triggerIcon`, `triggerClassName`), preventing serialization errors when called from Server Components.
  - Escape key and pointerdown outside listeners.
- **`Toast` (`src/components/ui/toast.tsx`)** (Client Component):
  - `ToastProvider` and `useToast` hook for application-wide notifications.
  - Polite announcements (`role="status"`, `aria-live="polite"`) for success, assertive (`role="alert"`, `aria-live="assertive"`) for danger.
  - Portaled notification container with countdown pause on hover or focus.

### 3.2 Form Controls
- **`Select` (`src/components/ui/select.tsx`)** (Server Component):
  - Full-pill shape with `appearance-none` and `[background-image:none] !bg-none` resetting legacy `globals.css` chevron.
  - Single Lucide `ChevronDown` placed at `right-4`.
- **`Textarea` (`src/components/ui/textarea.tsx`)** (Server Component):
  - Rounded container (`rounded-[20px]`) with `border-hairline`, `bg-surface`, and `placeholder:text-ink-muted`.
- **`Slider` (`src/components/ui/controls.tsx`)** (Client Component):
  - Accessible range input with required `label`, `aria-valuetext`, min/max/step, and dynamic `--pct` CSS custom property.
  - 44px minimum touch target height.
- **`Stepper` (`src/components/ui/controls.tsx`)** (Client Component):
  - Precise arithmetic avoiding floating-point drift (e.g. 7.300000000000001).
  - Clear `aria-label` on decrement/increment buttons and `aria-live="polite"` on value display.
- **`Chip` (`src/components/ui/controls.tsx`)** (Client Component):
  - Pill button with `aria-pressed`, optional status tone or icon, and 44px mobile height compliance (`min-h-10 max-md:min-h-11`).
- **`Disclosure` (`src/components/ui/controls.tsx`)** (Client Component):
  - Accordion header with rotating `ChevronDown`.
  - Keeps content mounted in DOM using `hidden={!open}` and `!open && "hidden"`, preserving internal input values across collapse/expand cycles.
- **`Toggle`**:
  - Omitted per DECISIONS.md item 8 and user instruction.

### 3.3 Brand SVGs & Feedback
- **`Logo` (`src/components/ui/logo.tsx`)** (Server Component):
  - 4-point sparkle brand mark with `Fitx` and `Tracker` display typography.
  - Standard and compact variants.
- **`MuscleGlyph` (`src/components/ui/muscle-glyph.tsx`)** (Server Component):
  - 7 anatomical muscle glyphs (`Chest`, `Back`, `Legs`, `Shoulders`, `Arms`, `Core`, `Cardio`).
  - Default `aria-hidden={true}` with configurable `size` and `currentColor` stroke.
- **`Skeleton` (`src/components/ui/skeleton.tsx`)** (Server Component):
  - Accessible pulse loader (`aria-hidden="true"`) with `rounded-[12px] bg-hairline`.
- **`EmptyState` (`src/components/ui/empty-state.tsx`)** (Server Component):
  - Dashed container with centered icon badge, title, descriptive body, and action button slot.

### 3.4 Verification Summary
- Automated CDP test suite verified all interactions:
  - Single chevron appearance on Select
  - 0.5kg precision stepping without floating point drift
  - Disclosure state retention
  - Modal focus trapping, scroll lock, and Escape close
  - Menu portaling, auto-focus, ArrowDown navigation, and Escape close
  - Popover portaling and Escape close
  - Toast polite announcements
- Screenshots captured at 1280x800 and 360x800 in light and dark mode.
- Temporary `/dev/ui` showcase route removed prior to checkpoint.
- `npx tsc --noEmit` passed with 0 errors; `npm run lint` matched baseline exactly.

