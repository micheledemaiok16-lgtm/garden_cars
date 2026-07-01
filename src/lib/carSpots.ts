import type { SpotSample } from "./carSpin";
import { SPIN } from "./carSpin";
import type { TreatmentId } from "./carZones";
import { treatments } from "./treatments";

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
      { frame: 0, x: 24, y: 58, visible: true },
      { frame: 8, x: 18, y: 58, visible: true },
      { frame: 16, x: 12, y: 58, visible: false },
    ],
  },
  {
    id: "trattamento-vetri",
    label: "Vetri",
    anchorFrame: 14,
    samples: [
      { frame: 4, x: 52, y: 34, visible: false },
      { frame: 12, x: 48, y: 32, visible: true },
      { frame: 24, x: 52, y: 32, visible: true },
      { frame: 32, x: 58, y: 34, visible: false },
    ],
  },
  {
    id: "restauro-pelle",
    label: "Interni",
    anchorFrame: 18,
    samples: [
      { frame: 8, x: 50, y: 46, visible: false },
      { frame: 16, x: 50, y: 46, visible: true },
      { frame: 26, x: 54, y: 46, visible: false },
    ],
  },
  {
    id: "lucidatura",
    label: "Carrozzeria",
    anchorFrame: 20,
    samples: [
      { frame: 6, x: 40, y: 62, visible: true },
      { frame: 20, x: 50, y: 62, visible: true },
      { frame: 34, x: 62, y: 62, visible: true },
    ],
  },
  {
    id: "car-detailing",
    label: "Detailing",
    anchorFrame: 28,
    samples: [
      { frame: 18, x: 66, y: 74, visible: false },
      { frame: 28, x: 70, y: 74, visible: true },
      { frame: 35, x: 78, y: 74, visible: true },
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
