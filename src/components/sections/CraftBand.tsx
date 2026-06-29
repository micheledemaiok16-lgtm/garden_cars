"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

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
      className="cine-vignette relative flex min-h-[52svh] items-center justify-center overflow-hidden bg-ink py-20 text-center md:py-28"
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
        <div className="absolute inset-0 bg-ink/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/30 to-ink/70" />
      </motion.div>

      <div className="wrap relative flex flex-col items-center">
        <Reveal>
          <span className="eyebrow text-racing-bright">Trattamento pelli e sedili</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-lg mt-5 max-w-2xl text-balance text-paper">
            Interni come nuovi, carrozzeria a specchio.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/75">
            Pelle rigenerata, lucidatura professionale e cura di ogni dettaglio:
            la tua auto torna a brillare dentro e fuori.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
