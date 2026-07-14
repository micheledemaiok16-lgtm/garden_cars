# Reveal "Antifurto" — allarme che lampeggia (idea B, sola reazione dell'auto)

**Data:** 2026-07-14 · **Stato:** approvato dall'utente

## Obiettivo

Sesto reveal per-servizio del CarExplorer: click sulla voce **Antifurto** →
l'auto ruota al **3/4 anteriore sinistro (frame 136 dello spin**, stessa ancora
di "Carrozzeria" — condivisione consapevole: le guardie controllano solo la
coerenza per-id) → le frecce visibili lampeggiano 2-3 volte in arancio come un
vero allarme inserito, poi si spengono. **Nessuna presenza fisica** (niente
mano/ladro): solo la reazione dell'auto, coerente con l'estetica "auto sola su
fondo nero" degli altri reveal.

La voce "antifurto" esiste già in `treatments.ts` (menu, footer, /trattamenti);
qui si aggiunge la sua presenza nel CarExplorer della home.

## 1. Generazione video (Higgsfield, pipeline collaudata)

- **Start image:** frame 136 dello spin (`public/home/spin/frame-136.webp`),
  upscalato a 1280×720, caricato via `media_upload` → `curl PUT` →
  `media_confirm`.
- **Modello:** `seedance_2_0_mini`, 720p, **5s**, `bitrate_mode: "high"`,
  `generate_audio: false`, aspect 16:9. `get_cost: true` prima del lancio; se
  scatta una `preset_recommendation`, rigenerare con `declined_preset_id`.
- **Prompt (direzione):** auto PERFETTAMENTE FERMA, camera fissa, unica ripresa
  continua; gli indicatori di direzione visibili (freccia anteriore sinistra,
  ripetitore sullo specchietto, freccia posteriore sinistra) lampeggiano
  **2-3 volte in arancio caldo**, con riflesso del lampeggio sulla fiancata
  nera lucida; poi tutto si spegne e torna esattamente com'era. **Start = end**
  (frecce spente a inizio e fine) così il loop ping-pong non salta.
- **Rischio noto (accettato):** seedance può reincorniciare il primo frame →
  coperto dalla dissolvenza 300ms di `CarDoorReveal`. Il lampeggio arancio
  pulito potrebbe richiedere 2-3 tentativi di generazione.

## 2. Estrazione asset

- 61 WebP `frame-000..060.webp` in `public/home/antifurto-reveal/`
  (sorgente 0..120, un frame ogni 2 — come gli altri reveal).
- Dissolvenza bordi verso #000 bakata, rampa smoothstep lati 100 / alto 80 /
  basso 100. **Bug geq noto:** clampare `d` a [0,1] PRIMA del polinomio
  `d²(3-2d)`.
- Il mp4 sorgente resta locale/gitignored; si versionano solo i WebP.
- `REVEAL_ASSET_VERSION` resta 1 (file nuovi, niente cache da bustare).

## 3. Codice (~15 righe, nessun componente nuovo)

- **`carSpots.ts`:** aggiungere `"antifurto"` all'union `TreatmentId` e una
  voce in coda a `carSpots`: `label: "Antifurto"`, `anchorFrame: 136`, samples
  minimi in range (i pallini non sono più usati, come annotato per "Interni").
  Fa comparire il pulsante nella ZoneNav (già `<button>` per le voci con
  reveal → nessuna modifica lì).
- **`carReveal.ts`:** nuova voce
  `{ id: "antifurto", anchorFrame: 136, frameCount: 61,
  dir: "/home/antifurto-reveal", alt: "Frecce che lampeggiano: l'allarme
  antifurto segnala il tentativo di apertura", loop: true }` con ritmo
  **loop ping-pong** come i vetri: indicativamente `openMs: 1260`,
  `closeMs: 1260`, `loopHoldMs: ~900` (pausa a frecce spente un po' più lunga,
  così il lampeggio arriva "a ondate"); taratura finale sul clip reale.
- **`CarExplorer.tsx`:** titolo "Un'auto, **sei** trattamenti."
- **Test:** aggiornare `carReveal.test.ts` se asserisce l'assenza di
  "antifurto"; aggiungere i casi del nuovo reveal.
- Niente altro: guardie d'integrità e montaggio automatico dei reveal in
  `CarExplorer` coprono il resto.

## 4. Comportamento utente (identico ai reveal in loop esistenti)

Click su "Antifurto" → tween dello spin al frame 136 → dissolvenza 300ms sul
frame 0 del clip → lampeggio (scrub lineare 0→1) → pausa → reverse → pausa →
ripete → ri-click / drag sull'auto / click fuori → chiusura (reverse dal punto
corrente, instant su drag) → dissolvenza via, lo spin riprende.

## Verifica

`npx tsc --noEmit`, `npm run lint`, `npx vitest run` verdi; prova visiva su
dev server (rotazione all'ancora, loop del lampeggio, 3 vie di chiusura,
convivenza con "Carrozzeria" sulla stessa ancora, nessun errore console
proprio).
