"use client";

import { useState, type FocusEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { treatments, type Treatment } from "@/lib/treatments";
import { carZones, DEFAULT_ZONE_ID } from "@/lib/carZones";
import { cn } from "@/lib/utils";

// Sorgente immagine + aspetto del cutout (bounding box 2000×1115).
const CAR_SRC = "/home/nuovaautomodello-cutout.webp";
const CAR_ALT =
  "Spaccato tecnico di un SUV: motore, abitacolo, interni e carrozzeria in vista";
const CAR_ASPECT = "2000 / 1115";

function treatmentById(id: string): Treatment {
  return treatments.find((t) => t.id === id) ?? treatments[0];
}

/**
 * Sezione homepage "Anatomia di un'auto": l'utente passa (desktop) o tocca
 * (mobile, via ZoneNav) le parti dell'auto e viene rimandato direttamente alla
 * sezione del servizio sulla pagina /trattamenti. Niente descrizioni: solo il
 * nome del servizio e il link diretto. Geometria in carZones.ts.
 */
export default function CarExplorer() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(DEFAULT_ZONE_ID);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const active = treatmentById(activeId);

  // hover/focus su una zona: evidenzia il servizio nel pannello (activeId, che
  // non si svuota mai) e attiva l'isolamento della parte sull'auto (focusedId).
  const preview = (id: string) => {
    setActiveId(id);
    setFocusedId(id);
    setTouched(true);
  };

  // uscita di mouse/focus dall'area: l'auto torna intera (il pannello resta).
  const endPreview = () => setFocusedId(null);

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
              Passa sulle diverse parti dell&apos;auto e vai dritto al
              trattamento che ti interessa.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid items-center gap-8 lg:mt-16 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <CarStage
            activeId={activeId}
            focusedId={focusedId}
            onPreview={preview}
            onEndPreview={endPreview}
            reduce={reduce}
            showHint={!touched}
          />
          <ServicePanel treatment={active} reduce={reduce} />
        </div>

        <ZoneNav
          activeId={activeId}
          onPreview={preview}
          onEndPreview={endPreview}
        />
      </div>
    </section>
  );
}

/* --------------------------- Palco auto + hotspot --------------------------- */

function CarStage({
  activeId,
  focusedId,
  onPreview,
  onEndPreview,
  reduce,
  showHint,
}: {
  activeId: string;
  focusedId: string | null;
  onPreview: (id: string) => void;
  onEndPreview: () => void;
  reduce: boolean | null;
  showHint: boolean;
}) {
  const activeZone = carZones.find((z) => z.id === activeId) ?? carZones[0];

  // L'isolamento si attiva solo se la zona sotto mouse/focus ha un ritaglio
  // dedicato (`part`); altrimenti l'auto resta intera (comportamento storico).
  const focusedZone = focusedId
    ? carZones.find((z) => z.id === focusedId)
    : null;
  const isolating = Boolean(focusedZone?.part);
  const isoTransition = reduce
    ? undefined
    : "opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)";

  // Pulisce il focus solo quando mouse/focus lasciano davvero l'intera area
  // (non mentre ci si sposta tra un hotspot e l'altro).
  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      onEndPreview();
    }
  };

  return (
    <div
      className="relative w-full select-none"
      style={{ aspectRatio: CAR_ASPECT }}
      onMouseLeave={onEndPreview}
      onBlur={handleBlur}
    >
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
        // Sfuma il fondo per nascondere la pedana chiara. In isolamento l'auto
        // intera scende a fantasma (~10%) lasciando in evidenza il livello parte.
        style={{
          maskImage: "linear-gradient(to bottom, #000 84%, transparent 99%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 84%, transparent 99%)",
          opacity: isolating ? 0.1 : 1,
          transition: isoTransition,
        }}
      />

      {/* livelli "parte": un ritaglio trasparente per ogni zona che ne ha uno.
          Decorativi e non cliccabili: gli hotspot restano sopra e attivabili. */}
      {carZones.map((zone) =>
        zone.part ? (
          <Image
            key={`part-${zone.id}`}
            src={zone.part}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="pointer-events-none object-contain"
            style={{
              maskImage: "linear-gradient(to bottom, #000 84%, transparent 99%)",
              WebkitMaskImage: "linear-gradient(to bottom, #000 84%, transparent 99%)",
              opacity: focusedId === zone.id ? 1 : 0,
              transition: isoTransition,
            }}
          />
        ) : null,
      )}

      {/* spotlight verde che segue la zona attiva (additivo sull'auto) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[42%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--color-racing-bright) 55%, transparent), transparent)",
          mixBlendMode: "screen",
        }}
        animate={{ left: `${activeZone.point.x}%`, top: `${activeZone.point.y}%`, opacity: isolating ? 0 : 1 }}
        transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* hotspot: link diretti alla sezione del servizio su /trattamenti */}
      {carZones.map((zone) => {
        const isActive = zone.id === activeId;
        const t = treatmentById(zone.id);
        return (
          <Link
            key={zone.id}
            href={`/trattamenti#${zone.id}`}
            onMouseEnter={() => onPreview(zone.id)}
            onFocus={() => onPreview(zone.id)}
            aria-label={`Vai al servizio ${t.title}`}
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
          </Link>
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
  onPreview: (id: string) => void;
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
      {carZones.map((zone) => {
        const isActive = zone.id === activeId;
        return (
          <li key={zone.id}>
            <Link
              href={`/trattamenti#${zone.id}`}
              onMouseEnter={() => onPreview(zone.id)}
              onFocus={() => onPreview(zone.id)}
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
              {zone.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
