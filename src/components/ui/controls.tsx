"use client";

import * as React from "react";
import { Minus, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TagTone } from "./tag";

/* --------------------------------------------------------------- Slider */

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  id?: string;
  className?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  id: idProp,
  className,
}: SliderProps) {
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const pct = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
  const formattedValue = format ? format(value) : String(value);

  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-soft">
          {label}
        </label>
        <span className="tnum text-[13px] font-bold text-ink">{formattedValue}</span>
      </div>
      <div className="flex min-h-[44px] items-center">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="fx-range w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          style={{ ["--pct" as string]: `${pct}%` }}
          aria-label={label}
          aria-valuetext={formattedValue}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Stepper */

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  format?: (value: number) => string;
  className?: string;
}

export function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  format,
  className,
}: StepperProps) {
  const stepDecimals = (step.toString().split(".")[1] || "").length;
  const precisionFactor = Math.pow(10, Math.max(stepDecimals, 2));

  const clampAndRound = (v: number) => {
    const clamped = Math.min(max, Math.max(min, v));
    return Math.round(clamped * precisionFactor) / precisionFactor;
  };

  const formattedValue = format ? format(value) : String(value);

  return (
    <div
      className={cn(
        "inline-flex h-11 items-center rounded-full border border-hairline bg-surface",
        className
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        onClick={() => onChange(clampAndRound(value - step))}
        disabled={value <= min}
        className="grid h-11 w-11 place-items-center rounded-full text-ink-soft transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <span
        className="tnum min-w-[3.5rem] select-none text-center text-[14px] font-bold text-ink"
        aria-live="polite"
      >
        {formattedValue}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={() => onChange(clampAndRound(value + step))}
        disabled={value >= max}
        className="grid h-11 w-11 place-items-center rounded-full text-ink-soft transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------- Chip */

export interface ChipProps {
  selected?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  tone?: TagTone;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Chip({
  selected = false,
  children,
  onClick,
  tone,
  icon,
  className,
  disabled = false,
}: ChipProps) {
  const customToneStyle =
    selected && tone
      ? {
          background: `var(--tag-${tone}-bg)`,
          color: `var(--tag-${tone}-fg)`,
          borderColor: "transparent",
          boxShadow: `inset 0 0 0 1.5px var(--tag-${tone}-fg)`,
        }
      : undefined;

  return (
    <button
      type="button"
      role="button"
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
      style={customToneStyle}
      className={cn(
        "inline-flex min-h-10 max-md:min-h-11 items-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50",
        selected && !tone && "border-transparent bg-ink text-canvas",
        !selected &&
          "border-hairline bg-surface text-ink-soft hover:border-primary/50 hover:text-primary",
        className
      )}
    >
      {icon && <span className="shrink-0 leading-none">{icon}</span>}
      {children}
    </button>
  );
}

/* ----------------------------------------------------------- Disclosure */

export interface DisclosureProps {
  title: React.ReactNode;
  meta?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  id?: string;
}

export function Disclosure({
  title,
  meta,
  children,
  defaultOpen = false,
  className,
  id: idProp,
}: DisclosureProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const autoId = React.useId();
  const panelId = idProp ?? autoId;
  const buttonId = `${panelId}-button`;

  return (
    <div className={className}>
      <button
        id={buttonId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-[14px] px-1 py-2 text-left transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="min-w-0 flex-1 font-medium text-ink">{title}</span>
        {meta && <span className="text-[13px] text-ink-muted">{meta}</span>}
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={cn(
            "shrink-0 text-ink-muted transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className={cn("pt-2", !open && "hidden")}
      >
        {children}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Toggle */

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  desc?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  desc,
  id: idProp,
  disabled = false,
  className,
}: ToggleProps) {
  const autoId = React.useId();
  const id = idProp ?? autoId;

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 py-3.5 transition-opacity",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold text-ink">{label}</span>
        {desc && <span className="block text-[12.5px] text-ink-muted">{desc}</span>}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          checked ? "bg-primary" : "bg-hairline"
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow-soft transition-transform duration-200",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </label>
  );
}
