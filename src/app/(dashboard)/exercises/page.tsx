import { prisma } from "@/lib/prisma";
import { Library } from "lucide-react";

export default async function ExercisesPage() {
    const exercises = await prisma.exercise.findMany({
        orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
    });

    const grouped = exercises.reduce(
        (acc, ex) => {
            if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = [];
            acc[ex.muscleGroup].push(ex);
            return acc;
        },
        {} as Record<string, typeof exercises>
    );

    const muscleGroupColors: Record<string, string> = {
        Arms: "#a78bfa",
        Back: "#22d3ee",
        Cardio: "#ef4444",
        Chest: "#7c3aed",
        Core: "#67e8f9",
        Legs: "#10b981",
        Shoulders: "#f59e0b",
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "32px",
                }}
            >
                <h1 style={{ fontSize: "24px", fontWeight: 700 }}>
                    <span className="gradient-text">Exercise Library</span>
                </h1>
                <span
                    style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        padding: "6px 14px",
                        borderRadius: "9999px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-card)",
                        color: "var(--text-muted)",
                    }}
                >
                    {exercises.length} exercises
                </span>
            </div>

            {Object.keys(grouped).length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "48px 24px",
                        borderRadius: "16px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-card)",
                    }}
                >
                    <Library
                        style={{
                            width: "48px",
                            height: "48px",
                            margin: "0 auto 12px",
                            display: "block",
                            color: "var(--text-muted)",
                        }}
                    />
                    <p style={{ fontWeight: 600 }}>No exercises found</p>
                    <p
                        style={{
                            fontSize: "14px",
                            marginTop: "4px",
                            color: "var(--text-muted)",
                        }}
                    >
                        Run the seed script to populate exercises.
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
                    {Object.entries(grouped).map(([group, exs]) => (
                        <section key={group}>
                            {/* Section Header */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "14px",
                                    paddingBottom: "10px",
                                    borderBottom: "1px solid var(--border)",
                                }}
                            >
                                <div
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        flexShrink: 0,
                                        background: muscleGroupColors[group] || "#7c3aed",
                                    }}
                                />
                                <h2
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        textTransform: "uppercase" as const,
                                        letterSpacing: "0.08em",
                                        color: "#F1F1F6",
                                    }}
                                >
                                    {group}
                                </h2>
                                <span style={{ fontSize: "12px", color: "#8B8B9E" }}>
                                    {exs.length}
                                </span>
                            </div>

                            {/* Exercise List */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                {exs.map((ex) => (
                                    <div
                                        key={ex.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "16px",
                                            padding: "12px 16px",
                                            borderRadius: "10px",
                                            border: "1px solid var(--border)",
                                            background: "var(--bg-card)",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "14px",
                                                fontWeight: 500,
                                                color: "#F1F1F6",
                                            }}
                                        >
                                            {ex.name}
                                        </span>
                                        {ex.equipment && (
                                            <span
                                                style={{
                                                    fontSize: "11px",
                                                    fontWeight: 500,
                                                    padding: "3px 10px",
                                                    borderRadius: "9999px",
                                                    background: "rgba(124, 58, 237, 0.1)",
                                                    color: "#8B8B9E",
                                                    flexShrink: 0,
                                                    whiteSpace: "nowrap" as const,
                                                }}
                                            >
                                                {ex.equipment}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
