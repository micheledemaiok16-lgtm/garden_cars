"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

// Fade-in Up: il testo appare dal basso sfumando.
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

export function TreatmentsHero() {
  const reduce = useReducedMotion();

  return (
    <section className="cine-vignette relative flex h-[100svh] min-h-[600px] items-center overflow-hidden pt-24 md:pt-28">
      {/* Sfondo video: scalato al 125% così la cornice esterna del video
          (il 20% sui bordi) resta fuori campo e si vede solo l'80% centrale. */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video
          className="h-full w-full -scale-x-125 scale-y-125 object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        >
          <source src="/trattamenti/hero.mp4" type="video/mp4" />
        </video>
        {/* Overlay per leggibilità del testo */}
        <div className="absolute inset-0 bg-gradient-to-l from-ink/90 via-ink/55 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
      </div>

      {/* Glow racing green */}
      <div className="glow-racing pointer-events-none absolute -right-40 top-1/3 -z-10 h-[40rem] w-[40rem] opacity-40 blur-3xl" />

      {/* Logo Garden's Cars — identico alla home, qui a sinistra (testo a destra) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute left-[7%] top-1/2 hidden -translate-y-1/2 flex-col items-center gap-5 text-center lg:flex"
      >
        <span className="relative h-44 w-44 overflow-hidden rounded-full ring-2 ring-racing-bright/50 xl:h-56 xl:w-56">
          <Image
            src="/brand/logo.jpg"
            alt="Garden Cars"
            fill
            sizes="224px"
            className="object-cover"
          />
        </span>
        <span className="font-logo -skew-x-6 text-2xl font-normal text-paper xl:text-3xl">
          GARDEN&apos;S <span className="text-racing-bright">CARS</span>
        </span>
        <span className="tricolore-line h-[3px] w-20 rounded-full" />
      </motion.div>

      {/* Contenuto testuale: entra in Fade-in Up al caricamento della pagina */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="wrap relative flex w-full justify-end"
      >
        <div className="max-w-3xl text-right">
          <motion.span
            variants={fadeUp}
            className="eyebrow text-racing-bright"
          >
            Cura, protezione, performance
          </motion.span>

          <motion.h1 variants={fadeUp} className="display-hero mt-5">
            Ogni dettaglio fa la{" "}
            <span className="text-racing-bright">differenza.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="ml-auto mt-7 max-w-xl text-lg leading-relaxed text-paper/80"
          >
            Dalla lucidatura a specchio al restauro degli interni, dalle
            pellicole protettive alla rimappatura del motore: ogni intervento
            riporta la tua auto al massimo del suo valore, dentro e fuori.
          </motion.p>

          {/* Indice rapido → ancore dei trattamenti in questa pagina */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-end gap-4"
          >
            <a href="#lucidatura" className="btn btn-primary">
              Scopri i trattamenti
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="eyebrow text-paper/50">Scorri</span>
        <span className="relative flex h-10 w-6 justify-center rounded-full border border-paper/30">
          <motion.span
            className="mt-2 h-2 w-1 rounded-full bg-racing-bright"
            animate={reduce ? undefined : { y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
