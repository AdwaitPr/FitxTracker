/**
 * Pure derivation helpers for Progress analytics, streak, and volume bucketing.
 * Does not touch or modify src/lib/progress.ts per project rules.
 */

// ---------------------------------------------------------------------------
// Group 5 & Dashboard Shared Types & Functions
// ---------------------------------------------------------------------------

export interface WorkoutVolumeRecord {
  date: Date;
  sets: {
    reps: number;
    weight: number;
    addedWeight?: number | null;
  }[];
}

export interface VolumeBarItem {
  label: string;
  value: number; // in thousand kg (e.g. 24.5)
}

/**
 * Calculates the weekly workout streak.
 * Counts consecutive weeks (Mon-Sun or Sun-Sat) with at least 1 workout.
 */
export function calculateStreak(workoutDates: Date[]): {
  streakWeeks: number;
  streakText: string;
} {
  if (!workoutDates.length) {
    return { streakWeeks: 0, streakText: "Start your streak today" };
  }

  const sorted = [...workoutDates].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const getWeekId = (d: Date): string => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    // Align to Monday
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return `${monday.getFullYear()}-W${Math.ceil((monday.getDate() + monday.getMonth() * 31) / 7)}`;
  };

  const currentWeekId = getWeekId(new Date());
  const previousWeekDate = new Date();
  previousWeekDate.setDate(previousWeekDate.getDate() - 7);
  const prevWeekId = getWeekId(previousWeekDate);

  const weeksWithWorkouts = new Set<string>();
  for (const date of sorted) {
    weeksWithWorkouts.add(getWeekId(new Date(date)));
  }

  let streak = 0;
  let checkDate = new Date();

  // If this week has workouts, start from this week; otherwise if last week had workouts, start from last week
  if (weeksWithWorkouts.has(currentWeekId)) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 7);
  } else if (weeksWithWorkouts.has(prevWeekId)) {
    streak = 1;
    checkDate = previousWeekDate;
    checkDate.setDate(checkDate.getDate() - 7);
  } else {
    return { streakWeeks: 0, streakText: "Start your streak today" };
  }

  // Count backwards
  while (true) {
    const weekId = getWeekId(checkDate);
    if (weeksWithWorkouts.has(weekId)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      break;
    }
  }

  const streakText =
    streak === 1 ? "1-week streak" : `${streak}-week streak`;
  return { streakWeeks: streak, streakText };
}

/**
 * Calculates 5-week and 5-month volume bars for the StatisticCard chart.
 * Returns values formatted in thousand kg ('000 kg).
 */
export function calculateVolumeBars(workouts: WorkoutVolumeRecord[]): {
  volumeByWeek: VolumeBarItem[];
  volumeByMonth: VolumeBarItem[];
} {
  const now = new Date();

  // 1. Five weeks
  const weekBars: VolumeBarItem[] = [];
  for (let i = 4; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - i * 7 - ((now.getDay() + 6) % 7));
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const weekWorkouts = workouts.filter((w) => {
      const d = new Date(w.date);
      return d >= start && d < end;
    });

    let totalKg = 0;
    for (const w of weekWorkouts) {
      for (const s of w.sets) {
        totalKg += s.reps * (s.weight + (s.addedWeight || 0));
      }
    }

    const label = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    weekBars.push({
      label,
      value: Math.round((totalKg / 1000) * 10) / 10,
    });
  }

  // 2. Five months
  const monthBars: VolumeBarItem[] = [];
  for (let i = 4; i >= 0; i--) {
    const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(target.getFullYear(), target.getMonth(), 1);
    const end = new Date(target.getFullYear(), target.getMonth() + 1, 1);

    const monthWorkouts = workouts.filter((w) => {
      const d = new Date(w.date);
      return d >= start && d < end;
    });

    let totalKg = 0;
    for (const w of monthWorkouts) {
      for (const s of w.sets) {
        totalKg += s.reps * (s.weight + (s.addedWeight || 0));
      }
    }

    const label = start.toLocaleDateString("en-US", { month: "short" });

    monthBars.push({
      label,
      value: Math.round((totalKg / 1000) * 10) / 10,
    });
  }

  return {
    volumeByWeek: weekBars,
    volumeByMonth: monthBars,
  };
}

