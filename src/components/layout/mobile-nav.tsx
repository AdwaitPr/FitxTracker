"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Plus,
    History,
    TrendingUp,
    User,
    Heart,
} from "lucide-react";

const mobileNavItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/workouts/history", label: "History", icon: History },
    { href: "/workouts/new", label: "Log", icon: Plus, isCenter: true },
    { href: "/recovery", label: "Recovery", icon: Heart },
    { href: "/profile", label: "Profile", icon: User },
];


export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t glass"
            style={{ borderColor: "var(--border)" }}
        >
            <div className="flex items-center justify-around px-2 py-2">
                {mobileNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    const Icon = item.icon;

                    if (item.isCenter) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center justify-center w-14 h-14 -mt-6 rounded-full gradient-purple shadow-lg shadow-purple-primary/30 transition-transform duration-200 active:scale-95"
                            >
                                <Icon className="w-6 h-6 text-white" />
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                            )}
                        >
                            <Icon
                                className="w-5 h-5"
                                style={{
                                    color: isActive ? "var(--purple-primary)" : "var(--text-muted)",
                                }}
                            />
                            <span
                                className="text-[10px] font-medium"
                                style={{
                                    color: isActive ? "var(--purple-primary)" : "var(--text-muted)",
                                }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
