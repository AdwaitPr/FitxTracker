import { useEffect, useState } from "react";
import type { AnchorHTMLAttributes } from "react";

export function getPath(): string {
  const h = window.location.hash.replace(/^#/, "");
  return h || "/";
}

export function navigate(path: string) {
  if (getPath() === path) return;
  window.location.hash = path;
}

export function usePath() {
  const [path, setPath] = useState(getPath);
  useEffect(() => {
    const on = () => {
      setPath(getPath());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return path;
}

/** matches "/workouts/:id" style patterns; returns params or null */
export function match(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split("/").filter(Boolean);
  const s = path.split("?")[0].split("/").filter(Boolean);
  if (p.length !== s.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

export function Link({
  to,
  children,
  ...rest
}: { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <a href={`#${to}`} {...rest}>
      {children}
    </a>
  );
}
