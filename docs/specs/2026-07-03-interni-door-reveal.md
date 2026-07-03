# Interni — Apertura sportello + reveal abitacolo (CarExplorer `#esplora`)

- **Data:** 2026-07-03
- **Stato:** design approvato, in attesa del piano di implementazione
- **Contesto:** prima animazione "per-servizio" del CarExplorer. Segue lo spin 360
  ibrido descritto in `car-explorer-part-isolation` / `car-360-video-pipeline`.

## Obiettivo

Cliccando la voce **"Interni"** (servizio `restauro-pelle`) nella sezione
`#esplora`, l'auto ruota alla portiera del **guidatore**, **lo sportello si apre**
e rivela un abitacolo restaurato con **sedili + volante nuovi**. È un'animazione
**"parallela"** allo spin 360: lo spin resta il comportamento di riposo, questa
parte in sovrimpressione quando si clicca il servizio. Contestualmente si
**rimuovono i pallini verdi** sovrapposti all'auto.

È la **prima** di una serie: l'impianto va predisposto per aggiungere in seguito
un'animazione dedicata anche alle altre voci, ma qui si realizza **solo** Interni.

## Decisioni bloccate

- **Approccio (a)** — ripresa unica e continua: lo sportello si apre davvero
  sull'auto in scena, senza stacchi. (Scartata la (b) "apertura accennata +
  dissolvenza su clip dedicato": resta solo come fallback, vedi Rischi.)
- **Handoff invisibile:** il clip dell'apertura è generato con
  `start_image` = **l'esatto fotogramma dello spin** alla portiera → il primo
  frame combacia pixel-per-pixel, il passaggio spin→apertura non si vede.
- **Playback via scrub di WebP**, non seek dell'mp4 (che è a scatti): come per lo
  spin si estrae l'apertura in una sequenza di fotogrammi WebP e la si "scrubba"
  con un tween. Apertura = 0→1, **chiusura = reverse 1→0** (nessun problema di
  mp4 riprodotto al contrario).
- **Portiera guidatore (sinistra)**, posa **3/4 anteriore sx** (frame ~0/143
  dello spin), dove volante + sedile guida sono naturalmente inquadrati.
