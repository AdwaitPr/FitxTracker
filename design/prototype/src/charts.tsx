import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

/* Shared hand-rolled SVG charts. All charts expose a text summary for AT
   and an HTML tooltip anchored in percentage space (so it scales with the
   viewBox). Alternating light/solid indigo bars, dashed gridlines. */

const font = { fontSize: 10, fontWeight: 600, fill: "var(--muted)", letterSpacing: "0.04em" } as const;

function niceTicks(max: number, n = 3): number[] {
  const raw = max / n;
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag;
  return Array.from({ length: n }, (_, i) => Math.round((i + 1) * step * 100) / 100);
}

function Tip({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <div role="tooltip" className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-[10px] bg-ink px-2.5 py-1.5 text-[11.5px] font-semibold text-canvas shadow-lift" style={{ left: `${x}%`, top: `${y}%` }}>
      {children}
    </div>
  );
}

function useMounted(dep?: unknown) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(false);
    const t = window.setTimeout(() => setOn(true), 40);
    return () => window.clearTimeout(t);
  }, [dep]);
  return on;
}

/* ------------------------------------------------------------ LineChart */
export interface Series { name: string; values: number[]; color?: string; dashed?: boolean; area?: boolean }
export function LineChart({ labels, series, goal, goalLabel, unit = "", height = 200, summary, yMin, className }: { labels: string[]; series: Series[]; goal?: number; goalLabel?: string; unit?: string; height?: number; summary: string; yMin?: number; className?: string }) {
  const W = 600, H = height, pl = 34, pr = 12, pt = 16, pb = 26;
  const all = series.flatMap((s) => s.values).concat(goal !== undefined ? [goal] : []);
  const lo = yMin ?? Math.min(...all), hi = Math.max(...all);
  const pad = (hi - lo || 1) * 0.15;
  const min = Math.max(0, Math.floor((lo - pad) * 10) / 10), max = Math.ceil((hi + pad) * 10) / 10;
  const x = (i: number) => pl + (i / Math.max(1, labels.length - 1)) * (W - pl - pr);
  const y = (v: number) => pt + (1 - (v - min) / (max - min || 1)) * (H - pt - pb);
  const ticks = [0, 1, 2, 3].map((i) => min + ((max - min) * i) / 3);
  const [hover, setHover] = useState<number | null>(null);
  const on = useMounted(labels.join());
  const step = Math.max(1, Math.ceil(labels.length / 8));

  return (
    <figure className={clsx("relative m-0", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={summary}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--hairline)" strokeDasharray="3 4" />
            <text x={pl - 8} y={y(t) + 3.5} textAnchor="end" {...font}>{Math.round(t * 10) / 10}</text>
          </g>
        ))}
        {labels.map((l, i) => (i % step === 0 || i === labels.length - 1) && (
          <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" {...font}>{l}</text>
        ))}
        {goal !== undefined && (
          <g>
            <line x1={pl} x2={W - pr} y1={y(goal)} y2={y(goal)} stroke="var(--tag-green-fg)" strokeWidth={1.4} strokeDasharray="6 5" />
            <text x={W - pr} y={y(goal) - 6} textAnchor="end" fontSize={10} fontWeight={700} fill="var(--tag-green-fg)">{goalLabel ?? `Goal ${goal}${unit}`}</text>
          </g>
        )}
        {series.map((s, si) => {
          const color = s.color ?? "var(--primary)";
          const d = s.values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(v)}`).join(" ");
          const area = `${d} L${x(s.values.length - 1)} ${H - pb} L${x(0)} ${H - pb} Z`;
          return (
            <g key={s.name}>
              {s.area && <path d={area} fill={color} opacity={on ? 0.08 : 0} style={{ transition: "opacity 700ms" }} />}
              <path d={d} fill="none" stroke={color} strokeWidth={si === 0 ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={s.dashed ? "5 5" : "2000"} strokeDashoffset={on || s.dashed ? 0 : 2000} style={{ transition: "stroke-dashoffset 1100ms cubic-bezier(.2,.8,.2,1)" }} />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={hover === i ? 5 : 3} fill="var(--surface)" stroke={color} strokeWidth={2} style={{ transition: "r 150ms" }} />
              ))}
            </g>
          );
        })}
        {labels.map((l, i) => (
          <rect key={"h" + i} x={x(i) - (W - pl - pr) / labels.length / 2} y={pt} width={(W - pl - pr) / labels.length} height={H - pt - pb} fill="transparent" tabIndex={0} role="button" aria-label={`${l}: ${series.map((s) => `${s.name} ${s.values[i]}${unit}`).join(", ")}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} className="outline-none" />
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pt} y2={H - pb} stroke="var(--primary)" strokeOpacity={0.35} strokeDasharray="3 3" />}
      </svg>
      {hover !== null && (
        <Tip x={(x(hover) / W) * 100} y={(y(Math.max(...series.map((s) => s.values[hover]))) / H) * 100}>
          <span className="block text-[10px] font-medium opacity-70">{labels[hover]}</span>
          {series.map((s) => (<span key={s.name} className="block">{s.name}: {s.values[hover]}{unit}</span>))}
        </Tip>
      )}
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}

