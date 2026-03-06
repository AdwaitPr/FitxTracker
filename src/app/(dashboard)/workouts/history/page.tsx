import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { History, Dumbbell, ChevronRight, Calendar } from "lucide-react";

export default async function WorkoutHistoryPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const workouts = await prisma.workout.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
        include: {
            exercises: {
                include: {
                    exercise: true,
                    sets: true,
                },
                orderBy: { order: "asc" },
            },
        },
    });

    // Group workouts by month
    const grouped: Record<string, typeof workouts> = {};
    for (const w of workouts) {
        const key = new Date(w.date).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(w);
    }

    const textMuted = "#8B8B9E";
    const textPrimary = "#F1F1F6";
    const purple = "#7c3aed";
    const purpleLight = "#a78bfa";
    const borderColor = "var(--border)";

    return (
        <div className="animate-fade-in">
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "32px",
                }}
            >
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: textPrimary }}>
                    <span className="gradient-text">Workout History</span>
                </h1>
                <span
                    style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        padding: "6px 14px",
                        borderRadius: "9999px",
                        border: `1px solid ${borderColor}`,
                        background: "var(--bg-card)",
                        color: textMuted,
                    }}
                >
                    {workouts.length} workout{workouts.length !== 1 ? "s" : ""}
                </span>
            </div>

            {workouts.length === 0 ? (
                <Card>
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                        <History
                            style={{
                                width: "48px",
                                height: "48px",
                                margin: "0 auto 12px",
                                display: "block",
                                color: textMuted,
                            }}
                        />
                        <p style={{ fontWeight: 600, color: textPrimary }}>
                            No workouts yet
                        </p>
                        <p
                            style={{
                                fontSize: "14px",
                                marginTop: "4px",
                                color: textMuted,
                            }}
                        >
                            Start your first workout to see history here.
                        </p>
                        <Link
                            href="/workouts/new"
                            style={{
                                display: "inline-block",
                                marginTop: "16px",
                                padding: "10px 24px",
                                borderRadius: "12px",
                                background: `linear-gradient(135deg, ${purple}, #9333ea)`,
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: "14px",
                                textDecoration: "none",
                            }}
                        >
                            Start Workout
                        </Link>
                    </div>
                </Card>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {Object.entries(grouped).map(([month, monthWorkouts]) => (
                        <section key={month}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "12px",
                                }}
                            >
                                <Calendar
                                    style={{
                                        width: "14px",
                                        height: "14px",
                                        color: purpleLight,
                                    }}
                                />
                                <h2
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                        color: textMuted,
                                    }}
                                >
                                    {month}
                                </h2>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                {monthWorkouts.map((workout) => {
                                    const totalSets = workout.exercises.reduce(
                                        (acc, ex) => acc + ex.sets.length,
                                        0
                                    );
                                    const totalVolume = workout.exercises.reduce(
                                        (acc, ex) =>
                                            acc +
                                            ex.sets.reduce((s, set) => s + set.reps * set.weight, 0),
                                        0
                                    );

                                    return (
                                        <Link
                                            key={workout.id}
                                            href={`/workouts/${workout.id}`}
                                            style={{ textDecoration: "none", color: "inherit" }}
                                        >
                                            <Card hover>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "14px",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: "42px",
                                                                height: "42px",
                                                                borderRadius: "12px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                background: `${purple}20`,
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <Dumbbell
                                                                style={{
                                                                    width: "20px",
                                                                    height: "20px",
                                                                    color: purpleLight,
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <p
                                                                style={{
                                                                    fontWeight: 600,
                                                                    fontSize: "15px",
                                                                    color: textPrimary,
                                                                }}
                                                            >
                                                                {workout.name}
                                                            </p>
                                                            <p
                                                                style={{
                                                                    fontSize: "12px",
                                                                    color: textMuted,
                                                                    marginTop: "2px",
                                                                }}
                                                            >
                                                                {new Date(workout.date).toLocaleDateString(
                                                                    "en-US",
                                                                    {
                                                                        weekday: "short",
                                                                        month: "short",
                                                                        day: "numeric",
                                                                    }
                                                                )}
                                                                {" · "}
                                                                {workout.exercises.length} exercise
                                                                {workout.exercises.length !== 1 ? "s" : ""}
                                                                {" · "}
                                                                {totalSets} set{totalSets !== 1 ? "s" : ""}
                                                                {totalVolume > 0 &&
                                                                    ` · ${Math.round(totalVolume).toLocaleString()} kg`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight
                                                        style={{
                                                            width: "20px",
                                                            height: "20px",
                                                            color: textMuted,
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                </div>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
