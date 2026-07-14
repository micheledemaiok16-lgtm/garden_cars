"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { treatments, type Treatment } from "@/lib/treatments";
import { carSpots, type TreatmentId } from "@/lib/carSpots";
import { frameDistance } from "@/lib/carSpin";
import { getReveal, reveals } from "@/lib/carReveal";
import { cn } from "@/lib/utils";
import { useAllowHeavyPreload } from "@/lib/useMediaQuery";
// TEMP: Car360 (video+WebP) al posto di Car3D per valutare la rigenerazione
// degli asset — vedi Car3D per lo stage 3D. Ripristinare Car3D a valutazione fatta.
import Car360 from "./Car360";
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
  // Su mobile/rete lenta i fotogrammi dei reveal (~15 MB in sei) si scaricano
  // solo all'apertura, non all'ingresso in pagina.
  const eagerPreload = useAllowHeavyPreload();

  // `targetFrame` = angolo verso cui l'auto ruota dolcemente (null = riposo /
  // auto-rotazione). `openId` = reveal attualmente aperto (null = nessuno);
  // `doorInstant` = chiusura secca (drag). `armingRef` = reveal in attesa che
  // la rotazione raggiunga la sua ancora: apri all'arrivo.
  const [targetFrame, setTargetFrame] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string>(INITIAL.id);
  const [touched, setTouched] = useState(false);
  const [openId, setOpenId] = useState<TreatmentId | null>(null);
  const [doorInstant, setDoorInstant] = useState(false);
  const armingRef = useRef<TreatmentId | null>(null);
  const currentFrameRef = useRef<number>(INITIAL.anchorFrame);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);

  const active = treatmentById(activeId);

  // Chiusura del reveal: graceful (reverse dello scrub) o instant (drag).
  const requestClose = (mode: "graceful" | "instant") => {
    armingRef.current = null;
    setDoorInstant(mode === "instant");
    setOpenId(null); // targetFrame resta sull'ancora finché onDoorClosed non ripristina
  };
  const onDoorClosed = () => {
    setDoorInstant(false);
    // Switch diretto tra reveal (es. Interni→Motore): quando il vecchio finisce
    // di chiudersi il nuovo è già aperto/armato — la SUA ancora deve restare.
    if (openId !== null || armingRef.current) return;
    setTargetFrame(null); // riprende l'auto-rotazione dall'ancora
  };

  // CLICK su una voce (unica via di attivazione: niente hover-preview): ruota
  // all'ancora e poi apri; se già aperto, richiudi. Se era aperto un ALTRO
  // reveal, si richiude da sé (open → false).
  const activateReveal = (id: TreatmentId) => {
    setActiveId(id);
    setTouched(true);
    const reveal = getReveal(id);
    if (!reveal) return;
    if (openId === id) {
      requestClose("graceful");
      return;
    }
    setDoorInstant(false);
    setTargetFrame(reveal.anchorFrame);
    // Se l'auto è GIÀ all'ancora, apri subito: handleFrame non scatterebbe
    // perché il fotogramma non cambia più. Altrimenti arma e apri quando la
    // rotazione raggiunge l'ancora.
    if (Math.abs(frameDistance(currentFrameRef.current, reveal.anchorFrame)) < 1.5) {
      armingRef.current = null;
      setOpenId(id);
    } else {
      armingRef.current = id;
      if (openId !== null) setOpenId(null);
    }
  };

  // L'utente affronta l'auto (drag/press): chiudi subito e passa al trascinamento.
  const handleGrab = () => {
    if (openId !== null || armingRef.current) requestClose("instant");
    armingRef.current = null;
    setTargetFrame(null);
    setTouched(true);
  };

  // Frame report dallo spin: quando la rotazione raggiunge l'ancora del reveal
  // armato, aprilo. Non salva il fotogramma (nessun consumatore → niente
  // re-render 60/s).
  const handleFrame = (f: number) => {
    currentFrameRef.current = f;
    const arming = armingRef.current;
    if (!arming) return;
    const anchor = getReveal(arming)?.anchorFrame;
    if (anchor !== undefined && Math.abs(frameDistance(f, anchor)) < 1.5) {
      armingRef.current = null;
      setOpenId(arming);
    }
  };

  // "Clicca fuori" per chiudere: press fuori dal palco e fuori dalla nav.
  useEffect(() => {
    if (openId === null) return;
    const onDown = (e: globalThis.PointerEvent) => {
      const t = e.target as Node;
      if (stageRef.current?.contains(t)) return; // press sull'auto: lo gestisce handleGrab
      if (navRef.current?.contains(t)) return; // interazioni nav gestite dai loro handler
      requestClose("graceful");
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [openId]);

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
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
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
              <h2 className="display-xl mt-5">Un&apos;auto, sei trattamenti.</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-paper/70">
                Trascina per ruotare l&apos;auto e vai dritto al trattamento che
                ti interessa.
              </p>
            </Reveal>
          </div>

          {/* CTA verso la pagina trattamenti: in alto a destra della sezione
              su desktop, sotto l'header su mobile. */}
          <Reveal delay={0.1}>
            <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end lg:text-right">
              <p className="font-display text-base text-paper/70">
                Scopri la nostra sezione trattamenti
              </p>
              <a href="/trattamenti" className="btn btn-ghost">
                Trattamenti
              </a>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid items-center gap-8 lg:mt-16 lg:grid-cols-[1.75fr_0.9fr] lg:gap-10">
          <div ref={stageRef}>
            <Car360
              initialFrame={INITIAL.anchorFrame}
              targetFrame={targetFrame}
              reduce={reduce}
              onFrameChange={handleFrame}
              onGrab={handleGrab}
              showHint={!touched}
            >
              {/* Un overlay per reveal, sempre montati: ognuno apre/chiude in
                  autonomia (openId) e a riposo non consuma nulla (loop rAF
                  spento, fotogrammi non precaricati se non eagerPreload). */}
              {reveals.map((r) => (
                <CarDoorReveal
                  key={r.id}
                  revealId={r.id}
                  open={openId === r.id}
                  instant={doorInstant}
                  reduce={reduce}
                  eagerPreload={eagerPreload}
                  onClosed={onDoorClosed}
                />
              ))}
            </Car360>
          </div>
          <ServicePanel treatment={active} reduce={reduce} />
        </div>

        <ZoneNav
          activeId={activeId}
          openId={openId}
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
  onActivate,
  navRef,
}: {
  activeId: string;
  openId: string | null;
  onActivate: (id: TreatmentId) => void;
  navRef: React.RefObject<HTMLUListElement | null>;
}) {
  return (
    <ul
      ref={navRef}
      className="mt-10 flex flex-wrap justify-center gap-2.5 lg:mt-12"
    >
      {carSpots.map((spot) => {
        const isActive = spot.id === activeId;
        // Le voci con un reveal ("Interni", "Motore") aprono l'animazione
        // invece di navigare: sono <button>. Le altre restano link diretti.
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
                aria-expanded={openId === spot.id}
                style={style}
                className={className}
              >
                {spot.label}
              </button>
            ) : (
              <Link
                href={`/trattamenti#${spot.id}`}
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
