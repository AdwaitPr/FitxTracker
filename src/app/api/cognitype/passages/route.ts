import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// GET - Fetch text passages, optionally filter by difficulty
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const difficulty = searchParams.get("difficulty");

        const passages = await prisma.textPassage.findMany({
            where: difficulty ? { difficulty: parseInt(difficulty) } : {},
            orderBy: [{ difficulty: "asc" }, { title: "asc" }],
            select: {
                id: true,
                title: true,
                content: true,
                difficulty: true,
                wordCount: true,
                category: true,
            },
        });

        return NextResponse.json(passages);
    } catch (error) {
        console.error("Error fetching passages:", error);
        return NextResponse.json(
            { error: "Failed to fetch passages" },
            { status: 500 }
        );
    }
}
