import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { calculateRecoveryScore, getWorkoutRecommendation } from "@/lib/alerts";
import type { Alert } from "@/lib/alerts";
import {
  calculateStreak,
  calculateVolumeBars,
} from "@/lib/progress-derived";
import { ShellRail } from "@/components/layout/shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  HeroBanner,
  StatChipRow,
  RecentWorkouts,
  WorkoutTable,
  StatisticCard,
  RecoveryCard,
} from "@/components/dashboard";
import type { DashboardWorkout } from "@/components/dashboard/recent-workouts";
import type { RecoveryFactor } from "@/components/dashboard/recovery-card";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fiveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    workoutsThisWeek,
    workoutsThisMonth,
    lastWorkout,
    user,
    latestWeightLog,
    todayRecovery,
    recentWorkoutsRaw,
    allWorkoutsForVolume,
    allWorkoutDates,
  ] = await Promise.all([
    prisma.workout.count({
      where: { userId, date: { gte: startOfWeek } },
    }),
    prisma.workout.count({
      where: { userId, date: { gte: startOfMonth } },
    }),
    prisma.workout.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      select: { date: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        weight: true,
        height: true,
        fitnessGoal: true,
      },
    }),
    prisma.bodyWeightLog.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    }),
    prisma.dailyRecovery.findFirst({
      where: { userId, date: { gte: today } },
      orderBy: { date: "desc" },
    }),
    prisma.workout.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 8,
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    }),
    prisma.workout.findMany({
      where: { userId, date: { gte: fiveMonthsAgo } },
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
    prisma.workout.findMany({
      where: { userId },
      select: { date: true },
    }),
  ]);

  // Derived stats
  const daysSinceLastWorkout = lastWorkout
    ? Math.floor(
        (now.getTime() - new Date(lastWorkout.date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const currentWeight = latestWeightLog?.weight ?? user?.weight ?? null;
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "FT";

  const userName = user?.name || user?.email?.split("@")[0] || "Athlete";

  // Streak
  const { streakText } = calculateStreak(allWorkoutDates.map((w) => w.date));

  // Volume Bars
  const volumeRecords = allWorkoutsForVolume.map((w) => ({
    date: w.date,
    sets: w.exercises.flatMap((e) => e.sets),
  }));
  const { volumeByWeek, volumeByMonth } = calculateVolumeBars(volumeRecords);

  // Recovery Alert & Factors
  let alert: Alert | null = null;
  let recoveryScore: number | null = null;
  let recoveryFactors: RecoveryFactor[] | null = null;

  if (todayRecovery) {
    recoveryScore = calculateRecoveryScore(todayRecovery);
    alert = getWorkoutRecommendation(todayRecovery);

    const sleepHours = todayRecovery.sleepHours ?? 0;
    const sleepScore = Math.min(Math.round((sleepHours / 8) * 100), 100);

    const qualityScoreMap: Record<string, number> = {
      Poor: 25,
      Fair: 50,
      Good: 75,
      Excellent: 100,
    };
    const qualityVal = todayRecovery.sleepQuality || "Good";
    const qualityScore = qualityScoreMap[qualityVal] || 75;

    const stressVal = todayRecovery.stressLevel ?? 3;
    const stressScore = Math.max(
      0,
      Math.min(100, Math.round(((10 - stressVal) / 10) * 100))
    );
    const stressText = `${stressVal}/10 (${
      stressVal <= 3 ? "Low" : stressVal <= 6 ? "Moderate" : "High"
    })`;

    const gutScoreMap: Record<string, number> = {
      Good: 100,
      Bloated: 50,
      Uncomfortable: 20,
    };
    const gutVal = todayRecovery.gutStatus || "Good";
    const gutScore = gutScoreMap[gutVal] || 100;

    recoveryFactors = [
      {
        id: "sleep",
        label: "Sleep Duration",
        value: `${sleepHours} h`,
        score: sleepScore,
      },
      {
        id: "quality",
        label: "Sleep Quality",
        value: qualityVal,
        score: qualityScore,
      },
      {
        id: "stress",
        label: "Stress Level",
        value: stressText,
        score: stressScore,
      },
      {
        id: "gut",
        label: "Gut Health",
        value: gutVal,
        score: gutScore,
      },
    ];
  }

  // Workouts transform
  const workoutsList: DashboardWorkout[] = recentWorkoutsRaw.map((w) => {
    const allSets = w.exercises.flatMap((e) => e.sets);
    const setsDone = allSets.filter((s) => s.completed).length;
    const setsTotal = allSets.length;
    const totalVolume = allSets.reduce(
      (acc, s) => acc + s.reps * (s.weight + (s.addedWeight || 0)),
      0
    );

    let topExercise = "";
    let maxExerciseVol = -1;
    for (const we of w.exercises) {
      const exVol = we.sets.reduce(
        (acc, s) => acc + s.reps * (s.weight + (s.addedWeight || 0)),
        0
      );
      if (exVol > maxExerciseVol) {
        maxExerciseVol = exVol;
        topExercise = we.exercise.name;
      }
    }
    if (!topExercise && w.exercises[0]) {
      topExercise = w.exercises[0].exercise.name;
    }

    const primaryMuscle = w.exercises[0]?.exercise.muscleGroup || "Chest";

    return {
      id: w.id,
      name: w.name,
      date: w.date,
      duration: w.duration,
      muscle: primaryMuscle,
      exercisesCount: w.exercises.length,
      setsDone,
      setsTotal,
      topExercise,
      totalVolume,
    };
  });

  const hasWorkouts = workoutsList.length > 0;

  return (
    <>
      <div className="space-y-6">
        {/* 1. Hero Banner */}
        <HeroBanner level={alert?.level} />

        {/* 2. Stat Chips Row */}
        <StatChipRow
          workoutsThisWeek={workoutsThisWeek}
          workoutsThisMonth={workoutsThisMonth}
          bodyWeight={currentWeight}
          height={user?.height}
          lastWorkoutDate={lastWorkout?.date}
          daysSinceLastWorkout={daysSinceLastWorkout}
        />

        {/* 3. Recent Workouts Carousel & Table OR Empty State */}
        {hasWorkouts ? (
          <>
            <RecentWorkouts workouts={workoutsList} />
            <WorkoutTable workouts={workoutsList} />
          </>
        ) : (
          <div className="mt-9">
            <EmptyState
              icon={<Dumbbell size={32} className="text-primary" />}
              title="No workouts logged yet"
              body="Start your training journey by logging your first workout session to track your volume, reps, and performance progress over time."
              action={
                <Link href="/workouts/new">
                  <Button variant="primary" size="md">
                    Log First Workout
                  </Button>
                </Link>
              }
            />
          </div>
        )}
      </div>

      {/* 4. Right Rail Slot */}
      <ShellRail sticky>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
          <StatisticCard
            userInitials={userInitials}
            userName={userName}
            workoutsThisWeek={workoutsThisWeek}
            weeklyGoal={4}
            streakText={streakText}
            volumeByWeek={volumeByWeek}
            volumeByMonth={volumeByMonth}
          />
          <div id="recovery-card">
            <RecoveryCard
              score={recoveryScore}
              alert={alert}
              factors={recoveryFactors}
            />
          </div>
        </div>
      </ShellRail>
    </>
  );
}
