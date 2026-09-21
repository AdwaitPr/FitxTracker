# Group 3 Verification Notes: SVG Charts Port

This document records the empirical verification, accessibility testing, mathematical validation, and visual rendering checks for Group 3 (Charts).

---

## 1. Components Ported

All 7 chart components and sub-primitives were ported from `design/prototype/src/charts.tsx` to `src/components/charts/` without adding any third-party charting libraries:

1. **`LineChart`** (`src/components/charts/line-chart.tsx`):
   - Multi-series support with area fill gradients.
   - Goal line with reference threshold labeling.
   - Dynamic stroke-dasharray animation on reveal.
   - Left padding increased from 34px to 48px to prevent multi-digit and decimal y-axis clipping (`2003.3`).
   - Accessible `<figcaption className="sr-only">` summary with low/high and initial/latest values.
   - Interactive focus & hover hit targets (`tabIndex={0}`, role `button`, aria-label) with keyboard tooltip dismissal via `Escape`.

2. **`BarChart` & `Bars`** (`src/components/charts/bar-chart.tsx`):
   - Exported both full `BarChart` container and headless `Bars` component for embedded grid contexts.
   - Alternating bar colors using `var(--primary-soft-2)` and `var(--primary)`.
   - Secondary line series with right-aligned y-axis scale.
   - Focusable bar rects (`tabIndex={0}`) triggering contextual tooltips.

3. **`Donut`** (`src/components/charts/donut.tsx`):
   - Pure functional prefix-sum calculation for SVG stroke offsets (eliminating React 19 immutability lint warnings).
   - Central readout displaying overall total by default, switching dynamically to slice percentage and label on slice or legend hover/focus.
   - Interactive legend buttons with full keyboard focus support.

4. **`CalendarHeatmap`** (`src/components/charts/calendar-heatmap.tsx`):
   - 26-week horizontal activity grid.
   - 5-tier intensity color scale derived from system tokens:
     - Tier 0: `var(--hairline)`
     - Tier 1: `var(--primary-soft-2)`
     - Tier 2: `color-mix(in oklab, var(--primary) 50%, var(--surface))`
     - Tier 3: `var(--primary)`
     - Tier 4: `var(--ink)`
   - Month headers and Mon/Wed/Fri day-of-week labels.
   - Accessible SVG `<title>` tooltips on each day cell.
   - "Less ... More" gradient legend.

5. **`GridHeatmap`** (`src/components/charts/grid-heatmap.tsx`):
   - Pure React Server Component rendering a CSS Grid matrix.
   - Dynamic cell tint computed using `color-mix(in oklab, var(--primary) ${intensityPct}%, var(--surface))`.
   - Contrast threshold: automatically switches text color to high-contrast `--frame` when intensity exceeds 55%.
   - Full keyboard accessibility and hover title attributes.

6. **`Scatter`** (`src/components/charts/scatter.tsx`):
   - Client component with built-in least-squares linear regression:
     $$m = \frac{n \sum xy - \sum x \sum y}{n \sum x^2 - (\sum x)^2}, \quad b = \frac{\sum y - m \sum x}{n}$$
     $$r = \frac{n \sum xy - \sum x \sum y}{\sqrt{[n \sum x^2 - (\sum x)^2][n \sum y^2 - (\sum y)^2]}}$$
   - Dashed trendline with Pearson correlation readout ($r$).
   - Focusable data point circles with hover and focus tooltip hit zones.
   - Left padding `pl = 38` to accommodate 2-digit y-axis labels.

7. **`Sparkline`** (`src/components/charts/sparkline.tsx`):
   - Pure React Server Component rendering compact inline SVG trends.
   - Smooth cubic bezier path generation.
   - `vectorEffect="non-scaling-stroke"` ensuring uniform 1.75px line width regardless of aspect ratio scaling.
   - Area gradient fill option.

8. **Barrel Export** (`src/components/charts/index.ts`):
   - Centralized exports for all components and TypeScript interfaces.

---

## 2. Empirical Verification Results (Chrome DevTools Protocol)

Verification was conducted via an automated CDP test runner (`scratch/verify-group3.mjs`) against `http://localhost:3000/dev/charts`:

| Test Case | Interaction / Target | Measured Behavior | Result |
| :--- | :--- | :--- | :--- |
| **DOM Accessibility Summaries** | All 7 charts rendered | Each component contains a semantic `<figcaption className="sr-only">` or `<figure aria-labelledby="...">` | **PASS** |
| **LineChart Keyboard Focus** | Focus on data point index 3 | Tooltip rendered at `(cx, cy)` with content `Wed 195.4 lbs`. | **PASS** |
| **LineChart Tooltip Dismissal** | Press `Escape` key | Tooltip state cleared immediately (`active = null`). | **PASS** |
| **BarChart Dual-Axis Series** | Bar hover & focus | Tooltip displays both bar value (`225 lbs`) and secondary line value (`5.2 reps`). | **PASS** |
| **Donut Center Readout** | Hover legend item "Legs" | Central SVG text switched from `Total: 100` to `Legs: 35%`. | **PASS** |
| **Scatter Linear Regression** | Sample dataset (5 points) | Trendline computed with slope $m = 1.15$ and Pearson $r = 0.985$. Trendline coordinates accurately match bounding box. | **PASS** |
| **Grid Heatmap Cell Colors** | Cell intensity 80% | Background computed as `color-mix(...)`, text color switched to high contrast white. | **PASS** |

---

## 3. Visual & Viewport Capture

Screenshots were captured across 4 configurations:
- `design/verification/3/dev-charts-dark-1280.png`: Desktop (1280x800), Dark mode.
- `design/verification/3/dev-charts-dark-360.png`: Mobile (360x800), Dark mode.
- `design/verification/3/dev-charts-light-1280.png`: Desktop (1280x800), Light mode.
- `design/verification/3/dev-charts-light-360.png`: Mobile (360x800), Light mode.

All captures verify:
- Crisp vector curves and stroke widths.
- No label clipping on y-axes.
- Seamless theme switching between light and dark tokens.
- Graceful responsive stacking on 360px mobile viewports.
