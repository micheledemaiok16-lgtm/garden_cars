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
  { id: "centraline", label: "Motore", point: { x: 25, y: 52 }, hit: { x: 25, y: 52, rx: 11, ry: 13 } },
  { id: "trattamento-vetri", label: "Vetri", point: { x: 38, y: 22 }, hit: { x: 40, y: 23, rx: 14, ry: 10 } },
  { id: "restauro-pelle", label: "Interni", point: { x: 62, y: 42 }, hit: { x: 62, y: 44, rx: 12, ry: 16 } },
  { id: "lucidatura", label: "Carrozzeria", point: { x: 85, y: 30 }, hit: { x: 85, y: 32, rx: 12, ry: 18 } },
  { id: "car-detailing", label: "Ruote", point: { x: 60, y: 73 }, hit: { x: 60, y: 74, rx: 10, ry: 12 } },
] as const;

// Guardia d'integrità a caricamento modulo: ogni zona deve corrispondere a un
// servizio esistente in treatments.ts. Fallisce il build se un id è sbagliato.
for (const z of carZones) {
  if (!treatments.some((t) => t.id === z.id)) {
    throw new Error(`carZones: id "${z.id}" non presente in treatments.ts`);
  }
}
