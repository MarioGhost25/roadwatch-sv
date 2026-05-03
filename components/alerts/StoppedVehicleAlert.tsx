"use client";

import { useEffect, useRef } from "react";
import { useAlertStore, type AccidentSeverity } from "@/store/alertStore";

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatCoords(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "O";
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

/* ─── Single alert card ──────────────────────────────────────────────── */

interface AlertCardProps {
  alertId: string;
  isVisible: boolean;
}

function AlertCard({ alertId, isVisible }: AlertCardProps) {
  const alert         = useAlertStore((s) => s.alerts.find((a) => a.id === alertId));
  const markAsAccident = useAlertStore((s) => s.markAsAccident);
  const resolveAlert  = useAlertStore((s) => s.resolveAlert);
  const dismissAlert  = useAlertStore((s) => s.dismissAlert);

  if (!alert || alert.status !== "pending") return null;

  const { stoppedVehicle, distanceMetres } = alert;

  const handleAccident = (severity: AccidentSeverity) => {
    markAsAccident(stoppedVehicle.vehicleId, severity);
  };

  return (
    <div
      role="alertdialog"
      aria-labelledby={`alert-title-${alertId}`}
      aria-describedby={`alert-desc-${alertId}`}
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(110%)",
        transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease",
        opacity: isVisible ? 1 : 0,
      }}
      className="w-full max-w-sm rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3 border-b border-[var(--color-border-subtle)]">
        {/* Pulsing indicator */}
        <span className="relative mt-0.5 flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-traffic-amber)] opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--color-traffic-amber)]" />
        </span>
        <div className="flex-1 min-w-0">
          <p
            id={`alert-title-${alertId}`}
            className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight"
          >
            Vehículo detenido en{" "}
            <span className="font-mono text-xs text-[var(--color-text-secondary)]">
              {formatCoords(stoppedVehicle.lat, stoppedVehicle.lng)}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            hace {formatDuration(stoppedVehicle.duration)}
          </p>
        </div>
      </div>

      {/* Distance sub-text */}
      <p
        id={`alert-desc-${alertId}`}
        className="px-4 py-2.5 text-xs text-[var(--color-text-secondary)] leading-relaxed"
      >
        Estás a{" "}
        <span className="font-semibold text-[var(--color-text-primary)]">
          {distanceMetres}m
        </span>
        . ¿Puedes verificar qué pasa?
      </p>

      {/* Action buttons */}
      <div className="px-4 pb-4 grid grid-cols-1 gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAccident("leve")}
            className="rounded-md px-3 py-2 text-xs font-medium text-[var(--color-traffic-amber)] bg-[var(--color-traffic-amber-tint)] border border-[var(--color-traffic-amber)] border-opacity-30 hover:bg-opacity-20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-traffic-green)]"
          >
            Accidente leve
          </button>
          <button
            onClick={() => handleAccident("grave")}
            className="rounded-md px-3 py-2 text-xs font-medium text-[var(--color-traffic-red)] bg-[var(--color-traffic-red-tint)] border border-[var(--color-traffic-red)] border-opacity-30 hover:bg-opacity-20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-traffic-green)]"
          >
            Accidente grave
          </button>
        </div>
        <button
          onClick={() => resolveAlert(stoppedVehicle.vehicleId)}
          className="rounded-md px-3 py-2 text-xs font-medium text-[var(--color-traffic-green)] bg-[var(--color-traffic-green-tint)] border border-[var(--color-traffic-green)] border-opacity-30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-traffic-green)]"
        >
          Se está orillando
        </button>
        <button
          onClick={() => dismissAlert(stoppedVehicle.vehicleId)}
          className="rounded-md px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-traffic-green)]"
        >
          No veo nada
        </button>
      </div>
    </div>
  );
}

/* ─── Container: manages visibility queue ────────────────────────────── */

export function StoppedVehicleAlert() {
  const alerts = useAlertStore((s) => s.alerts);
  const pendingAlerts = alerts.filter((a) => a.status === "pending");

  const mountedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    pendingAlerts.forEach((a) => mountedIds.current.add(a.id));
  }, [pendingAlerts]);

  if (pendingAlerts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3 items-end pointer-events-none"
    >
      {pendingAlerts.map((a) => (
        <div key={a.id} className="pointer-events-auto">
          <AlertCard alertId={a.id} isVisible={mountedIds.current.has(a.id)} />
        </div>
      ))}
    </div>
  );
}
