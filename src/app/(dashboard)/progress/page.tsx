"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
    TrendingUp,
    Trophy,
    Dumbbell,
    Target,
    BarChart3,
    ChevronDown,
} from "lucide-react";

interface Stats {
    totalWorkouts: number;
    recentWorkouts: number;
    totalVolume: number;
    totalSets: number;
}

interface PR {
    exerciseName: string;
    weight: number;
    reps: number;
    date: string;
}

interface ExerciseOption {
    id: string;
    name: string;
    muscleGroup: string;
}

interface ProgressionPoint {
    date: string;
    maxWeight: number;
    totalVolume: number;
    bestSet: { weight: number; reps: number };
    sets: number;
}

const textPrimary = "#F1F1F6";
const textMuted = "#8B8B9E";
const purple = "#7c3aed";
const purpleLight = "#a78bfa";
const cyan = "#22d3ee";
const green = "#10b981";
const borderColor = "var(--border)";

const muscleGroupColors: Record<string, string> = {
    Chest: "#ef4444",
    Back: "#3b82f6",
    Legs: "#10b981",
    Shoulders: "#f59e0b",
    Arms: "#8b5cf6",
    Core: "#ec4899",
    Cardio: "#22d3ee",
};

export default function ProgressPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [prs, setPrs] = useState<PR[]>([]);
    const [weeklyVolume, setWeeklyVolume] = useState<
        Record<string, Record<string, number>>
    >({});
    const [exercises, setExercises] = useState<ExerciseOption[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<string>("");
    const [progression, setProgression] = useState<ProgressionPoint[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOverview = useCallback(async () => {
        try {
            const res = await fetch("/api/progress?type=overview");
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setPrs(data.prs);
                setWeeklyVolume(data.weeklyVolume);
            }
        } catch (err) {
            console.error("Failed to fetch progress:", err);
        }
    }, []);

    const fetchExercises = useCallback(async () => {
        try {
            const res = await fetch("/api/progress?type=exercises");
            if (res.ok) {
                const data = await res.json();
                setExercises(data.exercises);
            }
        } catch (err) {
            console.error("Failed to fetch exercises:", err);
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchOverview(), fetchExercises()]).finally(() =>
            setLoading(false)
        );
    }, [fetchOverview, fetchExercises]);

    const fetchProgression = useCallback(async (exerciseId: string) => {
        try {
            const res = await fetch(
                `/api/progress?type=exercise&exerciseId=${exerciseId}`
            );
            if (res.ok) {
                const data = await res.json();
                setProgression(data.progression);
            }
        } catch (err) {
            console.error("Failed to fetch progression:", err);
        }
    }, []);

    useEffect(() => {
        if (selectedExercise) {
            fetchProgression(selectedExercise);
        } else {
            setProgression([]);
        }
    }, [selectedExercise, fetchProgression]);

    if (loading) {
        return (
            <div className="animate-fade-in">
                <h1
                    style={{ fontSize: "24px", fontWeight: 700, marginBottom: "32px" }}
                >
                    <span className="gradient-text">Progress</span>
                </h1>
                <Card>
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                        <p style={{ color: textMuted }}>Loading your progress...</p>
                    </div>
                </Card>
            </div>
        );
    }

    const weekKeys = Object.keys(weeklyVolume).sort();
    const allMuscleGroups = [
        ...new Set(
            weekKeys.flatMap((k) => Object.keys(weeklyVolume[k]))
        ),
    ].sort();

    // Calculate max volume for chart scaling
    const maxWeekVolume = Math.max(
        ...weekKeys.map((k) =>
            Object.values(weeklyVolume[k]).reduce((a, b) => a + b, 0)
        ),
        1
    );

    return (
        <div className="animate-fade-in">
            <h1
                style={{ fontSize: "24px", fontWeight: 700, marginBottom: "32px" }}
            >
                <span className="gradient-text">Progress</span>
            </h1>

            {/* Overview Stats */}
            {stats && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "12px",
                        marginBottom: "24px",
                    }}
                >
                    {[
                        {
                            label: "Total Workouts",
                            value: stats.totalWorkouts,
                            icon: Dumbbell,
                            color: purpleLight,
                        },
                        {
                            label: "Last 30 Days",
                            value: stats.recentWorkouts,
                            icon: TrendingUp,
                            color: cyan,
                        },
                        {
                            label: "Total Volume",
                            value: `${stats.totalVolume.toLocaleString()} kg`,
                            icon: BarChart3,
                            color: green,
                        },
                        {
                            label: "Total Sets",
                            value: stats.totalSets,
                            icon: Target,
                            color: "#f59e0b",
                        },
                    ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.label}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: `${stat.color}20`,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Icon
                                            style={{
                                                width: "16px",
                                                height: "16px",
                                                color: stat.color,
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <p
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                color: textMuted,
                                            }}
                                        >
                                            {stat.label}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "18px",
                                                fontWeight: 700,
                                                color: textPrimary,
                                            }}
                                        >
                                            {stat.value}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Weekly Volume Chart */}
            <Card style={{ marginBottom: "24px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                    }}
                >
                    <h2
                        style={{ fontSize: "16px", fontWeight: 600, color: textPrimary }}
                    >
                        Weekly Volume by Muscle Group
                    </h2>
                </div>

                {weekKeys.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 0" }}>
                        <BarChart3
                            style={{
                                width: "40px",
                                height: "40px",
                                margin: "0 auto 8px",
                                display: "block",
                                color: textMuted,
                            }}
                        />
                        <p style={{ fontSize: "14px", color: textMuted }}>
                            Log workouts to see volume trends
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Stacked Bar Chart */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-end",
                                gap: "6px",
                                height: "200px",
                                padding: "0 0 24px",
                                position: "relative",
                            }}
                        >
                            {weekKeys.map((weekKey) => {
                                const data = weeklyVolume[weekKey];
                                const total = Object.values(data).reduce(
                                    (a, b) => a + b,
                                    0
                                );
                                const heightPercent = (total / maxWeekVolume) * 100;
                                const weekLabel = new Date(weekKey).toLocaleDateString(
                                    "en-US",
                                    { month: "short", day: "numeric" }
                                );

                                return (
                                    <div
                                        key={weekKey}
                                        style={{
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "4px",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                fontWeight: 600,
                                                color: textMuted,
                                            }}
                                        >
                                            {Math.round(total).toLocaleString()}
                                        </span>
                                        <div
                                            style={{
                                                width: "100%",
                                                maxWidth: "48px",
                                                height: `${Math.max(heightPercent, 4)}%`,
                                                borderRadius: "6px 6px 4px 4px",
                                                overflow: "hidden",
                                                display: "flex",
                                                flexDirection: "column-reverse",
                                                minHeight: "8px",
                                            }}
                                        >
                                            {allMuscleGroups.map((mg) => {
                                                const vol = data[mg] || 0;
                                                if (vol === 0) return null;
                                                const mgPercent = (vol / total) * 100;
                                                return (
                                                    <div
                                                        key={mg}
                                                        style={{
                                                            height: `${mgPercent}%`,
                                                            background:
                                                                muscleGroupColors[mg] || "#6b7280",
                                                            minHeight: "2px",
                                                        }}
                                                        title={`${mg}: ${Math.round(vol).toLocaleString()} kg`}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                color: textMuted,
                                                position: "absolute",
                                                bottom: 0,
                                            }}
                                        >
                                            {weekLabel}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "12px",
                                marginTop: "8px",
                                paddingTop: "12px",
                                borderTop: `1px solid ${borderColor}`,
                            }}
                        >
                            {allMuscleGroups.map((mg) => (
                                <div
                                    key={mg}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "10px",
                                            height: "10px",
                                            borderRadius: "3px",
                                            background: muscleGroupColors[mg] || "#6b7280",
                                        }}
                                    />
                                    <span style={{ fontSize: "12px", color: textMuted }}>
                                        {mg}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Card>

            {/* Exercise Progression */}
            <Card style={{ marginBottom: "24px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "16px",
                    }}
                >
                    <h2
                        style={{ fontSize: "16px", fontWeight: 600, color: textPrimary }}
                    >
                        Exercise Progression
                    </h2>
                </div>

                {exercises.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 0" }}>
                        <TrendingUp
                            style={{
                                width: "40px",
                                height: "40px",
                                margin: "0 auto 8px",
                                display: "block",
                                color: textMuted,
                            }}
                        />
                        <p style={{ fontSize: "14px", color: textMuted }}>
                            Log workouts to track exercise progression
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ position: "relative", marginBottom: "16px" }}>
                            <select
                                value={selectedExercise}
                                onChange={(e) => setSelectedExercise(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 40px 10px 14px",
                                    borderRadius: "10px",
                                    border: `1px solid ${borderColor}`,
                                    background: "var(--bg-input)",
                                    color: textPrimary,
                                    fontSize: "14px",
                                    outline: "none",
                                    appearance: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <option value="">Select an exercise...</option>
                                {exercises.map((ex) => (
                                    <option key={ex.id} value={ex.id}>
                                        {ex.name} ({ex.muscleGroup})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: "16px",
                                    height: "16px",
                                    color: textMuted,
                                    pointerEvents: "none",
                                }}
                            />
                        </div>

                        {selectedExercise && progression.length > 0 ? (
                            <div>
                                {/* Line chart for max weight */}
                                <div
                                    style={{
                                        position: "relative",
                                        height: "180px",
                                        display: "flex",
                                        alignItems: "flex-end",
                                        gap: "4px",
                                        paddingBottom: "24px",
                                        paddingTop: "20px",
                                    }}
                                >
                                    {(() => {
                                        const maxW = Math.max(
                                            ...progression.map((p) => p.maxWeight),
                                            1
                                        );
                                        const minW = Math.min(
                                            ...progression.map((p) => p.maxWeight)
                                        );
                                        const range = maxW - minW || 1;

                                        return progression.map((point, i) => {
                                            const heightPercent =
                                                ((point.maxWeight - minW) / range) * 80 + 20;
                                            return (
                                                <div
                                                    key={i}
                                                    style={{
                                                        flex: 1,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        gap: "4px",
                                                        height: "100%",
                                                        justifyContent: "flex-end",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: "10px",
                                                            fontWeight: 600,
                                                            color: purpleLight,
                                                        }}
                                                    >
                                                        {point.maxWeight}
                                                    </span>
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            maxWidth: "32px",
                                                            height: `${heightPercent}%`,
                                                            borderRadius: "4px 4px 2px 2px",
                                                            background: `linear-gradient(to top, ${purple}, ${purpleLight})`,
                                                            minHeight: "8px",
                                                        }}
                                                        title={`${point.maxWeight} kg × ${point.bestSet.reps} reps`}
                                                    />
                                                    <span
                                                        style={{
                                                            fontSize: "9px",
                                                            color: textMuted,
                                                            position: "absolute",
                                                            bottom: 0,
                                                        }}
                                                    >
                                                        {new Date(point.date).toLocaleDateString(
                                                            "en-US",
                                                            { month: "short", day: "numeric" }
                                                        )}
                                                    </span>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>

                                {/* Details */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, 1fr)",
                                        gap: "8px",
                                        marginTop: "12px",
                                        paddingTop: "12px",
                                        borderTop: `1px solid ${borderColor}`,
                                    }}
                                >
                                    <div style={{ textAlign: "center" }}>
                                        <p
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                color: textMuted,
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Peak Weight
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "18px",
                                                fontWeight: 700,
                                                color: textPrimary,
                                            }}
                                        >
                                            {Math.max(
                                                ...progression.map((p) => p.maxWeight)
                                            )}{" "}
                                            kg
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <p
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                color: textMuted,
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Sessions
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "18px",
                                                fontWeight: 700,
                                                color: textPrimary,
                                            }}
                                        >
                                            {progression.length}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <p
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                color: textMuted,
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Total Volume
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "18px",
                                                fontWeight: 700,
                                                color: textPrimary,
                                            }}
                                        >
                                            {progression
                                                .reduce((a, p) => a + p.totalVolume, 0)
                                                .toLocaleString()}{" "}
                                            kg
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : selectedExercise ? (
                            <p
                                style={{
                                    textAlign: "center",
                                    padding: "24px 0",
                                    color: textMuted,
                                    fontSize: "14px",
                                }}
                            >
                                No data yet for this exercise
                            </p>
                        ) : null}
                    </>
                )}
            </Card>

            {/* Personal Records */}
            <Card>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "16px",
                    }}
                >
                    <Trophy
                        style={{ width: "18px", height: "18px", color: "#f59e0b" }}
                    />
                    <h2
                        style={{ fontSize: "16px", fontWeight: 600, color: textPrimary }}
                    >
                        Personal Records
                    </h2>
                </div>

                {prs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 0" }}>
                        <Trophy
                            style={{
                                width: "40px",
                                height: "40px",
                                margin: "0 auto 8px",
                                display: "block",
                                color: textMuted,
                            }}
                        />
                        <p style={{ fontSize: "14px", color: textMuted }}>
                            Log workouts to track your records
                        </p>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                        }}
                    >
                        {prs.map((pr, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "10px 14px",
                                    borderRadius: "10px",
                                    border: `1px solid ${borderColor}`,
                                    background:
                                        i === 0
                                            ? "rgba(245, 158, 11, 0.06)"
                                            : "transparent",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            color:
                                                i === 0
                                                    ? "#f59e0b"
                                                    : i === 1
                                                        ? "#94a3b8"
                                                        : i === 2
                                                            ? "#cd7f32"
                                                            : textMuted,
                                            background:
                                                i === 0
                                                    ? "rgba(245, 158, 11, 0.15)"
                                                    : i === 1
                                                        ? "rgba(148, 163, 184, 0.15)"
                                                        : i === 2
                                                            ? "rgba(205, 127, 50, 0.15)"
                                                            : "transparent",
                                        }}
                                    >
                                        {i + 1}
                                    </span>
                                    <div>
                                        <p
                                            style={{
                                                fontWeight: 500,
                                                fontSize: "14px",
                                                color: textPrimary,
                                            }}
                                        >
                                            {pr.exerciseName}
                                        </p>
                                        <p style={{ fontSize: "12px", color: textMuted }}>
                                            {new Date(pr.date).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p
                                        style={{
                                            fontWeight: 700,
                                            fontSize: "15px",
                                            color: textPrimary,
                                        }}
                                    >
                                        {pr.weight} kg
                                    </p>
                                    <p style={{ fontSize: "12px", color: textMuted }}>
                                        × {pr.reps} reps
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
