import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

type ButtonVariant =
  | "black"
  | "primary"
  | "secondary"
  | "soft"
  | "outline"
  | "ghost"
  | "danger"
  | "dangerSoft";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  arrow?: boolean;
  icon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      arrow = false,
      icon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "group inline-flex shrink-0 items-center justify-center font-semibold transition-[transform,background-color,color,opacity] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer";

    const variants: Record<ButtonVariant, string> = {
      black: "bg-ink text-canvas hover:opacity-90",
      primary: "bg-primary text-white hover:bg-primary-dark",
      secondary:
        "border border-hairline bg-surface text-ink-soft hover:border-primary hover:text-primary",
      soft: "bg-primary-soft text-primary hover:bg-primary-soft-2 hover:text-primary-dark",
      outline:
        "border border-hairline bg-surface text-ink-soft hover:border-primary hover:text-primary",
      ghost: "text-ink-soft hover:bg-canvas hover:text-ink",
      danger: "bg-danger text-white hover:opacity-90",
      dangerSoft: "border border-danger/40 text-danger hover:bg-danger/10",
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "h-9 max-md:h-11 px-4 text-[12.5px] max-md:text-[13.5px] gap-1.5",
      md: "h-11 px-5 text-[13.5px] gap-2",
      lg: "h-12 px-6 text-[14.5px] gap-2.5",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          arrow && "pr-1.5",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="h-4 w-4 animate-spin shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : icon ? (
          <span className="shrink-0 inline-flex items-center">{icon}</span>
        ) : null}
        {children}
        {arrow && (
          <span
            className={cn(
              "ml-1 grid h-8 w-8 place-items-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5 shrink-0",
              variant === "black" ? "bg-canvas text-ink" : "bg-white text-primary"
            )}
            aria-hidden="true"
          >
            <ArrowRight size={15} strokeWidth={2} />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };

