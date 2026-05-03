import type { ReactNode } from "react";

interface MapSlotProps {
  children?: ReactNode;
}

/**
 * MapSlot — fills the remaining grid area between topbar and sidebar.
 * Drop a real map component (Leaflet, Mapbox, etc.) as `children`.
 * The placeholder renders a subtle grid to simulate a map canvas.
 */
export function MapSlot({ children }: MapSlotProps): ReactNode {
  return (
    <main
      aria-label="Área del mapa vial"
      className="relative bg-bg-map overflow-hidden"
      style={{ gridArea: "map" }}
    >
      {children ?? <MapPlaceholder />}
    </main>
  );
}

/* ─── Placeholder ────────────────────────────────────────────────────── */

function MapPlaceholder(): ReactNode {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
      {/* SVG grid pattern overlay */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="map-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--color-text-primary)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#map-grid)" />
      </svg>

      {/* Faint crosshair */}
      <svg
        aria-hidden="true"
        className="absolute opacity-[0.06]"
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="80" stroke="var(--color-traffic-green)" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="50" stroke="var(--color-traffic-green)" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="20" stroke="var(--color-traffic-green)" strokeWidth="0.5" />
        <line x1="100" y1="0"   x2="100" y2="200" stroke="var(--color-traffic-green)" strokeWidth="0.5" />
        <line x1="0"   y1="100" x2="200" y2="100" stroke="var(--color-traffic-green)" strokeWidth="0.5" />
      </svg>

      {/* Label */}
      <div className="relative flex flex-col items-center gap-3 z-10">
        <svg
          aria-hidden="true"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-30"
        >
          <path
            d="M20 4L36 32H4L20 4Z"
            fill="var(--color-traffic-green)"
            fillOpacity="0.15"
            stroke="var(--color-traffic-green)"
            strokeWidth="1"
          />
          <rect x="18.5" y="14" width="3" height="9" rx="1.5" fill="var(--color-traffic-green)" />
          <circle cx="20" cy="26" r="1.5" fill="var(--color-traffic-green)" />
        </svg>

        <p className="data-mono text-text-muted" style={{ fontSize: "11px" }}>
          Mapa de tráfico
        </p>
        <p className="font-sans text-text-muted" style={{ fontSize: "10px" }}>
          Conecta un proveedor cartográfico para activar la vista
        </p>
      </div>
    </div>
  );
}

export default MapSlot;
