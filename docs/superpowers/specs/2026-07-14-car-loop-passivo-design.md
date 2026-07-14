# CarExplorer: spin passivo (video in loop) + crossfade sui reveal

Data: 2026-07-14

## Obiettivo

Alleggerire la sezione `#esplora` della home mantenendo **lo stesso risultato visivo di
oggi**. L'auto che gira smette di essere uno stage interattivo (video + 144 fotogrammi
WebP scrubbabili) e diventa **un semplice video in loop, non interattivo**. I reveal
per-servizio (Interni, Motore, Vetri, Lucidatura, Detailing, Antifurto) restano
**esattamente come sono**: stesse sequenze WebP, stessi ritmi, stesso ping-pong.

Fuori scope, esplicitamente: riscrivere i reveal in video, rigenerare asset, cancellare
`Car3D`, ripensare pannello o nav.

## Situazione attuale

`Car360` tiene due sorgenti sovrapposte per la stessa auto:

- `spin-loop.mp4` (~4,7 MB): il giro 360°, riprodotto in loop a riposo.
- 144 fotogrammi WebP (~3,6 MB): usati **solo** per il trascinamento e per il tween
  verso il frame-ancora di un servizio, perché il seek in un mp4 è a scatti.

Da qui discende tutta la parte pesante: un loop rAF permanente, lo swap video↔immagine
(`applyOverlay`), il "ponte" di risincronizzazione sull'evento `seeked`, il tween in
spazio-fotogramma, il precarico dei 144 WebP. `CarExplorer` ci si aggancia con
`targetFrame`, `armingRef`, `currentFrameRef`, `handleFrame`, `handleGrab`, `doorInstant`:
al click su un servizio l'auto **ruota** fino all'ancora del reveal, e solo all'arrivo il
reveal si apre.

Togliendo l'interazione, quella rotazione non è più producibile: è lo scrub stesso.

## Design

### Il crossfade c'è già

`CarDoorReveal` esegue già una dissolvenza in ingresso di 300 ms (`FADE_MS`) sul frame 0
del reveal, con un gate temporale che aspetta la fine della dissolvenza prima di far
partire lo scrub. Oggi non si percepisce come uno stacco perché sotto c'è l'auto già
portata all'angolo giusto.

Serve **un solo pezzo nuovo**: far svanire il video dello spin nello stesso momento in cui
il reveal appare. Senza, per 300 ms si vedrebbero due auto ad angoli diversi sovrapposte.
Su fondo nero, con le sequenze che hanno la dissolvenza dei bordi già bakata, il risultato
si legge come un cambio d'inquadratura.

### Componenti

**`Car360.tsx` → riscritto come video passivo** (~470 righe → ~80).

Resta: il `<video>` (`loop`, `muted`, `playsInline`, `poster`), il montaggio della sorgente
solo in prossimità del viewport (`IntersectionObserver` con `rootMargin: 600px`), la pausa
fuori schermo, l'ombra a terra, i `children` (gli overlay dei reveal).

Spariscono: `onPointerDown/Move/Up`, `PX_PER_FRAME`, `ensurePreload` dei 144 WebP,
`applyOverlay`, il ponte `seeked` (`resyncPendingRef`/`resyncCancelRef`), il tween verso
`targetFrame`, il loop rAF, `frameToTime`/`timeToFrame`, `onFrameChange`, `onGrab`,
`showHint`, l'`<img>` di overlay.

Nuova prop **`dimmed: boolean`**: `opacity: dimmed ? 0 : 1` con `transition: opacity 300ms
ease` (stessa durata di `FADE_MS`, così le due dissolvenze si incrociano). Il video **non
va in pausa** mentre è nascosto: alla chiusura riappare già in movimento, senza risveglio.

`reduce` → nessun autoplay: resta il poster.
Errore di caricamento → resta il poster, la sezione non si rompe.

**`CarDoorReveal.tsx` → invariato.** La prop `instant` (chiusura secca al drag) resta nella
firma ma non viene più passata: il default `false` è quello giusto ora che il drag non c'è.

