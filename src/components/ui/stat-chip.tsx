import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";
import { TagTone } from "./tag";

export interface StatChipProps extends HTMLAttributes<HTMLElement> {
  label: string;
  value: string | number;
  unit?: string;
  caption?: string;
  tone?: TagTone;
  icon?: ReactNode;
  index?: number;
}

const TONE_CLASSES: Record<TagTone, string> = {
  violet: "bg-[var(--tag-violet-bg)] text-[var(--tag-violet-fg)]",
  cyan: "bg-[var(--tag-cyan-bg)] text-[var(--tag-cyan-fg)]",
  pink: "bg-[var(--tag-pink-bg)] text-[var(--tag-pink-fg)]",
  amber: "bg-[var(--tag-amber-bg)] text-[var(--tag-amber-fg)]",
  green: "bg-[var(--tag-green-bg)] text-[var(--tag-green-fg)]",
  danger: "bg-[var(--tag-danger-bg)] text-[var(--tag-danger-fg)]",
};

export function StatChip({
  label,
  value,
  unit,
  caption,
  tone = "violet",
  icon,
  index = 0,
  className,
  style,
  ...props
}: StatChipProps) {
  return (
    <article
      className={cn(
        "rise lift flex items-center gap-3.5 rounded-card bg-surface p-4 shadow-soft border border-hairline",
        className
      )}
      style={{
        animationDelay: `${120 + index * 60}ms`,
        ...style,
      }}
      {...props}
    >
      {icon && (
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-tag",
            TONE_CLASSES[tone]
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="micro truncate text-ink-muted">{label}</p>
        <p className="tnum mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[20px] font-bold leading-none tracking-[-0.02em] text-ink">
            {value}
          </span>
          {unit && (
            <span className="truncate text-[11.5px] font-medium text-ink-muted">
              {unit}
            </span>
          )}
        </p>
        {caption && (
          <p className="mt-1 truncate text-[11.5px] text-ink-muted">{caption}</p>
        )}
      </div>
    </article>
  );
}
