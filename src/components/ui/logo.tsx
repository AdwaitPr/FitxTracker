import { cn } from "@/lib/utils";
import Link from "next/link";

export interface LogoProps {
  compact?: boolean;
  light?: boolean;
  href?: string;
  className?: string;
}

export function Logo({
  compact = false,
  light = false,
  href = "/",
  className,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-3 select-none", className)}
      aria-label="FitxTracker home"
    >
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-full shadow-soft",
          light ? "bg-white text-primary" : "bg-primary text-white"
        )}
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2.8l2.1 6 6 2.1-6 2.1-2.1 6-2.1-6-6-2.1 6-2.1z" />
        </svg>
      </span>
      {!compact && (
        <span
          className={cn(
            "text-[17px] font-semibold tracking-[-0.02em]",
            light ? "text-white" : "text-ink"
          )}
        >
          Fitx
          <span
            className={cn(
              "font-medium",
              light ? "text-white/70" : "text-ink-muted"
            )}
          >
            Tracker
          </span>
        </span>
      )}
    </Link>
  );
}
