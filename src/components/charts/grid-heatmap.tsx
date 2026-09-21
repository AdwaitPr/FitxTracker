import * as React from "react";
import { cn } from "@/lib/utils";

export interface GridHeatmapProps {
  rows: string[];
  cols: string[];
  values: number[][];
  summary: string;
  format?: (value: number) => string;
  className?: string;
}

export function GridHeatmap({
  rows,
  cols,
  values,
  summary,
  format = (v) => String(v),
  className,
}: GridHeatmapProps) {
  const flat = values.flat();
  const min = flat.length > 0 ? Math.min(...flat) : 0;
  const max = flat.length > 0 ? Math.max(...flat) : 1;

  return (
    <div role="img" aria-label={summary} className={cn("overflow-x-auto", className)}>
      <div
        className="grid min-w-[340px] gap-1.5"
        style={{
          gridTemplateColumns: `72px repeat(${cols.length}, minmax(0, 1fr))`,
        }}
      >
        <span aria-hidden="true" />
        {cols.map((c) => (
          <span key={c} className="micro text-center text-ink-muted select-none">
            {c}
          </span>
        ))}
        {rows.map((r, ri) => (
          <div key={r} className="contents">
            <span className="micro self-center text-ink-muted select-none">{r}</span>
            {(values[ri] || []).map((v, ci) => {
              const t = max > min ? (v - min) / (max - min) : 0;
              const intensityPct = Math.round(12 + t * 88);

              return (
                <span
                  key={ci}
                  title={`${r} · ${cols[ci]}: ${format(v)}`}
                  tabIndex={0}
                  className="tnum grid h-10 place-items-center rounded-[10px] text-[11.5px] font-bold select-none transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-primary"
                  style={{
                    background: `color-mix(in oklab, var(--primary) ${intensityPct}%, var(--surface))`,
                    color: t > 0.45 ? "#ffffff" : "var(--ink)",
                  }}
                >
                  {format(v)}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <p className="sr-only">{summary}</p>
    </div>
  );
}
