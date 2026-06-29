# CarExplorer — Sezione interattiva "Anatomia di un'auto" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere alla homepage una sezione dove l'utente passa (desktop) o tocca (mobile) le parti dell'auto in `auto3d.png` e vede il servizio collegato, tra i 5 trattamenti del salone.

**Architecture:** Un'unica immagine statica (render cutaway) con hotspot `<button>` sovrapposti, posizionati in percentuale. Lo stato `activeId` (servizio attivo) guida uno spotlight verde che segue la zona e un pannello che fa cross-fade sul contenuto. I contenuti dei 5 servizi sono riusati da `src/lib/treatments.ts`; solo la geometria degli hotspot è nuova (`src/lib/carZones.ts`). Stile scuro/cinematografico coerente con le sezioni `bg-ink` esistenti.

**Tech Stack:** Next.js 16 (App Router), React 19, framer-motion ^12, Tailwind v4, `next/image`, `next/link`.

## Global Constraints

- Next.js 16 App Router; il componente interattivo è un Client Component (`"use client"`).
- Riusare i contenuti da `src/lib/treatments.ts`; **NON** modificarne i contenuti.
- Animazioni con `framer-motion`; rispettare `prefers-reduced-motion` via `useReducedMotion` (pattern già usato nel repo).
- Token Tailwind v4 esistenti: `bg-ink`, `text-paper`, `text-racing-bright`, `glow-racing`, `wrap`, `eyebrow`, `display-xl`/`display-lg`, `btn btn-primary`, `tricolore-line`.
- **Gotcha Tailwind v4:** la regola globale `*` (unlayered) sovrascrive le utility `border-*` colore → impostare i colori del bordo via `style` inline (vedi `ServiceRow.tsx`).
- Copy UI e commenti in **italiano** (coerenza col repo); apostrofi in JSX come `&apos;`.
- Servizio attivo di default: **`lucidatura`**.
- **Niente test runner nel progetto** (nessun jest/vitest). Verifica per task con: `npx tsc --noEmit`, `npm run lint`, `npm run build`, e Playwright (MCP) per comportamento/aspetto. Scelta consapevole (YAGNI: feature presentazionale, nessuna infra di test da aggiungere).
- L'integrità dati zona→servizio è garantita a compile/build time (type union + guardia runtime), non da unit test.

## Pre-flight (git hygiene)

Il working tree ha modifiche **non committate dell'utente** (`src/app/page.tsx`, `src/lib/treatments.ts`, vari componenti, immagini). Il Task 5 tocca `page.tsx`: committarlo includerebbe anche le modifiche WIP dell'utente in quel file. Prima di eseguire il Task 5, chiedere all'utente se preferisce committare/stashare il proprio WIP, oppure accettare che il commit di wiring includa le sue modifiche a `page.tsx`. Non committare `treatments.ts` (non lo modifichiamo).

## File Structure

- **Create** `src/lib/carZones.ts` — geometria hotspot (id servizio, etichetta, punto %, area sensibile %), tipo `CarZone`, `DEFAULT_ZONE_ID`, guardia d'integrità.
- **Create** `src/components/sections/CarExplorer.tsx` — sezione client completa: shell + `CarStage` + `ServicePanel` + `ZoneNav` come sotto-componenti locali (stesso pattern di `ServiceRow.tsx`, che tiene i suoi sotto-componenti nello stesso file → stato condiviso senza prop-drilling tra file).
- **Create** `public/home/auto3d.png` — immagine usata dal componente (cutout su sfondo trasparente; vedi Task 2/4).
- **Modify** `src/app/page.tsx` — import + render di `<CarExplorer />` prima di `<OtherTreatments />`.

---

### Task 1: Geometria hotspot (`carZones.ts`)

**Files:**
- Create: `src/lib/carZones.ts`

