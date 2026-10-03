"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip, Slider } from "@/components/ui/controls";
import { Segmented } from "@/components/ui/segmented";
import { Keyboard } from "lucide-react";
import type { SoundMode } from "@/lib/cognitype/sound-engine";
import {
    getSoundIcon,
    formatSoundLabel,
    getTimeOfDayIcon,
    formatTimeOfDayLabel,
} from "./sound-icons";
import type { SerializedPassage, PassageCategory, TimeOfDay } from "./types";

interface SetupCardProps {
    passages: SerializedPassage[];
    soundMode: SoundMode;
    onSoundModeChange: (sound: SoundMode) => void;
    volume: number;
    onVolumeChange: (volume: number) => void;
    difficulty: 1 | 2 | 3;
    onDifficultyChange: (diff: 1 | 2 | 3) => void;
    category: PassageCategory;
    onCategoryChange: (cat: PassageCategory) => void;
    timeOfDay: TimeOfDay;
    onTimeOfDayChange: (tod: TimeOfDay) => void;
    onStart: (passage: SerializedPassage) => void;
}

const SOUND_OPTIONS: SoundMode[] = [
    "silence",
    "brown_noise",
    "pink_noise",
    "ambient",
    "rhythmic",
];

const TIME_OPTIONS: TimeOfDay[] = ["morning", "afternoon", "evening", "night"];

export function SetupCard({
    passages,
    soundMode,
    onSoundModeChange,
    volume,
    onVolumeChange,
    difficulty,
    onDifficultyChange,
    category,
    onCategoryChange,
    timeOfDay,
    onTimeOfDayChange,
    onStart,
}: SetupCardProps) {
    // Find matching passage
    const matchedPassage = useMemo(() => {
        const found = passages.find(
            (p) =>
                p.difficulty === difficulty &&
                p.category?.toLowerCase() === category.toLowerCase()
        );
        if (found) return found;
        // Fallback to closest difficulty
        return (
            passages.find((p) => p.difficulty === difficulty) ||
            passages[0] || {
                id: "default-passage",
                title: "Focus Passage",
                content:
                    "Deep concentration requires maintaining calm rhythmic pace and resisting distractions from the surrounding environment.",
                difficulty: 2,
                wordCount: 16,
                category: "prose",
            }
        );
    }, [passages, difficulty, category]);

    return (
        <Card className="rise p-6">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
                Set up your session
            </h2>

            <div className="mt-5 space-y-6">
                {/* Background Sound */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-[13px] font-semibold text-ink-soft">
                            Background sound
                        </p>
                        {soundMode !== "silence" && (
                            <div className="w-40">
                                <Slider
                                    label="Volume"
                                    value={Math.round(volume * 100)}
                                    min={0}
                                    max={100}
                                    step={5}
                                    onChange={(v) => onVolumeChange(v / 100)}
                                    format={(v) => `${v}%`}
                                    aria-label="Sound volume"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {SOUND_OPTIONS.map((s) => (
                            <Chip
                                key={s}
                                selected={soundMode === s}
                                icon={getSoundIcon(s)}
                                onClick={() => onSoundModeChange(s)}
                            >
                                {formatSoundLabel(s)}
                            </Chip>
                        ))}
                    </div>
                </div>

                {/* Difficulty & Category */}
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <p className="mb-2 text-[13px] font-semibold text-ink-soft">
                            Passage difficulty
                        </p>
                        <Segmented
                            label="Difficulty"
                            value={String(difficulty)}
                            onChange={(v) => onDifficultyChange(Number(v) as 1 | 2 | 3)}
                            options={[
                                { value: "1", label: "1 · Simple" },
                                { value: "2", label: "2 · Moderate" },
                                { value: "3", label: "3 · Complex" },
                            ]}
                        />
                    </div>
                    <div>
                        <p className="mb-2 text-[13px] font-semibold text-ink-soft">
                            Category
                        </p>
                        <Segmented
                            label="Category"
                            value={category}
                            onChange={(v) => onCategoryChange(v as PassageCategory)}
                            options={[
                                { value: "prose", label: "Prose" },
                                { value: "technical", label: "Technical" },
                                { value: "numeric", label: "Numeric" },
                            ]}
                        />
                    </div>
                </div>

                {/* Time of Day */}
                <div>
                    <p className="mb-2 text-[13px] font-semibold text-ink-soft">
                        Time of day
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {TIME_OPTIONS.map((t) => (
                            <Chip
                                key={t}
                                selected={timeOfDay === t}
                                icon={getTimeOfDayIcon(t)}
                                onClick={() => onTimeOfDayChange(t)}
                            >
                                {formatTimeOfDayLabel(t)}
                            </Chip>
                        ))}
                    </div>
                </div>

                {/* Passage Preview Box */}
                <div className="rounded-panel bg-inset p-4">
                    <p className="micro text-muted">
                        Passage preview · {matchedPassage.wordCount || matchedPassage.content.split(" ").length} words
                    </p>
                    <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink-soft">
                        {matchedPassage.content}
                    </p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                    size="lg"
                    arrow
                    icon={<Keyboard className="h-4 w-4" />}
                    onClick={() => onStart(matchedPassage)}
                >
                    Start test
                </Button>
                <p className="text-[12.5px] text-muted">
                    Full-screen, low-contrast canvas. Escape via “Abort”.
                </p>
            </div>
        </Card>
    );
}
