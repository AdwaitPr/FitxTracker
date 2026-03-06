import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Search/list exercises
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "";
        const muscleGroup = searchParams.get("muscleGroup") || "";

        const exercises = await prisma.exercise.findMany({
            where: {
                ...(query && {
                    name: { contains: query },
                }),
                ...(muscleGroup && {
                    muscleGroup: muscleGroup,
                }),
            },
            orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
        });

        return NextResponse.json(exercises);
    } catch (error) {
        console.error("Error fetching exercises:", error);
        return NextResponse.json(
            { error: "Failed to fetch exercises" },
            { status: 500 }
        );
    }
}
