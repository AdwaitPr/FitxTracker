import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import {
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useId,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  helperText?: string;
  error?: string;
  icon?: ReactNode;
  suffix?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      hint,
      helperText,
      error,
      icon,
      suffix,
      id: idProp,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const id = idProp || autoId;
    const activeHint = hint || helperText;

    return (
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-[13px] font-semibold text-ink-soft"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="pointer-events-none absolute left-4 flex items-center text-ink-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            aria-invalid={!!error || undefined}
            aria-describedby={
              error
                ? `${id}-err`
                : activeHint
                ? `${id}-hint`
                : undefined
            }
            className={cn(
              "h-11 w-full min-w-0 rounded-full border bg-surface px-4 text-[14px] text-ink placeholder:text-ink-muted transition-colors duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-danger" : "border-hairline focus:border-primary/50",
              icon && "pl-11",
              suffix && "pr-14",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="pointer-events-none absolute right-4 text-[12.5px] font-semibold text-ink-muted">
              {suffix}
            </span>
          )}
        </div>
        {error ? (
          <p
            id={`${id}-err`}
            role="alert"
            className="flex items-center gap-1.5 text-[12px] font-medium text-danger"
          >
            <AlertCircle size={13} strokeWidth={2} className="shrink-0" />
            {error}
          </p>
        ) : activeHint ? (
          <p id={`${id}-hint`} className="text-[12px] text-ink-muted">
            {activeHint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
export type { InputProps };

