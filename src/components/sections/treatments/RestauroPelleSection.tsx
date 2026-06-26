import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

const fasi = [
  {
    n: "01",
    title: "Analisi",
    body: "Valutiamo pelle, cuciture e usura per scegliere il trattamento giusto.",
    img: "/generated/pelle-step1.png",
  },
  {
    n: "02",
    title: "Pulizia profonda",
    body: "Rimuoviamo sporco, aloni e residui rispettando la grana naturale.",
    img: "/generated/pelle-step2.png",
  },
  {
    n: "03",
    title: "Rigenerazione",
    body: "Nutrizione e ripristino del colore: morbidezza, tono e compattezza.",
    img: "/generated/pelle-step3.png",
  },
  {
    n: "04",
    title: "Protezione",
    body: "Sigillante contro UV, macchie e usura per far durare il risultato.",
    img: "/generated/pelle-step4.png",
  },
];

export function RestauroPelleSection({ index }: { index: number }) {
  return (
    <section
      id="restauro-pelle"
      className="relative scroll-mt-24 bg-paper py-24 text-ink md:py-32"
    >
      <div className="wrap relative">
        <Reveal>
          <span className="eyebrow text-racing">
            Trattamento {String(index + 1).padStart(2, "0")}
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-xl mt-5 max-w-3xl text-ink">Restauro pelle</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70">
            Riportiamo a nuovo pelle, volante e abitacolo: pulizia profonda,
            rigenerazione del colore e protezione per restituire all&apos;interno
            l&apos;aspetto e il profumo del primo giorno.
          </p>
        </Reveal>

        {/* Cosa comprende */}
        <Reveal delay={0.15}>
          <ul className="mt-8 flex flex-wrap gap-3">
            {[
              "Pulizia profonda",
              "Rigenerazione colore",
              "Volante e abitacolo",
              "Sedili in pelle",
              "Protezione UV",
            ].map((v) => (
              <li
                key={v}
                className="rounded-full border border-ink/15 px-4 py-2 font-display text-sm font-medium text-ink/80"
              >
                {v}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Abitacolo e volante */}
        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div>
              <h3 className="display-lg text-ink">Abitacolo e volante</h3>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/70">
                Il volante è il punto più sollecitato dell&apos;abitacolo: lo
                puliamo e rigeneriamo eliminando lucido, screpolature e segni
                d&apos;uso. Stesso trattamento per plance, pannelli e sedili in
                pelle, per un interno uniforme e curato in ogni dettaglio.
              </p>
            </div>
          </Reveal>
          <Reveal direction="left">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative col-span-2 aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-ink/10">
                <Image
                  src="/trattamenti/restauro-pelle/volante.jpg"
                  alt="Volante in pelle pulito e rigenerato"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-ink/10">
                <Image
                  src="/generated/abitacolo.webp"
                  alt="Abitacolo con interni in pelle"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-ink/10">
                <Image
                  src="/generated/pelle-sedile.webp"
                  alt="Sedile in pelle rigenerato"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>

        {/* Le fasi del trattamento */}
        <Reveal delay={0.1}>
          <h3 className="mt-20 display-lg text-ink">Le fasi del trattamento</h3>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {fasi.map((f, i) => (
            <Reveal key={f.n} delay={0.05 * i}>
              <div className="flex h-full flex-col">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-ink/10">
                  <Image
                    src={f.img}
                    alt={`Restauro pelle, fase ${f.n}: ${f.title}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 font-display text-xs font-bold text-paper backdrop-blur-sm">
                    {f.n}
                  </span>
                </div>
                <h4 className="mt-4 font-display text-base font-semibold text-ink">
                  {f.title}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <Link href="/#contatti" className="btn btn-primary mt-14">
            Richiedi un preventivo
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
