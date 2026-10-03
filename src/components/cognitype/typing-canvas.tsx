"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { RingProgress } from "@/components/ui/ring-progress";
import { startSound, stopSound, type SoundMode } from "@/lib/cognitype/sound-engine";
import {
    computeSessionMetrics,
    type RawKeystroke,
    type RawAttentionEvent,
    type SessionFeatureVector,
} from "@/lib/cognitype/metrics-calculator";
import { computeFocusScore, type FocusBreakdown } from "@/lib/cognitype/focus-scorer";
import { getDifficultyLabel, formatSoundLabel } from "./sound-icons";
import type { SerializedPassage } from "./types";

interface TypingCanvasProps {
    passage: SerializedPassage;
    soundMode: SoundMode;
    volume: number;
    onComplete: (data: {
        metrics: SessionFeatureVector;
        focusBreakdown: FocusBreakdown;
        durationMs: number;
        keystrokes: RawKeystroke[];
        attentionEvents: RawAttentionEvent[];
        latencies: number[];
        wpm: number;
        accuracy: number;
        errorRate: number;
    }) => void;
    onAbort: () => void;
}

const TEST_LIMIT_SECONDS = 60;

export function TypingCanvas({
    passage,
    soundMode,
    volume,
    onComplete,
    onAbort,
}: TypingCanvasProps) {
    const text = passage.content;
    const [typed, setTyped] = useState("");
    const [start, setStart] = useState<number | null>(null);
    const [now, setNow] = useState(0);

    const latenciesRef = useRef<number[]>([]);
    const lastKeyTimestampRef = useRef<number | null>(null);
    const errorsCountRef = useRef(0);
    const keystrokesRef = useRef<RawKeystroke[]>([]);
    const attentionLogRef = useRef<RawAttentionEvent[]>([]);
    const lastActiveTimeRef = useRef(0);
    const idleTimerRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const completedRef = useRef(false);

    // Audio lifecycle
    useEffect(() => {
        if (soundMode !== "silence") {
            startSound(soundMode, volume);
        }
        return () => {
            stopSound();
        };
    }, [soundMode, volume]);

    // Timer & attention listeners
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 250);

        const onBlur = () => {
            const ts = start ? Date.now() - start : 0;
            attentionLogRef.current.push({ type: "blur", timestamp: ts });
        };

        const onFocus = () => {
            const ts = start ? Date.now() - start : 0;
            const lastBlur = [...attentionLogRef.current].reverse().find((e) => e.type === "blur");
            const duration = lastBlur ? ts - lastBlur.timestamp : undefined;
            attentionLogRef.current.push({ type: "focus", timestamp: ts, duration });
        };

        const onVisChange = () => {
            const ts = start ? Date.now() - start : 0;
            if (document.hidden) {
                attentionLogRef.current.push({ type: "visibility_hidden", timestamp: ts });
            } else {
                const lastHidden = [...attentionLogRef.current].reverse().find((e) => e.type === "visibility_hidden");
                const duration = lastHidden ? ts - lastHidden.timestamp : undefined;
                attentionLogRef.current.push({ type: "visibility_visible", timestamp: ts, duration });
            }
        };

        window.addEventListener("blur", onBlur);
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisChange);

        inputRef.current?.focus();

        return () => {
            window.clearInterval(timer);
            window.removeEventListener("blur", onBlur);
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisChange);
        };
    }, [start]);

    // Idle detection
    useEffect(() => {
        if (!start || completedRef.current) return;

        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

        idleTimerRef.current = window.setTimeout(() => {
            const ts = Date.now() - start;
            attentionLogRef.current.push({ type: "idle", timestamp: ts, duration: 3000 });
        }, 3000);

        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [now, start]);

    const elapsedSeconds = start ? Math.min(TEST_LIMIT_SECONDS, (now - start) / 1000) : 0;
    const isFinished = (typed.length >= text.length && text.length > 0) || elapsedSeconds >= TEST_LIMIT_SECONDS;

    const handleFinish = useCallback(() => {
        if (completedRef.current) return;
        completedRef.current = true;
        stopSound();

        const durationMs = start ? Math.max(1000, now - start) : 1000;
        const correctChars = [...typed].filter((c, i) => c === text[i]).length;
        const minutes = durationMs / 60000;
        const wpm = Math.round(correctChars / 5 / Math.max(0.1, minutes));
        const accuracy = typed.length ? Math.round((correctChars / typed.length) * 100) : 100;
        const errorRate = typed.length ? (errorsCountRef.current / typed.length) * 100 : 0;

        const metrics = computeSessionMetrics(
            keystrokesRef.current,
            attentionLogRef.current,
            durationMs
        );
        const focusBreakdown = computeFocusScore(metrics, []);

        onComplete({
            metrics,
            focusBreakdown,
            durationMs,
            keystrokes: keystrokesRef.current,
            attentionEvents: attentionLogRef.current,
            latencies: latenciesRef.current.length > 0 ? latenciesRef.current : [metrics.meanInterKeyLatency || 200],
            wpm,
            accuracy,
            errorRate,
        });
    }, [start, now, typed, text, onComplete]);

    useEffect(() => {
        if (isFinished && start && !completedRef.current) {
            handleFinish();
        }
    }, [isFinished, start, handleFinish]);

    const handleType = (value: string) => {
        if (completedRef.current) return;
        if (value.length > text.length) return;

        const t = Date.now();
        if (!start) {
            setStart(t);
            setNow(t);
        }
        lastActiveTimeRef.current = t;

        const ts = start ? t - start : 0;

        // Inter-key latency
        if (lastKeyTimestampRef.current) {
            const delta = t - lastKeyTimestampRef.current;
            if (delta > 0 && delta < 5000) {
                latenciesRef.current.push(delta);
            }
        }
        lastKeyTimestampRef.current = t;

        // Character check & backspace handling
        if (value.length > typed.length) {
            const addedChar = value[value.length - 1];
            const targetChar = text[value.length - 1];
            const isCorrect = addedChar === targetChar;

            if (!isCorrect) {
                errorsCountRef.current++;
            }

            keystrokesRef.current.push({
                timestamp: ts,
                key: addedChar,
                isCorrect,
                isCorrection: false,
                position: value.length - 1,
            });
        } else if (value.length < typed.length) {
            // Correction / backspace
            keystrokesRef.current.push({
                timestamp: ts,
                key: "Backspace",
                isCorrect: false,
                isCorrection: true,
                position: value.length,
            });
        }

        setTyped(value);
    };

    const correctChars = [...typed].filter((c, i) => c === text[i]).length;
    const minutes = Math.max(elapsedSeconds, 1) / 60;
    const currentWpm = Math.round(correctChars / 5 / minutes);
    const currentAcc = typed.length ? Math.round((correctChars / typed.length) * 100) : 100;
    const progressPercent = text.length ? Math.min(100, Math.round((typed.length / text.length) * 100)) : 0;

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col bg-canvas select-none"
            onClick={() => inputRef.current?.focus()}
        >
            {/* Top Bar */}
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
                <span className="micro text-muted uppercase tracking-wider">
                    {passage.category || "Prose"} · {getDifficultyLabel(passage.difficulty)} · {formatSoundLabel(soundMode)}
                </span>
                <button
                    type="button"
                    onClick={() => {
                        stopSound();
                        onAbort();
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-muted hover:text-ink transition-colors cursor-pointer"
                >
                    <X className="h-4 w-4" /> Abort
                </button>
            </div>

            {/* Center Canvas */}
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-24">
                <p
                    className="text-[22px] leading-[1.75] tracking-[0.005em] sm:text-[26px] font-sans"
                    aria-hidden="true"
                >
                    {[...text].map((ch, i) => {
                        const state =
                            i < typed.length
                                ? typed[i] === ch
                                    ? "ok"
                                    : "bad"
                                : i === typed.length
                                ? "cur"
                                : "todo";

                        return (
                            <span
                                key={i}
                                className={clsx(
                                    state === "ok" && "text-ink",
                                    state === "bad" && "rounded-[3px] text-[#B03A16] bg-[#FDE9E1] dark:bg-[#F26B3A]/20 dark:text-[#FFA183]",
                                    state === "cur" && "caret text-ink-soft",
                                    state === "todo" && "text-muted/60"
                                )}
                            >
                                {ch}
                            </span>
                        );
                    })}
                </p>

                <label className="sr-only" htmlFor="cognitype-input">
                    Type the passage shown above
                </label>
                <textarea
                    id="cognitype-input"
                    ref={inputRef}
                    value={typed}
                    onChange={(e) => handleType(e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="absolute h-px w-px opacity-0 pointer-events-none"
                    aria-describedby="typing-hud"
                />

                <p className="mt-6 text-[12.5px] text-muted">
                    {start
                        ? "Keep going — the test ends when you finish the passage or after 60 s."
                        : "Start typing to begin. Backspace is allowed; paste is not."}
                </p>
            </div>

            {/* Floating Bottom HUD */}
            <div
                id="typing-hud"
                role="status"
                aria-live="off"
                className="fixed inset-x-0 bottom-0 flex justify-center pb-6 pointer-events-none"
            >
                <div className="flex items-center gap-6 rounded-full border border-hairline bg-surface/90 py-2 pl-2 pr-6 shadow-soft backdrop-blur-sm pointer-events-auto">
                    <RingProgress
                        value={elapsedSeconds / TEST_LIMIT_SECONDS}
                        size={44}
                        stroke={4}
                        color="var(--primary-soft-2)"
                        label={`${Math.round(TEST_LIMIT_SECONDS - elapsedSeconds)} seconds left`}
                    >
                        <span className="tnum text-[11px] font-bold text-muted">
                            {Math.max(0, Math.round(TEST_LIMIT_SECONDS - elapsedSeconds))}
                        </span>
                    </RingProgress>
                    <span>
                        <span className="micro block text-muted">WPM</span>
                        <span className="tnum block text-[16px] font-bold text-ink-soft">
                            {start ? currentWpm : "—"}
                        </span>
                    </span>
                    <span>
                        <span className="micro block text-muted">Accuracy</span>
                        <span className="tnum block text-[16px] font-bold text-ink-soft">
                            {currentAcc}%
                        </span>
                    </span>
                    <span>
                        <span className="micro block text-muted">Progress</span>
                        <span className="tnum block text-[16px] font-bold text-ink-soft">
                            {progressPercent}%
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
}
