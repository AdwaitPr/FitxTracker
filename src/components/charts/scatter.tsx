"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const chartFont = {
  fontSize: 10,
  fontWeight: 600,
  fill: "var(--ink-muted)",
  letterSpacing: "0.04em",
} as const;

export interface ScatterPoint {
  x: number;
  y: number;
  label: string;
}

export interface ScatterProps {
  points: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  summary: string;
  className?: string;
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

export function Scatter({
  points,
  xLabel,
  yLabel,
  summary,
  className,
}: ScatterProps) {
  const W = 600;
  const H = 220;
  const pl = 38;
  const pr = 12;
  const pt = 14;
  const pb = 30;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  const xmin = xs.length > 0 ? Math.floor(Math.min(...xs) / 10) * 10 : 0;
  const xmax = xs.length > 0 ? Math.ceil(Math.max(...xs) / 10) * 10 : 100;
  const ymin = ys.length > 0 ? Math.floor(Math.min(...ys) / 10) * 10 : 0;
  const ymax = ys.length > 0 ? Math.ceil(Math.max(...ys) / 10) * 10 : 100;

  const x = (v: number) => pl + ((v - xmin) / (xmax - xmin || 1)) * (W - pl - pr);
  const y = (v: number) => pt + (1 - (v - ymin) / (ymax - ymin || 1)) * (H - pt - pb);

  const n = points.length;
  const mx = n > 0 ? xs.reduce((a, b) => a + b, 0) / n : 0;
  const my = n > 0 ? ys.reduce((a, b) => a + b, 0) / n : 0;

  const covXY = points.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0);
  const varX = points.reduce((a, p) => a + (p.x - mx) ** 2, 0);
  const varY = points.reduce((a, p) => a + (p.y - my) ** 2, 0);

  const slope = varX > 0 ? covXY / varX : 0;
  const b = my - slope * mx;
  const denom = Math.sqrt(varX * varY);
  const r = denom > 0 ? covXY / denom : 0;

  const [hover, setHover] = React.useState<number | null>(null);
  const ticks = [0, 1, 2, 3];

  return (
    <figure className={cn("relative m-0", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={summary}
      >
        {ticks.map((i) => {
          const v = ymin + ((ymax - ymin) * i) / 3;
          return (
            <g key={`y-${i}`}>
              <line
                x1={pl}
                x2={W - pr}
                y1={y(v)}
                y2={y(v)}
                stroke="var(--hairline)"
                strokeDasharray="3 4"
              />
              <text x={pl - 8} y={y(v) + 3.5} textAnchor="end" {...chartFont}>
                {Math.round(v)}
              </text>
            </g>
          );
        })}

        {ticks.map((i) => {
          const v = xmin + ((xmax - xmin) * i) / 3;
          return (
            <text key={`x-${i}`} x={x(v)} y={H - 12} textAnchor="middle" {...chartFont}>
              {Math.round(v)}
            </text>
          );
        })}

        <text x={W - pr} y={H - 1} textAnchor="end" {...chartFont}>
          {xLabel} →
        </text>
        <text x={pl} y={9} {...chartFont}>
          {yLabel} ↑
        </text>

        {n >= 2 && (
          <line
            x1={x(xmin)}
            y1={y(slope * xmin + b)}
            x2={x(xmax)}
            y2={y(slope * xmax + b)}
            stroke="var(--primary)"
            strokeWidth={1.6}
            strokeDasharray="6 5"
          />
        )}

        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(p.x)}
            cy={y(p.y)}
            r={hover === i ? 7 : 5}
            fill={i % 2 ? "var(--primary)" : "var(--primary-soft-2)"}
            stroke="var(--surface)"
            strokeWidth={1.5}
            tabIndex={0}
            role="button"
            aria-label={`${p.label}: ${xLabel} ${p.x}, ${yLabel} ${p.y}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setHover(null);
            }}
            className="outline-none cursor-pointer"
            style={{ transition: "r 150ms" }}
          />
        ))}
      </svg>

      {hover !== null && points[hover] && (
        <Tip x={(x(points[hover].x) / W) * 100} y={(y(points[hover].y) / H) * 100}>
          <span className="block text-[10px] font-medium opacity-70">
            {points[hover].label}
          </span>
          <span>
            {xLabel} {points[hover].x} · {yLabel} {points[hover].y}
          </span>
        </Tip>
      )}

      <figcaption className="mt-1 text-[11.5px] font-semibold text-ink-muted">
        Pearson r = {r.toFixed(2)} · dashed line is the least-squares fit
      </figcaption>
      <p className="sr-only">{summary}</p>
    </figure>
  );
}
