"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import type * as ThreeNS from "three";
import { SPIN, frameIndex, normalizeFrame } from "@/lib/carSpin";
import Car360 from "./Car360";

const CAR_ASPECT = "16 / 9";
// Sensibilità del trascinamento: pixel per frame logico (come Car360).
const PX_PER_FRAME = 7;
// Ritmo dell'auto-rotazione in riposo: un giro (144 frame) in 12 s, lo stesso
// del video originale → 12 frame logici al secondo.
const AUTO_FPS = 12;

const FC = SPIN.frameCount;
const STEP = (Math.PI * 2) / FC; // radianti per frame logico
const wrapFrame = (f: number) => normalizeFrame(f, FC, true);

// ── Calibrazione modello ↔ frame logici ─────────────────────────────────────
// Il GLB (Meshy, multi-view dai frame originali) ha il muso lungo un asse
// proprio; queste due costanti allineano la rotazione 3D alla mappa dei frame
// del vecchio spin (18=muso in camera, 54=fiancata dx, 90=retro, 126=fiancata
// sx), così carSpots/anchorFrame valgono identici. Tarate a vista sui frame.
const YAW_AT_FRONT = Math.PI / 2; // rotation.y che mette il MUSO verso camera
const DIR = 1; // senso del giro al crescere del frame (come il video)
const frameToYaw = (f: number) => YAW_AT_FRONT + DIR * (f - 18) * STEP;

// Camera: teleobiettivo leggero e punto di vista appena rialzato, come i
// render del video originale. L'auto (bbox ~1.91×0.63×0.86) resta centrata.
const CAM_FOV = 30;
const CAM_POS = [0, 0.62, 2.75] as const;
const CAM_TARGET = [0, -0.02, 0] as const;

/**
 * Stage rotabile dell'auto in VERO 3D: il GLB dell'Audi (generato dalle viste
 * originali dello spin) renderizzato con Three.js e animato con GSAP.
 * Contratto identico a Car360 (frame logici 0..143 come valuta comune): drag
 * 1:1 con inerzia al rilascio, tween verso `targetFrame` (shortest path),
 * auto-rotazione in riposo, `reduce` fermo sul frame iniziale.
 *
 * Il chunk three + GLB arrivano DOPO l'hydration (dynamic import): fino ad
 * allora resta visibile il poster WebP del vecchio spin, poi crossfade.
 * WebGL assente o GLB non caricabile → fallback completo a Car360 (video).
 */