- **Interni: pelle cognac** con cuciture a contrasto, trim scuro — coerente con la
  gallery `restauro-pelle` esistente (`pelle-sedile.webp`, "pelle cognac
  rigenerata").
- **Chiusura (i):** dopo l'apertura l'abitacolo **resta visibile** finché l'utente
  non interagisce (trascina l'auto, sceglie un'altra voce, o clicca fuori) →
  allora lo sportello si **richiude** (reverse) e riprende lo spin.

## Interazione

- **Rimozione pallini:** il componente `CarSpots` (pallini verdi
  `bg-racing-bright`) viene tolto. L'auto resta pulita; restano le etichette-testo
  sotto (`ZoneNav`: Motore, Vetri, Interni, Carrozzeria, Detailing).
- **Hover "Interni"** → invariato: l'auto ruota alla posa portiera guidatore
  (preview via `targetFrame`).
- **Click "Interni"** → parte l'apertura. **Non naviga più** a `/trattamenti`
  (oggi la voce è un `<Link>` che naviga): il click ora attiva l'animazione e
  resta in pagina. Per andare alla pagina del servizio resta il pulsante
  "Vai al servizio" nel pannello di destra (`ServicePanel`).
- **Chiusura:** qualunque interazione (drag sull'auto, click su un'altra voce,
  click fuori dall'auto) → reverse dell'apertura + ripresa spin.
- **Altre 4 voci:** comportamento attuale invariato (hover ruota, click naviga)
  finché non riceveranno la loro animazione.

## Architettura tecnica

- **Sorgente di verità del reveal:** nuovo `carReveal.ts` con la config per
  `restauro-pelle`: `anchorFrame` (frame-porta dello spin), `frameCount`
  dell'apertura, path/pattern degli asset, versione cache-busting. È il **punto
  d'estensione** per i futuri servizi (mappa `id → reveal`).
- **Overlay:** nuovo `CarDoorReveal.tsx`, montato **sopra** lo spin (z maggiore),
  `object-contain` nello stesso box → stessa geometria dello spin. Precarica i
  WebP dell'apertura in un ref (come fa `Car360` con i 144 frame). Gestisce il
  tween apertura/chiusura via rAF + swap opacità in DOM diretto (no setState per
  frame).
- **Stato/handoff in `CarExplorer`:** stato `doorOpen` (chiuso | in-apertura |
  aperto | in-chiusura). Click "Interni": prima porta lo spin all'`anchorFrame`
  (tween esistente), **quando è all'ancora** mostra l'overlay (frame 0 == frame
  spin → swap invisibile) e avvia il tween 0→1. Interazione in stato aperto →
  tween 1→0 poi smonta l'overlay → lo spin riappare all'ancora → riposo.
- **`Car360`:** espone un "modo apertura" che, quando attivo, **sospende
  l'auto-spin** (video in pausa sul frame ancora) e lascia il palco all'overlay.
- **Bordi:** i frame dell'apertura ricevono la **stessa dissolvenza smoothstep
  verso #000** già bakata nello spin, così l'overlay non disegna alcun rettangolo
  sul fondo nero.

## Asset (Higgsfield)

- 1 clip corto (3-5 s), camera lenta/quasi ferma: **sportello guidatore che si
  apre** rivelando abitacolo cognac restaurato (pelle nuova + volante nuovo).
  `start_image` = frame-porta dello spin.
- Pipeline: genera → estrai i WebP dell'apertura (dimensioni allineate allo spin)
  → baking bordi verso #000 → eventuale poster.
- **`get_cost` PRIMA** di generare. Preventivare **1-2 tentativi** (approccio (a)
  è il più delicato sul mantenere identica la carrozzeria). Crediti residui ~75 →
  sufficienti.

## Modifiche al codice (perimetro)

- `src/components/sections/CarSpots.tsx` → rimosso; riferimenti in `CarExplorer`
  ripuliti.
- `src/components/sections/CarDoorReveal.tsx` → **nuovo**: overlay + tween
  apertura/chiusura + precarico frame.
- `src/components/sections/Car360.tsx` → "modo apertura" (sospende auto-spin,
  resta sul frame ancora).
- `src/components/sections/CarExplorer.tsx` → stato `doorOpen`; click "Interni"
  apre invece di navigare; qualsiasi interazione chiude.
- `src/lib/carReveal.ts` → **nuovo**: config reveal per `restauro-pelle`.
- Test vitest sulla logica pura (mappa frame apertura, guardie config).

## Robustezza / edge

- **`prefers-reduced-motion`** → niente animazione: mostra direttamente l'ultimo
  frame (interno statico).
- **Asset mancante/errore** → fallback silenzioso: resta lo spin, nessuna
  apertura (come il fallback già presente in `Car360`).
- **Cache-busting** con lo stesso schema `?v=N` già in uso per lo spin.

## Rischi e fallback

- **(a) è la più bella ma la più fragile:** il generativo può deformare la
  carrozzeria *durante* i secondi di apertura. Mitigazioni: clip corta, camera
  lenta, ancoraggio del primo frame sullo spin reale.
- **Fallback:** se dopo un paio di generazioni l'auto "muta" troppo, si ripiega
  sull'approccio (b) (apertura accennata + dissolvenza su un clip abitacolo
  dedicato), che non richiede continuità pixel-perfect. Da concordare con l'utente
  se si arriva a quel punto.

## Fuori scope (per ora)

- Animazioni dedicate per le altre 4 voci (impianto predisposto, non realizzate).
- Rifinitura x/y dei pallini: i pallini vengono **rimossi**, quindi decade.

## Da finalizzare in fase di implementazione

- **Frame ancora esatto** della portiera (ispezione visiva sui frame reali).
- **Numero di frame** dell'apertura (dipende dal clip generato).
- **Durata/easing** del tween di apertura e chiusura (rifinitura a video).
