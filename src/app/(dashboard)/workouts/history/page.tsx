import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { WorkoutHistoryClient } from "@/components/workouts";
import {
  deriveWorkoutVolume,
  derivePrimaryMuscle,
  deriveTopSet,
  getMuscleTone,
  formatRelativeDate,
  formatDisplayDate,
} from "@/lib/workout-derived";
import type { HistoryWorkoutItem } from "@/components/workouts";
import type { MuscleGlyphName } from "@/components/ui/muscle-glyph";

export const metadata = {
  title: "Workout History — FitxTracker",
  description: "View and filter your past training sessions, volume, and top sets.",
};

export default async function WorkoutHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; range?: string; muscle?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { q, range, muscle } = await searchParams;

  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: { orderBy: { order: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  const serializedWorkouts: HistoryWorkoutItem[] = workouts.map((w) => {
    const volume = deriveWorkoutVolume(w.exercises);
    const primaryMuscle = derivePrimaryMuscle(w.exercises);
    const topSet = deriveTopSet(w.exercises);
    const muscleTone = getMuscleTone(primaryMuscle);

    return {
      id: w.id,
      name: w.name,
      dateISO: w.date.toISOString(),
      duration: w.duration || 0,
      volume,
      topSet,
      muscle: primaryMuscle,
      muscleTone,
      relativeDate: formatRelativeDate(w.date),
      displayDate: formatDisplayDate(w.date),
      exerciseNames: w.exercises.map((e) => e.exercise.name),
    };
  });

  return (
    <WorkoutHistoryClient
      initialWorkouts={serializedWorkouts}
      initialQuery={q || ""}
      initialRange={range || "all"}
      initialMuscle={muscle ? (muscle as MuscleGlyphName) : null}
    />
  );
}
