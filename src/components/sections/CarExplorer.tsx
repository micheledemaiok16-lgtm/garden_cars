"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { treatments, type Treatment } from "@/lib/treatments";
import { carSpots, type TreatmentId } from "@/lib/carSpots";
import { getReveal, reveals } from "@/lib/carReveal";
import { cn } from "@/lib/utils";
import { useAllowHeavyPreload } from "@/lib/useMediaQuery";
import Car360 from "./Car360";
import CarDoorReveal from "./CarDoorReveal";

function treatmentById(id: string): Treatment {
  return treatments.find((t) => t.id === id) ?? treatments[0];
}

// Servizio/angolo di partenza: Carrozzeria (lucidatura), così il pannello non è
// mai vuoto e l'auto parte su un tre quarti gradevole.
const INITIAL = carSpots.find((s) => s.id === "lucidatura") ?? carSpots[0];

/**
 * Sezione homepage "Esplora i servizi": l'Audi nera gira in un video in loop
 * (Car360), passivo — non si trascina più. Il click su una voce della ZoneNav
 * evidenzia il servizio nel pannello e, se quel servizio ha un reveal, lo apre:
 * lo spin svanisce (`spinDimmed`) mentre il reveal compare, e riappare quando il
 * reveal si è richiuso. Config dei reveal in carReveal.ts.
 */
export default function CarExplorer() {
  const reduce = useReducedMotion();
  // Su mobile/rete lenta i fotogrammi dei reveal (~15 MB in sei) si scaricano
  // solo all'apertura. Dove la banda c'è li precarichiamo, ma non prima che la
  // sezione si avvicini: partendo subito ruberebbero rete all'hero, che è ciò
  // che l'utente sta guardando davvero.
  const allowHeavy = useAllowHeavyPreload();
  const [stageNear, setStageNear] = useState(false);
  const eagerPreload = allowHeavy && stageNear;

  // `openId` = reveal attualmente aperto (null = nessuno). `spinDimmed` = il
  // video dello spin è svanito. Sono stati DISTINTI perché la chiusura di un
  // reveal ha una coda (lo scrub a ritroso, closeMs): lo spin deve restare
  // nascosto finché il reveal non è tornato al frame 0 — lo dice `onDoorClosed`.
  const [activeId, setActiveId] = useState<string>(INITIAL.id);
  const [openId, setOpenId] = useState<TreatmentId | null>(null);
  const [spinDimmed, setSpinDimmed] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);

  const active = treatmentById(activeId);

  const onDoorClosed = () => {
    // Switch diretto tra reveal (es. Interni→Motore): quando il vecchio finisce
    // di chiudersi il nuovo è già in scena — lo spin deve restare nascosto.
    if (openId !== null) return;
    setSpinDimmed(false);
  };

  // CLICK su una voce (unica via di attivazione: niente hover-preview): apre il
  // reveal, o lo richiude se era già aperto. Se era aperto un ALTRO reveal, si
  // richiude da sé (open → false) mentre il nuovo compare.
  const activateReveal = (id: TreatmentId) => {
    setActiveId(id);
    if (!getReveal(id)) return;
    if (openId === id) {
      setOpenId(null); // spinDimmed resta true finché onDoorClosed non lo spegne
      return;
    }
    setOpenId(id);
    setSpinDimmed(true);
  };

  // Prossimità della sezione: sblocca il precarico dei reveal (una volta sola).
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setStageNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStageNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // "Clicca fuori" per chiudere: press fuori dal palco e fuori dalla nav.
  useEffect(() => {
    if (openId === null) return;
    const onDown = (e: globalThis.PointerEvent) => {
      const t = e.target as Node;
      if (stageRef.current?.contains(t)) return;
      if (navRef.current?.contains(t)) return; // interazioni nav gestite dai loro handler
      setOpenId(null);
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
                Scegli un trattamento e guardalo all&apos;opera sull&apos;auto.
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
            <Car360 reduce={reduce} dimmed={spinDimmed}>
              {/* Un overlay per reveal, sempre montati: ognuno apre/chiude in
                  autonomia (openId) e a riposo non consuma nulla (loop rAF
                  spento, fotogrammi non precaricati se non eagerPreload). */}
              {reveals.map((r) => (
                <CarDoorReveal
                  key={r.id}
                  revealId={r.id}
                  open={openId === r.id}
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
