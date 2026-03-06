import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// POST - Create a new workout
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, notes, exercises } = body;

        if (!name || !exercises || exercises.length === 0) {
            return NextResponse.json(
                { error: "Workout name and at least one exercise are required" },
                { status: 400 }
            );
        }

        const workout = await prisma.workout.create({
            data: {
                name,
                notes: notes || null,
                userId: session.user.id,
                exercises: {
                    create: exercises.map(
                        (
                            ex: {
                                exerciseId: string;
                                notes?: string;
                                sets: {
                                    reps: number;
                                    weight: number;
                                    restTime?: number;
                                    variationType?: string;
                                    tempo?: string;
                                    addedWeight?: number;
                                    perceivedDifficulty?: number;
                                }[];
                            },
                            exIdx: number
                        ) => ({
                            exerciseId: ex.exerciseId,
                            order: exIdx,
                            notes: ex.notes || null,
                            sets: {
                                create: ex.sets.map(
                                    (
                                        set: {
                                            reps: number;
                                            weight: number;
                                            restTime?: number;
                                            variationType?: string;
                                            tempo?: string;
                                            addedWeight?: number;
                                            perceivedDifficulty?: number;
                                        },
                                        setIdx: number
                                    ) => ({
                                        order: setIdx,
                                        reps: set.reps,
                                        weight: set.weight,
                                        restTime: set.restTime || null,
                                        completed: true,
                                        variationType: set.variationType || null,
                                        tempo: set.tempo || null,
                                        addedWeight: set.addedWeight || null,
                                        perceivedDifficulty: set.perceivedDifficulty || null,
                                    })
                                ),
                            },
                        })
                    ),
                },
            },
            include: {
                exercises: {
                    include: {
                        exercise: true,
                        sets: true,
                    },
                },
            },
        });

        return NextResponse.json(workout, { status: 201 });
    } catch (error) {
        console.error("Error creating workout:", error);
        return NextResponse.json(
            { error: "Failed to create workout" },
            { status: 500 }
        );
    }
}

// GET - List user's workouts
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const workouts = await prisma.workout.findMany({
            where: { userId: session.user.id },
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
        });

        return NextResponse.json(workouts);
    } catch (error) {
        console.error("Error fetching workouts:", error);
        return NextResponse.json(
            { error: "Failed to fetch workouts" },
            { status: 500 }
        );
    }
}
