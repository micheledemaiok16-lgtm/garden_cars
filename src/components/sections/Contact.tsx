import { Reveal } from "@/components/ui/Reveal";
import { site, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

/**
 * Messaggi pronti: ogni chip apre WhatsApp con il testo già scritto nella chat,
 * così l'utente deve solo premere invio. È il modo più rapido per contattarci.
 */
const quickStart = [
  {
    label: "Prenota una prova",
    message: "Ciao Garden's Cars! Vorrei prenotare una prova su strada.",
  },
  {
    label: "Info su un'auto",
    message: "Ciao Garden's Cars! Vorrei informazioni su un'auto in vetrina.",
  },
  {
    label: "Trattamenti estetici",
    message: "Ciao Garden's Cars! Vorrei un preventivo per un trattamento estetico.",
  },
  {
    label: "Valuta la permuta",
    message: "Ciao Garden's Cars! Vorrei una valutazione per la permuta della mia auto.",
  },
] as const;

const CTA_MESSAGE = "Ciao Garden's Cars! Vorrei qualche informazione.";

export default function Contact() {
  return (
    <section id="contatti" className="relative overflow-hidden bg-ink py-24 md:py-32">
      <div className="glow-racing pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 opacity-20 blur-3xl" />

      <div className="wrap relative">
        {/* Intestazione */}
        <div className="max-w-2xl">
          <Reveal>
            <span className="eyebrow text-racing-bright">Contatti</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-xl mt-5">Parliamone.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-paper/70">
              Il modo più veloce per raggiungerci è WhatsApp: ci scrivi due righe e
              ti rispondiamo in giornata. Preferisci di persona? Ti aspettiamo in
              salone a {site.city}, senza impegno.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Hub WhatsApp — azione principale */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-7 md:p-10">
                {/* Bagliore verde WhatsApp in alto a destra */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#25D366]/20 blur-3xl"
                />

                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-1.5 font-display text-xs font-medium text-paper/80">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25D366]" />
                    </span>
                    Di solito rispondiamo in giornata
                  </span>

                  <div className="mt-6 flex items-center gap-4">
                    <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-[#25D366] text-ink shadow-lg shadow-[#25D366]/25">
                      <WhatsAppIcon className="h-7 w-7" />
                    </span>
                    <h3 className="display-lg">Scrivici su WhatsApp</h3>
                  </div>

                  <p className="mt-5 max-w-lg text-paper/70">
                    Niente moduli da compilare. Apri una chat e raccontaci cosa
                    cerchi — un&apos;auto, un trattamento, una valutazione: pensiamo
                    a tutto noi.
                  </p>

                  {/* Messaggi pronti */}
                  <p className="mt-8 font-display text-xs font-semibold uppercase tracking-wider text-paper/40">
                    Inizia da qui
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {quickStart.map((q) => (
                      <a
                        key={q.label}
                        href={whatsappLink(q.message)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 font-display text-sm text-paper/85 transition-colors hover:border-[#25D366]/60 hover:bg-[#25D366]/10 hover:text-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                      >
                        {q.label}
                        <span className="text-[#25D366] transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </a>
                    ))}
                  </div>

                  {/* CTA principale */}
                  <a
                    href={whatsappLink(CTA_MESSAGE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Scrivici su WhatsApp"
                    className="mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] px-6 py-4 font-display text-base font-semibold text-ink shadow-lg shadow-[#25D366]/20 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    Scrivici ora su WhatsApp
                  </a>

                  {/* Alternative */}
                  <div className="mt-7 flex items-center gap-4">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="font-display text-xs uppercase tracking-wider text-paper/40">
                      oppure
                    </span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {site.phones.map((p) => (
                      <AltAction
                        key={p.href}
                        href={p.href}
                        caption={`Chiama · ${p.label}`}
                        value={p.number}
                        icon={<PhoneIcon />}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Dove siamo */}
          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <span className="eyebrow text-paper/50">Vieni a trovarci</span>
            </Reveal>

            <Reveal delay={0.14}>
              <dl className="mt-6 space-y-5 text-paper/80">
                <Row label="Indirizzo" value={site.address} href={site.mapLink} />
                <Row label="Email" value={site.email} href={`mailto:${site.email}`} />
              </dl>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="font-display text-sm font-semibold">Orari</h3>
                <ul className="mt-3 space-y-2 text-sm text-paper/70">
                  {site.hours.map((h) => (
                    <li key={h.day} className="flex items-baseline justify-between gap-4">
                      <span className="font-display font-medium text-paper/90">
                        {h.day}
                      </span>
                      <span className="text-right text-paper/55">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.22}>
              <a
                href={site.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Apri ${site.address} su Google Maps`}
                className="group relative mt-6 block overflow-hidden rounded-2xl ring-1 ring-white/10 transition-shadow hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-racing-bright"
              >
                <iframe
                  title={`Mappa di ${site.city}`}
                  src={site.mapEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="pointer-events-none h-56 w-full grayscale-[0.3] transition-[filter] duration-500 group-hover:grayscale-0"
                />
                <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 font-display text-xs font-medium text-paper backdrop-blur-sm ring-1 ring-white/10 transition-colors group-hover:text-racing-bright">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
                    <path
                      d="M12 21s-6-5.686-6-10a6 6 0 1112 0c0 4.314-6 10-6 10z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  Apri in Google Maps
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt className="font-display text-xs font-semibold uppercase tracking-wider text-paper/40">
        {label}
      </dt>
      <dd className="mt-1">
        {href ? (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="transition-colors hover:text-racing-bright"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

/** Azione secondaria di contatto (telefono / email) sotto la CTA WhatsApp. */
function AltAction({
  href,
  caption,
  value,
  icon,
}: {
  href: string;
  caption: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 transition-colors hover:border-racing-bright hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-racing-bright"
    >
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white/[0.04] text-paper/60 transition-colors group-hover:text-racing-bright">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[0.7rem] font-medium uppercase tracking-wide text-paper/40">
          {caption}
        </span>
        <span className="block truncate font-display text-sm text-paper/90">
          {value}
        </span>
      </span>
    </a>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M6.6 3h-2A1.6 1.6 0 003 4.6C3 13 11 21 19.4 21A1.6 1.6 0 0021 19.4v-2a1 1 0 00-.76-.97l-3.4-.85a1 1 0 00-1 .34l-.9 1.1a13 13 0 01-5.1-5.1l1.1-.9a1 1 0 00.34-1l-.85-3.4A1 1 0 006.6 3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

