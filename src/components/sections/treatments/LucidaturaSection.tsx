import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { BeforeAfter } from "@/components/ui/BeforeAfter";

const BASE = "/trattamenti/lucidatura";

const results = [
  { src: `${BASE}/risultato-1.jpg`, alt: "BMW X1 blu lucidata a specchio" },
  { src: `${BASE}/risultato-2.jpg`, alt: "Audi Q3 bianca con carrozzeria lucidata" },
  { src: `${BASE}/risultato-3.jpg`, alt: "Dettaglio portiera lucidata a specchio" },
];

export function LucidaturaSection({ index }: { index: number }) {
  return (
    <section id="lucidatura" className="relative scroll-mt-24 bg-ink py-24 text-paper md:py-32">
      <div className="glow-racing pointer-events-none absolute -left-32 top-1/4 h-[34rem] w-[34rem] opacity-20 blur-3xl" />
      <div className="wrap relative">
        <Reveal>
          <span className="eyebrow text-racing-bright">
            Trattamento {String(index + 1).padStart(2, "0")}
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-xl mt-5 max-w-3xl">Lucidatura</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/70">
            La lucidatura professionale restituisce alla carrozzeria profondità,
            brillantezza e protezione. Con macchine orbitali e paste abrasive di
            diversa grana eliminiamo graffi superficiali, aloni (swirl),
            ossidazione e opacità, correggendo la vernice strato dopo strato fino
            all&apos;effetto specchio. Rinnoviamo anche i fari opachi e ingialliti,
            riportandoli trasparenti — per estetica e sicurezza — e i montanti e le
            plastiche lucide. Al termine sigilliamo la superficie per far durare il
            risultato nel tempo.
          </p>
        </Reveal>

        {/* Cosa comprende */}
        <Reveal delay={0.15}>
          <ul className="mt-8 flex flex-wrap gap-3">
            {[
              "Correzione vernice",
              "Rimozione swirl e graffi",
              "Restauro fari",
              "Lucidatura montanti",
              "Sigillante protettivo",
            ].map((v) => (
              <li
                key={v}
                className="rounded-full border border-white/15 px-4 py-2 font-display text-sm font-medium text-paper/80"
              >
                {v}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Prima / Dopo */}
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div>
              <h3 className="font-display text-lg font-semibold">Restauro fari</h3>
              <p className="mt-1.5 text-sm text-paper/60">
                Trascina il cursore per vedere la differenza.
              </p>
              <div className="mt-4">
                <BeforeAfter
                  before={`${BASE}/faro-prima.jpg`}
                  after={`${BASE}/faro-dopo.jpg`}
                  beforeAlt="Faro opaco e ingiallito prima del trattamento"
                  afterAlt="Faro trasparente dopo la lucidatura"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div>
              <h3 className="font-display text-lg font-semibold">
                Lucidatura montanti
              </h3>
              <p className="mt-1.5 text-sm text-paper/60">
                Trascina il cursore per vedere la differenza.
              </p>
              <div className="mt-4">
                <BeforeAfter
                  before={`${BASE}/montante-prima.jpg`}
                  after={`${BASE}/montante-dopo.jpg`}
                  beforeAlt="Montante graffiato e opaco prima del trattamento"
                  afterAlt="Montante lucidato a specchio dopo il trattamento"
                />
              </div>
            </div>
          </Reveal>
        </div>

        {/* Risultati */}
        <Reveal delay={0.1}>
          <h3 className="mt-16 font-display text-lg font-semibold">
            Il risultato a specchio
          </h3>
        </Reveal>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {results.map((r, i) => (
            <Reveal key={r.src} delay={0.05 * i}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-white/10">
                <Image
                  src={r.src}
                  alt={r.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <Link href="/#contatti" className="btn btn-primary mt-12">
            Richiedi un preventivo
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
