"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { treatments, type Treatment } from "@/lib/treatments";
import { carZones, DEFAULT_ZONE_ID } from "@/lib/carZones";
import { CounterStats } from "@/components/sections/treatments/CounterStats";
import { cn } from "@/lib/utils";

// Sorgente immagine + aspetto del render originale (2816×1536).
const CAR_SRC = "/home/auto3d.webp";
const CAR_ALT =
  "Spaccato tecnico di un'auto: telaio, motore, abitacolo e carrozzeria in vista";
const CAR_ASPECT = "2816 / 1536";

function treatmentById(id: string): Treatment {
  return treatments.find((t) => t.id === id) ?? treatments[0];
}

/**
 * Sezione homepage "Anatomia di un'auto": l'utente passa (desktop) o tocca
 * (mobile, via ZoneNav) le parti dell'auto e vede il servizio collegato.
 * Contenuti riusati da treatments.ts; geometria in carZones.ts.
 */
export default function CarExplorer() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(DEFAULT_ZONE_ID);
  const [touched, setTouched] = useState(false);

  const active = treatmentById(activeId);

  // hover/focus: cambia solo la zona attiva; tap/click: marca l'interazione
  // (nasconde l'hint) e fissa la zona.
  const preview = (id: string) => setActiveId(id);
  const select = (id: string) => {
    setActiveId(id);
    setTouched(true);
  };

  return (
    <section
      id="esplora"
      className="relative overflow-hidden bg-ink py-24 text-paper md:py-32"
    >
      <div className="glow-racing pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 opacity-20 blur-3xl" />

      <div className="wrap relative">
        <div className="max-w-2xl">
          <Reveal>
            <span className="eyebrow text-racing-bright">Esplora i servizi</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-xl mt-5">Un&apos;auto, cinque trattamenti.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-paper/70">
              Passa sulle diverse parti dell&apos;auto e scopri come la
              trasformiamo, dal motore alla carrozzeria.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid items-center gap-8 lg:mt-16 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <CarStage
            activeId={activeId}
            onPreview={preview}
            onSelect={select}
            reduce={reduce}
            showHint={!touched}
          />
          <ServicePanel treatment={active} reduce={reduce} />
        </div>

        <ZoneNav activeId={activeId} onSelect={select} />
      </div>
    </section>
  );
}

/* --------------------------- Palco auto + hotspot --------------------------- */

function CarStage({
  activeId,
  onPreview,
  onSelect,
  reduce,
  showHint,
}: {
  activeId: string;
  onPreview: (id: string) => void;
  onSelect: (id: string) => void;
  reduce: boolean | null;
  showHint: boolean;
}) {
  const activeZone = carZones.find((z) => z.id === activeId) ?? carZones[0];

  return (
    <div className="relative w-full select-none" style={{ aspectRatio: CAR_ASPECT }}>
      {/* ombra/pavimento sotto l'auto */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[8%] bottom-[5%] h-[12%] rounded-[50%] bg-black/70 blur-2xl"
      />

      <Image
        src={CAR_SRC}
        alt={CAR_ALT}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="object-contain"
      />

      {/* spotlight verde che segue la zona attiva (additivo sull'auto) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[42%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--color-racing-bright) 55%, transparent), transparent)",
          mixBlendMode: "screen",
        }}
        animate={{ left: `${activeZone.point.x}%`, top: `${activeZone.point.y}%` }}
        transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* hotspot */}
      {carZones.map((zone) => {
        const isActive = zone.id === activeId;
        const t = treatmentById(zone.id);
        return (
          <button
            key={zone.id}
            type="button"
            onMouseEnter={() => onPreview(zone.id)}
            onFocus={() => onPreview(zone.id)}
            onClick={() => onSelect(zone.id)}
            aria-label={`Scopri il servizio ${t.title}`}
            aria-pressed={isActive}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${zone.hit.x}%`,
              top: `${zone.hit.y}%`,
              width: `${zone.hit.rx * 2}%`,
              height: `${zone.hit.ry * 2}%`,
            }}
          >
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-racing-bright shadow-[0_0_0_4px_rgba(46,139,67,0.25)]"
            />
            {!reduce && isActive && (
              <motion.span
                aria-hidden
                className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-racing-bright/60"
                animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </button>
        );
      })}

      <AnimatePresence>
        {showHint && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ borderColor: "rgba(245,244,240,0.15)" }}
            className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border bg-ink/70 px-4 py-2 font-display text-xs uppercase tracking-widest text-paper/70 backdrop-blur"
          >
            Passa sul mezzo per esplorare
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ Pannello servizio --------------------------- */

function ServicePanel({
  treatment,
  reduce,
}: {
  treatment: Treatment;
  reduce: boolean | null;
}) {
  return (
    <div className="relative min-h-[22rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={treatment.id}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow text-racing-bright">Servizio</span>
          <h3 className="display-lg mt-3">{treatment.title}</h3>
          <p className="mt-4 max-w-md leading-relaxed text-paper/70">
            {treatment.intro}
          </p>

          {treatment.stats && (
            <div className="mt-6">
              <CounterStats stats={treatment.stats} />
            </div>
          )}

          <ul className="mt-6 flex flex-wrap gap-2.5">
            {treatment.features.map((f) => (
              <li
                key={f}
                style={{ borderColor: "rgba(245,244,240,0.28)" }}
                className="rounded-full border px-3.5 py-1.5 font-display text-sm font-medium text-paper/85"
              >
                {f}
              </li>
            ))}
          </ul>

          <Link
            href={`/trattamenti#${treatment.id}`}
            className="btn btn-primary mt-8"
          >
            Scopri di più
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------- Nav etichette (mobile/legenda) ------------------- */

function ZoneNav({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="mt-10 flex flex-wrap justify-center gap-2.5 lg:mt-12">
      {carZones.map((zone) => {
        const isActive = zone.id === activeId;
        return (
          <li key={zone.id}>
            <button
              type="button"
              onClick={() => onSelect(zone.id)}
              onMouseEnter={() => onSelect(zone.id)}
              aria-pressed={isActive}
              style={{
                borderColor: isActive
                  ? "var(--color-racing-bright)"
                  : "rgba(245,244,240,0.18)",
              }}
              className={cn(
                "rounded-full border px-4 py-2 font-display text-sm font-medium transition-colors",
                isActive
                  ? "bg-racing-bright/15 text-paper"
                  : "text-paper/70 hover:text-paper",
              )}
            >
              {zone.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
