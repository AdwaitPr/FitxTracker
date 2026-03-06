"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Dumbbell,
    History,
    Library,
    TrendingUp,
    User,
    Plus,
    Heart,
    Brain,
    BarChart3,
    ListOrdered,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/workouts/new", label: "New Workout", icon: Plus },
    { href: "/workouts/history", label: "History", icon: History },
    { href: "/exercises", label: "Exercises", icon: Library },
    { href: "/recovery", label: "Recovery", icon: Heart },
    { href: "/progress", label: "Progress", icon: TrendingUp },
    { href: "/profile", label: "Profile", icon: User },
];

const cogniNavItems = [
    { href: "/cognitype", label: "CogniType", icon: Brain },
    { href: "/cognitype/sessions", label: "Sessions", icon: ListOrdered },
    { href: "/cognitype/analytics", label: "Analytics", icon: BarChart3 },
];


export function Sidebar() {
    const pathname = usePathname();

    const renderNavItem = (item: { href: string; label: string; icon: typeof LayoutDashboard }) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                        ? "gradient-purple text-white shadow-lg shadow-purple-primary/20"
                        : "hover:bg-[var(--bg-card-hover)]"
                )}
                style={{
                    color: isActive ? "#ffffff" : "var(--text-muted)",
                }}
            >
                <Icon className="w-5 h-5" />
                {item.label}
            </Link>
        );
    };

    return (
        <aside
            className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r z-40"
            style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
            }}
        >
            {/* Logo */}
            <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center gradient-purple"
                    >
                        <Dumbbell className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold gradient-text">FitxTracker</span>
                </Link>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(renderNavItem)}

                {/* CogniType section */}
                <div
                    style={{
                        margin: "12px 0 8px",
                        padding: "0 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <div
                        style={{
                            height: "1px",
                            flex: 1,
                            background: "var(--border)",
                        }}
                    />
                    <span
                        style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "var(--text-muted)",
                        }}
                    >
                        Cognitive
                    </span>
                    <div
                        style={{
                            height: "1px",
                            flex: 1,
                            background: "var(--border)",
                        }}
                    />
                </div>
                {cogniNavItems.map(renderNavItem)}
            </nav>

            {/* Footer */}
            <div
                className="p-4 border-t"
                style={{ borderColor: "var(--border)" }}
            >
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                    FitxTracker v1.0
                </p>
            </div>
        </aside>
    );
}
