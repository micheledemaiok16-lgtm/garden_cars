"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const shots = [
  { src: "/generated/hero.webp", alt: "Berlina sportiva verde davanti alla villa", span: "lg:col-span-7 lg:row-span-2" },
  { src: "/generated/lucidatura-macro.webp", alt: "Lucidatura della carrozzeria, dettaglio macro", span: "lg:col-span-5" },
  { src: "/generated/pelle-campionario.webp", alt: "Campionario di pelli per gli interni", span: "lg:col-span-5" },
  { src: "/generated/abitacolo.webp", alt: "Abitacolo con interni in pelle cognac", span: "lg:col-span-6" },
  { src: "/generated/pelle-sedile.webp", alt: "Sedile in pelle rigenerato", span: "lg:col-span-6" },
];

export default function Gallery() {
  const [active, setActive] = useState<number | null>(null);

  // Lightbox aperto: chiusura con Esc e blocco dello scroll di fondo.
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active]);

  return (
    <section id="showroom" className="relative bg-paper py-24 text-ink md:py-32">
      <div className="wrap">
        <Reveal>
          <span className="eyebrow text-racing">Showroom</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-xl mt-5 max-w-2xl text-ink">
            Il nostro lavoro, da vicino.
          </h2>
        </Reveal>

        <RevealGroup className="mt-14 grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12" stagger={0.08}>
          {shots.map((s, i) => (
            <RevealItem key={s.src} className={`${s.span} h-full`}>
              <button
                onClick={() => setActive(i)}
                className="group relative h-full w-full overflow-hidden rounded-2xl"
                aria-label={`Apri immagine: ${s.alt}`}
              >
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/20" />
              </button>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-6 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setActive(null)}
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-paper ring-1 ring-white/20 transition-colors hover:bg-white/20"
              aria-label="Chiudi"
            >
              ✕
            </button>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative aspect-[3/2] w-full max-w-5xl overflow-hidden rounded-2xl"
            >
              <Image src={shots[active].src} alt={shots[active].alt} fill sizes="90vw" className="object-cover" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