**Interfaces:**
- Produces: `interface CarZone { id: TreatmentId; label: string; point: {x:number;y:number}; hit: {x:number;y:number;rx:number;ry:number} }`, `const carZones: readonly CarZone[]`, `const DEFAULT_ZONE_ID: TreatmentId` (= `"lucidatura"`), `type TreatmentId`.
- Consumes: `treatments` da `@/lib/treatments`.

- [ ] **Step 1: Creare il file con dati e guardia**

```ts
// src/lib/carZones.ts
import { treatments } from "@/lib/treatments";

/**
 * Geometria degli hotspot sull'immagine auto3d (sezione CarExplorer).
 * Separata dai contenuti: i testi dei servizi vivono in treatments.ts.
 * Le coordinate sono in percentuale (0–100) rispetto al box dell'immagine
 * e vengono rifinite visivamente (vedi Task 5).
 */

/** id dei servizi mappati sull'auto (sottoinsieme degli id di treatments.ts). */
export type TreatmentId =
  | "centraline"
  | "lucidatura"
  | "restauro-pelle"
  | "trattamento-vetri"
  | "car-detailing";

export interface CarZone {
  /** Servizio collegato (anche ancora /trattamenti#<id>). */
  id: TreatmentId;
  /** Etichetta breve per la nav mobile/legenda. */
  label: string;
  /** Fuoco dello spotlight + posizione del marker, in %. */
  point: { x: number; y: number };
  /** Area sensibile all'hover/tap (ellisse), in %. */
  hit: { x: number; y: number; rx: number; ry: number };
}

/** Servizio attivo all'apertura (così il pannello non è mai vuoto). */
export const DEFAULT_ZONE_ID: TreatmentId = "lucidatura";

export const carZones: readonly CarZone[] = [
  { id: "centraline",        label: "Motore",      point: { x: 25, y: 52 }, hit: { x: 25, y: 52, rx: 11, ry: 13 } },
  { id: "trattamento-vetri", label: "Vetri",       point: { x: 38, y: 22 }, hit: { x: 40, y: 23, rx: 14, ry: 10 } },
  { id: "restauro-pelle",    label: "Interni",     point: { x: 62, y: 42 }, hit: { x: 62, y: 44, rx: 12, ry: 16 } },
  { id: "lucidatura",        label: "Carrozzeria", point: { x: 85, y: 30 }, hit: { x: 85, y: 32, rx: 12, ry: 18 } },
  { id: "car-detailing",     label: "Ruote",       point: { x: 60, y: 73 }, hit: { x: 60, y: 74, rx: 10, ry: 12 } },
] as const;

// Guardia d'integrità a caricamento modulo: ogni zona deve corrispondere a un
// servizio esistente in treatments.ts. Fallisce il build se un id è sbagliato.
for (const z of carZones) {
  if (!treatments.some((t) => t.id === z.id)) {
    throw new Error(`carZones: id "${z.id}" non presente in treatments.ts`);
  }
}
```

- [ ] **Step 2: Verifica integrità (il "test")**

Run: `npx tsc --noEmit`
Expected: PASS (nessun errore di tipo).

