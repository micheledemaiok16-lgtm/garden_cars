"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const lineUp: Variants = {
  hidden: { y: "110%" },
  show: { y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  // Con reduced-motion non c'è video (quindi nessun "ended"): mostra subito lo
  // stato finale derivandolo dall'hook, senza setState dentro l'effect.
  const shown = revealed || !!reduce;

  useEffect(() => {
    if (reduce) return;
    // Fallback: se il video non emette "ended" (es. bloccato), sfoca comunque
    const t = setTimeout(() => setRevealed(true), 8000);
    return () => clearTimeout(t);
  }, [reduce]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="cine-vignette relative flex h-[100svh] min-h-[640px] items-center overflow-hidden pt-24 md:pt-28"
    >
      {/* Sfondo: video del reveal (telo) → poi sfuma. Statico con reduced-motion. */}
      <motion.div
        style={reduce ? undefined : { y: bgY }}
        animate={{
          filter: shown
            ? "blur(7px) brightness(0.5)"
            : "blur(0px) brightness(1)",
          scale: shown ? 1.15 : 1.1,
        }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 -z-10"
      >
        {reduce ? (
          <Image
            src="/generated/covered-garage.png"
            alt="Auto nello showroom Garden Cars a Giffoni Valle Piana"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            playsInline
            preload="auto"
            poster="/generated/covered-garage.png"
            aria-hidden
            onEnded={() => setRevealed(true)}
            onError={() => setRevealed(true)}
          >
            <source src="/generated/reveal.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/45 to-ink/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30" />
      </motion.div>

      {/* Glow racing green */}
      <div className="glow-racing pointer-events-none absolute -left-40 top-1/3 -z-10 h-[40rem] w-[40rem] opacity-40 blur-3xl" />

      {/* Logo che compare a destra a fine video, nello spazio libero */}
      <AnimatePresence>
        {shown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={reduce ? undefined : { opacity: fade }}
            className="pointer-events-none absolute right-[7%] top-1/2 hidden -translate-y-1/2 flex-col items-center gap-5 text-center lg:flex"
          >
            <span className="relative h-44 w-44 overflow-hidden rounded-full ring-2 ring-racing-bright/50 xl:h-56 xl:w-56">
              <Image src="/brand/logo.jpg" alt="Garden Cars" fill sizes="224px" className="object-cover" />
            </span>
            <span className="font-logo -skew-x-6 text-2xl font-normal text-paper xl:text-3xl">
              GARDEN&apos;S <span className="text-racing-bright">CARS</span>
            </span>
            <span className="tricolore-line h-[3px] w-20 rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenuto testuale: SEMPRE presente (entra al caricamento) */}
      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: fade }}
        className="wrap relative w-full"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-2xl"
        >
          <motion.div variants={fadeUp} className="mb-7 flex items-center gap-4">
            <span className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-racing-bright/40 lg:hidden">
              <Image src="/brand/logo.jpg" alt="Garden Cars" fill sizes="48px" className="object-cover" />
            </span>
            <span className="eyebrow text-racing-bright">
              Giffoni Valle Piana · Salerno
            </span>
          </motion.div>

          <h1 className="display-hero">
            <Line variant={lineUp}>Passione</Line>
            <Line variant={lineUp}>
              su <span className="text-racing-bright">quattro</span>
            </Line>
            <Line variant={lineUp}>ruote.</Line>
          </h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-xl text-lg leading-relaxed text-paper/80"
          >
            Auto nuove e usate selezionate e trattamenti professionali — dalla pelle
            al detailing — per riportare ogni vettura al suo splendore. Benvenuto in
            Garden Cars.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#auto" className="btn btn-primary">
              Scopri le auto
            </a>
            <a href="#pelli" className="btn btn-ghost">
              Trattamento pelli
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={reduce ? undefined : { opacity: fade }}
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

function Line({ children, variant }: { children: React.ReactNode; variant: Variants }) {
  return (
    <span className="block overflow-hidden">
      <motion.span variants={variant} className="block">
        {children}
      </motion.span>
    </span>
  );
}
