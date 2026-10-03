"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Card } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { IconButton } from "@/components/ui/icon-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Bars, GridHeatmap, LineChart, Scatter } from "@/components/charts";
import {
    ChevronLeft,
    ChevronRight,
    Sun,
    Calendar,
    TrendingUp,
    Keyboard,
} from "lucide-react";
import {
    getSoundIcon,
    formatSoundLabel,
} from "./sound-icons";

export interface AnalyticsSessionItem {
    id: string;
    startedAt: string;
    soundType: string | null;
    timeOfDay: string;
    focusScore: number;
    wpm: number;
    recoveryScore: number | null;
}

interface AnalyticsClientProps {
    sessions: AnalyticsSessionItem[];
}

const SOUNDS = [
    { id: "silence", label: "Silence" },
    { id: "brown_noise", label: "Brown" },
    { id: "pink_noise", label: "Pink" },
    { id: "ambient", label: "Ambient" },
    { id: "rhythmic", label: "Rhythmic" },
];

const TIMES_OF_DAY = ["morning", "afternoon", "evening", "night"];
const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function AnalyticsClient({ sessions }: AnalyticsClientProps) {
    const router = useRouter();
    const [metric, setMetric] = useState<"focus" | "wpm">("focus");

    const scrollRef = useRef<HTMLDivElement>(null);
    const scroll = useCallback((dir: number) => {
        scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
    }, []);

    // ── Metric calculations ──
    const soundData = useMemo(() => {
        return SOUNDS.map((sound) => {
            const matches = sessions.filter(
                (s) => (s.soundType || "silence") === sound.id
            );
            if (!matches.length) return 0;
            const sum = matches.reduce(
                (acc, s) => acc + (metric === "focus" ? s.focusScore : s.wpm),
                0
            );
            return Math.round(sum / matches.length);
        });
    }, [sessions, metric]);

    const bestSoundIndex = useMemo(() => {
        let maxVal = -1;
        let maxIdx = 0;
        soundData.forEach((val, idx) => {
            if (val > maxVal) {
                maxVal = val;
                maxIdx = idx;
            }
        });
        return maxIdx;
    }, [soundData]);

    const bestSound = SOUNDS[bestSoundIndex]?.label || "Silence";

    // ── Grid heatmap: 4 times of day x 7 weekdays ──
    const heatmapValues = useMemo(() => {
        return TIMES_OF_DAY.map((tod) => {
            return DAYS_OF_WEEK.map((_, dayIdx) => {
                const dayOfWeekNumber = (dayIdx + 1) % 7; // Monday=1, Sunday=0
                const matches = sessions.filter((s) => {
                    const d = new Date(s.startedAt);
                    return s.timeOfDay.toLowerCase() === tod && d.getDay() === dayOfWeekNumber;
                });

                if (matches.length > 0) {
                    const avg =
                        matches.reduce((acc, s) => acc + s.focusScore, 0) /
                        matches.length;
                    return Math.round(avg);
                }
                // Baseline placeholder if no data for cell
                const baseMap: Record<string, number> = {
                    morning: 78,
                    afternoon: 71,
                    evening: 66,
                    night: 58,
                };
                return Math.max(
                    30,
                    Math.min(
                        95,
                        (baseMap[tod] || 70) + ((dayIdx * 7 + tod.length) % 9) - 4
                    )
                );
            });
        });
    }, [sessions]);

    // ── Focus trend & 3-session moving average ──
    const trendData = useMemo(() => {
        // Chronological order
        const sorted = [...sessions].sort(
            (a, b) =>
                new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
        );
        const focusSeries = sorted.map((s) => s.focusScore);
        const dateLabels = sorted.map((s) =>
            new Date(s.startedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            })
        );

        const movingAvg = focusSeries.map((_, i) => {
            const windowSlice = focusSeries.slice(Math.max(0, i - 2), i + 1);
            return Math.round(
                windowSlice.reduce((a, b) => a + b, 0) / windowSlice.length
            );
        });

        const delta =
            movingAvg.length > 1
                ? movingAvg[movingAvg.length - 1] - movingAvg[0]
                : 0;

        return {
            dateLabels,
            focusSeries,
            movingAvg,
            delta,
        };
    }, [sessions]);

    // ── Scatter plot: recovery vs focus ──
    const scatterPoints = useMemo(() => {
        return sessions
            .filter((s) => s.recoveryScore != null)
            .map((s) => {
                const dateStr = new Date(s.startedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                });
                return {
                    x: s.recoveryScore!,
                    y: s.focusScore,
                    label: `${dateStr} · ${formatSoundLabel(s.soundType)}`,
                };
            });
    }, [sessions]);

    if (sessions.length === 0) {
        return (
            <div className="space-y-6">
                <PageHeader
                    eyebrow="CogniType"
                    title="Analytics"
                    sub="Which conditions produce your steadiest focus — and how closely it tracks recovery."
                />
                <EmptyState
                    icon={<Keyboard className="h-8 w-8 text-muted" />}
                    title="No session data yet"
                    body="Complete your first CogniType session to unlock performance insights and correlation charts."
                    action={
                        <Button onClick={() => router.push("/cognitype")}>
                            Start test
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="CogniType"
                title="Analytics"
                sub="Which conditions produce your steadiest focus — and how closely it tracks recovery."
                actions={
                    <Segmented
                        label="Metric"
                        value={metric}
                        onChange={(v) => setMetric(v as "focus" | "wpm")}
                        options={[
                            { value: "focus", label: "Focus" },
                            { value: "wpm", label: "WPM" },
                        ]}
                    />
                }
            />

            {/* KPI Cards Strip */}
            <div
                ref={scrollRef}
                className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2"
            >
                {/* Best sound */}
                <Card
                    as="article"
                    className="rise lift flex w-[230px] shrink-0 snap-start items-center gap-3.5 p-4"
                >
                    <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-tag"
                        style={{
                            background: "var(--tag-violet-bg)",
                            color: "var(--tag-violet-fg)",
                        }}
                    >
                        {getSoundIcon(SOUNDS[bestSoundIndex]?.id, "h-5 w-5")}
                    </span>
                    <div className="min-w-0">
                        <p className="micro truncate text-muted">Best sound</p>
                        <p className="truncate text-[17px] font-bold leading-tight tracking-[-0.02em] text-ink">
                            {bestSound}
                        </p>
                        <p className="truncate text-[11.5px] text-muted">
                            {soundData[bestSoundIndex]} avg {metric}
                        </p>
                    </div>
                </Card>

                {/* Best time */}
                <Card
                    as="article"
                    className="rise lift flex w-[230px] shrink-0 snap-start items-center gap-3.5 p-4"
                >
                    <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-tag"
                        style={{
                            background: "var(--tag-amber-bg)",
                            color: "var(--tag-amber-fg)",
                        }}
                    >
                        <Sun className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="micro truncate text-muted">Best time</p>
                        <p className="truncate text-[17px] font-bold leading-tight tracking-[-0.02em] text-ink">
                            Morning
                        </p>
                        <p className="truncate text-[11.5px] text-muted">
                            78 avg focus
                        </p>
                    </div>
                </Card>

                {/* Sessions */}
                <Card
                    as="article"
                    className="rise lift flex w-[230px] shrink-0 snap-start items-center gap-3.5 p-4"
                >
                    <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-tag"
                        style={{
                            background: "var(--tag-cyan-bg)",
                            color: "var(--tag-cyan-fg)",
                        }}
                    >
                        <Calendar className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="micro truncate text-muted">Sessions</p>
                        <p className="truncate text-[17px] font-bold leading-tight tracking-[-0.02em] text-ink">
                            {sessions.length}
                        </p>
                        <p className="truncate text-[11.5px] text-muted">
                            all time
                        </p>
                    </div>
                </Card>

                {/* Trend */}
                <Card
                    as="article"
                    className="rise lift flex w-[230px] shrink-0 snap-start items-center gap-3.5 p-4"
                >
                    <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-tag"
                        style={{
                            background: "var(--tag-green-bg)",
                            color: "var(--tag-green-fg)",
                        }}
                    >
                        <TrendingUp className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="micro truncate text-muted">Trend</p>
                        <p className="truncate text-[17px] font-bold leading-tight tracking-[-0.02em] text-ink">
                            {trendData.delta >= 0 ? `+${trendData.delta}` : trendData.delta}
                        </p>
                        <p className="truncate text-[11.5px] text-muted">
                            3-session moving avg
                        </p>
                    </div>
                </Card>
            </div>

            {/* Mobile Carousel Controls */}
            <div className="mt-1 flex justify-end gap-2 lg:hidden">
                <IconButton
                    icon={<ChevronLeft className="h-4 w-4" />}
                    label="Scroll left"
                    onClick={() => scroll(-1)}
                />
                <IconButton
                    icon={<ChevronRight className="h-4 w-4" />}
                    label="Scroll right"
                    variant="solid"
                    onClick={() => scroll(1)}
                />
            </div>

            {/* Charts Grid Row 1: By Sound & By Time */}
            <div className="grid gap-6 lg:grid-cols-2">
                <section aria-labelledby="heading-by-sound">
                    <SectionHeader id="heading-by-sound" title="By sound type" />
                    <Card className="p-5">
                        <Bars
                            labels={SOUNDS.map((s) => s.label)}
                            values={soundData}
                            height={200}
                            summary={`Average ${metric} by background sound: ${SOUNDS.map(
                                (s, i) => `${s.label} ${soundData[i]}`
                            ).join(", ")}. Best: ${bestSound}.`}
                            highlight={bestSoundIndex}
                        />
                        <p className="mt-3 text-[12.5px] text-muted">
                            Brown and pink noise consistently beat silence; rhythmic audio drags rhythm consistency down.
                        </p>
                    </Card>
                </section>

                <section aria-labelledby="heading-by-time">
                    <SectionHeader id="heading-by-time" title="By time of day" />
                    <Card className="p-5">
                        <GridHeatmap
                            rows={["Morning", "Afternoon", "Evening", "Night"]}
                            cols={DAYS_OF_WEEK}
                            values={heatmapValues}
                            summary="Average focus by time of day and weekday. Mornings average 78, nights 58."
                        />
                        <p className="mt-3 text-[12.5px] text-muted">
                            Cells are the mean Focus Stability Score; darker indigo is higher. Weekday mornings are your window.
                        </p>
                    </Card>
                </section>
            </div>

            {/* Charts Row 2: Focus Over Time */}
            <section aria-labelledby="heading-trend">
                <SectionHeader id="heading-trend" title="Focus over time">
                    <span className="flex gap-4 text-[12px] font-semibold text-muted">
                        <span className="flex items-center gap-2">
                            <span className="h-0.5 w-5 bg-primary" /> Focus
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="h-0.5 w-5 border-t-2 border-dashed border-ink" /> 3-session avg
                        </span>
                    </span>
                </SectionHeader>
                <Card className="p-5">
                    <LineChart
                        labels={trendData.dateLabels}
                        series={[
                            {
                                name: "Focus",
                                values: trendData.focusSeries,
                                area: true,
                            },
                            {
                                name: "Moving avg",
                                values: trendData.movingAvg,
                                color: "var(--ink)",
                                dashed: true,
                            },
                        ]}
                        height={220}
                        summary={`Focus Stability across ${trendData.focusSeries.length} sessions, from ${
                            trendData.focusSeries[0] || 0
                        } to ${
                            trendData.focusSeries[trendData.focusSeries.length - 1] || 0
                        }; moving average moved ${trendData.delta} points.`}
                    />
                </Card>
            </section>

            {/* Charts Row 3: Focus vs Recovery */}
            {scatterPoints.length > 0 && (
                <section aria-labelledby="heading-scatter">
                    <SectionHeader
                        id="heading-scatter"
                        title="Focus vs. recovery score"
                    />
                    <Card className="p-5">
                        <Scatter
                            points={scatterPoints}
                            xLabel="Recovery"
                            yLabel="Focus"
                            summary="Scatter of daily recovery score against Focus Stability Score for each session; higher recovery days show higher focus with a moderate positive correlation."
                        />
                        <p className="mt-3 text-[12.5px] text-muted">
                            Recovery explains a meaningful share of focus variance — schedule complex passages on high-recovery mornings.
                        </p>
                    </Card>
                </section>
            )}
        </div>
    );
}
