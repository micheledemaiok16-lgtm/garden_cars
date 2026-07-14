"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { site, whatsappLink } from "@/lib/site";

/**
 * FAQ della home: domande/risposte raggruppate per macro-categoria (Acquisto
 * auto · Trattamenti · Dove siamo), scritte per intercettare le ricerche locali
 * ("concessionaria Giffoni Valle Piana", "auto usate km certificati",
 * "oscuramento vetri", "rimappatura centralina").
 *
 * Ogni voce genera anche lo schema FAQPage (JSON-LD): testo visibile e dato
 * strutturato nascono dallo stesso array, restano sempre allineati e abilitano
 * i rich result di Google.
 */

type Faq = { q: string; a: string; group: string };

const faqs: readonly Faq[] = [
  {
    group: "Acquisto auto",
    q: "Che auto vende Garden Cars a Giffoni Valle Piana?",
    a: "Vendiamo auto nuove e usate selezionate. Ogni usato passa un controllo accurato prima di entrare in salone, a due passi da Salerno.",
  },
  {
    group: "Acquisto auto",
    q: "Le auto usate hanno i chilometri certificati?",
    a: "Sì. Ogni usato è acquistato direttamente da noi, con chilometraggio certificato e perizia certificata DEKRA: niente conto vendita, solo vetture che abbiamo scelto e verificato in prima persona.",
  },
  {
    group: "Acquisto auto",
    q: "Le auto usate sono garantite?",
    a: "Sì. Ogni usato è coperto dalla garanzia convenzionale Futura di Conforgest: acquisti in tutta serenità, con la tranquillità di un usato controllato in ogni dettaglio.",
  },
  {
    group: "Acquisto auto",
    q: "Posso acquistare l'auto a rate o con finanziamento?",
    a: "Certo. Proponiamo soluzioni di finanziamento su misura per acquistare la tua prossima auto in comode rate.",
  },
  {
    group: "Acquisto auto",
    q: "Ritirate la mia auto usata in permuta?",
    a: "Sì. Valutiamo la tua auto e la ritiriamo in permuta, scalando il suo valore dal prezzo della nuova.",
  },
  {
    group: "Trattamenti",
    q: "Fate i trattamenti anche su auto non acquistate da voi?",
    a: "Sì. Restauro pelle, car detailing, lucidatura, oscuramento vetri, pellicole PPF e rimappature sono aperti a qualsiasi auto, anche se non l'hai comprata da noi.",
  },
  {
    group: "Trattamenti",
    q: "Quanto costa oscurare i vetri o un trattamento?",
    a: "Ogni lavoro è su misura: il preventivo dipende dall'auto e dal risultato che desideri. Scrivici su WhatsApp o chiamaci per un preventivo rapido e gratuito.",
  },
  {
    group: "Trattamenti",
    q: "Le rimappature delle centraline sono sicure e affidabili?",
    a: "Sì. Lavoriamo con centraline certificate MasterTuning: più potenza e coppia, sempre nel pieno rispetto dell'affidabilità del motore.",
  },
  {
    group: "Trattamenti",
    q: "Come prenoto un trattamento?",
    a: "Scrivici su WhatsApp o chiamaci direttamente: concordiamo insieme giorno e orario più comodi per te.",
  },
  {
    group: "Dove siamo",
    q: "Dove si trova Garden Cars?",
    a: "Siamo in Via Valentino Fortunato a Giffoni Valle Piana (SA), comodi da raggiungere da tutta la provincia di Salerno e dalla Campania.",
  },
  {
    group: "Dove siamo",
    q: "Quali sono gli orari del salone?",
    a: "Siamo aperti dal lunedì al venerdì 09:00–13:00 e 15:30–19:30, il sabato 09:00–13:00. Domenica chiuso. Passa a trovarci senza impegno.",
  },
] as const;

// Schema FAQPage per i rich result di Google (una sola sorgente dati).
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// Raggruppa mantenendo l'indice globale (serve per lo stato aperto e per gli id).
const groups = faqs.reduce<{ name: string; items: { faq: Faq; index: number }[] }[]>(
  (acc, faq, index) => {
    const last = acc[acc.length - 1];
    if (last && last.name === faq.group) last.items.push({ faq, index });
    else acc.push({ name: faq.group, items: [{ faq, index }] });
    return acc;
  },
  [],
);

export default function Faq() {
  // Prima domanda aperta di default; tutte le altre chiuse.
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section
      id="domande-frequenti"
      className="relative overflow-hidden bg-ink py-20 md:py-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="wrap relative">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Reveal>
              <span className="eyebrow text-racing-bright">Domande frequenti</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="display-xl mt-4 text-balance">
                Tutto quello che vuoi sapere.
              </h2>
            </Reveal>
          </div>

          {groups.map((group, gi) => (
            <Reveal key={group.name} delay={0.1} amount={0.1}>
              <div className={gi === 0 ? "mt-12" : "mt-14"}>
                <h3 className="flex items-center gap-3 font-display text-sm font-semibold uppercase tracking-wider text-racing-bright">
                  {group.name}
                  <span className="h-px flex-1 bg-white/10" />
                </h3>

                <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
                  {group.items.map(({ faq, index }) => {
                    const isOpen = open === index;
                    return (
                      <li key={faq.q}>
                        <h4>
                          <button
                            type="button"
                            onClick={() => setOpen(isOpen ? null : index)}
                            aria-expanded={isOpen}
                            aria-controls={`faq-panel-${index}`}
                            id={`faq-trigger-${index}`}
                            className="flex w-full items-center justify-between gap-4 py-4 text-left"
                          >
                            <span className="font-display text-base font-medium text-paper md:text-lg">
                              {faq.q}
                            </span>
                            <span
                              className={`shrink-0 text-racing-bright transition-transform duration-300 ${
                                isOpen ? "rotate-45" : ""
                              }`}
                              aria-hidden
                            >
                              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                                <path
                                  d="M12 5v14M5 12h14"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </span>
                          </button>
                        </h4>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              id={`faq-panel-${index}`}
                              role="region"
                              aria-labelledby={`faq-trigger-${index}`}
                              initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                              animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <p className="max-w-2xl pb-5 pr-8 leading-relaxed text-paper/65">
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          ))}

          <Reveal delay={0.15}>
            <p className="mt-10 text-center text-sm text-paper/60">
              Non trovi la risposta?{" "}
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-racing-bright underline-offset-4 hover:underline"
              >
                Scrivici su WhatsApp
              </a>{" "}
              o{" "}
              <a
                href={site.phoneHref}
                className="font-medium text-racing-bright underline-offset-4 hover:underline"
              >
                chiamaci
              </a>
              .
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
