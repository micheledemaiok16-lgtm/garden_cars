# Interni — Apertura sportello + reveal abitacolo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cliccando la voce "Interni" nel CarExplorer (`#esplora`), l'auto ruota alla portiera guidatore, lo sportello si apre e rivela un abitacolo restaurato (sedili + volante nuovi, pelle cognac); rimuovere i pallini verdi.

**Architecture:** Animazione "parallela" allo spin 360. Un overlay `<img>` (frame WebP dell'apertura) sta SOPRA lo spin nello stesso box di `Car360` e viene "scrubbato" da un tween (apertura 0→1, chiusura reverse 1→0). Il fotogramma 0 dell'apertura coincide col frame-ancora dello spin (stesso `start_image`) → comparsa/sparizione invisibili. Lo spin viene "sospeso" mentre la porta è aperta semplicemente tenendo `targetFrame = anchorFrame` (meccanismo già esistente in `Car360`): **Car360 non va modificato**.

**Tech Stack:** Next.js (fork modificato — vedi Global Constraints), React client components, framer-motion (già in uso), rAF + swap opacità in DOM diretto, ffmpeg per la pipeline asset, Higgsfield MCP (`seedance_2_0_mini`) per generare il clip, Playwright MCP per la verifica browser, vitest per la logica pura.

## Global Constraints

- **Next fork:** questo NON è il Next.js standard. Prima di scrivere codice che tocca API Next, leggere la guida in `node_modules/next/dist/docs/`. Qui si toccano quasi solo client component React, ma la regola vale.
- **Lingua:** commenti e stringhe UI in italiano, con accenti corretti (à è é ì ò ù). Identificatori di codice in inglese come nel resto del progetto.
- **Commit:** l'utente tiene il WIP su `main` e **non** vuole commit automatici. Ogni "Checkpoint" del piano = fermarsi, far verificare, e committare **solo** se l'utente lo chiede esplicitamente. Prima di un eventuale commit: `git diff --cached --name-only` (lo snapshot di staging può essere stale) ed **escludere** i 144 `public/home/spin/frame-*.webp` già modificati e i PNG untracked preesistenti, che non fanno parte di questa feature.
- **Dev server:** può girare su `:3001` (non `:3000`). Verificare la porta prima di Playwright. Per gli screenshot usare `animations:'disabled'`.
- **Bordi verso #000:** ogni nuovo asset visivo (i frame dell'apertura) deve avere la stessa dissolvenza smoothstep verso il nero già bakata nello spin, altrimenti l'overlay disegna un rettangolo sul fondo nero.
- **Niente seek dell'mp4** per lo scrubbing (è a scatti): solo swap di `<img>` su frame WebP precaricati.
- **Verifiche:** `npx tsc --noEmit`, `npm run lint`, `npx vitest run` devono restare verdi a ogni task che tocca codice.
- **Crediti Higgsfield:** ~75 residui. `get_cost`/`balance` PRIMA di ogni generazione. Preventivare 1-2 tentativi per il clip.

---

### Task 1: Bloccare il frame-ancora della portiera guidatore

Determina quale fotogramma dello spin è la posa "3/4 anteriore sinistro / portiera guidatore" da usare come ancora (rotazione target, `start_image` della generazione, e frame 0 dell'overlay). Il piano assume **N = 4**; questo task conferma o corregge il numero un'unica volta.

**Files:**
- Nessuna modifica di codice qui (solo ispezione). Il valore scelto viene usato in Task 4 e Task 5.

- [ ] **Step 1: Generare un contact-sheet dei candidati**

I frame dello spin sono in `public/home/spin/frame-000.webp` … `frame-143.webp`. La mappa pose (da `carSpots.ts`): `0 = 3/4 ant. sx`, `~18 = muso`, `~54 = fiancata dx`, `~90 = retro`, `~126 = fiancata sx`. La portiera guidatore (sx) è ben inquadrata nell'intorno di 0 (0–8) e verso 126–143.

Creare un montaggio dei candidati (0,2,4,6,8,140,142) per scegliere a vista:

```bash
cd "C:/Users/miche/Desktop/Lavori/Quantor/Gardens-cars"
mkdir -p "$CLAUDE_JOB_DIR/tmp/anchor"
for n in 000 002 004 006 008 140 142; do \
  ffmpeg -y -i "public/home/spin/frame-$n.webp" -vf "scale=320:-1,drawtext=text='$n':x=8:y=8:fontcolor=white:fontsize=22:box=1:boxcolor=black@0.6" "$CLAUDE_JOB_DIR/tmp/anchor/c-$n.png"; done
ffmpeg -y -pattern_type glob -i "$CLAUDE_JOB_DIR/tmp/anchor/c-*.png" -vf "tile=7x1" "$CLAUDE_JOB_DIR/tmp/anchor/sheet.png"
```

Nota: se `drawtext` dà segfault fontconfig (successo in passato), togliere il filtro `drawtext` e rinominare i file di output con l'indice.

- [ ] **Step 2: Scegliere l'ancora**

Aprire `sheet.png` (via Read) e scegliere il frame dove la **portiera del guidatore** è inquadrata meglio per un'apertura verso la camera (si deve intuire il volante/sedile). Default consigliato: **4**. Annotare il numero scelto (useremo `N` nel resto del piano).

- [ ] **Step 3: Checkpoint**

Nessun file cambiato. Confermare il valore `N` (il piano prosegue con `N = 4`; se hai scelto altro, sostituisci `4` con `N` in Task 4 e Task 5). Niente commit.

---

### Task 2: Rimuovere i pallini verdi

Elimina l'overlay dei pallini (`CarSpots`) e lo sgancia da `CarExplorer`. L'auto resta pulita; restano le etichette-testo sotto (`ZoneNav`). L'app continua a compilare e girare (spin senza pallini).

**Files:**
- Delete: `src/components/sections/CarSpots.tsx`
- Modify: `src/components/sections/CarExplorer.tsx` (rimuovere import e uso di `CarSpots`)

- [ ] **Step 1: Eliminare il componente**

```bash
git rm "src/components/sections/CarSpots.tsx"
```

(Se preferisci non usare `git rm`: eliminare il file con l'editor. Il file NON deve più esistere.)

- [ ] **Step 2: Sganciare l'import in CarExplorer**

In `src/components/sections/CarExplorer.tsx` rimuovere la riga:

```tsx
import CarSpots from "./CarSpots";
```

- [ ] **Step 3: Rimuovere l'uso di `<CarSpots>`**

In `CarExplorer.tsx`, sostituire il blocco `<Car360 …>…</Car360>` così che Car360 non abbia più figli (temporaneamente): rimuovere l'elemento `<CarSpots … />` e le sue prop. Lasciare `<Car360 … />` autochiudente:

```tsx
<Car360
  initialFrame={INITIAL.anchorFrame}
  targetFrame={targetFrame}
  reduce={reduce}
  onFrameChange={setFrame}
  onGrab={handleGrab}
  showHint={!touched}
/>
```

- [ ] **Step 4: Verificare che compili e i test passino**

Run:
```bash
npx tsc --noEmit && npm run lint && npx vitest run
```
Expected: PASS (11 test). Nessun riferimento residuo a `CarSpots`.

- [ ] **Step 5: Checkpoint**

Pallini rimossi, app compila. Niente commit (solo su richiesta).

---

### Task 3: Aggiungere `frameDistance` a `carSpin.ts` (logica pura, TDD)

Serve una distanza minima con segno tra due frame su un giro (wrap), per capire quando la rotazione ha "raggiunto" l'ancora. Estratta come funzione pura testabile (oggi la logica shortest-path è inline in `Car360`).

**Files:**
- Modify: `src/lib/carSpin.ts` (aggiungere `frameDistance`)
- Test: `src/lib/carSpin.test.ts` (aggiungere un blocco `describe`)

**Interfaces:**
- Produces: `frameDistance(from: number, to: number, count?: number, wrap?: boolean): number` — distanza con segno lungo il percorso più corto; `|risultato|` = numero di passi minimo. Con `wrap=false` è semplicemente `to - from`.

- [ ] **Step 1: Scrivere il test che fallisce**

In `src/lib/carSpin.test.ts`, aggiungere in cima all'import esistente `frameDistance`:

```ts
import {
  SPIN,
  SPIN_ASSET_VERSION,
  normalizeFrame,
  frameIndex,
  resolveSpot,
  frameDistance,
} from "./carSpin";
```

E in fondo al file:

```ts
describe("frameDistance", () => {
  it("distanza semplice senza wrap", () => {
    expect(frameDistance(0, 5, 144, false)).toBe(5);
    expect(frameDistance(5, 0, 144, false)).toBe(-5);
  });
  it("prende il percorso più corto attraverso la giunzione (wrap)", () => {
    expect(frameDistance(143, 1, 144, true)).toBe(2);
    expect(frameDistance(1, 143, 144, true)).toBe(-2);
  });
  it("frame identici → 0", () => {
    expect(frameDistance(30, 30, 144, true)).toBe(0);
  });
});
```

- [ ] **Step 2: Eseguire il test → deve fallire**

Run: `npx vitest run src/lib/carSpin.test.ts`
Expected: FAIL (`frameDistance is not a function` / export mancante).

- [ ] **Step 3: Implementare `frameDistance`**

In `src/lib/carSpin.ts`, dopo `frameIndex`, aggiungere:

```ts
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
```

- [ ] **Step 4: Eseguire i test → devono passare**

Run: `npx vitest run src/lib/carSpin.test.ts`
Expected: PASS (14 test totali).

- [ ] **Step 5: Checkpoint** — niente commit (solo su richiesta).

---

### Task 4: Config del reveal `carReveal.ts` (logica pura, TDD)

Sorgente di verità del reveal: mappa `id → config` (per ora solo `restauro-pelle`), resolver dei path frame e mapping progress→frame, guardie d'integrità a caricamento modulo. Punto d'estensione per i futuri servizi.

**Files:**
- Create: `src/lib/carReveal.ts`
- Create: `src/lib/carReveal.test.ts`
- Modify: `src/lib/carSpots.ts` (allineare `restauro-pelle.anchorFrame` a `N`)

**Interfaces:**
- Produces:
  - `type CarReveal = { id: string; anchorFrame: number; frameCount: number; dir: string; seatColor: string }`
  - `REVEAL_ASSET_VERSION: number`
  - `getReveal(id: string): CarReveal | undefined`
  - `revealFrameSrc(reveal: CarReveal, i: number): string` — path WebP con padding a 3 cifre + `?v=`
  - `revealProgressToFrame(progress: number, frameCount: number): number` — clamp 0..1 → indice 0..frameCount-1

- [ ] **Step 1: Allineare l'ancora in `carSpots.ts`**

In `src/lib/carSpots.ts`, nella voce `restauro-pelle`, cambiare `anchorFrame` da `52` a **`4`** (il valore `N` di Task 1) e aggiornare il commento. I `samples` di quella voce non sono più usati (i pallini sono stati rimossi) ma restano in range: lasciarli, aggiungendo una nota.

```ts
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
```

- [ ] **Step 2: Scrivere il test che fallisce**

Create `src/lib/carReveal.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  REVEAL_ASSET_VERSION,
  getReveal,
  revealFrameSrc,
  revealProgressToFrame,
} from "./carReveal";

describe("getReveal", () => {
  it("restituisce la config per restauro-pelle", () => {
    const r = getReveal("restauro-pelle");
    expect(r).toBeTruthy();
    expect(r?.anchorFrame).toBe(4);
    expect(r?.seatColor).toBe("cognac");
  });
  it("undefined per servizi senza reveal", () => {
    expect(getReveal("centraline")).toBeUndefined();
  });
});

describe("revealFrameSrc", () => {
  it("pad a 3 cifre, cartella e versione", () => {
    const r = getReveal("restauro-pelle")!;
    expect(revealFrameSrc(r, 0)).toBe(
      `/home/interni-reveal/frame-000.webp?v=${REVEAL_ASSET_VERSION}`,
    );
  });
  it("clampa fuori range", () => {
    const r = getReveal("restauro-pelle")!;
    expect(revealFrameSrc(r, -5)).toContain("frame-000.webp");
    expect(revealFrameSrc(r, 9999)).toContain(
      `frame-${String(r.frameCount - 1).padStart(3, "0")}.webp`,
    );
  });
});

describe("revealProgressToFrame", () => {
  it("mappa 0→0, 1→ultimo, 0.5→metà", () => {
    expect(revealProgressToFrame(0, 48)).toBe(0);
    expect(revealProgressToFrame(1, 48)).toBe(47);
    expect(revealProgressToFrame(0.5, 48)).toBe(24);
  });
  it("clampa oltre gli estremi", () => {
    expect(revealProgressToFrame(-1, 48)).toBe(0);
    expect(revealProgressToFrame(2, 48)).toBe(47);
  });
});
```

- [ ] **Step 3: Eseguire → deve fallire**

Run: `npx vitest run src/lib/carReveal.test.ts`
Expected: FAIL (modulo `carReveal` inesistente).

- [ ] **Step 4: Implementare `carReveal.ts`**

Create `src/lib/carReveal.ts`:

```ts
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
    // Provvisorio: aggiornato in fase di build asset (Task 5) al conteggio reale.
    frameCount: 48,
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
```

- [ ] **Step 5: Eseguire i test → devono passare**

Run: `npx vitest run` (tutto)
Expected: PASS (carSpin + carReveal). Nota: il test `revealProgressToFrame(...,48)` è generico e non dipende dal `frameCount` reale della config; il `frameCount` provvisorio 48 verrà aggiornato in Task 5 senza rompere i test.

- [ ] **Step 6: Checkpoint** — niente commit (solo su richiesta).

---

### Task 5: Generare e preparare l'asset dell'apertura (Higgsfield → WebP)

Genera il clip "sportello guidatore che si apre + abitacolo cognac", ancorato al frame `N` dello spin, poi lo estrae in frame WebP con la dissolvenza bordi verso #000 in `public/home/interni-reveal/`. Task procedurale (non-TDD). I tool Higgsfield sono deferred: caricarne lo schema con ToolSearch (`select:mcp__claude_ai_Higgsfield__balance,mcp__claude_ai_Higgsfield__generate_video,mcp__claude_ai_Higgsfield__media_upload,mcp__claude_ai_Higgsfield__media_confirm,mcp__claude_ai_Higgsfield__job_status,mcp__claude_ai_Higgsfield__reveal_generation`) prima dell'uso.

**Files:**
- Create: `public/home/interni-reveal/frame-000.webp` … `frame-(N-1).webp`
- Modify: `src/lib/carReveal.ts` (aggiornare `frameCount` al conteggio reale)

- [ ] **Step 1: Verificare crediti**

`mcp__claude_ai_Higgsfield__balance` → confermare ~75 residui. Poi `get_cost:true` sulla `generate_video` che segue prima di lanciarla davvero.

- [ ] **Step 2: Preparare lo `start_image` a 1280×720**

Il clip 720p esce 1280×720: lo start deve avere l'auto alla stessa frazione dello spin, per allineare lo swap. Upscalare il frame ancora:

```bash
cd "C:/Users/miche/Desktop/Lavori/Quantor/Gardens-cars"
ffmpeg -y -i "public/home/spin/frame-004.webp" -vf "scale=1280:720:flags=lanczos" "$CLAUDE_JOB_DIR/tmp/start-interni.png"
```

- [ ] **Step 3: Caricare lo start_image**

`media_upload` → PUT dei byte del PNG all'URL presigned (via `curl -X PUT`) → `media_confirm` → tenere il `media_id`.

- [ ] **Step 4: Generare il clip**

`mcp__claude_ai_Higgsfield__generate_video`, modello `seedance_2_0_mini`, `start_image = media_id`, **senza** `end_image` (non è un loop), `duration ≈ 4-5s`, `720p`, `bitrate_mode:"high"`, `generate_audio:false`. Se parte una `preset_recommendation`, rigenerare con `declined_preset_id`.

Prompt:
```
The car's driver-side front door slowly swings open outward, smoothly revealing a freshly restored interior: brand-new cognac leather seats and a new leather steering wheel with contrast stitching. The camera holds nearly still with a very slow, subtle push-in. The car body stays perfectly still, identical and undistorted — only the door moves and the cabin is revealed. Constant steady motion, smooth, cinematic, no jerk, no morphing. Pure black background.
```

- [ ] **Step 5: Attendere e scaricare**

`job_status` in polling; a `completed`, `reveal_generation` per l'URL; scaricare l'mp4 in `$CLAUDE_JOB_DIR/tmp/interni-open.mp4`.

- [ ] **Step 6: Ispezionare il risultato (gate qualità)**

Estrarre qualche frame e controllare a vista:
```bash
ffmpeg -y -i "$CLAUDE_JOB_DIR/tmp/interni-open.mp4" -vf "select='eq(n,0)+eq(n,20)+eq(n,60)+eq(n,120)',scale=360:-1" -vsync 0 "$CLAUDE_JOB_DIR/tmp/chk-%02d.png"
```
Criteri: (a) frame 0 ≈ lo spin (auto ferma, stessa posa); (b) la carrozzeria NON si deforma durante l'apertura; (c) lo sportello si apre e si vedono sedili + volante cognac. Se fallisce (a)/(b): rigenerare ritoccando il prompt (più "static body", meno push-in) — budget 1-2 tentativi. Se dopo 2 tentativi il corpo "muta" troppo → **fermarsi e avvisare l'utente** (fallback approccio (b), vedi spec §Rischi). NON procedere oltre in quel caso.

- [ ] **Step 7: Estrarre i frame dell'apertura, bakare i bordi, salvare i WebP**

Scegliere la finestra temporale dell'apertura (dal frame 0 a quando l'interno è pienamente visibile) e campionare a ~48 frame. Applicare la **stessa dissolvenza smoothstep verso #000** dello spin e salvare WebP numerati:

```bash
cd "C:/Users/miche/Desktop/Lavori/Quantor/Gardens-cars"
mkdir -p public/home/interni-reveal
# EDGE = geq smoothstep verso Y=16 (lati 175, alto 135, basso 140) + chroma verso 128, come lo spin.
EDGE="format=yuv420p,geq=lum='p(X,Y)*clip((min(min(X,W-1-X)/175,min(Y/135,(H-1-Y)/140)))*(min(min(X,W-1-X)/175,min(Y/135,(H-1-Y)/140)))*(3-2*min(min(X,W-1-X)/175,min(Y/135,(H-1-Y)/140))),0,1)+16*(1-clip((min(min(X,W-1-X)/175,min(Y/135,(H-1-Y)/140)))*(min(min(X,W-1-X)/175,min(Y/135,(H-1-Y)/140)))*(3-2*min(min(X,W-1-X)/175,min(Y/135,(H-1-Y)/140))),0,1))':cb='128+(cb(X,Y)-128)*clip((min(min(X,W-1-X)/175,min(Y/135,(H-1-Y)/140))),0,1)':cr='128+(cr(X,Y)-128)*clip((min(min(X,W-1-X)/175,min(Y/135,(H-1-Y)/140))),0,1)'"
# Estrai ~48 frame equispaziati sull'apertura (adatta -ss/-t alla finestra reale vista allo Step 6):
ffmpeg -y -ss 0 -t 2.4 -i "$CLAUDE_JOB_DIR/tmp/interni-open.mp4" -vf "fps=20,$EDGE" -q:v 2 "$CLAUDE_JOB_DIR/tmp/open-%03d.png"
```

Nota: il numero reale di PNG prodotti = `frameCount` (con `fps=20` su `2.4s` ≈ 48). Convertirli in WebP `frame-000.webp`… mantenendo l'indice **0-based**:

```bash
i=0; for f in "$CLAUDE_JOB_DIR"/tmp/open-*.png; do \
  printf -v out "public/home/interni-reveal/frame-%03d.webp" "$i"; \
  ffmpeg -y -i "$f" -q:v 82 "$out"; i=$((i+1)); done
echo "frameCount = $i"
```

- [ ] **Step 8: Verificare bordi e allineamento del frame 0**

Aprire (Read) `public/home/interni-reveal/frame-000.webp` e confrontarlo con `public/home/spin/frame-004.webp`: stessa posa/scala dell'auto (per lo swap invisibile) e bordi che sfumano a nero. Se il frame 0 è visibilmente diverso per scala/posizione, annotarlo: il crossfade da 140ms in `CarDoorReveal` lo maschera, ma se il salto è grosso rifare lo Step 2 con padding invece di scale.

- [ ] **Step 9: Aggiornare `frameCount`**

In `src/lib/carReveal.ts` impostare `frameCount` al valore stampato allo Step 7 (es. `48`). Rieseguire `npx vitest run` → PASS.

- [ ] **Step 10: Checkpoint** — mostrare all'utente 2-3 frame chiave dell'interno per conferma estetica. Niente commit (solo su richiesta).

---

### Task 6: Componente overlay `CarDoorReveal.tsx`

Overlay `<img>` sopra lo spin che precarica i frame dell'apertura e li scrubba con un tween rAF (apertura 0→1, chiusura 1→0), con crossfade di comparsa/sparizione e supporto reduced-motion + chiusura istantanea (drag). Verifica in browser in Task 8 (come `Car360`, i componenti d'animazione non hanno unit test jsdom; la logica pura è già testata in `carReveal`).

**Files:**
- Create: `src/components/sections/CarDoorReveal.tsx`

**Interfaces:**
- Consumes: `getReveal`, `revealFrameSrc`, `revealProgressToFrame` da `@/lib/carReveal`.
- Produces (props): `{ revealId: string; open: boolean; instant?: boolean; reduce: boolean | null; onClosed?: () => void }`. Chiama `onClosed` una volta quando la chiusura è completa (progress tornato a 0).

- [ ] **Step 1: Creare il componente**

Create `src/components/sections/CarDoorReveal.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import {
  getReveal,
  revealFrameSrc,
  revealProgressToFrame,
} from "@/lib/carReveal";

/**
 * Overlay dell'apertura sportello (servizio "Interni"). Sta SOPRA lo spin nel
 * box di Car360 (stesso object-contain) e mostra una sequenza WebP "scrubbata"
 * da un tween: apertura = progress 0→1, chiusura = reverse 1→0. Il fotogramma 0
 * coincide col frame-ancora dello spin (stesso start_image) → comparsa/sparizione
 * invisibili. Nessun seek video: solo swap di <img> (istantaneo), come lo scrub
 * dello spin. Manipolazione diretta del DOM per non ri-renderizzare a ogni frame.
 */
export default function CarDoorReveal({
  revealId,
  open,
  instant = false,
  reduce,
  onClosed,
}: {
  revealId: string;
  open: boolean;
  instant?: boolean;
  reduce: boolean | null;
  onClosed?: () => void;
}) {
  const reveal = getReveal(revealId);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const progressRef = useRef(0); // 0 = chiuso (== frame ancora), 1 = aperto
  const openRef = useRef(open);
  const instantRef = useRef(instant);
  const reduceRef = useRef(!!reduce);
  const shownRef = useRef(false); // overlay attualmente visibile
  const lastIdxRef = useRef(-1);
  const closedNotifiedRef = useRef(true); // niente notifica spuria al mount
  const onClosedRef = useRef(onClosed);
  const preloadRef = useRef<HTMLImageElement[]>([]);

  // Tieni i ref allineati alle prop senza far ripartire il loop rAF.
  useEffect(() => {
    openRef.current = open;
    if (open) closedNotifiedRef.current = false;
  }, [open]);
  useEffect(() => {
    instantRef.current = instant;
  }, [instant]);
  useEffect(() => {
    reduceRef.current = !!reduce;
  }, [reduce]);
  useEffect(() => {
    onClosedRef.current = onClosed;
  }, [onClosed]);

  // Precarico dei fotogrammi dell'apertura (come Car360 con i frame dello spin):
  // allo swap sono già in cache, niente lampo.
  useEffect(() => {
    if (!reveal) return;
    const imgs: HTMLImageElement[] = [];
    for (let i = 0; i < reveal.frameCount; i++) {
      const im = new Image();
      im.src = revealFrameSrc(reveal, i);
      imgs.push(im);
    }
    preloadRef.current = imgs;
  }, [reveal]);

  // Loop: avvicina progress al target (open→1, chiuso→0), aggiorna l'img e
  // gestisce comparsa/sparizione + notifica di chiusura.
  useEffect(() => {
    if (!reveal) return;
    let raf = 0;
    const tick = () => {
      const img = imgRef.current;
      if (img) {
        const target = openRef.current ? 1 : 0;
        if (reduceRef.current || (instantRef.current && target === 0)) {
          progressRef.current = target; // reduced-motion o chiusura istantanea (drag)
        } else {
          const p = progressRef.current;
          const next = p + (target - p) * 0.14; // ease-out naturale
          progressRef.current = Math.abs(target - next) < 0.004 ? target : next;
        }

        const shouldShow = openRef.current || progressRef.current > 0.001;
        if (shouldShow !== shownRef.current) {
          shownRef.current = shouldShow;
          img.style.opacity = shouldShow ? "1" : "0";
        }
        if (shouldShow) {
          const idx = revealProgressToFrame(progressRef.current, reveal.frameCount);
          if (idx !== lastIdxRef.current) {
            lastIdxRef.current = idx;
            img.src = revealFrameSrc(reveal, idx);
          }
        }
        if (
          !openRef.current &&
          progressRef.current === 0 &&
          !closedNotifiedRef.current
        ) {
          closedNotifiedRef.current = true;
          onClosedRef.current?.();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reveal]);

  if (!reveal) return null; // asset assente → fallback silenzioso: nessun overlay

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={revealFrameSrc(reveal, 0)}
      alt={`Abitacolo restaurato in pelle ${reveal.seatColor}: sedili e volante nuovi`}
      draggable={false}
      className="pointer-events-none absolute inset-0 z-30 h-full w-full object-contain"
      style={{ opacity: 0, transition: "opacity 140ms ease" }}
    />
  );
}
```

- [ ] **Step 2: Verificare compilazione**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS. (Il componente non è ancora usato: nessun cambiamento di comportamento.)

- [ ] **Step 3: Checkpoint** — niente commit (solo su richiesta).

---

### Task 7: Cablaggio in `CarExplorer` (macchina a stati + ZoneNav)

Aggiunge lo stato `doorOpen`, il click su "Interni" che ruota all'ancora e poi apre (senza navigare), la chiusura su qualsiasi interazione (drag / click fuori / click su un'altra voce / re-click su Interni), e trasforma la voce "Interni" di `ZoneNav` in un pulsante. Monta `CarDoorReveal` come figlio di `Car360`.

