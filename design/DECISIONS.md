# Decisions (verified against prisma/schema.prisma and src/lib)

1. Body weight: BodyWeightLog EXISTS (date, weight, notes, userId) -> derive for D4, U4, P1, H10.
   No dedicated POST route was found (api/progress is GET only; api/profile has GET/PUT).
   Check whether profile PUT writes a BodyWeightLog. If not, the log-weight modal is DISABLED
   (render it read-only) until the human approves one minimal POST route.
2. Set columns all EXIST. Real names: restTime (s), completed, variationType, tempo, addedWeight,
   perceivedDifficulty (= RPE). Use these names, not the prototype's.
   Workout has duration, notes, date, createdAt, updatedAt.
3. User has height, weight, age (Int, not DOB), gender, fitnessGoal, createdAt.
   No weeklyGoal: use a constant default of 4 for now.
4. DELETE /api/workouts/[id] exists: wire delete. No edit route: REMOVE "Edit".
   No change-password, no delete-account: REMOVE both. Profile PUT exists.
5. alerts.ts: getWorkoutRecommendation returns ONE Alert {level: optimal|normal|warning|critical,
   message, suggestedIntensity, icon}. Thresholds 80/60/40 match the prototype. The 40/30/20/10
   weights are inline (not exported): render as static copy. Do not edit alerts.ts.
   Notification bell = show today's single alert; no counter, no persistence.
6. progress.ts exports getWeeklyVolume, getExerciseProgression, getPersonalRecords,
   getWorkoutStats. Read them first. If e1RM or streak are missing, add a NEW pure helper file
   (e.g. src/lib/progress-derived.ts). Do NOT modify progress.ts.
7. CogniType: SessionMetrics persists meanInterKeyLatency, latencyStdDev, pauseEntropy, errorRate,
   correctionLatency, switchCount, switchTimeRatio, resumeLatency, fatigueSlope,
   focusStabilityScore. Sub-scores come from computeFocusScore's FocusBreakdown: render ITS real
   fields, not the prototype's invented sub-score names. Per-keystroke data is in KeystrokeEvent,
   so the sparkline is derived from it. SOUND_MODES contains emoji: show icons instead, leave
   the lib untouched.
8. REMOVE: hearts/favourites, custom exercises, units/reminders/email toggles, change avatar,
   demo-login button, dev recovery switcher, Edit button.
   Global search = navigation to /exercises?q= or /workouts/history?q= (no new routes).
   Landing stats: replace unverifiable numbers with non-numeric claims.
   Testimonials: static marketing copy with anonymised roles, not full names.
9. Menus (three dots): wire only real actions (View -> /workouts/[id], Delete -> existing
   DELETE). Remove the menu where nothing real exists (e.g. stat chips).
10. "Repeat workout" / "Use last workout": client prefill via /workouts/new?from=<id>, reading
    the workout through the existing GET /api/workouts/[id]. No new route.
