"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const STEP_MS = 3800;

const steps = [
  {
    n: "01",
    title: "Analisi",
    body: "Valutiamo pelle, cuciture e usura per scegliere il trattamento giusto, materiale per materiale.",
    img: "/generated/pelle-step1.png",
    caption: "Pelle screpolata, opaca e segnata dal tempo.",
  },
  {
    n: "02",
    title: "Pulizia profonda",
    body: "Rimozione di sporco, aloni e residui con prodotti specifici che rispettano la grana naturale.",
    img: "/generated/pelle-step2.png",
    caption: "Una schiuma dedicata solleva sporco e aloni.",
  },
  {
    n: "03",
    title: "Rigenerazione",
    body: "Nutrizione e ripristino del colore: la pelle ritrova morbidezza, tono e compattezza.",
    img: "/generated/pelle-step3.png",
    caption: "Colore e nutrimento tornano pieni e uniformi.",
  },
  {
    n: "04",
    title: "Protezione",
    body: "Sigillante protettivo contro UV, macchie e usura, per far durare il risultato nel tempo.",
    img: "/generated/pelle-step4.png",
    caption: "Sigillata e protetta: morbida e come nuova.",
  },
];

export default function LeatherService() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  // Avanzamento automatico: un solo intervallo stabile (si ferma con reduced-motion)
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(
      () => setActive((a) => (a + 1) % steps.length),
      STEP_MS,
    );
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <section className="relative overflow-hidden bg-ink pb-24 pt-4 md:pb-32 md:pt-10">
      <div className="glow-racing pointer-events-none absolute -right-32 bottom-0 h-[34rem] w-[34rem] opacity-25 blur-3xl" />
      <div className="wrap relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Colonna sinistra: titolo + stepper interattivo */}
        <div className="lg:col-span-5">
          <Reveal>
            <h2 className="display-xl">
              Diamo agli interni
              <br />
              una seconda vita.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-paper/70">
              Pelle screpolata, opaca o macchiata? Ecco come la riportiamo a nuovo,
              passo dopo passo.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <ol className="mt-9 space-y-2">
              {steps.map((s, i) => {
                const isActive = i === active;
                return (
                  <li key={s.n}>
                    <button
                      onClick={() => setActive(i)}
                      aria-pressed={isActive}
                      className={cn(
                        "group relative w-full overflow-hidden rounded-2xl border px-5 py-4 text-left transition-colors duration-300",
                        isActive
                          ? "border-racing-bright/40 bg-white/[0.05]"
                          : "border-white/10 bg-transparent hover:bg-white/[0.03]",
                      )}
                    >
                      <div className="flex items-baseline gap-4">
                        <span
                          className={cn(
                            "font-display text-sm font-bold transition-colors",
                            isActive ? "text-racing-bright" : "text-paper/40",
                          )}
                        >
                          {s.n}
                        </span>
                        <div>
                          <h3 className="font-display text-base font-semibold">{s.title}</h3>
                          <AnimatePresence initial={false}>
                            {isActive && (
                              <motion.p
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden text-sm text-paper/60"
                              >
                                <span className="block pt-1.5">{s.body}</span>
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Barra di avanzamento dello step attivo */}
                      {isActive && !reduce && (
                        <motion.span
                          key={`bar-${active}`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                          className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-racing-bright"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </div>

        {/* Colonna destra: visore con dissolvenza tra le fasi */}
        <div className="lg:col-span-7">
          <Reveal direction="left">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-white/10">
              <AnimatePresence>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={steps[active].img}
                    alt={`Restauro pelle — fase ${steps[active].n}: ${steps[active].title}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />

              {/* Indicatore a segmenti */}
              <div className="absolute left-5 right-5 top-5 flex gap-2">
                {steps.map((s, i) => (
                  <span
                    key={s.n}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors duration-500",
                      i <= active ? "bg-racing-bright" : "bg-white/25",
                    )}
                  />
                ))}
              </div>

              {/* Etichetta fase */}
              <div className="absolute bottom-5 left-5 right-5">
                <span className="font-display text-xs font-semibold uppercase tracking-wider text-racing-bright">
                  Fase {steps[active].n} — {steps[active].title}
                </span>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={active}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="mt-1 font-display text-lg font-semibold text-paper"
                  >
                    {steps[active].caption}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