/* ----------------------------------------------------------------- Bars */
export function Bars({ labels, values, unit = "", height = 170, summary, line, lineName, lineUnit = "", className, ticks: tickCount = 3, highlight }: { labels: string[]; values: number[]; unit?: string; height?: number; summary: string; line?: number[]; lineName?: string; lineUnit?: string; className?: string; ticks?: number; highlight?: number }) {
  const W = 600, H = height, pl = 34, pr = line ? 34 : 12, pt = 18, pb = 26;
  const ticks = niceTicks(Math.max(...values), tickCount);
  const max = ticks[ticks.length - 1];
  const slot = (W - pl - pr) / labels.length;
  const bw = Math.min(30, slot * 0.5);
  const y = (v: number) => pt + (1 - v / max) * (H - pt - pb);
  const lmax = line ? Math.max(...line) * 1.1 : 1, lmin = line ? Math.min(...line) * 0.9 : 0;
  const ly = (v: number) => pt + (1 - (v - lmin) / (lmax - lmin || 1)) * (H - pt - pb);
  const [hover, setHover] = useState<number | null>(null);
  const on = useMounted(values.join());
  const step = Math.max(1, Math.ceil(labels.length / 8));
  return (
    <figure className={clsx("relative m-0", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={summary}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--hairline)" strokeDasharray="3 4" />
            <text x={pl - 8} y={y(t) + 3.5} textAnchor="end" {...font}>{t}</text>
          </g>
        ))}
        {values.map((v, i) => {
          const cx = pl + slot * i + slot / 2;
          const h = Math.max(3, (v / max) * (H - pt - pb));
          const active = hover === i || highlight === i;
          return (
            <g key={i}>
              <rect x={cx - bw / 2} y={H - pb - (on ? h : 0)} width={bw} height={on ? h : 0} rx={bw / 2} fill={i % 2 === 0 ? "var(--primary-soft-2)" : "var(--primary)"} opacity={hover !== null && !active ? 0.55 : 1} style={{ transition: "height 620ms cubic-bezier(.2,.8,.2,1), y 620ms cubic-bezier(.2,.8,.2,1), opacity 150ms" }} />
              {(i % step === 0 || i === labels.length - 1) && <text x={cx} y={H - 8} textAnchor="middle" {...font}>{labels[i]}</text>}
              <rect x={cx - slot / 2} y={pt} width={slot} height={H - pt - pb} fill="transparent" tabIndex={0} role="button" aria-label={`${labels[i]}: ${v}${unit}${line ? `, ${lineName} ${line[i]}${lineUnit}` : ""}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} className="outline-none" />
            </g>
          );
        })}
        {line && (
          <g>
            <path d={line.map((v, i) => `${i === 0 ? "M" : "L"}${pl + slot * i + slot / 2} ${ly(v)}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2000" strokeDashoffset={on ? 0 : 2000} style={{ transition: "stroke-dashoffset 1100ms cubic-bezier(.2,.8,.2,1)" }} />
            {line.map((v, i) => <circle key={i} cx={pl + slot * i + slot / 2} cy={ly(v)} r={hover === i ? 5 : 3.2} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2} />)}
            {[lmin, (lmin + lmax) / 2, lmax].map((t) => <text key={t} x={W - pr + 8} y={ly(t) + 3.5} textAnchor="start" {...font}>{Math.round(t)}</text>)}
          </g>
        )}
      </svg>
      {hover !== null && (
        <Tip x={((pl + slot * hover + slot / 2) / W) * 100} y={((line ? Math.min(y(values[hover]), ly(line[hover])) : y(values[hover])) / H) * 100}>
          <span className="block text-[10px] font-medium opacity-70">{labels[hover]}</span>
          <span className="block">{values[hover]}{unit}</span>
          {line && <span className="block">{lineName}: {line[hover]}{lineUnit}</span>}
        </Tip>
      )}
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------- Donut */
export function Donut({ slices, size = 180, summary }: { slices: { label: string; value: number; color: string }[]; size?: number; summary: string }) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  const r = 42, c = 2 * Math.PI * r;
  const [hover, setHover] = useState<number | null>(null);
  const on = useMounted();
  let acc = 0;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={summary}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--hairline)" strokeWidth="12" />
          {slices.map((s, i) => {
            const len = (s.value / total) * c;
            const off = acc; acc += len;
            return <circle key={s.label} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth={hover === i ? 14 : 12} strokeDasharray={`${on ? len : 0} ${c}`} strokeDashoffset={-off} strokeLinecap="butt" style={{ transition: "stroke-dasharray 900ms cubic-bezier(.2,.8,.2,1), stroke-width 150ms" }} />;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="tnum text-[24px] font-bold leading-none tracking-[-0.02em] text-ink">{hover !== null ? `${Math.round((slices[hover].value / total) * 100)}%` : total}</div>
            <div className="micro mt-1 text-muted">{hover !== null ? slices[hover].label : "sets"}</div>
          </div>
        </div>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2.5">
        {slices.map((s, i) => (
          <li key={s.label}>
            <button type="button" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} className="flex w-full items-center gap-2.5 rounded-lg text-left">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="flex-1 text-[13px] font-medium text-ink-soft">{s.label}</span>
              <span className="tnum text-[12.5px] font-semibold text-ink">{Math.round((s.value / total) * 100)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------- Heatmap */
export function CalendarHeatmap({ days, weeks = 26, summary }: { days: number[]; weeks?: number; summary: string }) {
  const cell = 12, gap = 3, W = weeks * (cell + gap) + 30, H = 7 * (cell + gap) + 18;
  const vals = days.slice(-weeks * 7);
  const scale = ["var(--hairline)", "var(--primary-soft)", "var(--primary-soft-2)", "var(--primary)", "var(--primary-dark)"];
  const dayNames = ["Mon", "", "Wed", "", "Fri", "", ""];
  const months = useMemo(() => {
    const out: { x: number; label: string }[] = [];
    const now = new Date();
    for (let w = 0; w < weeks; w++) {
      const d = new Date(now); d.setDate(now.getDate() - (weeks - 1 - w) * 7);
      if (d.getDate() <= 7) out.push({ x: 30 + w * (cell + gap), label: d.toLocaleString("en", { month: "short" }) });
    }
    return out;
  }, [weeks]);
  return (
    <figure className="m-0 overflow-x-auto no-scrollbar">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px]" role="img" aria-label={summary}>
        {months.map((m) => <text key={m.x} x={m.x} y={9} {...font}>{m.label}</text>)}
        {dayNames.map((d, i) => d && <text key={d} x={0} y={18 + i * (cell + gap) + 9} {...font}>{d}</text>)}
        {vals.map((v, i) => {
          const w = Math.floor(i / 7), d = i % 7;
          return (
            <rect key={i} x={30 + w * (cell + gap)} y={18 + d * (cell + gap)} width={cell} height={cell} rx={3} fill={scale[Math.min(4, v)]}>
              <title>{v === 0 ? "Rest day" : `${v} session${v > 1 ? "s" : ""}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex items-center justify-end gap-1.5 text-[11px] font-semibold text-muted">
        Less {scale.map((s) => <span key={s} className="h-3 w-3 rounded-[3px]" style={{ background: s }} />)} More
      </figcaption>
      <p className="sr-only">{summary}</p>
    </figure>
  );
}

/* -------------------------------------------------------------- Scatter */
export function Scatter({ points, xLabel, yLabel, summary }: { points: { x: number; y: number; label: string }[]; xLabel: string; yLabel: string; summary: string }) {
  const W = 600, H = 220, pl = 34, pr = 12, pt = 14, pb = 30;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const xmin = Math.floor(Math.min(...xs) / 10) * 10, xmax = Math.ceil(Math.max(...xs) / 10) * 10;
  const ymin = Math.floor(Math.min(...ys) / 10) * 10, ymax = Math.ceil(Math.max(...ys) / 10) * 10;
  const x = (v: number) => pl + ((v - xmin) / (xmax - xmin || 1)) * (W - pl - pr);
  const y = (v: number) => pt + (1 - (v - ymin) / (ymax - ymin || 1)) * (H - pt - pb);
  const n = points.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  const slope = points.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0) / (points.reduce((a, p) => a + (p.x - mx) ** 2, 0) || 1);
  const b = my - slope * mx;
  const r = points.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0) / Math.sqrt(points.reduce((a, p) => a + (p.x - mx) ** 2, 0) * points.reduce((a, p) => a + (p.y - my) ** 2, 0) || 1);
  const [hover, setHover] = useState<number | null>(null);
  const ticks = [0, 1, 2, 3];
  return (
    <figure className="relative m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={summary}>
        {ticks.map((i) => { const v = ymin + ((ymax - ymin) * i) / 3; return (<g key={"y" + i}><line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} stroke="var(--hairline)" strokeDasharray="3 4" /><text x={pl - 8} y={y(v) + 3.5} textAnchor="end" {...font}>{Math.round(v)}</text></g>); })}
        {ticks.map((i) => { const v = xmin + ((xmax - xmin) * i) / 3; return <text key={"x" + i} x={x(v)} y={H - 12} textAnchor="middle" {...font}>{Math.round(v)}</text>; })}
        <text x={W - pr} y={H - 1} textAnchor="end" {...font}>{xLabel} →</text>
        <text x={pl} y={9} {...font}>{yLabel} ↑</text>
        <line x1={x(xmin)} y1={y(slope * xmin + b)} x2={x(xmax)} y2={y(slope * xmax + b)} stroke="var(--primary)" strokeWidth={1.6} strokeDasharray="6 5" />
        {points.map((p, i) => (
          <circle key={i} cx={x(p.x)} cy={y(p.y)} r={hover === i ? 7 : 5} fill={i % 2 ? "var(--primary)" : "var(--primary-soft-2)"} stroke="var(--surface)" strokeWidth={1.5} tabIndex={0} role="button" aria-label={`${p.label}: ${xLabel} ${p.x}, ${yLabel} ${p.y}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} className="outline-none" style={{ transition: "r 150ms" }} />
        ))}
      </svg>
      {hover !== null && <Tip x={(x(points[hover].x) / W) * 100} y={(y(points[hover].y) / H) * 100}><span className="block text-[10px] font-medium opacity-70">{points[hover].label}</span>{xLabel} {points[hover].x} · {yLabel} {points[hover].y}</Tip>}
      <figcaption className="mt-1 text-[11.5px] font-semibold text-muted">Pearson r = {r.toFixed(2)} · dashed line is the least-squares fit</figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------ Sparkline */
export function Sparkline({ values, color = "var(--primary)", height = 56, label }: { values: number[]; color?: string; height?: number; label: string }) {
  const W = 300, H = height, min = Math.min(...values), max = Math.max(...values);
  const x = (i: number) => (i / (values.length - 1)) * W;
  const y = (v: number) => 4 + (1 - (v - min) / (max - min || 1)) * (H - 8);
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label} preserveAspectRatio="none">
      <path d={`${d} L${W} ${H} L0 ${H} Z`} fill={color} opacity={0.08} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* --------------------------------------------------------- GridHeatmap */
export function GridHeatmap({ rows, cols, values, summary, format = (v) => String(v) }: { rows: string[]; cols: string[]; values: number[][]; summary: string; format?: (v: number) => string }) {
  const flat = values.flat();
  const min = Math.min(...flat), max = Math.max(...flat);
  return (
    <div role="img" aria-label={summary}>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `72px repeat(${cols.length}, minmax(0,1fr))` }}>
        <span />
        {cols.map((c) => <span key={c} className="micro text-center text-muted">{c}</span>)}
        {rows.map((r, ri) => (
          <div key={r} className="contents">
            <span className="micro self-center text-muted">{r}</span>
            {values[ri].map((v, ci) => {
              const t = (v - min) / (max - min || 1);
              return (
                <span key={ci} title={`${r} · ${cols[ci]}: ${format(v)}`} className="tnum grid h-10 place-items-center rounded-[10px] text-[11.5px] font-bold" style={{ background: `color-mix(in oklab, var(--primary) ${Math.round(12 + t * 88)}%, var(--surface))`, color: t > 0.45 ? "#fff" : "var(--ink)" }}>
                  {format(v)}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
