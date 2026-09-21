import { useEffect, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";
import { Icon } from "./icons";
import type { IconName } from "./icons";

/* --------------------------------------------------------------- Button */
type Variant = "black" | "primary" | "soft" | "outline" | "ghost" | "danger" | "dangerSoft";
export function Button({
  variant = "black",
  size = "md",
  icon,
  arrow = false,
  children,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg"; icon?: IconName; arrow?: boolean }) {
  const v: Record<Variant, string> = {
    black: "bg-ink text-canvas hover:opacity-90",
    primary: "bg-primary text-white hover:bg-primary-dark",
    soft: "bg-primary-soft text-primary hover:bg-primary-soft-2 hover:text-primary-dark",
    outline: "border border-hairline bg-surface text-ink-soft hover:border-primary hover:text-primary",
    ghost: "text-ink-soft hover:bg-canvas hover:text-ink",
    danger: "bg-danger text-white hover:opacity-90",
    dangerSoft: "border border-danger/40 text-danger hover:bg-danger/10",
  };
  const s = { sm: "h-9 px-4 text-[12.5px]", md: "h-11 px-5 text-[13.5px]", lg: "h-12 px-6 text-[14.5px]" }[size];
  return (
    <button
      type="button"
      className={clsx(
        "group inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold transition-[transform,background-color,color,opacity] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        v[variant],
        s,
        arrow && "pr-1.5",
        className
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={17} strokeWidth={1.7} />}
      {children}
      {arrow && (
        <span className={clsx("ml-1 grid h-8 w-8 place-items-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5", variant === "black" ? "bg-canvas text-ink" : "bg-white text-primary")}>
          <Icon name="arrowRight" size={15} strokeWidth={1.9} />
        </span>
      )}
    </button>
  );
}

/* ---------------------------------------------------------------- Field */
function FieldWrap({ id, label, hint, error, children, className }: { id: string; label?: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("min-w-0", className)}>
      {label && <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink-soft">{label}</label>}
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "var(--danger)" }}>
          <Icon name="alert" size={13} strokeWidth={1.8} />{error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[12px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputCls = (error?: string) =>
  clsx(
    "h-11 w-full min-w-0 rounded-full border bg-surface px-4 text-[14px] text-ink placeholder:text-muted transition-colors duration-200 focus:outline-none focus-visible:outline-2",
    error ? "border-danger" : "border-hairline focus:border-primary/50"
  );

export function Input({ label, hint, error, icon, suffix, className, id: idProp, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string; error?: string; icon?: IconName; suffix?: string }) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldWrap id={id} label={label} hint={hint} error={error} className={className}>
      <div className="relative flex items-center">
        {icon && <Icon name={icon} size={17} className="pointer-events-none absolute left-4 text-muted" />}
        <input id={id} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined} className={clsx(inputCls(error), icon && "pl-11", suffix && "pr-14")} {...rest} />
        {suffix && <span className="pointer-events-none absolute right-4 text-[12.5px] font-semibold text-muted">{suffix}</span>}
      </div>
    </FieldWrap>
  );
}

export function Select({ label, hint, error, className, id: idProp, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; hint?: string; error?: string }) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldWrap id={id} label={label} hint={hint} error={error} className={className}>
      <div className="relative">
        <select id={id} className={clsx(inputCls(error), "appearance-none pr-10")} {...rest}>{children}</select>
        <Icon name="chevronDown" size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
      </div>
    </FieldWrap>
  );
}

export function Textarea({ label, hint, error, className, id: idProp, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string; error?: string }) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldWrap id={id} label={label} hint={hint} error={error} className={className}>
      <textarea id={id} rows={3} className={clsx("w-full rounded-[20px] border bg-surface px-4 py-3 text-[14px] text-ink placeholder:text-muted focus:outline-none", error ? "border-danger" : "border-hairline focus:border-primary/50")} {...rest} />
    </FieldWrap>
  );
}

/* ----------------------------------------------------------------- Chip */
export function Chip({ selected, children, onClick, tone, className, icon }: { selected?: boolean; children: ReactNode; onClick?: () => void; tone?: string; className?: string; icon?: IconName }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={selected && tone ? { background: `var(--tag-${tone}-bg)`, color: `var(--tag-${tone}-fg)`, borderColor: "transparent", boxShadow: `inset 0 0 0 1.5px var(--tag-${tone}-fg)` } : undefined}
      className={clsx(
        "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold transition-colors duration-200",
        selected && !tone ? "border-transparent bg-ink text-canvas" : "border-hairline bg-surface text-ink-soft hover:border-primary/50 hover:text-primary",
        className
      )}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
}

