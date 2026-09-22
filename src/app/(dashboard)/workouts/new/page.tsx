import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { WorkoutLoggerClient } from "@/components/workouts";

export const metadata = {
  title: "New Workout — FitxTracker",
  description: "Log today's workout session, record sets, weights, rest, and track real-time volume.",
};

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const { from: fromId } = await searchParams;

  const [initialExercises, lastWorkout, prefillWorkout] = await Promise.all([
    prisma.exercise.findMany({
      orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        muscleGroup: true,
        equipment: true,
      },
    }),
    prisma.workout.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: { orderBy: { order: "asc" } },
          },
          orderBy: { order: "asc" },
        },
      },
    }),
    fromId
      ? prisma.workout.findUnique({
          where: { id: fromId, userId },
          include: {
            exercises: {
              include: {
                exercise: true,
                sets: { orderBy: { order: "asc" } },
              },
              orderBy: { order: "asc" },
            },
          },
        })
      : null,
  ]);

  return (
    <WorkoutLoggerClient
      initialExercises={initialExercises}
      lastWorkout={lastWorkout}
      prefillWorkout={prefillWorkout}
    />
  );
}
