import * as React from "react";
import { cn } from "@/lib/utils";

export interface SparklineProps {
  values: number[];
  color?: string;
  height?: number;
  label: string;
  className?: string;
}

export function Sparkline({
  values,
  color = "var(--primary)",
  height = 56,
  label,
  className,
}: SparklineProps) {
  const W = 300;
  const H = height;

  if (!values || values.length === 0) {
    return (
      <div
        role="img"
        aria-label={label}
        className={cn("h-[56px] w-full", className)}
      />
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const safeRange = max - min || 1;

  const x = (i: number) => (i / Math.max(1, values.length - 1)) * W;
  const y = (v: number) => 4 + (1 - (v - min) / safeRange) * (H - 8);

  const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(v)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={label}
      preserveAspectRatio="none"
    >
      <path d={`${d} L${W} ${H} L0 ${H} Z`} fill={color} opacity={0.08} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
