# CarExplorer: spin passivo in loop — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trasformare lo stage dell'auto nella home (`#esplora`) da spin interattivo (video + 144 fotogrammi WebP scrubbabili) a **video in loop passivo**, agganciando i reveal per-servizio con un crossfade, senza cambiare nulla dei reveal stessi.

**Architecture:** `Car360` diventa un `<video loop>` senza interazione né loop rAF, con una sola prop nuova (`dimmed`) che ne pilota l'opacità. `CarDoorReveal` fa già una dissolvenza di 300 ms sul frame 0: basta far svanire lo spin sotto nello stesso istante. `CarExplorer` perde tutta la macchina di rotazione (`targetFrame`, `armingRef`, `currentFrameRef`, `handleFrame`, `handleGrab`, `doorInstant`) e tiene un solo stato nuovo, `spinDimmed`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind, framer-motion, vitest.

Spec di riferimento: [`docs/superpowers/specs/2026-07-14-car-loop-passivo-design.md`](../specs/2026-07-14-car-loop-passivo-design.md)

## Global Constraints

- **Nessuna modifica** a `CarDoorReveal.tsx`, `carReveal.ts`, `carSpots.ts`, `carSpin.ts`, `treatments.ts`, `Car3D.tsx`, né agli asset in `public/`. I reveal devono restare identici a oggi.
- La dissolvenza dello spin dura **300 ms**, esattamente come `FADE_MS` in `CarDoorReveal.tsx:17`. Le due dissolvenze devono incrociarsi.
- Il video dello spin **non va messo in pausa** quando è nascosto da un reveal: deve continuare a girare sotto, così alla chiusura riappare già in movimento.
- Il file resta `src/components/sections/Car360.tsx` (nessun rename).
- Copy approvata dall'utente per il paragrafo introduttivo: **"Scegli un trattamento e guardalo all'opera sull'auto."**
- I test esistenti (`carSpin.test.ts`, `carSpots.test.ts`, `carReveal.test.ts`) coprono moduli non toccati: devono continuare a passare **invariati**. Non si aggiungono test unitari (la logica che resta è di rendering, non di calcolo); la verifica è manuale nel browser, Task 2.

---

### Task 1: `Car360` passivo + `CarExplorer` senza rotazione

Le due modifiche viaggiano insieme: la firma di `Car360` cambia, quindi `CarExplorer` va aggiornato nello stesso commit o il progetto non compila.

**Files:**
- Modify: `src/components/sections/Car360.tsx` (riscrittura integrale, ~473 → ~90 righe)
- Modify: `src/components/sections/CarExplorer.tsx` (rimozione della macchina di rotazione + copy)

**Interfaces:**
- Consumes: `SPIN_ASSET_VERSION` da `@/lib/carSpin`; `getReveal`, `reveals` da `@/lib/carReveal`; `carSpots`, `TreatmentId` da `@/lib/carSpots`; `CarDoorReveal` (firma invariata: `revealId`, `open`, `reduce`, `eagerPreload`, `onClosed`).
- Produces: nuova firma di `Car360`:
  ```ts
  { reduce: boolean | null; dimmed: boolean; children?: ReactNode }
  ```
  Spariscono le prop `initialFrame`, `targetFrame`, `onFrameChange`, `onGrab`, `showHint`.

- [ ] **Step 1: Riscrivere `Car360.tsx`**

Sostituire **l'intero contenuto** del file con:

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SPIN_ASSET_VERSION } from "@/lib/carSpin";

// Deve combaciare con FADE_MS di CarDoorReveal (300 ms): le due dissolvenze si
// incrociano — lo spin svanisce mentre il reveal compare, così non si vedono
// mai due auto ad angoli diversi sovrapposte.
const FADE_MS = 300;

