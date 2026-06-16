"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-surface hover:bg-accent-press disabled:opacity-50 disabled:hover:bg-accent",
  secondary:
    "bg-surface text-ink-2 border border-border hover:border-ink-3 disabled:opacity-50",
  ghost: "bg-transparent text-ink-3 hover:text-ink-2 disabled:opacity-50",
};

/** Primary action button. ≥44px tall touch target, ≤150ms transition (§2). */
export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] px-5 py-2.5",
        "t-label cursor-pointer transition-colors duration-150 disabled:cursor-not-allowed",
        VARIANTS[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
