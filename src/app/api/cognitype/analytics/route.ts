import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// GET - Analytics data for longitudinal trends
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch all completed sessions with metrics
        const sessions = await prisma.typingSession.findMany({
            where: { userId, completed: true },
            orderBy: { startedAt: "asc" },
            include: {
                metrics: true,
                passage: { select: { difficulty: true, title: true } },
            },
        });

        // Fetch baselines
        const baselines = await prisma.userBaseline.findMany({
            where: { userId },
        });

        // Compute analytics
        const totalSessions = sessions.length;
        const totalTimeMs = sessions.reduce((a, s) => a + (s.durationMs || 0), 0);

        // Focus score trend (by session)
        const focusTrend = sessions.map((s) => ({
            date: s.startedAt,
            score: s.metrics?.focusStabilityScore || 0,
            difficulty: s.passage.difficulty,
            soundType: s.soundType,
            timeOfDay: s.timeOfDay,
        }));

        // Weekly averages
        const weeklyScores: Record<string, { scores: number[]; count: number }> = {};
        for (const s of sessions) {
            const weekStart = new Date(s.startedAt);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const key = weekStart.toISOString().split("T")[0];
            if (!weeklyScores[key]) weeklyScores[key] = { scores: [], count: 0 };
            if (s.metrics) {
                weeklyScores[key].scores.push(s.metrics.focusStabilityScore);
                weeklyScores[key].count++;
            }
        }
        const weeklyTrend = Object.entries(weeklyScores).map(([week, data]) => ({
            week,
            avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
            sessions: data.count,
        }));

        // Sound performance comparison
        const soundPerformance: Record<string, number[]> = {};
        for (const s of sessions) {
            const sound = s.soundType || "silence";
            if (!soundPerformance[sound]) soundPerformance[sound] = [];
            if (s.metrics) {
                soundPerformance[sound].push(s.metrics.focusStabilityScore);
            }
        }
        const soundComparison = Object.entries(soundPerformance).map(([sound, scores]) => ({
            sound,
            avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
            sessions: scores.length,
        }));

        // Peak hour analysis
        const hourPerformance: Record<string, number[]> = {};
        for (const s of sessions) {
            if (!hourPerformance[s.timeOfDay]) hourPerformance[s.timeOfDay] = [];
            if (s.metrics) {
                hourPerformance[s.timeOfDay].push(s.metrics.focusStabilityScore);
            }
        }
        const peakHours = Object.entries(hourPerformance).map(([time, scores]) => ({
            timeOfDay: time,
            avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
            sessions: scores.length,
        })).sort((a, b) => b.avgScore - a.avgScore);

        // Fatigue trend (average fatigue slope over time)
        const fatigueTrend = sessions
            .filter((s) => s.metrics)
            .map((s) => ({
                date: s.startedAt,
                fatigueSlope: s.metrics!.fatigueSlope,
            }));

        // Optimal session duration
        const durationPerformance = sessions
            .filter((s) => s.metrics && s.durationMs)
            .map((s) => ({
                durationMin: Math.round((s.durationMs || 0) / 60000),
                score: s.metrics!.focusStabilityScore,
            }));

        return NextResponse.json({
            totalSessions,
            totalTimeMs,
            focusTrend,
            weeklyTrend,
            soundComparison,
            peakHours,
            fatigueTrend,
            durationPerformance,
            baselines,
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
