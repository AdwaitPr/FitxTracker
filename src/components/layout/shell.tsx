"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar, TopBarUser } from "@/components/layout/top-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { Alert } from "@/lib/alerts";

export interface ShellProps {
  children: ReactNode;
  rail?: ReactNode;
  railSticky?: boolean;
  narrow?: boolean;
  user?: TopBarUser | null;
  alert?: Alert | null;
}

export function Shell({
  children,
  rail,
  railSticky = false,
  narrow = false,
  user,
  alert,
}: ShellProps) {
  return (
    <div className="min-h-screen bg-frame">
      <div className="app-window min-h-screen bg-canvas">
        <div className="md:flex">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <div className="px-4 sm:px-6 xl:px-8">
              <TopBar user={user} alert={alert} />
            </div>
            <div className="xl:flex xl:items-start">
              <main
                className={cn(
                  "min-w-0 flex-1 px-4 pb-32 sm:px-6 md:pb-16 xl:px-8",
                  narrow && "mx-auto max-w-[1080px]"
                )}
              >
                {children}
              </main>
              <aside
                id="shell-rail"
                aria-label="Summary"
                className={cn(
                  "px-4 pb-32 sm:px-6 md:pb-16 xl:w-[356px] xl:shrink-0 xl:border-l xl:border-hairline xl:px-6",
                  railSticky &&
                    "xl:sticky xl:top-0 xl:max-h-screen xl:overflow-y-auto no-scrollbar",
                  !rail && "hidden"
                )}
              >
                {rail}
              </aside>
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    </div>
  );
}

export interface ShellRailProps {
  children: ReactNode;
  sticky?: boolean;
}

export function ShellRail({ children, sticky = false }: ShellRailProps) {
  const [railEl, setRailEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById("shell-rail");
    if (el) {
      el.classList.remove("hidden");
      if (sticky) {
        el.classList.add(
          "xl:sticky",
          "xl:top-0",
          "xl:max-h-screen",
          "xl:overflow-y-auto",
          "no-scrollbar"
        );
      }
      const frameId = requestAnimationFrame(() => {
        setRailEl(el);
      });

      return () => {
        cancelAnimationFrame(frameId);
        el.classList.add("hidden");
        el.classList.remove(
          "xl:sticky",
          "xl:top-0",
          "xl:max-h-screen",
          "xl:overflow-y-auto",
          "no-scrollbar"
        );
      };
    }
  }, [sticky]);

  if (!railEl) return null;
  return createPortal(children, railEl);
}
