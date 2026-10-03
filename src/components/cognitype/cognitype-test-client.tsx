"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RingProgress } from "@/components/ui/ring-progress";
import { RotateCcw, Check } from "lucide-react";
import type { SoundMode } from "@/lib/cognitype/sound-engine";
import type {
    SessionFeatureVector,
    RawKeystroke,
    RawAttentionEvent,
} from "@/lib/cognitype/metrics-calculator";
import type { FocusBreakdown } from "@/lib/cognitype/focus-scorer";
import { SetupCard } from "./setup-card";
import { TypingCanvas } from "./typing-canvas";
import { ResultsPanel } from "./results-panel";
import {
    getScoreColor,
    formatSoundLabel,
    formatTimeOfDayLabel,
} from "./sound-icons";
import type {
    SerializedPassage,
    SerializedTypingSession,
    PassageCategory,
    TimeOfDay,
    SessionResultData,
} from "./types";

interface CognitypeTestClientProps {
    passages: SerializedPassage[];
    lastSession: SerializedTypingSession | null;
    userRecoveryScore?: number | null;
}

type Phase = "setup" | "typing" | "results";

export function CognitypeTestClient({
    passages,
    lastSession,
    userRecoveryScore,
}: CognitypeTestClientProps) {
    const router = useRouter();
    const [phase, setPhase] = useState<Phase>("setup");

    // Form settings
    const [soundMode, setSoundMode] = useState<SoundMode>("brown_noise");
    const [volume, setVolume] = useState(0.5);
    const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
    const [category, setCategory] = useState<PassageCategory>("prose");
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
    const [activePassage, setActivePassage] = useState<SerializedPassage | null>(null);

    // Live result
    const [currentResult, setCurrentResult] = useState<SessionResultData | null>(null);

    const handleStart = (passage: SerializedPassage) => {
        setActivePassage(passage);
        setPhase("typing");
    };

    const handleAbort = () => {
        setPhase("setup");
    };

    const handleComplete = useCallback(
        async (data: {
            metrics: SessionFeatureVector;
            focusBreakdown: FocusBreakdown;
            durationMs: number;
            keystrokes: RawKeystroke[];
            attentionEvents: RawAttentionEvent[];
            latencies: number[];
            wpm: number;
            accuracy: number;
            errorRate: number;
        }) => {
            if (!activePassage) return;

            const resultPayload: SessionResultData = {
                dateISO: new Date().toISOString(),
                durationMs: data.durationMs,
                soundType: soundMode,
                timeOfDay,
                passage: activePassage,
                metrics: data.metrics,
                focusBreakdown: data.focusBreakdown,
                wpm: data.wpm,
                errorRate: data.errorRate,
                accuracy: data.accuracy,
                latencies: data.latencies,
                recoveryScore: userRecoveryScore,
            };

            setCurrentResult(resultPayload);
            setPhase("results");

            // Persist to database
            try {
                const response = await fetch("/api/cognitype/sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        passageId: activePassage.id,
                        soundType: soundMode,
                        durationMs: data.durationMs,
                        keystrokeEvents: data.keystrokes,
                        attentionEvents: data.attentionEvents,
                        metrics: {
                            ...data.metrics,
                            focusStabilityScore: data.focusBreakdown.totalScore,
                        },
                    }),
                });

                if (response.ok) {
                    const saved = await response.json();
                    if (saved?.id) {
                        setCurrentResult((prev) => (prev ? { ...prev, id: saved.id } : prev));
                    }
                }
            } catch (err) {
                console.error("Failed to save typing session:", err);
            }
        },
        [activePassage, soundMode, timeOfDay, userRecoveryScore]
    );

    const handleReset = () => {
        setCurrentResult(null);
        setPhase("setup");
    };

    // ── Phase 1: Typing Canvas (Fullscreen) ──
    if (phase === "typing" && activePassage) {
        return (
            <TypingCanvas
                passage={activePassage}
                soundMode={soundMode}
                volume={volume}
                onComplete={handleComplete}
                onAbort={handleAbort}
            />
        );
    }

    // ── Phase 2: Results View ──
    if (phase === "results" && currentResult) {
        return (
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Session complete"
                    title="Your results"
                    actions={
                        <>
                            <Button
                                variant="outline"
                                icon={<RotateCcw className="h-4 w-4" />}
                                onClick={handleReset}
                            >
                                Run again
                            </Button>
                            <Button arrow onClick={() => router.push("/cognitype/sessions")}>
                                All sessions
                            </Button>
                        </>
                    }
                />
                <ResultsPanel data={currentResult} live />
            </div>
        );
    }

    // ── Phase 3: Setup View ──
    const lastSessionScore = Math.round(
        lastSession?.metrics?.focusStabilityScore || 0
    );
    const lastSessionDate = lastSession?.startedAt
        ? new Date(lastSession.startedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
          })
        : null;

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Cognitive focus test"
                title="CogniType"
                sub="A 60-second typing passage. We measure rhythm, pauses, errors and attention drops — not just speed."
            />

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* Left: Setup Card */}
                <SetupCard
                    passages={passages}
                    soundMode={soundMode}
                    onSoundModeChange={setSoundMode}
                    volume={volume}
                    onVolumeChange={setVolume}
                    difficulty={difficulty}
                    onDifficultyChange={setDifficulty}
                    category={category}
                    onCategoryChange={setCategory}
                    timeOfDay={timeOfDay}
                    onTimeOfDayChange={setTimeOfDay}
                    onStart={handleStart}
                />

                {/* Right: Last Session & What We Capture */}
                <div className="space-y-5">
                    {/* Last session card */}
                    <Card className="rise p-5">
                        <p className="micro text-muted">Last session</p>
                        {lastSession && lastSession.metrics ? (
                            <div className="mt-3 flex items-center gap-4">
                                <RingProgress
                                    value={lastSessionScore / 100}
                                    size={84}
                                    stroke={6}
                                    color={getScoreColor(lastSessionScore)}
                                    label={`Last focus score ${lastSessionScore}`}
                                >
                                    <span
                                        className="tnum text-[20px] font-bold"
                                        style={{ color: getScoreColor(lastSessionScore) }}
                                    >
                                        {lastSessionScore}
                                    </span>
                                </RingProgress>
                                <div className="min-w-0">
                                    <p className="text-[14px] font-semibold text-ink">
                                        Focus Stability
                                    </p>
                                    <p className="text-[12.5px] text-muted truncate">
                                        {lastSessionDate} · {formatSoundLabel(lastSession.soundType)} · {formatTimeOfDayLabel(lastSession.timeOfDay)}
                                    </p>
                                    <Link
                                        href={`/cognitype/sessions/${lastSession.id}`}
                                        className="mt-1 inline-block text-[12.5px] font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                                    >
                                        Open results
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-3 text-[13px] text-muted">
                                No completed sessions yet. Start your first test!
                            </p>
                        )}
                    </Card>

                    {/* What we capture card */}
                    <Card className="rise p-5">
                        <p className="text-[14px] font-semibold text-ink">
                            What we capture
                        </p>
                        <ul className="mt-2 space-y-1.5 text-[12.5px] text-muted">
                            {[
                                "Mean inter-key latency & std-dev",
                                "Pause entropy (distribution of gaps)",
                                "Error rate per character",
                                "Attention events: blur, tab hidden, idle > 2.5 s",
                                "Composite Focus Stability Score",
                            ].map((t) => (
                                <li key={t} className="flex gap-2">
                                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                    <span>{t}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}
