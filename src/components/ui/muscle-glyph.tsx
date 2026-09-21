import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type MuscleGlyphName =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Arms"
  | "Core"
  | "Cardio";

const GLYPHS: Record<MuscleGlyphName, ReactNode> = {
  Chest: (
    <>
      <path d="M50 26c-13-6-30-1-30 18s10 27 24 24" />
      <path d="M50 26c13-6 30-1 30 18s-10 27-24 24" />
      <path d="M50 24v46" />
    </>
  ),
  Back: (
    <>
      <path d="M34 18c-8 12-13 24-13 36 0 10 5 18 13 22" />
      <path d="M66 18c8 12 13 24 13 36 0 10-5 18-13 22" />
      <path d="M50 18v58M32 40h36" />
    </>
  ),
  Legs: (
    <>
      <path d="M40 14v30l-8 40M60 14v30l8 40" />
      <path d="M32 44h36" />
    </>
  ),
  Shoulders: (
    <>
      <path d="M16 52c0-12 8-20 18-20h32c10 0 18 8 18 20" />
      <path d="M30 32v42M70 32v42M50 32v26" />
    </>
  ),
  Arms: (
    <>
      <path d="M18 78c0-24 14-42 32-42 12 0 18 8 18 16s-6 14-14 14" />
      <path d="M62 60l12 12-12 12" />
    </>
  ),
  Core: (
    <>
      <rect x="28" y="14" width="44" height="66" rx="8" />
      <path d="M28 36h44M28 58h44M50 14v66" />
    </>
  ),
  Cardio: (
    <>
      <path d="M50 82S18 62 18 41a14 14 0 0 1 32-9 14 14 0 0 1 32 9c0 21-32 41-32 41z" />
      <path d="M14 50h14l7-11 9 20 7-13h13" />
    </>
  ),
};

export interface MuscleGlyphProps {
  name: MuscleGlyphName;
  size?: number;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

export function MuscleGlyph({
  name,
  size = 48,
  className,
  "aria-hidden": ariaHidden = true,
}: MuscleGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 92"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden={ariaHidden}
    >
      {GLYPHS[name]}
    </svg>
  );
}
