# Group 8 (Recovery) Technical Notes & Audit Flags

## 1. Server Timezone Normalization in `POST /api/recovery`
- **Issue**: `src/app/api/recovery/route.ts` truncates "today" via `const today = new Date(); today.setHours(0, 0, 0, 0);`. This evaluates using the Node server's local environment timezone (UTC on Vercel or cloud containers).
- **Impact**: For a user in a non-UTC timezone (e.g., IST UTC+5:30 or PST UTC-8), logging close to midnight can result in the database storing a calendar date offset by ±1 day relative to the user's local day.
- **Future Resolution (Deployment-Prep)**: The client should pass the user's local calendar date explicitly (e.g., `date: "YYYY-MM-DD"` or timezone offset), validated server-side, rather than relying on server runtime midnight truncation.
- **Current Constraint**: Per AGENTS.md guardrails and user instruction, this is flagged for the deployment-prep phase and not papered over with ad-hoc client math.
