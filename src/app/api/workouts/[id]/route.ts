import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// GET - Single workout by ID
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const workout = await prisma.workout.findUnique({
            where: { id, userId: session.user.id },
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

        if (!workout) {
            return NextResponse.json({ error: "Workout not found" }, { status: 404 });
        }

        return NextResponse.json(workout);
    } catch (error) {
        console.error("Error fetching workout:", error);
        return NextResponse.json(
            { error: "Failed to fetch workout" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a workout
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const workout = await prisma.workout.findUnique({
            where: { id, userId: session.user.id },
        });

        if (!workout) {
            return NextResponse.json({ error: "Workout not found" }, { status: 404 });
        }

        await prisma.workout.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting workout:", error);
        return NextResponse.json(
            { error: "Failed to delete workout" },
            { status: 500 }
        );
    }
}
