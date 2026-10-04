"use client";

import { useSyncExternalStore, useTransition } from "react";
import { setTheme } from "@/app/actions/theme";

const subscribeTheme = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
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
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
};

const getServerThemeSnapshot = (): "light" | "dark" => "dark";

export function useThemeMode() {
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
      await setTheme(nextTheme);
    });
  };

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
  };
}
