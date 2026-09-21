import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  id?: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function SectionHeader({
  title,
  id,
  eyebrow,
  description,
  actions,
  children,
  className,
  ...props
}: SectionHeaderProps) {
  const content = actions || children;

  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-end justify-between gap-4",
        className
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="micro mb-1 text-ink-muted">{eyebrow}</p>
        )}
        <h2
          id={id}
          className="text-[19px] font-semibold tracking-[-0.02em] text-ink"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[13px] text-ink-muted">{description}</p>
        )}
      </div>
      {content && (
        <div className="flex shrink-0 items-center gap-2">{content}</div>
      )}
    </div>
  );
}

// Prototype naming alias
export { SectionHeader as SectionHeading };
