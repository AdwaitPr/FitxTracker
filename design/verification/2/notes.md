# Group 2a Verification Notes: Primitives Refactoring & Additions

This document records the empirical verification, computed CSS property checks, WCAG AA contrast evaluations, keyboard accessibility testing, and visual comparison of legacy pages for Group 2a.

---

## 1. WCAG Contrast Verification (Tag Tone Pairs)

All 6 Tag tone pairs were tested in both light mode (against their respective tag tint background) and dark mode (blended over the `--surface` background `#171724`). All 12 pairs achieve WCAG AA compliance ($\ge 4.5:1$ for normal text).

| Tone | Mode | Background Token / Value | Foreground Token / Value | Contrast Ratio | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Violet** | Light | `--tag-violet-bg` (`#eae7fb`) | `--tag-violet-fg` (`#5a4bd1`) | **5.15:1** | **PASS** ($\ge 4.5:1$) |
| **Violet** | Dark | `--tag-violet-bg` (`rgba(133, 119, 240, 0.16)`) | `--tag-violet-fg` (`#b4a9ff`) | **6.90:1** | **PASS** ($\ge 4.5:1$) |
| **Cyan** | Light | `--tag-cyan-bg` (`#e3f4f8`) | `--tag-cyan-fg` (`#1a6f8a`) | **5.04:1** | **PASS** ($\ge 4.5:1$) |
| **Cyan** | Dark | `--tag-cyan-bg` (`rgba(47, 164, 199, 0.16)`) | `--tag-cyan-fg` (`#7fd3ec`) | **8.25:1** | **PASS** ($\ge 4.5:1$) |
| **Pink** | Light | `--tag-pink-bg` (`#fce7f6`) | `--tag-pink-fg` (`#b02e92`) | **4.90:1** | **PASS** ($\ge 4.5:1$) |
| **Pink** | Dark | `--tag-pink-bg` (`rgba(217, 70, 181, 0.16)`) | `--tag-pink-fg` (`#f49bdd`) | **7.47:1** | **PASS** ($\ge 4.5:1$) |
| **Amber** | Light | `--tag-amber-bg` (`#fff3dc`) | `--tag-amber-fg` (`#8f5a00`) | **5.26:1** | **PASS** ($\ge 4.5:1$) |
| **Amber** | Dark | `--tag-amber-bg` (`rgba(217, 138, 0, 0.16)`) | `--tag-amber-fg` (`#f2c071`) | **8.41:1** | **PASS** ($\ge 4.5:1$) |
| **Green** | Light | `--tag-green-bg` (`#e2f7ec`) | `--tag-green-fg` (`#0a6e47`) | **5.62:1** | **PASS** ($\ge 4.5:1$) |
| **Green** | Dark | `--tag-green-bg` (`rgba(18, 166, 106, 0.16)`) | `--tag-green-fg` (`#6fe0ae`) | **8.83:1** | **PASS** ($\ge 4.5:1$) |
| **Danger** | Light | `--tag-danger-bg` (`#fde9e1`) | `--tag-danger-fg` (`#b03a16`) | **5.17:1** | **PASS** ($\ge 4.5:1$) |
| **Danger** | Dark | `--tag-danger-bg` (`rgba(242, 107, 58, 0.20)`) | `--tag-danger-fg` (`#ffa183`) | **6.79:1** | **PASS** ($\ge 4.5:1$) |

*No token adjustments were required in `globals.css` as all 12 combinations exceed the 4.5:1 threshold.*

---

## 2. Computed CSS Styles Verification (Chrome Headless in Dark Mode)

Empirical properties extracted via Chrome DevTools Protocol from `http://localhost:3000/dev/ui`:

| Component / Element | Selector | Measured Property | Computed Value | Expected Design Token |
| :--- | :--- | :--- | :--- | :--- |
| **Card (Default)** | `#card-default` | `border-radius` | `20px` | `--r-card` (`20px`) |
| **Card (Default)** | `#card-default` | `background-color` | `rgb(23, 23, 36)` | `--surface` (`#171724`) |
| **Card (Default)** | `#card-default` | `box-shadow` | `... rgba(0, 0, 0, 0.35) 0px 8px 30px 0px` | `--fx-shadow-soft` |
| **Card (Default)** | `#card-default` | `padding` | `24px` | Default `p-6` (24px) |
| **Card (Custom Padding)** | `#card-custom-padding` | `padding` | `20px` | `twMerge` override to `p-5` (20px) |
| **Tag (Violet)** | `#tag-violet` | `border-radius` | `12px` | `--r-tag` (`12px`) |
| **Tag (Violet)** | `#tag-violet` | `background-color` | `rgba(133, 119, 240, 0.16)` | `--tag-violet-bg` |
| **Tag (Violet)** | `#tag-violet` | `color` | `rgb(180, 169, 255)` | `--tag-violet-fg` (`#b4a9ff`) |
| **Tag (Violet)** | `#tag-violet` | `font-size` | `11px` | Prototype micro text scale |
| **Tag (Violet)** | `#tag-violet` | `letter-spacing` | `1.1px` | `0.1em` uppercase tracking |
| **Button (Primary)** | `#btn-primary` | `border-radius` | `33554400px` (pill) | `rounded-full` |
| **Button (Primary)** | `#btn-primary` | `background-color` | `rgb(133, 119, 240)` | `--primary` (`#8577f0` in dark) |
| **Button (Primary)** | `#btn-primary` | `height` | `44px` | Size `md` (`h-11`) |
| **Button (sm - Desktop)** | `#btn-size-sm` | `height` | `36px` | Size `sm` (`h-9` on $\ge$md) |
| **Button (sm - Mobile)** | `#btn-size-sm` | `height` | `44px` | Size `sm` (`max-md:h-11` on mobile) |
| **Input (Default)** | `#input-default` | `border-radius` | `33554400px` (pill) | `rounded-full` |
| **Input (Default)** | `#input-default` | `background-color` | `rgb(23, 23, 36)` | `--surface` (`#171724`) |
| **Input (Default)** | `#input-default` | `height` | `44px` | Size `h-11` |
| **IconButton (Solid)** | `#ib-solid` | `border-radius` | `33554400px` (pill) | `rounded-full` |
| **IconButton (Solid)** | `#ib-solid` | `width` / `height` | `40px` / `40px` | Default size 40 |
| **SectionHeading** | `#section-card h2` | `font-size` | `19px` | Prototype section title scale |
| **SectionHeading** | `#section-card h2` | `font-weight` | `600` | `font-semibold` |
| **StatChip** | `#stat-volume` | `border-radius` | `20px` | `rounded-card` (`20px`) |
| **StatChip** | `#stat-volume` | `background-color` | `rgb(23, 23, 36)` | `--surface` |

