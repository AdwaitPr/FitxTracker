import { prisma } from "@/lib/prisma";

/**
 * Get weekly volume by muscle group for the last N weeks
 */
export async function getWeeklyVolume(userId: string, weeks: number = 8) {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - weeks * 7);

    const workouts = await prisma.workout.findMany({
        where: {
            userId,
            date: { gte: startDate },
        },
        include: {
            exercises: {
                include: {
                    exercise: true,
                    sets: true,
                },
            },
        },
        orderBy: { date: "asc" },
    });

    // Group by week
    const weeklyData: Record<
        string,
        Record<string, number>
    > = {};

    for (const workout of workouts) {
        const weekStart = getWeekStart(new Date(workout.date));
        const weekKey = weekStart.toISOString().split("T")[0];

        if (!weeklyData[weekKey]) weeklyData[weekKey] = {};

        for (const we of workout.exercises) {
            const mg = we.exercise.muscleGroup;
            const volume = we.sets.reduce(
                (acc, set) => acc + set.reps * (set.weight + (set.addedWeight || 0)),
                0
            );
            weeklyData[weekKey][mg] = (weeklyData[weekKey][mg] || 0) + volume;
        }
    }

    return weeklyData;
}

/**
 * Get exercise progression (weight over time) for a specific exercise
 */
export async function getExerciseProgression(
    userId: string,
    exerciseId: string
) {
    const workoutExercises = await prisma.workoutExercise.findMany({
        where: {
            exerciseId,
            workout: { userId },
        },
        include: {
            workout: { select: { date: true } },
            sets: { orderBy: { order: "asc" } },
        },
        orderBy: { workout: { date: "asc" } },
    });

    return workoutExercises.map((we) => {
        const maxWeight = Math.max(...we.sets.map((s) => s.weight + (s.addedWeight || 0)));
        const totalVolume = we.sets.reduce(
            (acc, s) => acc + s.reps * (s.weight + (s.addedWeight || 0)),
            0
        );
        const bestSet = we.sets.reduce(
            (best, s) => {
                const w = s.weight + (s.addedWeight || 0);
                return w > best.weight ? { weight: w, reps: s.reps } : best;
            },
            { weight: 0, reps: 0 }
        );

        return {
            date: we.workout.date,
            maxWeight,
            totalVolume,
            bestSet,
            sets: we.sets.length,
        };
    });
}

/**
 * Detect personal records
 */
export async function getPersonalRecords(userId: string) {
    const workouts = await prisma.workout.findMany({
        where: { userId },
        include: {
            exercises: {
                include: {
                    exercise: true,
                    sets: true,
                },
            },
        },
        orderBy: { date: "asc" },
    });

    const records: Record<
        string,
        { exerciseName: string; weight: number; reps: number; date: Date }
    > = {};

    for (const workout of workouts) {
        for (const we of workout.exercises) {
            for (const set of we.sets) {
                const w = set.weight + (set.addedWeight || 0);
                const key = we.exercise.id;
                if (!records[key] || w > records[key].weight) {
                    records[key] = {
                        exerciseName: we.exercise.name,
                        weight: w,
                        reps: set.reps,
                        date: workout.date,
                    };
                }
            }
        }
    }

    return Object.values(records).sort((a, b) => b.weight - a.weight);
}

/**
 * Get overall workout stats
 */
export async function getWorkoutStats(userId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalWorkouts, recentWorkouts, allSets] = await Promise.all([
        prisma.workout.count({ where: { userId } }),
        prisma.workout.count({
            where: { userId, date: { gte: thirtyDaysAgo } },
        }),
        prisma.set.findMany({
            where: { workoutExercise: { workout: { userId } } },
        }),
    ]);

    const totalVolume = allSets.reduce(
        (acc, s) => acc + s.reps * (s.weight + (s.addedWeight || 0)),
        0
    );
    const totalSets = allSets.length;

    return {
        totalWorkouts,
        recentWorkouts,
        totalVolume: Math.round(totalVolume),
        totalSets,
    };
}

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
}
