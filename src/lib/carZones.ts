import { treatments } from "@/lib/treatments";

/**
 * Geometria degli hotspot sull'immagine dell'auto (nuovaautomodello-cutout,
 * sezione CarExplorer). Separata dai contenuti: i testi dei servizi vivono in
 * treatments.ts. Le coordinate sono in percentuale (0–100) rispetto al box
 * dell'immagine e vengono rifinite visivamente.
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
  /** Ritaglio trasparente della sola parte (stessa tela 2000×1115 del base).
   *  Se presente, attiva l'isolamento all'hover; se assente la zona mantiene
   *  il comportamento attuale (nessun isolamento). */
  part?: string;
  /** Opacità del livello parte quando è in focus (default 0.4). Da alzare per
   *  cutout scuri che altrimenti si perderebbero sul fondo (es. auto nera). */
  partOpacity?: number;
  /** Luminosità del livello parte (CSS brightness, default 1 = nessun filtro).
   *  Serve a staccare dal fondo scuro un cutout intrinsecamente scuro. */
  partBrightness?: number;
}

/** Servizio attivo all'apertura (così il pannello non è mai vuoto). */
export const DEFAULT_ZONE_ID: TreatmentId = "lucidatura";

export const carZones: readonly CarZone[] = [
  { id: "centraline", label: "Motore", point: { x: 26, y: 50 }, hit: { x: 26, y: 50, rx: 8, ry: 9 }, part: "/home/parts/centraline-cutout.webp" },
  { id: "trattamento-vetri", label: "Vetri", point: { x: 40, y: 22 }, hit: { x: 40, y: 22, rx: 11, ry: 9 }, part: "/home/parts/trattamento-vetri-cutout.webp", partOpacity: 0.85, partBrightness: 1.8 },
  { id: "restauro-pelle", label: "Interni", point: { x: 60, y: 46 }, hit: { x: 60, y: 46, rx: 8, ry: 14 }, part: "/home/parts/restauro-pelle-cutout.webp" },
  { id: "lucidatura", label: "Carrozzeria", point: { x: 93, y: 31 }, hit: { x: 93, y: 31, rx: 7, ry: 13 } },
  { id: "car-detailing", label: "Cofano", point: { x: 16, y: 34 }, hit: { x: 16, y: 34, rx: 7, ry: 8 } },
] as const;

// Guardia d'integrità a caricamento modulo: ogni zona deve corrispondere a un
// servizio esistente in treatments.ts; se ha un `part`, non dev'essere vuoto.
for (const z of carZones) {
  if (!treatments.some((t) => t.id === z.id)) {
    throw new Error(`carZones: id "${z.id}" non presente in treatments.ts`);
  }
  if (z.part !== undefined && z.part.trim() === "") {
    throw new Error(`carZones: "part" vuoto per la zona "${z.id}"`);
  }
}
