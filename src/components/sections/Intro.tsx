"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollWheel } from "@/components/ui/ScrollWheel";

export default function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="chi-siamo" className="relative overflow-hidden bg-ink py-24 md:py-36 lg:py-44">
      <ScrollWheel
        className="absolute -left-32 bottom-0 hidden lg:block"
        size={450}
        spin={-460}
        opacity={0.4}
      />
      <div className="wrap relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <Reveal>
            <span className="eyebrow text-racing-bright">Chi siamo</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-xl mt-5">
              Da un garage sotto casa
              <br />
              a una passione che cresce.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-paper/70">
              <strong className="font-semibold text-paper">Garden&apos;s Cars</strong> nasce
              nel 2018 da un sogno e dalla passione di{" "}
              <strong className="font-semibold text-paper">Ottavio Tedesco</strong>{" "}
              per le automobili. Tutto &egrave; iniziato in un piccolo
              garage sotto casa, con il solo servizio di oscuramento vetri e tanta
              determinazione.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/70">
              Oggi quella passione si &egrave; trasformata in una realt&agrave; solida
              che offre vendita di auto nuove, usate e km 0, noleggio e servizi di
              personalizzazione e cura dell&apos;auto, con l&apos;obiettivo di garantire
              qualit&agrave;, affidabilit&agrave; e attenzione ad ogni cliente.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-10 flex items-center gap-3">
              <span className="tricolore-line h-[3px] w-16 rounded-full" />
              <span className="font-display text-sm font-medium text-paper/60">
                Cura artigianale italiana
              </span>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-6">
          <Reveal direction="left">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
              <motion.div style={reduce ? undefined : { y: imgY }} className="absolute inset-0 scale-110" ref={ref}>
                <Image
                  src="/generated/officina.png"
                  alt="Un addetto Garden Cars cura un'auto nello showroom di Giffoni Valle Piana"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
              <div className="tricolore-edge absolute inset-x-0 bottom-0 h-1" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
