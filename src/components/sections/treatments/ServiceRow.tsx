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
import { Tachometer } from "./Tachometer";

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
      {dark && (
        <div className="glow-racing pointer-events-none absolute -left-32 top-1/4 h-[34rem] w-[34rem] opacity-20 blur-3xl" />
      )}

      <div className="wrap relative">
        <div
          className={cn(
            "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
            !mediaLeft && "lg:[&>*:first-child]:order-2",
          )}
        >
          {/* ---------------- MEDIA ---------------- */}
          <ServiceMedia
            treatment={treatment}
            dark={dark}
            parallaxY={treatment.anim === "parallax" && !reduce ? parallaxY : undefined}
          />

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
              {treatment.title}
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
                const chip = (
                  <span
                    className={cn(
                      "inline-block rounded-full border px-4 py-2 font-display text-sm font-medium",
                      dark
                        ? "border-white/15 text-paper/80"
                        : "border-ink/15 text-ink/80",
                    )}
                  >
                    {f}
                  </span>
                );
                // Car detailing: i chip "rimbalzano" dolcemente all'hover.
                return treatment.anim === "bounce" ? (
                  <motion.li
                    key={f}
                    whileHover={reduce ? undefined : { y: -6 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 12,
                    }}
                  >
                    {chip}
                  </motion.li>
                ) : (
                  <li key={f}>{chip}</li>
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
    <motion.div
      style={parallaxY ? { y: parallaxY } : undefined}
      className={cn(
        "group relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-2xl shadow-black/30 transition-shadow duration-500 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]",
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

      {anim === "counter" ? (
        <Tachometer />
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
            hoverZoom,
            illuminate,
          )}
        />
      )}
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
