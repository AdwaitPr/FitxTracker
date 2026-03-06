import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
    Dumbbell,
    ArrowLeft,
    Calendar,
    Clock,
    Target,
    Trash2,
} from "lucide-react";
import { DeleteWorkoutButton } from "./delete-button";

export default async function WorkoutDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const { id } = await params;

    const workout = await prisma.workout.findUnique({
        where: { id, userId: session.user.id },
        include: {
            exercises: {
                include: {
                    exercise: true,
                    sets: { orderBy: { order: "asc" } },
                },
                orderBy: { order: "asc" },
            },
        },
    });

    if (!workout) notFound();

    const totalSets = workout.exercises.reduce(
        (acc, ex) => acc + ex.sets.length,
        0
    );
    const totalVolume = workout.exercises.reduce(
        (acc, ex) =>
            acc + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0),
        0
    );
    const avgRPE = (() => {
        const rpeValues = workout.exercises.flatMap((ex) =>
            ex.sets
                .filter((s) => s.perceivedDifficulty)
                .map((s) => s.perceivedDifficulty!)
        );
        return rpeValues.length > 0
            ? (rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length).toFixed(1)
            : null;
    })();

    const textMuted = "#8B8B9E";
    const textPrimary = "#F1F1F6";
    const purple = "#7c3aed";
    const purpleLight = "#a78bfa";
    const borderColor = "var(--border)";

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "24px",
                }}
            >
                <Link
                    href="/workouts/history"
                    style={{
                        padding: "8px",
                        borderRadius: "10px",
                        border: `1px solid ${borderColor}`,
                        background: "var(--bg-card)",
                        color: textMuted,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <ArrowLeft style={{ width: "20px", height: "20px" }} />
                </Link>
                <div style={{ flex: 1 }}>
                    <h1
                        style={{ fontSize: "24px", fontWeight: 700, color: textPrimary }}
                    >
                        {workout.name}
                    </h1>
                    <p style={{ fontSize: "13px", color: textMuted, marginTop: "2px" }}>
                        {new Date(workout.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </p>
                </div>
                <DeleteWorkoutButton workoutId={workout.id} />
            </div>

            {/* Summary Stats */}
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
                        label: "Exercises",
                        value: workout.exercises.length,
                        icon: Dumbbell,
                        color: purpleLight,
                    },
                    {
                        label: "Total Sets",
                        value: totalSets,
                        icon: Target,
                        color: "#22d3ee",
                    },
                    {
                        label: "Volume",
                        value: `${Math.round(totalVolume).toLocaleString()} kg`,
                        icon: Target,
                        color: "#10b981",
                    },
                    ...(avgRPE
                        ? [
                            {
                                label: "Avg RPE",
                                value: avgRPE,
                                icon: Target,
                                color: "#f59e0b",
                            },
                        ]
                        : []),
                    ...(workout.duration
                        ? [
                            {
                                label: "Duration",
                                value: `${workout.duration} min`,
                                icon: Clock,
                                color: "#8b5cf6",
                            },
                        ]
                        : []),
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

            {/* Notes */}
            {workout.notes && (
                <Card style={{ marginBottom: "24px" }}>
                    <p
                        style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            color: textMuted,
                            marginBottom: "6px",
                        }}
                    >
                        Notes
                    </p>
                    <p style={{ fontSize: "14px", color: textPrimary, lineHeight: 1.6 }}>
                        {workout.notes}
                    </p>
                </Card>
            )}

            {/* Exercises */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {workout.exercises.map((we, i) => (
                    <Card key={we.id}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "16px",
                            }}
                        >
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: `${purple}20`,
                                    flexShrink: 0,
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: 700,
                                        fontSize: "14px",
                                        color: purpleLight,
                                    }}
                                >
                                    {i + 1}
                                </span>
                            </div>
                            <div>
                                <p
                                    style={{
                                        fontWeight: 600,
                                        fontSize: "15px",
                                        color: textPrimary,
                                    }}
                                >
                                    {we.exercise.name}
                                </p>
                                <p style={{ fontSize: "12px", color: textMuted }}>
                                    {we.exercise.muscleGroup}
                                    {we.exercise.equipment
                                        ? ` · ${we.exercise.equipment}`
                                        : ""}
                                </p>
                            </div>
                        </div>

                        {/* Sets Table */}
                        <div
                            style={{
                                borderRadius: "10px",
                                border: `1px solid ${borderColor}`,
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "50px 1fr 1fr 80px",
                                    gap: "0",
                                    padding: "8px 12px",
                                    background: "rgba(124, 58, 237, 0.06)",
                                    borderBottom: `1px solid ${borderColor}`,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: textMuted,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    SET
                                </span>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: textMuted,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    WEIGHT
                                </span>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: textMuted,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    REPS
                                </span>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: textMuted,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    RPE
                                </span>
                            </div>
                            {we.sets.map((set, si) => (
                                <div
                                    key={set.id}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "50px 1fr 1fr 80px",
                                        gap: "0",
                                        padding: "10px 12px",
                                        borderBottom:
                                            si < we.sets.length - 1
                                                ? `1px solid ${borderColor}`
                                                : "none",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            color: purpleLight,
                                        }}
                                    >
                                        {si + 1}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            color: textPrimary,
                                        }}
                                    >
                                        {set.weight} kg
                                        {set.addedWeight ? ` (+${set.addedWeight})` : ""}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            color: textPrimary,
                                        }}
                                    >
                                        {set.reps}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            color: set.perceivedDifficulty
                                                ? set.perceivedDifficulty >= 9
                                                    ? "#ef4444"
                                                    : set.perceivedDifficulty >= 7
                                                        ? "#f59e0b"
                                                        : "#10b981"
                                                : textMuted,
                                        }}
                                    >
                                        {set.perceivedDifficulty || "—"}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {we.notes && (
                            <p
                                style={{
                                    fontSize: "13px",
                                    color: textMuted,
                                    marginTop: "10px",
                                    fontStyle: "italic",
                                }}
                            >
                                {we.notes}
                            </p>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
