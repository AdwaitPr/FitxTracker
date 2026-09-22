import { useId } from "react";
import { MuscleGlyph } from "@/components/ui/muscle-glyph";
import type { MuscleGlyphName } from "@/components/ui/muscle-glyph";
import { cn } from "@/lib/utils";

const COVER: Record<
  MuscleGlyphName,
  { g1: string; g2: string; m1: string; m2: string }
> = {
  Chest: { g1: "#8E7BF0", g2: "#6C5CE1", m1: "#F49BDD", m2: "#B4A9FF" },
  Back: { g1: "#6FB6D9", g2: "#4E7FD6", m1: "#A9E4F0", m2: "#8577F0" },
  Legs: { g1: "#DFA362", g2: "#B9722F", m1: "#FFD79A", m2: "#F49BDD" },
  Shoulders: { g1: "#8577F0", g2: "#5A4BD1", m1: "#7FD3EC", m2: "#C9C3F5" },
  Arms: { g1: "#9B8BF2", g2: "#6C5CE1", m1: "#FFD79A", m2: "#F49BDD" },
  Core: { g1: "#4FBF8B", g2: "#2C8F72", m1: "#A9E4C8", m2: "#8577F0" },
  Cardio: { g1: "#E86F9E", g2: "#A83E78", m1: "#FFD79A", m2: "#B4A9FF" },
};

export function normalizeMuscleGroup(name?: string | null): MuscleGlyphName {
  if (!name) return "Chest";
  const lower = name.toLowerCase();
  if (lower.includes("chest") || lower.includes("pec")) return "Chest";
  if (lower.includes("back") || lower.includes("lat") || lower.includes("trap")) return "Back";
  if (lower.includes("leg") || lower.includes("quad") || lower.includes("hamstring") || lower.includes("calf")) return "Legs";
  if (lower.includes("shoulder") || lower.includes("delt")) return "Shoulders";
  if (lower.includes("arm") || lower.includes("bicep") || lower.includes("tricep")) return "Arms";
  if (lower.includes("core") || lower.includes("ab")) return "Core";
  if (lower.includes("cardio")) return "Cardio";
  return "Chest";
}

export function WorkoutCover({
  muscle = "Chest",
  className,
}: {
  muscle?: string | null;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const normalized = normalizeMuscleGroup(muscle);
  const p = COVER[normalized];

  return (
    <svg
      viewBox="0 0 320 170"
      className={cn("h-full w-full select-none", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.g1} />
          <stop offset="100%" stopColor={p.g2} />
        </linearGradient>
        <filter id={`b${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>
      <rect width="320" height="170" fill={`url(#g${uid})`} />
      <g filter={`url(#b${uid})`}>
        <circle cx="52" cy="34" r="76" fill={p.m1} opacity="0.55" />
        <circle cx="286" cy="150" r="96" fill={p.m2} opacity="0.5" />
        <circle cx="196" cy="18" r="52" fill={p.m1} opacity="0.3" />
      </g>
      <g stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1">
        <path d="M0 42h320M0 128h320M96 0v170M236 0v170" />
      </g>
      <rect
        x="18"
        y="18"
        width="284"
        height="134"
        rx="26"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.18"
      />
      <g transform="translate(112 36) scale(0.98)" color="#ffffff" opacity="0.62">
        <MuscleGlyph name={normalized} className="h-[98px] w-[98px]" />
      </g>
    </svg>
  );
}