export default function Car3D({
  initialFrame,
  targetFrame,
  reduce,
  onFrameChange,
  onGrab,
  showHint,
  children,
}: {
  initialFrame: number;
  targetFrame: number | null;
  reduce: boolean | null;
  onFrameChange: (f: number) => void;
  onGrab: () => void;
  showHint: boolean;
  children?: ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const frameRef = useRef(wrapFrame(initialFrame));
  const lastIdxRef = useRef(frameIndex(initialFrame));
  const draggingRef = useRef(false);
  const dragRef = useRef<{ startX: number; startFrame: number } | null>(null);
  // Storia recente del drag per stimare la velocità al rilascio (inerzia).
  const historyRef = useRef<{ t: number; f: number }[]>([]);
  const targetRef = useRef<number | null>(targetFrame);
  const reduceRef = useRef<boolean>(!!reduce);
  const inViewRef = useRef(true);
  // Tween GSAP attivo (verso un servizio o inerzia post-drag): finché vive,
  // pilota lui frameRef e l'auto-rotazione resta ferma.
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  // true una volta raggiunto targetFrame: tiene l'auto ancorata (porta aperta).
  const holdingRef = useRef(false);

  const [ready, setReady] = useState(false); // GLB in scena → mostra il canvas
  const [failed, setFailed] = useState(false); // WebGL/GLB ko → fallback video

  const onFrameChangeRef = useRef(onFrameChange);
  useEffect(() => {
    onFrameChangeRef.current = onFrameChange;
  }, [onFrameChange]);

  useEffect(() => {
    reduceRef.current = !!reduce;
  }, [reduce]);

  // Riporta il frame logico al genitore solo quando cambia l'indice intero
  // (niente re-render 60/s), come Car360.
  const reportFrame = () => {
    const idx = frameIndex(frameRef.current);
    if (idx !== lastIdxRef.current) {
      lastIdxRef.current = idx;
      onFrameChangeRef.current(frameRef.current);
    }
  };

  const killTween = () => {
    tweenRef.current?.kill();
    tweenRef.current = null;
  };

  // Selezione servizio: tween del frame verso l'ancora lungo il percorso più
  // corto (anche attraverso la giunzione 143→0). A destinazione resta in hold
  // finché targetFrame non torna null (es. porta aperta).
  useEffect(() => {
    targetRef.current = targetFrame;
    if (targetFrame === null) {
      holdingRef.current = false;
      return; // il tween d'inerzia (se vivo) prosegue; altrimenti riposo
    }
    killTween();
    holdingRef.current = false;
    const cf = frameRef.current;
    const delta = ((((targetFrame - cf) % FC) + FC) % FC + FC / 2) % FC - FC / 2;
    if (Math.abs(delta) < 0.01 || reduceRef.current) {
      frameRef.current = wrapFrame(targetFrame);
      holdingRef.current = true;
      reportFrame();
      return;
    }
    const proxy = { f: cf };
    tweenRef.current = gsap.to(proxy, {
      f: cf + delta,
      duration: Math.min(1.5, 0.45 + Math.abs(delta) * 0.016),
      ease: "power3.out",
      onUpdate: () => {
        frameRef.current = wrapFrame(proxy.f);
        reportFrame();
      },
      onComplete: () => {
        tweenRef.current = null;
        holdingRef.current = true;
      },
    });
  }, [targetFrame]);

  // Scena Three.js: import dinamico (chunk separato post-hydration), GLB con
  // decoder meshopt, environment "studio" per i riflessi della vernice.
  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;

    let disposed = false;
    let renderer: ThreeNS.WebGLRenderer | null = null;
    let scene: ThreeNS.Scene | null = null;
    let camera: ThreeNS.PerspectiveCamera | null = null;
    let carGroup: ThreeNS.Group | null = null;
    let pmremTexture: ThreeNS.Texture | null = null;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    let tick: ((time: number, deltaTime: number) => void) | null = null;
    let lastRenderedFrame = -1;

    // Rilascio completo di GPU/observer/ticker: usato sia allo smontaggio sia
    // se il setup fallisce a metà (es. GLB 404 con WebGL già creato).
    const teardown = () => {
      if (tick) {
        gsap.ticker.remove(tick);
        tick = null;
      }
      ro?.disconnect();
      ro = null;
      io?.disconnect();
      io = null;
      pmremTexture?.dispose();
      pmremTexture = null;
      scene?.traverse((obj) => {
        const mesh = obj as ThreeNS.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const mat = mesh.material as ThreeNS.MeshStandardMaterial;
          if (mat) {
            mat.map?.dispose();
            mat.normalMap?.dispose();
            mat.metalnessMap?.dispose();
            mat.roughnessMap?.dispose();
            mat.emissiveMap?.dispose();
            mat.dispose();
          }
        }
      });
      scene = null;
      renderer?.dispose();
      renderer = null;
    };

    (async () => {
      try {
        const THREE = await import("three");
        const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
          import("three/examples/jsm/loaders/GLTFLoader.js"),
          import("three/examples/jsm/libs/meshopt_decoder.module.js"),
        ]);
        if (disposed) return;

        // "Studio automotive" per i riflessi: stanza scura + softbox a striscia
        // (una lunga sopra, una angolata dietro, una di riempimento davanti) e
        // due quinte laterali fredde. Sono queste strisce a produrre gli
        // highlight lunghi che scorrono sulla carrozzeria durante il giro —
        // l'environment è fisso, l'auto ruota, come su una piattaforma vera.
        const buildStudioEnv = () => {
          const env = new THREE.Scene();
          const room = new THREE.Mesh(
            new THREE.BoxGeometry(24, 12, 24),
            new THREE.MeshBasicMaterial({
              color: 0x050505,
              side: THREE.BackSide,
            }),
          );
          room.position.y = 5;
          env.add(room);
          const strip = (
            w: number,
            h: number,
            intensity: number,
            pos: [number, number, number],
            rx: number,
            ry: number,
            hex = 0xffffff,
          ) => {
            const m = new THREE.Mesh(
              new THREE.PlaneGeometry(w, h),
              new THREE.MeshBasicMaterial({
                color: new THREE.Color(hex).multiplyScalar(intensity),
                side: THREE.DoubleSide,
              }),
            );
            m.position.set(...pos);
            m.rotation.x = rx;
            m.rotation.y = ry;
            env.add(m);
          };
          // UNA lama principale definita + contorni deboli: la vernice nera
          // vera in ambiente scuro ha pochi riflessi netti, non un bagno di
          // luce uniforme (che appiattisce il Fresnel e legge "plastica").
          strip(14, 0.7, 12, [0, 6, 0], Math.PI / 2, 0); // lama principale
          strip(14, 0.35, 4, [0, 6, -1.6], Math.PI / 2, 0); // contorno freddo
          strip(12, 0.6, 4, [0, 5, -5], Math.PI / 3, 0); // striscia posteriore
          strip(10, 0.5, 2.5, [0, 4, 5.5], -Math.PI / 2.7, 0); // fill frontale
          strip(7, 3.5, 1.0, [-9, 2.6, 0], 0, Math.PI / 2, 0xcfdcff); // quinta sx
          strip(7, 3.5, 1.0, [9, 2.6, 0], 0, -Math.PI / 2, 0xcfdcff); // quinta dx
          strip(8, 3, 0.8, [0, 2.5, -9], 0, 0, 0xcfdcff); // fondale dietro
          strip(8, 3, 0.6, [0, 2.5, 9], 0, Math.PI, 0xcfdcff); // fondale davanti
          return env;
        };

        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(CAM_FOV, 16 / 9, 0.1, 30);
        camera.position.set(...CAM_POS);
        camera.lookAt(...CAM_TARGET);

        // PMREM dell'ambiente studio, sigma minimo → riflessi nitidi sulla
        // vernice. Il fondo del canvas resta trasparente (nero della sezione).
        // Sigma medio: abbastanza nitido da leggere "vernice", abbastanza
        // morbido da non rivelare le grinze residue della ricostruzione AI.
        const pmrem = new THREE.PMREMGenerator(renderer);
        pmremTexture = pmrem.fromScene(buildStudioEnv(), 0.045).texture;
        pmrem.dispose();
        scene.environment = pmremTexture;
        scene.environmentIntensity = 0.8;

        // Il grosso della luce viene dall'environment; le direzionali servono
        // solo a staccare i volumi in ombra (fill morbido + rim freddo).
        const key = new THREE.DirectionalLight(0xffffff, 0.18);
        key.position.set(2.5, 3.2, 2.2);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xdfe8ff, 0.15);
        rim.position.set(-2.8, 2.2, -2.6);
        scene.add(rim);

        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);
        // ?v=N: bump a ogni sostituzione del GLB (stesso nome file → il
        // browser/CDN servirebbero la versione vecchia dalla cache).
        const gltf = await loader.loadAsync("/home/car3d/audi.glb?v=3");
        if (disposed) return;

        carGroup = new THREE.Group();
        // La vernice "appena lucidata": clearcoat quasi a specchio sopra il
        // PBR di Meshy (mappe conservate). Un solo mesh/materiale per tutta
        // l'auto, quindi le regolazioni sono globali.
        gltf.scene.traverse((obj) => {
          const mesh = obj as ThreeNS.Mesh;
          if (!mesh.isMesh) return;
          const std = mesh.material as ThreeNS.MeshStandardMaterial;
          if (std && (std as Partial<ThreeNS.MeshStandardMaterial>).isMeshStandardMaterial) {
            const phys = new THREE.MeshPhysicalMaterial();
            THREE.MeshStandardMaterial.prototype.copy.call(phys, std);
            phys.clearcoat = 1.0;
            phys.clearcoatRoughness = 0.09;
            // roughnessMap PURA (niente scala): è lei a differenziare vetro,
            // vernice e plastiche — un valore piatto appiattisce i materiali
            // e fa "giocattolo monomateriale".
            phys.roughness = 1.0;
            // Metalness moderata: ridà varietà a vetri/cromature senza
            // l'effetto cromo del cofano (la mappa AI lì è sporca).
            phys.metalness = 0.3;
            phys.envMapIntensity = 0.95;
            // La ricostruzione AI lascia una normal map "bollosa": attenuarla
            // spiana i pannelli e rende i riflessi lunghi e puliti.
            phys.normalScale.setScalar(0.3);
            // La texture Meshy è più chiara del vero (ricostruita da frame
            // scuri): il moltiplicatore riporta tetto/vetri al nero profondo.
            phys.color.setScalar(0.5);
            // Fari e barra LED vivono nella emissiveMap, ma il GLB arriva con
            // emissiveFactor nero (default glTF) che la azzera: va sbloccato
            // a bianco perché contribuisca. (La mappa Meshy è comunque scura:
            // le luci restano soffuse, coerenti con l'auto "parcheggiata".)
            phys.emissive.setScalar(1);
            phys.emissiveIntensity = 1.5;
            mesh.material = phys;
            std.dispose();
          }
        });
        // Centro il modello nel gruppo così la rotazione avviene sul suo asse.
        const bbox = new THREE.Box3().setFromObject(gltf.scene);
        const center = bbox.getCenter(new THREE.Vector3());
        gltf.scene.position.sub(center);
        carGroup.add(gltf.scene);
        carGroup.rotation.y = frameToYaw(frameRef.current);
        scene.add(carGroup);

        const resize = () => {
          if (!renderer || !camera || !box) return;
          const w = box.clientWidth;
          const h = box.clientHeight;
          if (w === 0 || h === 0) return;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          lastRenderedFrame = -1; // forza un render col nuovo viewport
        };
        resize();
        ro = new ResizeObserver(resize);
        ro.observe(box);

        io = new IntersectionObserver(
          ([e]) => {
            inViewRef.current = e.isIntersecting;
          },
          { threshold: 0.15 },
        );
        io.observe(box);

        // Un unico loop (ticker GSAP): auto-rotazione quando nessun tween/drag
        // è al comando, render solo se il frame è davvero cambiato.
        tick = (_time, deltaMs) => {
          if (!renderer || !scene || !camera || !carGroup) return;
          if (!inViewRef.current) return;
          const idle =
            !draggingRef.current &&
            !tweenRef.current &&
            targetRef.current === null &&
            !holdingRef.current &&
            !reduceRef.current;
          if (idle) {
            const dt = Math.min(deltaMs, 100) / 1000; // clamp post-tab-switch
            frameRef.current = wrapFrame(frameRef.current + AUTO_FPS * dt);
            reportFrame();
          }
          if (frameRef.current !== lastRenderedFrame) {
            lastRenderedFrame = frameRef.current;
            carGroup.rotation.y = frameToYaw(frameRef.current);
            renderer.render(scene, camera);
          }
        };
        gsap.ticker.add(tick);

        setReady(true);
      } catch {
        if (!disposed) {
          teardown();
          setFailed(true); // → fallback Car360 (video)
        }
      }
    })();

    return () => {
      disposed = true;
      teardown();
    };
    // Scena montata una volta: initialFrame è solo il punto di partenza.
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (failed) return;
    try {
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    } catch {}
    killTween();
    holdingRef.current = false;
    draggingRef.current = true;
    dragRef.current = { startX: e.clientX, startFrame: frameRef.current };
    historyRef.current = [{ t: performance.now(), f: frameRef.current }];
    onGrab();
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !dragRef.current) return;
    // Frame "grezzo" NON wrappato: la storia serve alla stima di velocità e
    // deve restare continua anche a cavallo della giunzione 143→0.
    const raw =
      dragRef.current.startFrame +
      (e.clientX - dragRef.current.startX) / PX_PER_FRAME;
    const now = performance.now();
    const hist = historyRef.current;
    hist.push({ t: now, f: raw });
    while (hist.length > 2 && now - hist[0].t > 120) hist.shift();
    frameRef.current = wrapFrame(raw);
    reportFrame();
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {}
    draggingRef.current = false;
    dragRef.current = null;

    // Inerzia: velocità stimata sugli ultimi ~120 ms di trascinamento; sotto
    // soglia il giro riprende e basta (nessun tween).
    if (reduceRef.current || targetRef.current !== null) return;
    const hist = historyRef.current;
    historyRef.current = [];
    if (hist.length < 2) return;
    const a = hist[0];
    const b = hist[hist.length - 1];
    const dt = (b.t - a.t) / 1000;
    if (dt <= 0) return;
    const v = (b.f - a.f) / dt; // frame logici al secondo, con segno
    if (Math.abs(v) < AUTO_FPS * 1.5) return;
    const proxy = { f: frameRef.current };
    tweenRef.current = gsap.to(proxy, {
      f: frameRef.current + v * 0.3, // corsa residua ∝ velocità di lancio
      duration: Math.min(1.4, 0.35 + Math.abs(v) * 0.004),
      ease: "power3.out",
      onUpdate: () => {
        frameRef.current = wrapFrame(proxy.f);
        reportFrame();
      },
      onComplete: () => {
        tweenRef.current = null; // riposo → l'auto-rotazione riparte da sé
      },
    });
  };

  // WebGL/GLB indisponibili: la sezione resta pienamente funzionante col
  // vecchio stage video (stesso contratto, children inclusi).
  if (failed) {
    return (
      <Car360
        initialFrame={initialFrame}
        targetFrame={targetFrame}
        reduce={reduce}
        onFrameChange={onFrameChange}
        onGrab={onGrab}
        showHint={showHint}
      >
        {children}
      </Car360>
    );
  }

  return (
    <div
      ref={boxRef}
      className="relative w-full cursor-grab touch-none select-none active:cursor-grabbing"
      style={{ aspectRatio: CAR_ASPECT }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[8%] bottom-[5%] h-[12%] rounded-[50%] bg-black/70 blur-2xl"
      />

      <canvas
        ref={canvasRef}
        aria-label="Audi nera Garden's Cars in 3D che ruota su fondo scuro"
        className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500"
        style={{ opacity: ready ? 1 : 0 }}
      />

      {/* Poster (frame WebP del vecchio spin) finché il GLB non è in scena:
          niente vuoto al primo paint, poi crossfade al canvas. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SPIN.srcFor(frameIndex(initialFrame))}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain transition-opacity duration-500"
        style={{ opacity: ready ? 0 : 1 }}
      />

      {children}

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
            Trascina per ruotare
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
