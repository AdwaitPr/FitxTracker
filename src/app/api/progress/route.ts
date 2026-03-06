import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
    getWeeklyVolume,
    getExerciseProgression,
    getPersonalRecords,
    getWorkoutStats,
} from "@/lib/progress";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") || "overview";
        const exerciseId = searchParams.get("exerciseId");

        switch (type) {
            case "overview": {
                const [stats, prs, weeklyVolume] = await Promise.all([
                    getWorkoutStats(session.user.id),
                    getPersonalRecords(session.user.id),
                    getWeeklyVolume(session.user.id, 8),
                ]);
                return NextResponse.json({ stats, prs: prs.slice(0, 10), weeklyVolume });
            }

            case "exercise": {
                if (!exerciseId) {
                    return NextResponse.json(
                        { error: "exerciseId required" },
                        { status: 400 }
                    );
                }
                const progression = await getExerciseProgression(
                    session.user.id,
                    exerciseId
                );
                return NextResponse.json({ progression });
            }

            case "exercises": {
                // Get exercises the user has actually performed
                const userExercises = await prisma.exercise.findMany({
                    where: {
                        workoutExercises: {
                            some: { workout: { userId: session.user.id } },
                        },
                    },
                    orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
                });
                return NextResponse.json({ exercises: userExercises });
            }

            default:
                return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error fetching progress:", error);
        return NextResponse.json(
            { error: "Failed to fetch progress" },
            { status: 500 }
        );
    }
}
