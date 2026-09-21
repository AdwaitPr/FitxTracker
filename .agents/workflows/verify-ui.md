---
description: Run the app, check touched routes in the browser at 4 viewports in light and dark, save screenshots
---
1. Ensure the dev server is running on http://localhost:3000 (`npm run dev`, background). Reuse it if already up.
2. If the prototype reference is not running, start it: `cd design/prototype && npm install && npm run dev -- --port 5173` (background). Its route format is `http://localhost:5173/#/<route>`.
3. Sign in. If no test user exists, register one at /register: email `qa@fitx.local`, password `QaTest#1234`. Create sample data through the UI where the route needs it (one workout, one recovery entry).
4. For each route touched by the current group, use the browser to open the real page and the matching prototype page at these viewports: 360x800, 768x1024, 1280x800, 1600x900. Repeat each in light and dark theme.
5. Check and record for each: no console errors, no failed network requests, no horizontal page scroll, focus rings visible when tabbing, all interactive targets at least 44px on 360px width, text readable in both themes.
6. Compare the real page against the prototype page for spacing, radii, shadows, colours, typography and tag tints. List every visible difference.
7. Save screenshots to `design/verification/<task-id>/` named `<route>-<viewport>-<theme>.png`, and write findings to `design/verification/<task-id>/findings.md`.
8. Fix every difference that is not intentional (intentional ones are listed in DECISIONS.md). Re-run steps 4 to 7 once. If differences remain, list them for the human.
