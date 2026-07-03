"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SPIN,
  SPIN_ASSET_VERSION,
  frameIndex,
  normalizeFrame,
} from "@/lib/carSpin";

const CAR_ASPECT = "16 / 9";
// La dissolvenza dei bordi verso il nero (#000) della sezione è BAKATA negli
// asset (video e WebP hanno una rampa verso il nero sui 4 lati): niente overlay
// né CSS mask sul <video> — la mask disattiverebbe il compositing accelerato
// dalla GPU e renderebbe la rotazione scattosa.
// Sensibilità del trascinamento: pixel per "fotogramma logico" (base 144).
const PX_PER_FRAME = 7;
// Velocità di riproduzione in riposo. Il video è un giro 360° completo (loop
// vero) di ~12 s. Lo riproduciamo a velocità NATIVA (1.0): un rate ≠ 1
// introduce micro-scatti (judder) perché il browser ricampiona i fotogrammi
// contro il refresh a 60 Hz del monitor. Per cambiare ritmo, rigenerare il
// video più lungo/corto invece di toccare questo numero.
const AUTO_RATE = 1.0;

// Base logica dei fotogrammi: il giro è continuo (wrap), il fotogramma logico
// "gira" senza fermarsi agli estremi. wrapFrame tiene un valore (anche
// frazionario) in [0, FC); imgIndex dà l'indice intero 0..FC-1 del WebP.
const FC = SPIN.frameCount;
const wrapFrame = (f: number) => normalizeFrame(f, FC, true);
const imgIndex = (f: number) => frameIndex(f, FC, true);

/**
 * Stage rotabile dell'auto basato su un VIDEO nativo: fluido a qualunque
 * velocità e leggero in RAM (decodifica un fotogramma per volta). Il file è un
 * loop 360° vero (start=end): riprodotto in loop gira all'infinito senza scatto.
 *
 * Modalità: riposo → il video va in play (auto-rotazione, ritmo = AUTO_RATE);
 * trascinamento → video in pausa, `currentTime` pilotato dal puntatore;
 * selezione servizio (`targetFrame`) → tween del `currentTime` verso l'angolo;
 * `reduce` → fermo sul fotogramma iniziale.
 *
 * Il "fotogramma logico" (0..FC-1, base 144) è ricavato dal `currentTime` in
 * modo lineare e wrappato (giro continuo), e passato al genitore via
 * onFrameChange, così i pallini seguono l'auto senza dipendere dalle immagini.
 */
