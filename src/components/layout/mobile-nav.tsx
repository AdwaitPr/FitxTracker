"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, History, Plus, Activity, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { activeIdFor } from "@/components/layout/sidebar";

interface MobileNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  isCenter?: boolean;
}

const mobileItems: MobileNavItem[] = [
  { id: "dashboard", label: "Home", href: "/dashboard", icon: House },
  { id: "history", label: "History", href: "/workouts/history", icon: History },
  { id: "new", label: "Log", href: "/workouts/new", icon: Plus, isCenter: true },
  { id: "recovery", label: "Recovery", href: "/recovery", icon: Activity },
  { id: "profile", label: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname() || "/dashboard";
  const active = activeIdFor(pathname);

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-end justify-around px-2 pb-2 pt-2">
        {mobileItems.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <li key={item.id} className="-mt-7">
                <Link
                  href={item.href}
                  aria-label="Log workout"
                  className="grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-lift transition-transform duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                >
                  <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                </Link>
                <span className="micro mt-1 block text-center text-ink-muted">
                  Log
                </span>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className="flex min-h-[52px] min-w-[56px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors duration-200"
                style={{
                  color: isActive ? "var(--primary)" : "var(--muted)",
                }}
              >
                <Icon
                  size={21}
                  strokeWidth={isActive ? 1.9 : 1.5}
                  aria-hidden="true"
                />
                <span className="text-[10.5px] font-semibold tracking-[0.04em]">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
