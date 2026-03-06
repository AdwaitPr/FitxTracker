import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// GET - Fetch a single session with all events and metrics
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const typingSession = await prisma.typingSession.findUnique({
            where: { id, userId: session.user.id },
            include: {
                passage: true,
                metrics: true,
                keystrokeEvents: { orderBy: { timestamp: "asc" } },
                attentionEvents: { orderBy: { timestamp: "asc" } },
            },
        });

        if (!typingSession) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Also fetch user baselines for context
        const baselines = await prisma.userBaseline.findMany({
            where: { userId: session.user.id },
        });

        return NextResponse.json({ session: typingSession, baselines });
    } catch (error) {
        console.error("Error fetching session:", error);
        return NextResponse.json(
            { error: "Failed to fetch session" },
            { status: 500 }
        );
    }
}