**`CarExplorer.tsx` → perde la macchina di rotazione.**

Spariscono: `targetFrame`, `currentFrameRef`, `armingRef`, `handleFrame`, `handleGrab`,
`doorInstant`, `touched`, l'import di `frameDistance`.

`activateReveal(id)` diventa: imposta `activeId`; se il servizio ha un reveal, `openId` fa
toggle (se era aperto un altro reveal, si richiude da sé come oggi). Nessuna attesa,
nessuna ancora.

Nuovo stato **`spinDimmed`**: `true` all'apertura di un reveal, `false` in `onDoorClosed`.
Serve uno stato separato da `openId` perché la chiusura del reveal ha una coda (lo scrub a
ritroso, `closeMs`): lo spin deve restare nascosto finché il reveal non è tornato al frame
0. `onDoorClosed` mantiene la guardia attuale contro lo switch diretto fra due reveal
(`if (openId !== null) return;`), così il nuovo reveal non si vede sbiadire sotto lo spin
che riappare.

Il "clicca fuori per chiudere" e il precarico condizionato dei reveal (`eagerPreload` =
banda disponibile **e** sezione vicina) restano identici.

### Copy

L'hint "Trascina per ruotare" (in `Car360`) e il paragrafo introduttivo "Trascina per
ruotare l'auto e vai dritto al trattamento che ti interessa" (in `CarExplorer`) descrivono
un'interazione che non esiste più: vanno tolti/riscritti. Proposta per il paragrafo:
"Scegli un trattamento e guardalo all'opera sull'auto." Da confermare in review.

### Cosa NON tocchiamo

`carReveal.ts`, `carSpots.ts`, `carSpin.ts`, `treatments.ts`, `Car3D.tsx` e tutti gli asset
in `public/`. `anchorFrame` resta nei dati anche se nessuno lo legge più per ruotare:
toglierlo significherebbe toccare tre moduli e i loro test senza alcun guadagno per
l'utente.

I 144 WebP in `public/home/spin/` (32 MB) restano nel repo ma **non vengono più richiesti
dal browser**: il peso scaricato scende comunque. La loro cancellazione è un lavoro di
pulizia separato, non parte di questo cambiamento.

## Risultato atteso

- Scaricati in meno alla prima interazione: **~3,6 MB** di fotogrammi WebP dello spin.
- Spariscono: un loop rAF sempre acceso, gli swap `<img>` a 60 fps, i seek sull'mp4 e la
  logica di ri-sincronizzazione — cioè le fonti di scatto e di consumo CPU.
- `Car360` da ~470 a ~80 righe; `CarExplorer` perde ~60 righe di macchina a stati.
- Visivamente: identico, tranne che l'auto non si ruota più col dito e al click su un
  servizio non ruota verso l'angolo — dissolve.

## Test

**Unit (vitest).** La logica che resta è di rendering, non di calcolo: i test esistenti
(`carSpin.test.ts`, `carSpots.test.ts`, `carReveal.test.ts`) coprono moduli che non
cambiano e devono continuare a passare invariati. Nessun nuovo test unitario giustificato.

**Verifica manuale nel browser** (dev server, ricordarsi che può essere su :3001):

1. Lo spin gira in loop senza scatti; nessuna reazione al trascinamento; la pagina scorre
   normalmente col dito sopra l'auto (mobile).
2. Click su un servizio con reveal → lo spin dissolve mentre il reveal appare: mai due auto
   sovrapposte visibili.
3. Chiusura (secondo click, o click fuori) → il reveal fa lo scrub a ritroso e solo dopo
   riappare lo spin, già in movimento.
4. Switch diretto fra due reveal (es. Interni → Motore) → lo spin **non** riappare nel
   mezzo.
5. I tre reveal in ping-pong (Vetri, Lucidatura, Antifurto) ripetono come oggi.
6. Fuori viewport lo spin va in pausa; `prefers-reduced-motion` mostra il poster.
