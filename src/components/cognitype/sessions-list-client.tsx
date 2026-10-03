"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Chip } from "@/components/ui/controls";
import { Tag } from "@/components/ui/tag";
import { RingProgress } from "@/components/ui/ring-progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Keyboard, ArrowRight, Search } from "lucide-react";
import {
    getSoundIcon,
    formatSoundLabel,
    formatTimeOfDayLabel,
    getDifficultyTone,
    getDifficultyLabel,
    getScoreColor,
} from "./sound-icons";
import type { SerializedTypingSession } from "./types";

interface SessionsListClientProps {
    sessions: SerializedTypingSession[];
}

const SOUND_FILTER_OPTIONS = [
    { value: "", label: "All sounds" },
    { value: "brown_noise", label: "Brown Noise" },
    { value: "pink_noise", label: "Pink Noise" },
    { value: "ambient", label: "Ambient" },
    { value: "rhythmic", label: "Rhythmic" },
    { value: "silence", label: "Silence" },
];

export function SessionsListClient({ sessions }: SessionsListClientProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [soundFilter, setSoundFilter] = useState("");
    const [diffFilter, setDiffFilter] = useState<number | "">("");

    const filteredSessions = useMemo(() => {
        return sessions.filter((s) => {
            const matchesSound = !soundFilter || s.soundType === soundFilter;
            const matchesDiff =
                diffFilter === "" || s.passage.difficulty === diffFilter;
            const term = search.toLowerCase();
            const searchable = `${s.passage.title} ${s.passage.category || ""} ${
                s.timeOfDay
            } ${s.soundType || ""}`.toLowerCase();
            const matchesSearch = !term || searchable.includes(term);

            return matchesSound && matchesDiff && matchesSearch;
        });
    }, [sessions, search, soundFilter, diffFilter]);

    const averageFocus = useMemo(() => {
        if (!filteredSessions.length) return 0;
        const sum = filteredSessions.reduce(
            (acc, s) => acc + (s.metrics?.focusStabilityScore || 0),
            0
        );
        return Math.round(sum / filteredSessions.length);
    }, [filteredSessions]);

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="CogniType"
                title="Sessions"
                sub={`${filteredSessions.length} session${
                    filteredSessions.length === 1 ? "" : "s"
                } · average focus ${averageFocus}`}
                actions={
                    <Button
                        icon={<Keyboard className="h-4 w-4" />}
                        onClick={() => router.push("/cognitype")}
                    >
                        New test
                    </Button>
                }
            />

            {/* Filter Card */}
            <Card className="rise p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
                    <Input
                        icon={<Search className="h-4 w-4" />}
                        placeholder="Search title, category, time of day…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search sessions"
                    />
                    <Select
                        value={soundFilter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSoundFilter(e.target.value)}
                        aria-label="Sound filter"
                    >
                        {SOUND_FILTER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    <Chip
                        selected={diffFilter === ""}
                        onClick={() => setDiffFilter("")}
                    >
                        All levels
                    </Chip>
                    {([1, 2, 3] as const).map((d) => (
                        <Chip
                            key={d}
                            selected={diffFilter === d}
                            tone={getDifficultyTone(d)}
                            onClick={() => setDiffFilter(diffFilter === d ? "" : d)}
                        >
                            {d} · {getDifficultyLabel(d)}
                        </Chip>
                    ))}
                </div>
            </Card>

            {/* Sessions Table or Empty State */}
            {filteredSessions.length === 0 ? (
                <EmptyState
                    icon={<Keyboard className="h-8 w-8 text-muted" />}
                    title="No sessions match"
                    body="Clear a filter or run a new test."
                    action={
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearch("");
                                setSoundFilter("");
                                setDiffFilter("");
                            }}
                        >
                            Clear filters
                        </Button>
                    }
                />
            ) : (
                <Card className="px-4 py-1 sm:px-6">
                    {/* Header Columns for Desktop */}
                    <div className="micro hidden grid-cols-[90px_1fr_1fr_1fr_90px_80px_44px] gap-4 px-1 py-3 text-muted lg:grid">
                        <span>Focus</span>
                        <span>Date</span>
                        <span>Sound</span>
                        <span>Passage</span>
                        <span>Time</span>
                        <span>WPM</span>
                        <span className="text-right">Open</span>
                    </div>

                    <ul className="divide-y divide-dashed divide-hairline">
                        {filteredSessions.map((s) => {
                            const score = Math.round(
                                s.metrics?.focusStabilityScore || 0
                            );
                            const scoreColorVal = getScoreColor(score);
                            const dateObj = new Date(s.startedAt);
                            const formattedDate = dateObj.toLocaleDateString(
                                "en-US",
                                {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                }
                            );

                            // Estimate WPM if not stored
                            const wordCount = s.passage.wordCount || 30;
                            const durationMinutes = (s.durationMs || 60000) / 60000;
                            const wpm = Math.round(wordCount / Math.max(0.2, durationMinutes));

                            return (
                                <li key={s.id}>
                                    <Link
                                        href={`/cognitype/sessions/${s.id}`}
                                        className="grid grid-cols-[52px_1fr_44px] items-center gap-x-3 gap-y-1 rounded-[14px] px-1 py-3 hover:bg-canvas transition-colors lg:grid-cols-[90px_1fr_1fr_1fr_90px_80px_44px] lg:gap-4"
                                    >
                                        {/* Score Ring */}
                                        <span className="flex items-center gap-2">
                                            <RingProgress
                                                value={score / 100}
                                                size={44}
                                                stroke={4}
                                                color={scoreColorVal}
                                                label={`Focus ${score}`}
                                            >
                                                <span
                                                    className="tnum text-[12px] font-bold"
                                                    style={{ color: scoreColorVal }}
                                                >
                                                    {score}
                                                </span>
                                            </RingProgress>
                                        </span>

                                        {/* Date */}
                                        <span className="min-w-0">
                                            <span className="block text-[14px] font-semibold text-ink">
                                                {formattedDate}
                                            </span>
                                            <span className="block truncate text-[12px] text-muted lg:hidden">
                                                {formatSoundLabel(s.soundType)} · {s.passage.title} · {formatTimeOfDayLabel(s.timeOfDay)} · {wpm} wpm
                                            </span>
                                            <span className="hidden text-[12px] text-muted lg:block">
                                                {dateObj.toLocaleTimeString("en-US", {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </span>

                                        {/* Sound */}
                                        <span className="hidden items-center gap-2 text-[13px] text-ink-soft lg:flex">
                                            <span className="text-muted">
                                                {getSoundIcon(s.soundType, "h-4 w-4")}
                                            </span>
                                            {formatSoundLabel(s.soundType)}
                                        </span>

                                        {/* Passage Tag & Title */}
                                        <span className="hidden items-center gap-2 lg:flex">
                                            <Tag tone={getDifficultyTone(s.passage.difficulty)}>
                                                {getDifficultyLabel(s.passage.difficulty)}
                                            </Tag>
                                            <span className="text-[12.5px] text-muted truncate max-w-[140px]">
                                                {s.passage.title}
                                            </span>
                                        </span>

                                        {/* Time of Day */}
                                        <span className="hidden text-[13px] text-ink-soft lg:block">
                                            {formatTimeOfDayLabel(s.timeOfDay)}
                                        </span>

                                        {/* WPM */}
                                        <span className="tnum hidden text-[13px] font-semibold text-ink lg:block">
                                            {wpm}
                                        </span>

                                        {/* Open Action Arrow */}
                                        <span className="grid h-11 w-11 place-items-center rounded-full border border-hairline text-ink-soft hover:bg-surface transition-colors">
                                            <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </Card>
            )}
        </div>
    );
}
