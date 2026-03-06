"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    Brain,
    Play,
    ChevronRight,
    BookOpen,
    Zap,
    Flame,
    Volume2,
    VolumeX,
} from "lucide-react";
import {
    computeSessionMetrics,
    type RawKeystroke,
    type RawAttentionEvent,
} from "@/lib/cognitype/metrics-calculator";
import {
    computeFocusScore,
    getFocusScoreColor,
    getFocusScoreLabel,
} from "@/lib/cognitype/focus-scorer";
import {
    startSound,
    stopSound,
    setVolume,
    SOUND_MODES,
    type SoundMode,
} from "@/lib/cognitype/sound-engine";

const textPrimary = "#F1F1F6";
const textMuted = "#8B8B9E";
const purple = "#7c3aed";
const purpleLight = "#a78bfa";
const borderColor = "rgba(255,255,255,0.08)";
const bgCard = "rgba(255,255,255,0.04)";

interface Passage {
    id: string;
    title: string;
    content: string;
    difficulty: number;
    wordCount: number;
    category: string | null;
}

type Phase = "select" | "typing" | "results";

const difficultyLabels = ["", "Simple", "Moderate", "Complex"];
const difficultyColors = ["", "#10b981", "#f59e0b", "#ef4444"];
const difficultyIcons = [null, BookOpen, Zap, Flame];

