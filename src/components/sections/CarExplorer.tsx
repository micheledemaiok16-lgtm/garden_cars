"use client";

import { useState, type FocusEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { treatments, type Treatment } from "@/lib/treatments";
import { carSpots, type TreatmentId } from "@/lib/carSpots";
import { cn } from "@/lib/utils";
import Car360 from "./Car360";
import CarSpots from "./CarSpots";

function treatmentById(id: string): Treatment {
  return treatments.find((t) => t.id === id) ?? treatments[0];
}

// Servizio/angolo di partenza: Carrozzeria (lucidatura), così il pannello non è
// mai vuoto e l'auto parte su un tre quarti gradevole.
const INITIAL = carSpots.find((s) => s.id === "lucidatura") ?? carSpots[0];

/**
 * Sezione homepage "Esplora i servizi": un'auto (Audi nera) rotabile via
 * trascinamento su cui compaiono i pallini dei servizi. Hover/tap su una zona
 * (pallino o ZoneNav) evidenzia il servizio nel pannello e porta l'auto
 * all'angolo dove quella parte è meglio visibile. Geometria in carSpots.ts,
 * sequenza in carSpin.ts.
 */
export default function CarExplorer() {
  const reduce = useReducedMotion();
  // `frame` è lo specchio del fotogramma corrente (per i pallini), aggiornato
  // dal motore di animazione dentro Car360. `targetFrame` è l'angolo verso cui
  // l'auto ruota dolcemente quando si seleziona un servizio; null = riposo
  // (auto-rotazione).
  const [frame, setFrame] = useState<number>(INITIAL.anchorFrame);
  const [targetFrame, setTargetFrame] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string>(INITIAL.id);
  const [touched, setTouched] = useState(false);

  const active = treatmentById(activeId);

  // hover/focus su una zona: evidenzia il servizio e fa ruotare l'auto verso
  // l'angolo dove quella parte è meglio visibile (anchorFrame).
  const preview = (id: string) => {
    setActiveId(id);
    const spot = carSpots.find((s) => s.id === id);
    if (spot) setTargetFrame(spot.anchorFrame);
    setTouched(true);
  };
  // uscita da una zona: torna in riposo (riprende l'auto-rotazione).
  const endPreview = () => setTargetFrame(null);
  // l'utente affronta l'auto: stop all'auto-rotazione, comanda il trascinamento.
  const handleGrab = () => {
    setTargetFrame(null);
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
            <span
              className="eyebrow text-racing-bright"
              style={{ fontSize: "clamp(1rem, 1.3vw, 1.25rem)" }}
            >
              Esplora i servizi
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-xl mt-5">Un&apos;auto, cinque trattamenti.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-paper/70">
              Trascina per ruotare l&apos;auto e vai dritto al trattamento che ti
              interessa.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid items-center gap-8 lg:mt-16 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <Car360
            initialFrame={INITIAL.anchorFrame}
            targetFrame={targetFrame}
            reduce={reduce}
            onFrameChange={setFrame}
            onGrab={handleGrab}
            showHint={!touched}
          >
            <CarSpots
              frame={frame}
              activeId={activeId}
              onPreview={preview}
              onEndPreview={endPreview}
              reduce={reduce}
            />
          </Car360>
          <ServicePanel treatment={active} reduce={reduce} />
        </div>

        <ZoneNav activeId={activeId} onPreview={preview} onEndPreview={endPreview} />
      </div>
    </section>
  );
}

/* ----------------------- Pannello: solo nome + link ------------------------ */

function ServicePanel({
  treatment,
  reduce,
}: {
  treatment: Treatment;
  reduce: boolean | null;
}) {
  return (
    <div className="relative min-h-[16rem] lg:min-h-[19rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={treatment.id}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow text-racing-bright">Servizio</span>
          <h3 className="display-lg mt-3">
            <Link
              href={`/trattamenti#${treatment.id}`}
              className="transition-colors hover:text-racing-bright"
            >
              {treatment.title}
            </Link>
          </h3>

          {/* Servizi secondari: le stesse voci elencate nella sezione del
              trattamento su /trattamenti (treatment.features). */}
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
            className="group mt-7 inline-flex items-center gap-2.5 font-display text-base font-semibold text-racing-bright transition-colors hover:text-paper"
          >
            Vai al servizio
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------- Nav etichette: link diretti (mobile/legenda) ----------- */

function ZoneNav({
  activeId,
  onPreview,
  onEndPreview,
}: {
  activeId: string;
  onPreview: (id: TreatmentId) => void;
  onEndPreview: () => void;
}) {
  const handleBlur = (e: FocusEvent<HTMLUListElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      onEndPreview();
    }
  };

  return (
    <ul
      className="mt-10 flex flex-wrap justify-center gap-2.5 lg:mt-12"
      onMouseLeave={onEndPreview}
      onBlur={handleBlur}
    >
      {carSpots.map((spot) => {
        const isActive = spot.id === activeId;
        return (
          <li key={spot.id}>
            <Link
              href={`/trattamenti#${spot.id}`}
              onMouseEnter={() => onPreview(spot.id)}
              onFocus={() => onPreview(spot.id)}
              style={{
                borderColor: isActive
                  ? "var(--color-racing-bright)"
                  : "rgba(245,244,240,0.18)",
              }}
              className={cn(
                "inline-block rounded-full border px-4 py-2 font-display text-sm font-medium transition-colors",
                isActive
                  ? "bg-racing-bright/15 text-paper"
                  : "text-paper/70 hover:text-paper",
              )}
            >
              {spot.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
