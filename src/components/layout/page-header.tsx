import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  sub?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  sub,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "rise mb-6 flex flex-wrap items-end justify-between gap-4",
        className
      )}
    >
      <div>
        {eyebrow && <p className="micro text-ink-muted">{eyebrow}</p>}
        <h1 className="mt-1.5 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[30px]">
          {title}
        </h1>
        {sub && <p className="mt-1.5 max-w-[46rem] text-[14px] text-ink-muted">{sub}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
