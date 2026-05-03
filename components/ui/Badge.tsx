import type { ReactNode } from "react";

/* ─── Types ─────────────────────────────────────────────────────────── */

export type TrafficVariant = "fluido" | "moderado" | "grave" | "accidente";

export interface BadgeProps {
  /** Traffic state variant — drives color and default label */
  variant: TrafficVariant;
  /** Override the displayed text; falls back to the variant name */
  label?: string;
  /** Show a pulsing dot indicator (useful for live states) */
  pulse?: boolean;
  /** Additional class names */
  className?: string;
}

/* ─── Variant Map ────────────────────────────────────────────────────── */

const variantConfig: Record<
  TrafficVariant,
  {
    label: string;
    dot: string;
    text: string;
    bg: string;
    border: string;
  }
> = {
  fluido: {
    label: "Fluido",
    dot: "bg-traffic-green",
    text: "text-traffic-green",
    bg: "bg-traffic-green-tint",
    border: "border-traffic-green/20",
  },
  moderado: {
    label: "Moderado",
    dot: "bg-traffic-amber",
    text: "text-traffic-amber",
    bg: "bg-traffic-amber-tint",
    border: "border-traffic-amber/20",
  },
  grave: {
    label: "Grave",
    dot: "bg-traffic-red",
    text: "text-traffic-red",
    bg: "bg-traffic-red-tint",
    border: "border-traffic-red/20",
  },
  accidente: {
    label: "Accidente",
    dot: "bg-traffic-red",
    text: "text-traffic-red",
    bg: "bg-traffic-red-tint",
    border: "border-traffic-red/30",
  },
};

/* ─── Component ──────────────────────────────────────────────────────── */

export function Badge({
  variant,
  label,
  pulse = false,
  className = "",
}: BadgeProps): ReactNode {
  const cfg = variantConfig[variant];
  const displayLabel = label ?? cfg.label;

  return (
    <span
      role="status"
      aria-label={`Estado de tráfico: ${displayLabel}`}
      className={[
        "inline-flex items-center gap-1.5",
        "px-2 py-0.5",
        "rounded-[4px]",
        "border-thin",
        "text-xs font-medium leading-5 tracking-wide",
        "font-sans",
        cfg.bg,
        cfg.text,
        cfg.border,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Status dot */}
      <span
        aria-hidden="true"
        className={[
          "inline-block w-1.5 h-1.5 rounded-full flex-shrink-0",
          cfg.dot,
          pulse ? "animate-pulse" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {displayLabel}
    </span>
  );
}

export default Badge;
