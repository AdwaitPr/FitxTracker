import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// POST - Log daily recovery
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sleepHours, sleepQuality, gutStatus, stressLevel, notes } = body;

        // Use today's date (midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Upsert — one recovery log per day
        const recovery = await prisma.dailyRecovery.upsert({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date: today,
                },
            },
            update: {
                sleepHours,
                sleepQuality,
                gutStatus,
                stressLevel,
                notes,
            },
            create: {
                userId: session.user.id,
                date: today,
                sleepHours,
                sleepQuality,
                gutStatus,
                stressLevel,
                notes,
            },
        });

        return NextResponse.json(recovery, { status: 201 });
    } catch (error) {
        console.error("Error logging recovery:", error);
        return NextResponse.json(
            { error: "Failed to log recovery" },
            { status: 500 }
        );
    }
}

// GET - Get recovery logs
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "30");

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const logs = await prisma.dailyRecovery.findMany({
            where: {
                userId: session.user.id,
                date: { gte: startDate },
            },
            orderBy: { date: "desc" },
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Error fetching recovery logs:", error);
        return NextResponse.json(
            { error: "Failed to fetch recovery logs" },
            { status: 500 }
        );
    }
}
