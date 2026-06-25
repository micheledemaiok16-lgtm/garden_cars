import Image from "next/image";
import { nav, site, isMenu } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink">
      <div className="tricolore-line h-[3px] w-full" />
      <div className="wrap grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <a href="#top" className="flex items-center gap-3" aria-label="Garden Cars">
            <span className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-white/20">
              <Image src="/brand/logo.jpg" alt="Garden Cars" fill sizes="44px" className="object-cover" />
            </span>
            <span className="font-logo -skew-x-6 text-lg font-normal tracking-tight text-paper">
              GARDEN&apos;S <span className="text-racing-bright">CARS</span>
            </span>
          </a>
          <p className="mt-5 max-w-sm text-paper/60">
            Vendita auto nuove e usate e trattamento professionale di pelli e sedili
            a {site.city} ({site.province}). {site.tagline}.
          </p>
        </div>

        <div className="md:col-span-3">
          <h3 className="eyebrow text-paper/40">Naviga</h3>
          <ul className="mt-5 space-y-3">
            {nav.map((item) => {
              const href = isMenu(item) ? item.children[0].href : item.href;
              return (
                <li key={item.label}>
                  <a href={href} className="text-paper/70 transition-colors hover:text-racing-bright">
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h3 className="eyebrow text-paper/40">Contatti</h3>
          <ul className="mt-5 space-y-3 text-paper/70">
            <li>{site.address}</li>
            {site.phones.map((p) => (
              <li key={p.href}>
                <a href={p.href} className="transition-colors hover:text-racing-bright">
                  {p.number} <span className="text-paper/40">· {p.label}</span>
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-racing-bright">
                {site.email}
              </a>
            </li>
          </ul>
          <ul className="mt-6 flex gap-4">
            {site.social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  className="font-display text-sm font-medium text-paper/70 transition-colors hover:text-racing-bright"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col items-center justify-between gap-3 py-6 text-sm text-paper/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.legalName}
            {site.vat ? ` · ${site.vat}` : ""}
          </p>
          <p>Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
}
