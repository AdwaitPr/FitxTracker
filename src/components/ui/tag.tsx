import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

export type TagTone = "violet" | "cyan" | "pink" | "amber" | "green" | "danger";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
  icon?: ReactNode;
  children: ReactNode;
}

const TONE_CLASSES: Record<TagTone, string> = {
  violet: "bg-[var(--tag-violet-bg)] text-[var(--tag-violet-fg)]",
  cyan: "bg-[var(--tag-cyan-bg)] text-[var(--tag-cyan-fg)]",
  pink: "bg-[var(--tag-pink-bg)] text-[var(--tag-pink-fg)]",
  amber: "bg-[var(--tag-amber-bg)] text-[var(--tag-amber-fg)]",
  green: "bg-[var(--tag-green-bg)] text-[var(--tag-green-fg)]",
  danger: "bg-[var(--tag-danger-bg)] text-[var(--tag-danger-fg)]",
};

export function Tag({
  children,
  tone = "violet",
  icon,
  className,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-tag px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] shrink-0",
        TONE_CLASSES[tone],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0 inline-flex items-center text-current">{icon}</span>}
      {children}
    </span>
  );
}
