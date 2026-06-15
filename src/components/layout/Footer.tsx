import Image from "next/image";
import { nav, site } from "@/lib/site";

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
            <span className="font-display text-xl font-semibold">
              Garden<span className="text-racing-bright">Cars</span>
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
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-paper/70 transition-colors hover:text-racing-bright">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h3 className="eyebrow text-paper/40">Contatti</h3>
          <ul className="mt-5 space-y-3 text-paper/70">
            <li>{site.address}</li>
            <li>
              <a href={site.phoneHref} className="transition-colors hover:text-racing-bright">
                {site.phone}
              </a>
            </li>
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
            © {new Date().getFullYear()} Garden Cars · {site.vat}
          </p>
          <p>Realizzato con passione. Foto e listino [DA COMPLETARE].</p>
        </div>
      </div>
    </footer>
  );
}
