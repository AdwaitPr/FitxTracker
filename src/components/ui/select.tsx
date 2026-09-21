import { cn } from "@/lib/utils";
import { AlertCircle, ChevronDown } from "lucide-react";
import {
  ReactNode,
  SelectHTMLAttributes,
  forwardRef,
  useId,
} from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, children, id: idProp, ...props }, ref) => {
    const autoId = useId();
    const id = idProp || autoId;

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
          <select
            ref={ref}
            id={id}
            aria-invalid={!!error || undefined}
            aria-describedby={
              error ? `${id}-err` : hint ? `${id}-hint` : undefined
            }
            className={cn(
              // Explicitly reset legacy globals.css background-image and padding
              "!bg-none [background-image:none] appearance-none",
              "h-11 w-full min-w-0 rounded-full border bg-surface px-4 pr-10 text-[14px] text-ink transition-colors duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
              error
                ? "border-danger"
                : "border-hairline focus:border-primary/50",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-4 text-ink-muted shrink-0"
            aria-hidden="true"
          />
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
        ) : hint ? (
          <p id={`${id}-hint`} className="text-[12px] text-ink-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
export { Select };