// ---------------------------------------------------------------------------
// Group 9 Progress Analytics Types & Functions
// ---------------------------------------------------------------------------

export type ProgressRange = "4W" | "3M" | "6M" | "1Y";

export const RANGE_CONFIG: Record<ProgressRange, { weeks: number; label: string }> = {
  "4W": { weeks: 4, label: "4 weeks" },
  "3M": { weeks: 13, label: "3 months" },
  "6M": { weeks: 26, label: "6 months" },
  "1Y": { weeks: 52, label: "1 year" },
};

/**
 * Epley formula for estimated 1 Rep Max: weight * (1 + reps / 30)
 */
export function calculateE1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return Math.round(weight);
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Calculate the cutoff Date for a given time range.
 */
export function getRangeCutoffDate(range: ProgressRange, referenceNow = new Date()): Date {
  const cutoff = new Date(referenceNow);
  const weeks = RANGE_CONFIG[range].weeks;
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff;
}

export interface RawSetData {
  reps: number;
  weight: number;
  addedWeight?: number | null;
  completed?: boolean;
}

export interface RawWorkoutExerciseData {
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
  };
  sets: RawSetData[];
}

export interface RawWorkoutData {
  id: string;
  date: Date | string;
  exercises: RawWorkoutExerciseData[];
}

/**
 * Build calendar day counts from workout dates for CalendarHeatmap.
 */
export function buildHeatmapDays(
  workoutDates: (Date | string)[],
  weeks = 52,
  referenceNow = new Date()
): number[] {
  const totalDays = weeks * 7;
  const days = new Array<number>(totalDays).fill(0);

  const now = new Date(referenceNow);
  now.setHours(23, 59, 59, 999);

  for (const d of workoutDates) {
    const date = new Date(d);
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) continue;
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays >= 0 && diffDays < totalDays) {
      // Days array is ordered oldest to newest, so index is totalDays - 1 - diffDays
      const index = totalDays - 1 - diffDays;
      days[index] = (days[index] || 0) + 1;
    }
  }

  return days;
}

/**
 * Derive muscle group distribution slices for the Donut chart.
 */
export function deriveMuscleDistribution(
  workouts: RawWorkoutData[],
  range?: ProgressRange,
  referenceNow = new Date()
): Array<{ label: string; value: number; color: string }> {
  const cutoff = range ? getRangeCutoffDate(range, referenceNow) : null;
  const counts: Record<string, number> = {};

  for (const w of workouts) {
    const d = new Date(w.date);
    if (cutoff && d < cutoff) continue;

    for (const we of w.exercises) {
      const mg = we.exercise.muscleGroup || "Chest";
      const setsCount = we.sets.length;
      counts[mg] = (counts[mg] || 0) + setsCount;
    }
  }

  const MUSCLE_COLORS: Record<string, string> = {
    Chest: "var(--primary)",
    Back: "var(--tag-cyan-fg)",
    Legs: "var(--tag-green-fg)",
    Shoulders: "var(--tag-amber-fg)",
    Arms: "var(--tag-pink-fg)",
    Core: "#a78bfa",
    Cardio: "#f43f5e",
  };

  const labels = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"];
  const slices: Array<{ label: string; value: number; color: string }> = [];

  for (const label of labels) {
    const val = counts[label] || 0;
    if (val > 0) {
      slices.push({
        label,
        value: val,
        color: MUSCLE_COLORS[label] || "var(--primary)",
      });
    }
  }

  // If user has other custom muscle groups
  for (const [key, val] of Object.entries(counts)) {
    if (!labels.includes(key) && val > 0) {
      slices.push({
        label: key,
        value: val,
        color: "var(--ink-muted)",
      });
    }
  }

  return slices;
}

