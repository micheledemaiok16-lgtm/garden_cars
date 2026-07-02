"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SPIN } from "@/lib/carSpin";

const CAR_ASPECT = "16 / 9";
// Sfuma SOLO i bordi alto/basso così il rettangolo si dissolve nel fondo della
// sezione. Niente sfumatura laterale: in profilo l'auto riempie la larghezza e
// una sfumatura ai lati le "taglierebbe" muso e coda. Il fondo è nero su nero,
// quindi ai lati non serve alcuna dissolvenza per integrarsi.
const EDGE_MASK =
  "linear-gradient(to bottom, transparent 0%, #000 5%, #000 92%, transparent 100%)";
// Sensibilità del trascinamento: pixel per "fotogramma logico" (base 144).
const PX_PER_FRAME = 7;
// Velocità di riproduzione in riposo. Il video fa un senso di marcia (~340°) in
// ~16 s a rate 1; 1.3 ⇒ ~12 s. Rallentare non toglie qualità (il video si
// riproduce fotogramma per fotogramma, resta fluido). È l'unico numero da
// toccare per regolare il ritmo dell'auto-rotazione.
const AUTO_RATE = 1.3;

// Base logica per i pallini (0..MAX), coerente con carSpots.ts.
const MAX = SPIN.frameCount - 1;
const clampFrame = (f: number) => Math.max(0, Math.min(MAX, f));

/**
 * Stage rotabile dell'auto basato su un VIDEO nativo: fluido a qualunque
 * velocità e leggero in RAM (decodifica un fotogramma per volta). Il file è un
 * ping-pong (andata 0→~340° + ritorno) così il loop non "salta".
 *
 * Modalità: riposo → il video va in play (auto-rotazione, ritmo = AUTO_RATE);
 * trascinamento → video in pausa, `currentTime` pilotato dal puntatore;
 * selezione servizio (`targetFrame`) → tween del `currentTime` verso l'angolo;
 * `reduce` → fermo sul fotogramma iniziale.
 *
 * Il "fotogramma logico" (0..MAX, base 144) è ricavato dal `currentTime`
 * (rispecchiando la metà di ritorno) e passato al genitore via onFrameChange,
 * così i pallini seguono l'auto senza dipendere dalla sequenza di immagini.
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
  const halfRef = useRef(0); // metà durata = un senso di marcia (andata)
  const frameRef = useRef(clampFrame(initialFrame));
  const draggingRef = useRef(false);
  const dragRef = useRef<{ startX: number; startFrame: number } | null>(null);
  const targetRef = useRef<number | null>(targetFrame);
  const reduceRef = useRef<boolean>(!!reduce);
  const inViewRef = useRef(true);
  const lastIdxRef = useRef(Math.round(clampFrame(initialFrame)));
  // Precarico dei 144 WebP usati per lo scrubbing (drag/tween). Tenuti vivi in
  // un ref così il browser non li scarta: allo swap sono già in cache.
  const preloadRef = useRef<HTMLImageElement[]>([]);
  const lastImgIdxRef = useRef(-1); // ultimo frame mostrato nell'overlay img
  const overlayRef = useRef(false); // true = mostro img (scrub), false = video

  const [failed, setFailed] = useState(false);

  // frame logico (andata) → istante nel video.
  const frameToTime = (f: number) => (clampFrame(f) / MAX) * halfRef.current;
  // istante → frame logico, rispecchiando la metà di ritorno del ping-pong.
  const timeToFrame = (t: number) => {
    const half = halfRef.current;
    if (half <= 0) return frameRef.current;
    const p = t <= half ? t / half : (2 * half - t) / half;
    return clampFrame(p * MAX);
  };

  // Precarico dei 144 fotogrammi WebP: durante il trascinamento (o il tween
  // verso un servizio) mostriamo l'immagine invece di far "cercare" il video —
  // il seek in un mp4 compresso è a scatti, l'immagine è istantanea.
  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    for (let i = 0; i <= MAX; i++) {
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
      if (!active && v && halfRef.current > 0) {
        try {
          v.currentTime = frameToTime(frameRef.current);
        } catch {}
      }
    }
    if (active && img) {
      const idx = Math.round(frameRef.current);
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
    if (v && v.readyState >= 1 && halfRef.current === 0) {
      halfRef.current = v.duration / 2;
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
      if (v && halfRef.current > 0) {
        if (!inViewRef.current) {
          if (!v.paused) v.pause();
        } else if (draggingRef.current) {
          // frameRef pilotato da onPointerMove; overlay img mostra il frame
          if (!v.paused) v.pause();
          applyOverlay(true);
        } else if (targetRef.current !== null) {
          // tween in spazio-fotogramma verso l'angolo del servizio; niente seek
          // video (che sarebbe a scatti) → mostriamo l'img del frame interpolato
          if (!v.paused) v.pause();
          const tf = targetRef.current;
          const cf = frameRef.current;
          frameRef.current =
            Math.abs(tf - cf) < 0.5 || reduceRef.current
              ? tf
              : cf + (tf - cf) * 0.15;
          applyOverlay(true);
        } else if (reduceRef.current) {
          if (!v.paused) v.pause();
          applyOverlay(true);
        } else {
          // riposo: auto-rotazione (il video avanza da solo, ping-pong nel file)
          applyOverlay(false);
          if (v.playbackRate !== AUTO_RATE) v.playbackRate = AUTO_RATE;
          if (v.paused) {
            const p = v.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
          }
          frameRef.current = timeToFrame(v.currentTime);
        }
        const idx = Math.round(frameRef.current);
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
    halfRef.current = v.duration / 2;
    v.playbackRate = AUTO_RATE;
    try {
      v.currentTime = frameToTime(frameRef.current);
    } catch {}
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    draggingRef.current = true;
    const v = videoRef.current;
    if (v && !v.paused) v.pause();
    dragRef.current = { startX: e.clientX, startFrame: frameRef.current };
    applyOverlay(true); // mostra subito l'img per non far comparire un frame video
    onGrab();
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const next = clampFrame(dragRef.current.startFrame + dx / PX_PER_FRAME);
    frameRef.current = next;
    applyOverlay(true); // aggiorna l'img del frame trascinato (istantanea)
    const idx = Math.round(next);
    if (idx !== lastIdxRef.current) {
      lastIdxRef.current = idx;
      onFrameChange(next);
    }
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
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
        poster="/home/spin/spin-poster.webp"
        aria-label="Audi nera Garden's Cars che ruota su fondo scuro"
        onLoadedMetadata={onLoadedMetadata}
        onError={() => setFailed(true)}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        style={{
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
        }}
      >
        <source src="/home/spin/spin-loop.mp4" type="video/mp4" />
      </video>

      {/* Overlay per lo scrubbing: durante drag/tween mostra il fotogramma WebP
          (swap istantaneo, niente seek video). Nascosto in riposo. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={SPIN.srcFor(clampFrame(Math.round(initialFrame)))}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        style={{
          opacity: 0,
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
        }}
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
