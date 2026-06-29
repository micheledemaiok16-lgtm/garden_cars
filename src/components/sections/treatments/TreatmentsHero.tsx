"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { treatments } from "@/lib/treatments";

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

// Menu laterale: ogni voce entra da sinistra a cascata.
const navContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.35 } },
};
const navItem: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function TreatmentsHero() {
  const reduce = useReducedMotion();

  return (
    <section className="cine-vignette relative flex h-[100svh] min-h-[600px] items-center overflow-hidden pt-24 md:pt-28">
      {/* Sfondo: foto vetrina, leggermente sfocata. Una velatura sul lato del
          testo (destra) garantisce il contrasto. La scala >100% evita che la
          sfocatura scopra i bordi del riquadro. */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/trattamenti/nuovaherotrattamenti.png"
          alt="Showroom Garden's Cars: una Fiat 500 e una Vespa d'epoca davanti al logo"
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover blur-[7px]"
        />
        {/* Velatura per leggibilità del testo (più densa a destra) */}
        <div className="absolute inset-0 bg-gradient-to-l from-ink/85 via-ink/45 to-ink/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30" />
      </div>

      {/* Glow racing green */}
      <div className="glow-racing pointer-events-none absolute -right-40 top-1/3 -z-10 h-[40rem] w-[40rem] opacity-40 blur-3xl" />

      {/* Freccia "Indietro": torna alla home. In alto a sinistra, sotto la
          navbar, allineata col menu dei trattamenti. */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-[6%] top-28 z-20 md:top-32"
      >
        <Link
          href="/"
          aria-label="Torna alla home"
          className="group flex items-center gap-2.5 text-paper/75 transition-colors hover:text-racing-bright"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-paper/25 transition-colors group-hover:ring-racing-bright">
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5"
            >
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-display text-sm font-semibold uppercase tracking-widest">
            Indietro
          </span>
        </Link>
      </motion.div>

      {/* Menu laterale dei trattamenti: link diretti alle sezioni della pagina.
          Solo da lg in su (su mobile si usa il menu "Trattamenti" della navbar). */}
      <motion.nav
        variants={navContainer}
        initial="hidden"
        animate="show"
        aria-label="Trattamenti"
        className="absolute left-[6%] top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
      >
        <motion.span
          variants={navItem}
          className="eyebrow mb-2 text-it-red"
          style={{
            fontSize: "1.2rem",
            fontWeight: 900,
            WebkitTextStroke: "0.6px #cd212a",
          }}
        >
          I trattamenti
        </motion.span>
        {treatments.map((t) => (
          <motion.div key={t.id} variants={navItem}>
            <Link
              href={`#${t.id}`}
              className="group flex items-center gap-3 py-1"
            >
              <span className="h-px w-6 bg-paper/30 transition-all duration-300 group-hover:w-10 group-hover:bg-racing-bright" />
              <span className="font-display text-2xl font-bold text-paper/85 transition-colors duration-300 group-hover:text-racing-bright xl:text-3xl">
                {t.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.nav>

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
            style={{ fontSize: "0.864rem" }}
          >
            Cura, protezione, performance
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="display-hero mt-5"
            style={{ fontSize: "clamp(1.1rem, 6vw, 5rem)" }}
          >
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