/**
 * Compute exercise progression series (Volume + e1RM over time) for a specific exercise.
 */
export function deriveExerciseProgression(
  workouts: RawWorkoutData[],
  exerciseId: string,
  range?: ProgressRange,
  referenceNow = new Date()
): {
  labels: string[];
  vol: number[];
  e1rm: number[];
} {
  const cutoff = range ? getRangeCutoffDate(range, referenceNow) : null;

  const points: Array<{
    date: Date;
    label: string;
    vol: number;
    e1rm: number;
  }> = [];

  for (const w of workouts) {
    const d = new Date(w.date);
    if (cutoff && d < cutoff) continue;

    const matchedExercises = w.exercises.filter((we) => we.exercise.id === exerciseId);
    if (matchedExercises.length === 0) continue;

    let sessionVolume = 0;
    let maxE1rm = 0;

    for (const we of matchedExercises) {
      for (const s of we.sets) {
        const totalW = s.weight + (s.addedWeight || 0);
        sessionVolume += s.reps * totalW;
        const currentE1rm = calculateE1RM(totalW, s.reps);
        if (currentE1rm > maxE1rm) {
          maxE1rm = currentE1rm;
        }
      }
    }

    if (sessionVolume > 0 || maxE1rm > 0) {
      points.push({
        date: d,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        vol: Math.round(sessionVolume),
        e1rm: maxE1rm,
      });
    }
  }

  points.sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    labels: points.map((p) => p.label),
    vol: points.map((p) => p.vol),
    e1rm: points.map((p) => p.e1rm),
  };
}

/**
 * Compute PR deltas and formatted records for the PR list.
 */
export interface PRDisplayItem {
  id: string;
  exercise: string;
  muscle: string;
  dateISO: string;
  weight: number;
  reps: number;
  e1rm: number;
  delta: string;
  value: string;
}

export function derivePersonalRecordsWithDeltas(
  workouts: RawWorkoutData[]
): PRDisplayItem[] {
  // Map exerciseId -> history of best weights in chronological order
  const historyByExercise: Record<
    string,
    Array<{ date: Date; weight: number; reps: number; exerciseName: string; muscle: string }>
  > = {};

  // Sort workouts chronologically
  const sorted = [...workouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const w of sorted) {
    const d = new Date(w.date);
    for (const we of w.exercises) {
      const exId = we.exercise.id;
      if (!historyByExercise[exId]) {
        historyByExercise[exId] = [];
      }

      for (const s of we.sets) {
        const wVal = s.weight + (s.addedWeight || 0);
        if (wVal > 0 && s.reps > 0) {
          historyByExercise[exId].push({
            date: d,
            weight: wVal,
            reps: s.reps,
            exerciseName: we.exercise.name,
            muscle: we.exercise.muscleGroup || "Chest",
          });
        }
      }
    }
  }

  const result: PRDisplayItem[] = [];

  for (const [exId, list] of Object.entries(historyByExercise)) {
    if (list.length === 0) continue;

    // Find the record and the previous peak before it
    let peakWeight = 0;
    let prevPeak = 0;
    let bestEntry = list[0];

    for (const entry of list) {
      if (entry.weight > peakWeight) {
        prevPeak = peakWeight;
        peakWeight = entry.weight;
        bestEntry = entry;
      }
    }

    const deltaKg = prevPeak > 0 ? peakWeight - prevPeak : 0;
    const deltaStr = deltaKg > 0 ? `+${deltaKg} kg` : "First PR";
    const e1rm = calculateE1RM(bestEntry.weight, bestEntry.reps);

    result.push({
      id: exId,
      exercise: bestEntry.exerciseName,
      muscle: bestEntry.muscle,
      dateISO: bestEntry.date.toISOString(),
      weight: bestEntry.weight,
      reps: bestEntry.reps,
      e1rm,
      delta: deltaStr,
      value: `${bestEntry.weight} kg × ${bestEntry.reps}`,
    });
  }

  // Sort by highest weight descending
  result.sort((a, b) => b.weight - a.weight);
  return result;
}
