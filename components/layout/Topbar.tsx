"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

/* ─── Logo ───────────────────────────────────────────────────────────── */

function Logo(): ReactNode {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      {/* Triangle icon in teal */}
      <svg
        aria-hidden="true"
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer triangle */}
        <path
          d="M14 3L25.258 22.5H2.742L14 3Z"
          fill="var(--color-traffic-green)"
          fillOpacity="0.15"
          stroke="var(--color-traffic-green)"
          strokeWidth="1"
        />
        {/* Inner exclamation dot */}
        <rect
          x="13"
          y="10"
          width="2"
          height="6"
          rx="1"
          fill="var(--color-traffic-green)"
        />
        <circle cx="14" cy="18.5" r="1" fill="var(--color-traffic-green)" />
      </svg>

      <div className="flex flex-col leading-none">
        <span className="text-sm font-medium text-text-primary font-sans tracking-tight">
          Vialidad SV
        </span>
        <span
          className="font-sans text-text-muted"
          style={{ fontSize: "11px", lineHeight: "1.3" }}
        >
          tráfico en tiempo real
        </span>
      </div>
    </div>
  );
}

/* ─── Status Pills ───────────────────────────────────────────────────── */

interface StatusPillProps {
  label: string;
  value: string | number;
  variant: "fluido" | "moderado" | "grave" | "accidente";
  pulse?: boolean;
}

function StatusPill({ label, value, variant, pulse = false }: StatusPillProps): ReactNode {
  const colorMap = {
    fluido:    { text: "text-traffic-green", bg: "bg-traffic-green-tint", border: "border-traffic-green/20", dot: "bg-traffic-green" },
    moderado:  { text: "text-traffic-amber", bg: "bg-traffic-amber-tint", border: "border-traffic-amber/20", dot: "bg-traffic-amber" },
    grave:     { text: "text-traffic-red",   bg: "bg-traffic-red-tint",   border: "border-traffic-red/20",   dot: "bg-traffic-red"   },
    accidente: { text: "text-traffic-red",   bg: "bg-traffic-red-tint",   border: "border-traffic-red/30",   dot: "bg-traffic-red"   },
  };
  const c = colorMap[variant];

  return (
    <div
      className={[
        "flex items-center gap-2",
        "px-3 h-7",
        "rounded-full",
        "border-thin",
        c.bg,
        c.border,
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "w-1.5 h-1.5 rounded-full shrink-0",
          c.dot,
          pulse ? "animate-pulse" : "",
        ].join(" ")}
      />
      <span className="text-text-muted font-sans" style={{ fontSize: "11px" }}>
        {label}
      </span>
      <span className={["font-mono font-medium", c.text].join(" ")} style={{ fontSize: "11px" }}>
        {value}
      </span>
    </div>
  );
}

/* ─── User Avatar ────────────────────────────────────────────────────── */

function UserAvatar(): ReactNode {
  return (
    <button
      type="button"
      aria-label="Perfil de usuario"
      className="w-8 h-8 rounded-full bg-bg-surface-alt border-thin border-border-default flex items-center justify-center text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors cursor-pointer"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 14.5a.5.5 0 0 1-.5-.5C3 11.567 5.134 10 8 10s5 1.567 5 4a.5.5 0 0 1-.5.5h-9Z" />
      </svg>
    </button>
  );
}

/* ─── Notification Bell ──────────────────────────────────────────────── */

interface NotificationBellProps {
  count?: number;
}

function NotificationBell({ count = 0 }: NotificationBellProps): ReactNode {
  return (
    <button
      type="button"
      aria-label={`Notificaciones${count > 0 ? `, ${count} sin leer` : ""}`}
      className="relative w-8 h-8 rounded-[6px] border-thin border-border-default bg-bg-surface flex items-center justify-center text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors cursor-pointer"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1a1 1 0 0 1 1 1v.27A5.001 5.001 0 0 1 13 7.5v2.293l1.146 1.146A.5.5 0 0 1 13.793 12H2.207a.5.5 0 0 1-.353-.854L3 10v-2.5A5.001 5.001 0 0 1 7 2.27V2a1 1 0 0 1 1-1ZM6.5 13h3a1.5 1.5 0 0 1-3 0Z" />
      </svg>

      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-traffic-red text-white font-mono font-medium flex items-center justify-center"
          style={{ fontSize: "9px", lineHeight: "1" }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

/* ─── Topbar ─────────────────────────────────────────────────────────── */

export function Topbar(): ReactNode {
  return (
    <header
      className="h-[52px] shrink-0 flex items-center px-4 gap-4 border-b border-thin border-border-subtle bg-bg-surface"
      style={{ gridArea: "topbar" }}
    >
      {/* Left: Logo */}
      <Logo />

      {/* Divider */}
      <div aria-hidden="true" className="w-px h-6 bg-border-subtle shrink-0" />

      {/* Center: Status pills */}
      <nav
        aria-label="Estado del tráfico en tiempo real"
        className="hidden md:flex items-center gap-2 flex-1"
      >
        <StatusPill label="Vehículos fluidos" value="1 240" variant="fluido" />
        <StatusPill label="Moderados"          value="318"   variant="moderado" />
        <StatusPill label="Incidentes activos" value="7"     variant="accidente" pulse />
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <NotificationBell count={3} />
        <UserAvatar />
      </div>
    </header>
  );
}

export default Topbar;
