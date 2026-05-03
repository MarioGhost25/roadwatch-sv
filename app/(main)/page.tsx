"use client";

import dynamic from "next/dynamic";
import { MapSlot } from "@/components/layout/MapSlot";
import { StoppedVehicleAlert } from "@/components/alerts/StoppedVehicleAlert";
import { AccidentFlow } from "@/components/alerts/AccidentFlow";
import { TrafficPanel } from "@/components/analytics/TrafficPanel";
import { useVehicleMonitor } from "@/hooks/useVehicleMonitor";
import { useTrafficPanelStore } from "@/store/trafficPanelStore";
import type { Vehicle, Incident } from "@/components/map/types";

/* ─── Disable SSR for the map (requires window / Google Maps JS API) ── */

const TrafficMap = dynamic(
  () => import("@/components/map/TrafficMap").then((m) => m.TrafficMap),
  { ssr: false }
);

/* ─── Mock data — San Salvador metro area ───────────────────────────── */

const MOCK_VEHICLES: Vehicle[] = [
  { id: "v-001", lat: 13.6978, lng: -89.2230, speed: 62, heading: 45,  status: "moving"  },
  { id: "v-002", lat: 13.6942, lng: -89.2195, speed: 28, heading: 190, status: "slow"    },
  { id: "v-003", lat: 13.6901, lng: -89.2158, speed: 0,  heading: 270, status: "stopped" },
  { id: "v-004", lat: 13.6960, lng: -89.2110, speed: 71, heading: 350, status: "moving"  },
  { id: "v-005", lat: 13.6920, lng: -89.2245, speed: 44, heading: 120, status: "moving"  },
  { id: "v-006", lat: 13.6888, lng: -89.2080, speed: 18, heading: 85,  status: "slow"    },
  { id: "v-007", lat: 13.7005, lng: -89.2170, speed: 58, heading: 220, status: "moving"  },
  { id: "v-008", lat: 13.6935, lng: -89.2290, speed: 0,  heading: 0,   status: "stopped" },
  { id: "v-009", lat: 13.6870, lng: -89.2135, speed: 66, heading: 315, status: "moving"  },
  { id: "v-010", lat: 13.6990, lng: -89.2050, speed: 39, heading: 160, status: "slow"    },
];

const MOCK_INCIDENTS: Incident[] = [
  { id: "inc-001", lat: 13.6942, lng: -89.2195, type: "grave", confirmedAt: "2024-03-15T14:32:00Z" },
  { id: "inc-002", lat: 13.6888, lng: -89.2080, type: "leve",  confirmedAt: "2024-03-15T14:18:00Z" },
  { id: "inc-003", lat: 13.7005, lng: -89.2170, type: "leve",  confirmedAt: "2024-03-15T13:55:00Z" },
];

/* ─── Page ───────────────────────────────────────────────────────────── */

function MapPage() {
  // Monitor runs the stop-detection loop and pushes alerts to Zustand
  useVehicleMonitor(MOCK_VEHICLES);

  const { open, close } = useTrafficPanelStore();

  return (
    <MapSlot>
      <TrafficMap vehicles={MOCK_VEHICLES} incidents={MOCK_INCIDENTS} />
      <StoppedVehicleAlert />
      <AccidentFlow />
      <TrafficPanel open={open} onClose={close} />
    </MapSlot>
  );
}

export default MapPage;
