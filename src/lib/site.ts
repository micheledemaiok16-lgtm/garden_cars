/**
 * Dati di contesto del sito. Centralizzati così sono facili da aggiornare
 * e collegabili in futuro a un CMS / gestionale.
 */

import { treatments } from "@/lib/treatments";

export const site = {
  name: "Garden Cars",
  legalName: "GARDEN'S CARS S.r.l.s.",
  tagline: "Passione su quattro ruote",
  city: "Giffoni Valle Piana",
  province: "SA",
  region: "Campania",
  address: "Via Valentino Fortunato snc, 84095 Giffoni Valle Piana (SA)",
  // Recapiti dal biglietto da visita.
  phones: [
    { label: "Ottavio", number: "+39 338 777 1436", href: "tel:+393387771436" },
    { label: "Garden's Cars", number: "+39 353 369 9837", href: "tel:+393533699837" },
  ],
  // Recapito principale (compatibilità con i componenti esistenti).
  phone: "+39 338 777 1436",
  phoneHref: "tel:+393387771436",
  // Numero WhatsApp Garden's Cars in formato internazionale (senza +, spazi o
  // trattini): usato dall'helper whatsappLink() per i link wa.me.
  whatsapp: "393533699837",
  email: "gardenscarsgiffoni@gmail.com",
  vat: "P.IVA 05726810657",
  // Prenotazione consulenza: per ora rimanda ai contatti, in futuro link Calendly.
  consultHref: "/#contatti",
  hours: [
    { day: "Lun – Ven", time: "09:00 – 13:00 · 15:30 – 19:30" },
    { day: "Sabato", time: "09:00 – 13:00" },
    { day: "Domenica", time: "Chiuso" },
  ],
  // Pagine social ufficiali (parametri di tracciamento QR/share rimossi).
  social: [
    { label: "Instagram", href: "https://www.instagram.com/gardenscars" },
    {
      label: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61555662421566",
    },
    { label: "TikTok", href: "https://www.tiktok.com/@gardenscars" },
  ],
  // Coordinate approssimative di Giffoni Valle Piana per la mappa.
  // mapEmbed: anteprima Google Maps (iframe, nessuna API key richiesta).
  // mapLink: apre Google Maps — app su telefono, nuova scheda su PC.
  mapEmbed:
    "https://www.google.com/maps?q=40.7056,14.945&z=15&hl=it&output=embed",
  mapLink:
    "https://www.google.com/maps/search/?api=1&query=40.7056%2C14.945",
} as const;

/**
 * Costruisce un link WhatsApp (wa.me) verso il numero Garden's Cars.
 * Con `message`, il testo compare già scritto nella chat dell'utente, che deve
 * solo premere invio. Su mobile apre l'app, su desktop WhatsApp Web/Desktop.
 */
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export type NavLink = { label: string; href: string };
export type NavMenu = { label: string; children: readonly NavLink[] };
export type NavItem = NavLink | NavMenu;

export const nav: readonly NavItem[] = [
  { label: "Auto", href: "/#auto" },
  {
    label: "Trattamenti",
    // Le voci puntano alle sezioni della pagina dedicata /trattamenti.
    // La sorgente è treatments.ts, così menu e pagina restano allineati.
    children: treatments.map((t) => ({
      label: t.label,
      href: `/trattamenti#${t.id}`,
    })),
  },
  { label: "Chi siamo", href: "/#chi-siamo" },
  { label: "FAQ", href: "/#domande-frequenti" },
  { label: "Contatti", href: "/#contatti" },
];

// Type guard per distinguere una voce con sottomenu da un link semplice.
export function isMenu(item: NavItem): item is NavMenu {
  return "children" in item;
}
