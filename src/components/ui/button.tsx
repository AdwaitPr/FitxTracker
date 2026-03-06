"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            fullWidth = false,
            isLoading = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-ring cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary:
                "gradient-purple text-white hover:opacity-90 hover:shadow-lg hover:shadow-purple-primary/25 active:scale-[0.98]",
            secondary:
                "bg-transparent border border-border text-text-secondary hover:border-purple-primary hover:text-purple-light active:scale-[0.98]",
            ghost:
                "bg-transparent text-text-muted hover:text-text-primary hover:bg-card-hover active:scale-[0.98]",
            danger:
                "bg-error/10 text-error border border-error/20 hover:bg-error/20 active:scale-[0.98]",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
            md: "px-5 py-2.5 text-sm rounded-xl gap-2",
            lg: "px-7 py-3.5 text-base rounded-xl gap-2.5",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    fullWidth && "w-full",
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
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
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps };
