import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/progress-derived";
import { getPersonalRecords } from "@/lib/progress";
import { ProfileClient } from "@/components/profile";

export const metadata: Metadata = {
  title: "Profile — FitxTracker",
  description: "Account settings, personal metrics, and body-weight log.",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      height: true,
      weight: true,
      age: true,
      gender: true,
      fitnessGoal: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const [workouts, prs, weightLogs] = await Promise.all([
    prisma.workout.findMany({
      where: { userId: session.user.id },
      select: {
        date: true,
        exercises: {
          select: {
            sets: {
              select: {
                reps: true,
                weight: true,
                addedWeight: true,
              },
            },
          },
        },
      },
    }),
    getPersonalRecords(session.user.id),
    prisma.bodyWeightLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 15,
    }),
  ]);

  let totalVolume = 0;
  const workoutDates: Date[] = [];
  for (const w of workouts) {
    workoutDates.push(new Date(w.date));
    for (const we of w.exercises) {
      for (const s of we.sets) {
        totalVolume += s.reps * (s.weight + (s.addedWeight || 0));
      }
    }
  }

  const streak = calculateStreak(workoutDates);

  return (
    <ProfileClient
      user={{
        ...user,
        createdAt: user.createdAt.toISOString(),
      }}
      initialWeightLogs={weightLogs.map((l) => ({
        id: l.id,
        dateISO: l.date.toISOString(),
        weight: l.weight,
      }))}
      stats={{
        workoutCount: workouts.length,
        totalVolume: Math.round(totalVolume),
        prCount: Object.keys(prs).length,
        streakWeeks: streak.streakWeeks,
        streakText: streak.streakText,
      }}
    />
  );
}
