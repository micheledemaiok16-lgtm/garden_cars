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
// Giro 360° su 72 frame: 0=3/4 ant. sx, ~9=fiancata sx, ~18=3/4 post. sx,
// ~27=retro, ~45=fiancata dx, ~62=muso frontale, ~71≈ritorno al 3/4 ant. sx.
// Ogni servizio è ancorato all'angolo dove la sua parte è meglio visibile e
// distribuito lungo il giro. Valori rifiniti visivamente sui frame reali.
export const carSpots: readonly CarSpot[] = [
  {
    id: "centraline",
    label: "Motore",
    anchorFrame: 62, // muso frontale (griglia + anelli)
    samples: [
      { frame: 55, x: 42, y: 58, visible: false },
      { frame: 62, x: 50, y: 66, visible: true },
      { frame: 69, x: 58, y: 58, visible: false },
    ],
  },
  {
    id: "trattamento-vetri",
    label: "Vetri",
    anchorFrame: 9, // finestrini, fiancata sinistra
    samples: [
      { frame: 2, x: 55, y: 24, visible: false },
      { frame: 9, x: 50, y: 27, visible: true },
      { frame: 16, x: 47, y: 30, visible: false },
    ],
  },
  {
    id: "restauro-pelle",
    label: "Interni",
    anchorFrame: 46, // abitacolo attraverso i vetri, fiancata destra
    samples: [
      { frame: 40, x: 46, y: 32, visible: false },
      { frame: 46, x: 50, y: 32, visible: true },
      { frame: 52, x: 56, y: 32, visible: false },
    ],
  },
  {
    id: "lucidatura",
    label: "Carrozzeria",
    anchorFrame: 4, // 3/4 anteriore sinistro (anche vista d'apertura)
    samples: [
      { frame: 0, x: 36, y: 48, visible: true },
      { frame: 4, x: 42, y: 50, visible: true },
      { frame: 12, x: 52, y: 54, visible: false },
    ],
  },
  {
    id: "car-detailing",
    label: "Detailing",
    anchorFrame: 6, // ruota anteriore sinistra
    samples: [
      { frame: 1, x: 34, y: 72, visible: false },
      { frame: 6, x: 30, y: 72, visible: true },
      { frame: 12, x: 40, y: 73, visible: false },
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
