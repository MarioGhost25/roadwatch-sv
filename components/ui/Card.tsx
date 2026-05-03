import { type HTMLAttributes, type ReactNode } from "react";

/* ─── Types ─────────────────────────────────────────────────────────── */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Surface elevation: "default" = surface, "elevated" = surface-alt */
  elevation?: "default" | "elevated";
  /** Remove all padding from the body area (useful for flush content like maps) */
  flush?: boolean;
  children?: ReactNode;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Pass true when the parent Card has flush=true to skip re-adding padding */
  flush?: boolean;
  children?: ReactNode;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

export function CardHeader({
  className = "",
  children,
  ...rest
}: CardHeaderProps): ReactNode {
  return (
    <div
      className={[
        "flex items-center justify-between",
        "px-4 py-3",
        "border-b border-thin border-border-subtle",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({
  flush = false,
  className = "",
  children,
  ...rest
}: CardBodyProps): ReactNode {
  return (
    <div
      className={[
        "flex-1",
        flush ? "" : "p-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...rest
}: CardFooterProps): ReactNode {
  return (
    <div
      className={[
        "flex items-center gap-2",
        "px-4 py-3",
        "border-t border-thin border-border-subtle",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ─── Root Card ──────────────────────────────────────────────────────── */

export function Card({
  elevation = "default",
  flush = false,
  className = "",
  children,
  ...rest
}: CardProps): ReactNode {
  const bgClass =
    elevation === "elevated" ? "bg-bg-surface-alt" : "bg-bg-surface";

  return (
    <div
      className={[
        "flex flex-col",
        "rounded-[8px]",
        "border-thin border-border-subtle",
        bgClass,
        /* Subtle shadow for depth */
        "shadow-[0_1px_3px_rgba(0,0,0,0.4)]",
        /* No padding on root when flush; let CardBody handle it */
        flush ? "overflow-hidden" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
