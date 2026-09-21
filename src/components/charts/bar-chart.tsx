"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const chartFont = {
  fontSize: 10,
  fontWeight: 600,
  fill: "var(--ink-muted)",
  letterSpacing: "0.04em",
} as const;

function niceTicks(max: number, n = 3): number[] {
  if (max <= 0) return [1, 2, 3];
  const raw = max / n;
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag;
  return Array.from({ length: n }, (_, i) => Math.round((i + 1) * step * 100) / 100);
}

function Tip({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-[10px] bg-ink px-2.5 py-1.5 text-[11.5px] font-semibold text-canvas shadow-lift select-none"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {children}
    </div>
  );
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

export interface BarChartProps {
  labels: string[];
  values: number[];
  unit?: string;
  height?: number;
  summary: string;
  line?: number[];
  lineName?: string;
  lineUnit?: string;
  className?: string;
  ticks?: number;
  highlight?: number;
}

export function BarChart({
  labels,
  values,
  unit = "",
  height = 170,
  summary,
  line,
  lineName,
  lineUnit = "",
  className,
  ticks: tickCount = 3,
  highlight,
}: BarChartProps) {
  const W = 600;
  const H = height;
  const pl = 34;
  const pr = line ? 34 : 12;
  const pt = 18;
  const pb = 26;

  const maxValue = values.length > 0 ? Math.max(...values, 0) : 10;
  const ticks = niceTicks(maxValue, tickCount);
  const max = ticks[ticks.length - 1] || 1;
  const slot = (W - pl - pr) / Math.max(1, labels.length);
  const bw = Math.min(30, Math.max(4, slot * 0.5));
  const y = (v: number) => pt + (1 - v / max) * (H - pt - pb);

  const lmax = line && line.length > 0 ? Math.max(...line) * 1.1 : 1;
  const lmin = line && line.length > 0 ? Math.min(...line) * 0.9 : 0;
  const ly = (v: number) => pt + (1 - (v - lmin) / (lmax - lmin || 1)) * (H - pt - pb);

  const [hover, setHover] = React.useState<number | null>(null);
  const animated = useChartAnimation(values.join());
  const step = Math.max(1, Math.ceil(labels.length / 8));

  return (
    <figure className={cn("relative m-0", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={summary}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={pl}
              x2={W - pr}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--hairline)"
              strokeDasharray="3 4"
            />
            <text x={pl - 8} y={y(t) + 3.5} textAnchor="end" {...chartFont}>
              {t}
            </text>
          </g>
        ))}

        {values.map((v, i) => {
          const cx = pl + slot * i + slot / 2;
          const h = Math.max(3, (v / max) * (H - pt - pb));
          const active = hover === i || highlight === i;

          return (
            <g key={i}>
              <rect
                x={cx - bw / 2}
                y={H - pb - (animated ? h : 0)}
                width={bw}
                height={animated ? h : 0}
                rx={bw / 2}
                fill={i % 2 === 0 ? "var(--primary-soft-2)" : "var(--primary)"}
                opacity={hover !== null && !active ? 0.55 : 1}
                style={{
                  transition:
                    "height 620ms cubic-bezier(.2,.8,.2,1), y 620ms cubic-bezier(.2,.8,.2,1), opacity 150ms",
                }}
              />
              {(i % step === 0 || i === labels.length - 1) && (
                <text key={`label-${i}`} x={cx} y={H - 8} textAnchor="middle" {...chartFont}>
                  {labels[i]}
                </text>
              )}
              <rect
                x={cx - slot / 2}
                y={pt}
                width={slot}
                height={H - pt - pb}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${labels[i]}: ${v}${unit}${
                  line ? `, ${lineName} ${line[i]}${lineUnit}` : ""
                }`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setHover(null);
                }}
                className="outline-none cursor-pointer"
              />
            </g>
          );
        })}

        {line && (
          <g>
            <path
              d={line
                .map((v, i) => `${i === 0 ? "M" : "L"}${pl + slot * i + slot / 2} ${ly(v)}`)
                .join(" ")}
              fill="none"
              stroke="var(--ink)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2000"
              strokeDashoffset={animated ? 0 : 2000}
              style={{ transition: "stroke-dashoffset 1100ms cubic-bezier(.2,.8,.2,1)" }}
            />
            {line.map((v, i) => (
              <circle
                key={i}
                cx={pl + slot * i + slot / 2}
                cy={ly(v)}
                r={hover === i ? 5 : 3.2}
                fill="var(--surface)"
                stroke="var(--ink)"
                strokeWidth={2}
              />
            ))}
            {[lmin, (lmin + lmax) / 2, lmax].map((t) => (
              <text
                key={t}
                x={W - pr + 8}
                y={ly(t) + 3.5}
                textAnchor="start"
                {...chartFont}
              >
                {Math.round(t)}
              </text>
            ))}
          </g>
        )}
      </svg>

      {hover !== null && (
        <Tip
          x={((pl + slot * hover + slot / 2) / W) * 100}
          y={
            ((line
              ? Math.min(y(values[hover] ?? 0), ly(line[hover] ?? 0))
              : y(values[hover] ?? 0)) /
              H) *
            100
          }
        >
          <span className="block text-[10px] font-medium opacity-70">{labels[hover]}</span>
          <span className="block">
            {values[hover]}
            {unit}
          </span>
          {line && (
            <span className="block">
              {lineName}: {line[hover]}
              {lineUnit}
            </span>
          )}
        </Tip>
      )}

      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}

export const Bars = BarChart;
