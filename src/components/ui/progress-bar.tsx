import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  color?: string; // CSS color string only
  label: string;
  showValue?: boolean;
  height?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color,
  label,
  showValue = false,
  height = "h-[6px]",
  className,
  ...props
}: ProgressBarProps) {
  const safeMax = max <= 0 ? 100 : max;
  const clampedValue = Math.max(0, Math.min(safeMax, value));
  const pct = (clampedValue / safeMax) * 100;

  return (
    <div className={cn("w-full min-w-0", className)} {...props}>
      {showValue && (
        <div className="mb-1.5 flex items-baseline justify-between text-[12px]">
          <span className="font-semibold text-ink-soft">{label}</span>
          <span className="tnum font-bold text-ink">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn("w-full overflow-hidden rounded-full bg-hairline", height)}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: color || "var(--primary)",
          }}
        />
      </div>
    </div>
  );
}
