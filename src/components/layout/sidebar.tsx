"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import {
  LayoutGrid,
  Dumbbell,
  History,
  List,
  Activity,
  TrendingUp,
  Sparkles,
  Calendar,
  ChartNoAxesColumn,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
      { id: "new", label: "New Workout", href: "/workouts/new", icon: Dumbbell },
      { id: "history", label: "History", href: "/workouts/history", icon: History },
      { id: "exercises", label: "Exercises", href: "/exercises", icon: List },
      { id: "recovery", label: "Recovery", href: "/recovery", icon: Activity },
      { id: "progress", label: "Progress", href: "/progress", icon: TrendingUp },
    ],
  },
  {
    label: "Cognitive",
    items: [
      { id: "cognitype", label: "CogniType", href: "/cognitype", icon: Sparkles },
      { id: "sessions", label: "Sessions", href: "/cognitype/sessions", icon: Calendar },
      { id: "analytics", label: "Analytics", href: "/cognitype/analytics", icon: ChartNoAxesColumn },
    ],
  },
  {
    label: "Account",
    items: [{ id: "profile", label: "Profile", href: "/profile", icon: User }],
  },
];

export function activeIdFor(path: string): string {
  if (path.startsWith("/cognitype/analytics")) return "analytics";
  if (path.startsWith("/cognitype/sessions")) return "sessions";
  if (path.startsWith("/cognitype")) return "cognitype";
  if (path.startsWith("/workouts/new")) return "new";
  if (path.startsWith("/workouts")) return "history";
  if (path.startsWith("/exercises")) return "exercises";
  if (path.startsWith("/recovery")) return "recovery";
  if (path.startsWith("/progress")) return "progress";
  if (path.startsWith("/profile")) return "profile";
  return "dashboard";
}

export function Sidebar() {
  const pathname = usePathname() || "/dashboard";
  const active = activeIdFor(pathname);
  const rowCls =
    "group flex w-full items-center gap-3 rounded-[14px] px-2 py-2.5 text-left transition-colors duration-200 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 hidden h-screen w-[76px] shrink-0 flex-col border-r border-hairline bg-surface px-3 py-7 md:flex xl:w-[260px] xl:px-5"
    >
      <div className="px-1 xl:px-2">
        <span className="xl:hidden">
          <Logo compact href="/dashboard" />
        </span>
        <span className="hidden xl:inline">
          <Logo href="/dashboard" />
        </span>
      </div>

      <div className="mt-10 flex-1 space-y-8 overflow-y-auto no-scrollbar">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="micro mb-3 hidden px-3 text-ink-muted xl:block">
              {section.label}
            </p>
            <ul className="space-y-1.5">
              {section.items.map((item) => {
                const isActive = active === item.id;
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      title={item.label}
                      aria-label={item.label}
                      aria-current={isActive ? "page" : undefined}
                      className={rowCls}
                    >
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-[11px] transition-colors duration-200",
                          isActive
                            ? "bg-primary-soft text-primary"
                            : "text-ink-muted group-hover:text-primary"
                        )}
                      >
                        <Icon
                          size={20}
                          strokeWidth={isActive ? 1.9 : 1.5}
                          aria-hidden="true"
                        />
                      </span>
                      <span
                        className={cn(
                          "hidden truncate text-[14.5px] xl:block",
                          isActive
                            ? "font-semibold text-ink"
                            : "font-medium text-ink-soft group-hover:text-ink"
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-1.5 border-t border-hairline pt-5">
        <Link
          href="/profile?tab=settings"
          title="Settings"
          aria-label="Settings"
          className={rowCls}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] text-ink-muted transition-colors duration-200 group-hover:text-primary">
            <Settings size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="hidden text-[14.5px] font-medium text-ink-soft group-hover:text-ink xl:block">
            Settings
          </span>
        </Link>
        <button
          type="button"
          title="Logout"
          aria-label="Logout"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="group flex w-full items-center gap-3 rounded-[14px] px-2 py-2.5 text-danger transition-colors duration-200 hover:bg-tag-danger-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px]">
            <LogOut size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="hidden text-[14.5px] font-semibold xl:block">
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
}