Prova negativa (dimostra che la guardia funziona): cambiare temporaneamente un `id` in `"bogus"` →
- `npx tsc --noEmit` → FAIL (`Type '"bogus"' is not assignable to type 'TreatmentId'`).
Ripristinare l'id corretto → torna a PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/carZones.ts
git commit -m "feat(home): geometria hotspot CarExplorer (carZones)"
```

---

### Task 2: Asset immagine in `public/`

**Files:**
- Create: `public/home/auto3d.png` (cutout trasparente) e `public/home/auto3d-raw.png` (originale, backup)

**Interfaces:**
- Produces: il path pubblico `/home/auto3d.png` usato dal componente nel Task 3.

- [ ] **Step 1: Spostare l'originale in public**

```bash
mkdir -p public/home
cp auto3d.png public/home/auto3d-raw.png
cp auto3d.png public/home/auto3d.png
```

- [ ] **Step 2: Scontornare (Plan A)**

Rimuovere lo sfondo bianco dell'auto con il tool MCP `remove_background` (Higgsfield) sull'immagine `public/home/auto3d-raw.png`; scaricare il risultato (PNG trasparente) **sovrascrivendo** `public/home/auto3d.png`.

> ⚠️ Rischio noto: il cutaway ha telaio "a vuoto" con sfondo bianco visibile tra i montanti; lo scontorno automatico può lasciare bianco intrappolato. La qualità si **giudica nel Task 4** (screenshot Playwright). Se scarsa → fallback "studio card" descritto nel Task 4. In quel caso si usa `auto3d-raw.png`.

- [ ] **Step 3: Commit**

```bash
git add public/home/auto3d.png public/home/auto3d-raw.png
git commit -m "chore(home): aggiungi immagine auto3d (raw + cutout) in public"
```

---

### Task 3: Componente `CarExplorer` (shell + interazione)

**Files:**
- Create: `src/components/sections/CarExplorer.tsx`

**Interfaces:**
- Consumes: `carZones`, `DEFAULT_ZONE_ID`, `CarZone` da `@/lib/carZones`; `treatments`, `Treatment` da `@/lib/treatments`; `Reveal` da `@/components/ui/Reveal`; `CounterStats` da `@/components/sections/treatments/CounterStats`; `cn` da `@/lib/utils`.
- Produces: `export default function CarExplorer()` (nessuna prop).

- [ ] **Step 1: Creare il file completo**

```tsx
// src/components/sections/CarExplorer.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { treatments, type Treatment } from "@/lib/treatments";
import { carZones, DEFAULT_ZONE_ID } from "@/lib/carZones";
import { CounterStats } from "@/components/sections/treatments/CounterStats";
import { cn } from "@/lib/utils";

// Sorgente immagine + aspetto del render originale (2816×1536).
const CAR_SRC = "/home/auto3d.png";
const CAR_ALT =
  "Spaccato tecnico di un'auto: telaio, motore, abitacolo e carrozzeria in vista";
const CAR_ASPECT = "2816 / 1536";

function treatmentById(id: string): Treatment {
  return treatments.find((t) => t.id === id) ?? treatments[0];
}

/**
 * Sezione homepage "Anatomia di un'auto": l'utente passa (desktop) o tocca
 * (mobile, via ZoneNav) le parti dell'auto e vede il servizio collegato.
 * Contenuti riusati da treatments.ts; geometria in carZones.ts.
 */
export default function CarExplorer() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(DEFAULT_ZONE_ID);
  const [touched, setTouched] = useState(false);

  const active = treatmentById(activeId);

  // hover/focus: cambia solo la zona attiva; tap/click: marca l'interazione
  // (nasconde l'hint) e fissa la zona.
  const preview = (id: string) => setActiveId(id);
  const select = (id: string) => {
    setActiveId(id);
    setTouched(true);
  };

  return (
    <section
      id="esplora"
      className="relative overflow-hidden bg-ink py-24 text-paper md:py-32"
    >
      <div className="glow-racing pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 opacity-20 blur-3xl" />

      <div className="wrap relative">
        <div className="max-w-2xl">
          <Reveal>
            <span className="eyebrow text-racing-bright">Esplora i servizi</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-xl mt-5">Un&apos;auto, cinque trattamenti.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-paper/70">
              Passa sulle diverse parti dell&apos;auto e scopri come la
              trasformiamo, dal motore alla carrozzeria.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid items-center gap-8 lg:mt-16 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <CarStage
            activeId={activeId}
            onPreview={preview}
            onSelect={select}
            reduce={reduce}
            showHint={!touched}
          />
          <ServicePanel treatment={active} reduce={reduce} />
        </div>

        <ZoneNav activeId={activeId} onSelect={select} />
      </div>
    </section>
  );
}

/* --------------------------- Palco auto + hotspot --------------------------- */

