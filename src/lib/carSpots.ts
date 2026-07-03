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

// Giro completo su 144 frame estratti dallo stesso video orbitale, ri-timato
// a velocità angolare costante (frame ∝ angolo, 2.5°/frame). Mappa pose→frame
// misurata sul video rigenerato (simmetria sagoma + estremi bbox):
// 0=3/4 ant. sx, ~18=muso frontale, ~54=fiancata dx, ~90=retro,
// ~126=fiancata sx, ~143≈ritorno al 3/4 ant. sx. Gli x/y provengono dalla
// taratura precedente e vanno rifiniti visivamente sui nuovi fotogrammi
// (lavoro rimandato, vedi piano).
export const carSpots: readonly CarSpot[] = [
  {
    id: "centraline",
    label: "Motore",
    anchorFrame: 18, // muso frontale (griglia + anelli)
    samples: [
      { frame: 5, x: 58, y: 58, visible: false },
      { frame: 18, x: 50, y: 66, visible: true },
      { frame: 33, x: 42, y: 58, visible: false },
    ],
  },
  {
    id: "trattamento-vetri",
    label: "Vetri",
    anchorFrame: 126, // finestrini, fiancata sinistra
    samples: [
      { frame: 112, x: 47, y: 30, visible: false },
      { frame: 126, x: 50, y: 27, visible: true },
      { frame: 140, x: 55, y: 24, visible: false },
    ],
  },
  {
    id: "restauro-pelle",
    label: "Interni",
    anchorFrame: 4, // 3/4 anteriore sx = portiera guidatore (ancora del reveal "Interni")
    // NB: i samples non sono più usati (pallini rimossi); mantenuti in range per
    // un'eventuale reintroduzione futura.
    samples: [
      { frame: 40, x: 56, y: 32, visible: false },
      { frame: 52, x: 50, y: 32, visible: true },
      { frame: 64, x: 46, y: 32, visible: false },
    ],
  },
  {
    id: "lucidatura",
    label: "Carrozzeria",
    anchorFrame: 136, // 3/4 anteriore sinistro (anche vista d'apertura)
    samples: [
      // La visibilità attraversa la giunzione (136→144≡0): il campione a 0
      // tiene il pallino acceso all'apertura, la guardia a 9 lo spegne
      // subito dopo, e resta spento fino alla dissolvenza in ingresso a 120.
      { frame: 0, x: 36, y: 48, visible: true },
      { frame: 9, x: 42, y: 50, visible: false },
      { frame: 120, x: 52, y: 54, visible: false },
      { frame: 136, x: 42, y: 50, visible: true },
    ],
  },
  {
    id: "car-detailing",
    label: "Detailing",
    anchorFrame: 132, // ruota anteriore sinistra
    samples: [
      { frame: 120, x: 40, y: 73, visible: false },
      { frame: 132, x: 30, y: 72, visible: true },
      { frame: 142, x: 34, y: 72, visible: false },
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