/* --------------------------------------------------------------- Slider */
export function Slider({ label, value, min, max, step = 1, onChange, format, id: idProp }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string; id?: string }) {
  const auto = useId();
  const id = idProp ?? auto;
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-soft">{label}</label>
        <span className="tnum text-[13px] font-bold text-ink">{format ? format(value) : value}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="fx-range" style={{ ["--pct" as string]: `${pct}%` }} aria-valuetext={format ? format(value) : String(value)} />
    </div>
  );
}

/* -------------------------------------------------------------- Stepper */
export function Stepper({ value, onChange, min, max, step = 1, label, format }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; label: string; format?: (v: number) => string }) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v * 100) / 100)));
  return (
    <div className="inline-flex h-11 items-center rounded-full border border-hairline bg-surface" role="group" aria-label={label}>
      <button type="button" aria-label={`Decrease ${label}`} onClick={() => set(value - step)} className="grid h-11 w-11 place-items-center rounded-full text-ink-soft hover:text-primary"><Icon name="minus" size={16} /></button>
      <span className="tnum min-w-[3.5rem] text-center text-[14px] font-bold text-ink" aria-live="polite">{format ? format(value) : value}</span>
      <button type="button" aria-label={`Increase ${label}`} onClick={() => set(value + step)} className="grid h-11 w-11 place-items-center rounded-full text-ink-soft hover:text-primary"><Icon name="plus" size={16} /></button>
    </div>
  );
}

/* --------------------------------------------------------------- Toggle */
export function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span>
        <span className="block text-[14px] font-semibold text-ink">{label}</span>
        {desc && <span className="block text-[12.5px] text-muted">{desc}</span>}
      </span>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={clsx("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200", checked ? "bg-primary" : "bg-hairline")}>
        <span className={clsx("absolute top-1 h-5 w-5 rounded-full bg-white shadow-soft transition-transform duration-200", checked ? "translate-x-6" : "translate-x-1")} />
      </button>
    </label>
  );
}

/* ----------------------------------------------------------- Disclosure */
export function Disclosure({ title, meta, children, defaultOpen = false, className }: { title: ReactNode; meta?: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={className}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)} className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-[14px] px-1 py-2 text-left hover:bg-canvas">
        <span className="min-w-0 flex-1">{title}</span>
        {meta}
        <Icon name="chevronDown" size={18} className={clsx("shrink-0 text-muted transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && <div id={id} className="pt-2">{children}</div>}
    </div>
  );
}

/* -------------------------------------------------------------- Popover */
export function Popover({ trigger, children, align = "right" }: { trigger: (p: { onClick: () => void; "aria-expanded": boolean; "aria-haspopup": "dialog" }) => ReactNode; children: ReactNode; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <div ref={ref} className="relative inline-block">
      {trigger({ onClick: () => setOpen((v) => !v), "aria-expanded": open, "aria-haspopup": "dialog" })}
      {open && (
        <div role="dialog" className={clsx("absolute top-[calc(100%+8px)] z-40 rounded-panel border border-hairline bg-surface p-2 shadow-lift", align === "right" ? "right-0" : "left-0")}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Modal */
export function Modal({ open, onClose, title, children, footer, danger = false, size = "md" }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; danger?: boolean; size?: "md" | "lg" }) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>("input,button,select,textarea,[tabindex]")?.focus(), 30);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; window.clearTimeout(t); prev?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0F0F14]/45 p-0 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={id} className={clsx("rise w-full rounded-t-hero bg-surface p-6 shadow-lift sm:rounded-hero", size === "lg" ? "sm:max-w-2xl" : "sm:max-w-md")}>
        <div className="flex items-start justify-between gap-4">
          <h2 id={id} className="text-[19px] font-semibold tracking-[-0.02em]" style={danger ? { color: "var(--danger)" } : undefined}>{title}</h2>
          <button type="button" aria-label="Close dialog" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink"><Icon name="close" size={18} /></button>
        </div>
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Skeleton */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={clsx("animate-pulse rounded-[12px] bg-hairline", className)} />;
}

/* ---------------------------------------------------------------- Toast */
export function Toast({ message, tone = "ok", onDone }: { message: string; tone?: "ok" | "danger"; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 3200);
    return () => window.clearTimeout(t);
  }, [onDone]);
  return (
    <div role="status" className="rise fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-canvas shadow-lift md:bottom-8">
      <span className="grid h-6 w-6 place-items-center rounded-full" style={{ background: tone === "ok" ? "var(--tag-green-fg)" : "var(--danger)", color: "#fff" }}><Icon name={tone === "ok" ? "check" : "alert"} size={13} strokeWidth={2} /></span>
      {message}
    </div>
  );
}

/* ------------------------------------------------------------ EmptyState */
export function EmptyState({ icon, title, body, action }: { icon: IconName; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-hairline px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-primary-soft text-primary"><Icon name={icon} size={26} /></span>
      <p className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-ink">{title}</p>
      <p className="mt-1.5 max-w-[26rem] text-[13.5px] text-muted">{body}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
