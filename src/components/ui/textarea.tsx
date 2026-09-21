import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import {
  TextareaHTMLAttributes,
  forwardRef,
  useId,
} from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id: idProp, rows = 3, ...props }, ref) => {
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
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          aria-invalid={!!error || undefined}
          aria-describedby={
            error ? `${id}-err` : hint ? `${id}-hint` : undefined
          }
          className={cn(
            "w-full rounded-[20px] border bg-surface px-4 py-3 text-[14px] text-ink placeholder:text-ink-muted transition-colors duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-danger" : "border-hairline focus:border-primary/50",
            className
          )}
          {...props}
        />
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

Textarea.displayName = "Textarea";
export { Textarea };
