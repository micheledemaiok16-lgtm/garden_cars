import { Reveal } from "@/components/ui/Reveal";
import type { Treatment } from "@/lib/treatments";

/**
 * Scheletro di una sezione-servizio della pagina /trattamenti.
 *
 * `index` serve solo a dare un ritmo visivo alternando lo sfondo. I contenuti
 * (testi, immagini, fasi, prezzi…) sono segnaposto: verranno compilati per ogni
 * trattamento man mano che arrivano i dettagli.
 */
export function TreatmentSection({
  treatment,
  index,
}: {
  treatment: Treatment;
  index: number;
}) {
  const even = index % 2 === 0;

  return (
    <section
      id={treatment.id}
      // scroll-mt: fallback per lo scroll nativo (reduced-motion) sotto la navbar fissa
      className={`relative scroll-mt-24 py-24 md:py-32 ${
        even ? "bg-ink text-paper" : "bg-paper text-ink"
      }`}
    >
      <div className="wrap">
        <Reveal>
          <span
            className={`eyebrow ${even ? "text-racing-bright" : "text-racing"}`}
          >
            Trattamento {String(index + 1).padStart(2, "0")}
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-xl mt-5 max-w-3xl">{treatment.title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p
            className={`mt-6 max-w-xl text-lg leading-relaxed ${
              even ? "text-paper/70" : "text-ink/70"
            }`}
          >
            {treatment.intro}
          </p>
        </Reveal>

        {/* Placeholder area contenuti: da sostituire con i dettagli del servizio */}
        <Reveal delay={0.15}>
          <div
            className={`mt-10 flex min-h-[180px] items-center justify-center rounded-3xl border border-dashed text-sm ${
              even
                ? "border-white/15 text-paper/40"
                : "border-ink/15 text-ink/40"
            }`}
          >
            Contenuti della sezione “{treatment.label}” in arrivo
          </div>
        </Reveal>
      </div>
    </section>
  );
}
