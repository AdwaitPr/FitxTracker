"use client";

import { useState, useEffect, use } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getFocusScoreColor, getFocusScoreLabel } from "@/lib/cognitype/focus-scorer";

const textPrimary = "#F1F1F6";
const textMuted = "#8B8B9E";
const purpleLight = "#a78bfa";
const borderColor = "rgba(255,255,255,0.08)";

interface SessionData {
    session: {
        id: string;
        startedAt: string;
        durationMs: number | null;
        soundType: string | null;
        timeOfDay: string;
        passage: { title: string; difficulty: number; content: string; wordCount: number };
        metrics: {
            focusStabilityScore: number;
            meanInterKeyLatency: number;
            latencyStdDev: number;
            pauseEntropy: number;
            errorRate: number;
            correctionLatency: number;
            switchCount: number;
            switchTimeRatio: number;
            resumeLatency: number;
            fatigueSlope: number;
        } | null;
    };
    baselines: { metric: string; baselineValue: number; stdDev: number; sampleCount: number }[];
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [data, setData] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/cognitype/sessions/${id}`)
            .then((r) => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const formatTime = (ms: number) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    if (loading || !data) {
        return (
            <div className="animate-fade-in">
                <Card>
                    <p style={{ textAlign: "center", padding: "48px 0", color: textMuted }}>
                        Loading session...
                    </p>
                </Card>
            </div>
        );
    }

    const { session: s, baselines } = data;
    const m = s.metrics;
    if (!m) return null;

    const scoreColor = getFocusScoreColor(m.focusStabilityScore);
    const scoreLabel = getFocusScoreLabel(m.focusStabilityScore);
    const accuracy = Math.round((1 - m.errorRate) * 100);
    const wpm = s.durationMs
        ? Math.round((s.passage.content.length / 5) / (s.durationMs / 60000))
        : 0;

    const getBaselineComparison = (metric: string, value: number) => {
        const b = baselines.find((bl) => bl.metric === metric);
        if (!b || b.sampleCount < 2) return null;
        const diff = value - b.baselineValue;
        const pct = b.baselineValue > 0 ? (diff / b.baselineValue) * 100 : 0;
        return { diff, pct, baseline: b.baselineValue };
    };

    const signals = [
        { label: "Mean Inter-Key Latency", metric: "meanInterKeyLatency", value: m.meanInterKeyLatency, unit: "ms", lower: true },
        { label: "Latency Std Dev", metric: "latencyStdDev", value: m.latencyStdDev, unit: "ms", lower: true },
        { label: "Pause Entropy", metric: "pauseEntropy", value: m.pauseEntropy, unit: "", lower: false },
        { label: "Error Rate", metric: "errorRate", value: m.errorRate * 100, unit: "%", lower: true },
        { label: "Correction Latency", metric: "correctionLatency", value: m.correctionLatency, unit: "ms", lower: true },
        { label: "Switch Count", metric: "", value: m.switchCount, unit: "", lower: true },
        { label: "Switch Time Ratio", metric: "", value: m.switchTimeRatio * 100, unit: "%", lower: true },
        { label: "Resume Latency", metric: "", value: m.resumeLatency, unit: "ms", lower: true },
        { label: "Fatigue Slope", metric: "fatigueSlope", value: m.fatigueSlope, unit: "ms/q", lower: true },
    ];

    return (
        <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <Link
                href="/cognitype/sessions"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    color: textMuted,
                    textDecoration: "none",
                    marginBottom: "16px",
                }}
            >
                <ArrowLeft style={{ width: "16px", height: "16px" }} /> Back to Sessions
            </Link>

            {/* Header */}
            <div style={{ marginBottom: "20px" }}>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: textPrimary }}>
                    {s.passage.title}
                </h1>
                <p style={{ fontSize: "13px", color: textMuted }}>
                    {new Date(s.startedAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}{" "}
                    · Level {s.passage.difficulty} · {s.timeOfDay}
                    {s.soundType && s.soundType !== "silence" && ` · 🔊 ${s.soundType.replace("_", " ")}`}
                </p>
            </div>

            {/* Score + Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <Card style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", color: textMuted, marginBottom: "4px" }}>Focus Score</p>
                    <p style={{ fontSize: "32px", fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{Math.round(m.focusStabilityScore)}</p>
                    <p style={{ fontSize: "11px", color: scoreColor, marginTop: "2px" }}>{scoreLabel}</p>
                </Card>
                <Card style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", color: textMuted, marginBottom: "4px" }}>WPM</p>
                    <p style={{ fontSize: "24px", fontWeight: 700, color: purpleLight }}>{wpm}</p>
                </Card>
                <Card style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", color: textMuted, marginBottom: "4px" }}>Accuracy</p>
                    <p style={{ fontSize: "24px", fontWeight: 700, color: "#10b981" }}>{accuracy}%</p>
                </Card>
                <Card style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", color: textMuted, marginBottom: "4px" }}>Duration</p>
                    <p style={{ fontSize: "24px", fontWeight: 700, color: "#22d3ee" }}>
                        {s.durationMs ? formatTime(s.durationMs) : "—"}
                    </p>
                </Card>
            </div>

            {/* Signal grid with baseline comparison */}
            <Card>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: textPrimary, marginBottom: "14px" }}>
                    Behavioral Signals
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    {signals.map((sig) => {
                        const comp = sig.metric ? getBaselineComparison(sig.metric, sig.metric === "errorRate" ? m.errorRate : (sig.value as number)) : null;
                        const formatted = sig.unit === "ms" || sig.unit === "ms/q"
                            ? `${Math.round(sig.value as number)}${sig.unit}`
                            : sig.unit === "%"
                                ? `${(sig.value as number).toFixed(1)}%`
                                : (sig.value as number).toFixed(3);

                        return (
                            <div
                                key={sig.label}
                                style={{
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    border: `1px solid ${borderColor}`,
                                }}
                            >
                                <p style={{ fontSize: "10px", color: textMuted, marginBottom: "2px" }}>
                                    {sig.label}
                                </p>
                                <p style={{ fontSize: "15px", fontWeight: 600, color: textPrimary }}>
                                    {formatted}
                                </p>
                                {comp && (
                                    <p
                                        style={{
                                            fontSize: "10px",
                                            marginTop: "2px",
                                            color:
                                                (sig.lower && comp.pct < 0) || (!sig.lower && comp.pct > 0)
                                                    ? "#10b981"
                                                    : comp.pct === 0
                                                        ? textMuted
                                                        : "#ef4444",
                                        }}
                                    >
                                        {comp.pct > 0 ? "+" : ""}
                                        {comp.pct.toFixed(0)}% vs baseline
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
