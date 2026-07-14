# Reveal "Antifurto" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sesto reveal del CarExplorer: click su "Antifurto" → auto al frame 136 (3/4 ant. sx) → le frecce lampeggiano in arancio in loop ping-pong, come un allarme inserito.

**Architecture:** Nessun componente nuovo: si estende la mappa `reveals[]` di `carReveal.ts` (punto d'estensione dichiarato) e `carSpots.ts` (nav + ancora). L'asset è la parte grossa: clip Higgsfield/seedance dal frame 136 dello spin → 61 WebP con dissolvenza bordi bakata in `public/home/antifurto-reveal/`.

**Tech Stack:** Next.js (versione custom del repo — leggere `node_modules/next/dist/docs/` prima di toccare codice Next), TypeScript, Vitest, ffmpeg, MCP Higgsfield (`media_upload`/`generate_video`).

**Spec:** `docs/superpowers/specs/2026-07-14-antifurto-reveal-design.md`

## Global Constraints

- Commenti e testi in italiano, stile dei file esistenti (commenti "perché", densi).
- `REVEAL_ASSET_VERSION` resta **1** (file nuovi, niente cache da bustare).
- Solo i WebP si versionano: mp4 sorgente e PNG intermedi restano gitignored.
- Working tree pieno di WIP dell'utente: **stage SOLO i file del task** (mai `git add -A`), verifica `git diff --cached --name-only` prima di ogni commit.
- I frame del reveal sono `frame-000..060.webp` (61 frame, sorgente 0..120 un frame ogni 2).

---

### Task 1: `carSpots.ts` — voce "antifurto" (ancora 136 + pulsante nav)

**Files:**
- Modify: `src/lib/carSpots.ts` (union `TreatmentId` riga ~6, array `carSpots` in coda)
- Test: `src/lib/carSpots.test.ts`

**Interfaces:**
- Consumes: nulla di nuovo.
- Produces: `TreatmentId` include `"antifurto"`; `carSpots` contiene `{ id: "antifurto", label: "Antifurto", anchorFrame: 136, samples }`. Task 2 dipende dall'id e dall'anchorFrame (guardia d'integrità in carReveal.ts).

- [ ] **Step 1: aggiorna il test che elenca gli id (fallirà)**

In `src/lib/carSpots.test.ts` sostituisci il test `"copre i 5 servizi mappati"`:

```ts
  it("copre i 6 servizi mappati", () => {
    expect(carSpots.map((s) => s.id).sort()).toEqual(
      [
        "antifurto",
        "car-detailing",
        "centraline",
        "lucidatura",
        "restauro-pelle",
        "trattamento-vetri",
      ].sort(),
    );
  });
```

- [ ] **Step 2: verifica che fallisca**

Run: `npx vitest run src/lib/carSpots.test.ts`
Expected: FAIL — l'array reale non contiene `"antifurto"`.

- [ ] **Step 3: implementa**

In `src/lib/carSpots.ts`, aggiungi all'union:

```ts
export type TreatmentId =
  | "centraline"
  | "lucidatura"
  | "restauro-pelle"
  | "trattamento-vetri"
  | "car-detailing"
  | "antifurto";
```

e in coda all'array `carSpots` (prima della chiusura `];`):

```ts
  {
    id: "antifurto",
    label: "Antifurto",
    anchorFrame: 136, // 3/4 anteriore sx, condiviso con "lucidatura" (scelta
    // consapevole: da qui si vedono freccia anteriore, specchietto e fiancata,
    // dove il lampeggio dell'allarme rende di più).
    // NB: samples non più usati (pallini rimossi); tenuti in range come per
    // le altre voci per un'eventuale reintroduzione futura.
    samples: [
      { frame: 120, x: 52, y: 54, visible: false },
      { frame: 136, x: 42, y: 50, visible: true },
      { frame: 142, x: 38, y: 48, visible: false },
    ],
  },
```

- [ ] **Step 4: verifica che passi (tutta la suite: guardie a module-load)**

Run: `npx vitest run`
Expected: PASS tutti. La ZoneNav renderà la voce come `<button>` solo quando esisterà il reveal (Task 2) — fino ad allora è un `<Link>` a /trattamenti#antifurto, comunque valido.

- [ ] **Step 5: commit**

```bash
git add src/lib/carSpots.ts src/lib/carSpots.test.ts
git commit -m "feat(car-explorer): voce Antifurto in carSpots (ancora 136)"
```

---

### Task 2: `carReveal.ts` — config del reveal in loop

**Files:**
- Modify: `src/lib/carReveal.ts` (array `reveals` in coda)
- Test: `src/lib/carReveal.test.ts`

**Interfaces:**
- Consumes: da Task 1 l'id `"antifurto"` in carSpots con `anchorFrame: 136` (la guardia `spot.anchorFrame !== r.anchorFrame` esplode altrimenti).
- Produces: `getReveal("antifurto")` → `CarReveal` con `dir: "/home/antifurto-reveal"`, `frameCount: 61`, `loop: true`. `CarExplorer`/`CarDoorReveal` lo montano automaticamente (iterano su `reveals`).

- [ ] **Step 1: test (fallirà)**

In `src/lib/carReveal.test.ts`, nel `describe("getReveal")`:

```ts
  it("restituisce la config per antifurto (allarme in loop)", () => {
    const r = getReveal("antifurto");
    expect(r).toBeTruthy();
    expect(r?.anchorFrame).toBe(136);
    expect(r?.dir).toBe("/home/antifurto-reveal");
    expect(r?.loop).toBe(true);
  });
```

- [ ] **Step 2: verifica che fallisca**

Run: `npx vitest run src/lib/carReveal.test.ts`
Expected: FAIL — `getReveal("antifurto")` è `undefined`.

- [ ] **Step 3: implementa**

In `src/lib/carReveal.ts`, in coda all'array `reveals` (dopo la voce `car-detailing`):

```ts
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
```

- [ ] **Step 4: verifica che passi**

Run: `npx vitest run`
Expected: PASS tutti (guardie incluse: id in treatments ✓, id in carSpots ✓, anchor 136=136 ✓).

- [ ] **Step 5: commit**

```bash
git add src/lib/carReveal.ts src/lib/carReveal.test.ts
git commit -m "feat(car-explorer): config reveal Antifurto (loop lampeggio, ancora 136)"
```

---

### Task 3: titolo sezione — "sei trattamenti"

**Files:**
- Modify: `src/components/sections/CarExplorer.tsx` (riga ~152)

**Interfaces:**
- Consumes/Produces: solo copy, nessuna interfaccia.

- [ ] **Step 1: modifica**

```tsx
<h2 className="display-xl mt-5">Un&apos;auto, sei trattamenti.</h2>
```

(al posto di `Un&apos;auto, cinque trattamenti.`)

- [ ] **Step 2: verifica**

Run: `npx tsc --noEmit && npm run lint`
Expected: puliti. ATTENZIONE: `CarExplorer.tsx` ha modifiche WIP dell'utente non committate — questo task cambia UNA riga; al commit stagare il file com'è (la riga fa parte del WIP condiviso, chiedere all'utente se preferisce tenere la modifica unstaged e committarla lui col suo WIP).

- [ ] **Step 3: commit (o lascia nel WIP su indicazione utente)**

Default se l'utente non si esprime: lasciare la modifica nel working tree senza commit (il file è già WIP suo), annotandolo nel riepilogo finale.

---

### Task 4: asset — generazione clip e 61 WebP

**Files:**
- Create: `public/home/antifurto-reveal/.gitignore`, `public/home/antifurto-reveal/frame-000..060.webp`
- Local only (gitignored): `public/home/antifurto-reveal/_antifurto.mp4`, `png/frame-*.png`

**Interfaces:**
- Consumes: `public/home/spin/frame-136.webp` (start image); Task 2 si aspetta esattamente `frame-000..060.webp` in `/home/antifurto-reveal`.
- Produces: i 61 WebP versionati.

- [ ] **Step 1: .gitignore della cartella**

`public/home/antifurto-reveal/.gitignore`:

```
*.mp4
*.png
png/
```

- [ ] **Step 2: start image**

Verifica dimensioni di `public/home/spin/frame-136.webp` (i frame spin rigenerati sono già 720p — per centraline il frame-018 era già 1280×720, niente upscale):

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 public/home/spin/frame-136.webp
```

Se NON è 1280×720, upscala: `ffmpeg -i public/home/spin/frame-136.webp -vf scale=1280:720 start-136.png`.

- [ ] **Step 3: upload su Higgsfield**

Pipeline collaudata: `media_upload` (MCP) → `curl -X PUT` del file all'URL firmato → `media_confirm`.

- [ ] **Step 4: generazione (con stima costi prima)**

`generate_video` MCP: modello `seedance_2_0_mini`, 720p, **5s**, `bitrate_mode: "high"`, `generate_audio: false`, aspect 16:9, `start_image` = media caricato, prima chiamata con `get_cost: true` (atteso ~12,5 cr — verificare credito residuo). Se scatta una `preset_recommendation`, rilanciare con `declined_preset_id`.

Prompt:

```
The car remains PERFECTLY STILL, the camera is completely static, one single
continuous shot, no cuts. The turn signal indicators visible on the left side
of the car (front indicator, side mirror repeater, rear indicator) blink
together 2-3 times in warm amber orange, like a car alarm being armed. Each
flash casts a soft warm orange reflection on the glossy black bodywork and
then fades. After the last flash all lights turn off completely and the scene
returns exactly to how it started. Dark automotive studio mood, pure black
background, subtle rim light, photorealistic.
```

Rischio accettato (spec): reincorniciatura del primo frame → coperta dalla dissolvenza 300ms di `CarDoorReveal`. Se il lampeggio non viene pulito, ritentare (2-3 tentativi preventivati) variando il prompt, non il modello.

- [ ] **Step 5: download**

Scarica l'mp4 del job in `public/home/antifurto-reveal/_antifurto.mp4` (resta gitignored).

- [ ] **Step 6: estrazione PNG con dissolvenza bordi bakata**

61 frame (sorgente 0..120, uno ogni 2), rampa smoothstep verso #000: lati 100px, alto 80px, basso 100px. **Gotcha noti:** (1) il pattern `%03d.webp` in ffmpeg produce UN webp ANIMATO → passare da PNG intermedi; (2) il clamp va su `d` PRIMA del polinomio `d²(3−2d)` (per d>1 il polinomio va negativo → immagine nera).

```bash
mkdir -p public/home/antifurto-reveal/png
ffmpeg -i public/home/antifurto-reveal/_antifurto.mp4 -vf "select='not(mod(n\,2))*lte(n\,120)',format=gbrp,geq=r='p(X,Y)*st(0,clip(min(min(X/100,(W-1-X)/100),min(Y/80,(H-1-Y)/100)),0,1))*ld(0)*(3-2*ld(0))':g='p(X,Y)*st(0,clip(min(min(X/100,(W-1-X)/100),min(Y/80,(H-1-Y)/100)),0,1))*ld(0)*(3-2*ld(0))':b='p(X,Y)*st(0,clip(min(min(X/100,(W-1-X)/100),min(Y/80,(H-1-Y)/100)),0,1))*ld(0)*(3-2*ld(0))'" -vsync 0 -start_number 0 public/home/antifurto-reveal/png/frame-%03d.png
```

(NB: `st(0,clip(...))*ld(0)*(3-2*ld(0))` = d·d·(3−2d) perché `st` restituisce il valore memorizzato.)

Verifica: 61 file `frame-000.png..frame-060.png`; apri frame-000 e frame-060 e controlla che siano quasi identici (start=end) e con bordi che sfumano a nero senza tagliare la sagoma.

- [ ] **Step 7: conversione WebP uno a uno**

```bash
cd public/home/antifurto-reveal
for f in png/frame-*.png; do ffmpeg -y -loglevel error -i "$f" -c:v libwebp -q:v 82 "$(basename "${f%.png}").webp"; done
ls frame-*.webp | wc -l   # atteso: 61
```

- [ ] **Step 8: commit (solo WebP + .gitignore)**

```bash
git add public/home/antifurto-reveal/.gitignore public/home/antifurto-reveal/frame-*.webp
git diff --cached --name-only   # SOLO questi file
git commit -m "feat(car-explorer): asset reveal Antifurto - 61 frame lampeggio frecce"
```

---

### Task 5: verifica visiva e taratura ritmi

**Files:**
- Modify (eventuale, solo taratura): `src/lib/carReveal.ts` (`openMs`/`closeMs`/`loopHoldMs` della voce antifurto)

**Interfaces:**
- Consumes: tutto quanto sopra.
- Produces: reveal collaudato; valori di ritmo definitivi.

- [ ] **Step 1: suite completa + build check**

Run: `npx tsc --noEmit && npm run lint && npx vitest run`
Expected: tutto verde.

- [ ] **Step 2: prova visiva su dev server**

Il dev server può già girare su :3000 o :3001 (controllare prima). Caveat noti: in Playwright/browser pane MCP con finestra occlusa il rAF è throttlato/congelato (`document.visibilityState==='hidden'`) → il reveal non è testabile lì; usare `animations:'disabled'` non serve qui, serve finestra VISIBILE o attese a condizione. Verificare su `/#esplora`:

1. click "Antifurto" → l'auto ruota al 3/4 ant. sx (frame 136) → dissolvenza 300ms → lampeggio in loop ping-pong con pause;
2. le 3 vie di chiusura: ri-click, drag sull'auto (chiusura instant), click fuori (graceful);
3. convivenza con "Carrozzeria" (stessa ancora): click Antifurto → click Carrozzeria → switch pulito senza rotazione;
4. console senza errori propri (filtrare i soliti errori dell'iframe autoscout24).

- [ ] **Step 3: taratura ritmi con l'utente**

Mostrare l'effetto e tarare `openMs`/`loopHoldMs` per moltiplicatori come per gli altri reveal (l'utente decide a occhio). Aggiornare i valori e il commento in `carReveal.ts`.

- [ ] **Step 4: commit taratura (se cambiata)**

```bash
git add src/lib/carReveal.ts
git commit -m "feat(car-explorer): taratura ritmi reveal Antifurto"
```
