import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

export type IconButtonVariant = "outline" | "solid" | "ghost" | "soft";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: IconButtonVariant;
  size?: number;
  badge?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      variant = "outline",
      size = 40,
      className,
      badge = false,
      type = "button",
      style,
      disabled,
      ...props
    },
    ref
  ) => {
    const styles: Record<IconButtonVariant, string> = {
      outline:
        "border border-hairline bg-surface text-ink-soft hover:border-primary/40 hover:text-primary",
      solid: "bg-primary text-white hover:bg-primary-dark",
      ghost: "text-ink-muted hover:bg-primary-soft hover:text-primary",
      soft: "bg-primary-soft text-primary hover:bg-primary-soft-2",
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        disabled={disabled}
        style={{ width: size, height: size, ...style }}
        className={cn(
          "relative inline-grid shrink-0 place-items-center rounded-full transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-md:min-h-11 max-md:min-w-11",
          styles[variant],
          className
        )}
        {...props}
      >
        <span className="shrink-0 inline-flex items-center justify-center pointer-events-none">
          {icon}
        </span>
        {badge && (
          <span
            className="absolute right-[9px] top-[8px] h-[7px] w-[7px] rounded-full bg-danger ring-2 ring-surface"
            aria-hidden="true"
          />
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
export { IconButton };
