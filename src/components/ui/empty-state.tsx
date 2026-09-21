import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-card border border-dashed border-hairline px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-primary-soft text-primary">
        {icon}
      </span>
      <p className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </p>
      <p className="mt-1.5 max-w-[26rem] text-[13.5px] text-ink-muted">
        {body}
      </p>
      {action && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
