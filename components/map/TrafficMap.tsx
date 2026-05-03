"use client";

import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useEffect, type ReactNode } from "react";
import { VehicleMarker } from "./VehicleMarker";
import { IncidentMarker } from "./IncidentMarker";
import type { Vehicle, Incident } from "./types";

export type { Vehicle, Incident };

/* ─── Constants ──────────────────────────────────────────────────────── */

const CENTER = { lat: 13.6929, lng: -89.2182 };
const DEFAULT_ZOOM = 13;

/**
 * Google Maps JSON style — dark theme matching the Vialidad SV design system.
 * Roads: #2a4a60 | Highways: #1a3040 | Water: #0f1923 | Labels: #5DCAA5 @ 0.7
 */
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry",       stylers: [{ color: "#0f1923" }] },
  { elementType: "labels.text.fill",   stylers: [{ color: "#5DCAA5" }, { lightness: -30 }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f1923" }] },

  // Hide default POI icons/labels
  { featureType: "poi",            elementType: "all",              stylers: [{ visibility: "off" }] },
  { featureType: "poi.park",       elementType: "geometry",         stylers: [{ color: "#111e2a" }] },

  // Roads
  { featureType: "road",           elementType: "geometry",         stylers: [{ color: "#2a4a60" }] },
  { featureType: "road",           elementType: "geometry.stroke",  stylers: [{ color: "#0f1923" }, { weight: 0.5 }] },
  { featureType: "road",           elementType: "labels.text.fill", stylers: [{ color: "#5dcaa5" }, { opacity: 0.7 }] },
  { featureType: "road.highway",   elementType: "geometry",         stylers: [{ color: "#1a3040" }] },
  { featureType: "road.highway",   elementType: "geometry.stroke",  stylers: [{ color: "#0f1923" }, { weight: 0.8 }] },
  { featureType: "road.arterial",  elementType: "geometry",         stylers: [{ color: "#243d50" }] },
  { featureType: "road.local",     elementType: "geometry",         stylers: [{ color: "#1e3344" }] },

  // Water
  { featureType: "water",          elementType: "geometry",         stylers: [{ color: "#0f1923" }] },
  { featureType: "water",          elementType: "labels.text.fill", stylers: [{ color: "#4d6070" }] },

  // Landscape
  { featureType: "landscape",      elementType: "geometry",         stylers: [{ color: "#111e2a" }] },
  { featureType: "landscape.natural.terrain", elementType: "geometry", stylers: [{ color: "#0e1b26" }] },

  // Administrative boundaries
  { featureType: "administrative", elementType: "geometry.stroke",  stylers: [{ color: "#2a4a60" }, { weight: 0.5 }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#5dcaa5" }, { opacity: 0.6 }] },

  // Transit
  { featureType: "transit",        elementType: "geometry",         stylers: [{ color: "#1a3040" }] },
];

/* ─── Traffic layer activator (hook-based, must be inside <Map>) ───── */

function TrafficLayer(): null {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");

  useEffect(() => {
    if (!map || !mapsLib) return;
    const trafficLayer = new mapsLib.TrafficLayer();
    trafficLayer.setMap(map);
    return () => trafficLayer.setMap(null);
  }, [map, mapsLib]);

  return null;
}

/* ─── Inner map content (requires Map context) ──────────────────────── */

interface MapContentProps {
  vehicles: Vehicle[];
  incidents: Incident[];
}

function MapContent({ vehicles, incidents }: MapContentProps): ReactNode {
  return (
    <>
      <TrafficLayer />

      {/* Vehicle markers */}
      {vehicles.map((v) => (
        <VehicleMarker key={v.id} vehicle={v} />
      ))}

      {/* Incident markers + radius circles */}
      {incidents.map((inc) => (
        <IncidentMarker key={inc.id} incident={inc} />
      ))}
    </>
  );
}

/* ─── TrafficMap ─────────────────────────────────────────────────────── */

interface TrafficMapProps {
  vehicles?: Vehicle[];
  incidents?: Incident[];
}

export function TrafficMap({
  vehicles = [],
  incidents = [],
}: TrafficMapProps): ReactNode {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultCenter={CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeId="roadmap"
        styles={MAP_STYLES}
        // Minimal controls — keep UI clean
        zoomControl
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        rotateControl={false}
        scaleControl={false}
        clickableIcons={false}
      >
        <MapContent vehicles={vehicles} incidents={incidents} />
      </Map>
    </APIProvider>
  );
}

export default TrafficMap;
