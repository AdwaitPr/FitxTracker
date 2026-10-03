import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { calculateRecoveryScore } from "@/lib/alerts";
import { computeFocusScore } from "@/lib/cognitype/focus-scorer";
import type { SessionFeatureVector } from "@/lib/cognitype/metrics-calculator";
import type { SoundMode } from "@/lib/cognitype/sound-engine";
import { SessionDetailClient } from "@/components/cognitype";
import type { SessionResultData } from "@/components/cognitype";

export const metadata: Metadata = {
    title: "Session Details — CogniType — FitxTracker",
    description: "Detailed cognitive performance metrics, focus stability, and keystroke dynamics.",
};

export default async function CognitypeSessionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) redirect("/login");

    const { id } = await params;

    const rawSession = await prisma.typingSession.findUnique({
        where: { id, userId },
        include: {
            passage: true,
            metrics: true,
            keystrokeEvents: { orderBy: { timestamp: "asc" } },
            attentionEvents: { orderBy: { timestamp: "asc" } },
        },
    });

    if (!rawSession || !rawSession.metrics) {
        notFound();
    }

    // Correlate with that day's recovery
    const startOfDay = new Date(rawSession.startedAt);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(rawSession.startedAt);
    endOfDay.setHours(23, 59, 59, 999);

    const dailyRecovery = await prisma.dailyRecovery.findFirst({
        where: {
            userId,
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    const recoveryScore = dailyRecovery
        ? calculateRecoveryScore(dailyRecovery)
        : null;

    // Derive latencies from keystroke events
    const latencies: number[] = [];
    for (let i = 1; i < rawSession.keystrokeEvents.length; i++) {
        const delta =
            rawSession.keystrokeEvents[i].timestamp -
            rawSession.keystrokeEvents[i - 1].timestamp;
        if (delta > 0 && delta < 5000) {
            latencies.push(delta);
        }
    }
    if (latencies.length === 0) {
        latencies.push(rawSession.metrics.meanInterKeyLatency || 200);
    }

    const featureVector: SessionFeatureVector = {
        meanInterKeyLatency: rawSession.metrics.meanInterKeyLatency,
        latencyStdDev: rawSession.metrics.latencyStdDev,
        pauseEntropy: rawSession.metrics.pauseEntropy,
        errorRate: rawSession.metrics.errorRate,
        correctionLatency: rawSession.metrics.correctionLatency,
        switchCount: rawSession.metrics.switchCount,
        switchTimeRatio: rawSession.metrics.switchTimeRatio,
        resumeLatency: rawSession.metrics.resumeLatency,
        fatigueSlope: rawSession.metrics.fatigueSlope,
    };

    const focusBreakdown = computeFocusScore(featureVector, []);
    // Ensure totalScore matches the persisted focusStabilityScore
    focusBreakdown.totalScore = rawSession.metrics.focusStabilityScore;

    const durationMinutes = (rawSession.durationMs || 60000) / 60000;
    const wordCount = rawSession.passage.wordCount || 30;
    const wpm = Math.round(wordCount / Math.max(0.2, durationMinutes));
    const accuracy = Math.max(0, 100 - rawSession.metrics.errorRate * 100);

    const sessionData: SessionResultData = {
        id: rawSession.id,
        dateISO: rawSession.startedAt.toISOString(),
        durationMs: rawSession.durationMs || 60000,
        soundType: (rawSession.soundType as SoundMode) || "silence",
        timeOfDay: rawSession.timeOfDay,
        passage: {
            id: rawSession.passage.id,
            title: rawSession.passage.title,
            difficulty: rawSession.passage.difficulty,
            category: rawSession.passage.category,
            content: rawSession.passage.content,
            wordCount: rawSession.passage.wordCount,
        },
        metrics: featureVector,
        focusBreakdown,
        wpm,
        errorRate: rawSession.metrics.errorRate * 100,
        accuracy,
        latencies,
        recoveryScore,
    };

    return <SessionDetailClient sessionData={sessionData} />;
}
