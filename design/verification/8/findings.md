# Group 8 (Recovery) Verification Findings

## 1. Overview
- **Route**: `/recovery`
- **Component**: `src/components/recovery/recovery-client.tsx` (Client island with `ToastProvider`), `src/app/(dashboard)/recovery/page.tsx` (Server Component).
- **Tested Viewports**:
  - `360x800` (Mobile) in Dark & Light
  - `768x1024` (Tablet) in Dark & Light
  - `1280x800` (Desktop) in Dark & Light
  - `1600x900` (Ultrawide) in Dark & Light
- **Prototype Reference**: `http://localhost:5173/#/recovery`

---

## 2. Behavioral & Contract Verification
- **API Contract**:
  - `POST /api/recovery` handles upserting per day (`userId_date` compound key) using midnight-normalized dates.
  - Submitting via the client form updates today's entry cleanly.
- **Client-Side Validation**:
  - `sleepHours` validated for finite number between $0$ and $24$.
  - `stressLevel` validated as integer between $1$ and $10$.
  - `sleepQuality` strictly validated to exact literal set `{"Poor", "Fair", "Good", "Excellent"}`.
  - `gutStatus` strictly validated to exact literal set `{"Good", "Bloated", "Uncomfortable"}`.
  - Invalid inputs reject submit with a descriptive error toast instead of sending bad data.
- **Score-Band Label Source Rule**:
  - Gauge tag, suggested intensity, alert message, and 14-day history rows all pull their score-band level from `getWorkoutRecommendation(dailyRecovery).level` in Title Case (`Optimal`, `Normal`, `Warning`, `Critical`).
  - Neither `sleepQuality` nor `gutStatus` is used as a stand-in label anywhere on the page.
- **14-Day History Deduplication**:
  - Server Component queries the user's latest logs and deduplicates by calendar day (`YYYY-MM-DD`), taking up to 14 days newest-first.
- **Trend Chart**:
  - Uses shared `LineChart` from `@/components/charts/line-chart` with dual series: Sleep (h) area line and Stress (/10) dashed line, with accessible screen-reader summary text.
- **Static Popover**:
  - "How this is calculated" opens an accessible popover detailing the static 40/30/20/10 weighting and the 80/60/40 threshold bands.

---

## 3. Visual & Aesthetic Parity with Prototype
| Element | Prototype (`Recovery.tsx`) | Real Implementation | Status |
|---|---|---|---|
| Gauge | `RingProgress` 228px, 12px stroke | `RingProgress` 228px, 12px stroke | Exact match |
| Level Tag | `<Tag tone={tone}>{label} — {intensity}</Tag>` | `<Tag tone={tone} icon={<Zap size={13} />}>{label} — {intensity}</Tag>` | Exact match |
| Factor Breakdown | 4 progress bars with weight % and value | Mini `ProgressBar`s with matching thresholds & colors | Exact match |
| Sleep Control | Slider + Stepper | Group 2b `Slider` + `Stepper` | Exact match |
| Sleep Quality | Segmented 4-option control | Group 2b `Segmented` | Exact match |
| Stress Control | Slider + 10 dots radiogroup | Group 2b `Slider` + 10 dots radiogroup with aria-label | Exact match |
| Gut Control | 3 Chips (green, amber, pink) | Group 2b `Chip` with custom tone styles | Exact match |
| Notes | Textarea | Group 2b `Textarea` | Exact match |
| Explainer | Popover with weight bars | Group 2b `Popover` with weight bars & static copy | Exact match |
| Chart | Dual line chart 14d | Group 3 `LineChart` with tooltip, summary, aria-label | Exact match |
| History | 14-day rows with progress bars and tags | Table with `formatRelativeDate`, `ProgressBar`, `Tag` | Exact match |

---

## 4. Discovered Notes & Flags
1. **Server Timezone vs. User Local Timezone**:
   - `src/app/api/recovery/route.ts` truncates "today" using `new Date()` in the Node runtime's timezone (UTC on production hosts).
   - This was documented in `design/verification/8/notes.md` for resolution in the deployment-prep phase (passing user's local date explicitly from client).
