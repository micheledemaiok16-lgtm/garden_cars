"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section id="contatti" className="relative overflow-hidden bg-ink py-24 md:py-32">
      <div className="glow-racing pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 opacity-20 blur-3xl" />
      <div className="wrap relative grid gap-14 lg:grid-cols-12 lg:gap-16">
        {/* Info + map */}
        <div className="lg:col-span-5">
          <Reveal>
            <span className="eyebrow text-racing-bright">Contatti</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-xl mt-5">Passa a trovarci.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-paper/70">
              Siamo a {site.city} ({site.province}). Scrivici o chiamaci: ti aspettiamo
              in salone per una prova senza impegno.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <dl className="mt-8 space-y-4 text-paper/80">
              <Row label="Indirizzo" value={site.address} />
              <Row label="Telefono" value={site.phone} href={site.phoneHref} />
              <Row label="Email" value={site.email} href={`mailto:${site.email}`} />
            </dl>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="font-display text-sm font-semibold">Orari</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-paper/70">
                {site.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day}</span>
                    <span className="text-paper/50">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-white/10">
              <iframe
                title={`Mappa di ${site.city}`}
                src={site.mapEmbed}
                loading="lazy"
                className="h-56 w-full grayscale-[0.3]"
              />
            </div>
          </Reveal>
        </div>

        {/* Form */}
        <div className="lg:col-span-7">
          <Reveal direction="left">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="rounded-3xl border border-white/10 bg-white/[0.02] p-7 md:p-9"
            >
              <p className="font-display text-sm text-paper/60">
                Compila il modulo, ti rispondiamo entro 24 ore.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Nome e cognome" name="nome" required />
                <Field label="Telefono" name="telefono" type="tel" />
                <div className="sm:col-span-2">
                  <Field label="Email" name="email" type="email" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block">
                    <span className="font-display text-sm font-medium text-paper/70">
                      Messaggio
                    </span>
                    <textarea
                      name="messaggio"
                      rows={4}
                      required
                      placeholder="Es. Sono interessato a una Giulia Veloce e al trattamento dei sedili…"
                      className="mt-2 w-full rounded-xl border border-white/15 bg-ink/40 px-4 py-3 text-paper placeholder:text-paper/30 focus:border-racing-bright focus:outline-none"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <button type="submit" className="btn btn-primary">
                  Invia richiesta
                </button>
                {sent && (
                  <span className="font-display text-sm text-racing-bright">
                    Grazie! Messaggio pronto per l&apos;invio. [DA COMPLETARE: collega
                    un servizio email]
                  </span>
                )}
              </div>
              <p className="mt-4 text-xs text-paper/40">
                Inviando accetti il trattamento dei dati secondo la nostra privacy
                policy. [DA COMPLETARE]
              </p>
            </form>
          </Reveal>
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
          <a href={href} className="transition-colors hover:text-racing-bright">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-display text-sm font-medium text-paper/70">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        className="mt-2 w-full rounded-xl border border-white/15 bg-ink/40 px-4 py-3 text-paper placeholder:text-paper/30 focus:border-racing-bright focus:outline-none"
      />
    </label>
  );
}
