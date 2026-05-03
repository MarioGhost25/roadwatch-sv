"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/* ─── Constants ──────────────────────────────────────────────────────── */

const STORAGE_KEY = "vsv_onboarding_seen";
const TOTAL_STEPS = 3;

/* ─── Slide transition variants ─────────────────────────────────────── */

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.42, ease: [0.32, 0.72, 0, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: 0.34, ease: [0.32, 0.72, 0, 1] },
  }),
};

/* ═══════════════════════════════════════════════════════════════════════
   SCREEN 1 — Road animation with moving vehicle dots
════════════════════════════════════════════════════════════════════════ */

function RoadAnimation() {
  return (
    <svg
      viewBox="0 0 360 260"
      className="w-full max-w-[360px]"
      aria-hidden="true"
      fill="none"
    >
      {/* Road lines — subtle */}
      <path
        d="M 20 200 Q 100 140 180 160 Q 260 180 340 100"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M 20 200 Q 100 140 180 160 Q 260 180 340 100"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="8 10"
      />
      <path
        d="M 20 80 Q 80 120 160 100 Q 240 80 340 180"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M 20 80 Q 80 120 160 100 Q 240 80 340 180"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="8 10"
      />

      {/* Fast teal vehicles — animated along path 1 */}
      <circle r="6" fill="#1d9e75">
        <animateMotion
          dur="3.2s"
          repeatCount="indefinite"
          path="M 20 200 Q 100 140 180 160 Q 260 180 340 100"
        />
      </circle>
      <circle r="5" fill="#1d9e75" opacity="0.8">
        <animateMotion
          dur="3.2s"
          begin="-1.1s"
          repeatCount="indefinite"
          path="M 20 200 Q 100 140 180 160 Q 260 180 340 100"
        />
      </circle>

      {/* Fast teal vehicles — animated along path 2 */}
      <circle r="6" fill="#1d9e75">
        <animateMotion
          dur="4s"
          begin="-0.6s"
          repeatCount="indefinite"
          path="M 20 80 Q 80 120 160 100 Q 240 80 340 180"
        />
      </circle>

      {/* Slow amber vehicle */}
      <circle r="6" fill="#EF9F27">
        <animateMotion
          dur="8s"
          repeatCount="indefinite"
          path="M 20 200 Q 100 140 180 160 Q 260 180 340 100"
        />
      </circle>

      {/* Slow amber vehicle path 2 */}
      <circle r="5" fill="#EF9F27" opacity="0.85">
        <animateMotion
          dur="9s"
          begin="-3s"
          repeatCount="indefinite"
          path="M 20 80 Q 80 120 160 100 Q 240 80 340 180"
        />
      </circle>

      {/* Stopped red vehicle — pulsing at fixed point */}
      <circle cx="180" cy="155" r="7" fill="#E24B4A">
        <animate
          attributeName="r"
          values="7;11;7"
          dur="1.6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0.3;1"
          dur="1.6s"
          repeatCount="indefinite"
        />
      </circle>
      {/* pulse ring */}
      <circle cx="180" cy="155" r="14" fill="none" stroke="#E24B4A" strokeWidth="1.5">
        <animate attributeName="r" values="10;22;10" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SCREEN 2 — Phone with slide-down notification
════════════════════════════════════════════════════════════════════════ */

function PhoneAnimation() {
  const [phase, setPhase] = useState<"idle" | "notification" | "buttons">("idle");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("notification"), 800);
    const t2 = setTimeout(() => setPhase("buttons"), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full max-w-[260px] mx-auto">
      {/* Phone frame */}
      <svg
        viewBox="0 0 160 280"
        className="w-[160px]"
        aria-hidden="true"
        fill="none"
      >
        {/* Body */}
        <rect
          x="4" y="4" width="152" height="272"
          rx="22" ry="22"
          fill="#141f2b"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        {/* Screen */}
        <rect
          x="12" y="28" width="136" height="224"
          rx="10" ry="10"
          fill="#0f1923"
        />
        {/* Notch */}
        <rect x="56" y="10" width="48" height="10" rx="5" fill="#0f1923" />
        {/* Home bar */}
        <rect x="60" y="262" width="40" height="4" rx="2" fill="rgba(255,255,255,0.15)" />

        {/* Map mockup inside screen */}
        <rect x="12" y="28" width="136" height="224" rx="10" fill="#162030" />
        {/* Road lines */}
        <path d="M 12 140 Q 80 120 148 150" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <path d="M 40 80 Q 80 140 130 200" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        {/* A dot on map */}
        <circle cx="82" cy="135" r="4" fill="#1d9e75" />
      </svg>

      {/* Notification card overlay */}
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            key="notif"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="absolute top-[32px] left-[14px] right-[14px] rounded-[8px] overflow-hidden"
            style={{
              background: "#1a2a38",
              border: "0.5px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: "#EF9F27" }}
                  aria-hidden="true"
                />
                <span
                  className="text-[10px] font-semibold tracking-wide uppercase"
                  style={{ color: "#EF9F27" }}
                >
                  Vialidad SV
                </span>
              </div>
              <p className="text-[11px] leading-snug" style={{ color: "#e8edf2" }}>
                Vehículo detenido a 300m<br />
                <span style={{ color: "#8a9bb0" }}>¿Qué ves?</span>
              </p>
            </div>

            {/* Action buttons */}
            <AnimatePresence>
              {phase === "buttons" && (
                <motion.div
                  key="btns"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="flex border-t"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <button
                    type="button"
                    className="flex-1 py-2 text-[11px] font-medium border-r cursor-default"
                    style={{
                      color: "#1d9e75",
                      borderColor: "rgba(255,255,255,0.08)",
                      background: "transparent",
                    }}
                  >
                    Nada raro
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-2 text-[11px] font-medium cursor-default"
                    style={{ color: "#E24B4A", background: "transparent" }}
                  >
                    Es accidente
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SCREEN 3 — Report buttons with hover flow
════════════════════════════════════════════════════════════════════════ */

const LEVE_FLOW = ["Fotografía", "Oríllate", "Confirma"];
const GRAVE_FLOW = ["Alerta PNC", "Cruz Roja", "Coordinan"];

function FlowIcons({ steps, color }: { steps: string[]; color: string }) {
  return (
    <motion.div
      key="flow"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-1.5 mt-3"
      aria-hidden="true"
    >
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-1.5">
          <div
            className="flex flex-col items-center gap-0.5"
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold"
              style={{
                background: `${color}1a`,
                color,
                border: `0.5px solid ${color}40`,
              }}
            >
              {i + 1}
            </div>
            <span className="text-[9px] whitespace-nowrap" style={{ color: "rgba(138,155,176,0.9)" }}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill={color} opacity="0.4" className="shrink-0 mb-3">
              <path d="M2 5h6M6 3l2 2-2 2" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          )}
        </div>
      ))}
    </motion.div>
  );
}

function ReportButton({
  label,
  color,
  tint,
  steps,
}: {
  label: string;
  color: string;
  tint: string;
  steps: string[];
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      type="button"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      animate={{ scale: hovered ? 1.03 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="flex-1 rounded-xl p-4 flex flex-col items-start text-left min-h-[120px] focus-visible:outline-none"
      style={{
        background: tint,
        border: `0.5px solid ${color}40`,
        cursor: "default",
      }}
      aria-label={label}
    >
      <span
        className="text-sm font-semibold leading-tight"
        style={{ color }}
      >
        {label}
      </span>
      <AnimatePresence>
        {hovered && <FlowIcons steps={steps} color={color} />}
      </AnimatePresence>
    </motion.button>
  );
}

function ReportAnimation() {
  return (
    <div className="flex gap-4 w-full max-w-[340px] mx-auto px-2">
      <ReportButton
        label="Accidente leve"
        color="#EF9F27"
        tint="rgba(239,159,39,0.10)"
        steps={LEVE_FLOW}
      />
      <ReportButton
        label="Accidente grave"
        color="#E24B4A"
        tint="rgba(226,75,74,0.10)"
        steps={GRAVE_FLOW}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SLIDE DATA
════════════════════════════════════════════════════════════════════════ */

const SLIDES = [
  {
    animation: <RoadAnimation />,
    title: "Ve el tráfico en tiempo real",
    subtitle: "Cada punto es un vehículo real en tu ruta",
  },
  {
    animation: <PhoneAnimation />,
    title: "El sistema detecta, tú confirmas",
    subtitle: "Si un carro se detiene, alertamos al conductor más cercano",
  },
  {
    animation: <ReportAnimation />,
    title: "Reporta en segundos",
    subtitle: "Leve: fotografía y oríllate. Grave: alertamos a PNC y Cruz Roja",
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   PROGRESS DOTS
════════════════════════════════════════════════════════════════════════ */

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Paso ${current + 1} de ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 20 : 6,
            opacity: i === current ? 1 : 0.35,
            backgroundColor: i === current ? "#1d9e75" : "#4d6070",
          }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="h-1.5 rounded-full"
          aria-current={i === current ? "step" : undefined}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════ */

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  /* Skip if already seen */
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem(STORAGE_KEY) === "1") {
        router.replace("/");
      }
    }
  }, [router]);

  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    router.push("/");
  }, [router]);

  const next = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }, [step, finish]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div
      className="relative flex flex-col items-center justify-between w-full overflow-hidden"
      style={{
        minHeight: "100dvh",
        background: "#0f1923",
      }}
    >
      {/* Skip button — only on screens 1 & 2 */}
      <div className="w-full flex justify-end px-5 pt-4 h-12 shrink-0 z-10">
        {!isLast && (
          <motion.button
            key="skip"
            type="button"
            onClick={skip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm px-3 py-1 rounded-md transition-colors"
            style={{ color: "#4d6070" }}
          >
            Saltar
          </motion.button>
        )}
      </div>

      {/* Slides */}
      <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6"
          >
            {/* Animation area */}
            <div className="flex items-center justify-center w-full">
              {SLIDES[step].animation}
            </div>

            {/* Text */}
            <div className="text-center max-w-[320px] flex flex-col gap-3">
              <h1
                className="font-sans text-[26px] font-bold leading-tight text-balance"
                style={{ color: "#e8edf2" }}
              >
                {SLIDES[step].title}
              </h1>
              <p
                className="text-[15px] leading-relaxed"
                style={{ color: "#8a9bb0" }}
              >
                {SLIDES[step].subtitle}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="w-full flex items-center justify-between px-5 pb-8 pt-4 shrink-0 z-10">
        <ProgressDots current={step} total={TOTAL_STEPS} />

        <motion.button
          type="button"
          onClick={next}
          whileTap={{ scale: 0.96 }}
          className="h-10 px-5 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            background: "#1d9e75",
            color: "#0f1923",
            boxShadow: "0 0 0 0 transparent",
          }}
        >
          {isLast ? "Empezar" : "Siguiente"}
        </motion.button>
      </div>
    </div>
  );
}
