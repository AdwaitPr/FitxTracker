---
description: Build, tick TASKS.md, write walkthrough, commit, then stop for human approval
---
// turbo
1. Run `npm run lint`
// turbo
2. Run `npx tsc --noEmit`
3. Run `npm run build`. If it fails twice after fixes, STOP and report.
4. Update `design/TASKS.md`: tick only the boxes that are fully done and verified.
5. Write `design/verification/<task-id>/walkthrough.md`: what changed, files touched, decisions applied, gaps or deviations, and links to the screenshots.
6. Confirm `git status` shows changes only in expected paths (never `.env*`, never `prisma/`, never `design/prototype/`).
7. Commit on branch `ui-redesign` with message `ui(<task-id>): <summary>`. Never push.
8. STOP. Post a short summary and the next group's name, then wait for the human to say continue.
