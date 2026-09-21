"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const chartFont = {
  fontSize: 10,
  fontWeight: 600,
  fill: "var(--ink-muted)",
  letterSpacing: "0.04em",
} as const;

export interface CalendarHeatmapProps {
  days: number[];
  weeks?: number;
  summary: string;
  className?: string;
}

export function CalendarHeatmap({
  days,
  weeks = 26,
  summary,
  className,
}: CalendarHeatmapProps) {
  const cell = 12;
  const gap = 3;
  const W = weeks * (cell + gap) + 30;
  const H = 7 * (cell + gap) + 18;
  const vals = days.slice(-weeks * 7);

  const scale = [
    "var(--hairline)",
    "var(--primary-soft)",
    "var(--primary-soft-2)",
    "var(--primary)",
    "var(--primary-dark)",
  ];

  const dayNames = ["Mon", "", "Wed", "", "Fri", "", ""];

  // Compute month positions across weeks
  const months = React.useMemo(() => {
    const out: { x: number; label: string }[] = [];
    const now = new Date();
    for (let w = 0; w < weeks; w++) {
      const d = new Date(now);
      d.setDate(now.getDate() - (weeks - 1 - w) * 7);
      if (d.getDate() <= 7) {
        out.push({
          x: 30 + w * (cell + gap),
          label: d.toLocaleString("en", { month: "short" }),
        });
      }
    }
    return out;
  }, [weeks, cell, gap]);

  return (
    <figure className={cn("m-0 overflow-x-auto no-scrollbar", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full min-w-[520px]"
        role="img"
        aria-label={summary}
      >
        {months.map((m) => (
          <text key={m.x} x={m.x} y={9} {...chartFont}>
            {m.label}
          </text>
        ))}

        {dayNames.map(
          (d, i) =>
            d && (
              <text key={d} x={0} y={18 + i * (cell + gap) + 9} {...chartFont}>
                {d}
              </text>
            )
        )}

        {vals.map((v, i) => {
          const w = Math.floor(i / 7);
          const d = i % 7;
          return (
            <rect
              key={i}
              x={30 + w * (cell + gap)}
              y={18 + d * (cell + gap)}
              width={cell}
              height={cell}
              rx={3}
              fill={scale[Math.min(4, Math.max(0, v))]}
              className="transition-opacity duration-150 hover:opacity-80"
            >
              <title>{v === 0 ? "Rest day" : `${v} session${v > 1 ? "s" : ""}`}</title>
            </rect>
          );
        })}
      </svg>

      <figcaption className="mt-2 flex items-center justify-end gap-1.5 text-[11px] font-semibold text-ink-muted select-none">
        <span>Less</span>
        {scale.map((s, idx) => (
          <span
            key={idx}
            className="h-3 w-3 rounded-[3px] border border-hairline/30"
            style={{ background: s }}
          />
        ))}
        <span>More</span>
      </figcaption>
      <p className="sr-only">{summary}</p>
    </figure>
  );
}
