import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { TreatmentSection } from "@/components/sections/TreatmentSection";
import { treatments } from "@/lib/treatments";

export const metadata: Metadata = {
  title: "Trattamenti",
  description:
    "I trattamenti professionali Garden Cars: lucidatura, trattamento pelle, car detailing, trattamento vetri e centraline.",
  alternates: { canonical: "/trattamenti" },
};

export default function TreatmentsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Header pagina */}
        <header className="relative overflow-hidden bg-ink pb-16 pt-36 text-paper md:pb-20 md:pt-44">
          <div className="glow-racing pointer-events-none absolute -left-32 top-0 h-[34rem] w-[34rem] opacity-25 blur-3xl" />
          <div className="wrap relative">
            <Reveal>
              <span className="eyebrow text-racing-bright">I nostri servizi</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="display-hero mt-5 max-w-4xl">Trattamenti.</h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-paper/70">
                Cura professionale per ogni dettaglio dell&apos;auto. Scopri i
                nostri trattamenti, ognuno con la sua sezione dedicata.
              </p>
            </Reveal>

            {/* Indice rapido dei servizi → ancore di questa pagina */}
            <Reveal delay={0.15}>
              <nav
                aria-label="Indice trattamenti"
                className="mt-10 flex flex-wrap gap-3"
              >
                {treatments.map((t) => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    className="rounded-full border border-white/15 px-4 py-2 font-display text-sm font-medium text-paper/80 transition-colors hover:border-racing-bright hover:text-paper"
                  >
                    {t.label}
                  </a>
                ))}
              </nav>
            </Reveal>
          </div>
          <div className="tricolore-line mt-12 h-[2px] w-full opacity-80" />
        </header>

        {treatments.map((t, i) => (
          <TreatmentSection key={t.id} treatment={t} index={i} />
        ))}
      </main>
      <Footer />
    </>
  );
}
