# Reveal "Centraline" — cofano aperto e motore dall'alto

**Data:** 2026-07-13 · **Stato:** approvato dall'utente

## Obiettivo

Secondo reveal per-servizio del CarExplorer (dopo "Interni"): click sulla voce
**Centraline** → l'auto ruota al muso (frame 18 dello spin) → una ripresa
continua avanza verso il cofano, il cofano si apre e la camera sale fino a
guardare il **vano motore dall'alto**. Resta aperto finché l'utente non
interagisce, poi richiude in reverse. Nessun taglio brusco.

Lo stage in pagina è **Car360** (video+WebP, rimesso temporaneamente al posto
di Car3D per la valutazione della rigenerazione spin); il contratto dei reveal
è identico su entrambi gli stage, quindi il lavoro vale anche per Car3D.

## 1. Generazione video (Higgsfield, ≈12,5 cr su 32,5 disponibili)

- **Start image:** frame 18 dello spin (`public/home/spin/frame-018.webp`,
  muso in camera), upscalato a 1280×720, caricato via `media_upload` →
  `curl PUT` → `media_confirm` (pipeline già collaudata per Interni).
- **Modello:** `seedance_2_0_mini` (Basic: il full è 403), 720p, **5s**,
  `bitrate_mode: "high"`, `generate_audio: false`, aspect 16:9.
  `get_cost: true` prima del lancio; se scatta una `preset_recommendation`,
  rigenerare con `declined_preset_id`.
- **Prompt (direzione):** auto FERMA, unica ripresa continua; camera che
  avanza lentamente dal muso, cofano che si apre fluido, camera che sale e si
  porta perpendicolare sopra il vano motore; motore dettagliato e pulito, mood
  scuro da studio coerente con lo spin; movimento lento, costante, senza tagli.
- **Rischio noto (accettato):** seedance può reincorniciare il primo frame
  (successo con Interni) → l'aggancio visivo allo spin è coperto dalla
  dissolvenza 300ms già presente in `CarDoorReveal`. Scelta consapevole
  dell'utente: generazione diretta, niente test 480p preliminare.

## 2. Estrazione asset

- 61 WebP `frame-000..060.webp` in `public/home/centralina-reveal/`
  (sorgente 0..120, un frame ogni 2 — come Interni).
- Dissolvenza bordi verso #000 bakata, rampa gentile smoothstep
  lati 100 / alto 80 / basso 100. **Bug geq noto:** clampare `d` a [0,1]
  PRIMA del polinomio `d²(3-2d)`, non clippare l'output.
- Il mp4 sorgente resta locale/gitignored; si versionano solo i WebP.
- `REVEAL_ASSET_VERSION` resta 1 (file nuovi, niente cache da bustare).

## 3. Codice

- **`carReveal.ts`:** nuova voce
  `{ id: "centraline", anchorFrame: 18, frameCount: 61, dir: "/home/centralina-reveal", alt: … }`.
  Il campo `seatColor` diventa un generico **`alt`** per-reveal (il testo di
  Interni si conserva). Guardie d'integrità esistenti invariate
  (id in treatments + carSpots, anchorFrame coerente: centraline=18 ✓).
- **`CarExplorer.tsx`:** generalizzare il singolo `REVEAL_ID` cablato →
  qualunque servizio con reveal (stato `openId: string | null` al posto del
  booleano); la rotazione all'ancora e il ciclo apri/tieni/chiudi restano
  identici.
- **`CarDoorReveal.tsx`:** logica invariata; solo `alt` parametrico dal config.
- **`ZoneNav`:** già rende `<button>` le voci con reveal → nessuna modifica
  attesa (verificare).
- **Test:** `carReveal.test.ts` oggi asserisce `getReveal("centraline") →
  undefined` → va aggiornato; aggiungere i casi del nuovo reveal.

## 4. Comportamento utente (invariato rispetto a Interni)

Click su "Centraline" → tween dello spin al frame 18 → dissolvenza 300ms sul
frame 0 del clip → apertura (scrub ease-out) → hold sul motore dall'alto →
ri-click / drag sull'auto / click fuori → chiusura (reverse scrub, instant su
drag) → dissolvenza via, lo spin riprende.

## Verifica

`npx tsc --noEmit`, `npm run lint`, `npx vitest run` verdi; prova visiva su
dev server (apertura, hold, 3 vie di chiusura, nessun errore console proprio).

## Addendum (stesso giorno, approvato a voce durante il collaudo)

- **Ritmo per-reveal:** `openMs`/`closeMs` in config = scrub LINEARE a tempo
  (ritmo costante, "video a N×"); assenti → ease-out esponenziale legacy
  (0.14/0.16, tarato sullo sportello). Centraline: apertura 4× (1260ms),
  chiusura 4.5× (1120ms) — tarate dall'utente per tentativi.
- **Reveal "Vetri" (`trattamento-vetri`, ancora 126 = fiancata sx):** clip
  seedance gemello (job `947aefa4`, 12,5cr, stessa pipeline; camera quasi
  ferma, i vetri si oscurano da semi-trasparenti a tinta nera piena) → 61 WebP
  in `public/home/vetri-reveal/`. Novità: **`loop: true`** = da aperto
  l'effetto va in ping-pong (0→1, pausa `loopHoldMs`, 1→0, pausa, ripete),
  per mostrare la trasformazione più volte; chiusura = solito reverse dal
  punto corrente. Vetri: openMs 2520 (2×), closeMs 1260, hold 1100ms.
- Crediti Higgsfield dopo i due clip: 7,5.
