/**
 * Config delle animazioni "reveal" per-servizio del CarExplorer. Per ora solo
 * "Interni" (restauro-pelle): apertura sportello guidatore + abitacolo nuovo.
 * L'apertura è una sequenza di fotogrammi WebP "scrubbata" da un tween (vedi
 * CarDoorReveal): il frame 0 coincide col frame-ancora dello spin (stesso
 * start_image), il frame finale mostra l'interno.
 *
 * Questa mappa è il punto d'estensione: per aggiungere un reveal a un altro
 * servizio basta una nuova voce (e i relativi asset in public/home/<dir>).
 */
import { SPIN } from "./carSpin";
import { carSpots } from "./carSpots";
import { treatments } from "./treatments";

// Versione degli asset del reveal (stesso schema di SPIN_ASSET_VERSION): alzarla
// di 1 quando si sostituiscono i frame in public/home/interni-reveal.
export const REVEAL_ASSET_VERSION = 1;

export interface CarReveal {
  /** id del servizio (deve esistere in treatments.ts e in carSpots.ts). */
  id: string;
  /** Fotogramma dello spin usato come ancora (rotazione + frame 0 dell'apertura). */
  anchorFrame: number;
  /** Numero di fotogrammi WebP dell'apertura (frame-000..frame-(N-1)). */
  frameCount: number;
  /** Cartella pubblica dei frame (senza slash finale). */
  dir: string;
  /** Colore/mood della pelle, usato anche per l'alt dell'immagine. */
  seatColor: string;
}

const REVEALS: readonly CarReveal[] = [
  {
    id: "restauro-pelle",
    anchorFrame: 4,
    // 61 fotogrammi estratti dal clip seedance (source 0..120, uno ogni 2),
    // dissolvenza bordi verso #000 bakata (rampa 100/80/100).
    frameCount: 61,
    dir: "/home/interni-reveal",
    seatColor: "cognac",
  },
];

export function getReveal(id: string): CarReveal | undefined {
  return REVEALS.find((r) => r.id === id);
}

/** Path del fotogramma `i` dell'apertura (clampato), con cache-busting. */
export function revealFrameSrc(reveal: CarReveal, i: number): string {
  const idx = Math.max(0, Math.min(reveal.frameCount - 1, Math.round(i)));
  return `${reveal.dir}/frame-${String(idx).padStart(3, "0")}.webp?v=${REVEAL_ASSET_VERSION}`;
}

/** Progress del tween (0..1) → indice di fotogramma (0..frameCount-1). */
export function revealProgressToFrame(progress: number, frameCount: number): number {
  const p = Math.max(0, Math.min(1, progress));
  return Math.round(p * (frameCount - 1));
}

// Guardie d'integrità a caricamento modulo (come carSpots.ts).
for (const r of REVEALS) {
  if (!treatments.some((t) => t.id === r.id)) {
    throw new Error(`carReveal: id "${r.id}" non presente in treatments.ts`);
  }
  const spot = carSpots.find((s) => s.id === r.id);
  if (!spot) {
    throw new Error(`carReveal: id "${r.id}" non presente in carSpots.ts`);
  }
  if (spot.anchorFrame !== r.anchorFrame) {
    throw new Error(
      `carReveal: anchorFrame ${r.anchorFrame} ≠ carSpots ${spot.anchorFrame} per "${r.id}"`,
    );
  }
  if (r.anchorFrame < 0 || r.anchorFrame > SPIN.frameCount - 1) {
    throw new Error(`carReveal: anchorFrame ${r.anchorFrame} fuori range per "${r.id}"`);
  }
  if (r.frameCount < 2) {
    throw new Error(`carReveal: frameCount ${r.frameCount} troppo basso per "${r.id}"`);
  }
}
