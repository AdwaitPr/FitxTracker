import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { calculateRecoveryScore } from "@/lib/alerts";
import { WorkoutDetailClient } from "@/components/workouts";
import {
  deriveWorkoutVolume,
  derivePrimaryMuscle,
  deriveTopSet,
  deriveAvgRpe,
  getMuscleTone,
} from "@/lib/workout-derived";
import type { DetailWorkoutData } from "@/components/workouts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await prisma.workout.findUnique({
    where: { id },
    select: { name: true },
  });

  return {
    title: workout ? `${workout.name} — FitxTracker` : "Workout Detail — FitxTracker",
    description: "Detailed view of exercises, sets, weights, and session performance.",
  };
}

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const { id } = await params;

  const workout = await prisma.workout.findUnique({
    where: { id, userId },
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

  if (!workout) notFound();

  // Date boundaries for daily facts
  const workoutDate = new Date(workout.date);
  const startOfDay = new Date(workoutDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(workoutDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Parallel fetch: all workout IDs in compound order, daily recovery, weight log
  const [allUserWorkouts, dailyRecovery, bodyWeightLog] = await Promise.all([
    prisma.workout.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      select: { id: true },
    }),
    prisma.dailyRecovery.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    }),
    prisma.bodyWeightLog.findFirst({
      where: {
        userId,
        date: { lte: endOfDay },
      },
      orderBy: { date: "desc" },
      select: { weight: true },
    }),
  ]);

  const currentIdx = allUserWorkouts.findIndex((w) => w.id === id);
  const prevWorkout =
    currentIdx >= 0 && currentIdx < allUserWorkouts.length - 1
      ? allUserWorkouts[currentIdx + 1]
      : null;
  const nextWorkout = currentIdx > 0 ? allUserWorkouts[currentIdx - 1] : null;

  const volume = deriveWorkoutVolume(workout.exercises);
  const primaryMuscle = derivePrimaryMuscle(workout.exercises);
  const topSet = deriveTopSet(workout.exercises);
  const muscleTone = getMuscleTone(primaryMuscle);
  const avgRpe = deriveAvgRpe(workout.exercises);

  const recoveryThatDay = dailyRecovery
    ? {
        score: calculateRecoveryScore(dailyRecovery),
        label: dailyRecovery.sleepQuality || "Logged",
      }
    : null;

  const serializedWorkout: DetailWorkoutData = {
    id: workout.id,
    name: workout.name,
    dateISO: workout.date.toISOString(),
    duration: workout.duration,
    notes: workout.notes,
    createdAtISO: workout.createdAt.toISOString(),
    muscle: primaryMuscle,
    muscleTone,
    volume,
    topSet,
    avgRpe,
    exercises: workout.exercises.map((we) => ({
      id: we.id,
      order: we.order,
      notes: we.notes,
      exercise: {
        id: we.exercise.id,
        name: we.exercise.name,
        muscleGroup: we.exercise.muscleGroup,
        equipment: we.exercise.equipment,
      },
      sets: we.sets.map((s) => ({
        id: s.id,
        order: s.order,
        reps: s.reps,
        weight: s.weight,
        restTime: s.restTime,
        completed: s.completed,
        variationType: s.variationType,
        tempo: s.tempo,
        addedWeight: s.addedWeight,
        perceivedDifficulty: s.perceivedDifficulty,
      })),
    })),
  };

  return (
    <WorkoutDetailClient
      workout={serializedWorkout}
      prevWorkoutId={prevWorkout?.id ?? null}
      nextWorkoutId={nextWorkout?.id ?? null}
      recoveryThatDay={recoveryThatDay}
      bodyWeight={bodyWeightLog?.weight ?? null}
    />
  );
}
