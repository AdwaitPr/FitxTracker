"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Heart,
    Moon,
    Brain,
    Check,
    AlertTriangle,
} from "lucide-react";
import {
    calculateRecoveryScore,
    getWorkoutRecommendation,
    getScoreColor,
} from "@/lib/alerts";

interface RecoveryLog {
    id: string;
    date: string;
    sleepHours: number | null;
    sleepQuality: string | null;
    gutStatus: string | null;
    stressLevel: number | null;
    notes: string | null;
}

const textPrimary = "#F1F1F6";
const textMuted = "#8B8B9E";
const purple = "#7c3aed";
const purpleLight = "#a78bfa";
const borderColor = "var(--border)";

const sleepQualities = ["Poor", "Fair", "Good", "Excellent"];
const gutStatuses = ["Good", "Bloated", "Uncomfortable"];

export default function RecoveryPage() {
    const [sleepHours, setSleepHours] = useState<number>(7);
    const [sleepQuality, setSleepQuality] = useState("Good");
    const [gutStatus, setGutStatus] = useState("Good");
    const [stressLevel, setStressLevel] = useState(5);
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [logs, setLogs] = useState<RecoveryLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = useCallback(async () => {
        try {
            const res = await fetch("/api/recovery?days=14");
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
                // Pre-fill from today's log if it exists
                const today = new Date().toISOString().split("T")[0];
                const todayLog = data.find(
                    (log: RecoveryLog) => log.date.split("T")[0] === today
                );
                if (todayLog) {
                    if (todayLog.sleepHours !== null) setSleepHours(todayLog.sleepHours);
                    if (todayLog.sleepQuality) setSleepQuality(todayLog.sleepQuality);
                    if (todayLog.gutStatus) setGutStatus(todayLog.gutStatus);
                    if (todayLog.stressLevel !== null) setStressLevel(todayLog.stressLevel);
                    if (todayLog.notes) setNotes(todayLog.notes);
                    setSaved(true);
                }
            }
        } catch (err) {
            console.error("Failed to fetch recovery logs:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/recovery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sleepHours,
                    sleepQuality,
                    gutStatus,
                    stressLevel,
                    notes: notes || undefined,
                }),
            });
            if (res.ok) {
                setSaved(true);
                fetchLogs();
            }
        } catch (err) {
            console.error("Failed to save recovery:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const score = calculateRecoveryScore({
        sleepHours,
        sleepQuality,
        stressLevel,
        gutStatus,
    });
    const recommendation = getWorkoutRecommendation({
        sleepHours,
        sleepQuality,
        stressLevel,
        gutStatus,
    });
    const scoreColor = getScoreColor(score);

    if (loading) {
        return (
            <div className="animate-fade-in">
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "32px" }}>
                    <span className="gradient-text">Recovery</span>
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
        <div className="animate-fade-in">
            <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "32px" }}>
                <span className="gradient-text">Recovery</span>
            </h1>

            {/* Recovery Score */}
            <Card style={{ marginBottom: "20px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                color: textMuted,
                                marginBottom: "4px",
                            }}
                        >
                            Recovery Score
                        </p>
                        <p style={{ fontSize: "36px", fontWeight: 800, color: scoreColor }}>
                            {score}
                            <span style={{ fontSize: "16px", fontWeight: 500, color: textMuted }}>
                                /100
                            </span>
                        </p>
                    </div>
                    <div
                        style={{
                            padding: "10px 16px",
                            borderRadius: "12px",
                            background:
                                recommendation.level === "optimal"
                                    ? "rgba(16, 185, 129, 0.1)"
                                    : recommendation.level === "normal"
                                        ? "rgba(245, 158, 11, 0.1)"
                                        : recommendation.level === "warning"
                                            ? "rgba(249, 115, 22, 0.1)"
                                            : "rgba(239, 68, 68, 0.1)",
                            border: `1px solid ${recommendation.level === "optimal"
                                    ? "rgba(16, 185, 129, 0.2)"
                                    : recommendation.level === "normal"
                                        ? "rgba(245, 158, 11, 0.2)"
                                        : recommendation.level === "warning"
                                            ? "rgba(249, 115, 22, 0.2)"
                                            : "rgba(239, 68, 68, 0.2)"
                                }`,
                            maxWidth: "260px",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "13px",
                                fontWeight: 500,
                                color: textPrimary,
                            }}
                        >
                            {recommendation.icon} {recommendation.message}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Quick Log Form */}
            <Card style={{ marginBottom: "20px" }}>
                <h2
                    style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: textPrimary,
                        marginBottom: "20px",
                    }}
                >
                    {saved ? "Update Today's Log" : "Log Today's Recovery"}
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Sleep Hours */}
                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "8px",
                            }}
                        >
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: textMuted,
                                }}
                            >
                                <Moon style={{ width: "16px", height: "16px" }} />
                                Sleep Hours
                            </label>
                            <span
                                style={{
                                    fontSize: "16px",
                                    fontWeight: 700,
                                    color: sleepHours >= 7 ? "#10b981" : sleepHours >= 6 ? "#f59e0b" : "#ef4444",
                                }}
                            >
                                {sleepHours}h
                            </span>
                        </div>
                        <input
                            type="range"
                            min="3"
                            max="12"
                            step="0.5"
                            value={sleepHours}
                            onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                            style={{ width: "100%", accentColor: purple }}
                        />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "4px",
                            }}
                        >
                            <span style={{ fontSize: "10px", color: textMuted }}>3h</span>
                            <span style={{ fontSize: "10px", color: textMuted }}>12h</span>
                        </div>
                    </div>

                    {/* Sleep Quality */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: textMuted,
                                marginBottom: "8px",
                            }}
                        >
                            Sleep Quality
                        </label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {sleepQualities.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => setSleepQuality(q)}
                                    style={{
                                        flex: 1,
                                        padding: "10px 8px",
                                        borderRadius: "10px",
                                        border:
                                            sleepQuality === q
                                                ? `2px solid ${purple}`
                                                : `1px solid ${borderColor}`,
                                        background:
                                            sleepQuality === q ? `${purple}20` : "transparent",
                                        color: sleepQuality === q ? purpleLight : textMuted,
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stress Level */}
                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "8px",
                            }}
                        >
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: textMuted,
                                }}
                            >
                                <Brain style={{ width: "16px", height: "16px" }} />
                                Stress Level
                            </label>
                            <span
                                style={{
                                    fontSize: "16px",
                                    fontWeight: 700,
                                    color:
                                        stressLevel <= 3
                                            ? "#10b981"
                                            : stressLevel <= 6
                                                ? "#f59e0b"
                                                : "#ef4444",
                                }}
                            >
                                {stressLevel}/10
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={stressLevel}
                            onChange={(e) => setStressLevel(parseInt(e.target.value))}
                            style={{ width: "100%", accentColor: purple }}
                        />
                    </div>

                    {/* Gut Status */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: textMuted,
                                marginBottom: "8px",
                            }}
                        >
                            Gut Status
                        </label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {gutStatuses.map((g) => (
                                <button
                                    key={g}
                                    onClick={() => setGutStatus(g)}
                                    style={{
                                        flex: 1,
                                        padding: "10px 8px",
                                        borderRadius: "10px",
                                        border:
                                            gutStatus === g
                                                ? `2px solid ${purple}`
                                                : `1px solid ${borderColor}`,
                                        background:
                                            gutStatus === g ? `${purple}20` : "transparent",
                                        color: gutStatus === g ? purpleLight : textMuted,
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: textMuted,
                                marginBottom: "8px",
                            }}
                        >
                            Notes (optional)
                        </label>
                        <textarea
                            placeholder="Any additional thoughts..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            style={{
                                width: "100%",
                                borderRadius: "12px",
                                padding: "12px 16px",
                                fontSize: "14px",
                                outline: "none",
                                background: "var(--bg-input)",
                                color: textPrimary,
                                border: `1px solid ${borderColor}`,
                                resize: "vertical",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>

                    <Button onClick={handleSave} isLoading={isSaving} fullWidth>
                        {saved ? (
                            <>
                                <Check style={{ width: "16px", height: "16px" }} /> Update Log
                            </>
                        ) : (
                            "Save Today's Recovery"
                        )}
                    </Button>
                </div>
            </Card>

            {/* Recent Logs */}
            <Card>
                <h2
                    style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: textPrimary,
                        marginBottom: "16px",
                    }}
                >
                    Recent Recovery Trend
                </h2>

                {logs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 0" }}>
                        <Heart
                            style={{
                                width: "40px",
                                height: "40px",
                                margin: "0 auto 8px",
                                display: "block",
                                color: textMuted,
                            }}
                        />
                        <p style={{ fontSize: "14px", color: textMuted }}>
                            Log your first recovery to see trends
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {logs.slice(0, 14).map((log) => {
                            const logScore = calculateRecoveryScore({
                                sleepHours: log.sleepHours,
                                sleepQuality: log.sleepQuality,
                                stressLevel: log.stressLevel,
                                gutStatus: log.gutStatus,
                            });
                            const logColor = getScoreColor(logScore);

                            return (
                                <div
                                    key={log.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        padding: "10px 14px",
                                        borderRadius: "10px",
                                        border: `1px solid ${borderColor}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "40px",
                                            textAlign: "center",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "16px",
                                                fontWeight: 700,
                                                color: logColor,
                                            }}
                                        >
                                            {logScore}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            flex: 1,
                                            height: "6px",
                                            borderRadius: "3px",
                                            background: `${borderColor}`,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: "100%",
                                                width: `${logScore}%`,
                                                borderRadius: "3px",
                                                background: logColor,
                                            }}
                                        />
                                    </div>
                                    <div
                                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                        {log.sleepHours !== null && (
                                            <span style={{ fontSize: "12px", color: textMuted }}>
                                                🌙 {log.sleepHours}h
                                            </span>
                                        )}
                                        {log.stressLevel !== null && (
                                            <span style={{ fontSize: "12px", color: textMuted }}>
                                                🧠 {log.stressLevel}/10
                                            </span>
                                        )}
                                        <span style={{ fontSize: "11px", color: textMuted }}>
                                            {new Date(log.date).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}
