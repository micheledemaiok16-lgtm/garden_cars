# Car3D — auto della home in vero 3D (Three.js + GSAP)

**Obiettivo.** Sostituire lo stage ibrido video+WebP della sezione `#esplora`
(`Car360`) con un'auto in **vero 3D**: modello GLB fedele all'Audi RS Q8 nera
originale, renderizzato con Three.js e animato con GSAP. Stessa esperienza
(auto-rotazione, drag con inerzia, tween verso i servizi, reveal "Interni"),
ma rotazione matematicamente fluida a qualsiasi velocità e prospettive reali.

## Il modello (fedeltà all'originale)

Modellare un'auto fotorealistica a mano è fuori scala; un GLB di stock non
sarebbe *questa* Audi. Il modello è stato quindi **generato dalle immagini
originali dello spin** con Higgsfield → Meshy `multi_image_to_3d`:

- input: 4 viste ortogonali dai frame esistenti — `frame-018` (muso),
  `frame-054` (fiancata dx), `frame-090` (retro), `frame-126` (fiancata sx);
- parametri: `should_texture:true`, `enable_pbr:true` (baseColor + emissive +
  normal + metallicRoughness), `target_polycount:120000`, symmetry auto;
- job id `21fdc15d-cbf7-43e9-b806-2c80360d8235`, costo 30 crediti;
- output grezzo 16,46 MB → `audi.glb` **1,9 MB** con
  `gltf-transform optimize` (meshopt + texture WebP 2048px, ~107k triangoli).

File: `public/home/car3d/audi.glb` (committato). Il grezzo `audi-raw.glb`
resta solo in locale (ignorato da git), rigenerabile dal job sopra.

## Architettura

- **`src/components/sections/Car3D.tsx`** (client): canvas Three.js con lo
  STESSO contratto props di `Car360` — `initialFrame`, `targetFrame`,
  `reduce`, `onFrameChange`, `onGrab`, `showHint`, `children`. Il "frame
  logico" 0..143 resta la valuta comune: `CarExplorer`, `carSpots`,
  `CarDoorReveal` non cambiano.
- **Mapping frame↔angolo**: `yaw(f) = YAW_FRAME0 + f · (2π/144) · DIR`,
  costanti calibrate visivamente confrontando il render con i frame originali
  (18=muso in camera, 54=fiancata dx, 90=retro, 126=fiancata sx).
- **Three.js vanilla** (niente react-three-fiber: zero dipendenze in più e
  stesso pattern imperativo ref+rAF già usato da Car360). `GLTFLoader` +
  `MeshoptDecoder` (bundled in three, nessun asset esterno).
- **Resa**: tone mapping ACES, sRGB, `PMREMGenerator` + `RoomEnvironment`
  (riflessi studio sulla vernice senza HDR esterni), key/rim light morbide,
  fondo trasparente sul nero della sezione, ombra ellittica CSS come oggi.
- **GSAP**: `gsap.ticker` per l'auto-rotazione (30°/s, ritmo del video);
  `gsap.to` con shortest-path per il tween verso `targetFrame`; drag 1:1 al
  puntatore e al rilascio **inerzia** (velocità stimata dagli ultimi pointer
  events → tween in decadimento `power2.out`). `reduce` → fermo sul frame
  iniziale.
- **Fallback**: WebGL indisponibile o GLB non caricabile → `Car3D` renderizza
  direttamente `Car360` (video) con le stesse props. Durante il load del GLB
  si mostra il poster WebP dello spin (nessun buco visivo, LCP invariato).
- **Performance**: dpr max 2, pausa fuori viewport (IntersectionObserver),
  dispose completo on unmount, un solo rAF loop.

## Passata di realismo (stesso giorno)

La prima resa tradiva il modello AI: superfici "accartocciate" (grinze nei
vertici della ricostruzione), cofano effetto cromo (metalnessMap sporca),
tetto grigio, illuminazione generica. Interventi, in ordine di leva:

1. **Smoothing geometria** (`tools/smooth-glb.mjs`): Taubin λ=0.5/μ=-0.53,
   10 iterazioni, sul grafo dei vertici raggruppati per posizione (i vertici
   sono splittati sulle cuciture UV: mossi indipendenti aprirebbero crepe),
   normali smooth ricalcolate per gruppo pesate sull'area. Pipeline:
   `audi-raw.glb → smooth-glb.mjs → audi-smooth.glb → gltf-transform
   optimize → audi.glb` (+ bump `?v=` nel loader).
2. **Environment "studio automotive"** al posto di RoomEnvironment: stanza
   scura + softbox a striscia (principale sopra, posteriore angolata, fill
   frontale, quinte e fondali freddi) → gli highlight lunghi che scorrono
   sui pannelli durante il giro. PMREM sigma 0.09: su una mesh AI i riflessi
   troppo nitidi rivelano ogni difetto residuo.
3. **Materiale**: metalness scalata a 0.15 (la vernice è dielettrica: base
   scura + riflessi dal solo clearcoat 1.0/roughness 0.16), normalScale 0.3,
   color ×0.56, emissive sbloccata (il glTF arriva con emissiveFactor nero
   che azzererebbe la emissiveMap).

Le texture del grezzo sono già 2048px (max Meshy): nessun upgrade possibile
lì. Limite residuo = geometria fine (razze cerchi, cornici vetri); il passo
successivo sarebbe rigenerare il GLB con input schiariti (~30 crediti).

## Rischi / rollback

- La qualità del GLB generato va validata a schermo (screenshot vs frame
  originali) prima di rifinire luci/materiali; se risultasse insufficiente,
  la sezione resta com'è (Car360 non viene toccato) e si ritenta con input
  migliori.
- Rollback: `CarExplorer` torna a importare `Car360` (un import + un tag).

## Test

- `carSpin.ts` invariato (unit test esistenti valgono ancora).
- Verifica visiva Playwright: viste agli anchor dei servizi confrontate coi
  frame corrispondenti; drag e auto-rotazione senza errori console.
- `npm run lint` + `npm run test` + build.
