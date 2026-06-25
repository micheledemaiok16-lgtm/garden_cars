import { Reveal } from "@/components/ui/Reveal";

/**
 * Parco auto live: incorpora la vetrina AutoScout24 della concessionaria.
 * L'inventario è sempre aggiornato automaticamente dal gestionale AutoScout24,
 * quindi non serve manutenere le auto a mano nel codice.
 *
 * Il widget è un iframe cross-origin: il suo contenuto interno (font, colori,
 * card) non è personalizzabile via CSS. Curiamo quindi la "cornice" perché si
 * integri il più possibile col resto del sito — superficie bianca pulita,
 * firma tricolore e raccordo morbido col fondo paper.
 */
const AUTOSCOUT_EMBED =
  "https://www.autoscout24.it/concessionari/embedded-list/garden-s-cars-srls-giffoni-valle-piana-84095?preview=false";

export default function Inventory() {
  return (
    <section id="auto" className="relative bg-paper py-24 text-ink md:py-32">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <span className="eyebrow text-racing">Il nostro parco auto</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="display-xl mt-5 max-w-2xl text-ink">
                Tutte le nostre auto, sempre aggiornate.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-ink/60">
              Nuovo e usato garantito, pronti in concessionaria. L&apos;elenco si
              aggiorna in tempo reale: ogni veicolo che vedi è davvero disponibile.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="relative mt-12 overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-ink/10 ring-1 ring-ink/10">
            {/* Firma tricolore: lega il widget all'identità del sito */}
            <div className="tricolore-line h-1 w-full" />
            <iframe
              src={AUTOSCOUT_EMBED}
              title="Parco auto Garden's Cars su AutoScout24"
              loading="lazy"
              className="block h-[clamp(640px,86vh,1080px)] w-full bg-white"
              scrolling="auto"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
