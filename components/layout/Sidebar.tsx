"use client";

import { useState, type ReactNode } from "react";
import { Badge, type TrafficVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

/* ─── Stat Card ──────────────────────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  accent?: "green" | "amber" | "red" | "neutral";
}

function StatCard({ label, value, unit, accent = "neutral" }: StatCardProps): ReactNode {
  const accentColor: Record<string, string> = {
    green:   "text-traffic-green",
    amber:   "text-traffic-amber",
    red:     "text-traffic-red",
    neutral: "text-text-primary",
  };

  return (
    <div className="flex flex-col gap-1 p-3 rounded-[8px] bg-bg-base border-thin border-border-subtle">
      <span className="text-text-muted font-sans" style={{ fontSize: "10px", lineHeight: "1.3", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className={["font-mono font-medium text-xl leading-none tabular-nums", accentColor[accent]].join(" ")}>
          {value}
        </span>
        {unit && (
          <span className="text-text-muted font-mono" style={{ fontSize: "10px" }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Event Item ─────────────────────────────────────────────────────── */

interface TrafficEvent {
  id: string;
  location: string;
  description: string;
  time: string;
  variant: TrafficVariant;
}

const MOCK_EVENTS: TrafficEvent[] = [
  {
    id: "ev-001",
    location: "Bulevar de los Héroes",
    description: "Colisión múltiple, carril derecho bloqueado",
    time: "hace 4 min",
    variant: "grave",
  },
  {
    id: "ev-002",
    location: "CA-1 Oriente km 14",
    description: "Tráfico lento por obra vial",
    time: "hace 11 min",
    variant: "moderado",
  },
  {
    id: "ev-003",
    location: "Autopista del Sur",
    description: "Vehículo averiado en hombro derecho",
    time: "hace 18 min",
    variant: "accidente",
  },
  {
    id: "ev-004",
    location: "Calle Arce",
    description: "Flujo normalizado tras semáforo reprogramado",
    time: "hace 23 min",
    variant: "fluido",
  },
  {
    id: "ev-005",
    location: "Bulevar Universitario",
    description: "Congestión por evento universitario",
    time: "hace 31 min",
    variant: "moderado",
  },
  {
    id: "ev-006",
    location: "Troncal del Norte km 8",
    description: "Accidente entre bus y pick-up",
    time: "hace 45 min",
    variant: "grave",
  },
];

function EventItem({ event }: { event: TrafficEvent }): ReactNode {
  return (
    <li className="flex flex-col gap-1.5 py-3 border-b border-thin border-border-subtle last:border-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-primary font-sans truncate">
          {event.location}
        </span>
        <Badge variant={event.variant} />
      </div>
      <p className="text-text-secondary font-sans leading-snug" style={{ fontSize: "11px" }}>
        {event.description}
      </p>
      <span className="font-mono text-text-muted" style={{ fontSize: "10px" }}>
        {event.time}
      </span>
    </li>
  );
}

/* ─── Report Icons ───────────────────────────────────────────────────── */

function IconWarning(): ReactNode {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1L1 14h14L8 1Zm0 3.5 4.5 7.75H3.5L8 4.5Zm-.75 2.5v2.5h1.5V7h-1.5Zm0 3v1.5h1.5V10h-1.5Z" />
    </svg>
  );
}

function IconAlert(): ReactNode {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.75h1.5v4.5h-1.5v-4.5Zm.75 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
    </svg>
  );
}

/* ─── Bottom Sheet Toggle (mobile) ──────────────────────────────────── */

interface ToggleProps {
  open: boolean;
  onToggle: () => void;
}

function BottomSheetHandle({ open, onToggle }: ToggleProps): ReactNode {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={open ? "Cerrar panel" : "Abrir panel de eventos"}
      className="md:hidden w-full flex flex-col items-center py-2 gap-1 cursor-pointer"
    >
      <div aria-hidden="true" className="w-8 h-0.5 rounded-full bg-border-strong" />
      <span className="text-text-muted font-sans" style={{ fontSize: "10px" }}>
        {open ? "Cerrar" : "Eventos activos"}
      </span>
    </button>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────────────── */

export function Sidebar(): ReactNode {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside
        aria-label="Panel de tráfico"
        className={[
          "hidden md:flex flex-col",
          "w-[240px] shrink-0",
          "bg-bg-surface border-l border-thin border-border-subtle",
          "overflow-hidden",
        ].join(" ")}
        style={{ gridArea: "sidebar" }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile: bottom sheet ─────────────────────────────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{ gridArea: "sidebar" }}
      >
        {/* Backdrop */}
        {mobileOpen && (
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-bg-overlay"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div
          className={[
            "relative bg-bg-surface border-t border-thin border-border-default rounded-t-[12px]",
            "transition-[max-height] duration-300 ease-in-out overflow-hidden",
            mobileOpen ? "max-h-[75dvh]" : "max-h-[52px]",
          ].join(" ")}
        >
          <BottomSheetHandle open={mobileOpen} onToggle={() => setMobileOpen((o) => !o)} />
          {mobileOpen && (
            <div className="px-4 pb-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(75dvh-52px)]">
              <StatsGrid />
              <EventList />
              <ReportButtons />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Sub-sections (reused in desktop + mobile) ──────────────────────── */

function StatsGrid(): ReactNode {
  return (
    <section aria-labelledby="stats-heading">
      <h2
        id="stats-heading"
        className="sr-only"
      >
        Métricas de tráfico
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Vehículos activos" value="1 558"  accent="neutral" />
        <StatCard label="Velocidad prom."   value="54"     unit="km/h"  accent="green" />
        <StatCard label="Detenidos"         value="23"     accent="amber" />
        <StatCard label="Incidentes"        value="7"      accent="red" />
      </div>
    </section>
  );
}

function EventList(): ReactNode {
  return (
    <section aria-labelledby="events-heading" className="flex flex-col gap-2 flex-1 min-h-0">
      <h2
        id="events-heading"
        className="font-sans text-text-muted uppercase tracking-widest"
        style={{ fontSize: "10px" }}
      >
        Eventos activos
      </h2>
      <ul
        aria-label="Lista de eventos activos de tráfico"
        className="overflow-y-auto flex-1 pr-0.5"
      >
        {MOCK_EVENTS.map((ev) => (
          <EventItem key={ev.id} event={ev} />
        ))}
      </ul>
    </section>
  );
}

function ReportButtons(): ReactNode {
  return (
    <div className="flex flex-col gap-2 pt-3 border-t border-thin border-border-subtle">
      <Button
        variant="outline"
        size="sm"
        iconLeft={<IconWarning />}
        className="w-full justify-start"
      >
        Reportar accidente leve
      </Button>
      <Button
        variant="danger"
        size="sm"
        iconLeft={<IconAlert />}
        className="w-full justify-start"
      >
        Reportar accidente grave
      </Button>
    </div>
  );
}

function SidebarContent(): ReactNode {
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable area */}
      <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1 min-h-0">
        <StatsGrid />
        <EventList />
      </div>

      {/* Fixed footer */}
      <div className="p-4 shrink-0">
        <ReportButtons />
      </div>
    </div>
  );
}

export default Sidebar;
