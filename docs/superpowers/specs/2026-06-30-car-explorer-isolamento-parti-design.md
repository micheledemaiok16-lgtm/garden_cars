# CarExplorer — Isolamento delle parti all'hover

- **Data:** 2026-06-30
- **Stato:** approvato (design), pronto per il piano di implementazione
- **File toccati (previsti):** `src/components/sections/CarExplorer.tsx`, `src/lib/carZones.ts`, nuovi asset in `public/home/parts/`

## Contesto / stato attuale

Nella home la sezione `#esplora` (`CarExplorer.tsx`) mostra l'auto come **una singola immagine piatta** con sfondo trasparente:

- `public/home/nuovaautomodello-cutout.webp` — spaccato dell'Audi nera, **2000×1115 px**, `hasAlpha: true` (verificato).
- Sopra l'immagine ci sono 5 hotspot posizionati in percentuale (`carZones.ts`): Motore, Vetri, Interni (sedili), Carrozzeria, Cofano.
- Hover/focus su un hotspot → uno spotlight verde segue la zona e il pannello laterale destro mostra nome + sotto-servizi del trattamento. Click → naviga a `/trattamenti#<id>`.

Limite: essendo i pixel di tutte le parti fusi in un unico bitmap, **non è possibile isolare a runtime una singola parte** (es. solo i sedili) partendo dall'immagine unica.

## Obiettivo / UX

