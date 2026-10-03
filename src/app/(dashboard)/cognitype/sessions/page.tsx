import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { SessionsListClient } from "@/components/cognitype";
import type { SerializedTypingSession } from "@/components/cognitype";

export const metadata: Metadata = {
    title: "Sessions — CogniType — FitxTracker",
    description: "History of completed CogniType sessions, focus scores, and typing dynamics.",
};

export default async function CognitypeSessionsPage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const rawSessions = userId
        ? await prisma.typingSession.findMany({
              where: { userId, completed: true },
              orderBy: { startedAt: "desc" },
              include: {
                  passage: true,
                  metrics: true,
              },
          })
        : [];

    const sessions: SerializedTypingSession[] = rawSessions.map((s) => ({
        id: s.id,
        startedAt: s.startedAt.toISOString(),
        completedAt: s.completedAt?.toISOString() ?? null,
        durationMs: s.durationMs,
        soundType: s.soundType,
        timeOfDay: s.timeOfDay,
        completed: s.completed,
        passage: {
            id: s.passage.id,
            title: s.passage.title,
            difficulty: s.passage.difficulty,
            category: s.passage.category,
            content: s.passage.content,
            wordCount: s.passage.wordCount,
        },
        metrics: s.metrics
            ? {
                  meanInterKeyLatency: s.metrics.meanInterKeyLatency,
                  latencyStdDev: s.metrics.latencyStdDev,
                  pauseEntropy: s.metrics.pauseEntropy,
                  errorRate: s.metrics.errorRate,
                  correctionLatency: s.metrics.correctionLatency,
                  switchCount: s.metrics.switchCount,
                  switchTimeRatio: s.metrics.switchTimeRatio,
                  resumeLatency: s.metrics.resumeLatency,
                  fatigueSlope: s.metrics.fatigueSlope,
                  focusStabilityScore: s.metrics.focusStabilityScore,
                  soundType: s.metrics.soundType,
                  difficultyLevel: s.metrics.difficultyLevel,
                  sessionTimeOfDay: s.metrics.sessionTimeOfDay,
              }
            : null,
    }));

    return <SessionsListClient sessions={sessions} />;
}
