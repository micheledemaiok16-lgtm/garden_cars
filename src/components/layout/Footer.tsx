import Image from "next/image";
import Link from "next/link";
import { nav, site, isMenu } from "@/lib/site";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "@/components/ui/SocialIcons";

// Associa ogni pagina social al relativo logo.
const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  TikTok: TikTokIcon,
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink">
      <div className="tricolore-line h-[3px] w-full" />
      <div className="wrap grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/#top" className="flex items-center gap-3" aria-label="Garden Cars">
            <span className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-white/20">
              <Image src="/brand/logo.jpg" alt="Garden Cars" fill sizes="44px" className="object-cover" />
            </span>
            <span className="font-logo -skew-x-6 text-lg font-normal tracking-tight text-paper">
              GARDEN&apos;S <span className="text-racing-bright">CARS</span>
            </span>
          </Link>
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
          <h3 className="eyebrow mt-8 text-paper/40">Seguici</h3>
          <ul className="mt-4 flex gap-3">
            {site.social.map((s) => {
              const Icon = socialIcons[s.label];
              const external = s.href.startsWith("http");
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    aria-label={`${site.name} su ${s.label}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-paper/70 transition-colors hover:border-racing-bright hover:text-racing-bright focus:outline-none focus-visible:ring-2 focus-visible:ring-racing-bright"
                  >
                    {Icon ? <Icon className="h-5 w-5" /> : s.label}
                  </a>
                </li>
              );
            })}
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
          <a
            href="https://www.quantor-ai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[20px] transition-opacity hover:opacity-80"
            aria-label="Fatto da Quantor AI"
          >
            <span>Fatto da</span>
            <Image
              src="/brand/logo-quantor.png"
              alt="Quantor AI"
              width={695}
              height={220}
              sizes="98px"
              className="h-[31px] w-auto"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
