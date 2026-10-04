import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article";
  hover?: boolean;
  glow?: boolean;
}

const Card = forwardRef<HTMLElement, CardProps>(
  (
    {
      className,
      hover = false,
      glow = false,
      as: Component = "section",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref as unknown as React.Ref<HTMLDivElement>}
        className={cn(
          "rounded-card bg-surface shadow-soft border border-hairline p-6 transition-colors duration-200",
          hover && "cursor-pointer hover:border-primary/40",
          glow && "shadow-lift",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = "Card";
export { Card };
export type { CardProps };

