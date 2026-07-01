"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { SPIN, frameIndex, normalizeFrame } from "@/lib/carSpin";

const CAR_ASPECT = "16 / 9";
const FADE_MASK = "linear-gradient(to bottom, #000 84%, transparent 99%)";
// Sensibilità del trascinamento: pixel per fotogramma.
const PX_PER_FRAME = 14;
// Velocità auto-rotazione (fotogrammi al ms): ~35 frame in ~11s.
const AUTO_SPEED = 0.003;
// Soglia sotto la quale l'inerzia si considera esaurita (frame/ms).
const VEL_EPS = 0.0006;

/**
 * Stage rotabile dell'auto con motore di animazione (requestAnimationFrame).
 * Modalità, in ordine di priorità: trascinamento → inerzia (dopo il rilascio)
 * → tween verso un target (quando si seleziona un servizio) → auto-rotazione
 * lenta a ping-pong (stato di riposo). `reduce` disattiva i movimenti automatici.
 * I pallini arrivano come `children`. Il frame corrente (frazionario) viene
 * riportato al genitore via onFrameChange così i pallini lo seguono.
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
  const frameRef = useRef(initialFrame);
  const velRef = useRef(0); // frame/ms, per l'inerzia
  const dirRef = useRef(1); // verso dell'auto-rotazione (+1/-1)
  const draggingRef = useRef(false);
  const dragRef = useRef<{ startX: number; startFrame: number } | null>(null);
  const lastMoveRef = useRef<{ x: number; t: number } | null>(null);
  const targetRef = useRef<number | null>(targetFrame);
  const reduceRef = useRef<boolean>(!!reduce);
  const inViewRef = useRef(true);

  const [displayIdx, setDisplayIdx] = useState(() => frameIndex(initialFrame));
  const [failed, setFailed] = useState(false);
  // Fotogramma visibile al primo render: caricato con priorità (è l'LCP).
  const [initialIdx] = useState(() => frameIndex(initialFrame));
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Tiene i ref allineati alle prop senza far ripartire il loop.
  useEffect(() => {
    targetRef.current = targetFrame;
  }, [targetFrame]);
  useEffect(() => {
    reduceRef.current = !!reduce;
  }, [reduce]);

  // Pausa il motore quando la sezione è fuori dal viewport.
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

  // Loop di animazione: un solo rAF per tutta la vita del componente.
  useEffect(() => {
    const max = SPIN.frameCount - 1;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      let f = frameRef.current;

      if (!inViewRef.current) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (draggingRef.current) {
        // il frame è aggiornato da onPointerMove; qui non tocchiamo nulla
        f = frameRef.current;
      } else if (Math.abs(velRef.current) > VEL_EPS && !reduceRef.current) {
        // inerzia
        f = normalizeFrame(f + velRef.current * dt);
        if (f <= 0 || f >= max) velRef.current = 0;
        velRef.current *= Math.exp(-dt / 220);
      } else {
        velRef.current = 0;
        const target = targetRef.current;
        if (target !== null) {
          // tween verso il servizio selezionato
          const diff = target - f;
          if (Math.abs(diff) < 0.05 || reduceRef.current) {
            f = target;
          } else {
            f += diff * (1 - Math.exp(-dt / 90));
          }
        } else if (!reduceRef.current) {
          // auto-rotazione a ping-pong
          f += dirRef.current * AUTO_SPEED * dt;
          if (f >= max) {
            f = max;
            dirRef.current = -1;
          } else if (f <= 0) {
            f = 0;
            dirRef.current = 1;
          }
        }
      }

      if (f !== frameRef.current) {
        frameRef.current = f;
        onFrameChange(f);
        const idx = frameIndex(f);
        setDisplayIdx((prev) => (prev === idx ? prev : idx));
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onFrameChange]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    draggingRef.current = true;
    velRef.current = 0;
    dragRef.current = { startX: e.clientX, startFrame: frameRef.current };
    lastMoveRef.current = { x: e.clientX, t: performance.now() };
    onGrab();
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const next = normalizeFrame(dragRef.current.startFrame + dx / PX_PER_FRAME);
    const now = performance.now();
    const lm = lastMoveRef.current;
    if (lm) {
      const ddt = now - lm.t;
      if (ddt > 0) velRef.current = (next - frameRef.current) / ddt;
    }
    lastMoveRef.current = { x: e.clientX, t: now };
    frameRef.current = next;
    onFrameChange(next);
    const idx = frameIndex(next);
    setDisplayIdx((prev) => (prev === idx ? prev : idx));
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    }
    draggingRef.current = false;
    dragRef.current = null;
    if (reduceRef.current) velRef.current = 0;
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

      {/* Tutti i fotogrammi montati; solo quello attivo è visibile. Il primo
          visibile ha priority (LCP); gli altri fanno da precaricamento. */}
      {Array.from({ length: SPIN.frameCount }).map((_, i) => (
        <Image
          key={i}
          src={SPIN.srcFor(i)}
          alt={i === initialIdx ? "Audi nera Garden's Cars su fondo scuro" : ""}
          aria-hidden={i !== initialIdx}
          fill
          priority={i === initialIdx}
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="pointer-events-none object-contain"
          onError={i === initialIdx ? () => setFailed(true) : undefined}
          style={{
            opacity: i === displayIdx ? 1 : 0,
            maskImage: FADE_MASK,
            WebkitMaskImage: FADE_MASK,
          }}
        />
      ))}

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
