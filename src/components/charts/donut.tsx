"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export interface DonutProps {
  slices: DonutSlice[];
  size?: number;
  summary: string;
  unitLabel?: string;
  className?: string;
}

function useChartAnimation(dep?: string | number) {
  const [animated, setAnimated] = React.useState(false);
  React.useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setAnimated(true);
    });
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [dep]);
  return animated;
}

export function Donut({
  slices,
  size = 180,
  summary,
  unitLabel = "sets",
  className,
}: DonutProps) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  const r = 42;
  const c = 2 * Math.PI * r;
  const [hover, setHover] = React.useState<number | null>(null);
  const animated = useChartAnimation(slices.map((s) => s.value).join());

  const safeTotal = total > 0 ? total : 1;
  const sliceLayouts = slices.map((s, i) => {
    const prevSum = slices.slice(0, i).reduce((sum, item) => sum + item.value, 0);
    const offset = (prevSum / safeTotal) * c;
    const len = (s.value / safeTotal) * c;
    return { ...s, len, offset };
  });

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-5 sm:flex-row sm:items-center",
        className
      )}
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label={summary}
        >
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--hairline)"
            strokeWidth="12"
          />
          {sliceLayouts.map((s, i) => {
            return (
              <circle
                key={s.label}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={hover === i ? 14 : 12}
                strokeDasharray={`${animated ? s.len : 0} ${c}`}
                strokeDashoffset={-s.offset}
                strokeLinecap="butt"
                style={{
                  transition:
                    "stroke-dasharray 900ms cubic-bezier(.2,.8,.2,1), stroke-width 150ms",
                }}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="tnum text-[24px] font-bold leading-none tracking-[-0.02em] text-ink">
              {hover !== null && total > 0
                ? `${Math.round((slices[hover].value / total) * 100)}%`
                : total}
            </div>
            <div className="micro mt-1 text-ink-muted">
              {hover !== null ? slices[hover].label : unitLabel}
            </div>
          </div>
        </div>
      </div>

      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2.5">
        {slices.map((s, i) => {
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
          return (
            <li key={s.label}>
              <button
                type="button"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg p-1 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary",
                  hover === i && "bg-canvas"
                )}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="flex-1 truncate text-[13px] font-medium text-ink-soft">
                  {s.label}
                </span>
                <span className="tnum text-[12.5px] font-semibold text-ink">{pct}%</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="sr-only">{summary}</p>
    </div>
  );
}
