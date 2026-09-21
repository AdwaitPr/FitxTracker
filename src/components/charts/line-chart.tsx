"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const chartFont = {
  fontSize: 10,
  fontWeight: 600,
  fill: "var(--ink-muted)",
  letterSpacing: "0.04em",
} as const;

export interface LineSeries {
  name: string;
  values: number[];
  color?: string;
  dashed?: boolean;
  area?: boolean;
}

export type Series = LineSeries;

export interface LineChartProps {
  labels: string[];
  series: LineSeries[];
  goal?: number;
  goalLabel?: string;
  unit?: string;
  height?: number;
  summary: string;
  yMin?: number;
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

export function LineChart({
  labels,
  series,
  goal,
  goalLabel,
  unit = "",
  height = 200,
  summary,
  yMin,
  className,
}: LineChartProps) {
  const W = 600;
  const H = height;
  const pl = 48;
  const pr = 12;
  const pt = 16;
  const pb = 26;

  const all = series.flatMap((s) => s.values).concat(goal !== undefined ? [goal] : []);
  const lo = yMin ?? (all.length > 0 ? Math.min(...all) : 0);
  const hi = all.length > 0 ? Math.max(...all) : 100;
  const pad = (hi - lo || 1) * 0.15;
  const min = Math.max(0, Math.floor((lo - pad) * 10) / 10);
  const max = Math.ceil((hi + pad) * 10) / 10;

  const x = (i: number) => pl + (i / Math.max(1, labels.length - 1)) * (W - pl - pr);
  const y = (v: number) => pt + (1 - (v - min) / (max - min || 1)) * (H - pt - pb);
  const ticks = [0, 1, 2, 3].map((i) => min + ((max - min) * i) / 3);

  const [hover, setHover] = React.useState<number | null>(null);
  const animated = useChartAnimation(labels.join());
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
              {Math.round(t * 10) / 10}
            </text>
          </g>
        ))}

        {labels.map(
          (l, i) =>
            (i % step === 0 || i === labels.length - 1) && (
              <text key={`${l}-${i}`} x={x(i)} y={H - 8} textAnchor="middle" {...chartFont}>
                {l}
              </text>
            )
        )}

        {goal !== undefined && (
          <g>
            <line
              x1={pl}
              x2={W - pr}
              y1={y(goal)}
              y2={y(goal)}
              stroke="var(--tag-green-fg)"
              strokeWidth={1.4}
              strokeDasharray="6 5"
            />
            <text
              x={W - pr}
              y={y(goal) - 6}
              textAnchor="end"
              fontSize={10}
              fontWeight={700}
              fill="var(--tag-green-fg)"
            >
              {goalLabel ?? `Goal ${goal}${unit}`}
            </text>
          </g>
        )}

        {series.map((s, si) => {
          const color = s.color ?? "var(--primary)";
          const d = s.values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(v)}`).join(" ");
          const area = `${d} L${x(s.values.length - 1)} ${H - pb} L${x(0)} ${H - pb} Z`;

          return (
            <g key={s.name}>
              {s.area && (
                <path
                  d={area}
                  fill={color}
                  opacity={animated ? 0.08 : 0}
                  style={{ transition: "opacity 700ms" }}
                />
              )}
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={si === 0 ? 2.4 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={s.dashed ? "5 5" : "2000"}
                strokeDashoffset={animated || s.dashed ? 0 : 2000}
                style={{ transition: "stroke-dashoffset 1100ms cubic-bezier(.2,.8,.2,1)" }}
              />
              {s.values.map((v, i) => (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={y(v)}
                  r={hover === i ? 5 : 3}
                  fill="var(--surface)"
                  stroke={color}
                  strokeWidth={2}
                  style={{ transition: "r 150ms" }}
                />
              ))}
            </g>
          );
        })}

        {labels.map((l, i) => (
          <rect
            key={`h-${i}`}
            x={x(i) - (W - pl - pr) / Math.max(1, labels.length) / 2}
            y={pt}
            width={(W - pl - pr) / Math.max(1, labels.length)}
            height={H - pt - pb}
            fill="transparent"
            tabIndex={0}
            role="button"
            aria-label={`${l}: ${series.map((s) => `${s.name} ${s.values[i]}${unit}`).join(", ")}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setHover(null);
            }}
            className="outline-none cursor-pointer"
          />
        ))}

        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={pt}
            y2={H - pb}
            stroke="var(--primary)"
            strokeOpacity={0.35}
            strokeDasharray="3 3"
          />
        )}
      </svg>

      {hover !== null && (
        <Tip
          x={(x(hover) / W) * 100}
          y={(y(Math.max(...series.map((s) => s.values[hover] ?? 0))) / H) * 100}
        >
          <span className="block text-[10px] font-medium opacity-70">{labels[hover]}</span>
          {series.map((s) => (
            <span key={s.name} className="block">
              {s.name}: {s.values[hover]}
              {unit}
            </span>
          ))}
        </Tip>
      )}

      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
