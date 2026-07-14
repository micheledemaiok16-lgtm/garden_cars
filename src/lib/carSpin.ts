/**
 * Configurazione della sequenza di rotazione dell'auto (sezione CarExplorer) e
 * funzioni pure per mappare la posizione di trascinamento sul fotogramma e per
 * risolvere la posizione/opacità dei pallini lungo la rotazione.
 *
 * Tutto è agnostico rispetto a `frameCount` e `arcDegrees`: per passare da 180°
 * a 360° basta rigenerare più fotogrammi (alzare frameCount), mettere wrap=true
 * e aggiungere campioni ai pallini. Il resto del codice non cambia.
 */
// Versione degli asset dello spin (video, poster e fotogrammi WebP condividono
// lo stesso nome file a ogni rigenerazione): alzarla di 1 quando si
// sostituiscono i file in public/home/spin, così browser e CDN non servono
// le versioni vecchie dalla cache.
export const SPIN_ASSET_VERSION = 3;

export const SPIN = {
  frameCount: 144,
  arcDegrees: 360,
  // Il giro è un loop 360° vero: la sorgente parte e finisce sullo stesso
  // fotogramma (start=end), quindi si richiude senza "scatto". wrap:true →
  // rotazione continua e infinita in entrambi i sensi.
  wrap: true,
  srcFor: (i: number) =>
    `/home/spin/frame-${String(i).padStart(3, "0")}.webp?v=${SPIN_ASSET_VERSION}`,
};

/** Riporta un frame (anche frazionario) nel range valido: clamp o wrap. */
export function normalizeFrame(
  frame: number,
  count: number = SPIN.frameCount,
  wrap: boolean = SPIN.wrap,
): number {
  if (wrap) return ((frame % count) + count) % count;
  return Math.max(0, Math.min(count - 1, frame));
}

/** Indice intero del fotogramma da mostrare. */
export function frameIndex(
  frame: number,
  count: number = SPIN.frameCount,
  wrap: boolean = SPIN.wrap,
): number {
  return Math.round(normalizeFrame(frame, count, wrap)) % count;
}

/**
 * Distanza minima (con segno) tra due fotogrammi su un giro. Con wrap sceglie il
 * percorso più corto (anche attraverso la giunzione FC-1→0): il segno indica il
 * verso, |risultato| il numero di passi. Usata per capire quando la rotazione ha
 * raggiunto un'ancora.
 */
export function frameDistance(
  from: number,
  to: number,
  count: number = SPIN.frameCount,
  wrap: boolean = SPIN.wrap,
): number {
  if (!wrap) return to - from;
  const raw = (((to - from) % count) + count) % count; // 0..count
  return raw > count / 2 ? raw - count : raw;
}

export type SpotSample = { frame: number; x: number; y: number; visible: boolean };
export type ResolvedSpot = { x: number; y: number; opacity: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Posizione (x/y in %) e opacità di un pallino a un dato frame frazionario.
 * I `samples` devono essere ordinati per `frame` crescente. Fuori dagli estremi
 * si usano il primo/ultimo campione. `visible` è trattato come 1/0 e interpolato
 * per ottenere una dissolvenza morbida.
 */
export function resolveSpot(samples: SpotSample[], frame: number): ResolvedSpot {
  if (samples.length === 0) return { x: 0, y: 0, opacity: 0 };
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (frame <= first.frame) return { x: first.x, y: first.y, opacity: first.visible ? 1 : 0 };
  if (frame >= last.frame) return { x: last.x, y: last.y, opacity: last.visible ? 1 : 0 };

  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i];
    const b = samples[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const t = (frame - a.frame) / (b.frame - a.frame);
      return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
        opacity: lerp(a.visible ? 1 : 0, b.visible ? 1 : 0, t),
      };
    }
  }
  return { x: last.x, y: last.y, opacity: last.visible ? 1 : 0 };
}
