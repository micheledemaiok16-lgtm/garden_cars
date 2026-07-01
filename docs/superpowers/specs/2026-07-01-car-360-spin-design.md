# Car 360 — auto rotabile con pallini dei servizi

**Data:** 2026-07-01
**Stato:** approvato (design), pronto per il piano di implementazione

## Obiettivo

Sostituire l'attuale immagine 2D dello spaccato nella sezione homepage "Esplora i
servizi" con un'auto **rotabile e fotorealistica** (Audi RS Q8 nera), su cui
compaiono i **pallini dei servizi** già presenti oggi. L'utente trascina per far
girare l'auto e scopre i trattamenti associati ai vari punti.

Requisito di qualità dichiarato dall'utente: l'auto deve essere **il più reale
possibile, mai "giocattolo"**, completa e senza pezzi mancanti.

## Scelte di fondo (già decise)

- **Approccio: spin da sequenza di fotogrammi pre-renderizzati**, non 3D WebGL e
  non video. Motivo: un'auto nera lucida in WebGL realtime rischia l'effetto
  giocattolo; i fotogrammi pre-renderizzati garantiscono il fotorealismo restando
  leggeri. Validato con una prova reale (orbita generata da Higgsfield/Kling: auto
  completa, verniciatura credibile, identità mantenuta).
- **Copertura: arco ~180°** (3/4 anteriore → fiancata → 3/4 posteriore). Non si
  inquadra mai il retro puro, che la generazione AI ricostruisce in modo meno
  affidabile.
- **Estendibilità a 360° senza perdere lavoro** è un requisito esplicito: il
  sistema è agnostico rispetto al numero di fotogrammi e all'ampiezza dell'arco.
  Passare a 360° = aggiungere fotogrammi e campioni dei pallini; il componente,
  la logica di trascinamento e il modello dati non cambiano.

## Architettura

Nuovo componente client `Car360` che **sostituisce `CarStage`** dentro
`src/components/sections/CarExplorer.tsx`, **riusando** i componenti esistenti:

