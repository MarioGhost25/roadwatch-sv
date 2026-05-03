"use client";

import { create } from "zustand";
import type { StoppedVehicle } from "@/components/map/types";

/* ─── Types ──────────────────────────────────────────────────────────── */

export type AlertStatus =
  | "pending"      // waiting for user response
  | "accident"     // confirmed as accident — triggers AccidentFlow
  | "pulling-over" // driver is pulling over — resolved
  | "dismissed";   // nothing visible — dismissed

export type AccidentSeverity = "leve" | "grave";

export interface Alert {
  id: string;
  stoppedVehicle: StoppedVehicle;
  /** distance in metres from "nearest driver" to the stopped vehicle */
  distanceMetres: number;
  status: AlertStatus;
  severity?: AccidentSeverity;
  /** which step of the accident flow is active (0-indexed) */
  accidentStep: number;
}

interface AlertState {
  alerts: Alert[];
  /** Push a new pending alert (deduplicates by vehicleId) */
  pushAlert: (stopped: StoppedVehicle, distanceMetres: number) => void;
  markAsAccident: (vehicleId: string, severity: AccidentSeverity) => void;
  resolveAlert: (vehicleId: string) => void;
  dismissAlert: (vehicleId: string) => void;
  nextAccidentStep: (vehicleId: string) => void;
  clearAllAlerts: () => void;
}

/* ─── Store ──────────────────────────────────────────────────────────── */

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],

  pushAlert: (stopped, distanceMetres) =>
    set((state) => {
      const exists = state.alerts.some(
        (a) => a.stoppedVehicle.vehicleId === stopped.vehicleId
      );
      if (exists) return state;
      return {
        alerts: [
          ...state.alerts,
          {
            id: `alert-${stopped.vehicleId}-${Date.now()}`,
            stoppedVehicle: stopped,
            distanceMetres,
            status: "pending",
            accidentStep: 0,
          },
        ],
      };
    }),

  markAsAccident: (vehicleId, severity) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.stoppedVehicle.vehicleId === vehicleId
          ? { ...a, status: "accident", severity, accidentStep: 0 }
          : a
      ),
    })),

  resolveAlert: (vehicleId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.stoppedVehicle.vehicleId === vehicleId
          ? { ...a, status: "pulling-over" }
          : a
      ),
    })),

  dismissAlert: (vehicleId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.stoppedVehicle.vehicleId === vehicleId
          ? { ...a, status: "dismissed" }
          : a
      ),
    })),

  nextAccidentStep: (vehicleId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.stoppedVehicle.vehicleId === vehicleId
          ? { ...a, accidentStep: a.accidentStep + 1 }
          : a
      ),
    })),

  clearAllAlerts: () => set({ alerts: [] }),
}));