Quando l'utente passa il mouse (o porta il focus da tastiera) su una zona, la parte corrispondente resta **piena al 100%** mentre **il resto dell'auto sfuma a ~10% di opacità** (effetto "fantasma": la parte spicca ma si continua a leggere la sagoma dell'auto). Uscendo col mouse, torna l'auto intera.

Il pannello laterale e la navigazione esistenti restano invariati.

## Decisioni approvate

1. **Approccio:** silhouette esatta tramite **livelli ritagliati trasparenti** (un'immagine per parte), non maschere B/N. Le maschere restano un fallback solo se il ritaglio fosse impraticabile.
2. **Comportamento del resto:** fantasma a **~10% di opacità** (non trasparenza totale). Nessun alone/scala aggiuntivo sulla parte a fuoco.
3. **Rollout incrementale:** si parte **solo dai sedili** (`restauro-pelle`); le altre 4 zone si aggiungono una alla volta (1 file + 1 riga ciascuna).
4. **Base verificata:** 2000×1115, trasparente — quando il resto sfuma, sotto si vede lo sfondo scuro della sezione.

## Specifica degli asset (cosa fornisce l'utente)

Per ogni parte, un **ritaglio trasparente** allineato al base:

- **Formato:** WebP o PNG con canale alpha.
- **Tela:** esattamente **2000×1115 px**, identica al base.
- **Allineamento:** stessa identica posizione del base — non spostare, non ruotare, non ridimensionare, non ri-ritagliare la tela. (Procedura consigliata: aprire il base, isolare la parte, cancellare tutto il resto, esportare.)
- **Posizione/nome file:** `public/home/parts/<id-zona>.webp` (es. `restauro-pelle.webp`).

### Prima parte — `restauro-pelle` (Interni)

Il ritaglio deve contenere **i sedili di entrambe le file (anteriori + posteriori) e il volante** (dove visibile nello spaccato), tutto il resto trasparente. Motivazione: il trattamento copre "Volante e abitacolo" e "Sedili in pelle".

### Parti successive (stesso formato, un file ciascuna)

- `centraline` → Motore
- `trattamento-vetri` → Vetri / cristalli
- `lucidatura` → Carrozzeria
- `car-detailing` → Cofano / muso

## Architettura

Tutto resta dentro `CarExplorer.tsx`; nessun nuovo componente esterno necessario.

### Dati — `carZones.ts`

Aggiungere un campo opzionale alla `CarZone`:

```ts
/** Ritaglio trasparente della sola parte, stessa tela del base (2000×1115).
 *  Se assente, la zona mantiene il comportamento attuale (nessun isolamento). */
part?: string;
```

Solo le zone con `part` valorizzato attivano l'effetto di isolamento. La guardia d'integrità esistente resta; opzionalmente verificare che `part`, se presente, sia una stringa non vuota.

### Livelli di rendering (dentro `CarStage`)

- **Base:** l'immagine attuale, sempre montata, `priority`.
- **Overlay parte:** per ogni zona con `part`, un `<Image fill object-contain>` sovrapposto con `inset-0`, stessa maschera-gradiente del base, `aria-hidden`, **non** `priority` (caricamento normale; i file sono quasi tutti trasparenti → leggeri).

### Stato — `CarExplorer`

- `activeId: string` — **esistente**, pilota il pannello e non si svuota mai.
- `focusedId: string | null` — **nuovo**, pilota **solo** l'isolamento.
  - hover/focus su una zona → `setActiveId(id)` + `setFocusedId(id)`.
  - mouse-leave/blur dello stage → `setFocusedId(null)` (il pannello resta sull'ultima parte).

### Regola di opacità

Sia `hasFocus = focusedId !== null && la zona focusata ha un asset part`.

- `!hasFocus` → base `opacity 1`, tutti gli overlay `opacity 0`. (auto intera, stato di riposo)
- `hasFocus` → base `opacity 0.1`; overlay della zona focusata `opacity 1`; altri overlay `opacity 0`.

Se la zona sotto al mouse **non** ha asset `part`, `hasFocus` è falso → comportamento attuale invariato (marker + spotlight, nessun ghosting).

### Transizioni

`transition-opacity` ~300–350ms, easing coerente col file (`[0.16, 1, 0.3, 1]`). Con `useReducedMotion` attivo: nessuna transizione (cambio istantaneo), l'effetto resta.

## Flusso di interazione

1. Idle → auto intera.
2. Hover/focus su "Interni" → base sfuma a 10%, compare il livello `restauro-pelle` (sedili + volante) al 100%; il pannello mostra il trattamento; lo spotlight verde e i marker restano.
3. Mouse-leave dallo stage → `focusedId = null` → ritorno all'auto intera.
4. Click su hotspot/etichetta → navigazione a `/trattamenti#<id>` (invariato).

## Edge cases e considerazioni

- **Reduced motion:** effetto sì, transizione no (istantaneo).
- **Mobile/touch:** nessun hover; resta il tap-naviga attuale. L'isolamento è un miglioramento desktop; il tap-per-isolare su mobile è **fuori scope** per ora.
- **Performance:** solo il base è `priority`; gli overlay (per lo più trasparenti) sono WebP leggeri e caricano normalmente.
- **Accessibilità:** overlay `aria-hidden`; l'effetto scatta anche col focus da tastiera (già gestito dagli `onFocus` esistenti); l'`alt` descrittivo resta sul base.
- **Spotlight verde:** mantenuto com'è; se con il ghosting risultasse visivamente ridondante, si attenua in fase di rifinitura (decisione rimandata, basso rischio).

## Fuori scope

Nessun 3D; nessun cambio di layout o del pannello; nessun isolamento su touch; nessun nuovo testo/contenuto. Solo il livello di isolamento sopra il CarExplorer esistente.

## Verifica (come si controlla che funzioni)

Verifica visiva con l'app in esecuzione (dev server: controllare la porta, può essere `:3001`; per gli screenshot Playwright usare `animations: 'disabled'`):

1. Hover su "Interni" → restano visibili **sedili + volante**, il resto al ~10%.
2. Mouse-leave → torna l'auto intera.
3. Focus da tastiera sull'hotspot "Interni" → stesso effetto.
4. Hover su una zona **senza** asset (es. Motore prima del suo file) → comportamento attuale invariato, nessun ghosting.
5. Con reduced motion attivo → il cambio è istantaneo, senza glitch.
6. Click su una zona → naviga ancora a `/trattamenti#<id>`.
