"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    glow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, hover = false, glow = false, style, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    glow && "glow-purple",
                    className
                )}
                style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "24px",
                    transition: "all 0.3s",
                    cursor: hover ? "pointer" : undefined,
                    ...style,
                }}
                onMouseEnter={hover ? (e) => {
                    e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.3)";
                    e.currentTarget.style.background = "var(--bg-card-hover)";
                } : undefined}
                onMouseLeave={hover ? (e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--bg-card)";
                } : undefined}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";
export { Card };
export type { CardProps };