function CarStage({
  activeId,
  onPreview,
  onSelect,
  reduce,
  showHint,
}: {
  activeId: string;
  onPreview: (id: string) => void;
  onSelect: (id: string) => void;
  reduce: boolean | null;
  showHint: boolean;
}) {
  const activeZone = carZones.find((z) => z.id === activeId) ?? carZones[0];

  return (
    <div className="relative w-full select-none" style={{ aspectRatio: CAR_ASPECT }}>
      {/* ombra/pavimento sotto l'auto */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[8%] bottom-[5%] h-[12%] rounded-[50%] bg-black/70 blur-2xl"
      />

      <Image
        src={CAR_SRC}
        alt={CAR_ALT}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="object-contain"
      />

      {/* spotlight verde che segue la zona attiva (additivo sull'auto) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[42%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--color-racing-bright) 55%, transparent), transparent)",
          mixBlendMode: "screen",
        }}
        animate={{ left: `${activeZone.point.x}%`, top: `${activeZone.point.y}%` }}
        transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* hotspot */}
      {carZones.map((zone) => {
        const isActive = zone.id === activeId;
        const t = treatmentById(zone.id);
        return (
          <button
            key={zone.id}
            type="button"
            onMouseEnter={() => onPreview(zone.id)}
            onFocus={() => onPreview(zone.id)}
            onClick={() => onSelect(zone.id)}
            aria-label={`Scopri il servizio ${t.title}`}
            aria-pressed={isActive}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none"
            style={{
              left: `${zone.hit.x}%`,
              top: `${zone.hit.y}%`,
              width: `${zone.hit.rx * 2}%`,
              height: `${zone.hit.ry * 2}%`,
            }}
          >
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-racing-bright shadow-[0_0_0_4px_rgba(46,139,67,0.25)]"
            />
            {!reduce && isActive && (
              <motion.span
                aria-hidden
                className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-racing-bright/60"
                animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </button>
        );
      })}

      <AnimatePresence>
        {showHint && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ borderColor: "rgba(245,244,240,0.15)" }}
            className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border bg-ink/70 px-4 py-2 font-display text-xs uppercase tracking-widest text-paper/70 backdrop-blur"
          >
            Passa sul mezzo per esplorare
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ Pannello servizio --------------------------- */

function ServicePanel({
  treatment,
  reduce,
}: {
  treatment: Treatment;
  reduce: boolean | null;
}) {
  return (
    <div className="relative min-h-[22rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={treatment.id}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow text-racing-bright">Servizio</span>
          <h3 className="display-lg mt-3">{treatment.title}</h3>
          <p className="mt-4 max-w-md leading-relaxed text-paper/70">
            {treatment.intro}
          </p>

          {treatment.stats && (
            <div className="mt-6">
              <CounterStats stats={treatment.stats} />
            </div>
          )}

          <ul className="mt-6 flex flex-wrap gap-2.5">
            {treatment.features.map((f) => (
              <li
                key={f}
                style={{ borderColor: "rgba(245,244,240,0.28)" }}
                className="rounded-full border px-3.5 py-1.5 font-display text-sm font-medium text-paper/85"
              >
                {f}
              </li>
            ))}
          </ul>

          <Link
            href={`/trattamenti#${treatment.id}`}
            className="btn btn-primary mt-8"
          >
            Scopri di più
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------- Nav etichette (mobile/legenda) ------------------- */

function ZoneNav({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="mt-10 flex flex-wrap justify-center gap-2.5 lg:mt-12">
      {carZones.map((zone) => {
        const isActive = zone.id === activeId;
        return (
          <li key={zone.id}>
            <button
              type="button"
              onClick={() => onSelect(zone.id)}
              onMouseEnter={() => onSelect(zone.id)}
              aria-pressed={isActive}
              style={{
                borderColor: isActive
                  ? "var(--color-racing-bright)"
                  : "rgba(245,244,240,0.18)",
              }}
              className={cn(
                "rounded-full border px-4 py-2 font-display text-sm font-medium transition-colors",
                isActive ? "bg-racing-bright/15 text-paper" : "text-paper/70 hover:text-paper",
              )}
            >
              {zone.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 2: Type-check e lint**

Run: `npx tsc --noEmit` → Expected: PASS
Run: `npm run lint` → Expected: PASS (nessun warning su entità non-escapate, import inutilizzati, ecc.)

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/CarExplorer.tsx
git commit -m "feat(home): componente CarExplorer (stage, pannello, nav)"
```

---

### Task 4: Decisione cutout vs studio-card (aspetto)

**Files:**
- Modify (eventuale): `src/components/sections/CarExplorer.tsx` (solo se serve il fallback), `public/home/auto3d.png`

**Obiettivo:** decidere sull'evidenza se lo scontorno (Plan A) regge sul fondo scuro, o se passare al fallback "studio card" (Plan B).

- [ ] **Step 1: Avviare il dev server** — `npm run dev` (porta 3000).
- [ ] **Step 2: Screenshot Plan A** — con Playwright MCP: `browser_navigate` → `http://localhost:3000/#esplora`; `browser_take_screenshot` della sezione. Valutare: l'auto è scontornata pulita su nero? Niente bianco intrappolato nel telaio?
- [ ] **Step 3: Decisione**
  - **Se il cutout è pulito** → si tiene Plan A. Nessuna modifica al codice. Andare al Task 5.
  - **Se il cutout è sporco** → applicare **Plan B (studio card)**: l'auto resta sul suo sfondo (usare `auto3d-raw.png`) dentro una card chiara, e il "highlight" diventa un anello/overlay verde invece dello spotlight a schermo.

- [ ] **Step 3b (solo Plan B): modifiche al codice**

In `CarExplorer.tsx`:
1. `const CAR_SRC = "/home/auto3d-raw.png";`
2. Avvolgere `<Image>` + ombra in una card chiara; sostituire `object-contain` su nero con la card:

```tsx
{/* Plan B: l'auto in una "studio card" chiara dentro la sezione scura */}
<div className="relative w-full overflow-hidden rounded-3xl bg-paper shadow-2xl shadow-black/40 ring-1 ring-white/10" style={{ aspectRatio: CAR_ASPECT }}>
  <Image src={CAR_SRC} alt={CAR_ALT} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
  {/* ...spotlight, hotspot e hint restano invariati ma DENTRO questa card... */}
</div>
```
3. Cambiare lo spotlight da `mixBlendMode: "screen"` a un anello morbido visibile su chiaro: rimuovere `mixBlendMode` e usare `background: "radial-gradient(closest-side, color-mix(in oklab, var(--color-racing-bright) 35%, transparent), transparent)"`.

- [ ] **Step 4: Mostrare il confronto all'utente** — allegare gli screenshot (A e, se prodotto, B) e confermare la scelta prima di proseguire.
- [ ] **Step 5: Commit** (se ci sono modifiche)

```bash
git add src/components/sections/CarExplorer.tsx public/home/auto3d.png
git commit -m "feat(home): finalizza aspetto CarExplorer (cutout|studio-card)"
```

---

### Task 5: Wiring in homepage + rifinitura coordinate

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/lib/carZones.ts` (solo i numeri `point`/`hit`)

> **Pre-flight git:** vedi sezione "Pre-flight" — chiarire con l'utente la gestione del WIP in `page.tsx` prima di committare questo task.

- [ ] **Step 1: Importare e renderizzare la sezione**

In `src/app/page.tsx`, aggiungere l'import insieme agli altri:

```tsx
import CarExplorer from "@/components/sections/CarExplorer";
```

e inserire la sezione prima di `<OtherTreatments />`:

```tsx
        <LeatherService />
        <CarExplorer />
        <OtherTreatments />
```

- [ ] **Step 2: Verifica a video** — `npm run dev`; Playwright `browser_navigate` a `http://localhost:3000`, scroll fino alla sezione `#esplora`.
- [ ] **Step 3: Rifinire le coordinate** — per ciascuna delle 5 zone: `browser_hover` sull'hotspot (o tap della relativa etichetta) e screenshot; verificare che marker + spotlight cadano sulla parte giusta (motore, vetri, sedili, carrozzeria rossa, ruote). Aggiustare i valori `point`/`hit` in `carZones.ts` e ripetere finché combaciano. (Le coord del Task 1 sono di partenza.)
- [ ] **Step 4: Type-check + lint** — `npx tsc --noEmit` e `npm run lint` → PASS.
- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/lib/carZones.ts
git commit -m "feat(home): integra CarExplorer nella homepage e rifinisci hotspot"
```

---

### Task 6: Verifica finale

**Files:** nessuna nuova modifica salvo fix emersi.

- [ ] **Step 1: Build di produzione** — `npm run build` → Expected: PASS (compila, nessun errore; la guardia di `carZones` non scatta).
- [ ] **Step 2: Lint** — `npm run lint` → PASS.
- [ ] **Step 3: Comportamento (Playwright)** — su desktop: hover di ognuna delle 5 zone → il pannello mostra il servizio corretto (titolo) e per `centraline` compaiono i contatori (+CV/+Nm). Verificare `Scopri di più` → link a `/trattamenti#<id>`.
- [ ] **Step 4: Mobile** — `browser_resize` a 390×844: l'auto e la `ZoneNav` si impilano; tap di ogni etichetta cambia pannello + spotlight. Niente overflow orizzontale.
- [ ] **Step 5: A11y** — navigazione da tastiera (Tab raggiunge gli hotspot, focus attiva la zona); verificare che con `prefers-reduced-motion` (emulazione Playwright) non ci siano pulsazioni e i cambi siano istantanei.
- [ ] **Step 6: Screenshot matrice** — desktop (5 stati) + mobile (1–2 stati) salvati per la review.
- [ ] **Step 7: Commit finale** (se servono fix)

```bash
git add -A
git commit -m "test(home): verifica CarExplorer (build, lint, a11y, screenshot)"
```

---

## Self-Review

**1. Spec coverage:**
- Concetto hover→servizio (desktop) → Task 3 (hotspot + state). ✓
- 5 zone mappate ai servizi → Task 1 (`carZones`) + Task 5 (coord). ✓
- Mobile = etichette sotto l'auto → Task 3 (`ZoneNav`) + Task 6 (verifica). ✓
- Stile scuro/cinematografico + scontorno + spotlight → Task 3 (stage/spotlight) + Task 4 (cutout/fallback). ✓
- Riuso `treatments.ts` (incl. CounterStats per centraline) → Task 3 (`ServicePanel`). ✓
- Default = lucidatura + hint → Task 3. ✓
- Performance / next/image → Task 2 (asset) + `next/image` in Task 3; `priority`. ✓
- Posizione = nuova sezione prima di OtherTreatments → Task 5. ✓
- A11y + reduced-motion → Task 3 (button/aria/reduce) + Task 6. ✓
- Verifica Playwright → Task 4/5/6. ✓
- Fuori scope (no 3D/zoom/tracciamento SVG) → rispettato. ✓

**2. Placeholder scan:** nessun TBD/TODO; ogni step di codice mostra codice completo. ✓

**3. Type consistency:** `TreatmentId`, `CarZone`, `carZones`, `DEFAULT_ZONE_ID` definiti in Task 1 e usati identici in Task 3; `treatmentById(id: string): Treatment` coerente; `CounterStats` riceve `stats` (tipo `CounterStat[]` da treatments.ts). ✓

## Execution Handoff

Da decidere con l'utente al termine della scrittura del piano (vedi prossimo messaggio).
