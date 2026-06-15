"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollWheel } from "@/components/ui/ScrollWheel";

export default function CraftBand() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section
      ref={ref}
      id="pelli"
      className="cine-vignette relative flex min-h-[80svh] items-center overflow-hidden bg-ink pt-28 pb-16"
    >
      {/* Video di sfondo (immagine statica con reduced-motion) */}
      <motion.div
        style={reduce ? undefined : { y: videoY }}
        className="absolute inset-0 -z-10 scale-110"
      >
        {reduce ? (
          <Image
            src="/generated/lucidatura-macro.webp"
            alt="Lucidatura della carrozzeria"
            fill
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/generated/lucidatura-macro.webp"
            aria-hidden
          >
            <source src="/generated/lucidatura.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/45 to-transparent" />
      </motion.div>

      {/* Ruota che gira sullo scroll */}
      <ScrollWheel
        className="absolute -right-24 top-1/2 hidden -translate-y-1/2 md:block"
        size={560}
        spin={620}
        opacity={0.85}
      />

      <div className="wrap relative">
        <Reveal>
          <span className="eyebrow text-racing-bright">Trattamento pelli e sedili</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-xl mt-5 max-w-3xl">
            Cura maniacale.
            <br />
            Risultato che si sente.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/80">
            Ogni vettura che esce dal nostro salone passa per mani esperte:
            carrozzeria lucidata a specchio, interni rigenerati, dettagli
            curati uno a uno. Perché un&apos;auto non si vende, si consegna.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
