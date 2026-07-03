"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { treatments, type Treatment } from "@/lib/treatments";
import { carSpots, type TreatmentId } from "@/lib/carSpots";
import { frameDistance } from "@/lib/carSpin";
import { getReveal } from "@/lib/carReveal";
import { cn } from "@/lib/utils";
import Car3D from "./Car3D";
import CarDoorReveal from "./CarDoorReveal";

function treatmentById(id: string): Treatment {
  return treatments.find((t) => t.id === id) ?? treatments[0];
}

// Servizio/angolo di partenza: Carrozzeria (lucidatura), così il pannello non è
// mai vuoto e l'auto parte su un tre quarti gradevole.
const INITIAL = carSpots.find((s) => s.id === "lucidatura") ?? carSpots[0];

/**
 * Sezione homepage "Esplora i servizi": l'Audi nera in VERO 3D (Car3D:
 * GLB + Three.js + GSAP) rotabile via trascinamento. Hover/tap su una voce
 * della ZoneNav evidenzia il servizio nel pannello e porta l'auto all'angolo
 * dove quella parte è meglio visibile. Geometria in carSpots.ts, frame logici
 * in carSpin.ts (Car3D mappa frame→angolo; Car360 resta come fallback).
 */
export default function CarExplorer() {
  const reduce = useReducedMotion();
  const REVEAL_ID: TreatmentId = "restauro-pelle";
  const revealAnchor = getReveal(REVEAL_ID)?.anchorFrame ?? INITIAL.anchorFrame;

  // `targetFrame` = angolo verso cui l'auto ruota dolcemente (null = riposo /
  // auto-rotazione). `doorOpen` pilota l'overlay "Interni" (apertura sportello);
  // `doorInstant` = chiusura secca (drag). `armingRef` = in rotazione verso
  // l'ancora dopo il click "Interni": apri all'arrivo.
  const [targetFrame, setTargetFrame] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string>(INITIAL.id);
  const [touched, setTouched] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [doorInstant, setDoorInstant] = useState(false);
  const armingRef = useRef(false);
  const currentFrameRef = useRef<number>(INITIAL.anchorFrame);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);

  const active = treatmentById(activeId);

  // hover/focus su una voce: evidenzia il servizio e ruota all'angolo. Non
  // chiude la porta (la chiusura avviene solo su click/drag/click-fuori).
  const preview = (id: string) => {
    setActiveId(id);
    if (doorOpen && id !== REVEAL_ID) return; // porta aperta: niente rotazione in hover
    const spot = carSpots.find((s) => s.id === id);
    if (spot) setTargetFrame(spot.anchorFrame);
    setTouched(true);
  };
  const endPreview = () => {
    if (doorOpen || armingRef.current) return; // resta ancorato mentre è aperta/in apertura
    setTargetFrame(null);
  };

  // Chiusura della porta: graceful (reverse dello scrub) o instant (drag).
  const requestClose = (mode: "graceful" | "instant") => {
    armingRef.current = false;
    setDoorInstant(mode === "instant");
    setDoorOpen(false); // targetFrame resta su revealAnchor finché onDoorClosed non ripristina
  };
  const onDoorClosed = () => {
    setDoorInstant(false);
    setTargetFrame(null); // riprende l'auto-rotazione dall'ancora
  };

  // CLICK su "Interni": ruota all'ancora e poi apri; se già aperta, richiudi.
  const activateReveal = (id: string) => {
    setActiveId(id);
    setTouched(true);
    if (doorOpen) {
      requestClose("graceful");
      return;
    }
    setDoorInstant(false);
    setTargetFrame(revealAnchor);
    // Se l'auto è GIÀ all'ancora (tipico: ci è arrivata con l'hover-preview e si
    // è parcheggiata), apri subito: handleFrame non scatterebbe perché il
    // fotogramma non cambia più. Altrimenti arma e apri quando la rotazione
    // raggiunge l'ancora.
    if (Math.abs(frameDistance(currentFrameRef.current, revealAnchor)) < 1.5) {
      setDoorOpen(true);
    } else {
      armingRef.current = true;
    }
  };

  // L'utente affronta l'auto (drag/press): chiudi subito e passa al trascinamento.
  const handleGrab = () => {
    if (doorOpen || armingRef.current) requestClose("instant");
    armingRef.current = false;
    setTargetFrame(null);
    setTouched(true);
  };

  // Frame report dallo spin: quando la rotazione raggiunge l'ancora, apri la
  // porta. Non salva il fotogramma (nessun consumatore → niente re-render 60/s).
  const handleFrame = (f: number) => {
    currentFrameRef.current = f;
    if (armingRef.current && Math.abs(frameDistance(f, revealAnchor)) < 1.5) {
      armingRef.current = false;
      setDoorOpen(true);
    }
  };

  // "Clicca fuori" per chiudere: press fuori dal palco e fuori dalla nav.
  useEffect(() => {
    if (!doorOpen) return;
    const onDown = (e: globalThis.PointerEvent) => {
      const t = e.target as Node;
      if (stageRef.current?.contains(t)) return; // press sull'auto: lo gestisce handleGrab
      if (navRef.current?.contains(t)) return; // interazioni nav gestite dai loro handler
      requestClose("graceful");
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [doorOpen]);

  return (
    // Fondo a nero puro (#000) dove sta l'auto → combacia col fondo dei
    // fotogrammi ed elimina il "quadrato"; ai bordi torna a #0a0a0a (bg-ink)
    // per fondersi senza gradino con le sezioni adiacenti.
    <section
      id="esplora"
      className="relative overflow-hidden py-24 text-paper md:py-32"
      style={{
        background:
          "linear-gradient(to bottom, #0a0a0a 0%, #000 10%, #000 90%, #0a0a0a 100%)",
      }}
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

        <div className="mt-12 grid items-center gap-8 lg:mt-16 lg:grid-cols-[1.75fr_0.9fr] lg:gap-10">
          <div ref={stageRef}>
            <Car3D
              initialFrame={INITIAL.anchorFrame}
              targetFrame={targetFrame}
              reduce={reduce}
              onFrameChange={handleFrame}
              onGrab={handleGrab}
              showHint={!touched}
            >
              <CarDoorReveal
                revealId={REVEAL_ID}
                open={doorOpen}
                instant={doorInstant}
                reduce={reduce}
                onClosed={onDoorClosed}
              />
            </Car3D>
          </div>
          <ServicePanel treatment={active} reduce={reduce} />
        </div>

        <ZoneNav
          activeId={activeId}
          openId={doorOpen ? REVEAL_ID : null}
          onPreview={preview}
          onEndPreview={endPreview}
          onActivate={activateReveal}
          navRef={navRef}
        />
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
  openId,
  onPreview,
  onEndPreview,
  onActivate,
  navRef,
}: {
  activeId: string;
  openId: string | null;
  onPreview: (id: TreatmentId) => void;
  onEndPreview: () => void;
  onActivate: (id: TreatmentId) => void;
  navRef: React.RefObject<HTMLUListElement | null>;
}) {
  const handleBlur = (e: FocusEvent<HTMLUListElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      onEndPreview();
    }
  };

  return (
    <ul
      ref={navRef}
      className="mt-10 flex flex-wrap justify-center gap-2.5 lg:mt-12"
      onMouseLeave={onEndPreview}
      onBlur={handleBlur}
    >
      {carSpots.map((spot) => {
        const isActive = spot.id === activeId;
        // Le voci con un reveal (per ora "Interni") aprono l'animazione invece
        // di navigare: sono <button>. Le altre restano link diretti.
        const hasReveal = !!getReveal(spot.id);
        const style = {
          borderColor: isActive
            ? "var(--color-racing-bright)"
            : "rgba(245,244,240,0.18)",
        };
        const className = cn(
          "inline-block rounded-full border px-4 py-2 font-display text-sm font-medium transition-colors",
          isActive
            ? "bg-racing-bright/15 text-paper"
            : "text-paper/70 hover:text-paper",
        );

        return (
          <li key={spot.id}>
            {hasReveal ? (
              <button
                type="button"
                onClick={() => onActivate(spot.id)}
                onMouseEnter={() => onPreview(spot.id)}
                onFocus={() => onPreview(spot.id)}
                aria-expanded={openId === spot.id}
                style={style}
                className={className}
              >
                {spot.label}
              </button>
            ) : (
              <Link
                href={`/trattamenti#${spot.id}`}
                onMouseEnter={() => onPreview(spot.id)}
                onFocus={() => onPreview(spot.id)}
                style={style}
                className={className}
              >
                {spot.label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
