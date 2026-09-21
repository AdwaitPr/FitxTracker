# Group 1: Token & Reset Notes

## 1. Empirical Verification of Universal Reset

### Problem
In `src/app/globals.css`, the legacy reset was unlayered:
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```
In Tailwind CSS v4 (using CSS Cascade Layers), unlayered styles take precedence over all `@layer` styles, including `@layer utilities`. Consequently, this unlayered rule completely silenced Tailwind spacing utilities (`p-*`, `m-*`, `space-*`, etc.) throughout the application.

### Empirical Confirmation
1. Injected an element with class `p-8` into the page with the unlayered reset:
   - Result: `padding: 0px` (failed to apply `32px`).
2. Wrapped the reset inside `@layer base`:
   ```css
   @layer base {
     *,
     ::before,
     ::after {
       box-sizing: border-box;
       margin: 0;
       padding: 0;
     }
   }
   ```
3. Injected an element with class `p-4` and tested via Chrome DevTools Protocol:
   - Result: `padding: 16px` (`p4Applied: true`).

---

## 2. Complete Inventory of Affected Spacing Utilities

Moving the reset into `@layer base` restores the intended padding, margin, and space-y utilities across the codebase.

### Direct Usages

#### `src/app/(auth)/layout.tsx` (1 usage)
- Line 8: `p-4` (centres auth card with container padding).

#### `src/app/(dashboard)/dashboard/page.tsx` (13 usages)
- Line 116: `space-y-8` (vertical section rhythm)
- Line 122: `mt-1` (greeting caption margin)
- Line 143: `mt-1` (stat chip value margin)
- Line 146: `p-2` (stat chip icon container padding)
- Line 162: `p-6` (start workout hero card padding)
- Line 176: `p-3` (start workout icon well padding)
- Line 199: `p-3` (history shortcut icon well padding)
- Line 271: `p-3` (recovery alert icon container padding)
- Line 287: `mb-4` (recent activity header bottom margin)
- Line 300: `py-8` (empty state vertical padding)
- Line 302: `mb-3`, `mx-auto` (empty state icon margin)
- Line 307: `mt-1` (empty state subtext margin)
- Line 315: `space-y-3` (recent workout list vertical rhythm)

#### `src/components/ui/button.tsx` (3 usages)
- Line 42: `px-3 py-1.5` (button size `sm`)
- Line 43: `px-5 py-2.5` (button size `md`)
- Line 44: `px-7 py-3.5` (button size `lg`)

#### `src/components/layout/sidebar.tsx` (5 usages)
- Line 49: `px-4 py-3` (nav item button padding)
- Line 73: `p-6` (sidebar header branding padding)
- Line 85: `p-4`, `space-y-1` (nav container padding & item spacing)
- Line 129: `p-4` (sidebar footer padding)

#### `src/components/layout/mobile-nav.tsx` (3 usages)
- Line 32: `px-2 py-2` (mobile nav container padding)
- Line 42: `-mt-6` (center floating Log button offset)
- Line 54: `px-3 py-1.5` (mobile nav link padding)

### Indirect Usages via `<Button>` Component
Because `src/components/ui/button.tsx` defines button size padding (`px-3 py-1.5`, `px-5 py-2.5`, `px-7 py-3.5`), all pages importing and rendering buttons now display their proper button dimensions:
1. `src/app/(auth)/login/page.tsx`
2. `src/app/(auth)/register/page.tsx`
3. `src/app/(dashboard)/profile/page.tsx`
4. `src/app/(dashboard)/workouts/new/page.tsx`
5. `src/app/(dashboard)/recovery/page.tsx`
6. `src/app/(dashboard)/cognitype/page.tsx`

---

## 3. Collision Resolution Documentation

In `@theme inline`:
- Legacy mapping: `--color-muted: var(--text-muted);` is kept intact at `#8B8BA3` to prevent altering the 32 existing usages of `text-muted` across unmigrated pages.
- Prototype mapping: The prototype `--muted` token (`#6b7086` light / `#9a9fb5` dark) is mapped to the non-colliding key:
  ```css
  --color-ink-muted: var(--muted);
  ```
  The raw CSS variable `var(--muted)` remains available for direct use.
