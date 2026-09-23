import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getWorkoutStats } from "@/lib/progress";
import { derivePersonalRecordsWithDeltas } from "@/lib/progress-derived";
import { ProgressClient } from "@/components/progress";

export const metadata = {
  title: "Progress — FitxTracker",
  description: "Track your strength progression, body-weight trends, and personal records.",
};

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [user, rawWeightLogs, rawWorkouts, rawExercises, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { weight: true, fitnessGoal: true },
    }),
    prisma.bodyWeightLog.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    }),
    prisma.workout.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { date: "asc" },
    }),
    prisma.exercise.findMany({
      where: {
        workoutExercises: {
          some: { workout: { userId } },
        },
      },
      orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
    }),
    getWorkoutStats(userId),
  ]);

  // Serialized weight logs
  const initialWeightLogs = rawWeightLogs.map((log) => ({
    id: log.id,
    dateISO: log.date.toISOString(),
    weight: log.weight,
  }));

  // Serialized workouts with exercises and sets
  const workouts = rawWorkouts.map((w) => ({
    id: w.id,
    date: w.date.toISOString(),
    exercises: w.exercises.map((we) => ({
      exercise: {
        id: we.exercise.id,
        name: we.exercise.name,
        muscleGroup: we.exercise.muscleGroup,
      },
      sets: we.sets.map((s) => ({
        reps: s.reps,
        weight: s.weight,
        addedWeight: s.addedWeight,
        completed: s.completed,
      })),
    })),
  }));

  // Serialized exercises list
  const exercises = rawExercises.map((e) => ({
    id: e.id,
    name: e.name,
    muscleGroup: e.muscleGroup,
  }));

  // PRs with deltas
  const prs = derivePersonalRecordsWithDeltas(workouts);

  return (
    <ProgressClient
      initialWeight={user?.weight ?? null}
      initialWeightLogs={initialWeightLogs}
      workouts={workouts}
      exercises={exercises}
      prs={prs}
      stats={stats}
    />
  );
}
