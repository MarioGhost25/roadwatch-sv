"use client";

import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { Incident } from "./types";

/* ─── Colors ─────────────────────────────────────────────────────────── */

const INCIDENT_COLOR: Record<Incident["type"], string> = {
  leve:  "#EF9F27", // traffic-amber
  grave: "#E24B4A", // traffic-red
};

/* ─── Radius circle via Maps API ──────────────────────────────────── */

const RADIUS_METERS: Record<Incident["type"], number> = {
  leve:  80,
  grave: 150,
};

interface CircleLayerProps {
  incident: Incident;
  color: string;
}

function CircleLayer({ incident, color }: CircleLayerProps): null {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    const circle = new google.maps.Circle({
      map,
      center: { lat: incident.lat, lng: incident.lng },
      radius: RADIUS_METERS[incident.type],
      strokeColor: color,
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 0.08,
    });

    circleRef.current = circle;

    return () => {
      circle.setMap(null);
    };
  }, [map, incident.lat, incident.lng, incident.type, color]);

  return null;
}

/* ─── Pin icon ───────────────────────────────────────────────────────── */

interface PinProps {
  color: string;
  severe: boolean;
}

function IncidentPin({ color, severe }: PinProps): ReactNode {
  return (
    <div className="relative flex items-center justify-center" aria-hidden="true">
      {/* Outer pulse ring */}
      <span
        className="absolute rounded-full animate-ping"
        style={{
          width: severe ? 28 : 22,
          height: severe ? 28 : 22,
          backgroundColor: color,
          opacity: 0.25,
          animationDuration: severe ? "1s" : "1.4s",
        }}
      />
      {/* Inner solid circle */}
      <svg
        width={severe ? 20 : 16}
        height={severe ? 20 : 16}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: `drop-shadow(0 0 4px ${color}aa)` }}
      >
        <circle cx="10" cy="10" r="9" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
        {/* Exclamation */}
        <rect x="9" y="5" width="2" height="6" rx="1" fill={color} />
        <circle cx="10" cy="14" r="1.2" fill={color} />
      </svg>
    </div>
  );
}

/* ─── IncidentMarker ─────────────────────────────────────────────────── */

interface IncidentMarkerProps {
  incident: Incident;
}

export function IncidentMarker({ incident }: IncidentMarkerProps): ReactNode {
  const color = INCIDENT_COLOR[incident.type];
  const severe = incident.type === "grave";

  return (
    <>
      <CircleLayer incident={incident} color={color} />
      <AdvancedMarker
        key={incident.id}
        position={{ lat: incident.lat, lng: incident.lng }}
        title={`Incidente ${incident.type} — ${incident.confirmedAt}`}
      >
        <IncidentPin color={color} severe={severe} />
      </AdvancedMarker>
    </>
  );
}

export default IncidentMarker;
