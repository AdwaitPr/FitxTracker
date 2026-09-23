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

  // Parallel fetch: previous workout, next workout, recovery log, weight log
  const [prevWorkout, nextWorkout, dailyRecovery, bodyWeightLog] =
    await Promise.all([
      prisma.workout.findFirst({
        where: {
          userId,
          date: { lt: workout.date },
          NOT: { id: workout.id },
        },
        orderBy: { date: "desc" },
        select: { id: true },
      }),
      prisma.workout.findFirst({
        where: {
          userId,
          date: { gt: workout.date },
          NOT: { id: workout.id },
        },
        orderBy: { date: "asc" },
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

  const volume = deriveWorkoutVolume(workout.exercises);
  const primaryMuscle = derivePrimaryMuscle(workout.exercises);
  const topSet = deriveTopSet(workout.exercises);
  const muscleTone = getMuscleTone(primaryMuscle);

  const rpeValues = workout.exercises.flatMap((ex) =>
    ex.sets
      .filter(
        (s) =>
          typeof s.perceivedDifficulty === "number" && s.perceivedDifficulty > 0
      )
      .map((s) => s.perceivedDifficulty!)
  );
  const avgRpe =
    rpeValues.length > 0
      ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length
      : null;

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
