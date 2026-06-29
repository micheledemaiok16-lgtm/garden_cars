import { Reveal } from "@/components/ui/Reveal";
import { ScrollWheel } from "@/components/ui/ScrollWheel";

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
    <section id="auto" className="relative overflow-hidden bg-paper py-24 text-ink md:py-32">
      <div className="wrap">
        <div className="max-w-2xl">
          <Reveal>
            <span className="eyebrow text-racing">Il nostro parco auto</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-xl mt-5 text-ink">
              Tutte le nostre auto, sempre aggiornate.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-ink/60">
              Nuovo e usato garantito, pronti in concessionaria. L&apos;elenco si
              aggiorna in tempo reale: ogni veicolo che vedi è davvero disponibile.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="relative mt-12">
            {/* Ruota che gira sullo scroll, in alto a destra e dietro l'iframe.
                Offset responsivo: sotto 2xl resta contenuta e interamente
                visibile (niente sbordo); da 2xl in su, dove c'è margine
                laterale, sporge di più verso destra come sugli schermi ampi.
                La sezione è overflow-hidden, quindi nessun overflow di pagina. */}
            <ScrollWheel
              className="absolute -right-6 -top-[150px] hidden md:block 2xl:-right-[138px] 2xl:-top-[178px]"
              size={300}
              spin={520}
              opacity={0.9}
            />
            <div className="relative z-10 overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-ink/10 ring-1 ring-ink/10">
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
          </div>
        </Reveal>
      </div>
    </section>
  );
}