---

## 3. Keyboard Navigation Test Results (`Segmented`)

Tested using Chrome DevTools Protocol `Input.dispatchKeyEvent` with native OS key events on the 3-option "Passage Difficulty" segmented control:

1. **Initial State**:
   - Option `2 · Moderate` is checked: `aria-checked="true"`, `tabindex="0"`, active element.
   - Other options: `aria-checked="false"`, `tabindex="-1"`.
2. **ArrowRight**:
   - Focus and selection moved to Option `3 · Complex`.
   - Option 3: `aria-checked="true"`, `tabindex="0"`, active element.
   - Option 2: `aria-checked="false"`, `tabindex="-1"`.
3. **End Key**:
   - Focus and selection remain on/move to the last option (Option `3 · Complex`).
   - `aria-checked="true"`, `tabindex="0"`.
4. **Home Key**:
   - Focus and selection move immediately to the first option (Option `1 · Simple`).
   - Option 1: `aria-checked="true"`, `tabindex="0"`, active element.
   - Option 3: `aria-checked="false"`, `tabindex="-1"`.
5. **Tab / Shift+Tab**:
   - Tab navigates into the radio group, landing on the single active radio button (`tabindex="0"`).
   - Pressing Tab again exits the group to the next interactive page element.

---

## 4. Visible Differences on Legacy Pages (Judged in Dark Mode Only)

Refactoring `Card`, `Button`, and `Input` to prototype tokens introduced the following intended design updates across legacy dark pages:

1. **Buttons**:
   - **Shape**: Converted from rectangular `rounded-lg` (8px) / `rounded-xl` (12px) to elegant pill-shaped `rounded-full`.
   - **Danger Variant**: Changed from a subtle, translucent red bordered box (`bg-error/10 text-error border border-error/20`) to solid high-contrast `bg-danger text-white` (with `dangerSoft` available for bordered contexts).
   - **Heights**: Standardized to fixed heights: `h-9 max-md:h-11` (`sm`), `h-11` (`md`), `h-12` (`lg`), ensuring touch targets below `md` always meet 44px.
   - **Arrow & Loading**: Arrow transitions smoothly on hover; loading spinner replaces content without altering dimensions.
   - **Affected Pages**: `/login`, `/register`, `/workouts/new`, `/recovery`, `/profile`, `/cognitype`.
2. **Cards**:
   - **Radius & Borders**: Updated from 16px to 20px (`--r-card` / `rounded-card`), bordered with hairline (`--hairline`), with a soft ambient shadow (`--fx-shadow-soft`).
   - **Hover Behavior**: Removed legacy JavaScript event handlers (`onMouseEnter`/`onMouseLeave`) which abruptly switched the background color to `--bg-card-hover`. Replaced with pure CSS `hover:border-primary/40`; the card background cleanly remains `--surface`.
   - **Padding**: Defaults to `p-6` (24px, identical to legacy inline padding), but allows callers to pass `p-4` or `p-5` which cleanly overrides via `twMerge`.
   - **Affected Pages**: `/dashboard`, `/workouts/[id]`, `/workouts/history`, `/progress`, `/cognitype/analytics`, `/cognitype/sessions`, `/cognitype/sessions/[id]`, `/login`, `/register`, `/workouts/new`, `/recovery`, `/profile`, `/cognitype`.
3. **Inputs**:
   - **Shape & Dimensions**: Converted from rectangular `rounded-12px` inputs to refined pill-shaped `rounded-full` inputs with fixed `h-11` (44px) height.
   - **Colors & Focus**: Text uses `text-ink`, placeholders use `text-ink-muted` (instead of legacy dark gray). Focus styles use `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary` and `border-primary/50`. Error states use `border-danger` with dedicated alert icons and `role="alert"`.
   - **Affected Pages**: `/login`, `/register`, `/workouts/new`, `/recovery`, `/profile`.
