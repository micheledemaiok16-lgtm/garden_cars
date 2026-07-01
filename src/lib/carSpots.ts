import type { SpotSample } from "./carSpin";
import { SPIN } from "./carSpin";
import { treatments } from "./treatments";

/** id dei servizi mappati sull'auto (sottoinsieme degli id di treatments.ts). */
export type TreatmentId =
  | "centraline"
  | "lucidatura"
  | "restauro-pelle"
  | "trattamento-vetri"
  | "car-detailing";

/**
 * Pallini dei servizi ancorati ai punti dell'auto lungo la rotazione. Ogni
 * servizio ha campioni {frame,x,y,visible} interpolati da resolveSpot. x/y in %
 * del box immagine. anchorFrame = fotogramma su cui la parte è meglio visibile
 * (usato da ZoneNav/pallini per portare l'auto lì). I valori sono iniziali e
 * vanno rifiniti visivamente sui fotogrammi reali (vedi piano, Task 9).
 */
export interface CarSpot {
  id: TreatmentId;
  label: string;
  anchorFrame: number;
  samples: SpotSample[];
}

// Valori di partenza: auto che ruota da front-3/4 (frame 0) a rear-3/4 (frame 35).
export const carSpots: readonly CarSpot[] = [
  {
    id: "centraline",
    label: "Motore",
    anchorFrame: 4,
    samples: [
      { frame: 0, x: 22, y: 56, visible: true },
      { frame: 4, x: 16, y: 57, visible: true },
      { frame: 12, x: 12, y: 58, visible: false },
    ],
  },
  {
    id: "trattamento-vetri",
    label: "Vetri",
    anchorFrame: 16,
    samples: [
      { frame: 6, x: 44, y: 46, visible: false },
      { frame: 14, x: 46, y: 45, visible: true },
      { frame: 22, x: 54, y: 45, visible: true },
      { frame: 30, x: 60, y: 46, visible: false },
    ],
  },
  {
    id: "restauro-pelle",
    label: "Interni",
    anchorFrame: 18,
    samples: [
      { frame: 8, x: 42, y: 50, visible: false },
      { frame: 18, x: 46, y: 50, visible: true },
      { frame: 28, x: 54, y: 50, visible: false },
    ],
  },
  {
    id: "lucidatura",
    label: "Carrozzeria",
    anchorFrame: 18,
    samples: [
      { frame: 4, x: 44, y: 60, visible: true },
      { frame: 18, x: 50, y: 62, visible: true },
      { frame: 34, x: 60, y: 60, visible: true },
    ],
  },
  {
    id: "car-detailing",
    label: "Detailing",
    anchorFrame: 26,
    samples: [
      { frame: 14, x: 70, y: 72, visible: false },
      { frame: 24, x: 76, y: 73, visible: true },
      { frame: 35, x: 82, y: 72, visible: true },
    ],
  },
];

// Guardia d'integrità a caricamento modulo (come carZones.ts): id esistente e
// campioni entro il range dei fotogrammi.
for (const s of carSpots) {
  if (!treatments.some((t) => t.id === s.id)) {
    throw new Error(`carSpots: id "${s.id}" non presente in treatments.ts`);
  }
  for (const smp of s.samples) {
    if (smp.frame < 0 || smp.frame > SPIN.frameCount - 1) {
      throw new Error(`carSpots: frame ${smp.frame} fuori range per "${s.id}"`);
    }
  }
}
