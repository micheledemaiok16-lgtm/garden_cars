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

// Giro completo su 144 frame estratti dallo stesso video orbitale (base ×2
// rispetto ai vecchi 72). Mappa pose→frame: 0=3/4 ant. sx, ~18=fiancata sx,
// ~36=3/4 post. sx, ~54=retro, ~90=fiancata dx, ~124=muso frontale,
// ~143≈ritorno al 3/4 ant. sx. Ogni servizio è ancorato all'angolo dove la sua
// parte è meglio visibile e distribuito lungo il giro. Valori rifiniti sui frame.
export const carSpots: readonly CarSpot[] = [
  {
    id: "centraline",
    label: "Motore",
    anchorFrame: 124, // muso frontale (griglia + anelli)
    samples: [
      { frame: 110, x: 42, y: 58, visible: false },
      { frame: 124, x: 50, y: 66, visible: true },
      { frame: 138, x: 58, y: 58, visible: false },
    ],
  },
  {
    id: "trattamento-vetri",
    label: "Vetri",
    anchorFrame: 18, // finestrini, fiancata sinistra
    samples: [
      { frame: 4, x: 55, y: 24, visible: false },
      { frame: 18, x: 50, y: 27, visible: true },
      { frame: 32, x: 47, y: 30, visible: false },
    ],
  },
  {
    id: "restauro-pelle",
    label: "Interni",
    anchorFrame: 92, // abitacolo attraverso i vetri, fiancata destra
    samples: [
      { frame: 80, x: 46, y: 32, visible: false },
      { frame: 92, x: 50, y: 32, visible: true },
      { frame: 104, x: 56, y: 32, visible: false },
    ],
  },
  {
    id: "lucidatura",
    label: "Carrozzeria",
    anchorFrame: 8, // 3/4 anteriore sinistro (anche vista d'apertura)
    samples: [
      { frame: 0, x: 36, y: 48, visible: true },
      { frame: 8, x: 42, y: 50, visible: true },
      { frame: 24, x: 52, y: 54, visible: false },
    ],
  },
  {
    id: "car-detailing",
    label: "Detailing",
    anchorFrame: 12, // ruota anteriore sinistra
    samples: [
      { frame: 2, x: 34, y: 72, visible: false },
      { frame: 12, x: 30, y: 72, visible: true },
      { frame: 24, x: 40, y: 73, visible: false },
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