**Files:**
- Modify: `src/components/sections/CarExplorer.tsx`

**Interfaces:**
- Consumes: `Car360` (props invariate), `CarDoorReveal` (Task 6), `getReveal` + `frameDistance`.

- [ ] **Step 1: Aggiornare gli import**

In cima a `CarExplorer.tsx`:

```tsx
import { useRef, useState, type FocusEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { treatments, type Treatment } from "@/lib/treatments";
import { carSpots, type TreatmentId } from "@/lib/carSpots";
import { frameDistance } from "@/lib/carSpin";
import { getReveal } from "@/lib/carReveal";
import { cn } from "@/lib/utils";
import Car360 from "./Car360";
import CarDoorReveal from "./CarDoorReveal";
```

(rispetto all'originale: rimosso `import CarSpots`; aggiunti `useRef`, `frameDistance`, `getReveal`, `CarDoorReveal`.)

- [ ] **Step 2: Stato e handler nel componente `CarExplorer`**

Sostituire il corpo del componente (dallo stato fino al `return`) con:

```tsx
export default function CarExplorer() {
  const reduce = useReducedMotion();
  const REVEAL_ID = "restauro-pelle";
  const revealAnchor = getReveal(REVEAL_ID)?.anchorFrame ?? INITIAL.anchorFrame;

  const [frame, setFrame] = useState<number>(INITIAL.anchorFrame);
  const [targetFrame, setTargetFrame] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string>(INITIAL.id);
  const [touched, setTouched] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [doorInstant, setDoorInstant] = useState(false);
  const armingRef = useRef(false); // in rotazione verso l'ancora: apri all'arrivo
  const stageRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);

  const active = treatmentById(activeId);

  // hover/focus su una voce: evidenzia e ruota (come prima). Non chiude la porta.
  const preview = (id: string) => {
    setActiveId(id);
    if (doorOpen && id !== REVEAL_ID) return; // porta aperta: niente rotazione in hover
    const spot = carSpots.find((s) => s.id === id);
    if (spot) setTargetFrame(spot.anchorFrame);
    setTouched(true);
  };
  const endPreview = () => {
    if (doorOpen || armingRef.current) return; // resta ancorato mentre è aperta/in apertura
    setTargetFrame(null);
  };

  // chiusura della porta: graceful (reverse) o instant (drag).
  const requestClose = (mode: "graceful" | "instant") => {
    armingRef.current = false;
    setDoorInstant(mode === "instant");
    setDoorOpen(false); // targetFrame resta = revealAnchor finché onDoorClosed non ripristina
  };
  const onDoorClosed = () => {
    setDoorInstant(false);
    setTargetFrame(null); // riprende l'auto-rotazione dall'ancora
  };

  // CLICK su "Interni": ruota all'ancora e poi apri; se già aperta, richiudi (toggle).
  const activateReveal = (id: string) => {
    setActiveId(id);
    setTouched(true);
    if (doorOpen) {
      requestClose("graceful");
      return;
    }
    setDoorInstant(false);
    armingRef.current = true;
    setTargetFrame(revealAnchor);
  };

  // l'utente affronta l'auto (drag/press): chiudi subito e passa al trascinamento.
  const handleGrab = () => {
    if (doorOpen || armingRef.current) requestClose("instant");
    armingRef.current = false;
    setTargetFrame(null);
    setTouched(true);
  };

  // frame report dallo spin: quando la rotazione raggiunge l'ancora, apri.
  const handleFrame = (f: number) => {
    setFrame(f);
    if (armingRef.current && Math.abs(frameDistance(f, revealAnchor)) < 1.5) {
      armingRef.current = false;
      setDoorOpen(true);
    }
  };

  // "clicca fuori" per chiudere: press fuori dal palco e fuori dalla nav.
  useEffect(() => {
    if (!doorOpen) return;
    const onDown = (e: globalThis.PointerEvent) => {
      const t = e.target as Node;
      if (stageRef.current?.contains(t)) return; // press sull'auto: lo gestisce handleGrab
      if (navRef.current?.contains(t)) return; // interazioni nav gestite dai loro handler
      requestClose("graceful");
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [doorOpen]);

  return (
    <section
      id="esplora"
      className="relative overflow-hidden py-24 text-paper md:py-32"
      style={{
        background:
          "linear-gradient(to bottom, #0a0a0a 0%, #000 10%, #000 90%, #0a0a0a 100%)",
      }}
    >
      <div className="glow-racing pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 opacity-20 blur-3xl" />

      <div className="wrap relative">
        <div className="max-w-2xl">
          <Reveal>
            <span
              className="eyebrow text-racing-bright"
              style={{ fontSize: "clamp(1rem, 1.3vw, 1.25rem)" }}
            >
              Esplora i servizi
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-xl mt-5">Un&apos;auto, cinque trattamenti.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-paper/70">
              Trascina per ruotare l&apos;auto e vai dritto al trattamento che ti
              interessa.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid items-center gap-8 lg:mt-16 lg:grid-cols-[1.75fr_0.9fr] lg:gap-10">
          <div ref={stageRef}>
            <Car360
              initialFrame={INITIAL.anchorFrame}
              targetFrame={targetFrame}
              reduce={reduce}
              onFrameChange={handleFrame}
              onGrab={handleGrab}
              showHint={!touched}
            >
              <CarDoorReveal
                revealId={REVEAL_ID}
                open={doorOpen}
                instant={doorInstant}
                reduce={reduce}
                onClosed={onDoorClosed}
              />
            </Car360>
          </div>
          <ServicePanel treatment={active} reduce={reduce} />
        </div>

        <ZoneNav
          activeId={activeId}
          openId={doorOpen ? REVEAL_ID : null}
          onPreview={preview}
          onEndPreview={endPreview}
          onActivate={activateReveal}
          navRef={navRef}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Aggiungere `useEffect` all'import React**

La macchina a stati usa `useEffect`. Aggiornare la riga import React:

```tsx
import { useEffect, useRef, useState, type FocusEvent } from "react";
```

- [ ] **Step 4: Trasformare la voce "Interni" di `ZoneNav` in pulsante**

Sostituire la funzione `ZoneNav` con questa versione (accetta `onActivate`, `openId`, `navRef`; per le voci con reveal rende un `<button>` che NON naviga, le altre restano `<Link>`):

```tsx
function ZoneNav({
  activeId,
  openId,
  onPreview,
  onEndPreview,
  onActivate,
  navRef,
}: {
  activeId: string;
  openId: string | null;
  onPreview: (id: TreatmentId) => void;
  onEndPreview: () => void;
  onActivate: (id: TreatmentId) => void;
  navRef: React.RefObject<HTMLUListElement | null>;
}) {
  const handleBlur = (e: FocusEvent<HTMLUListElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      onEndPreview();
    }
  };

  return (
    <ul
      ref={navRef}
      className="mt-10 flex flex-wrap justify-center gap-2.5 lg:mt-12"
      onMouseLeave={onEndPreview}
      onBlur={handleBlur}
    >
      {carSpots.map((spot) => {
        const isActive = spot.id === activeId;
        const hasReveal = !!getReveal(spot.id);
        const style = {
          borderColor: isActive
            ? "var(--color-racing-bright)"
            : "rgba(245,244,240,0.18)",
        };
        const className = cn(
          "inline-block rounded-full border px-4 py-2 font-display text-sm font-medium transition-colors",
          isActive
            ? "bg-racing-bright/15 text-paper"
            : "text-paper/70 hover:text-paper",
        );

        return (
          <li key={spot.id}>
            {hasReveal ? (
              <button
                type="button"
                onClick={() => onActivate(spot.id)}
                onMouseEnter={() => onPreview(spot.id)}
                onFocus={() => onPreview(spot.id)}
                aria-expanded={openId === spot.id}
                style={style}
                className={className}
              >
                {spot.label}
              </button>
            ) : (
              <Link
                href={`/trattamenti#${spot.id}`}
                onMouseEnter={() => onPreview(spot.id)}
                onFocus={() => onPreview(spot.id)}
                style={style}
                className={className}
              >
                {spot.label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 5: Verificare compilazione + test**

Run: `npx tsc --noEmit && npm run lint && npx vitest run`
Expected: PASS. Attenzione ai tipi `RefObject<HTMLUListElement | null>` (React 19: `useRef(null)` dà proprio quel tipo).

- [ ] **Step 6: Checkpoint** — niente commit (solo su richiesta).

---

### Task 8: Verifica nel browser (Playwright) + rifinitura

Verifica end-to-end il flusso e i comportamenti d'uscita, poi rifinisce durata/allineamento se serve. Tool Playwright deferred: caricarne lo schema con ToolSearch prima dell'uso.

**Files:**
- Nessuno (verifica) — eventuali micro-ritocchi a `CarDoorReveal.tsx` (fattore `0.14`) o allo Step 2 di Task 5 (scala start_image).

- [ ] **Step 1: Avviare il dev server e trovare la porta**

```bash
npm run dev
```
Individuare la porta (`:3000` o `:3001`) dall'output. Navigare a `http://localhost:<porta>/#esplora`.

- [ ] **Step 2: Verificare che i pallini siano spariti**

Snapshot/att: nel box dell'auto non ci sono più pallini verdi. Le etichette (Motore, Vetri, Interni, Carrozzeria, Detailing) sono presenti sotto.

- [ ] **Step 3: Click "Interni" → apertura**

Cliccare il pulsante "Interni". Attendere a condizione (poll fino a ~3s): l'auto ruota all'ancora, poi l'overlay compare e i frame avanzano (la porta si apre) e si ferma sull'interno cognac. Verificare via `browser_evaluate` che l'`<img>` overlay (`z-30`) abbia `opacity=1` e `src` contenente `interni-reveal/frame-` con indice alto (vicino a `frameCount-1`).

- [ ] **Step 4: Tenuta (chiusura i)**

Senza interagire, l'interno **resta** visibile (non torna da solo). Confermare dopo ~3s che l'overlay è ancora a opacità 1.

- [ ] **Step 5: Chiusura per interazione**

Tre casi:
1. **Drag sull'auto** (PointerEvent sintetici down→move→up sul box, ora che la capture è in try/catch): l'overlay sparisce subito (instant) e lo spin segue il trascinamento.
2. **Click su un'altra voce** (es. "Vetri"): riapri "Interni", poi clic su "Vetri" → la porta si richiude (reverse) e riparte lo spin; il pannello passa a Vetri.
3. **Click fuori** (es. sul titolo della sezione): riapri "Interni", poi clic sul titolo → chiusura graceful + ripresa spin.

Dopo ciascuna chiusura verificare che `targetFrame` sia tornato a riposo (lo spin auto-ruota: il frame cambia nel tempo).

- [ ] **Step 6: Reduced-motion**

Con emulazione `prefers-reduced-motion: reduce`, cliccare "Interni": l'interno appare **statico** (nessuna animazione di apertura) e si chiude senza tween. Nessun errore in console.

- [ ] **Step 7: Fallback asset mancante**

Sanity check del ramo di fallback: `getReveal` senza frame → `CarDoorReveal` ritorna `null`. (Verifica logica: già coperta dal fatto che il componente ritorna `null` se `!reveal`; non serve rompere gli asset. Se si vuole testare a runtime, rinominare temporaneamente la cartella e confermare che lo spin funziona senza overlay, poi ripristinare.)

- [ ] **Step 8: Rifinitura**

Se lo swap spin→overlay "salta" (scala/posizione), regolare lo Step 2 di Task 5 (usare `pad` per centrare invece di `scale`) e riestrarre. Se l'apertura è troppo rapida/lenta, regolare il fattore `0.14` in `CarDoorReveal.tsx` (più basso = più lenta). Screenshot con `animations:'disabled'` per confronto.

- [ ] **Step 9: Checkpoint** — mostrare all'utente uno screenshot dell'interno aperto. Niente commit (solo su richiesta).

---

### Task 9: Gate di qualità finali + memoria

**Files:**
- Update memoria: `car-explorer-part-isolation.md` (+ eventuale nuovo file per il reveal)

- [ ] **Step 1: Gate verdi**

Run: `npx tsc --noEmit && npm run lint && npx vitest run`
Expected: tutti PASS.

- [ ] **Step 2: Riepilogo `git status`**

```bash
git status --short
```
Attesi (nuovi/mod.): `src/lib/carReveal.ts`, `src/lib/carReveal.test.ts`, `src/lib/carSpin.ts`, `src/lib/carSpin.test.ts`, `src/lib/carSpots.ts`, `src/components/sections/CarDoorReveal.tsx`, `src/components/sections/CarExplorer.tsx`, cancellato `src/components/sections/CarSpots.tsx`, nuovi `public/home/interni-reveal/frame-*.webp`, `docs/specs/…` e `docs/plans/…`. NON committare senza richiesta.

- [ ] **Step 3: Aggiornare la memoria**

Aggiornare `car-explorer-part-isolation.md`: nuovo reveal "Interni" (apertura sportello guidatore ancorata al frame 4, overlay WebP scrubbato, chiusura su interazione, Car360 invariato, `carReveal.ts` come punto d'estensione). Aggiungere pointer in `MEMORY.md` se si crea un file nuovo.

- [ ] **Step 4: Checkpoint finale** — riferire all'utente cosa è fatto/verificato e chiedere se committare.

---

## Self-Review

**1. Spec coverage** (contro `docs/specs/2026-07-03-interni-door-reveal.md`):
- Rimozione pallini verdi → Task 2. ✓
- Hover "Interni" ruota (preview) → `preview()` invariato, Task 7. ✓
- Click "Interni" apre e NON naviga → `<button>` in ZoneNav + `activateReveal`, Task 7. ✓
- Apertura ancorata al frame spin (handoff invisibile) → `start_image` = frame N (Task 5) + frame 0 overlay, Task 6. ✓
- Scrub WebP, apertura 0→1 / chiusura reverse 1→0 → `CarDoorReveal`, Task 6. ✓
- Chiusura (i): resta aperto finché interazione (drag/click voce/click fuori) → `handleGrab`/`activateReveal`/listener document, Task 7. ✓
- Portiera guidatore (sx), posa 3/4 ant sx → Task 1 + anchorFrame 4. ✓
- Pelle cognac → prompt + `seatColor`, Task 5/4. ✓
- Overlay sopra lo spin, stessa dissolvenza bordi #000 → `z-30` (Task 6) + `EDGE` geq (Task 5). ✓
- Spin sospeso mentre aperto → `targetFrame` tenuto a `revealAnchor` (Car360 invariato), Task 7. ✓
- reduced-motion / asset mancante / cache-busting → Task 6 (`reduce`, `!reveal→null`) + `REVEAL_ASSET_VERSION` (Task 4). ✓
- Punto d'estensione per futuri servizi → mappa `REVEALS` in `carReveal.ts`. ✓
- Test vitest logica pura → Task 3 (`frameDistance`) + Task 4 (`carReveal`). ✓
- Rischio/fallback (a)→(b) → gate qualità Task 5 Step 6. ✓

**2. Placeholder scan:** nessun "TBD/TODO" nei requisiti. `frameCount` provvisorio (48) è un dato aggiornato in Task 5 Step 9, non un placeholder di logica; i test non dipendono dal suo valore reale. `N` (ancora) è concretizzato a 4 con conferma in Task 1.

**3. Type consistency:** `frameDistance(from,to,count?,wrap?)` usato in Task 7 come definito in Task 3. `CarReveal`/`getReveal`/`revealFrameSrc`/`revealProgressToFrame` usati in Task 6 come definiti in Task 4. Props di `CarDoorReveal` (`revealId, open, instant, reduce, onClosed`) coerenti tra Task 6 e Task 7. `ZoneNav` props (`activeId, openId, onPreview, onEndPreview, onActivate, navRef`) coerenti nel rendering di Task 7. `navRef`/`stageRef` tipi `RefObject<…|null>` coerenti con React 19.