export default function Car360({
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const periodRef = useRef(0); // durata del video = un giro 360° completo
  const frameRef = useRef(wrapFrame(initialFrame));
  const draggingRef = useRef(false);
  const dragRef = useRef<{ startX: number; startFrame: number } | null>(null);
  const targetRef = useRef<number | null>(targetFrame);
  const reduceRef = useRef<boolean>(!!reduce);
  const inViewRef = useRef(true);
  const lastIdxRef = useRef(imgIndex(initialFrame));
  // Precarico dei 144 WebP usati per lo scrubbing (drag/tween). Tenuti vivi in
  // un ref così il browser non li scarta: allo swap sono già in cache.
  const preloadRef = useRef<HTMLImageElement[]>([]);
  const lastImgIdxRef = useRef(-1); // ultimo frame mostrato nell'overlay img
  const overlayRef = useRef(false); // true = mostro img (scrub), false = video

  const [failed, setFailed] = useState(false);

  // fotogramma logico → istante nel video (loop lineare: FC fotogrammi sull'intera durata).
  const frameToTime = (f: number) =>
    periodRef.current > 0 ? (wrapFrame(f) / FC) * periodRef.current : 0;
  // istante → fotogramma logico (lineare, wrappato per il giro continuo).
  const timeToFrame = (t: number) => {
    const period = periodRef.current;
    if (period <= 0) return frameRef.current;
    return wrapFrame((t / period) * FC);
  };

  // Precarico dei 144 fotogrammi WebP: durante il trascinamento (o il tween
  // verso un servizio) mostriamo l'immagine invece di far "cercare" il video —
  // il seek in un mp4 compresso è a scatti, l'immagine è istantanea.
  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    for (let i = 0; i < FC; i++) {
      const im = new Image();
      im.src = SPIN.srcFor(i);
      imgs.push(im);
    }
    preloadRef.current = imgs;
  }, []);

  // Aggiorna l'overlay: img visibile (scrub) o video visibile (riposo), e sorgente
  // dell'img al frame logico corrente. Manipolazione diretta del DOM per non
  // ri-renderizzare a ogni frame.
  const applyOverlay = (active: boolean) => {
    const v = videoRef.current;
    const img = imgRef.current;
    if (overlayRef.current !== active) {
      overlayRef.current = active;
      if (img) img.style.opacity = active ? "1" : "0";
      if (v) v.style.opacity = active ? "0" : "1";
      // Uscendo dallo scrub: riallinea il video al frame mostrato, così alla
      // ripresa della riproduzione non "salta".
      if (!active && v && periodRef.current > 0) {
        try {
          v.currentTime = frameToTime(frameRef.current);
        } catch {}
      }
    }
    if (active && img) {
      const idx = imgIndex(frameRef.current);
      if (idx !== lastImgIdxRef.current) {
        lastImgIdxRef.current = idx;
        img.src = SPIN.srcFor(idx);
      }
    }
  };

  // Tiene i ref allineati alle prop senza far ripartire il loop.
  useEffect(() => {
    targetRef.current = targetFrame;
  }, [targetFrame]);
  useEffect(() => {
    reduceRef.current = !!reduce;
  }, [reduce]);

  // Pausa quando la sezione è fuori dal viewport.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        inViewRef.current = e.isIntersecting;
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Se il video è già in cache al mount, l'evento loadedmetadata può essere già
  // passato prima che il gestore si agganci: inizializziamo comunque
  // durata/velocità/posizione così pallini e ritmo funzionano lo stesso.
  useEffect(() => {
    const v = videoRef.current;
    if (v && v.readyState >= 1 && periodRef.current === 0) {
      periodRef.current = v.duration;
      v.playbackRate = AUTO_RATE;
      try {
        v.currentTime = frameToTime(frameRef.current);
      } catch {}
    }
  }, []);

  // Loop: pilota/legge il video secondo la modalità e riporta il frame logico.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v && periodRef.current > 0) {
        if (!inViewRef.current) {
          if (!v.paused) v.pause();
        } else if (draggingRef.current) {
          // frameRef pilotato da onPointerMove; overlay img mostra il frame
          if (!v.paused) v.pause();
          applyOverlay(true);
        } else if (targetRef.current !== null) {
          // tween in spazio-fotogramma verso l'angolo del servizio; niente seek
          // video (che sarebbe a scatti) → mostriamo l'img del frame interpolato.
          // Il giro è un loop: il delta segue il percorso angolare più corto,
          // anche attraverso la giunzione 143→0.
          if (!v.paused) v.pause();
          const tf = targetRef.current;
          const cf = frameRef.current;
          const delta = ((((tf - cf + FC / 2) % FC) + FC) % FC) - FC / 2;
          frameRef.current =
            Math.abs(delta) < 0.5 || reduceRef.current
              ? wrapFrame(tf)
              : wrapFrame(cf + delta * 0.15);
          applyOverlay(true);
        } else if (reduceRef.current) {
          if (!v.paused) v.pause();
          applyOverlay(true);
        } else {
          // riposo: auto-rotazione (il video avanza da solo, loop 360° continuo)
          applyOverlay(false);
          if (v.playbackRate !== AUTO_RATE) v.playbackRate = AUTO_RATE;
          if (v.paused) {
            const p = v.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
          }
          frameRef.current = timeToFrame(v.currentTime);
        }
        const idx = imgIndex(frameRef.current);
        if (idx !== lastIdxRef.current) {
          lastIdxRef.current = idx;
          onFrameChange(frameRef.current);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // applyOverlay/frameToTime leggono solo ref: la closure iniziale resta valida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFrameChange]);

  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    periodRef.current = v.duration;
    v.playbackRate = AUTO_RATE;
    try {
      v.currentTime = frameToTime(frameRef.current);
    } catch {}
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // La cattura può fallire (pointer non più attivo, quirks di alcuni
    // browser): il trascinamento deve partire lo stesso.
    try {
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    } catch {}
    draggingRef.current = true;
    const v = videoRef.current;
    // Presa "dal vivo": in riposo il frame corrente è il tempo del video, non
    // l'ultimo tick rAF (che può essere in ritardo se il thread è sotto carico).
    if (v && !overlayRef.current && periodRef.current > 0) {
      frameRef.current = timeToFrame(v.currentTime);
    }
    if (v && !v.paused) v.pause();
    dragRef.current = { startX: e.clientX, startFrame: frameRef.current };
    applyOverlay(true); // mostra subito l'img per non far comparire un frame video
    onGrab();
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const next = wrapFrame(dragRef.current.startFrame + dx / PX_PER_FRAME);
    frameRef.current = next;
    applyOverlay(true); // aggiorna l'img del frame trascinato (istantanea)
    const idx = imgIndex(next);
    if (idx !== lastIdxRef.current) {
      lastIdxRef.current = idx;
      onFrameChange(next);
    }
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) {
      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
    draggingRef.current = false;
    dragRef.current = null;
  };

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

      <video
        ref={videoRef}
        muted
        playsInline
        loop
        autoPlay={!reduce}
        preload="auto"
        poster={`/home/spin/spin-poster.webp?v=${SPIN_ASSET_VERSION}`}
        aria-label="Audi nera Garden's Cars che ruota su fondo scuro"
        onLoadedMetadata={onLoadedMetadata}
        onError={() => setFailed(true)}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
      >
        <source
          src={`/home/spin/spin-loop.mp4?v=${SPIN_ASSET_VERSION}`}
          type="video/mp4"
        />

      </video>

      {/* Overlay per lo scrubbing: durante drag/tween mostra il fotogramma WebP
          (swap istantaneo, niente seek video). Nascosto in riposo. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={SPIN.srcFor(imgIndex(initialFrame))}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        style={{ opacity: 0 }}
      />

      {children}

      <AnimatePresence>
        {showHint && !failed && (
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
