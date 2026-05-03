"use client";

import { useState, useCallback, type ReactNode } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Button } from "@/components/ui/Button";

/* ─── Types ──────────────────────────────────────────────────────────── */

type RoadStatus = "light" | "medium" | "heavy";

interface Road {
  id: string;
  name: string;
  speed: number;
  vehicles: number;
  status: RoadStatus;
  /** Speed samples for the last 2 hours (24 × 5 min intervals) */
  sparkline: number[];
}

interface LaneData {
  roadId: string;
  lanes: { label: string; speed: number }[];
}

interface HeatCell {
  day: number;   // 0 = Mon … 6 = Sun
  hour: number;  // 0–23
  count: number;
}

/* ─── Mock data ──────────────────────────────────────────────────────── */

function buildSparkline(base: number): number[] {
  const pts: number[] = [];
  let v = base;
  for (let i = 0; i < 24; i++) {
    v = Math.max(5, Math.min(120, v + (Math.random() - 0.48) * 12));
    pts.push(Math.round(v));
  }
  return pts;
}

const MOCK_ROADS: Road[] = [
  { id: "ca1",     name: "CA-1 Oriente",       speed: 67, vehicles: 52, status: "light",  sparkline: buildSparkline(67) },
  { id: "ca2",     name: "CA-2 Litoral",        speed: 23, vehicles: 47, status: "heavy",  sparkline: buildSparkline(23) },
  { id: "norte",   name: "Autopista Norte",     speed: 58, vehicles: 31, status: "medium", sparkline: buildSparkline(58) },
  { id: "troncal", name: "Troncal del Norte",   speed: 72, vehicles: 18, status: "light",  sparkline: buildSparkline(72) },
  { id: "heroes",  name: "Bulevar Los Héroes",  speed: 31, vehicles: 64, status: "heavy",  sparkline: buildSparkline(31) },
];

const MOCK_LANES: LaneData[] = [
  { roadId: "ca2",   lanes: [{ label: "Carril interior", speed: 19 }, { label: "Carril exterior", speed: 28 }] },
  { roadId: "norte", lanes: [{ label: "Carril interior", speed: 62 }, { label: "Carril exterior", speed: 51 }] },
];

// 7 days × 24 hours heatmap
const MOCK_HEAT: HeatCell[] = Array.from({ length: 7 * 24 }, (_, i) => {
  const day  = i % 7;
  const hour = Math.floor(i / 7);
  // Rush hours 7–9 and 16–19 have higher incident counts
  const rush = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
  const weekend = day >= 5;
  const base = rush && !weekend ? Math.random() * 6 : Math.random() * 2;
  return { day, hour, count: Math.round(base) };
});

/* ─── Road status config ──────────────────────────────────────────────── */

const STATUS_CFG: Record<RoadStatus, { label: string; color: string; bg: string }> = {
  light:  { label: "Fluido",      color: "var(--color-traffic-green)", bg: "var(--color-traffic-green-tint)" },
  medium: { label: "Moderado",    color: "var(--color-traffic-amber)", bg: "var(--color-traffic-amber-tint)" },
  heavy:  { label: "Congestionado", color: "var(--color-traffic-red)", bg: "var(--color-traffic-red-tint)"   },
};

/* ─── CSV export ─────────────────────────────────────────────────────── */

function exportCSV(roads: Road[]): void {
  const header = "id,name,speed_kmh,vehicles,status";
  const rows   = roads.map((r) => `${r.id},${r.name},${r.speed},${r.vehicles},${r.status}`);
  const blob   = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href     = url;
  a.download = `vialidad-sv-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Sparkline ──────────────────────────────────────────────────────── */

interface SparklineProps {
  data: number[];
  color: string;
}

function Sparkline({ data, color }: SparklineProps): ReactNode {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width={80} height={32}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#grad-${color.replace(/[^a-z0-9]/gi, "")})`}
          dot={false}
          isAnimationActive={false}
        />
        <RechartsTooltip
          content={({ active, payload }) =>
            active && payload?.length ? (
              <div
                className="px-2 py-1 rounded-[4px] bg-bg-surface border-thin border-border-default"
                style={{ fontSize: "10px", fontFamily: "var(--font-mono)" }}
              >
                {payload[0].value} km/h
              </div>
            ) : null
          }
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─── Road row ───────────────────────────────────────────────────────── */

