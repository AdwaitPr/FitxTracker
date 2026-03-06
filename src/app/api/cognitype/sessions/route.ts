import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// POST - Save a completed typing session with all events and metrics
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            passageId,
            soundType,
            durationMs,
            keystrokeEvents,
            attentionEvents,
            metrics,
        } = body;

        // Determine time of day
        const hour = new Date().getHours();
        let timeOfDay = "night";
        if (hour >= 5 && hour < 12) timeOfDay = "morning";
        else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
        else if (hour >= 17 && hour < 21) timeOfDay = "evening";

        // Get passage difficulty
        const passage = await prisma.textPassage.findUnique({
            where: { id: passageId },
            select: { difficulty: true },
        });

        if (!passage) {
            return NextResponse.json({ error: "Passage not found" }, { status: 404 });
        }

        // Create session with all nested data
        const typingSession = await prisma.typingSession.create({
            data: {
                userId: session.user.id,
                passageId,
                soundType: soundType || null,
                timeOfDay,
                durationMs,
                completed: true,
                completedAt: new Date(),
                keystrokeEvents: {
                    create: keystrokeEvents.map((k: {
                        timestamp: number;
                        key: string;
                        isCorrect: boolean;
                        isCorrection: boolean;
                        position: number;
                    }) => ({
                        timestamp: k.timestamp,
                        key: k.key,
                        isCorrect: k.isCorrect,
                        isCorrection: k.isCorrection,
                        position: k.position,
                    })),
                },
                attentionEvents: {
                    create: attentionEvents.map((a: {
                        type: string;
                        timestamp: number;
                        duration?: number;
                    }) => ({
                        type: a.type,
                        timestamp: a.timestamp,
                        duration: a.duration || null,
                    })),
                },
                metrics: {
                    create: {
                        meanInterKeyLatency: metrics.meanInterKeyLatency,
                        latencyStdDev: metrics.latencyStdDev,
                        pauseEntropy: metrics.pauseEntropy,
                        errorRate: metrics.errorRate,
                        correctionLatency: metrics.correctionLatency,
                        switchCount: metrics.switchCount,
                        switchTimeRatio: metrics.switchTimeRatio,
                        resumeLatency: metrics.resumeLatency,
                        fatigueSlope: metrics.fatigueSlope,
                        focusStabilityScore: metrics.focusStabilityScore,
                        soundType: soundType || null,
                        difficultyLevel: passage.difficulty,
                        sessionTimeOfDay: timeOfDay,
                    },
                },
            },
            include: {
                metrics: true,
            },
        });

        // Update user baselines (running average)
        const metricKeys = [
            "meanInterKeyLatency",
            "latencyStdDev",
            "pauseEntropy",
            "errorRate",
            "correctionLatency",
            "fatigueSlope",
        ] as const;

        for (const metricKey of metricKeys) {
            const value = metrics[metricKey] as number;
            if (typeof value !== "number" || isNaN(value)) continue;

            const existing = await prisma.userBaseline.findUnique({
                where: {
                    userId_metric: {
                        userId: session.user.id,
                        metric: metricKey,
                    },
                },
            });

            if (existing) {
                // Running average: new_mean = old_mean + (value - old_mean) / (n + 1)
                const n = existing.sampleCount;
                const newMean = existing.baselineValue + (value - existing.baselineValue) / (n + 1);
                // Running std dev (Welford's algorithm)
                const newStd = Math.sqrt(
                    ((n - 1) * existing.stdDev ** 2 + (value - existing.baselineValue) * (value - newMean)) / n
                );

                await prisma.userBaseline.update({
                    where: { id: existing.id },
                    data: {
                        baselineValue: newMean,
                        stdDev: isNaN(newStd) ? existing.stdDev : newStd,
                        sampleCount: n + 1,
                    },
                });
            } else {
                await prisma.userBaseline.create({
                    data: {
                        userId: session.user.id,
                        metric: metricKey,
                        baselineValue: value,
                        stdDev: 0,
                        sampleCount: 1,
                    },
                });
            }
        }

        return NextResponse.json(typingSession, { status: 201 });
    } catch (error) {
        console.error("Error saving session:", error);
        return NextResponse.json(
            { error: "Failed to save session" },
            { status: 500 }
        );
    }
}

// GET - List user's typing sessions
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "20");

        const sessions = await prisma.typingSession.findMany({
            where: { userId: session.user.id, completed: true },
            orderBy: { startedAt: "desc" },
            take: limit,
            include: {
                passage: { select: { title: true, difficulty: true } },
                metrics: true,
            },
        });

        return NextResponse.json(sessions);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}
