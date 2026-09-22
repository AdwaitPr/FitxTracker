"use client";

import { cn } from "@/lib/utils";

export interface CompleteButtonProps {
  done: boolean;
  onToggle: () => void;
  label: string;
  pop?: boolean;
}

export function CompleteButton({
  done,
  onToggle,
  label,
  pop = false,
}: CompleteButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={done}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "relative grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200 cursor-pointer",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        done
          ? "border-transparent text-white"
          : "border-hairline text-transparent hover:border-primary hover:text-ink-muted/40",
        pop && "check-pop check-ripple"
      )}
      style={done ? { background: "var(--tag-green-fg)" } : undefined}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          className={pop ? "check-draw" : undefined}
        />
      </svg>
    </button>
  );
}
