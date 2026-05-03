"use client";

import { useEffect, useRef } from "react";
import type { Vehicle, StoppedVehicle } from "@/components/map/types";
import { useAlertStore } from "@/store/alertStore";

/* ─── Haversine ──────────────────────────────────────────────────────── */

const EARTH_RADIUS_M = 6_371_000;

function haversineMetres(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

/* ─── Constants ──────────────────────────────────────────────────────── */

/** km/h threshold below which a vehicle is considered stopped */
const STOP_SPEED_KMH = 2;
/** seconds a vehicle must be stopped before emitting an alert */
const STOP_THRESHOLD_S = 30;
/** polling interval in ms */
const POLL_INTERVAL_MS = 5_000;

/* ─── Hook ───────────────────────────────────────────────────────────── */

interface UseVehicleMonitorResult {
  stoppedVehicles: StoppedVehicle[];
  nearestDriver: Vehicle | null;
  clearAlert: (vehicleId: string) => void;
}

export function useVehicleMonitor(vehicles: Vehicle[]): UseVehicleMonitorResult {
  const pushAlert    = useAlertStore((s) => s.pushAlert);
  const dismissAlert = useAlertStore((s) => s.dismissAlert);
  const alerts       = useAlertStore((s) => s.alerts);

  /**
   * stopTimestamps: vehicleId → unix ms when the stop was first observed.
   * Stored in a ref so it persists across renders without triggering them.
   */
  const stopTimestamps = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const tick = () => {
      const now = Date.now();

      vehicles.forEach((v) => {
        const isStopped = v.speed < STOP_SPEED_KMH;

        if (!isStopped) {
          // Vehicle is moving again — remove from tracking
          stopTimestamps.current.delete(v.id);
          return;
        }

        // Record first-stop timestamp
        if (!stopTimestamps.current.has(v.id)) {
          stopTimestamps.current.set(v.id, now);
        }

        const firstSeen  = stopTimestamps.current.get(v.id)!;
        const durationS  = (now - firstSeen) / 1_000;

        if (durationS < STOP_THRESHOLD_S) return;

        // Has an alert already been created for this vehicle?
        const alreadyAlerted = alerts.some(
          (a) => a.stoppedVehicle.vehicleId === v.id && a.status === "pending"
        );
        if (alreadyAlerted) return;

        // Find nearest OTHER vehicle
        let nearest: Vehicle | null = null;
        let minDist = Infinity;
        vehicles.forEach((other) => {
          if (other.id === v.id) return;
          const d = haversineMetres(v.lat, v.lng, other.lat, other.lng);
          if (d < minDist) { minDist = d; nearest = other; }
        });

        const stoppedVehicle: StoppedVehicle = {
          vehicleId:  v.id,
          lat:        v.lat,
          lng:        v.lng,
          duration:   Math.round(durationS),
          detectedAt: firstSeen,
        };

        pushAlert(stoppedVehicle, Math.round(minDist));
      });
    };

    tick(); // run immediately
    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles, alerts, pushAlert]);

  /* ─── Derived state exposed to consumers ───────────────────────────── */

  const stoppedVehicles: StoppedVehicle[] = alerts
    .filter((a) => a.status === "pending" || a.status === "accident")
    .map((a) => a.stoppedVehicle);

  // The nearest driver is whichever non-stopped vehicle is closest to the
  // first pending alert, if any.
  const firstPending = alerts.find((a) => a.status === "pending");
  let nearestDriver: Vehicle | null = null;
  if (firstPending) {
    const { lat, lng } = firstPending.stoppedVehicle;
    let minDist = Infinity;
    vehicles.forEach((v) => {
      if (v.status === "stopped") return;
      const d = haversineMetres(lat, lng, v.lat, v.lng);
      if (d < minDist) { minDist = d; nearestDriver = v; }
    });
  }

  return {
    stoppedVehicles,
    nearestDriver,
    clearAlert: dismissAlert,
  };
}
