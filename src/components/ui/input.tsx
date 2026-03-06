"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, id, ...props }, ref) => {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {label && (
                    <label
                        htmlFor={id}
                        style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "var(--text-secondary)",
                        }}
                    >
                        {label}
                    </label>
                )}
                <div style={{ position: "relative" }}>
                    {icon && (
                        <div
                            style={{
                                position: "absolute",
                                left: "14px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--text-muted)",
                                pointerEvents: "none",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={id}
                        className={cn(className)}
                        style={{
                            width: "100%",
                            borderRadius: "12px",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                            paddingLeft: icon ? "44px" : "16px",
                            paddingRight: "16px",
                            fontSize: "14px",
                            outline: "none",
                            background: "var(--bg-input)",
                            color: "var(--text-primary)",
                            border: error
                                ? "2px solid var(--error)"
                                : "1px solid var(--border)",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => {
                            if (!error) e.currentTarget.style.borderColor = "var(--purple-primary)";
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            if (!error) e.currentTarget.style.borderColor = "var(--border)";
                            props.onBlur?.(e);
                        }}
                        {...props}
                    />
                </div>
                {error && (
                    <p style={{ fontSize: "12px", color: "var(--error)" }}>{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
export { Input };
export type { InputProps };
