"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import type { ReactNode } from "react";
import type { Vehicle } from "./types";

/* ─── Color map ──────────────────────────────────────────────────────── */

const STATUS_COLOR: Record<Vehicle["status"], string> = {
  moving:  "#1d9e75", // traffic-green
  slow:    "#EF9F27", // traffic-amber
  stopped: "#EF9F27", // traffic-amber (pulse added separately)
};

/* ─── Arrow icon (points up = 0°, rotates per heading) ────────────── */

interface ArrowIconProps {
  color: string;
  rotate: number;
  pulse: boolean;
}

function ArrowIcon({ color, rotate, pulse }: ArrowIconProps): ReactNode {
  return (
    <div
      style={{ transform: `rotate(${rotate}deg)` }}
      className="relative flex items-center justify-center"
      aria-hidden="true"
    >
      {/* Pulse ring for stopped vehicles */}
      {pulse && (
        <span
          className="absolute rounded-full animate-ping"
          style={{
            width: 20,
            height: 20,
            backgroundColor: color,
            opacity: 0.35,
          }}
        />
      )}
      {/* Vehicle arrow */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: `drop-shadow(0 0 3px ${color}88)` }}
      >
        {/* Arrow body pointing upward */}
        <path
          d="M8 2L12.5 13H8H3.5L8 2Z"
          fill={color}
          fillOpacity="0.9"
        />
        <path
          d="M8 2L12.5 13H8H3.5L8 2Z"
          stroke={color}
          strokeWidth="0.75"
        />
      </svg>
    </div>
  );
}

/* ─── VehicleMarker ──────────────────────────────────────────────────── */

interface VehicleMarkerProps {
  vehicle: Vehicle;
}

export function VehicleMarker({ vehicle }: VehicleMarkerProps): ReactNode {
  const color = STATUS_COLOR[vehicle.status];
  const pulse = vehicle.status === "stopped";

  return (
    <AdvancedMarker
      key={vehicle.id}
      position={{ lat: vehicle.lat, lng: vehicle.lng }}
      title={`Vehículo ${vehicle.id} — ${vehicle.speed} km/h`}
    >
      <ArrowIcon color={color} rotate={vehicle.heading} pulse={pulse} />
    </AdvancedMarker>
  );
}

export default VehicleMarker;