- `ServicePanel` — pannello nome servizio + link (invariato).
- `ZoneNav` — legenda/nav mobile con i link ai trattamenti (invariato nella
  sostanza; cambia solo cosa fa l'hover/tap: porta l'auto all'angolo della parte).

Nessuna nuova dipendenza pesante: solo React + `framer-motion` (già nel progetto)
e la sequenza di immagini.

### File coinvolti

- `src/components/sections/CarExplorer.tsx` — orchestrazione sezione; sostituisce
  `CarStage` con `Car360`.
- `src/components/sections/Car360.tsx` — **nuovo**: stage rotabile + pallini.
- `src/lib/carSpin.ts` — **nuovo**: configurazione della sequenza (conteggio
  fotogrammi, path, ampiezza arco) e dei pallini (`carSpots`).
- `src/lib/carZones.ts` — la geometria hotspot 2D attuale viene sostituita dal
  nuovo modello `carSpots`; l'associazione id-servizio e la guardia d'integrità
  verso `treatments.ts` vengono conservate.
- `public/home/spin/frame-000.webp … frame-035.webp` — **nuovi asset**.

## Modello dati

### Sequenza (`carSpin.ts`)

```ts
export const SPIN = {
  frameCount: 36,          // cambiare questo per più/meno fotogrammi
  arcDegrees: 180,         // 180 ora, 360 in futuro
  wrap: false,             // false = clamp agli estremi; true = giro continuo (360)
  srcFor: (i: number) => `/home/spin/frame-${String(i).padStart(3, "0")}.webp`,
};
```

### Pallini (`carSpots`)

Ogni servizio ha una lista di **campioni** lungo la rotazione. Tra due campioni la
posizione è **interpolata**; il pallino **compare/sfuma** in base a `visible`.

```ts
interface SpotSample { frame: number; x: number; y: number; visible: boolean }
interface CarSpot {
  id: TreatmentId;         // stesso id di treatments.ts (link /trattamenti#<id>)
  label: string;
  anchorFrame: number;     // frame "migliore" per questa parte (usato da ZoneNav)
  samples: SpotSample[];   // x/y in % del box immagine, campionati lungo l'arco
}
```

- **Interpolazione:** dato il frame corrente (anche frazionario durante il drag),
  si trovano i due campioni adiacenti e si interpola `x`, `y`. L'opacità va a 0
  quando si esce dall'intervallo `visible` (con una breve dissolvenza).
- **Estensione a 360°:** basta aggiungere campioni oltre l'attuale arco. Nessuna
  modifica al componente.

### Mappatura servizi → punti

I 5 servizi attuali (`centraline`/Motore, `lucidatura`/Carrozzeria,
`trattamento-vetri`/Vetri, `restauro-pelle`/Interni, `car-detailing`/Detailing):

- Motore → muso/griglia anteriore
- Carrozzeria → fiancata
- Vetri → finestrini/parabrezza
- Interni → abitacolo (visibile attraverso i vetri)
- Detailing → ruota/cerchio (o insieme auto)

## Interazione

- **Drag** (pointer events: mouse + touch) → scrub del frame avanti/indietro. La
  velocità mappa lo spostamento orizzontale sul delta di frame.
- **Da fermo l'auto resta immobile** (nessuna auto-rotazione): parte su un
  fotogramma iniziale e si muove solo quando l'utente trascina. Un piccolo hint
  ("trascina per ruotare") invita all'interazione, poi svanisce al primo drag.
- **Estremi arco (180°):** clamp con leggero rimbalzo agli estremi (nessun wrap).
  In 360° (`wrap: true`) la rotazione è continua.
- **ZoneNav / pallini:** hover/tap porta l'auto all'`anchorFrame` della parte
  (animazione morbida) ed evidenzia il servizio nel `ServicePanel`. Click sul
  pallino/voce = link a `/trattamenti#<id>` (come oggi).

## Accessibilità & performance

- Primo fotogramma renderizzato subito (priorità); gli altri **precaricati** in
  background dopo il mount.
- Peso: fotogrammi WebP ottimizzati, larghezza ~1280px, `object-contain`. Obiettivo
  sequenza complessiva contenuta; caricamento differito della sezione.
- `prefers-reduced-motion`: nessun impatto sulla rotazione (già assente); vengono
  attenuate solo le transizioni/dissolvenze dei pallini e del pannello.
- **Fallback**: se le immagini non caricano, mostrare un fotogramma statico (o
  l'immagine attuale) con i pallini nelle posizioni dell'`anchorFrame`.
- Navigazione da tastiera tramite `ZoneNav` (già link focalizzabili).

## Pipeline di produzione asset

1. **Base pulita**: rigenerare un'immagine dell'Audi RS Q8 nera su fondo scuro
   **senza** la scritta "Audi Sport" sulla portiera e **senza** lo sparkle,
   partendo dall'attuale `vetri_e_fari.png`.
2. **Orbita 180°**: generare l'orbita a **più clip concatenate** (l'ultimo
   fotogramma di una clip diventa lo start della successiva) fino a coprire ~180°,
   con illuminazione e fondo coerenti tra le clip.
3. **Estrazione fotogrammi**: campionare ~36 fotogrammi equidistanti lungo l'arco.
4. **Ottimizzazione**: esportare in WebP dimensionati per il web in
   `public/home/spin/`.
5. **Autoraggio pallini**: ispezionando i fotogrammi, definire i `samples` (x/y +
   visible) per ciascun servizio in `carSpin.ts`.

## Fuori scope (per ora)

- Rotazione verticale (inclinazione sopra/sotto).
- Vista 360° completa (predisposta ma non prodotta in questa iterazione).
- Zoom / interni cliccabili in dettaglio.

## Criteri di completamento

- L'auto ruota fluidamente su ~180° con il drag (immobile da ferma), su desktop e
  mobile, senza effetto "giocattolo".
- I 5 pallini compaiono/sfumano correttamente seguendo la rotazione e linkano ai
  trattamenti.
- `prefers-reduced-motion` e il fallback immagini funzionano.
- La struttura consente il passaggio a 360° aggiungendo solo asset e campioni.
