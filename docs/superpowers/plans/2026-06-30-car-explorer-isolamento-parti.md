# CarExplorer — Isolamento parti all'hover — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** All'hover/focus su una zona dell'auto nella home, la parte corrispondente resta piena mentre il resto dell'auto sfuma a ~10% (effetto "fantasma").

**Architecture:** Sopra l'immagine base dell'auto (già trasparente, 2000×1115) si sovrappongono livelli-parte: un ritaglio trasparente per ogni zona che ne ha uno. Uno stato `focusedId` controlla l'opacità: la base scende a 0.1 e il livello della zona focusata sale a 1. Tutto resta nel componente esistente `CarExplorer.tsx`; le zone si configurano in `carZones.ts`. Rollout incrementale: l'effetto si attiva solo per le zone che hanno un asset `part`.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19.2.4, framer-motion 12.40, Tailwind v4, TypeScript, `sharp` (già presente, per generare l'asset placeholder).

**Spec di riferimento:** `docs/superpowers/specs/2026-06-30-car-explorer-isolamento-parti-design.md`

## Global Constraints

- **Questo NON è il Next.js dei tuoi dati di training** (vedi `AGENTS.md`). Per `next/image`, **rispecchia il pattern già funzionante** in `src/components/sections/CarExplorer.tsx` (il `<Image fill priority sizes className style>` esistente). Consulta `node_modules/next/dist/docs/` solo se devi deviare da quel pattern.
- **Nessun test runner nel progetto.** La verifica è: `npx tsc --noEmit` (type-check), `npm run lint` (ESLint) e **controllo visivo** con l'app in esecuzione + Playwright. **NON aggiungere** un framework di test (YAGNI).
- **Copy UI in italiano**, coerente con l'esistente.
- **Asset parti:** tela esattamente **2000×1115**, sfondo trasparente, in `public/home/parts/<id-zona>.webp`. L'`id-zona` è l'id del trattamento (es. `restauro-pelle`).
- **Dev server:** può girare su `:3001` invece di `:3000` — leggi l'URL stampato da `next dev`. Per gli screenshot Playwright, attendi che la transizione opacità si assesti (~500ms) o usa animazioni disabilitate.
- **Igiene commit:** stagia **solo** i file del task (l'utente tiene WIP non correlato su `main`); verifica sempre `git diff --cached --name-only` prima del commit. Il branch-vs-main segue la preferenza dell'utente (abitualmente lavora su `main`): in caso di dubbio, chiedi.
- **Footer commit (obbligatorio su ogni commit):**
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01MESk3m4kqh3kzCbzaeGGen
  ```

## File Structure

- `src/lib/carZones.ts` — **modifica**: aggiunge il campo opzionale `part?: string` a `CarZone`, valorizza `part` per la zona `restauro-pelle`, estende la guardia d'integrità. Responsabilità: configurazione dati delle zone.
- `public/home/parts/restauro-pelle.webp` — **nuovo (placeholder)**: ritaglio della zona cabina generato via `sharp` per rendere l'effetto verificabile subito. Verrà **sostituito dall'utente** con il ritaglio preciso (sedili + volante), stesso path → nessuna modifica al codice.
- `src/components/sections/CarExplorer.tsx` — **modifica**: stato `focusedId`, livelli-parte sovrapposti, logica di opacità, gestione di entrata/uscita hover/focus. Responsabilità: rendering e interazione della sezione.

---

### Task 1: Modello dati — campo `part` nelle zone

**Files:**
- Modify: `src/lib/carZones.ts`

**Interfaces:**
- Consumes: niente.
- Produces: `CarZone.part?: string` (path pubblico di un ritaglio trasparente). La zona `restauro-pelle` espone `part: "/home/parts/restauro-pelle.webp"`. `CarExplorer.tsx` (Task 2) legge `zone.part` per decidere quali livelli renderizzare e quando isolare.

- [ ] **Step 1: Aggiungi il campo `part` all'interfaccia `CarZone`**

In `src/lib/carZones.ts`, sostituisci l'interfaccia esistente con:

```ts
export interface CarZone {
  /** Servizio collegato (anche ancora /trattamenti#<id>). */
  id: TreatmentId;
  /** Etichetta breve per la nav mobile/legenda. */
  label: string;
  /** Fuoco dello spotlight + posizione del marker, in %. */
  point: { x: number; y: number };
  /** Area sensibile all'hover/tap (ellisse), in %. */
  hit: { x: number; y: number; rx: number; ry: number };
  /** Ritaglio trasparente della sola parte (stessa tela 2000×1115 del base).
   *  Se presente, attiva l'isolamento all'hover; se assente la zona mantiene
   *  il comportamento attuale (nessun isolamento). */
  part?: string;
}
```

- [ ] **Step 2: Valorizza `part` per la zona `restauro-pelle`**

Nella `carZones`, sostituisci la riga di `restauro-pelle` con (aggiunge solo `part`, il resto invariato):

```ts
  { id: "restauro-pelle", label: "Interni", point: { x: 60, y: 46 }, hit: { x: 60, y: 46, rx: 8, ry: 14 }, part: "/home/parts/restauro-pelle.webp" },
```

- [ ] **Step 3: Estendi la guardia d'integrità**

Sostituisci il blocco `for (const z of carZones) { ... }` finale con:

```ts
// Guardia d'integrità a caricamento modulo: ogni zona deve corrispondere a un
// servizio esistente in treatments.ts; se ha un `part`, non dev'essere vuoto.
for (const z of carZones) {
  if (!treatments.some((t) => t.id === z.id)) {
    throw new Error(`carZones: id "${z.id}" non presente in treatments.ts`);
  }
  if (z.part !== undefined && z.part.trim() === "") {
    throw new Error(`carZones: "part" vuoto per la zona "${z.id}"`);
  }
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: nessun errore (exit 0).

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: nessun errore sul file modificato.

- [ ] **Step 6: Commit**

Verifica lo staging e committa **solo** `carZones.ts`:

```bash
git add src/lib/carZones.ts
git diff --cached --name-only   # deve mostrare SOLO src/lib/carZones.ts
git commit
```
Messaggio (subject + footer obbligatorio):
```
feat(home): campo "part" sulle zone del CarExplorer

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01MESk3m4kqh3kzCbzaeGGen
```

---

### Task 2: Effetto di isolamento nel CarExplorer

**Files:**
- Create: `public/home/parts/restauro-pelle.webp` (placeholder, vedi Step 1-3)
- Modify: `src/components/sections/CarExplorer.tsx`

**Interfaces:**
- Consumes: `CarZone.part` da Task 1; `carZones`, `DEFAULT_ZONE_ID` da `@/lib/carZones`; `treatments` da `@/lib/treatments`.
- Produces: niente per altri task (è la feature finale).

**Note di interazione:**
- `activeId` (esistente) pilota il pannello e non si svuota mai.
- `focusedId` (nuovo, `string | null`) pilota **solo** l'isolamento; si imposta su hover/focus di hotspot ed etichette, si azzera quando mouse/focus lasciano davvero l'area (mouse-leave sul contenitore + `onBlur` con check `relatedTarget`, così lo spostamento tra hotspot adiacenti non fa flicker).
- L'isolamento è attivo solo se la zona focusata ha `part`.

- [ ] **Step 1: Crea la cartella degli asset parte**

Run:
```bash
mkdir -p public/home/parts
```

- [ ] **Step 2: Scrivi lo script placeholder (sharp)**

Crea il file `C:/Users/miche/AppData/Local/Temp/claude/C--Users-miche-desktop-lavori-quantor-gardens-cars/0e5a7505-6aa1-4329-9fa6-b1f3ff9a50db/scratchpad/make-placeholder.js` con:

```js
// Placeholder di sviluppo: ritaglia la zona cabina (sedili + zona volante)
// dall'auto base, rendendo trasparente il resto. NON è il ritaglio definitivo:
// l'utente sostituirà public/home/parts/restauro-pelle.webp con il cutout preciso.
const sharp = require("sharp");

const W = 2000, H = 1115;
// Regione cabina in px (da percentuali: x[48,84]% -> 960..1680 ; y[18,80]% -> 200..892).
const rx = 960, ry = 200, rw = 720, rh = 692, corner = 36;

const maskSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="${corner}" fill="#fff"/>
   </svg>`
);

(async () => {
  // Maschera con bordi morbidi (alpha sfumata).
  const mask = await sharp(maskSvg).blur(24).png().toBuffer();
  await sharp("public/home/nuovaautomodello-cutout.webp")
    .composite([{ input: mask, blend: "dest-in" }]) // tiene la base solo dove la maschera ha alpha
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile("public/home/parts/restauro-pelle.webp");

  const m = await sharp("public/home/parts/restauro-pelle.webp").metadata();
  console.log("placeholder:", m.width + "x" + m.height, "| hasAlpha:", m.hasAlpha);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
```

- [ ] **Step 3: Genera il placeholder**

Run (dalla root del progetto):
```bash
node "C:/Users/miche/AppData/Local/Temp/claude/C--Users-miche-desktop-lavori-quantor-gardens-cars/0e5a7505-6aa1-4329-9fa6-b1f3ff9a50db/scratchpad/make-placeholder.js"
```
Expected: `placeholder: 2000x1115 | hasAlpha: true` e il file `public/home/parts/restauro-pelle.webp` esiste.

- [ ] **Step 4: Importa il tipo `FocusEvent`**

In `src/components/sections/CarExplorer.tsx`, sostituisci la riga 3:
```ts
import { useState } from "react";
```
con:
```ts
import { useState, type FocusEvent } from "react";
```

- [ ] **Step 5: Sostituisci il componente `CarExplorer`**

Sostituisci **l'intera** `export default function CarExplorer() { ... }` con:

```tsx
export default function CarExplorer() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(DEFAULT_ZONE_ID);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const active = treatmentById(activeId);

  // hover/focus su una zona: evidenzia il servizio nel pannello (activeId, che
  // non si svuota mai) e attiva l'isolamento della parte sull'auto (focusedId).
  const preview = (id: string) => {
    setActiveId(id);
    setFocusedId(id);
    setTouched(true);
  };

  // uscita di mouse/focus dall'area: l'auto torna intera (il pannello resta).
  const endPreview = () => setFocusedId(null);

  return (
    <section
      id="esplora"
      className="relative overflow-hidden bg-ink py-24 text-paper md:py-32"
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
              Passa sulle diverse parti dell&apos;auto e vai dritto al
              trattamento che ti interessa.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid items-center gap-8 lg:mt-16 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <CarStage
            activeId={activeId}
            focusedId={focusedId}
            onPreview={preview}
            onEndPreview={endPreview}
            reduce={reduce}
            showHint={!touched}
          />
          <ServicePanel treatment={active} reduce={reduce} />
        </div>

        <ZoneNav
          activeId={activeId}
          onPreview={preview}
          onEndPreview={endPreview}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Sostituisci il componente `CarStage`**

Sostituisci **l'intera** `function CarStage(...) { ... }` con (aggiunge props `focusedId`/`onEndPreview`, gestione uscita, opacità base, e i livelli-parte):

```tsx
function CarStage({
  activeId,
  focusedId,
  onPreview,
  onEndPreview,
  reduce,
  showHint,
}: {
  activeId: string;
  focusedId: string | null;
  onPreview: (id: string) => void;
  onEndPreview: () => void;
  reduce: boolean | null;
  showHint: boolean;
}) {
  const activeZone = carZones.find((z) => z.id === activeId) ?? carZones[0];

  // L'isolamento si attiva solo se la zona sotto mouse/focus ha un ritaglio
  // dedicato (`part`); altrimenti l'auto resta intera (comportamento storico).
  const focusedZone = focusedId
    ? carZones.find((z) => z.id === focusedId)
    : null;
  const isolating = Boolean(focusedZone?.part);
  const isoTransition = reduce
    ? undefined
    : "opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)";

  // Pulisce il focus solo quando mouse/focus lasciano davvero l'intera area
  // (non mentre ci si sposta tra un hotspot e l'altro).
  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      onEndPreview();
    }
  };

  return (
    <div
      className="relative w-full select-none"
      style={{ aspectRatio: CAR_ASPECT }}
      onMouseLeave={onEndPreview}
      onBlur={handleBlur}
    >
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
        // Sfuma il fondo per nascondere la pedana chiara. In isolamento l'auto
        // intera scende a fantasma (~10%) lasciando in evidenza il livello parte.
        style={{
          maskImage: "linear-gradient(to bottom, #000 84%, transparent 99%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 84%, transparent 99%)",
          opacity: isolating ? 0.1 : 1,
          transition: isoTransition,
        }}
      />

      {/* livelli "parte": un ritaglio trasparente per ogni zona che ne ha uno.
          Decorativi e non cliccabili: gli hotspot restano sopra e attivabili. */}
      {carZones.map((zone) =>
        zone.part ? (
          <Image
            key={`part-${zone.id}`}
            src={zone.part}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="pointer-events-none object-contain"
            style={{
              maskImage: "linear-gradient(to bottom, #000 84%, transparent 99%)",
              WebkitMaskImage: "linear-gradient(to bottom, #000 84%, transparent 99%)",
              opacity: focusedId === zone.id ? 1 : 0,
              transition: isoTransition,
            }}
          />
        ) : null,
      )}

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

      {/* hotspot: link diretti alla sezione del servizio su /trattamenti */}
      {carZones.map((zone) => {
        const isActive = zone.id === activeId;
        const t = treatmentById(zone.id);
        return (
          <Link
            key={zone.id}
            href={`/trattamenti#${zone.id}`}
            onMouseEnter={() => onPreview(zone.id)}
            onFocus={() => onPreview(zone.id)}
            aria-label={`Vai al servizio ${t.title}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
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
          </Link>
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
```

- [ ] **Step 7: Sostituisci il componente `ZoneNav`**

Sostituisci **l'intera** `function ZoneNav(...) { ... }` con (aggiunge `onEndPreview` + uscita su mouse-leave/blur del contenitore):

```tsx
function ZoneNav({
  activeId,
  onPreview,
  onEndPreview,
}: {
  activeId: string;
  onPreview: (id: string) => void;
  onEndPreview: () => void;
}) {
  const handleBlur = (e: FocusEvent<HTMLUListElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      onEndPreview();
    }
  };

  return (
    <ul
      className="mt-10 flex flex-wrap justify-center gap-2.5 lg:mt-12"
      onMouseLeave={onEndPreview}
      onBlur={handleBlur}
    >
      {carZones.map((zone) => {
        const isActive = zone.id === activeId;
        return (
          <li key={zone.id}>
            <Link
              href={`/trattamenti#${zone.id}`}
              onMouseEnter={() => onPreview(zone.id)}
              onFocus={() => onPreview(zone.id)}
              style={{
                borderColor: isActive
                  ? "var(--color-racing-bright)"
                  : "rgba(245,244,240,0.18)",
              }}
              className={cn(
                "inline-block rounded-full border px-4 py-2 font-display text-sm font-medium transition-colors",
                isActive
                  ? "bg-racing-bright/15 text-paper"
                  : "text-paper/70 hover:text-paper",
              )}
            >
              {zone.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 8: Type-check**

Run: `npx tsc --noEmit`
Expected: nessun errore (exit 0).

- [ ] **Step 9: Lint**

Run: `npm run lint`
Expected: nessun errore.

- [ ] **Step 10: Verifica visiva con l'app**

1. Avvia il dev server in background: `npm run dev` e leggi l'URL stampato (può essere `http://localhost:3001`).
2. Con Playwright: naviga all'URL, scrolla alla sezione `#esplora`.
3. **Hover sull'etichetta "Interni"** (o sull'hotspot con aria-label "Vai al servizio Restauro pelle"); attendi ~500ms.
   - Expected: la zona cabina (sedili + zona volante) resta piena; **il resto dell'auto è ~10%** (fantasma); il pannello mostra "Restauro pelle".
4. **Muovi il mouse fuori** dall'area auto; attendi ~500ms.
   - Expected: l'auto torna intera (base al 100%, nessun livello parte visibile).
5. **Hover su "Motore"** (zona senza `part`).
   - Expected: **nessun** ghosting — comportamento storico (spotlight + marker), auto intera.
6. (Tastiera) Tab fino all'hotspot "Interni".
   - Expected: stesso isolamento; Tab via dall'area → auto intera.
7. Cattura uno screenshot dello stato isolato per la review.

Nota di rifinitura (non bloccante): se lo spotlight verde sopra la cabina isolata risulta troppo carico, ridurne l'opacità quando `isolating` è true. Da valutare sullo screenshot.

- [ ] **Step 11: Commit**

Stagia **solo** il componente (il placeholder `.webp` è locale e verrà sostituito dall'utente — non committarlo, salvo richiesta esplicita):

```bash
git add src/components/sections/CarExplorer.tsx
git diff --cached --name-only   # deve mostrare SOLO il componente
git commit
```
Messaggio:
```
feat(home): isolamento delle parti dell'auto all'hover

Hover/focus su una zona porta la parte al 100% e sfuma il resto
dell'auto a ~10%. Attivo solo per le zone con un ritaglio "part"
(per ora: Interni). Le altre zone mantengono il comportamento attuale.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01MESk3m4kqh3kzCbzaeGGen
```

---

## Dopo il piano — aggiungere le altre 4 parti

Per ogni nuova parte (motore, vetri, carrozzeria, cofano): l'utente fornisce il ritaglio `public/home/parts/<id>.webp` (2000×1115, trasparente, allineato) e si aggiunge `part: "/home/parts/<id>.webp"` alla riga corrispondente in `carZones.ts`. Nessun'altra modifica: il sistema li renderizza e isola automaticamente.
