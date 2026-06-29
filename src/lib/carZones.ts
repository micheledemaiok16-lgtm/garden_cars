import { treatments } from "@/lib/treatments";

/**
 * Geometria degli hotspot sull'immagine auto3d (sezione CarExplorer).
 * Separata dai contenuti: i testi dei servizi vivono in treatments.ts.
 * Le coordinate sono in percentuale (0–100) rispetto al box dell'immagine
 * e vengono rifinite visivamente (vedi piano, Task 5).
 */

/** id dei servizi mappati sull'auto (sottoinsieme degli id di treatments.ts). */
export type TreatmentId =
  | "centraline"
  | "lucidatura"
  | "restauro-pelle"
  | "trattamento-vetri"
  | "car-detailing";

export interface CarZone {
  /** Servizio collegato (anche ancora /trattamenti#<id>). */
  id: TreatmentId;
  /** Etichetta breve per la nav mobile/legenda. */
  label: string;
  /** Fuoco dello spotlight + posizione del marker, in %. */
  point: { x: number; y: number };
  /** Area sensibile all'hover/tap (ellisse), in %. */
  hit: { x: number; y: number; rx: number; ry: number };
}

/** Servizio attivo all'apertura (così il pannello non è mai vuoto). */
export const DEFAULT_ZONE_ID: TreatmentId = "lucidatura";

export const carZones: readonly CarZone[] = [
  { id: "centraline", label: "Motore", point: { x: 26, y: 47 }, hit: { x: 26, y: 47, rx: 10, ry: 12 } },
  { id: "trattamento-vetri", label: "Vetri", point: { x: 41, y: 23 }, hit: { x: 41, y: 23, rx: 12, ry: 9 } },
  { id: "restauro-pelle", label: "Interni", point: { x: 61, y: 42 }, hit: { x: 61, y: 42, rx: 11, ry: 14 } },
  { id: "lucidatura", label: "Carrozzeria", point: { x: 87, y: 37 }, hit: { x: 87, y: 37, rx: 10, ry: 15 } },
  { id: "car-detailing", label: "Ruote", point: { x: 45, y: 70 }, hit: { x: 45, y: 70, rx: 9, ry: 10 } },
] as const;

// Guardia d'integrità a caricamento modulo: ogni zona deve corrispondere a un
// servizio esistente in treatments.ts. Fallisce il build se un id è sbagliato.
for (const z of carZones) {
  if (!treatments.some((t) => t.id === z.id)) {
    throw new Error(`carZones: id "${z.id}" non presente in treatments.ts`);
  }
}