function RoadRow({ road, laneData }: { road: Road; laneData: LaneData | undefined }): ReactNode {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CFG[road.status];

  return (
    <li className="border-b border-thin border-border-subtle last:border-0">
      <button
        type="button"
        onClick={() => setExpanded((o) => !o)}
        className="w-full flex items-center gap-3 py-3 text-left hover:bg-bg-surface-alt transition-colors px-4 cursor-pointer"
        aria-expanded={expanded}
      >
        {/* Status dot */}
        <span
          aria-hidden="true"
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: cfg.color }}
        />

        {/* Road name */}
        <span className="flex-1 text-xs font-sans font-medium text-text-primary truncate">
          {road.name}
        </span>

        {/* Speed */}
        <span
          className="font-mono tabular-nums shrink-0"
          style={{ fontSize: "11px", color: cfg.color }}
        >
          {road.speed} <span className="text-text-muted">km/h</span>
        </span>

        {/* Vehicles */}
        <span className="font-mono text-text-secondary tabular-nums shrink-0" style={{ fontSize: "11px" }}>
          {road.vehicles}v
        </span>

        {/* Sparkline */}
        <div className="shrink-0" aria-hidden="true">
          <Sparkline data={road.sparkline} color={cfg.color} />
        </div>

        {/* Status badge */}
        <span
          className="shrink-0 px-2 py-0.5 rounded-full font-sans"
          style={{ fontSize: "10px", color: cfg.color, backgroundColor: cfg.bg }}
        >
          {cfg.label}
        </span>

        {/* Chevron */}
        {laneData && (
          <svg
            aria-hidden="true"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
            className={`text-text-muted shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M2 4l4 4 4-4H2Z" />
          </svg>
        )}
      </button>

      {/* Lane breakdown */}
      {expanded && laneData && (
        <div className="px-4 pb-3 flex flex-col gap-2" role="region" aria-label={`Carriles de ${road.name}`}>
          <p className="font-sans text-text-muted uppercase tracking-widest mb-1" style={{ fontSize: "9px" }}>
            Velocidad por carril
          </p>
          {laneData.lanes.map((lane) => {
            const pct = Math.min(100, Math.round((lane.speed / 120) * 100));
            const laneColor = lane.speed < 40
              ? "var(--color-traffic-red)"
              : lane.speed < 70
              ? "var(--color-traffic-amber)"
              : "var(--color-traffic-green)";
            return (
              <div key={lane.label} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-text-secondary" style={{ fontSize: "10px" }}>
                    {lane.label}
                  </span>
                  <span
                    className="font-mono tabular-nums"
                    style={{ fontSize: "10px", color: laneColor }}
                  >
                    {lane.speed} km/h
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-base overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: laneColor }}
                    role="meter"
                    aria-valuenow={lane.speed}
                    aria-valuemin={0}
                    aria-valuemax={120}
                    aria-label={`${lane.label}: ${lane.speed} km/h`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </li>
  );
}

/* ─── Heatmap ────────────────────────────────────────────────────────── */

const DAY_LABELS  = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  i % 6 === 0 ? `${String(i).padStart(2, "0")}h` : ""
);

function HeatCell({ cell, maxCount }: { cell: HeatCell; maxCount: number }): ReactNode {
  const intensity = maxCount > 0 ? cell.count / maxCount : 0;

  // Interpolate: 0 → subtle bg, 1 → traffic-red
  const alpha    = 0.08 + intensity * 0.85;
  const bg       = cell.count === 0
    ? "var(--color-border-subtle)"
    : `rgba(226, 75, 74, ${alpha.toFixed(2)})`;

  return (
    <div
      title={`${DAY_LABELS[cell.day]} ${String(cell.hour).padStart(2, "0")}:00 — ${cell.count} incidente${cell.count !== 1 ? "s" : ""}`}
      className="rounded-[2px] cursor-default transition-opacity hover:opacity-80"
      style={{
        width: "10px",
        height: "10px",
        backgroundColor: bg,
      }}
      role="gridcell"
      aria-label={`${DAY_LABELS[cell.day]} ${cell.hour}:00 — ${cell.count} incidentes`}
    />
  );
}

function IncidentHeatmap(): ReactNode {
  const maxCount = Math.max(...MOCK_HEAT.map((c) => c.count), 1);

  // Build a 24×7 grid: rows = hours, cols = days
  const hours = Array.from({ length: 24 }, (_, hour) =>
    Array.from({ length: 7 }, (_, day) =>
      MOCK_HEAT.find((c) => c.hour === hour && c.day === day) ?? { day, hour, count: 0 }
    )
  );

  return (
    <div className="flex flex-col gap-2" role="grid" aria-label="Heatmap de incidentes por hora y día">
      {/* Day labels */}
      <div className="flex items-center gap-1 pl-6">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="font-mono text-text-muted text-center"
            style={{ width: "10px", fontSize: "8px", lineHeight: "1" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Rows: one per hour */}
      <div className="flex flex-col gap-0.5" role="rowgroup">
        {hours.map((row, hour) => (
          <div key={hour} className="flex items-center gap-1" role="row">
            {/* Hour label */}
            <span
              className="font-mono text-text-muted shrink-0 text-right"
              style={{ width: "20px", fontSize: "8px" }}
              aria-hidden="true"
            >
              {HOUR_LABELS[hour]}
            </span>
            {/* Cells */}
            {row.map((cell) => (
              <HeatCell key={`${cell.day}-${cell.hour}`} cell={cell} maxCount={maxCount} />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 pl-6 pt-1">
        <span className="font-mono text-text-muted" style={{ fontSize: "9px" }}>Menos</span>
        {[0, 0.2, 0.4, 0.65, 0.9].map((alpha) => (
          <div
            key={alpha}
            className="rounded-[2px]"
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: alpha === 0 ? "var(--color-border-subtle)" : `rgba(226,75,74,${alpha})`,
            }}
            aria-hidden="true"
          />
        ))}
        <span className="font-mono text-text-muted" style={{ fontSize: "9px" }}>Más</span>
      </div>
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: ReactNode }): ReactNode {
  return (
    <h3
      className="font-sans text-text-muted uppercase tracking-widest px-4"
      style={{ fontSize: "10px", letterSpacing: "0.06em" }}
    >
      {children}
    </h3>
  );
}

/* ─── Close button ───────────────────────────────────────────────────── */

function CloseButton({ onClick }: { onClick: () => void }): ReactNode {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Cerrar panel de análisis"
      className="w-7 h-7 rounded-[6px] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface-alt transition-colors cursor-pointer shrink-0"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
        <path d="M2.47 2.47a.75.75 0 0 1 1.06 0L7 5.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L8.06 7l3.47 3.47a.75.75 0 1 1-1.06 1.06L7 8.06 3.53 11.53a.75.75 0 0 1-1.06-1.06L5.94 7 2.47 3.53a.75.75 0 0 1 0-1.06Z" />
      </svg>
    </button>
  );
}

/* ─── Panel ──────────────────────────────────────────────────────────── */

interface TrafficPanelProps {
  open: boolean;
  onClose: () => void;
}

export function TrafficPanel({ open, onClose }: TrafficPanelProps): ReactNode {
  const handleExport = useCallback(() => exportCSV(MOCK_ROADS), []);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-bg-overlay"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Panel de análisis de tráfico"
        className={[
          "fixed top-[52px] right-0 bottom-0 z-50",
          "w-full max-w-[420px]",
          "bg-bg-surface border-l border-thin border-border-default",
          "flex flex-col overflow-hidden",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-12 shrink-0 border-b border-thin border-border-subtle">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--color-traffic-green)" aria-hidden="true">
              <path d="M1 11h3v4H1v-4Zm5-5h3v9H6V6Zm5-5h3v14h-3V1Z" />
            </svg>
            <span className="text-sm font-medium text-text-primary font-sans">
              Análisis de tráfico
            </span>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-6 py-4">

          {/* ── 1. Carreteras ───────────────────────────────────────── */}
          <section aria-labelledby="roads-heading">
            <div className="flex items-center justify-between px-4 mb-2">
              <SectionLabel>
                <span id="roads-heading">Carreteras monitoreadas</span>
              </SectionLabel>
              <div className="flex items-center gap-3 pr-0">
                <span className="font-mono text-text-muted" style={{ fontSize: "9px" }}>km/h</span>
                <span className="font-mono text-text-muted" style={{ fontSize: "9px" }}>veh.</span>
                <span className="font-mono text-text-muted" style={{ fontSize: "9px", width: "80px", textAlign: "center" }}>2 h</span>
              </div>
            </div>
            <ul aria-label="Lista de carreteras">
              {MOCK_ROADS.map((road) => (
                <RoadRow
                  key={road.id}
                  road={road}
                  laneData={MOCK_LANES.find((l) => l.roadId === road.id)}
                />
              ))}
            </ul>
          </section>

          {/* ── 2. Heatmap ──────────────────────────────────────────── */}
          <section aria-labelledby="heatmap-heading" className="px-4 flex flex-col gap-3">
            <SectionLabel>
              <span id="heatmap-heading">Incidentes del día — últimos 7 días</span>
            </SectionLabel>
            <IncidentHeatmap />
          </section>

        </div>

        {/* Footer: export */}
        <div className="px-4 py-3 shrink-0 border-t border-thin border-border-subtle">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2"
            onClick={handleExport}
            iconLeft={
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1a.75.75 0 0 1 .75.75v7.19l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L3.72 7.53a.75.75 0 1 1 1.06-1.06l2.47 2.47V1.75A.75.75 0 0 1 8 1ZM2.5 13.25a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5a.75.75 0 0 1-.75-.75Z" />
              </svg>
            }
          >
            Exportar CSV
          </Button>
        </div>
      </aside>
    </>
  );
}

export default TrafficPanel;
