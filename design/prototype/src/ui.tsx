import { useEffect, useRef, useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import clsx from "clsx";
import { Icon } from "./icons";
import type { IconName } from "./icons";
export { Popover } from "./forms";

/* ---------------------------------------------------------------- Card */
export function Card({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag className={clsx("rounded-card bg-surface shadow-soft", className)}>{children}</Tag>
  );
}

/* ----------------------------------------------------------- IconButton */
export function IconButton({
  icon,
  label,
  variant = "outline",
  size = 40,
  onClick,
  className = "",
  badge,
}: {
  icon: IconName;
  label: string;
  variant?: "outline" | "solid" | "ghost" | "soft";
  size?: number;
  onClick?: () => void;
  className?: string;
  badge?: boolean;
}) {
  const styles: Record<string, string> = {
    outline:
      "border border-hairline bg-surface text-ink-soft hover:border-primary/40 hover:text-primary",
    solid: "bg-primary text-white hover:bg-primary-dark",
    ghost: "text-muted hover:bg-primary-soft hover:text-primary",
    soft: "bg-primary-soft text-primary hover:bg-primary-soft-2",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{ width: size, height: size }}
      className={clsx(
        "relative inline-grid shrink-0 place-items-center rounded-full transition-colors duration-200",
        styles[variant],
        className
      )}
    >
      <Icon name={icon} size={18} />
      {badge && (
        <span className="absolute right-[9px] top-[8px] h-[7px] w-[7px] rounded-full bg-danger ring-2 ring-surface" />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ Tag */
export type Tone = "violet" | "cyan" | "pink" | "amber" | "green" | "danger";

const TONE_STYLE: Record<Tone, CSSProperties> = {
  violet: { background: "var(--tag-violet-bg)", color: "var(--tag-violet-fg)" },
  cyan: { background: "var(--tag-cyan-bg)", color: "var(--tag-cyan-fg)" },
  pink: { background: "var(--tag-pink-bg)", color: "var(--tag-pink-fg)" },
  amber: { background: "var(--tag-amber-bg)", color: "var(--tag-amber-fg)" },
  green: { background: "var(--tag-green-bg)", color: "var(--tag-green-fg)" },
  danger: { background: "#FDE9E1", color: "#B03A16" },
};

export function Tag({
  children,
  tone = "violet",
  icon,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: IconName;
  className?: string;
}) {
  return (
    <span
      style={tone === "danger" ? undefined : TONE_STYLE[tone]}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-tag px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]",
        tone === "danger" &&
          "bg-[#FDE9E1] text-[#B03A16] dark:bg-[#F26B3A]/20 dark:text-[#FFA183]",
        className
      )}
    >
      {icon && <Icon name={icon} size={13} strokeWidth={1.8} />}
      {children}
    </span>
  );
}

/* --------------------------------------------------------------- Menu */
export function Menu({
  label = "More options",
  items,
  align = "right",
}: {
  label?: string;
  items: { label: string; icon: IconName; tone?: "default" | "danger" }[];
  align?: "right" | "left";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-primary-soft hover:text-primary"
      >
        <Icon name="more" size={18} />
      </button>
      {open && (
        <div
          role="menu"
          className={clsx(
            "absolute top-11 z-40 w-40 rounded-panel border border-hairline bg-surface p-1.5 shadow-lift",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              onClick={() => setOpen(false)}
              style={it.tone === "danger" ? { color: "var(--danger)" } : undefined}
              className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-medium text-ink-soft transition-colors duration-150 hover:bg-canvas"
            >
              <Icon name={it.icon} size={16} />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------- SectionHeading */
export function SectionHeading({
  title,
  children,
  id,
}: {
  title: string;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2
        id={id}
        className="text-[19px] font-semibold tracking-[-0.02em] text-ink"
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ------------------------------------------------------- RingProgress */
export function RingProgress({
  value,
  size = 148,
  stroke = 6,
  color = "var(--primary)",
  label,
  badge,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label: string;
  badge?: string;
  children?: ReactNode;
}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setOn(true), 140);
    return () => window.clearTimeout(t);
  }, []);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={on ? c * (1 - pct) : c}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
      {badge && (
        <span className="tnum absolute bottom-1 right-0 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
          {badge}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------- RecoveryGauge */
export function RecoveryGauge({
  score,
  color,
  caption,
}: {
  score: number;
  color: string;
  caption: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <RingProgress value={score / 100} size={104} stroke={7} color={color} label={`Recovery score ${score} of 100`}>
        <div className="text-center">
          <div className="tnum text-[26px] font-bold leading-none tracking-[-0.02em]" style={{ color }}>
            {score}
          </div>
          <div className="micro mt-1 text-muted">Score</div>
        </div>
      </RingProgress>
      <div className="min-w-0">
        <p className="micro text-muted">Recovery · today</p>
        <p className="mt-1.5 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">
          {caption}
        </p>
        <p className="mt-1 text-[12.5px] leading-snug text-muted">
          Sleep 40% · quality 30% · stress 20% · gut 10%
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- BarChart */
export function BarChart({
  data,
  ticks,
  unit,
  summary,
}: {
  data: { label: string; value: number }[];
  ticks: number[];
  unit: string;
  summary: string;
}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(false);
    const t = window.setTimeout(() => setOn(true), 60);
    return () => window.clearTimeout(t);
  }, [data]);

  const W = 268;
  const H = 150;
  const padL = 26;
  const padB = 22;
  const padT = 12;
  const plotW = W - padL - 6;
  const plotH = H - padB - padT;
  const max = ticks[ticks.length - 1];
  const slot = plotW / data.length;
  const barW = Math.min(20, slot * 0.44);

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[150px] w-full" role="img" aria-label={summary}>
        {ticks.map((t) => {
          const y = padT + plotH - (t / max) * plotH;
          return (
            <g key={t}>
              <line
                x1={padL}
                x2={W - 6}
                y1={y}
                y2={y}
                stroke="var(--hairline)"
                strokeWidth={1}
                strokeDasharray="3 4"
              />
              <text
                x={padL - 8}
                y={y + 3.5}
                textAnchor="end"
                fontSize="9"
                fontWeight="600"
                letterSpacing="0.06em"
                fill="var(--muted)"
              >
                {t}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = Math.max(3, (d.value / max) * plotH);
          const x = padL + slot * i + (slot - barW) / 2;
          const y = padT + plotH - h;
          return (
            <g key={d.label}>
              <g
                className="grow-bar"
                style={{ transform: on ? "scaleY(1)" : "scaleY(0)" }}
              >
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx={barW / 2}
                  fill={i % 2 === 0 ? "var(--primary-soft-2)" : "var(--primary)"}
                />
              </g>
              <text
                x={x + barW / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="var(--ink-soft)"
              >
                {d.value}
              </text>
              <text
                x={x + barW / 2}
                y={H - 6}
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="600"
                letterSpacing="0.04em"
                fill="var(--muted)"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">
        {summary} Values are training volume in {unit}.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------- SegmentedControl */
export function Segmented({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-full bg-canvas p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-200",
            value === o.value
              ? "bg-surface text-ink shadow-soft"
              : "text-muted hover:text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
