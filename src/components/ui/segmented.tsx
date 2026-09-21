"use client";

import { cn } from "@/lib/utils";
import { KeyboardEvent, useRef } from "react";

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

export function Segmented({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedProps) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (options.length === 0) return;
    const currentIndex = options.findIndex((opt) => opt.value === value);
    let nextIndex = -1;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        break;
      case "Home":
        e.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        e.preventDefault();
        nextIndex = options.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex >= 0 && nextIndex < options.length) {
      const nextOption = options[nextIndex];
      onChange(nextOption.value);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn("inline-flex items-center rounded-full bg-canvas p-1", className)}
    >
      {options.map((opt, idx) => {
        const isSelected = value === opt.value;
        const isFocusable = isSelected || (value === "" && idx === 0);

        return (
          <button
            key={opt.value}
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isFocusable ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-h-9 max-md:min-h-11 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary select-none",
              isSelected
                ? "bg-surface text-ink shadow-soft"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
