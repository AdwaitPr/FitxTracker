export type VariationType = "Standard" | "Diamond" | "Weighted" | "Slow-Tempo";

export interface SetRow {
  id: string;
  reps: number | "";
  weight: number | "";
  rest: number;
  done: boolean;
  variation: VariationType;
  tempo: string;
  added: number | "";
  rpe: number | "";
  justDone?: boolean;
}

export interface WorkoutExerciseItem {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
}

export interface Entry {
  id: string;
  exercise: WorkoutExerciseItem;
  sets: SetRow[];
  advanced: boolean;
}

export interface ApiWorkoutSet {
  id: string;
  order: number;
  reps: number;
  weight: number;
  restTime: number | null;
  completed: boolean;
  variationType: string | null;
  tempo: string | null;
  addedWeight: number | null;
  perceivedDifficulty: number | null;
}

export interface ApiWorkoutExercise {
  id: string;
  order: number;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    equipment: string | null;
  };
  sets: ApiWorkoutSet[];
}

export interface ApiWorkout {
  id: string;
  name: string;
  date?: string | Date;
  duration?: number | null;
  notes?: string | null;
  exercises: ApiWorkoutExercise[];
}

let uid = 0;
export const nextId = (prefix = "n"): string => `${prefix}_${Date.now()}_${++uid}`;

export function createDefaultSet(prev?: SetRow): SetRow {
  return {
    id: nextId("s"),
    reps: prev?.reps ?? "",
    weight: prev?.weight ?? "",
    rest: prev?.rest ?? 120,
    done: false,
    variation: prev?.variation ?? "Standard",
    tempo: prev?.tempo ?? "",
    added: prev?.added ?? "",
    rpe: "",
    justDone: false,
  };
}

export function mapApiWorkoutToDraft(workout: ApiWorkout): {
  name: string;
  notes: string;
  duration: number | "";
  entries: Entry[];
} {
  return {
    name: workout.name ? `${workout.name} (Copy)` : "Workout Template",
    notes: workout.notes || "",
    duration: typeof workout.duration === "number" ? workout.duration : 60,
    entries: (workout.exercises || []).map((we) => {
      const sets: SetRow[] = (we.sets || []).map((s) => ({
        id: nextId("s"),
        reps: typeof s.reps === "number" ? s.reps : "",
        weight: typeof s.weight === "number" ? s.weight : "",
        rest: typeof s.restTime === "number" ? s.restTime : 120,
        done: false, // Reset completion for template usage
        variation:
          s.variationType === "Diamond" ||
          s.variationType === "Weighted" ||
          s.variationType === "Slow-Tempo"
            ? s.variationType
            : "Standard",
        tempo: s.tempo || "",
        added: typeof s.addedWeight === "number" ? s.addedWeight : "",
        rpe: typeof s.perceivedDifficulty === "number" ? s.perceivedDifficulty : "",
        justDone: false,
      }));

      const hasAdvancedValues = sets.some(
        (s) =>
          s.variation !== "Standard" ||
          s.tempo !== "" ||
          s.added !== "" ||
          s.rpe !== ""
      );

      return {
        id: nextId("e"),
        exercise: {
          id: we.exercise.id,
          name: we.exercise.name,
          muscleGroup: we.exercise.muscleGroup,
          equipment: we.exercise.equipment,
        },
        sets: sets.length > 0 ? sets : [createDefaultSet()],
        advanced: hasAdvancedValues,
      };
    }),
  };
}
