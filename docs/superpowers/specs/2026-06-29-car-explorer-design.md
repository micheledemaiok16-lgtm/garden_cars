# Sezione interattiva "Anatomia di un'auto" (CarExplorer)

Data: 2026-06-29
Stato: approvato (design), in attesa del piano di implementazione

## Obiettivo

Nuova sezione nella homepage con l'auto "spaccato/cutaway" (`auto3d.png`):
l'utente passa sopra (desktop) o tocca (mobile) una zona dell'auto e vede il
servizio collegato, tra i 5 trattamenti del salone. L'effetto deve essere
cinematografico (scuro) e coerente con l'identità del sito.

## Contesto

- `auto3d.png` (2816×1536, ~7 MB) è un render cutaway: telaio grezzo a sinistra,
  carrozzeria rossa verniciata a destra, con motore (etichetta "ECU-BOSCH"),
  sedili, vetri e corpo vettura tutti in vista. Una sola immagine statica
  (non un 3D reale → niente three.js: hotspot sovrapposti all'immagine).
- I 5 servizi vivono già in `src/lib/treatments.ts` (fonte unica usata da menu,
  footer e pagina `/trattamenti`). Vanno **riusati**, non duplicati.

## Mappatura zona → servizio (confermata)

| Zona sull'auto | `id` servizio |
|---|---|
| Vano motore / ECU (anteriore sx) | `centraline` |
| Carrozzeria rossa lucida (posteriore) | `lucidatura` |
| Sedili / abitacolo (centro) | `restauro-pelle` |
| Parabrezza e vetri (greenhouse) | `trattamento-vetri` |
| Ruote / corpo vettura | `car-detailing` |

## Architettura componenti

Tutto in `src/components/sections/`:

- `CarExplorer.tsx` — sezione client (`"use client"`). Tiene lo stato
  `activeId` (servizio attivo) e orchestra le sotto-parti. Default = `lucidatura`.
- `CarStage` — l'immagine sul "palco" scuro + spotlight radiale + gli hotspot
  (marker pulsante per zona). Gli hotspot sono `<button>` reali.
- `ServicePanel` — contenuto del servizio attivo (eyebrow, titolo, descrizione,
  chip features, CTA). Per `centraline` riusa `CounterStats` esistente.
- `ZoneNav` — etichette tappabili sotto l'auto (interazione mobile + legenda
  desktop).

Geometria di presentazione separata dai contenuti, in `src/lib/carZones.ts`:

```ts
export interface CarZone {
  id: string;                                   // id servizio in treatments.ts
  point: { x: number; y: number };              // fuoco spotlight + marker, in %
  hit: { x: number; y: number; rx: number; ry: number }; // area sensibile (ellisse), in %
  label?: string;                               // override etichetta (default: treatment.label)
}
```

Valori di partenza (in %, rifiniti visivamente con Playwright):

- `centraline`      → point {25, 52}
- `trattamento-vetri` → point {37, 21}
- `restauro-pelle`  → point {62, 42}
- `lucidatura`      → point {85, 30}
- `car-detailing`   → point {60, 70}

## Modello di interazione

- **Desktop (hover)**: hover su una zona → `setActive(id)`. La zona si "accende"
  (spotlight verde racing la illumina, il resto si attenua), un marker pulsa sul
  punto, il `ServicePanel` fa cross-fade sul servizio. `mouseleave` dalla zona →
  torna al default.
- **Mobile (tap)**: `ZoneNav` con etichette tappabili sotto l'auto → cambiano
  `activeId` (e quindi spotlight + pannello). Niente dipendenza dall'hover.
- **Tastiera / a11y**: hotspot e etichette sono `<button>` con `aria-label`
  ("Scopri il servizio …"); `focus` attiva la zona; `Enter`/click porta a
  `/trattamenti#<id>`. Ordine di tab logico.
- **Reduced motion**: con `prefers-reduced-motion` niente pulsazioni/transizioni
  morbide → cambio di stato istantaneo. (Pattern già usato nel progetto via
  `useReducedMotion`.)

## Design visivo (scuro / cinematografico)

- Sezione `bg-ink text-paper`, alone `glow-racing`, firma `tricolore`. Stile
  coerente con `OtherTreatments`/`ServiceRow`: `wrap`, `eyebrow`, `display-xl`,
  chip, `btn btn-primary`.
- L'auto è **scontornata** (fondo bianco rimosso) su un palco scuro con pavimento
  sfumato + riflesso morbido. Spotlight = gradiente radiale ancorato al `point`
  della zona attiva; il resto dell'auto leggermente desaturato/attenuato.
- `ServicePanel` a lato (desktop, griglia 2 colonne) / sotto (mobile).
- **Stato iniziale**: default attivo `lucidatura` (pannello mai vuoto) + hint
  "passa sul mezzo per esplorare" che sfuma dopo la prima interazione.

### Rischio scontorno + fallback

Scontornare un cutaway con telaio "a vuoto" è delicato.

- **Piano A**: rimozione automatica del fondo (es. tool dedicato) + eventuale
  ritocco; ri-encoding in WebP.
- **Piano B (fallback)**: se il ritaglio risulta impreciso, si tiene un palco
  scuro con vignette/pavimento che fonde i bordi dell'immagine — stesso mood
  cinematografico, senza ritaglio fragile.

La scelta A vs B si decide **sull'evidenza** (screenshot Playwright), non a priori.

## Gestione asset

- Spostare/derivare l'immagine in `public/` (es. `public/home/auto3d.webp`).
- Ridurre il peso: il PNG è ~7 MB → target WebP < ~800 KB.
- Servire con `next/image` (sizing/responsive corretti).

## Posizionamento

Sezione autonoma. Inserita per ora in `src/app/page.tsx` prima di
`OtherTreatments`. Spostarla è una riga (l'utente deciderà la posizione finale).

## Fuori scope (YAGNI)

- Nessun 3D reale, rotazione, zoom o pan.
- Nessun tracciamento SVG pixel-preciso di ogni parte: si usano spotlight + aree
  sensibili ellittiche, sufficienti perché le zone sono ben distanziate.
- Nessuna modifica ai contenuti dei servizi in `treatments.ts`.

## Accessibilità

- Hotspot/etichette come `<button>` con `aria-label`; navigazione da tastiera.
- `alt` descrittivo sull'immagine dell'auto.
- Rispetto di `prefers-reduced-motion`.
- Contrasto testo/pannello sul fondo scuro conforme.

## Verifica (Playwright)

- Avvio `next dev`, navigazione alla home.
- Screenshot della sezione (desktop + viewport mobile).
- Hover/focus di ciascuna delle 5 zone → verifica che pannello e spotlight
  cambino sul servizio corretto.
- Controllo del fallback estetico se lo scontorno non convince.

## Note implementative

- Vincolo di progetto (`AGENTS.md`): leggere le guide in
  `node_modules/next/dist/docs/` prima di scrivere il codice (questa è una
  versione di Next.js con API/convenzioni modificate).
- Gotcha Tailwind v4 noto nel repo: la regola globale `*` (unlayered)
  sovrascrive le utility `border-*` → impostare i colori bordo via `style`
  inline dove serve (vedi `ServiceRow.tsx`).
