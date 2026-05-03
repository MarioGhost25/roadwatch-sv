/* ─── Shared map entity types ─────────────────────────────────────── */

export interface Vehicle {
  id: string;
  lat: number;
  lng: number;
  /** km/h */
  speed: number;
  /** degrees 0–359, 0 = north */
  heading: number;
  status: "moving" | "slow" | "stopped";
}

export interface Incident {
  id: string;
  lat: number;
  lng: number;
  type: "leve" | "grave";
  confirmedAt: string; // ISO 8601
}
