import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

export interface RingProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100 ONLY
  size?: number;
  stroke?: number;
  color?: string;
  label: string;
  badge?: string;
  children?: ReactNode;
}

export function RingProgress({
  value,
  size = 148,
  stroke = 6,
  color = "var(--primary)",
  label,
  badge,
  children,
  className,
  style,
  ...props
}: RingProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const pct = clamped / 100;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("relative shrink-0 select-none", className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden="true"
      >
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
          className="animate-ring-fill"
          style={{
            ["--ring-circ" as string]: `${c}`,
            ["--ring-offset" as string]: `${offset}`,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 grid place-items-center">
          {children}
        </div>
      )}
      {badge && (
        <span className="tnum absolute bottom-1 right-0 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
          {badge}
        </span>
      )}
    </div>
  );
}
