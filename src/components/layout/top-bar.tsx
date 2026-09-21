"use client";

import { useState, useTransition, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Dumbbell, Bell, Sun, Moon, AlertCircle } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { IconButton } from "@/components/ui/icon-button";
import { Popover } from "@/components/ui/popover";
import { setTheme as setThemeAction } from "@/app/actions/theme";
import type { Alert } from "@/lib/alerts";

export interface TopBarUser {
  name?: string | null;
  email?: string | null;
  fitnessGoal?: string | null;
  image?: string | null;
}

export interface TopBarProps {
  user?: TopBarUser | null;
  alert?: Alert | null;
}

const subscribeTheme = (callback: () => void) => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-theme"
      ) {
        callback();
      }
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
};

const getThemeSnapshot = (): "light" | "dark" => {
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
};

const getServerThemeSnapshot = (): "light" | "dark" => "dark";

export function TopBar({ user, alert }: TopBarProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [, startTransition] = useTransition();

  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    startTransition(async () => {
      await setThemeAction(nextTheme);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/exercises?q=${encodeURIComponent(q.trim())}`);
    } else {
      router.push("/exercises");
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "FT";

  const displayName = user?.name || user?.email?.split("@")[0] || "Athlete";
  const userGoal = user?.fitnessGoal || "FitxTracker Member";

  const hasWarningAlert = Boolean(
    alert && (alert.level === "warning" || alert.level === "critical")
  );

  const getAlertTone = (level: string) => {
    switch (level) {
      case "optimal":
        return "green";
      case "normal":
        return "cyan";
      case "warning":
        return "amber";
      case "critical":
        return "danger";
      default:
        return "violet";
    }
  };

  const alertTone = alert ? getAlertTone(alert.level) : "violet";

  return (
    <header className="flex items-center gap-3 py-5 md:gap-4">
      {/* Left section: Compact Logo on mobile + Search */}
      <div className="flex flex-1 items-center gap-3">
        <span className="md:hidden">
          <Logo compact href="/dashboard" />
        </span>
        <form
          className="relative hidden flex-1 items-center sm:flex max-w-md"
          role="search"
          onSubmit={handleSearchSubmit}
        >
          <label className="sr-only" htmlFor="global-search">
            Search
          </label>
          <Search
            size={18}
            className="pointer-events-none absolute left-4 text-ink-muted"
            aria-hidden="true"
          />
          <input
            id="global-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search workouts, exercises…"
            className="h-11 w-full min-w-0 rounded-full border border-hairline bg-surface pl-11 pr-4 text-[14px] text-ink placeholder:text-ink-muted transition-colors focus-visible:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </form>
        <span className="sm:hidden">
          <IconButton
            icon={<Search size={18} />}
            label="Search"
            variant="outline"
            onClick={() => router.push("/exercises")}
          />
        </span>
      </div>

      {/* Right section: Log workout + Notifications + Theme + Profile */}
      <span className="hidden sm:inline-grid">
        <IconButton
          icon={<Dumbbell size={18} />}
          label="Log workout"
          variant="outline"
          onClick={() => router.push("/workouts/new")}
        />
      </span>

      <Popover
        align="right"
        trigger={(p) => (
          <IconButton
            icon={<Bell size={18} />}
            label={
              alert
                ? `Notifications: ${alert.level} recovery`
                : "Notifications"
            }
            variant="outline"
            badge={hasWarningAlert}
            {...p}
          />
        )}
      >
        <div className="w-72 p-2">
          <p className="micro px-3 pt-2 text-ink-muted">Notifications</p>
          {alert ? (
            <Link
              href="/recovery"
              className="mt-1 flex gap-3 rounded-[12px] p-3 transition-colors hover:bg-canvas"
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-tag"
                style={{
                  background: `var(--tag-${alertTone}-bg)`,
                  color: `var(--tag-${alertTone}-fg)`,
                }}
              >
                <AlertCircle size={18} />
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold text-ink capitalize">
                  {alert.level} Recovery
                </span>
                <span className="block text-[12px] text-ink-muted">
                  {alert.message}
                </span>
              </span>
            </Link>
          ) : (
            <div className="mt-1 p-3 text-[13px] text-ink-muted">
              No new recovery notifications today.
            </div>
          )}
        </div>
      </Popover>

      <IconButton
        icon={theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        label={
          theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
        }
        variant="outline"
        onClick={toggleTheme}
      />

      <span className="mx-1 hidden h-8 w-px bg-hairline sm:block" />

      <Link
        href="/profile"
        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-[13px] font-bold text-primary select-none">
          {initials}
        </span>
        <span className="hidden text-left lg:block">
          <span className="block text-[14px] font-semibold leading-tight text-ink">
            {displayName}
          </span>
          <span className="micro block text-ink-muted">{userGoal}</span>
        </span>
      </Link>
    </header>
  );
}
