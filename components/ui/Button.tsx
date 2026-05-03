"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

/* ─── Types ─────────────────────────────────────────────────────────── */

export type ButtonVariant = "primary" | "danger" | "ghost" | "outline";
export type ButtonSize    = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button */
  loading?: boolean;
  /** Icon placed before the label */
  iconLeft?: ReactNode;
  /** Icon placed after the label */
  iconRight?: ReactNode;
  children?: ReactNode;
}

/* ─── Style Maps ─────────────────────────────────────────────────────── */

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-traffic-green text-text-inverse",
    "border-thin border-traffic-green",
    "hover:bg-[#18896a] hover:border-[#18896a]",
    "active:bg-[#137558]",
  ].join(" "),

  danger: [
    "bg-traffic-red text-white",
    "border-thin border-traffic-red",
    "hover:bg-[#cc3f3e] hover:border-[#cc3f3e]",
    "active:bg-[#b03434]",
  ].join(" "),

  ghost: [
    "bg-transparent text-text-secondary",
    "border-thin border-transparent",
    "hover:bg-border-subtle hover:text-text-primary",
    "active:bg-border-default",
  ].join(" "),

  outline: [
    "bg-transparent text-text-primary",
    "border-thin border-border-default",
    "hover:border-border-strong hover:bg-border-subtle",
    "active:bg-border-default",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7  px-3   text-xs  gap-1.5",
  md: "h-9  px-4   text-sm  gap-2",
  lg: "h-11 px-5   text-base gap-2.5",
};

/* ─── Spinner ────────────────────────────────────────────────────────── */

function Spinner(): ReactNode {
  return (
    <svg
      aria-hidden="true"
      className="w-4 h-4 animate-spin"
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M14 8a6 6 0 0 1-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────────────────────── */

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      iconLeft,
      iconRight,
      disabled,
      className = "",
      children,
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={[
          /* Base */
          "inline-flex items-center justify-center",
          "font-sans font-medium",
          "rounded-[6px]",
          "transition-colors duration-150",
          "cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-traffic-green focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
          /* Disabled */
          "disabled:pointer-events-none disabled:opacity-40",
          /* Variant + size */
          variantStyles[variant],
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {/* Loading state overrides left icon */}
        {loading ? <Spinner /> : iconLeft && <span aria-hidden="true">{iconLeft}</span>}

        {children && <span>{children}</span>}

        {iconRight && !loading && (
          <span aria-hidden="true">{iconRight}</span>
        )}
      </button>
    );
  },
);

export default Button;
