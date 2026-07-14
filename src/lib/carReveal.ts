/**
 * Config delle animazioni "reveal" per-servizio del CarExplorer: "Interni"
 * (apertura sportello guidatore + abitacolo nuovo) e "Motore" (cofano che si
 * apre, vano motore dall'alto). L'apertura è una sequenza di fotogrammi WebP
 * "scrubbata" da un tween (vedi CarDoorReveal): il frame 0 coincide col
 * frame-ancora dello spin (stesso start_image), il frame finale mostra il
 * soggetto rivelato.
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
  /** Testo alternativo dell'immagine dell'overlay (stato aperto). */
  alt: string;
  /**
   * Durata (ms) dello scrub di apertura/chiusura a RITMO COSTANTE, come una
   * riproduzione video: preserva il movimento nativo del clip. Assenti →
   * ease-out esponenziale di CarDoorReveal (0.14 / 0.16, tarato sullo
   * sportello, che con la sua corsa breve regge il ritmo "scattante").
   */
  openMs?: number;
  closeMs?: number;
  /**
   * true → da aperto l'effetto va in LOOP ping-pong: scrub 0→1, pausa,
   * 1→0, pausa, e ricomincia (ritmo = openMs, obbligatorio col loop). Serve
   * per gli effetti "di stato" (es. l'oscuramento vetri) dove vale la pena
   * mostrare la trasformazione più volte. La chiusura resta il solito
   * reverse (closeMs) dal punto in cui si trova.
   */
  loop?: boolean;
  /** Pausa (ms) agli estremi del loop; default in CarDoorReveal. */
  loopHoldMs?: number;
}

export const reveals: readonly CarReveal[] = [
  {
    id: "restauro-pelle",
    anchorFrame: 4,
    // 61 fotogrammi estratti dal clip seedance (source 0..120, uno ogni 2),
    // dissolvenza bordi verso #000 bakata (rampa 100/80/100).
    frameCount: 61,
    dir: "/home/interni-reveal",
    alt: "Abitacolo restaurato in pelle cognac: sedili e volante nuovi",
    // Apertura = video a 1.2× (sorgente 121f/24fps ≈ 5.04s → 4200ms), come
    // Vetri/Detailing (l'ease-out di default risultava troppo veloce).
    openMs: 4200,
    closeMs: 1260,
  },
  {
    id: "centraline",
    anchorFrame: 18,
    // 61 fotogrammi estratti dal clip seedance del cofano (source 0..120,
    // uno ogni 2), stessa dissolvenza bordi gentile di interni-reveal.
    frameCount: 61,
    dir: "/home/centralina-reveal",
    alt: "Cofano aperto sul vano motore visto dall'alto: rimappatura della centralina",
    // La corsa è lunga (push-in dal muso + cofano + salita sopra il vano):
    // scrub a ritmo costante (sorgente 121f/24fps ≈ 5.04s). Apertura = video
    // a 4× (1260ms), chiusura in reverse = video a 4.5× (1120ms).
    openMs: 1260,
    closeMs: 1120,
  },
  {
    id: "trattamento-vetri",
    anchorFrame: 126,
    // 61 fotogrammi estratti dal clip seedance dell'oscuramento progressivo
    // (fiancata sinistra, vetri da semi-trasparenti a tinta nera piena).
    frameCount: 61,
    dir: "/home/vetri-reveal",
    alt: "Vetri laterali che si oscurano progressivamente fino alla tinta nera",
    // Trasformazione di stato → loop ping-pong: oscura (1.2×, sorgente
    // 121f/24fps ≈ 5.04s → 4200ms) → pausa → schiarisce → pausa → ripete.
    // Chiusura in reverse a 4×.
    openMs: 4200,
    closeMs: 1260,
    loop: true,
    loopHoldMs: 1100,
  },
  {
    id: "lucidatura",
    anchorFrame: 136,
    // 61 fotogrammi estratti dal clip seedance della "lama di luce": una
    // striscia di riflesso scorre sulla carrozzeria e accende il nero a
    // specchio (la vernice dello spin è già lucida: l'effetto è la passata).
    frameCount: 61,
    dir: "/home/lucidatura-reveal",
    alt: "Passata di lucidatura: una lama di luce accende la vernice nera a specchio",
    // Loop ping-pong = la passata va e viene, come una lucidatrice al lavoro.
    openMs: 2520,
    closeMs: 1260,
    loop: true,
    loopHoldMs: 700,
  },
  {
    id: "car-detailing",
    anchorFrame: 132,
    // 61 fotogrammi estratti dal clip seedance del lavaggio: schiuma sulla
    // ruota anteriore sx → risciacquo → cerchio pulito e brillante.
    frameCount: 61,
    dir: "/home/detailing-reveal",
    alt: "Lavaggio di dettaglio: schiuma e risciacquo sulla ruota, cerchio brillante",
    // Arco narrativo (schiuma→risciacquo) → niente loop: one-way con hold
    // sul pulito; chiusura = rewind rapido. Apertura = video a 1.7×
    // (sorgente 121f/24fps ≈ 5.04s → 2965ms).
    openMs: 2965,
    closeMs: 1260,
  },
  {
    id: "antifurto",
    anchorFrame: 136,
    // 61 fotogrammi estratti dal clip seedance dell'allarme: le frecce del
    // lato sinistro (anteriore, specchietto, posteriore) lampeggiano 2-3
    // volte in arancio con riflesso sulla fiancata nera, poi si spengono
    // (start = end, così il ping-pong non salta).
    frameCount: 61,
    dir: "/home/antifurto-reveal",
    alt: "Frecce che lampeggiano: l'allarme antifurto segnala il tentativo di apertura",
    // Effetto "di stato" → loop ping-pong come i vetri; hold un po' più
    // lungo a frecce spente così il lampeggio arriva a ondate. Ritmi
    // INDICATIVI (video a 4×): taratura finale sul clip reale in Task 5.
    openMs: 1260,
    closeMs: 1260,
    loop: true,
    loopHoldMs: 900,
  },
];

export function getReveal(id: string): CarReveal | undefined {
  return reveals.find((r) => r.id === id);
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
for (const r of reveals) {
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