/**
 * Stage dell'auto: un VIDEO in loop, PASSIVO. Il file è un giro 360° vero
 * (start=end), riprodotto a velocità nativa (playbackRate 1.0: un rate ≠ 1
 * introduce judder contro il refresh del monitor). Nessuna interazione, nessun
 * loop rAF, nessun seek: il browser lo compone in GPU e basta.
 *
 * `dimmed` (= un reveal è in scena) lo fa svanire; il video però continua a
 * girare sotto, così alla chiusura del reveal riappare già in movimento.
 *
 * La dissolvenza dei bordi verso il nero (#000) della sezione è BAKATA
 * nell'asset: niente overlay né CSS mask sul <video> — la mask disattiverebbe
 * il compositing accelerato dalla GPU.
 */
export default function Car360({
  reduce,
  dimmed,
  children,
}: {
  reduce: boolean | null;
  dimmed: boolean;
  children?: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  // Il video (4,7 MB) viene agganciato solo quando la sezione si avvicina al
  // viewport: chi non scorre fin qui non lo scarica affatto. Una volta sola:
  // `near` non torna mai a false, o riscaricheremmo il file a ogni passaggio.
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNear(true); // niente IO (browser antico): carica e vai
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Aggiungere un <source> a un <video> già montato non fa partire il download
  // da solo: va chiesto esplicitamente con load().
  useEffect(() => {
    if (near) videoRef.current?.load();
  }, [near]);

  // Fuori dal viewport il video va in pausa (niente decodifica a vuoto).
  // Con prefers-reduced-motion non parte mai: resta il poster.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || reduce || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        const v = videoRef.current;
        if (!v) return;
        if (e.isIntersecting) {
          const p = v.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    // Niente touch-none / cursor-grab: lo stage non è più interattivo, il dito
    // ci scorre sopra come su qualunque altra parte della pagina.
    // L'auto in 16/9 su un telefono sarebbe alta ~210px: sotto sm passiamo a
    // 4/3, che le dà spazio reale senza sfondare il viewport.
    <div
      ref={boxRef}
      className="relative aspect-[4/3] w-full select-none sm:aspect-[16/9]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[8%] bottom-[5%] h-[12%] rounded-[50%] bg-black/70 blur-2xl"
      />

      <video
        ref={videoRef}
        muted
        playsInline
        loop
        autoPlay={!reduce}
        preload="auto"
        poster={`/home/spin/spin-poster.webp?v=${SPIN_ASSET_VERSION}`}
        aria-label="Audi nera Garden's Cars che ruota su fondo scuro"
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        style={{
          opacity: dimmed ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      >
        {near && (
          <source
            src={`/home/spin/spin-loop.mp4?v=${SPIN_ASSET_VERSION}`}
            type="video/mp4"
          />
        )}
      </video>

      {children}
    </div>
  );
}
```

Nota su cosa è sparito rispetto a prima, per chi rilegge il diff: `PX_PER_FRAME`, `AUTO_RATE`, `ensurePreload` dei 144 WebP, `applyOverlay`, il ponte `seeked` (`resyncPendingRef`/`resyncCancelRef`), il tween verso `targetFrame`, il loop rAF, `frameToTime`/`timeToFrame`, l'`<img>` di overlay, l'hint "Trascina per ruotare", lo stato `failed` (in caso di errore di caricamento il browser lascia il poster da solo).

- [ ] **Step 2: Aggiornare `CarExplorer.tsx` — import e commento di testata**

In `src/components/sections/CarExplorer.tsx`, sostituire il blocco di import (righe 1-16) con:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { treatments, type Treatment } from "@/lib/treatments";
import { carSpots, type TreatmentId } from "@/lib/carSpots";
import { getReveal, reveals } from "@/lib/carReveal";
import { cn } from "@/lib/utils";
import { useAllowHeavyPreload } from "@/lib/useMediaQuery";
import Car360 from "./Car360";
import CarDoorReveal from "./CarDoorReveal";
```

Spariscono `import { frameDistance } from "@/lib/carSpin";` e il commento `// TEMP: Car360 (video+WebP)...`.

Sostituire il commento JSDoc della sezione (righe 26-32) con:

```tsx
/**
 * Sezione homepage "Esplora i servizi": l'Audi nera gira in un video in loop
 * (Car360), passivo — non si trascina più. Il click su una voce della ZoneNav
 * evidenzia il servizio nel pannello e, se quel servizio ha un reveal, lo apre:
 * lo spin svanisce (`spinDimmed`) mentre il reveal compare, e riappare quando il
 * reveal si è richiuso. Config dei reveal in carReveal.ts.
 */
```

- [ ] **Step 3: Aggiornare `CarExplorer.tsx` — stato e handler**

Sostituire il corpo della funzione `CarExplorer` dalla dichiarazione degli stati fino a `handleFrame` incluso (righe 34-119 dell'originale, cioè da `const reduce = useReducedMotion();` fino alla chiusura di `handleFrame`) con:

```tsx
  const reduce = useReducedMotion();
  // Su mobile/rete lenta i fotogrammi dei reveal (~15 MB in sei) si scaricano
  // solo all'apertura. Dove la banda c'è li precarichiamo, ma non prima che la
  // sezione si avvicini: partendo subito ruberebbero rete all'hero, che è ciò
  // che l'utente sta guardando davvero.
  const allowHeavy = useAllowHeavyPreload();
  const [stageNear, setStageNear] = useState(false);
  const eagerPreload = allowHeavy && stageNear;

  // `openId` = reveal attualmente aperto (null = nessuno). `spinDimmed` = il
  // video dello spin è svanito. Sono stati DISTINTI perché la chiusura di un
  // reveal ha una coda (lo scrub a ritroso, closeMs): lo spin deve restare
  // nascosto finché il reveal non è tornato al frame 0 — lo dice `onDoorClosed`.
  const [activeId, setActiveId] = useState<string>(INITIAL.id);
  const [openId, setOpenId] = useState<TreatmentId | null>(null);
  const [spinDimmed, setSpinDimmed] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);

  const active = treatmentById(activeId);

  const onDoorClosed = () => {
    // Switch diretto tra reveal (es. Interni→Motore): quando il vecchio finisce
    // di chiudersi il nuovo è già in scena — lo spin deve restare nascosto.
    if (openId !== null) return;
    setSpinDimmed(false);
  };

  // CLICK su una voce (unica via di attivazione: niente hover-preview): apre il
  // reveal, o lo richiude se era già aperto. Se era aperto un ALTRO reveal, si
  // richiude da sé (open → false) mentre il nuovo compare.
  const activateReveal = (id: TreatmentId) => {
    setActiveId(id);
    if (!getReveal(id)) return;
    if (openId === id) {
      setOpenId(null); // spinDimmed resta true finché onDoorClosed non lo spegne
      return;
    }
    setOpenId(id);
    setSpinDimmed(true);
  };
```

- [ ] **Step 4: Aggiornare `CarExplorer.tsx` — click-fuori e JSX**

L'effetto "clicca fuori per chiudere" (originale righe 142-152) usava `requestClose`, che non esiste più. Sostituirlo con:

```tsx
  // "Clicca fuori" per chiudere: press fuori dal palco e fuori dalla nav.
  useEffect(() => {
    if (openId === null) return;
    const onDown = (e: globalThis.PointerEvent) => {
      const t = e.target as Node;
      if (stageRef.current?.contains(t)) return;
      if (navRef.current?.contains(t)) return; // interazioni nav gestite dai loro handler
      setOpenId(null);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [openId]);
```

L'effetto `IntersectionObserver` su `stageRef` (`setStageNear`, originale righe 122-139) resta **invariato**.

Nel JSX, sostituire il paragrafo introduttivo (originale righe 183-186):

```tsx
              <p className="mt-5 max-w-md text-paper/70">
                Scegli un trattamento e guardalo all&apos;opera sull&apos;auto.
              </p>
```

e sostituire il blocco `<Car360>` (originale righe 206-228) con:

```tsx
            <Car360 reduce={reduce} dimmed={spinDimmed}>
              {/* Un overlay per reveal, sempre montati: ognuno apre/chiude in
                  autonomia (openId) e a riposo non consuma nulla (loop rAF
                  spento, fotogrammi non precaricati se non eagerPreload). */}
              {reveals.map((r) => (
                <CarDoorReveal
                  key={r.id}
                  revealId={r.id}
                  open={openId === r.id}
                  reduce={reduce}
                  eagerPreload={eagerPreload}
                  onClosed={onDoorClosed}
                />
              ))}
            </Car360>
```

`ServicePanel` e `ZoneNav` (dalla riga 244 in poi) restano **invariati**: `ZoneNav` riceve già `activeId`, `openId`, `onActivate={activateReveal}`, `navRef`.

- [ ] **Step 5: Typecheck e lint**

```bash
npx tsc --noEmit
npm run lint
```

Attesi: entrambi puliti. Se `tsc` segnala prop residue su `Car360` (`initialFrame`, `targetFrame`, `onFrameChange`, `onGrab`, `showHint`) o simboli non usati in `CarExplorer` (`frameDistance`, `INITIAL.anchorFrame` è invece legittimo — `INITIAL` serve ancora come servizio di partenza del pannello), tornare agli Step 3-4 e completare la rimozione.

- [ ] **Step 6: Test unitari (devono passare invariati)**

```bash
npm test
```

Atteso: PASS su `carSpin.test.ts`, `carSpots.test.ts`, `carReveal.test.ts`. Nessun test è stato toccato: se qualcuno fallisce, è perché è stato modificato un modulo che il piano dice di non toccare — annullare quella modifica.

- [ ] **Step 7: Build di produzione**

```bash
npm run build
```

Atteso: build completata senza errori.

- [ ] **Step 8: Commit**

```bash
git add src/components/sections/Car360.tsx src/components/sections/CarExplorer.tsx
git commit -m "perf(car-explorer): spin passivo in loop, crossfade sui reveal"
```

---

### Task 2: Verifica nel browser

Il comportamento nuovo è visivo: i test unitari non lo coprono e non devono provarci. Questa è la verifica che il cambiamento fa davvero quello che deve.

**Files:** nessuno (verifica); eventuali fix tornano su `Car360.tsx` / `CarExplorer.tsx`.

- [ ] **Step 1: Avviare il dev server**

```bash
npm run dev
```

Attenzione: se la 3000 è occupata Next parte su **:3001** — leggere l'URL stampato, non darlo per scontato.

- [ ] **Step 2: Percorrere la checklist sulla home, sezione `#esplora`**

1. Lo spin gira in loop, fluido, senza scatti alla giunzione del giro.
2. Trascinando con il mouse sull'auto **non succede nulla**; su viewport mobile il dito scorre la pagina normalmente anche partendo dall'auto (nessuna trappola per il gesto).
3. Click su un servizio con reveal (Interni, Motore, Vetri, Lucidatura, Detailing, Antifurto) → lo spin svanisce **mentre** il reveal compare: in nessun istante si vedono due auto ad angoli diversi sovrapposte.
4. Secondo click sulla stessa voce → il reveal fa lo scrub a ritroso e **solo dopo** riappare lo spin, già in movimento (non riparte da fermo).
5. Click fuori dal palco e fuori dalla nav → stessa chiusura del punto 4.
6. Switch diretto fra due reveal (Interni → Motore) → lo spin **non** riappare nel mezzo.
7. I tre reveal in ping-pong (Vetri, Lucidatura, Antifurto) ripetono come prima.
8. Scorrendo via dalla sezione il video va in pausa; tornando riparte.
9. Con `prefers-reduced-motion` attivo (DevTools → Rendering → Emulate CSS media feature): il video non parte, resta il poster; i reveal si aprono senza animazione (comportamento già esistente di `CarDoorReveal`).
10. Console del browser: nessun errore.

- [ ] **Step 3: Controllo del peso in rete**

DevTools → Network, ricaricare la home a cache vuota e scorrere fino a `#esplora` **senza** aprire reveal.

Atteso: si scarica `spin-loop.mp4` (+ poster), e **nessun** `frame-###.webp` da `/home/spin/` — sono i ~3,6 MB che questo cambiamento elimina. Se compaiono, il precarico non è stato rimosso davvero.

- [ ] **Step 4: Commit di eventuali fix**

Solo se la checklist ha richiesto correzioni:

```bash
git add src/components/sections/Car360.tsx src/components/sections/CarExplorer.tsx
git commit -m "fix(car-explorer): <cosa è emerso dalla verifica>"
```
