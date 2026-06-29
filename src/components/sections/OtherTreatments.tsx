"use client";

import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { treatments } from "@/lib/treatments";

/**
 * Banda di chiusura del blocco "cura auto": dopo il restauro interni invita a
 * scoprire tutti gli altri trattamenti (lucidatura, detailing, vetri, centraline)
 * con chip che linkano alle ancore della pagina dedicata e una CTA principale.
 */
export default function OtherTreatments() {
  // Tutti tranne il restauro pelle, già raccontato dalla sezione precedente.
  const others = treatments.filter((t) => t.id !== "restauro-pelle");

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-center md:py-32">
      <div className="glow-racing pointer-events-none absolute left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 opacity-25 blur-3xl" />

      <div className="wrap relative flex flex-col items-center">
        <Reveal>
          <span className="eyebrow text-racing-bright">Non solo interni</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-xl mt-5 max-w-3xl text-balance">
            Vieni a scoprire tutti gli altri trattamenti.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/70">
            Dalla lucidatura a specchio alle pellicole protettive, fino alle
            rimappature: c&apos;è molto altro per far brillare e proteggere la
            tua auto.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <ul className="mt-9 flex flex-wrap justify-center gap-3">
            {others.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/trattamenti#${t.id}`}
                  className="inline-block rounded-full border border-white/15 px-4 py-2 font-display text-base font-medium text-paper/85 transition-colors hover:border-racing-bright/60 hover:text-paper"
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.2}>
          <Link href="/trattamenti" className="btn btn-primary mt-10">
            Scopri tutti i trattamenti
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
