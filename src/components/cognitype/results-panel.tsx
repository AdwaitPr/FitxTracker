"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { RingProgress } from "@/components/ui/ring-progress";
import { Sparkline } from "@/components/charts/sparkline";
import {
    getSoundIcon,
    formatSoundLabel,
    formatTimeOfDayLabel,
    getDifficultyTone,
    getDifficultyLabel,
    getScoreColor,
    getScoreAssessment,
} from "./sound-icons";
import type { SessionResultData } from "./types";

interface ResultsPanelProps {
    data: SessionResultData;
    live?: boolean;
}

export function ResultsPanel({ data, live = false }: ResultsPanelProps) {
    const {
        metrics,
        focusBreakdown,
        passage,
        soundType,
        timeOfDay,
        wpm,
        accuracy,
        latencies,
        recoveryScore,
    } = data;

    const totalScore = Math.round(focusBreakdown.totalScore);
    const scoreColorVal = getScoreColor(totalScore);

    // Decision 7: Real fields from computeFocusScore's FocusBreakdown
    const subScores = [
        {
            label: "Attention Stability",
            value: Math.round(focusBreakdown.attentionStability * 100),
            detail: `${metrics.switchCount} attention switch${metrics.switchCount === 1 ? "" : "es"}, ${(metrics.switchTimeRatio * 100).toFixed(0)}% away`,
        },
        {
            label: "Switching Penalty",
            value: Math.round(focusBreakdown.switchingPenalty * 100),
            detail: `${metrics.switchCount} window/tab switch${metrics.switchCount === 1 ? "" : "es"}`,
        },
        {
            label: "Rhythm Consistency",
            value: Math.round(focusBreakdown.rhythmConsistency * 100),
            detail: `latency σ ${Math.round(metrics.latencyStdDev)} ms`,
        },
        {
            label: "Fatigue Resistance",
            value: Math.round(focusBreakdown.fatigueResistance * 100),
            detail: `slope ${metrics.fatigueSlope > 0 ? "+" : ""}${metrics.fatigueSlope.toFixed(1)} ms/quarter`,
        },
    ];

    const formattedDate = live
        ? "Just now"
        : new Date(data.dateISO).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          });

    return (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            {/* Left Card: Score Ring & Overview */}
            <Card className="rise flex flex-col items-center p-6 text-center">
                <RingProgress
                    value={totalScore / 100}
                    size={200}
                    stroke={11}
                    color={scoreColorVal}
                    label={`Focus Stability Score ${totalScore} of 100`}
                >
                    <div className="flex flex-col items-center justify-center">
                        <div
                            className="tnum text-[52px] font-bold leading-none tracking-[-0.03em]"
                            style={{ color: scoreColorVal }}
                        >
                            {totalScore}
                        </div>
                        <div className="micro mt-2 text-muted uppercase tracking-wider">
                            Focus stability
                        </div>
                    </div>
                </RingProgress>

                <p className="mt-5 text-[16px] font-semibold text-ink">
                    {getScoreAssessment(totalScore)}
                </p>
                <p className="mt-1 text-[13px] text-muted">
                    {formattedDate} · {formatTimeOfDayLabel(timeOfDay)} · {formatSoundLabel(soundType)}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Tag tone={getDifficultyTone(passage.difficulty)}>
                        {getDifficultyLabel(passage.difficulty)}
                    </Tag>
                    <Tag tone="cyan" className="capitalize">
                        {passage.category || "Prose"}
                    </Tag>
                    <Tag tone="violet" icon={getSoundIcon(soundType, "h-3.5 w-3.5")}>
                        {formatSoundLabel(soundType)}
                    </Tag>
                </div>

                <dl className="mt-5 grid w-full grid-cols-3 gap-2 rounded-panel bg-inset p-3">
                    <div>
                        <dt className="micro text-muted">WPM</dt>
                        <dd className="tnum mt-1 text-[16px] font-bold text-ink">{wpm}</dd>
                    </div>
                    <div>
                        <dt className="micro text-muted">Accuracy</dt>
                        <dd className="tnum mt-1 text-[16px] font-bold text-ink">
                            {accuracy.toFixed(0)}%
                        </dd>
                    </div>
                    <div>
                        <dt className="micro text-muted">Recovery</dt>
                        <dd className="tnum mt-1 text-[16px] font-bold text-ink">
                            {recoveryScore != null ? recoveryScore : "—"}
                        </dd>
                    </div>
                </dl>
            </Card>

            {/* Right Column: Sub-scores & Keystroke Latency Sparkline */}
            <div className="space-y-5">
                {/* Sub-scores Card */}
                <Card className="rise p-5">
                    <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Sub-scores</h2>
                    <ul className="mt-4 space-y-4">
                        {subScores.map((item) => {
                            const itemColor = getScoreColor(item.value);
                            return (
                                <li key={item.label}>
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-[13.5px] font-medium text-ink-soft">
                                            {item.label}
                                        </span>
                                        <span className="tnum text-[13px] font-bold text-ink">
                                            {item.value}
                                            <span className="text-muted">/100</span>
                                        </span>
                                    </div>
                                    <div
                                        className="mt-1.5 h-2 overflow-hidden rounded-full bg-hairline"
                                        role="progressbar"
                                        aria-valuenow={item.value}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={`${item.label} ${item.value} of 100`}
                                    >
                                        <div
                                            className="h-full rounded-full transition-[width] duration-700"
                                            style={{
                                                width: `${item.value}%`,
                                                background: itemColor,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-1 text-[11.5px] text-muted">{item.detail}</p>
                                </li>
                            );
                        })}
                    </ul>
                </Card>

                {/* Keystroke Latency Card */}
                <Card className="rise p-5">
                    <div className="flex items-baseline justify-between">
                        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">
                            Keystroke latency
                        </h2>
                        <span className="tnum text-[12px] font-semibold text-muted">
                            mean {Math.round(metrics.meanInterKeyLatency)} ms · σ{" "}
                            {Math.round(metrics.latencyStdDev)} ms
                        </span>
                    </div>

                    <div className="mt-3 h-[72px]">
                        <Sparkline
                            values={latencies}
                            height={72}
                            label={`Inter-key latency across ${latencies.length} keystrokes, mean ${Math.round(
                                metrics.meanInterKeyLatency
                            )} ms, standard deviation ${Math.round(metrics.latencyStdDev)} ms.`}
                        />
                    </div>

                    <div className="mt-1 flex justify-between text-[11px] font-semibold text-muted">
                        <span>first key</span>
                        <span>last key</span>
                    </div>
                </Card>
            </div>
        </div>
    );
}
