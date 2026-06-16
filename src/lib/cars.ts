/**
 * Catalogo auto — struttura dati riutilizzabile e separata dalla UI.
 * Facile da collegare a un CMS / gestionale in futuro.
 *
 * FOTO: ogni auto punta a /cars/<id>.jpg (cartella public/cars/).
 * Trascina lì la foto con il nome corretto (vedi public/cars/LEGGIMI.txt).
 * Finché il file non esiste, la card mostra un placeholder "Foto in arrivo".
 *
 * description: testo mockup mostrato nel dettaglio a tendina della card.
 * [DA COMPLETARE] con le descrizioni reali del cliente.
 */

export type Fuel = "Benzina" | "Diesel" | "Ibrida" | "Elettrica" | "GPL";
export type Gearbox = "Manuale" | "Automatico";
export type Condition = "nuova" | "usata";

export interface Car {
  id: string;
  brand: string;
  model: string;
  trim?: string;
  year: number;
  price: number;
  km: number;
  fuel: Fuel;
  gearbox: Gearbox;
  power: number; // CV
  condition: Condition;
  image: string;
  highlight?: string;
  color?: string;
  description?: string; // testo mockup mostrato nel dettaglio a tendina
}

export const cars: Car[] = [
  // ---------- NUOVE ----------
  {
    id: "n1",
    brand: "Alfa Romeo",
    model: "Giulia",
    trim: "Veloce Q4",
    year: 2025,
    price: 58900,
    km: 0,
    fuel: "Benzina",
    gearbox: "Automatico",
    power: 280,
    condition: "nuova",
    image: "/cars/n1.jpg",
    highlight: "Pronta consegna",
    color: "Verde Montreal",
    description:
      "Giulia Veloce con trazione integrale Q4 da 280 CV in pronta consegna. Sospensioni attive, sedili sportivi in pelle e infotainment di ultima generazione. Garanzia ufficiale, permuta e finanziamento su misura.",
  },
  {
    id: "n2",
    brand: "Mercedes-Benz",
    model: "Classe C",
    trim: "AMG Line",
    year: 2025,
    price: 62500,
    km: 0,
    fuel: "Ibrida",
    gearbox: "Automatico",
    power: 258,
    condition: "nuova",
    image: "/cars/n2.jpg",
    highlight: "Mild-hybrid",
    color: "Grigio Selenite",
    description:
      "Nuova Classe C con tecnologia mild-hybrid e pacchetto AMG Line. Interni eleganti, sistema MBUX con doppio display e fari LED High Performance. Disponibile in pronta consegna con soluzioni di finanziamento dedicate.",
  },
  {
    id: "n3",
    brand: "Audi",
    model: "A5 Sportback",
    trim: "S line",
    year: 2025,
    price: 64200,
    km: 0,
    fuel: "Diesel",
    gearbox: "Automatico",
    power: 204,
    condition: "nuova",
    image: "/cars/n3.jpg",
    highlight: "Quattro",
    color: "Grigio Daytona",
    description:
      "Audi A5 Sportback S line con trazione integrale quattro e cambio S tronic. Linee coupé, interni sportivi e dotazione tecnologica completa. Ordinabile anche in altre motorizzazioni e configurazioni.",
  },
  {
    id: "n4",
    brand: "BMW",
    model: "Serie 4",
    trim: "M Sport",
    year: 2025,
    price: 66900,
    km: 0,
    fuel: "Elettrica",
    gearbox: "Automatico",
    power: 340,
    condition: "nuova",
    image: "/cars/n4.jpg",
    highlight: "Zero emissioni",
    color: "Rosso Melbourne",
    description:
      "BMW Serie 4 Gran Coupé 100% elettrica: zero emissioni, ricarica rapida e dinamica di guida BMW. Allestimento M Sport, interni premium e autonomia adatta all'uso quotidiano. Incentivi e wallbox su richiesta.",
  },

  // ---------- USATE ----------
  {
    id: "u1",
    brand: "Porsche",
    model: "Panamera",
    trim: "4 E-Hybrid",
    year: 2022,
    price: 89900,
    km: 38500,
    fuel: "Ibrida",
    gearbox: "Automatico",
    power: 462,
    condition: "usata",
    image: "/cars/u1.jpg",
    highlight: "Tagliandi Porsche",
    color: "Argento GT",
    description:
      "Panamera 4 E-Hybrid del 2022 con tagliandi ufficiali Porsche e condizioni impeccabili. Plug-in hybrid da 462 CV, interni full optional in pelle. Garanzia inclusa e possibilità di permuta.",
  },
  {
    id: "u2",
    brand: "Mercedes-Benz",
    model: "Classe E",
    trim: "SW Premium",
    year: 2021,
    price: 42500,
    km: 64200,
    fuel: "Diesel",
    gearbox: "Automatico",
    power: 194,
    condition: "usata",
    image: "/cars/u2.jpg",
    highlight: "Interni pelle cognac",
    color: "Nero Ossidiana",
    description:
      "Classe E Station Wagon Premium: spaziosa, confortevole e con interni in pelle cognac. Diesel automatico ideale per i lunghi viaggi, sempre tagliandata. Garanzia e finanziamento disponibili.",
  },
  {
    id: "u3",
    brand: "Audi",
    model: "A4 Avant",
    trim: "Business",
    year: 2020,
    price: 31900,
    km: 78900,
    fuel: "Diesel",
    gearbox: "Manuale",
    power: 150,
    condition: "usata",
    image: "/cars/u3.jpg",
    highlight: "Unico proprietario",
    color: "Grigio Quarzo",
    description:
      "Audi A4 Avant Business, unico proprietario e in ottimo stato. Diesel manuale efficiente, perfetta come auto familiare o aziendale. Pronta alla consegna con controllo completo effettuato.",
  },
  {
    id: "u4",
    brand: "Volkswagen",
    model: "Golf",
    trim: "Life",
    year: 2022,
    price: 23500,
    km: 29400,
    fuel: "Benzina",
    gearbox: "Manuale",
    power: 130,
    condition: "usata",
    image: "/cars/u4.jpg",
    highlight: "Come nuova",
    color: "Bianco Puro",
    description:
      "Volkswagen Golf in ottime condizioni, brillante e parca nei consumi. Cambio manuale, ideale per la città e per i viaggi. Pochi chilometri e controllata in ogni dettaglio.",
  },
  {
    id: "u5",
    brand: "BMW",
    model: "X3",
    trim: "xDrive20d",
    year: 2021,
    price: 39900,
    km: 55100,
    fuel: "Diesel",
    gearbox: "Automatico",
    power: 190,
    condition: "usata",
    image: "/cars/u5.jpg",
    highlight: "4x4",
    color: "Nero Carbonio",
    description:
      "BMW X3 xDrive20d, SUV premium a trazione integrale. Diesel automatico, spazioso e tecnologico, perfetto in ogni stagione. Tagliandi in regola e garanzia inclusa.",
  },
  {
    id: "u6",
    brand: "Fiat",
    model: "500",
    trim: "Hybrid",
    year: 2023,
    price: 14900,
    km: 18700,
    fuel: "Ibrida",
    gearbox: "Manuale",
    power: 70,
    condition: "usata",
    image: "/cars/u6.jpg",
    highlight: "Cittadina ideale",
    color: "Bianco Gelato",
    description:
      "Fiat 500 Hybrid, la cittadina perfetta: agile, economica e sempre di moda. Pochi chilometri, come nuova. Ideale come prima auto o per muoversi in città senza pensieri.",
  },
];

export const newCars = cars.filter((c) => c.condition === "nuova");
export const usedCars = cars.filter((c) => c.condition === "usata");
