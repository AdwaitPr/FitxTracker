import type { SessionFeatureVector } from "@/lib/cognitype/metrics-calculator";
import type { FocusBreakdown } from "@/lib/cognitype/focus-scorer";
import type { SoundMode } from "@/lib/cognitype/sound-engine";

export type PassageCategory = "prose" | "technical" | "numeric";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface SerializedPassage {
    id: string;
    title: string;
    content: string;
    difficulty: number;
    wordCount: number;
    category: string | null;
}

export interface SerializedSessionMetrics {
    meanInterKeyLatency: number;
    latencyStdDev: number;
    pauseEntropy: number;
    errorRate: number;
    correctionLatency: number;
    switchCount: number;
    switchTimeRatio: number;
    resumeLatency: number;
    fatigueSlope: number;
    focusStabilityScore: number;
    soundType: string | null;
    difficultyLevel: number;
    sessionTimeOfDay: string;
}

export interface SerializedTypingSession {
    id: string;
    startedAt: string;
    completedAt?: string | null;
    durationMs: number | null;
    soundType: string | null;
    timeOfDay: string;
    completed: boolean;
    passage: {
        id: string;
        title: string;
        difficulty: number;
        category?: string | null;
        content?: string;
        wordCount?: number;
    };
    metrics?: SerializedSessionMetrics | null;
}

export interface SessionResultData {
    id?: string;
    dateISO: string;
    durationMs: number;
    soundType: SoundMode;
    timeOfDay: string;
    passage: SerializedPassage;
    metrics: SessionFeatureVector;
    focusBreakdown: FocusBreakdown;
    wpm: number;
    errorRate: number;
    accuracy: number;
    latencies: number[];
    recoveryScore?: number | null;
}
