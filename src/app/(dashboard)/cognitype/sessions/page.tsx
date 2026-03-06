"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Brain, Clock, Target, Zap, ChevronRight } from "lucide-react";
import { getFocusScoreColor, getFocusScoreLabel } from "@/lib/cognitype/focus-scorer";

const textPrimary = "#F1F1F6";
const textMuted = "#8B8B9E";
const borderColor = "rgba(255,255,255,0.08)";

interface Session {
    id: string;
    startedAt: string;
    durationMs: number | null;
    soundType: string | null;
    timeOfDay: string;
    passage: { title: string; difficulty: number };
    metrics: {
        focusStabilityScore: number;
        meanInterKeyLatency: number;
        errorRate: number;
        switchCount: number;
    } | null;
}

const difficultyColors = ["", "#10b981", "#f59e0b", "#ef4444"];

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/cognitype/sessions?limit=50")
            .then((r) => r.json())
            .then(setSessions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const formatTime = (ms: number) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "32px" }}>
                    <span className="gradient-text">Session History</span>
                </h1>
                <Card>
                    <p style={{ textAlign: "center", padding: "48px 0", color: textMuted }}>
                        Loading...
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h1
                style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: textPrimary,
                    marginBottom: "24px",
                }}
            >
                <span className="gradient-text">Session History</span>
            </h1>

            {sessions.length === 0 ? (
                <Card>
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                        <Brain
                            style={{
                                width: "48px",
                                height: "48px",
                                margin: "0 auto 12px",
                                display: "block",
                                color: textMuted,
                            }}
                        />
                        <p style={{ fontSize: "16px", fontWeight: 600, color: textPrimary, marginBottom: "4px" }}>
                            No sessions yet
                        </p>
                        <p style={{ fontSize: "13px", color: textMuted, marginBottom: "16px" }}>
                            Complete a typing session to see your history
                        </p>
                        <Link
                            href="/cognitype"
                            style={{
                                padding: "10px 24px",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                                color: "#fff",
                                fontSize: "14px",
                                fontWeight: 600,
                                textDecoration: "none",
                            }}
                        >
                            Start First Session
                        </Link>
                    </div>
                </Card>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {sessions.map((s) => {
                        const score = s.metrics?.focusStabilityScore || 0;
                        const scoreColor = getFocusScoreColor(score);
                        const accuracy = s.metrics
                            ? Math.round((1 - s.metrics.errorRate) * 100)
                            : 0;

                        return (
                            <Link
                                key={s.id}
                                href={`/cognitype/sessions/${s.id}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <div
                                    style={{
                                        padding: "14px 18px",
                                        borderRadius: "14px",
                                        border: `1px solid ${borderColor}`,
                                        background: "rgba(255,255,255,0.03)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "14px",
                                        cursor: "pointer",
                                        transition: "border-color 0.2s",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.borderColor = "#7c3aed")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.borderColor = borderColor)
                                    }
                                >
                                    {/* Score circle */}
                                    <div
                                        style={{
                                            width: "44px",
                                            height: "44px",
                                            borderRadius: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: `${scoreColor}15`,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "16px",
                                                fontWeight: 800,
                                                color: scoreColor,
                                            }}
                                        >
                                            {Math.round(score)}
                                        </span>
                                    </div>

                                    {/* Session info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "14px",
                                                    fontWeight: 600,
                                                    color: textPrimary,
                                                }}
                                            >
                                                {s.passage.title}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "10px",
                                                    fontWeight: 600,
                                                    padding: "1px 6px",
                                                    borderRadius: "4px",
                                                    background: `${difficultyColors[s.passage.difficulty]}20`,
                                                    color: difficultyColors[s.passage.difficulty],
                                                }}
                                            >
                                                L{s.passage.difficulty}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "12px",
                                                marginTop: "4px",
                                            }}
                                        >
                                            <span style={{ fontSize: "11px", color: textMuted }}>
                                                {new Date(s.startedAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                            {s.durationMs && (
                                                <span style={{ fontSize: "11px", color: textMuted }}>
                                                    ⏱ {formatTime(s.durationMs)}
                                                </span>
                                            )}
                                            <span style={{ fontSize: "11px", color: textMuted }}>
                                                🎯 {accuracy}%
                                            </span>
                                            {s.soundType && s.soundType !== "silence" && (
                                                <span style={{ fontSize: "11px", color: textMuted }}>
                                                    🔊 {s.soundType.replace("_", " ")}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <ChevronRight
                                        style={{ width: "18px", height: "18px", color: textMuted }}
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
