# Antigravity kit: FitxTracker UI port

Drop these files into the ROOT of your repo. Antigravity reads `AGENTS.md` as rules and
`.agents/workflows/*.md` as slash commands. You review 13 checkpoints; the agent does the rest.

## Part A: Human setup (about 30 minutes, do once)

### A1. Repo + branch
```bash
git clone <your-repo> && cd FitxTracker
git checkout -b chore/db-baseline
```

### A2. Fix the database baseline (IMPORTANT)
Your `schema.prisma` says `provider = "postgresql"` but `prisma/migrations/` and `prisma/dev.db`
are SQLite leftovers, so the app cannot start as cloned. Fix this first, on its own branch.

1. Start a local Postgres (or create a free Neon dev database):
   ```bash
   docker run --name fitx-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fitx -p 5432:5432 -d postgres:16
   ```
2. Create BOTH `.env` (Prisma CLI reads this) and `.env.local` (Next.js reads this) with:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitx"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="<output of: openssl rand -base64 32>"
   ```
   (Both are gitignored via `.env*`.)
3. Regenerate the migration history for Postgres (safe on a fresh dev DB; data in the old
   SQLite file is not carried over):
   ```bash
   rm -rf prisma/migrations prisma/dev.db
   npx prisma migrate dev --name init
   npx tsx prisma/seed.ts
   npm run dev      # register a user, log a workout, confirm the CURRENT app works
   ```
4. `git add -A && git commit -m "chore: postgres baseline migration"`, then:
   ```bash
   git checkout -b ui-redesign
   ```

### A3. Add the design + kit
1. Unzip your prototype to `design/prototype/` (delete its `package-lock.json`),
   and move `PORT-AUDIT.md` to `design/PORT-AUDIT.md`.
2. Copy this kit over the repo root (`AGENTS.md`, `.agents/`, `design/DECISIONS.md`, `design/TASKS.md`).
3. `git add -A && git commit -m "add design prototype and agent kit"`.

### A4. Antigravity settings (names may differ slightly by version; check Settings)
- Open the repo folder in Antigravity, use the **Agent Manager**, mode **Planning**.
- Install the Chrome extension so the **browser agent** can open pages and take screenshots.
- Terminal command policy: **Auto**, with a deny list containing `git push`, `git reset`,
  `rm -rf`, `prisma migrate reset`, `prisma db push`, `DROP`.
- Review policy: let the agent proceed on its own plans (our workflows already stop after each
  checkpoint), but still read every `walkthrough.md`.
- Use the strongest model available to you for Groups 6, 9 and 11 (the big client screens).

## Part B: Running it

Start a NEW agent conversation per group (keeps context small; the rules reload every time).

1. First message in a fresh conversation: `/next-task`
2. The agent plans, implements, runs lint/tsc, runs `/verify-ui` (browser, 4 viewports,
   light + dark, compared against the prototype), then `/checkpoint` (build, tick TASKS.md,
   walkthrough, commit) and stops.
3. You review: open `design/verification/<id>/walkthrough.md` and the screenshots, click around
   yourself, and check `git show --stat`.
4. Say `continue` (or start a new conversation and run `/next-task`) for the next group.
   If something is off, reply with the fix you want; do not tick the boxes yourself.

### Where you must stay in the loop
| Moment | Why |
|---|---|
| Group 0 result | If the baseline build fails, fix it before anything else |
| Group 4 (shell) | Every later screen inherits it. Look carefully at mobile |
| Group 6 (logger) | Save a workout for real and check it in History |
| Group 9 (body weight) | The agent may ask to add one POST route; you decide |
| Group 11 (CogniType) | Type a full test on desktop; capture logic must be unchanged |
| Final (13) | Test on a real phone via your LAN IP, keyboard-only pass |

### Things Antigravity will NOT do for you
Databases and secrets, schema changes, deployment, real-device testing, and judging whether
it "feels" right. Those come in the next phase (deploy prep, PWA, Capacitor).

### If the agent goes off track
- It touched a guarded file: `git checkout -- <file>` and tell it to re-read AGENTS.md.
- It invented data: point to DECISIONS.md and ask it to remove or derive per the rule.
- It drifted visually: run `/verify-ui` again and tell it to fix every listed difference.
