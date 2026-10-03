import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { calculateRecoveryScore } from "@/lib/alerts";
import { CognitypeTestClient } from "@/components/cognitype";
import type { SerializedPassage, SerializedTypingSession } from "@/components/cognitype";

export const metadata: Metadata = {
    title: "CogniType — FitxTracker",
    description: "Measure cognitive focus, rhythm stability, and fatigue through typing dynamics.",
};

export default async function CognitypePage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const [rawPassages, rawLastSession, rawLastRecovery] = await Promise.all([
        prisma.textPassage.findMany({
            orderBy: [{ difficulty: "asc" }, { title: "asc" }],
        }),
        userId
            ? prisma.typingSession.findFirst({
                  where: { userId, completed: true },
                  orderBy: { startedAt: "desc" },
                  include: {
                      metrics: true,
                      passage: true,
                  },
              })
            : Promise.resolve(null),
        userId
            ? prisma.dailyRecovery.findFirst({
                  where: { userId },
                  orderBy: { date: "desc" },
              })
            : Promise.resolve(null),
    ]);

    const passages: SerializedPassage[] = rawPassages.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        difficulty: p.difficulty,
        wordCount: p.wordCount,
        category: p.category,
    }));

    const lastSession: SerializedTypingSession | null = rawLastSession
        ? {
              id: rawLastSession.id,
              startedAt: rawLastSession.startedAt.toISOString(),
              completedAt: rawLastSession.completedAt?.toISOString() ?? null,
              durationMs: rawLastSession.durationMs,
              soundType: rawLastSession.soundType,
              timeOfDay: rawLastSession.timeOfDay,
              completed: rawLastSession.completed,
              passage: {
                  id: rawLastSession.passage.id,
                  title: rawLastSession.passage.title,
                  difficulty: rawLastSession.passage.difficulty,
                  category: rawLastSession.passage.category,
                  content: rawLastSession.passage.content,
                  wordCount: rawLastSession.passage.wordCount,
              },
              metrics: rawLastSession.metrics
                  ? {
                        meanInterKeyLatency: rawLastSession.metrics.meanInterKeyLatency,
                        latencyStdDev: rawLastSession.metrics.latencyStdDev,
                        pauseEntropy: rawLastSession.metrics.pauseEntropy,
                        errorRate: rawLastSession.metrics.errorRate,
                        correctionLatency: rawLastSession.metrics.correctionLatency,
                        switchCount: rawLastSession.metrics.switchCount,
                        switchTimeRatio: rawLastSession.metrics.switchTimeRatio,
                        resumeLatency: rawLastSession.metrics.resumeLatency,
                        fatigueSlope: rawLastSession.metrics.fatigueSlope,
                        focusStabilityScore: rawLastSession.metrics.focusStabilityScore,
                        soundType: rawLastSession.metrics.soundType,
                        difficultyLevel: rawLastSession.metrics.difficultyLevel,
                        sessionTimeOfDay: rawLastSession.metrics.sessionTimeOfDay,
                    }
                  : null,
          }
        : null;

    const recoveryScore = rawLastRecovery
        ? calculateRecoveryScore(rawLastRecovery)
        : null;

    return (
        <CognitypeTestClient
            passages={passages}
            lastSession={lastSession}
            userRecoveryScore={recoveryScore}
        />
    );
}
