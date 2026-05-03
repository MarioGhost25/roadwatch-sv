import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/Card";

/* ─── Section wrapper ────────────────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted font-mono">
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function DesignSystemPage() {
  return (
    <main className="min-h-dvh bg-bg-base px-6 py-12">
      <div className="mx-auto max-w-3xl flex flex-col gap-12">

        {/* Header */}
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-text-primary">
            Vialidad SV
          </h1>
          <p className="text-sm text-text-secondary font-mono">
            Design System — v0.1.0
          </p>
        </header>

        {/* ── Colour Swatches ───────────────────────────────────────── */}
        <Section title="Colores">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {[
              { name: "Fluido",    bg: "bg-traffic-green",  text: "#1d9e75" },
              { name: "Moderado",  bg: "bg-traffic-amber",  text: "#EF9F27" },
              { name: "Grave",     bg: "bg-traffic-red",    text: "#E24B4A" },
              { name: "Base",      bg: "bg-bg-base",        border: true, text: "#0f1923" },
              { name: "Surface",   bg: "bg-bg-surface",     border: true, text: "#141f2b" },
              { name: "Sur. Alt",  bg: "bg-bg-surface-alt", border: true, text: "#162030" },
            ].map((s) => (
              <div key={s.name} className="flex flex-col gap-1.5">
                <div
                  className={[
                    "h-10 rounded-[6px]",
                    s.bg,
                    s.border ? "border-thin border-border-default" : "",
                  ].join(" ")}
                />
                <span className="text-xs text-text-secondary">{s.name}</span>
                <span className="text-[11px] font-mono text-text-muted">
                  {s.text}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Badges ───────────────────────────────────────────────── */}
        <Section title="Badges — Estado de tráfico">
          <div className="flex flex-wrap gap-3">
            <Badge variant="fluido" />
            <Badge variant="moderado" />
            <Badge variant="grave" />
            <Badge variant="accidente" />
            <Badge variant="fluido" pulse label="En vivo" />
            <Badge variant="accidente" pulse label="Activo" />
          </div>
        </Section>

        {/* ── Buttons ──────────────────────────────────────────────── */}
        <Section title="Botones — Variantes">
          {/* Sizes */}
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>

          {/* Variants */}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>

          {/* Loading */}
          <div className="flex flex-wrap items-center gap-3">
            <Button loading>Cargando…</Button>
            <Button variant="danger" loading>
              Eliminando…
            </Button>
            <Button disabled>Deshabilitado</Button>
          </div>

          {/* With icons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              iconLeft={
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm1 10H7V7h2v4Zm0-5H7V4h2v2Z" />
                </svg>
              }
            >
              Reportar incidente
            </Button>
            <Button
              variant="outline"
              iconRight={
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path
                    fillRule="evenodd"
                    d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06L7.28 11.78a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            >
              Ver mapa
            </Button>
          </div>
        </Section>

        {/* ── Cards ────────────────────────────────────────────────── */}
        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-2">

            {/* Basic card */}
            <Card>
              <CardHeader>
                <span className="text-sm font-semibold text-text-primary">
                  Incidente #4821
                </span>
                <Badge variant="grave" />
              </CardHeader>
              <CardBody>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Accidente de tránsito en Bulevar de los Héroes, carril
                  derecho bloqueado. Tiempo estimado de despeje: 45 min.
                </p>
                <p className="mt-3 data-mono text-text-muted">
                  13.7034° N, 89.2182° O
                </p>
              </CardBody>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Ver en mapa
                </Button>
                <Button size="sm" variant="ghost">
                  Descartar
                </Button>
              </CardFooter>
            </Card>

            {/* Elevated card */}
            <Card elevation="elevated">
              <CardHeader>
                <span className="text-sm font-semibold text-text-primary">
                  Ruta CA-1 Oriente
                </span>
                <Badge variant="moderado" pulse />
              </CardHeader>
              <CardBody>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Velocidad prom.", value: "42 km/h" },
                    { label: "Tiempo al destino", value: "1h 18min" },
                    { label: "Actualizado", value: "hace 2 min" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-xs text-text-muted">{row.label}</span>
                      <span className="data-mono">{row.value}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

          </div>
        </Section>

        {/* ── Typography ───────────────────────────────────────────── */}
        <Section title="Tipografía">
          <Card>
            <CardBody>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-mono text-text-muted mb-1">DM Sans — UI</p>
                  <p className="text-2xl font-semibold text-text-primary font-sans">
                    Monitoreo vial en tiempo real
                  </p>
                  <p className="text-base text-text-secondary font-sans">
                    Seguimiento de incidentes, flujo vehicular y estado de
                    carreteras en todo El Salvador.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-mono text-text-muted mb-1">JetBrains Mono — Datos</p>
                  <p className="data-mono">
                    LAT 13.6929° N &nbsp; LON 89.2182° O &nbsp; ALT 658 m
                  </p>
                  <p className="data-mono text-traffic-green">
                    VELOCIDAD 67 km/h &nbsp; FLUJO 1240 veh/h
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Section>

      </div>
    </main>
  );
}
