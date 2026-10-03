import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { calculateRecoveryScore } from "@/lib/alerts";
import { AnalyticsClient } from "@/components/cognitype";
import type { AnalyticsSessionItem } from "@/components/cognitype/analytics-client";

export const metadata: Metadata = {
    title: "Analytics — CogniType — FitxTracker",
    description: "Longitudinal cognitive performance analytics, sound comparisons, and recovery correlations.",
};

export default async function CognitypeAnalyticsPage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) redirect("/login");

    const [rawSessions, rawRecoveries] = await Promise.all([
        prisma.typingSession.findMany({
            where: { userId, completed: true },
            orderBy: { startedAt: "asc" },
            include: {
                passage: true,
                metrics: true,
            },
        }),
        prisma.dailyRecovery.findMany({
            where: { userId },
            orderBy: { date: "asc" },
        }),
    ]);

    // Build a date lookup for daily recovery (YYYY-MM-DD -> score)
    const recoveryMap = new Map<string, number>();
    for (const rec of rawRecoveries) {
        const key = rec.date.toISOString().split("T")[0];
        recoveryMap.set(key, calculateRecoveryScore(rec));
    }

    const sessions: AnalyticsSessionItem[] = rawSessions
        .filter((s) => s.metrics != null)
        .map((s) => {
            const dateKey = s.startedAt.toISOString().split("T")[0];
            const durationMin = (s.durationMs || 60000) / 60000;
            const wordCount = s.passage.wordCount || 30;
            const wpm = Math.round(wordCount / Math.max(0.2, durationMin));

            return {
                id: s.id,
                startedAt: s.startedAt.toISOString(),
                soundType: s.soundType,
                timeOfDay: s.timeOfDay,
                focusScore: Math.round(s.metrics!.focusStabilityScore),
                wpm,
                recoveryScore: recoveryMap.get(dateKey) ?? null,
            };
        });

    return <AnalyticsClient sessions={sessions} />;
}
