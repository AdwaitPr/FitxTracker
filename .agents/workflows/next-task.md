---
description: Execute the next unchecked task group in design/TASKS.md (plan, implement, verify, checkpoint)
---
1. Read `AGENTS.md`, `design/DECISIONS.md`, `design/TASKS.md`. Find the first group with unchecked boxes.
2. Read ONLY the prototype files named in that group's header, plus `design/PORT-AUDIT.md` sections relevant to it.
3. Produce an implementation plan artifact listing: files to create/change, prototype-to-real data mapping, and any element with no backing data. If any item needs a decision not covered by DECISIONS.md, STOP and ask the human before writing code.
4. Implement the tasks in order, one at a time, following the guardrails in AGENTS.md.
// turbo
5. Run `npm run lint`
// turbo
6. Run `npx tsc --noEmit`
7. Fix any errors. If the same error persists after two attempts, STOP and report it.
8. Run the `/verify-ui` workflow for every route this group touched.
9. Run the `/checkpoint` workflow. Do not start another group.
