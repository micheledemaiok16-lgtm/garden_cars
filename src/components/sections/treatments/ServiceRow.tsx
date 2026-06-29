"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
  type Variants,
} from "framer-motion";
import type { Treatment } from "@/lib/treatments";
import { cn } from "@/lib/utils";
import { CounterStats } from "./CounterStats";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

// Pannello "wipe" del reveal laterale (Restauro Pelle): copre il media e si
// ritrae verso destra. Usa scaleX (transform), interpolato in modo affidabile.
const maskReveal: Variants = {
  hidden: { scaleX: 1 },
  show: {
    scaleX: 0,
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

export function ServiceRow({
  treatment,
  index,
}: {
  treatment: Treatment;
  index: number;
}) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // index pari → tema scuro + media a sinistra; dispari → chiaro + media a destra.
  const dark = index % 2 === 0;
  const mediaLeft = index % 2 === 0;

  // Lucidatura: il video riempie l'intera banda come sfondo, con il testo
  // sovrapposto (niente colonna media dedicata).
  const isLucidatura = treatment.id === "lucidatura";

  // Parallasse: il media scorre a velocità diversa rispetto al testo.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={sectionRef}
      id={treatment.id}
      className={cn(
        "relative scroll-mt-24 py-24 md:py-32",
        dark ? "bg-ink text-paper" : "bg-paper text-ink",
      )}
    >
      {/* Lucidatura: video di sfondo a tutta banda + velatura per la leggibilità. */}
      {isLucidatura && treatment.media?.type === "video" && (
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <video
            // Zoom + ancoraggio in alto a sinistra: l'angolo in basso a destra
            // (dove sta il watermark Gemini del video) resta sempre fuori campo
            // a qualsiasi proporzione della banda.
            className="h-full w-full scale-125 object-cover object-left-top"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={treatment.media.poster}
            aria-label={treatment.media.alt}
          >
            <source src={treatment.media.src} type="video/mp4" />
          </video>
          {/* Velatura più densa sul lato del testo (sinistra) per il contrasto. */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/70 to-ink/30" />
        </div>
      )}

      {dark && (
        <div className="glow-racing pointer-events-none absolute -left-32 top-1/4 h-[34rem] w-[34rem] opacity-20 blur-3xl" />
      )}

      <div className="wrap relative z-10">
        <div
          className={cn(
            "relative grid items-center gap-10 lg:gap-16",
            !isLucidatura && "lg:grid-cols-2",
            !mediaLeft && !isLucidatura && "lg:[&>*:first-child]:order-2",
          )}
        >
          {/* ---------------- MEDIA ---------------- */}
          {!isLucidatura && (
            <ServiceMedia
              treatment={treatment}
              dark={dark}
              parallaxY={treatment.anim === "parallax" && !reduce ? parallaxY : undefined}
            />
          )}

          {/* ---------------- TESTO ---------------- */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
          >
            <motion.h2
              variants={fadeUp}
              className={cn("display-xl", !dark && "text-ink")}
            >
              <span className="relative inline-block">
                {treatment.title}
                <TitleUnderline
                  reduce={reduce}
                  fromRight={mediaLeft}
                  index={index}
                />
                {/* Bomboletta: ancorata al titolo (angolo in alto a sinistra),
                    così resta sempre nello stesso punto a qualsiasi larghezza. */}
                {treatment.id === "lucidatura" && (
                  <BombolettaDecor reduce={reduce} />
                )}
                {/* Smerigliatrice: stessa logica, ancorata al titolo del
                    Car detailing (angolo in alto a sinistra). */}
                {treatment.id === "car-detailing" && (
                  <SmerigliatriceDecor reduce={reduce} />
                )}
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className={cn(
                "mt-6 max-w-xl text-lg leading-relaxed",
                dark ? "text-paper/70" : "text-ink/70",
              )}
            >
              {treatment.intro}
            </motion.p>

            {/* Contatore animato (Centraline) */}
            {treatment.stats && (
              <motion.div variants={fadeUp} className="mt-9">
                <CounterStats stats={treatment.stats} />
              </motion.div>
            )}

            {/* Chip dei sotto-servizi */}
            <motion.ul
              variants={fadeUp}
              className="mt-8 flex flex-wrap gap-3"
            >
              {treatment.features.map((f) => {
                // Car detailing: i chip "rimbalzano"; tutti si ingrandiscono
                // leggermente al passaggio del mouse.
                const bounce = treatment.anim === "bounce";
                return (
                  <motion.li
                    key={f}
                    whileHover={
                      reduce
                        ? undefined
                        : bounce
                          ? { scale: 1.07, y: -6 }
                          : { scale: 1.07 }
                    }
                    transition={{ type: "spring", stiffness: 420, damping: 14 }}
                    // Colore bordo via style: la regola globale `*` (unlayered)
                    // sovrascriverebbe le utility border-* di Tailwind v4.
                    style={{
                      borderColor: dark
                        ? "rgba(245,244,240,0.28)"
                        : "rgba(10,10,10,0.32)",
                    }}
                    className={cn(
                      "cursor-default rounded-full border px-4 py-2 font-display text-base font-medium",
                      dark ? "text-paper/85" : "text-ink/85",
                    )}
                  >
                    {f}
                  </motion.li>
                );
              })}
            </motion.ul>

            <motion.div variants={fadeUp}>
              <Link href="/#contatti" className="btn btn-primary mt-10">
                Richiedi un preventivo
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sottolineatura "disegnata a mano": un tratto verde (racing-bright)   */
/* leggermente ondulato e inclinato che si scrive da solo quando il     */
/* titolo entra in viewport. Non segue perfettamente il testo, per un   */
/* effetto marcatore anziché il classico underline.                     */
/* ------------------------------------------------------------------ */

// Una variante di tratto per ogni trattamento: forma, inclinazione, spessore e
// larghezza leggermente diversi, così la sottolineatura non è mai identica.
const underlineVariants = [
  // 0 · gentile, quasi diritta
  { d: "M4 15C70 19 140 10 210 13C250 15 280 13 296 11", w: "w-[118%]", rotate: "-rotate-1", stroke: 6 },
  // 1 · ondulata (doppia gobba)
  { d: "M4 13C58 6 116 20 174 12C232 5 274 17 296 10", w: "w-[124%]", rotate: "rotate-1", stroke: 5 },
  // 2 · in salita, marcata
  { d: "M4 18C82 15 150 13 214 9C258 6 284 6 296 5", w: "w-[116%]", rotate: "-rotate-2", stroke: 7 },
  // 3 · rimbalzante
  { d: "M4 12C52 19 104 7 152 14C204 21 252 7 296 13", w: "w-[126%]", rotate: "rotate-2", stroke: 5 },
  // 4 · quasi piatta con piccolo scatto finale
  { d: "M4 14C96 17 188 12 244 14C272 15 288 11 296 13", w: "w-[120%]", rotate: "-rotate-1", stroke: 6 },
];

function TitleUnderline({
  reduce,
  fromRight,
  index,
}: {
  reduce: boolean | null;
  fromRight: boolean;
  index: number;
}) {
  const v = underlineVariants[index % underlineVariants.length];

  // Reveal solo-transform: il tratto pieno cresce con scaleX dal lato giusto.
  // fromRight (testo a destra) → origine a destra, cresce verso sinistra.
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute -bottom-3 left-1/2 h-4 -translate-x-1/2 md:-bottom-4 md:h-6",
        v.w,
        v.rotate,
      )}
    >
      <motion.div
        className="h-full w-full text-racing-bright"
        style={{ transformOrigin: fromRight ? "right center" : "left center" }}
        initial={{ scaleX: reduce ? 1 : 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{
          duration: reduce ? 0 : 0.9,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.2,
        }}
      >
        <svg
          viewBox="0 0 300 22"
          fill="none"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <path
            d={v.d}
            stroke="currentColor"
            strokeWidth={v.stroke}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </motion.div>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Media: video / immagine / placeholder, con hover-zoom e animazione  */
/* dedicata (illuminate, mask, parallax).                              */
/* ------------------------------------------------------------------ */

function ServiceMedia({
  treatment,
  dark,
  parallaxY,
}: {
  treatment: Treatment;
  dark: boolean;
  parallaxY?: MotionValue<string>;
}) {
  const { media, anim, gallery } = treatment;

  // Zoom base del video (taglia la cornice esterna, come l'hero).
  const baseZoom = media?.zoom ? "scale-125" : "scale-100";
  const hoverZoom = media?.zoom
    ? "group-hover:scale-[1.32]"
    : "group-hover:scale-105";

  // Illuminazione all'hover (Lucidatura): media scuro che si accende.
  const illuminate =
    anim === "illuminate"
      ? "brightness-[.55] saturate-[.7] group-hover:brightness-110 group-hover:saturate-125"
      : "";

  return (
    <div className="relative w-full">
    <motion.div
      style={parallaxY ? { y: parallaxY } : undefined}
      className={cn(
        "group relative w-full overflow-hidden rounded-3xl shadow-2xl shadow-black/30 transition-shadow duration-500 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]",
        // Vetri: riquadro più basso (−10% d'altezza), taglia dal basso.
        treatment.id === "trattamento-vetri" ? "aspect-[40/27]" : "aspect-[4/3]",
        dark ? "ring-1 ring-white/10" : "ring-1 ring-ink/10",
      )}
    >
      {/* Reveal a maschera laterale: un pannello copre il media e si ritrae in
          scroll (scaleX, transform affidabile). Il media resta sempre presente. */}
      {anim === "mask" && (
        <motion.div
          aria-hidden
          variants={maskReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className={cn(
            "absolute inset-0 z-10 origin-right",
            dark ? "bg-ink" : "bg-paper",
          )}
        />
      )}

      {anim === "counter" && media ? (
        // Centraline: foto che riempie tutto il riquadro (object-cover) con
        // leggero zoom all'hover + targhetta "Officina certificata Master Tuning".
        <>
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <MasterTuningBadge />
        </>
      ) : gallery ? (
        <Collage images={gallery} />
      ) : !media ? (
        <Placeholder />
      ) : media.type === "video" ? (
        <video
          className={cn(
            "h-full w-full object-cover transition-all duration-700 ease-out",
            baseZoom,
            hoverZoom,
            illuminate,
          )}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={media.poster}
          aria-label={media.alt}
        >
          <source src={media.src} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={cn(
            "object-cover transition-all duration-700 ease-out",
            // Vetri: zoom del 10% (ritaglia bordi e watermark) e ancoraggio in
            // alto, così la riduzione d'altezza taglia dal basso.
            treatment.id === "trattamento-vetri"
              ? "scale-[1.1] object-top group-hover:scale-[1.15]"
              : hoverZoom,
            illuminate,
          )}
        />
      )}
    </motion.div>

    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Targhetta "Officina certificata Master Tuning".                     */
/* Ripropone il look del biglietto da visita del partner: piastrina    */
/* argento metallizzato, "MASTER" cromato scuro e "TUNING" rosso in     */
/* corsivo, con spunta di certificazione. Ancorata in basso a destra    */
/* della foto della centralina. Puramente decorativa.                   */
/* ------------------------------------------------------------------ */
function MasterTuningBadge() {
  return (
    <a
      href="https://www.mastertuning.it/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Officina certificata Master Tuning — vai al sito ufficiale"
      className="absolute bottom-3 right-3 z-20 transition-transform duration-300 hover:scale-105 md:bottom-4 md:right-4"
    >
      <div className="flex items-center gap-2.5 rounded-xl border border-white/70 bg-gradient-to-br from-zinc-100 via-white to-zinc-300 px-3 py-2 shadow-lg shadow-black/40 ring-1 ring-black/10">
        {/* Spunta di certificazione */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-inner shadow-black/30">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-white" aria-hidden>
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="leading-none">
          <span className="block font-display text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Officina certificata
          </span>
          <span className="mt-1 block font-display text-sm font-extrabold italic leading-none tracking-tight">
            <span className="bg-gradient-to-b from-zinc-500 via-zinc-700 to-zinc-950 bg-clip-text text-transparent">
              MASTER
            </span>
            <span className="bg-gradient-to-b from-red-500 to-red-700 bg-clip-text text-transparent">
              {" "}
              TUNING
            </span>
          </span>
        </span>
      </div>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Decorazioni Lucidatura (bomboletta + smerigliatrice).               */
/* Ancorate alla griglia a 2 colonne con offset/dimensioni in unità    */
/* fluide (clamp + vw + percentuali), così mantengono la stessa        */
/* posizione relativa su qualsiasi schermo (1366 → 2K e oltre) senza   */
/* sbordare. Nascoste sotto `lg`, dove il layout diventa a colonna     */
/* singola. Puramente decorative.                                      */
/* ------------------------------------------------------------------ */
// Bomboletta: figlia del titolo (span `relative inline-block`), ancorata
// all'angolo in alto a sinistra. `bottom-full` la appoggia sopra il titolo;
// le translate la fanno scendere/spostare per sfiorare la prima lettera.
// Dimensione costante in rem così l'offset dal titolo non deriva al variare
// della larghezza. Solo da lg in su. Decorativa.
// "Sbattuta" realistica: scossa rapida e decadente su più assi con wobble
// attorno alla base; loop che riparte ogni 2,5s.
function BombolettaDecor({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute bottom-full left-0 -ml-[12px] -mb-[65px] z-20 hidden aspect-square w-[16rem] origin-bottom -translate-x-[34%] translate-y-[24%] lg:block xl:w-[18rem] 2xl:-ml-[85px]"
      initial={{ opacity: 0 }}
      whileInView={{
        opacity: 1,
        x: reduce ? 0 : [0, 5, -4, 6, -4, 3, -2, 1, 0],
        y: reduce ? 0 : [0, -20, 15, -24, 17, -12, 7, -3, 0],
        rotate: reduce ? 0 : [0, -3.5, 3, -4, 3, -2, 1, -0.5, 0],
      }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{
        duration: 0.95,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 1.8,
        opacity: { duration: 0.4, repeat: 0 },
      }}
    >
      <Image
        src="/trattamenti/trattamento-vetri/bomboletta.png"
        alt=""
        fill
        sizes="(max-width: 1024px) 0px, 21rem"
        className="rotate-[20deg] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.45)]"
      />
    </motion.div>
  );
}

// Smerigliatrice: ancorata al titolo del Car detailing (angolo in alto a
// sinistra), come la bomboletta. `bottom-full left-0` la appoggia sopra il
// titolo; le translate la portano sopra-sinistra a sfiorare la prima lettera.
// Offset forte a sinistra solo da 2xl in su (dove c'è margine), ridotto sotto
// per non farla sbordare. Solo da lg in su. Decorativa.
// Simula l'utensile IN FUNZIONE: vibrazione lenta e continua a bassa ampiezza.
function SmerigliatriceDecor({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute bottom-full left-0 z-20 hidden aspect-[150/78] w-[clamp(6.4rem,10.4vw,10.4rem)] origin-bottom -translate-x-[24%] translate-y-[9%] lg:block 2xl:-translate-x-[79%]"
      initial={{ opacity: 0 }}
      whileInView={{
        opacity: 1,
        x: reduce ? 0 : [0, -1, 1.1, -0.9, 1.2, -1, 0],
        y: reduce ? 0 : [0, 1.1, -0.9, 1.2, -1, 0.9, 0],
        rotate: reduce ? 0 : [0, -0.6, 0.5, -0.65, 0.5, -0.55, 0],
      }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{
        duration: 0.7,
        ease: "easeInOut",
        repeat: Infinity,
        opacity: { duration: 0.4, repeat: 0 },
      }}
    >
      <Image
        src="/trattamenti/lucidatura/smerigliatrice.png"
        alt=""
        fill
        sizes="(max-width: 1024px) 0px, 13rem"
        className="-scale-x-100 rotate-[12deg] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.45)]"
      />
    </motion.div>
  );
}

/** Collage a 3 immagini: tile alto a sinistra + due impilate a destra. */
function Collage({ images }: { images: { src: string; alt: string }[] }) {
  const [a, b, c] = images;
  const tile =
    "group/tile relative overflow-hidden rounded-2xl ring-1 ring-white/10";
  const img =
    "object-cover transition-transform duration-700 ease-out group-hover/tile:scale-105";
  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2">
      <div className={cn(tile, "row-span-2")}>
        <Image
          src={a.src}
          alt={a.alt}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          className={img}
        />
      </div>
      <div className={tile}>
        <Image
          src={b.src}
          alt={b.alt}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          className={img}
        />
      </div>
      <div className={tile}>
        <Image
          src={c.src}
          alt={c.alt}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          className={img}
        />
      </div>
    </div>
  );
}

/** Placeholder elegante per i servizi il cui video deve ancora arrivare. */
function Placeholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-graphite via-ink to-racing-deep">
      <div className="glow-racing pointer-events-none absolute inset-0 opacity-30 blur-2xl" />
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-racing-bright/40 bg-ink/40 backdrop-blur-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-7 w-7 text-racing-bright"
          aria-hidden
        >
          <path
            d="M8 5v14l11-7L8 5z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="relative font-display text-sm font-medium uppercase tracking-widest text-paper/60">
        Video in arrivo
      </span>
    </div>
  );
}
