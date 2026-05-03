"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ──────────────────────────────────────────────────────────── */

export type TrafficStatus = "fluido" | "moderado" | "congestionado";

export interface NearbyAlert {
  id: string;
  message: string;
  distanceM: number;
}

export interface MapHUDProps {
  /** Driver's current GPS speed in km/h */
  speedKmh?: number;
  /** Speed limit for the current segment */
  speedLimitKmh?: number;
  /** Current road segment name */
  roadName?: string;
  /** Current road traffic status */
  roadStatus?: TrafficStatus;
  /** Average speed on current segment (km/h) */
  segmentAvgSpeed?: number;
  /** ETA to destination in minutes */
  etaMinutes?: number;
  /** Whether there's an active nearby incident */
  hasActiveIncident?: boolean;
  /** The nearest alert to show in the bottom banner */
  nearbyAlert?: NearbyAlert | null;
  /** Whether the map is currently tracking the user's location */
  isFollowingLocation?: boolean;
  /** Called when the center-location button is pressed */
  onCenterLocation?: () => void;
  /** Called when the report button is pressed */
  onReport?: () => void;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const GLASS = {
  background: "rgba(20, 31, 43, 0.75)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
} as const;

const STATUS_COLOR: Record<TrafficStatus, string> = {
  fluido:       "var(--color-traffic-green)",
  moderado:     "var(--color-traffic-amber)",
  congestionado:"var(--color-traffic-red)",
};

const STATUS_LABEL: Record<TrafficStatus, string> = {
  fluido:       "Fluido",
  moderado:     "Moderado",
  congestionado:"Congestionado",
};

const LEGEND_AUTO_HIDE_MS = 10_000;
const NEARBY_ALERT_AUTO_DISMISS_MS = 8_000;

/* ─── MapHUD ─────────────────────────────────────────────────────────── */

export function MapHUD({
  speedKmh = 0,
  speedLimitKmh,
  roadName = "Carretera Litoral Km 18",
  roadStatus = "moderado",
  segmentAvgSpeed = 42,
  etaMinutes = 14,
  hasActiveIncident = false,
  nearbyAlert = null,
  isFollowingLocation = false,
  onCenterLocation,
  onReport,
}: MapHUDProps): ReactNode {
  const isSpeeding =
    speedLimitKmh !== undefined && speedKmh > speedLimitKmh;

  const [routePillExpanded, setRoutePillExpanded] = useState(false);
  const [legendVisible, setLegendVisible] = useState(true);
  const legendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Legend auto-hide */
  useEffect(() => {
    legendTimerRef.current = setTimeout(
      () => setLegendVisible(false),
      LEGEND_AUTO_HIDE_MS
    );
    return () => {
      if (legendTimerRef.current) clearTimeout(legendTimerRef.current);
    };
  }, []);

  /* Expose a way to re-show legend (called by parent on map drag) */
  const showLegendTemporarily = useCallback(() => {
    setLegendVisible(true);
    if (legendTimerRef.current) clearTimeout(legendTimerRef.current);
    legendTimerRef.current = setTimeout(
      () => setLegendVisible(false),
      LEGEND_AUTO_HIDE_MS
    );
  }, []);

  /* Dismiss nearby alert after 8 s */
  const [alertDismissed, setAlertDismissed] = useState(false);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!nearbyAlert) return;
    setAlertDismissed(false);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    alertTimerRef.current = setTimeout(
      () => setAlertDismissed(true),
      NEARBY_ALERT_AUTO_DISMISS_MS
    );
    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, [nearbyAlert?.id]);

  const showNearbyAlert = !!nearbyAlert && !alertDismissed;

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      aria-label="HUD de conducción"
    >
      {/* ── TOP ROW ────────────────────────────────────────────────── */}

      {/* TOP-LEFT: Speed */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <SpeedWidget
          speed={speedKmh}
          limit={speedLimitKmh}
          isSpeeding={isSpeeding}
        />
      </div>

      {/* TOP-CENTER: Route pill */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <RoutePill
          roadName={roadName}
          status={roadStatus}
          expanded={routePillExpanded}
          avgSpeed={segmentAvgSpeed}
          eta={etaMinutes}
          onToggle={() => setRoutePillExpanded((v) => !v)}
        />
      </div>

      {/* TOP-RIGHT: Report button */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <ReportButton
          hasActiveIncident={hasActiveIncident}
          onPress={onReport}
        />
      </div>

      {/* ── BOTTOM ROW ─────────────────────────────────────────────── */}

      {/* BOTTOM-LEFT: Legend */}
      <AnimatePresence>
        {legendVisible && (
          <motion.div
            key="legend"
            className="absolute bottom-6 left-4 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Legend />
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM-CENTER: Nearby alert */}
      <AnimatePresence>
        {showNearbyAlert && nearbyAlert && (
          <motion.div
            key={nearbyAlert.id}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto"
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <NearbyAlertBanner
              alert={nearbyAlert}
              onDismiss={() => setAlertDismissed(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM-RIGHT: Center location */}
      <div className="absolute bottom-6 right-4 pointer-events-auto">
        <CenterLocationButton
          isFollowing={isFollowingLocation}
          onPress={onCenterLocation}
        />
      </div>
    </div>
  );
}

/* ─── SpeedWidget ────────────────────────────────────────────────────── */

function SpeedWidget({
  speed,
  limit,
  isSpeeding,
}: {
  speed: number;
  limit?: number;
  isSpeeding: boolean;
}): ReactNode {
  return (
    <div
      className="flex flex-col items-center rounded-xl px-4 py-3 min-w-[72px]"
      style={GLASS}
    >
      <motion.span
        key={isSpeeding ? "speeding" : "normal"}
        animate={
          isSpeeding
            ? { x: [0, -3, 3, -3, 3, 0] }
            : { x: 0 }
        }
        transition={
          isSpeeding
            ? { duration: 0.4, repeat: Infinity, repeatDelay: 1.5 }
            : { duration: 0.2 }
        }
        className="font-mono leading-none tabular-nums"
        style={{
          fontSize: "48px",
          fontWeight: 400,
          color: isSpeeding
            ? "var(--color-traffic-red)"
            : "var(--color-text-primary)",
          letterSpacing: "-0.02em",
        }}
        aria-live="polite"
        aria-label={`Velocidad actual: ${speed} kilómetros por hora`}
      >
        {Math.round(speed)}
      </motion.span>

      <span
        className="font-mono"
        style={{
          fontSize: "11px",
          color: "var(--color-text-muted)",
          marginTop: "2px",
          letterSpacing: "0.03em",
        }}
      >
        km/h · GPS
      </span>

      {limit !== undefined && (
        <span
          className="font-mono mt-1 px-1.5 rounded"
          style={{
            fontSize: "10px",
            background: isSpeeding
              ? "rgba(226,75,74,0.15)"
              : "rgba(255,255,255,0.07)",
            color: isSpeeding
              ? "var(--color-traffic-red)"
              : "var(--color-text-muted)",
          }}
        >
          Límite {limit}
        </span>
      )}
    </div>
  );
}

/* ─── RoutePill ──────────────────────────────────────────────────────── */

function RoutePill({
  roadName,
  status,
  expanded,
  avgSpeed,
  eta,
  onToggle,
}: {
  roadName: string;
  status: TrafficStatus;
  expanded: boolean;
  avgSpeed: number;
  eta: number;
  onToggle: () => void;
}): ReactNode {
  const dotColor = STATUS_COLOR[status];

  return (
    <div
      className="flex flex-col items-center rounded-xl overflow-hidden cursor-pointer"
      style={GLASS}
      onClick={onToggle}
      role="button"
      aria-expanded={expanded}
      aria-label={`Estado de ruta: ${roadName}, tráfico ${STATUS_LABEL[status]}. ${expanded ? "Colapsar" : "Expandir"} detalles`}
    >
      {/* Pill row */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span
          className="shrink-0 rounded-full"
          aria-hidden="true"
          style={{
            width: 7,
            height: 7,
            background: dotColor,
            boxShadow: `0 0 6px ${dotColor}`,
          }}
        />
        <span
          className="font-sans whitespace-nowrap"
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--color-text-primary)",
            maxWidth: "240px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {roadName}
        </span>
        <span
          className="font-sans shrink-0"
          style={{
            fontSize: "12px",
            color: dotColor,
            fontWeight: 500,
          }}
        >
          — {STATUS_LABEL[status]}
        </span>
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className="shrink-0 transition-transform"
          style={{
            color: "var(--color-text-muted)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path d="M6 8 L1 3 L11 3 Z" />
        </svg>
      </div>

      {/* Expanded stats */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="route-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden w-full"
          >
            <div
              className="flex items-center gap-6 px-4 pb-3"
              style={{
                borderTop: "0.5px solid var(--color-border-subtle)",
                paddingTop: "10px",
              }}
            >
              <StatItem
                label="Vel. promedio"
                value={`${avgSpeed} km/h`}
              />
              <div
                aria-hidden="true"
                style={{
                  width: "0.5px",
                  height: "28px",
                  background: "var(--color-border-subtle)",
                }}
              />
              <StatItem label="ETA destino" value={`${eta} min`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatItem({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactNode {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="font-mono tabular-nums"
        style={{
          fontSize: "15px",
          fontWeight: 500,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </span>
      <span
        className="font-sans"
        style={{ fontSize: "10px", color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── ReportButton ───────────────────────────────────────────────────── */

function ReportButton({
  hasActiveIncident,
  onPress,
}: {
  hasActiveIncident: boolean;
  onPress?: () => void;
}): ReactNode {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      aria-label="Reportar incidente"
      className="flex items-center justify-center rounded-xl cursor-pointer"
      style={{
        width: 40,
        height: 40,
        ...GLASS,
      }}
      whileTap={{ scale: 0.92 }}
    >
      {/* Triangle with ! */}
      <motion.svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden="true"
        animate={
          hasActiveIncident
            ? { opacity: [1, 0.3, 1] }
            : { opacity: 1 }
        }
        transition={
          hasActiveIncident
            ? { duration: 1, repeat: Infinity }
            : {}
        }
      >
        <path
          d="M11 2 L20 19 L2 19 Z"
          fill={
            hasActiveIncident
              ? "rgba(226,75,74,0.18)"
              : "rgba(255,255,255,0.07)"
          }
          stroke={
            hasActiveIncident
              ? "var(--color-traffic-red)"
              : "var(--color-text-secondary)"
          }
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <rect
          x="10.1"
          y="8"
          width="1.8"
          height="5.5"
          rx="0.9"
          fill={
            hasActiveIncident
              ? "var(--color-traffic-red)"
              : "var(--color-text-secondary)"
          }
        />
        <circle
          cx="11"
          cy="16"
          r="1"
          fill={
            hasActiveIncident
              ? "var(--color-traffic-red)"
              : "var(--color-text-secondary)"
          }
        />
      </motion.svg>
    </motion.button>
  );
}

/* ─── Legend ─────────────────────────────────────────────────────────── */

function Legend(): ReactNode {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-xl"
      style={GLASS}
      role="note"
      aria-label="Leyenda de colores de tráfico"
    >
      {(
        [
          ["fluido",        "Fluido"],
          ["moderado",      "Moderado"],
          ["congestionado", "Congestionado"],
        ] as const
      ).map(([key, label]) => (
        <span key={key} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="rounded-full shrink-0"
            style={{
              width: 7,
              height: 7,
              background: STATUS_COLOR[key],
            }}
          />
          <span
            className="font-sans"
            style={{
              fontSize: "11px",
              color: "var(--color-text-secondary)",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        </span>
      ))}
    </div>
  );
}

/* ─── NearbyAlertBanner ──────────────────────────────────────────────── */

function NearbyAlertBanner({
  alert,
  onDismiss,
}: {
  alert: NearbyAlert;
  onDismiss: () => void;
}): ReactNode {
  return (
    <button
      type="button"
      onClick={onDismiss}
      aria-label={`Alerta: ${alert.message}. Toca para cerrar`}
      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-left"
      style={{
        ...GLASS,
        border: "0.5px solid rgba(239,159,39,0.25)",
        maxWidth: "320px",
      }}
    >
      {/* Warning icon */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M9 1.5 L16.5 15 L1.5 15 Z"
          fill="rgba(239,159,39,0.15)"
          stroke="var(--color-traffic-amber)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <rect x="8.2" y="6.5" width="1.6" height="4.5" rx="0.8" fill="var(--color-traffic-amber)" />
        <circle cx="9" cy="13" r="0.9" fill="var(--color-traffic-amber)" />
      </svg>

      <div className="flex flex-col gap-0.5">
        <span
          className="font-sans"
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--color-text-primary)",
          }}
        >
          {alert.message}
        </span>
        <span
          className="font-mono tabular-nums"
          style={{
            fontSize: "11px",
            color: "var(--color-text-muted)",
          }}
        >
          {alert.distanceM} m adelante · toca para cerrar
        </span>
      </div>
    </button>
  );
}

/* ─── CenterLocationButton ───────────────────────────────────────────── */

function CenterLocationButton({
  isFollowing,
  onPress,
}: {
  isFollowing: boolean;
  onPress?: () => void;
}): ReactNode {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      aria-label={
        isFollowing
          ? "Siguiendo tu ubicación"
          : "Centrar mapa en tu ubicación"
      }
      aria-pressed={isFollowing}
      className="flex items-center justify-center rounded-xl cursor-pointer"
      style={{
        width: 40,
        height: 40,
        ...GLASS,
      }}
      whileTap={{ scale: 0.92 }}
    >
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        animate={
          isFollowing
            ? { opacity: [1, 0.55, 1] }
            : { opacity: 1 }
        }
        transition={
          isFollowing
            ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
      >
        {/* Outer ring */}
        <circle
          cx="10"
          cy="10"
          r="8"
          stroke={
            isFollowing
              ? "var(--color-traffic-green)"
              : "var(--color-text-muted)"
          }
          strokeWidth="1.2"
        />
        {/* Cross lines */}
        <line
          x1="10" y1="2" x2="10" y2="5.5"
          stroke={
            isFollowing
              ? "var(--color-traffic-green)"
              : "var(--color-text-muted)"
          }
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="10" y1="14.5" x2="10" y2="18"
          stroke={
            isFollowing
              ? "var(--color-traffic-green)"
              : "var(--color-text-muted)"
          }
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="2" y1="10" x2="5.5" y2="10"
          stroke={
            isFollowing
              ? "var(--color-traffic-green)"
              : "var(--color-text-muted)"
          }
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="14.5" y1="10" x2="18" y2="10"
          stroke={
            isFollowing
              ? "var(--color-traffic-green)"
              : "var(--color-text-muted)"
          }
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Center dot */}
        <circle
          cx="10"
          cy="10"
          r="2.5"
          fill={
            isFollowing
              ? "var(--color-traffic-green)"
              : "var(--color-text-muted)"
          }
        />
      </motion.svg>
    </motion.button>
  );
}
