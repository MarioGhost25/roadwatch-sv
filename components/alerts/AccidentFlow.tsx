"use client";

import { useState } from "react";
import { useAlertStore } from "@/store/alertStore";
import type { Alert } from "@/store/alertStore";
import type { AlertPayload, AlertResponse } from "@/app/api/alerts/route";

/* ─── Progress bar ───────────────────────────────────────────────────── */

interface ProgressBarProps {
  total: number;
  current: number;
}

function ProgressBar({ total, current }: ProgressBarProps) {
  const pct = Math.round((current / (total - 1)) * 100);
  return (
    <div className="relative h-0.5 w-full bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-[var(--color-traffic-green)] rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Paso ${current + 1} de ${total}`}
      />
    </div>
  );
}

/* ─── Leve flow (3 steps) ────────────────────────────────────────────── */

const LEVE_STEPS = [
  {
    label: "Toma fotos",
    description: "Documenta el estado del vehículo y la vía.",
    action: "Abrir cámara",
  },
  {
    label: "Oríllate",
    description: "Mueve el vehículo fuera del carril para no obstruir el tráfico.",
    action: "Confirmar",
  },
  {
    label: "Reportado",
    description: "El incidente ha sido registrado. Mantente en el lugar hasta recibir asistencia.",
    action: null,
  },
];

interface LeveFlowProps {
  alert: Alert;
}

function LeveFlow({ alert }: LeveFlowProps) {
  const nextStep = useAlertStore((s) => s.nextAccidentStep);
  const step = alert.accidentStep;
  const current = LEVE_STEPS[step] ?? LEVE_STEPS[LEVE_STEPS.length - 1];
  const isDone = step >= LEVE_STEPS.length - 1;

  const handleAction = () => {
    if (step === 0) {
      // Step 0: open camera — fallback to file input on desktop
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.click();
      nextStep(alert.stoppedVehicle.vehicleId);
    } else {
      nextStep(alert.stoppedVehicle.vehicleId);
    }
  };

  return (
    <div className="space-y-4">
      <ProgressBar total={LEVE_STEPS.length} current={step} />
      <div className="flex items-center gap-2">
        {LEVE_STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              className={[
                "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold shrink-0",
                i < step
                  ? "bg-[var(--color-traffic-green)] text-[var(--color-text-inverse)]"
                  : i === step
                  ? "bg-[var(--color-traffic-green-tint)] text-[var(--color-traffic-green)] border border-[var(--color-traffic-green)]"
                  : "bg-[var(--color-border-subtle)] text-[var(--color-text-muted)]",
              ].join(" ")}
            >
              {i < step ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            {i < LEVE_STEPS.length - 1 && (
              <div className={["h-px flex-1 w-4", i < step ? "bg-[var(--color-traffic-green)]" : "bg-[var(--color-border-subtle)]"].join(" ")} />
            )}
          </div>
        ))}
      </div>

      <div>
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{current.label}</p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)] leading-relaxed">{current.description}</p>
      </div>

      {!isDone && current.action && (
        <button
          onClick={handleAction}
          className="w-full rounded-md py-2.5 text-sm font-medium bg-[var(--color-traffic-green-tint)] text-[var(--color-traffic-green)] border border-[var(--color-traffic-green)] border-opacity-40 hover:bg-opacity-20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-traffic-green)]"
        >
          {current.action}
        </button>
      )}
    </div>
  );
}

/* ─── Grave flow (single CTA) ────────────────────────────────────────── */

interface GraveFlowProps {
  alert: Alert;
}

function GraveFlow({ alert }: GraveFlowProps) {
  const [loading, setLoading]     = useState(false);
  const [response, setResponse]   = useState<AlertResponse | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const handleAlert = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: AlertPayload = {
        type:      "grave",
        lat:       alert.stoppedVehicle.lat,
        lng:       alert.stoppedVehicle.lng,
        vehicleId: alert.stoppedVehicle.vehicleId,
        timestamp: new Date().toISOString(),
      };
      const res  = await fetch("/api/alerts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = (await res.json()) as AlertResponse;
      setResponse(data);
    } catch {
      setError("No se pudo enviar la alerta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (response?.success) {
    return (
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-traffic-green-tint)]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M4 10l4.5 4.5L16 6" stroke="var(--color-traffic-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Alerta enviada</p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Tiempo estimado de respuesta:{" "}
          <span className="font-semibold text-[var(--color-traffic-amber)]">{response.estimatedResponse}</span>
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">ID: <span className="font-mono">{response.alertId}</span></p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
        Se notificará a{" "}
        <span className="font-semibold text-[var(--color-text-primary)]">PNC y Cruz Roja</span>{" "}
        con tus coordenadas actuales.
      </p>
      {error && (
        <p className="text-xs text-[var(--color-traffic-red)] bg-[var(--color-traffic-red-tint)] rounded-md px-3 py-2">
          {error}
        </p>
      )}
      <button
        onClick={handleAlert}
        disabled={loading}
        className="w-full rounded-md py-3 text-sm font-semibold text-white bg-[var(--color-traffic-red)] hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-traffic-red)]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Enviando...
          </span>
        ) : (
          "Alertar PNC y Cruz Roja"
        )}
      </button>
    </div>
  );
}

/* ─── AccidentFlow container ─────────────────────────────────────────── */

export function AccidentFlow() {
  const alerts = useAlertStore((s) => s.alerts);
  const accidentAlerts = alerts.filter((a) => a.status === "accident");

  if (accidentAlerts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none"
    >
      {accidentAlerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-2xl"
          style={{
            borderColor: alert.severity === "grave"
              ? "rgba(226,75,74,0.35)"
              : "rgba(239,159,39,0.35)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-t-xl"
            style={{
              background: alert.severity === "grave"
                ? "var(--color-traffic-red-tint)"
                : "var(--color-traffic-amber-tint)",
            }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{
                color: alert.severity === "grave"
                  ? "var(--color-traffic-red)"
                  : "var(--color-traffic-amber)",
              }}
            >
              Accidente {alert.severity}
            </span>
            <span className="ml-auto font-mono text-[10px] text-[var(--color-text-muted)]">
              {alert.stoppedVehicle.vehicleId}
            </span>
          </div>

          {/* Flow body */}
          <div className="px-4 py-4">
            {alert.severity === "leve" ? (
              <LeveFlow alert={alert} />
            ) : (
              <GraveFlow alert={alert} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