export default function CogniTypePage() {
    const router = useRouter();
    const [phase, setPhase] = useState<Phase>("select");
    const [passages, setPassages] = useState<Passage[]>([]);
    const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
    const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
    const [soundMode, setSoundMode] = useState<SoundMode>("silence");
    const [volume, setVolumeState] = useState(0.5);
    const [loading, setLoading] = useState(true);

    // Typing state
    const [cursorPos, setCursorPos] = useState(0);
    const [errors, setErrors] = useState<Set<number>>(new Set());
    const [startTime, setStartTime] = useState(0);
    const [elapsedMs, setElapsedMs] = useState(0);
    const [keystrokeLog, setKeystrokeLog] = useState<RawKeystroke[]>([]);
    const [attentionLog, setAttentionLog] = useState<RawAttentionEvent[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [lastActiveTime, setLastActiveTime] = useState(0);

    // Results state
    const [saving, setSaving] = useState(false);
    const [sessionResult, setSessionResult] = useState<{
        metrics: ReturnType<typeof computeSessionMetrics>;
        focusScore: ReturnType<typeof computeFocusScore>;
        durationMs: number;
    } | null>(null);

    // Refs
    const typingAreaRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<number | null>(null);
    const idleTimerRef = useRef<number | null>(null);

    // Fetch passages
    useEffect(() => {
        fetch("/api/cognitype/passages")
            .then((r) => r.json())
            .then(setPassages)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Timer
    useEffect(() => {
        if (phase === "typing" && startTime && !isComplete) {
            timerRef.current = window.setInterval(() => {
                setElapsedMs(performance.now() - startTime);
            }, 100);
            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [phase, startTime, isComplete]);

    // Attention tracking
    useEffect(() => {
        if (phase !== "typing") return;

        const handleVisibility = () => {
            const ts = performance.now() - startTime;
            if (document.hidden) {
                setAttentionLog((prev) => [
                    ...prev,
                    { type: "visibility_hidden", timestamp: ts },
                ]);
            } else {
                const lastHidden = attentionLog.findLast(
                    (e) => e.type === "visibility_hidden"
                );
                const duration = lastHidden ? ts - lastHidden.timestamp : 0;
                setAttentionLog((prev) => [
                    ...prev,
                    { type: "visibility_visible", timestamp: ts, duration },
                ]);
            }
        };

        const handleBlur = () => {
            const ts = performance.now() - startTime;
            setAttentionLog((prev) => [...prev, { type: "blur", timestamp: ts }]);
        };

        const handleFocus = () => {
            const ts = performance.now() - startTime;
            const lastBlur = attentionLog.findLast((e) => e.type === "blur");
            const duration = lastBlur ? ts - lastBlur.timestamp : 0;
            setAttentionLog((prev) => [
                ...prev,
                { type: "focus", timestamp: ts, duration },
            ]);
        };

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("blur", handleBlur);
        window.addEventListener("focus", handleFocus);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("focus", handleFocus);
        };
    }, [phase, startTime, attentionLog]);

    // Idle detection
    useEffect(() => {
        if (phase !== "typing" || isComplete) return;

        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

        idleTimerRef.current = window.setTimeout(() => {
            const ts = performance.now() - startTime;
            setAttentionLog((prev) => [
                ...prev,
                { type: "idle", timestamp: ts, duration: 3000 },
            ]);
        }, 3000);

        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [lastActiveTime, phase, isComplete, startTime]);

    // Start session
    const handleStart = useCallback(
        (passage: Passage) => {
            setSelectedPassage(passage);
            setCursorPos(0);
            setErrors(new Set());
            setKeystrokeLog([]);
            setAttentionLog([]);
            setIsComplete(false);
            setSessionResult(null);
            const now = performance.now();
            setStartTime(now);
            setLastActiveTime(now);
            setPhase("typing");
            startSound(soundMode, volume);

            setTimeout(() => typingAreaRef.current?.focus(), 100);
        },
        [soundMode, volume]
    );

    // Handle keypress
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!selectedPassage || isComplete) return;

            e.preventDefault();
            const ts = performance.now() - startTime;
            setLastActiveTime(performance.now());

            const targetChar = selectedPassage.content[cursorPos];

            if (e.key === "Backspace") {
                // Correction
                setKeystrokeLog((prev) => [
                    ...prev,
                    {
                        timestamp: ts,
                        key: "Backspace",
                        isCorrect: false,
                        isCorrection: true,
                        position: cursorPos,
                    },
                ]);
                if (cursorPos > 0) {
                    const newPos = cursorPos - 1;
                    setCursorPos(newPos);
                    setErrors((prev) => {
                        const next = new Set(prev);
                        next.delete(newPos);
                        return next;
                    });
                }
                return;
            }

            // Ignore non-printable keys
            if (e.key.length !== 1 && e.key !== "Enter" && e.key !== "Tab") return;

            const typedChar = e.key === "Enter" ? "\n" : e.key;
            const isCorrect = typedChar === targetChar;

            setKeystrokeLog((prev) => [
                ...prev,
                {
                    timestamp: ts,
                    key: typedChar,
                    isCorrect,
                    isCorrection: false,
                    position: cursorPos,
                },
            ]);

            if (!isCorrect) {
                setErrors((prev) => new Set(prev).add(cursorPos));
            }

            const newPos = cursorPos + 1;
            setCursorPos(newPos);

            // Check completion
            if (newPos >= selectedPassage.content.length) {
                const durationMs = performance.now() - startTime;
                setIsComplete(true);
                setElapsedMs(durationMs);
                stopSound();

                // Compute metrics
                const allKeystrokes = [
                    ...keystrokeLog,
                    {
                        timestamp: ts,
                        key: typedChar,
                        isCorrect,
                        isCorrection: false,
                        position: cursorPos,
                    },
                ];
                const metrics = computeSessionMetrics(
                    allKeystrokes,
                    attentionLog,
                    durationMs
                );
                const focus = computeFocusScore(metrics, []);

                setSessionResult({
                    metrics,
                    focusScore: focus,
                    durationMs,
                });
                setPhase("results");
            }
        },
        [
            selectedPassage,
            cursorPos,
            isComplete,
            startTime,
            keystrokeLog,
            attentionLog,
        ]
    );

    // Save session
    const handleSave = async () => {
        if (!sessionResult || !selectedPassage) return;
        setSaving(true);

        try {
            await fetch("/api/cognitype/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    passageId: selectedPassage.id,
                    soundType: soundMode,
                    durationMs: sessionResult.durationMs,
                    keystrokeEvents: keystrokeLog,
                    attentionEvents: attentionLog,
                    metrics: {
                        ...sessionResult.metrics,
                        focusStabilityScore: sessionResult.focusScore.totalScore,
                    },
                }),
            });
        } catch (err) {
            console.error("Failed to save:", err);
        } finally {
            setSaving(false);
        }
    };

    const formatTime = (ms: number) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    const filteredPassages = difficultyFilter
        ? passages.filter((p) => p.difficulty === difficultyFilter)
        : passages;

    // ── PASSAGE SELECTOR ──
    if (phase === "select") {
        return (
            <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
                <div style={{ marginBottom: "32px" }}>
                    <h1
                        style={{
                            fontSize: "28px",
                            fontWeight: 800,
                            color: textPrimary,
                            marginBottom: "8px",
                        }}
                    >
                        <span className="gradient-text">CogniType</span>
                    </h1>
                    <p style={{ fontSize: "14px", color: textMuted }}>
                        Select a passage and start typing to measure your cognitive
                        performance
                    </p>
                </div>

                {/* Sound selector */}
                <Card style={{ marginBottom: "16px" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "12px",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: textMuted,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            {soundMode === "silence" ? (
                                <VolumeX
                                    style={{
                                        width: "14px",
                                        height: "14px",
                                        display: "inline",
                                        marginRight: "6px",
                                        verticalAlign: "middle",
                                    }}
                                />
                            ) : (
                                <Volume2
                                    style={{
                                        width: "14px",
                                        height: "14px",
                                        display: "inline",
                                        marginRight: "6px",
                                        verticalAlign: "middle",
                                    }}
                                />
                            )}
                            Ambient Sound
                        </p>
                        {soundMode !== "silence" && (
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume * 100}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value) / 100;
                                    setVolumeState(v);
                                    setVolume(v);
                                }}
                                style={{ width: "80px", accentColor: purple }}
                            />
                        )}
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {SOUND_MODES.map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => {
                                    setSoundMode(mode.id);
                                    if (mode.id === "silence") stopSound();
                                    else startSound(mode.id, volume);
                                }}
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    border:
                                        soundMode === mode.id
                                            ? `2px solid ${purple}`
                                            : `1px solid ${borderColor}`,
                                    background:
                                        soundMode === mode.id ? `${purple}20` : "transparent",
                                    color: soundMode === mode.id ? purpleLight : textMuted,
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                }}
                            >
                                {mode.emoji} {mode.label}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Difficulty filter */}
                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "16px",
                    }}
                >
                    <button
                        onClick={() => setDifficultyFilter(null)}
                        style={{
                            padding: "6px 16px",
                            borderRadius: "8px",
                            border: `1px solid ${difficultyFilter === null ? purple : borderColor
                                }`,
                            background: difficultyFilter === null ? `${purple}20` : "transparent",
                            color: difficultyFilter === null ? purpleLight : textMuted,
                            fontSize: "13px",
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        All
                    </button>
                    {[1, 2, 3].map((d) => (
                        <button
                            key={d}
                            onClick={() => setDifficultyFilter(d)}
                            style={{
                                padding: "6px 16px",
                                borderRadius: "8px",
                                border: `1px solid ${difficultyFilter === d ? difficultyColors[d] : borderColor
                                    }`,
                                background:
                                    difficultyFilter === d
                                        ? `${difficultyColors[d]}20`
                                        : "transparent",
                                color:
                                    difficultyFilter === d ? difficultyColors[d] : textMuted,
                                fontSize: "13px",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            L{d}: {difficultyLabels[d]}
                        </button>
                    ))}
                </div>

                {/* Passage cards */}
                {loading ? (
                    <Card>
                        <p style={{ textAlign: "center", padding: "32px", color: textMuted }}>
                            Loading passages...
                        </p>
                    </Card>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                        }}
                    >
                        {filteredPassages.map((p) => {
                            const DiffIcon = difficultyIcons[p.difficulty];
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => handleStart(p)}
                                    style={{
                                        padding: "16px 20px",
                                        borderRadius: "14px",
                                        border: `1px solid ${borderColor}`,
                                        background: bgCard,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        transition: "border-color 0.2s",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.borderColor = purple)
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.borderColor = borderColor)
                                    }
                                >
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "15px",
                                                    fontWeight: 600,
                                                    color: textPrimary,
                                                }}
                                            >
                                                {p.title}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "10px",
                                                    fontWeight: 600,
                                                    padding: "2px 8px",
                                                    borderRadius: "6px",
                                                    background: `${difficultyColors[p.difficulty]}20`,
                                                    color: difficultyColors[p.difficulty],
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.05em",
                                                }}
                                            >
                                                L{p.difficulty}
                                            </span>
                                        </div>
                                        <p
                                            style={{
                                                fontSize: "12px",
                                                color: textMuted,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                maxWidth: "500px",
                                            }}
                                        >
                                            {p.content.substring(0, 80)}...
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "11px",
                                                color: textMuted,
                                                marginTop: "4px",
                                            }}
                                        >
                                            {p.wordCount} words · {p.category}
                                        </p>
                                    </div>
                                    <ChevronRight
                                        style={{ width: "20px", height: "20px", color: textMuted }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ── TYPING PHASE ──
    if (phase === "typing" && selectedPassage) {
        const progress = (cursorPos / selectedPassage.content.length) * 100;
        const wpm =
            elapsedMs > 0
                ? Math.round((cursorPos / 5 / (elapsedMs / 60000)))
                : 0;

        return (
            <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "16px",
                    }}
                >
                    <div>
                        <h2
                            style={{ fontSize: "18px", fontWeight: 700, color: textPrimary }}
                        >
                            {selectedPassage.title}
                        </h2>
                        <p style={{ fontSize: "12px", color: textMuted }}>
                            Level {selectedPassage.difficulty} ·{" "}
                            {difficultyLabels[selectedPassage.difficulty]}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: textMuted }}>
                            {formatTime(elapsedMs)}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: purpleLight }}>
                            {wpm} WPM
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#f59e0b" }}>
                            {errors.size} errors
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div
                    style={{
                        height: "4px",
                        borderRadius: "2px",
                        background: borderColor,
                        marginBottom: "24px",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, ${purple}, ${purpleLight})`,
                            borderRadius: "2px",
                            transition: "width 0.1s",
                        }}
                    />
                </div>

                {/* Typing area */}
                <div
                    ref={typingAreaRef}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    style={{
                        padding: "28px",
                        borderRadius: "16px",
                        border: `1px solid ${borderColor}`,
                        background: bgCard,
                        outline: "none",
                        cursor: "text",
                        lineHeight: "2.2",
                        fontSize: "26px",
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                        letterSpacing: "0.02em",
                        minHeight: "200px",
                    }}
                >
                    {selectedPassage.content.split("").map((char, i) => {
                        let color = textMuted;
                        let bg = "transparent";
                        let decoration = "none";

                        if (i < cursorPos) {
                            if (errors.has(i)) {
                                color = "#ef4444";
                                bg = "rgba(239, 68, 68, 0.15)";
                                decoration = "underline";
                            } else {
                                color = "#10b981";
                            }
                        } else if (i === cursorPos) {
                            bg = `${purple}40`;
                            color = textPrimary;
                        }

                        return (
                            <span
                                key={i}
                                style={{
                                    color,
                                    backgroundColor: bg,
                                    textDecoration: decoration,
                                    borderBottom:
                                        i === cursorPos
                                            ? `2px solid ${purpleLight}`
                                            : "none",
                                    paddingBottom: i === cursorPos ? "2px" : "0",
                                }}
                            >
                                {char}
                            </span>
                        );
                    })}
                </div>

                <p
                    style={{
                        textAlign: "center",
                        fontSize: "12px",
                        color: textMuted,
                        marginTop: "16px",
                    }}
                >
                    Click the text area above and start typing. Your keystrokes, rhythm,
                    and focus are being tracked.
                </p>
            </div>
        );
    }

    // ── RESULTS PHASE ──
    if (phase === "results" && sessionResult && selectedPassage) {
        const { metrics, focusScore, durationMs } = sessionResult;
        const scoreColor = getFocusScoreColor(focusScore.totalScore);
        const scoreLabel = getFocusScoreLabel(focusScore.totalScore);
        const wpm = Math.round(
            (selectedPassage.content.length / 5) / (durationMs / 60000)
        );
        const accuracy = Math.round((1 - metrics.errorRate) * 100);

        const breakdownItems = [
            {
                label: "Attention Stability",
                value: focusScore.attentionStability,
                weight: "35%",
                color: "#10b981",
            },
            {
                label: "Switch Penalty",
                value: focusScore.switchingPenalty,
                weight: "25%",
                color: "#22d3ee",
            },
            {
                label: "Rhythm Consistency",
                value: focusScore.rhythmConsistency,
                weight: "25%",
                color: "#f59e0b",
            },
            {
                label: "Fatigue Resistance",
                value: focusScore.fatigueResistance,
                weight: "15%",
                color: "#a78bfa",
            },
        ];

        return (
            <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
                <h1
                    style={{
                        fontSize: "24px",
                        fontWeight: 800,
                        color: textPrimary,
                        marginBottom: "24px",
                        textAlign: "center",
                    }}
                >
                    Session Complete
                </h1>

                {/* Focus Score */}
                <Card style={{ marginBottom: "16px", textAlign: "center" }}>
                    <p
                        style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: textMuted,
                            marginBottom: "8px",
                        }}
                    >
                        Focus Stability Score
                    </p>
                    <p
                        style={{
                            fontSize: "56px",
                            fontWeight: 800,
                            color: scoreColor,
                            lineHeight: 1,
                        }}
                    >
                        {focusScore.totalScore}
                    </p>
                    <p
                        style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: scoreColor,
                            marginTop: "4px",
                        }}
                    >
                        {scoreLabel}
                    </p>
                </Card>

                {/* Quick stats */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "10px",
                        marginBottom: "16px",
                    }}
                >
                    {[
                        { label: "WPM", value: wpm, color: purpleLight },
                        { label: "Accuracy", value: `${accuracy}%`, color: "#10b981" },
                        { label: "Duration", value: formatTime(durationMs), color: "#22d3ee" },
                        { label: "Switches", value: metrics.switchCount, color: "#f59e0b" },
                    ].map((stat) => (
                        <Card key={stat.label}>
                            <p
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    color: textMuted,
                                    marginBottom: "4px",
                                }}
                            >
                                {stat.label}
                            </p>
                            <p
                                style={{
                                    fontSize: "20px",
                                    fontWeight: 700,
                                    color: stat.color,
                                }}
                            >
                                {stat.value}
                            </p>
                        </Card>
                    ))}
                </div>

                {/* Score breakdown */}
                <Card style={{ marginBottom: "16px" }}>
                    <h3
                        style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: textPrimary,
                            marginBottom: "16px",
                        }}
                    >
                        Score Breakdown
                    </h3>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                        }}
                    >
                        {breakdownItems.map((item) => (
                            <div key={item.label}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "4px",
                                    }}
                                >
                                    <span style={{ fontSize: "13px", color: textMuted }}>
                                        {item.label}{" "}
                                        <span style={{ fontSize: "10px", opacity: 0.6 }}>
                                            ({item.weight})
                                        </span>
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: item.color,
                                        }}
                                    >
                                        {Math.round(item.value * 100)}%
                                    </span>
                                </div>
                                <div
                                    style={{
                                        height: "6px",
                                        borderRadius: "3px",
                                        background: borderColor,
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "100%",
                                            width: `${item.value * 100}%`,
                                            borderRadius: "3px",
                                            background: item.color,
                                            transition: "width 0.5s ease",
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Signal details */}
                <Card style={{ marginBottom: "16px" }}>
                    <h3
                        style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: textPrimary,
                            marginBottom: "12px",
                        }}
                    >
                        Behavioral Signals
                    </h3>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "8px",
                        }}
                    >
                        {[
                            {
                                label: "Mean Inter-Key Latency",
                                value: `${Math.round(metrics.meanInterKeyLatency)}ms`,
                            },
                            {
                                label: "Latency Std Dev",
                                value: `${Math.round(metrics.latencyStdDev)}ms`,
                            },
                            {
                                label: "Pause Entropy",
                                value: metrics.pauseEntropy.toFixed(3),
                            },
                            {
                                label: "Error Rate",
                                value: `${(metrics.errorRate * 100).toFixed(1)}%`,
                            },
                            {
                                label: "Correction Latency",
                                value: `${Math.round(metrics.correctionLatency)}ms`,
                            },
                            {
                                label: "Switch Time Ratio",
                                value: `${(metrics.switchTimeRatio * 100).toFixed(1)}%`,
                            },
                            {
                                label: "Resume Latency",
                                value: `${Math.round(metrics.resumeLatency)}ms`,
                            },
                            {
                                label: "Fatigue Slope",
                                value: `${metrics.fatigueSlope > 0 ? "+" : ""}${metrics.fatigueSlope.toFixed(1)}ms/q`,
                            },
                        ].map((sig) => (
                            <div
                                key={sig.label}
                                style={{
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    border: `1px solid ${borderColor}`,
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "10px",
                                        color: textMuted,
                                        marginBottom: "2px",
                                    }}
                                >
                                    {sig.label}
                                </p>
                                <p
                                    style={{
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        color: textPrimary,
                                    }}
                                >
                                    {sig.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Actions */}
                <div style={{ display: "flex", gap: "10px" }}>
                    <Button onClick={handleSave} isLoading={saving} fullWidth>
                        Save Session
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setPhase("select");
                            stopSound();
                        }}
                        fullWidth
                    >
                        New Session
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}
