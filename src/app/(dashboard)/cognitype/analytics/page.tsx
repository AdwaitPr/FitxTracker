"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
    Brain,
    TrendingUp,
    Clock,
    Volume2,
    Sun,
    Moon,
    Sunset,
    Activity,
} from "lucide-react";
import { getFocusScoreColor } from "@/lib/cognitype/focus-scorer";

const textPrimary = "#F1F1F6";
const textMuted = "#8B8B9E";
const purple = "#7c3aed";
const purpleLight = "#a78bfa";
const borderColor = "rgba(255,255,255,0.08)";

interface AnalyticsData {
    totalSessions: number;
    totalTimeMs: number;
    focusTrend: { date: string; score: number; difficulty: number; soundType: string | null }[];
    weeklyTrend: { week: string; avgScore: number; sessions: number }[];
    soundComparison: { sound: string; avgScore: number; sessions: number }[];
    peakHours: { timeOfDay: string; avgScore: number; sessions: number }[];
    fatigueTrend: { date: string; fatigueSlope: number }[];
    durationPerformance: { durationMin: number; score: number }[];
}

const timeIcons: Record<string, typeof Sun> = {
    morning: Sun,
    afternoon: Sun,
    evening: Sunset,
    night: Moon,
};

const soundLabels: Record<string, string> = {
    silence: "🔇 Silence",
    brown_noise: "🟤 Brown",
    pink_noise: "🩷 Pink",
    ambient: "🎵 Ambient",
    rhythmic: "🥁 Rhythmic",
};

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/cognitype/analytics")
            .then((r) => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading || !data) {
        return (
            <div className="animate-fade-in">
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "32px" }}>
                    <span className="gradient-text">Analytics</span>
                </h1>
                <Card>
                    <p style={{ textAlign: "center", padding: "48px 0", color: textMuted }}>
                        Loading analytics...
                    </p>
                </Card>
            </div>
        );
    }

    if (data.totalSessions === 0) {
        return (
            <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "32px" }}>
                    <span className="gradient-text">Analytics</span>
                </h1>
                <Card>
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                        <Activity
                            style={{
                                width: "48px",
                                height: "48px",
                                margin: "0 auto 12px",
                                display: "block",
                                color: textMuted,
                            }}
                        />
                        <p style={{ fontSize: "16px", fontWeight: 600, color: textPrimary, marginBottom: "4px" }}>
                            Not enough data yet
                        </p>
                        <p style={{ fontSize: "13px", color: textMuted, marginBottom: "16px" }}>
                            Complete at least 3 sessions to unlock analytics
                        </p>
                        <Link
                            href="/cognitype"
                            style={{
                                padding: "10px 24px",
                                borderRadius: "10px",
                                background: `linear-gradient(135deg, ${purple}, #9333ea)`,
                                color: "#fff",
                                fontSize: "14px",
                                fontWeight: 600,
                                textDecoration: "none",
                            }}
                        >
                            Start Session
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    const avgScore =
        data.focusTrend.length > 0
            ? Math.round(
                data.focusTrend.reduce((a, b) => a + b.score, 0) /
                data.focusTrend.length
            )
            : 0;
    const totalMinutes = Math.round(data.totalTimeMs / 60000);

    // Focus trend chart (SVG)
    const chartWidth = 700;
    const chartHeight = 200;
    const chartPadding = 40;
    const maxScore = 100;
    const trendData = data.focusTrend.slice(-20); // Last 20 sessions

    return (
        <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: textPrimary, marginBottom: "24px" }}>
                <span className="gradient-text">Analytics</span>
            </h1>

            {/* Summary stats */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "10px",
                    marginBottom: "16px",
                }}
            >
                {[
                    { label: "Sessions", value: data.totalSessions, color: purpleLight },
                    { label: "Avg Score", value: avgScore, color: getFocusScoreColor(avgScore) },
                    { label: "Total Time", value: `${totalMinutes}m`, color: "#22d3ee" },
                    {
                        label: "Best Score",
                        value: Math.round(
                            Math.max(...data.focusTrend.map((t) => t.score), 0)
                        ),
                        color: "#10b981",
                    },
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
                        <p style={{ fontSize: "22px", fontWeight: 700, color: stat.color }}>
                            {stat.value}
                        </p>
                    </Card>
                ))}
            </div>

            {/* Focus Trend Chart */}
            <Card style={{ marginBottom: "16px" }}>
                <h3
                    style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: textPrimary,
                        marginBottom: "16px",
                    }}
                >
                    Focus Stability Trend
                </h3>
                {trendData.length > 1 ? (
                    <svg
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        style={{ width: "100%", height: "auto" }}
                    >
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map((v) => {
                            const y =
                                chartPadding +
                                ((maxScore - v) / maxScore) * (chartHeight - chartPadding * 2);
                            return (
                                <g key={v}>
                                    <line
                                        x1={chartPadding}
                                        y1={y}
                                        x2={chartWidth - chartPadding}
                                        y2={y}
                                        stroke={borderColor}
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={chartPadding - 8}
                                        y={y + 4}
                                        fill={textMuted}
                                        fontSize="10"
                                        textAnchor="end"
                                    >
                                        {v}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Line + dots */}
                        {trendData.map((point, i) => {
                            const x =
                                chartPadding +
                                (i / (trendData.length - 1)) *
                                (chartWidth - chartPadding * 2);
                            const y =
                                chartPadding +
                                ((maxScore - point.score) / maxScore) *
                                (chartHeight - chartPadding * 2);
                            const color = getFocusScoreColor(point.score);

                            return (
                                <g key={i}>
                                    {i > 0 && (
                                        <line
                                            x1={
                                                chartPadding +
                                                ((i - 1) / (trendData.length - 1)) *
                                                (chartWidth - chartPadding * 2)
                                            }
                                            y1={
                                                chartPadding +
                                                ((maxScore - trendData[i - 1].score) / maxScore) *
                                                (chartHeight - chartPadding * 2)
                                            }
                                            x2={x}
                                            y2={y}
                                            stroke={purpleLight}
                                            strokeWidth="2"
                                            opacity="0.6"
                                        />
                                    )}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="5"
                                        fill={color}
                                        stroke="rgba(0,0,0,0.3)"
                                        strokeWidth="1"
                                    />
                                </g>
                            );
                        })}
                    </svg>
                ) : (
                    <p style={{ fontSize: "13px", color: textMuted, textAlign: "center" }}>
                        Need at least 2 sessions for trend visualization
                    </p>
                )}
            </Card>

            {/* Sound Comparison */}
            {data.soundComparison.length > 0 && (
                <Card style={{ marginBottom: "16px" }}>
                    <h3
                        style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: textPrimary,
                            marginBottom: "16px",
                        }}
                    >
                        <Volume2
                            style={{
                                width: "16px",
                                height: "16px",
                                display: "inline",
                                verticalAlign: "middle",
                                marginRight: "6px",
                            }}
                        />
                        Sound Performance
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {data.soundComparison
                            .sort((a, b) => b.avgScore - a.avgScore)
                            .map((item, i) => {
                                const isTop = i === 0 && data.soundComparison.length > 1;
                                return (
                                    <div
                                        key={item.sound}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "10px 14px",
                                            borderRadius: "10px",
                                            border: `1px solid ${isTop ? "#10b98130" : borderColor
                                                }`,
                                            background: isTop
                                                ? "rgba(16, 185, 129, 0.05)"
                                                : "transparent",
                                        }}
                                    >
                                        <span style={{ fontSize: "14px", minWidth: "100px" }}>
                                            {soundLabels[item.sound] || item.sound}
                                        </span>
                                        <div
                                            style={{
                                                flex: 1,
                                                height: "8px",
                                                borderRadius: "4px",
                                                background: borderColor,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: "100%",
                                                    width: `${item.avgScore}%`,
                                                    borderRadius: "4px",
                                                    background: getFocusScoreColor(item.avgScore),
                                                }}
                                            />
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "14px",
                                                fontWeight: 700,
                                                color: getFocusScoreColor(item.avgScore),
                                                minWidth: "30px",
                                                textAlign: "right",
                                            }}
                                        >
                                            {Math.round(item.avgScore)}
                                        </span>
                                        <span style={{ fontSize: "11px", color: textMuted }}>
                                            ({item.sessions})
                                        </span>
                                        {isTop && (
                                            <span
                                                style={{
                                                    fontSize: "10px",
                                                    fontWeight: 600,
                                                    padding: "2px 8px",
                                                    borderRadius: "6px",
                                                    background: "rgba(16, 185, 129, 0.15)",
                                                    color: "#10b981",
                                                }}
                                            >
                                                BEST
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </Card>
            )}

            {/* Peak Hours */}
            {data.peakHours.length > 0 && (
                <Card style={{ marginBottom: "16px" }}>
                    <h3
                        style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: textPrimary,
                            marginBottom: "16px",
                        }}
                    >
                        Peak Cognitive Hours
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                        {data.peakHours.map((item, i) => {
                            const isTop = i === 0;
                            return (
                                <div
                                    key={item.timeOfDay}
                                    style={{
                                        padding: "14px",
                                        borderRadius: "12px",
                                        border: `1px solid ${isTop ? "#10b98130" : borderColor}`,
                                        background: isTop ? "rgba(16, 185, 129, 0.05)" : "transparent",
                                        textAlign: "center",
                                    }}
                                >
                                    <p style={{ fontSize: "13px", color: textMuted, marginBottom: "4px", textTransform: "capitalize" }}>
                                        {item.timeOfDay}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "24px",
                                            fontWeight: 700,
                                            color: getFocusScoreColor(item.avgScore),
                                        }}
                                    >
                                        {Math.round(item.avgScore)}
                                    </p>
                                    <p style={{ fontSize: "11px", color: textMuted }}>
                                        {item.sessions} sessions
                                    </p>
                                    {isTop && (
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                fontWeight: 600,
                                                padding: "2px 8px",
                                                borderRadius: "6px",
                                                background: "rgba(16, 185, 129, 0.15)",
                                                color: "#10b981",
                                                marginTop: "4px",
                                                display: "inline-block",
                                            }}
                                        >
                                            PEAK
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Fatigue Trend */}
            {data.fatigueTrend.length > 2 && (
                <Card>
                    <h3
                        style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: textPrimary,
                            marginBottom: "12px",
                        }}
                    >
                        Fatigue Resistance Over Time
                    </h3>
                    <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", height: "80px" }}>
                        {data.fatigueTrend.slice(-20).map((item, i) => {
                            const absSlope = Math.abs(item.fatigueSlope);
                            const normalized = Math.min(absSlope / 30, 1); // Normalize to 30ms max
                            const height = Math.max(8, normalized * 72);
                            const color = item.fatigueSlope > 10 ? "#ef4444" : item.fatigueSlope > 5 ? "#f59e0b" : "#10b981";

                            return (
                                <div
                                    key={i}
                                    style={{
                                        flex: 1,
                                        height: `${height}px`,
                                        borderRadius: "3px 3px 0 0",
                                        background: color,
                                        opacity: 0.7,
                                    }}
                                    title={`${item.fatigueSlope.toFixed(1)}ms/quarter`}
                                />
                            );
                        })}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "8px",
                        }}
                    >
                        <span style={{ fontSize: "10px", color: textMuted }}>
                            🟢 Low fatigue
                        </span>
                        <span style={{ fontSize: "10px", color: textMuted }}>
                            🔴 High fatigue
                        </span>
                    </div>
                </Card>
            )}
        </div>
    );
}
