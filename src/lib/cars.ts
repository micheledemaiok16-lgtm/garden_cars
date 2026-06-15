/**
 * Catalogo auto — struttura dati riutilizzabile e separata dalla UI.
 * Facile da collegare a un CMS / gestionale in futuro.
 * Le immagini sono placeholder credibili: [DA COMPLETARE] con foto reali.
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
    image: "/generated/hero.webp",
    highlight: "Pronta consegna",
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
    image: "/generated/abitacolo.webp",
    highlight: "Mild-hybrid",
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
    image: "/generated/pelle-sedile.webp",
    highlight: "Quattro",
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
    image: "/generated/lucidatura-macro.webp",
    highlight: "Zero emissioni",
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
    image: "/generated/hero.webp",
    highlight: "Tagliandi Porsche",
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
    image: "/generated/abitacolo.webp",
    highlight: "Interni pelle cognac",
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
    image: "/generated/pelle-sedile.webp",
    highlight: "Unico proprietario",
  },
  {
    id: "u4",
    brand: "Volkswagen",
    model: "Golf",
    trim: "GTI",
    year: 2022,
    price: 33500,
    km: 29400,
    fuel: "Benzina",
    gearbox: "Manuale",
    power: 245,
    condition: "usata",
    image: "/generated/lucidatura-macro.webp",
    highlight: "Come nuova",
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
    image: "/generated/pelle-campionario.webp",
    highlight: "4x4",
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
    image: "/generated/hero.webp",
    highlight: "Cittadina ideale",
  },
];

export const newCars = cars.filter((c) => c.condition === "nuova");
export const usedCars = cars.filter((c) => c.condition === "usata");
