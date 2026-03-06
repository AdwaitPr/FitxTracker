import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
    Dumbbell,
    Plus,
    History,
    TrendingUp,
    Calendar,
    Weight,
    Timer,
    ChevronRight,
    Heart,
} from "lucide-react";
import { calculateRecoveryScore, getWorkoutRecommendation, getScoreColor } from "@/lib/alerts";


export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const userId = session.user.id;

    // Fetch stats
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [workoutsThisWeek, workoutsThisMonth, lastWorkout, user, recentWorkouts, todayRecovery] =
        await Promise.all([
            prisma.workout.count({
                where: { userId, date: { gte: startOfWeek } },
            }),
            prisma.workout.count({
                where: { userId, date: { gte: startOfMonth } },
            }),
            prisma.workout.findFirst({
                where: { userId },
                orderBy: { date: "desc" },
                include: {
                    exercises: {
                        include: { exercise: true },
                    },
                },
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { name: true, weight: true },
            }),
            prisma.workout.findMany({
                where: { userId },
                orderBy: { date: "desc" },
                take: 5,
                include: {
                    exercises: {
                        include: { exercise: true },
                    },
                },
            }),
            (() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return prisma.dailyRecovery.findFirst({
                    where: { userId, date: { gte: today } },
                    orderBy: { date: "desc" },
                });
            })(),
        ]);

    const daysSinceLastWorkout = lastWorkout
        ? Math.floor(
            (now.getTime() - new Date(lastWorkout.date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        : null;

    const firstName = user?.name?.split(" ")[0] || "Athlete";

    const stats = [
        {
            label: "This Week",
            value: workoutsThisWeek,
            icon: Calendar,
            color: "var(--purple-primary)",
        },
        {
            label: "This Month",
            value: workoutsThisMonth,
            icon: TrendingUp,
            color: "var(--cyan-accent)",
        },
        {
            label: "Body Weight",
            value: user?.weight ? `${user.weight} kg` : "—",
            icon: Weight,
            color: "var(--success)",
        },
        {
            label: "Days Since Last",
            value: daysSinceLastWorkout !== null ? daysSinceLastWorkout : "—",
            icon: Timer,
            color: "var(--warning)",
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                    Hey, <span className="gradient-text">{firstName}</span> 👋
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    {lastWorkout
                        ? `Last workout: ${new Date(lastWorkout.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`
                        : "Ready to start your fitness journey?"}
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label} hover>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p
                                        className="text-xs font-medium uppercase tracking-wider"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                </div>
                                <div
                                    className="p-2 rounded-lg"
                                    style={{
                                        background: `${stat.color}15`,
                                    }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Link href="/workouts/new" className="block sm:col-span-1">
                    <div className="gradient-purple rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:shadow-purple-primary/25 animate-pulse-glow">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white">Start Workout</p>
                            <p className="text-sm text-white/70">Log a new session</p>
                        </div>
                    </div>
                </Link>

                <Link href="/workouts/history" className="block">
                    <Card hover className="h-full flex items-center gap-4">
                        <div
                            className="p-3 rounded-xl"
                            style={{ background: "var(--cyan-accent)15" }}
                        >
                            <History
                                className="w-5 h-5"
                                style={{ color: "var(--cyan-accent)" }}
                            />
                        </div>
                        <div>
                            <p className="font-semibold">View History</p>
                            <p
                                className="text-xs"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Browse past workouts
                            </p>
                        </div>
                    </Card>
                </Link>

                <Link href="/progress" className="block">
                    <Card hover className="h-full flex items-center gap-4">
                        <div
                            className="p-3 rounded-xl"
                            style={{ background: "var(--success)15" }}
                        >
                            <TrendingUp
                                className="w-5 h-5"
                                style={{ color: "var(--success)" }}
                            />
                        </div>
                        <div>
                            <p className="font-semibold">Track Progress</p>
                            <p
                                className="text-xs"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Charts & insights
                            </p>
                        </div>
                    </Card>
                </Link>
            </div>

            {/* Recovery Widget */}
            {(() => {
                if (todayRecovery) {
                    const score = calculateRecoveryScore({
                        sleepHours: todayRecovery.sleepHours,
                        sleepQuality: todayRecovery.sleepQuality,
                        stressLevel: todayRecovery.stressLevel,
                        gutStatus: todayRecovery.gutStatus,
                    });
                    const rec = getWorkoutRecommendation({
                        sleepHours: todayRecovery.sleepHours,
                        sleepQuality: todayRecovery.sleepQuality,
                        stressLevel: todayRecovery.stressLevel,
                        gutStatus: todayRecovery.gutStatus,
                    });
                    const color = getScoreColor(score);
                    return (
                        <Link href="/recovery" style={{ textDecoration: "none", color: "inherit" }}>
                            <Card hover>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                        <div style={{
                                            width: "48px", height: "48px", borderRadius: "14px",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            background: `${color}20`, flexShrink: 0,
                                        }}>
                                            <span style={{ fontSize: "18px", fontWeight: 800, color }}>{score}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold" style={{ fontSize: "15px" }}>Recovery Score</p>
                                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                {rec.icon} {rec.message}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        {todayRecovery.sleepHours !== null && (
                                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                🌙 {todayRecovery.sleepHours}h
                                            </span>
                                        )}
                                        <ChevronRight className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                }
                return (
                    <Link href="/recovery" style={{ textDecoration: "none", color: "inherit" }}>
                        <Card hover className="flex items-center gap-4">
                            <div className="p-3 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                                <Heart className="w-5 h-5" style={{ color: "#ef4444" }} />
                            </div>
                            <div>
                                <p className="font-semibold">Log Recovery</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    Track sleep, stress & gut health
                                </p>
                            </div>
                        </Card>
                    </Link>
                );
            })()}

            {/* Recent Activity */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Recent Activity</h2>
                    <Link
                        href="/workouts/history"
                        className="text-sm font-medium flex items-center gap-1 hover:underline"
                        style={{ color: "var(--purple-light)" }}
                    >
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {recentWorkouts.length === 0 ? (
                    <Card>
                        <div className="text-center py-8">
                            <Dumbbell
                                className="w-12 h-12 mx-auto mb-3"
                                style={{ color: "var(--text-muted)" }}
                            />
                            <p className="font-semibold">No workouts yet</p>
                            <p
                                className="text-sm mt-1"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Start your first workout to see activity here
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {recentWorkouts.map((workout) => (
                            <Link key={workout.id} href={`/workouts/${workout.id}`}>
                                <Card hover className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ background: "var(--purple-primary)15" }}
                                        >
                                            <Dumbbell
                                                className="w-5 h-5"
                                                style={{ color: "var(--purple-light)" }}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{workout.name}</p>
                                            <p
                                                className="text-xs"
                                                style={{ color: "var(--text-muted)" }}
                                            >
                                                {new Date(workout.date).toLocaleDateString("en-US", {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                })}{" "}
                                                · {workout.exercises.length} exercises
                                                {workout.duration ? ` · ${workout.duration}min` : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight
                                        className="w-5 h-5"
                                        style={{ color: "var(--text-muted)" }}
                                    />
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
