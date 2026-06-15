/**
 * Dati di contesto del sito. Centralizzati così sono facili da aggiornare
 * e collegabili in futuro a un CMS / gestionale.
 * [DA COMPLETARE] = informazioni reali da richiedere al cliente.
 */

export const site = {
  name: "Garden Cars",
  tagline: "Passione su quattro ruote",
  city: "Giffoni Valle Piana",
  province: "SA",
  region: "Campania",
  // [DA COMPLETARE] indirizzo, recapiti e P.IVA reali
  address: "Via [DA COMPLETARE], 84095 Giffoni Valle Piana (SA)",
  phone: "+39 089 000000",
  phoneHref: "tel:+39089000000",
  email: "info@gardencars.it",
  vat: "P.IVA [DA COMPLETARE]",
  hours: [
    { day: "Lun – Ven", time: "09:00 – 13:00 · 15:30 – 19:30" },
    { day: "Sabato", time: "09:00 – 13:00" },
    { day: "Domenica", time: "Chiuso" },
  ],
  social: [
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
    { label: "WhatsApp", href: "#" },
  ],
  // Coordinate approssimative di Giffoni Valle Piana per la mappa
  mapEmbed:
    "https://www.openstreetmap.org/export/embed.html?bbox=14.92%2C40.69%2C14.97%2C40.72&layer=mapnik&marker=40.7056%2C14.945",
  mapLink: "https://www.openstreetmap.org/?mlat=40.7056&mlon=14.945#map=14/40.7056/14.945",
} as const;

export const nav = [
  { label: "Nuove", href: "#nuove" },
  { label: "Usate", href: "#usate" },
  { label: "Trattamento Pelli", href: "#pelli" },
  { label: "Showroom", href: "#showroom" },
  { label: "Contatti", href: "#contatti" },
] as const;
