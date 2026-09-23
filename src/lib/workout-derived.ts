import type { MuscleGlyphName } from "@/components/ui/muscle-glyph";
import type { TagTone } from "@/components/ui/tag";
import { normalizeMuscleGroup } from "@/components/dashboard/workout-cover";
export { normalizeMuscleGroup };

export const CANONICAL_MUSCLE_GROUPS: MuscleGlyphName[] = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
];

export const MUSCLE_TONES: Record<MuscleGlyphName, TagTone> = {
  Chest: "violet",
  Back: "cyan",
  Legs: "pink",
  Shoulders: "amber",
  Arms: "green",
  Core: "amber",
  Cardio: "cyan",
};

export function getMuscleTone(muscle?: string | null): TagTone {
  const norm = normalizeMuscleGroup(muscle);
  return MUSCLE_TONES[norm] ?? "violet";
}

export function formatVolume(volume: number): string {
  if (volume <= 0) return "Bodyweight";
  return `${volume.toLocaleString()} kg`;
}

export function deriveWorkoutVolume(
  exercises: Array<{
    sets: Array<{ reps: number; weight: number; completed?: boolean }>;
  }>
): number {
  let vol = 0;
  for (const ex of exercises) {
    for (const s of ex.sets) {
      if (typeof s.reps === "number" && typeof s.weight === "number") {
        vol += s.reps * s.weight;
      }
    }
  }
  return Math.round(vol);
}

export function derivePrimaryMuscle(
  exercises: Array<{
    exercise: { muscleGroup: string };
    sets?: Array<unknown>;
  }>
): MuscleGlyphName {
  if (!exercises.length) return "Chest";

  const counts = new Map<string, number>();
  for (const ex of exercises) {
    const mg = normalizeMuscleGroup(ex.exercise.muscleGroup);
    const weight = ex.sets?.length || 1;
    counts.set(mg, (counts.get(mg) || 0) + weight);
  }

  let topGroup: MuscleGlyphName = "Chest";
  let maxCount = -1;
  for (const [mg, count] of counts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      topGroup = mg as MuscleGlyphName;
    }
  }

  return topGroup;
}

export function deriveAvgRpe(
  exercises: Array<{
    sets: Array<{ perceivedDifficulty?: number | null }>;
  }>
): number | null {
  const rpes: number[] = [];
  for (const ex of exercises) {
    for (const s of ex.sets) {
      if (s.perceivedDifficulty != null) {
        rpes.push(s.perceivedDifficulty);
      }
    }
  }
  if (rpes.length === 0) return null;
  return rpes.reduce((a, b) => a + b, 0) / rpes.length;
}

export function deriveTopSet(
  exercises: Array<{
    exercise: { name: string };
    sets: Array<{
      reps: number;
      weight: number;
      completed?: boolean;
    }>;
  }>
): string {
  let topExName = "";
  let topWeight = -1;
  let topReps = 0;

  for (const ex of exercises) {
    for (const s of ex.sets) {
      const w = s.weight || 0;
      const r = s.reps || 0;
      if (w > topWeight || (w === topWeight && r > topReps)) {
        topWeight = w;
        topReps = r;
        topExName = ex.exercise.name;
      }
    }
  }

  if (!topExName) return "No sets logged";
  if (topWeight > 0) {
    return `${topExName} ${topWeight} kg × ${topReps}`;
  }
  return `${topExName} Bodyweight × ${topReps}`;
}

export function formatWeekLabel(dateInput: Date | string, referenceNow = new Date()): string {
  const d = new Date(dateInput);
  const now = new Date(referenceNow);

  // Compute Monday 00:00:00 of the week of `now`
  const currentWeekMonday = new Date(now);
  const currentDay = currentWeekMonday.getDay();
  const currentDiff = currentWeekMonday.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  currentWeekMonday.setDate(currentDiff);
  currentWeekMonday.setHours(0, 0, 0, 0);

  // Compute Monday 00:00:00 of the week of `d`
  const targetWeekMonday = new Date(d);
  const targetDay = targetWeekMonday.getDay();
  const targetDiff = targetWeekMonday.getDate() - targetDay + (targetDay === 0 ? -6 : 1);
  targetWeekMonday.setDate(targetDiff);
  targetWeekMonday.setHours(0, 0, 0, 0);

  const diffMs = currentWeekMonday.getTime() - targetWeekMonday.getTime();
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));

  if (diffWeeks <= 0) return "This week";
  if (diffWeeks === 1) return "Last week";
  return `${diffWeeks} weeks ago`;
}

export function formatRelativeDate(dateInput: Date | string, referenceNow = new Date()): string {
  const d = new Date(dateInput);
  const now = new Date(referenceNow);

  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `${diffDays}d ago`;
  if (diffDays >= 7 && diffDays < 14) return "1w ago";
  if (diffDays >= 14 && diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDisplayDate(
  dateInput: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(dateInput);
  return d.toLocaleDateString("en-US", options ?? {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
