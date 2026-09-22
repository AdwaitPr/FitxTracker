/**
 * Pure derived calculation helpers for progress, streak, and volume bucketing.
 * Keeps src/lib/progress.ts untouched per project rules.
 */

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
