"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { SPIN, frameIndex } from "@/lib/carSpin";

const CAR_ASPECT = "16 / 9";
const FADE_MASK = "linear-gradient(to bottom, #000 84%, transparent 99%)";
// Sensibilità: quanti pixel di trascinamento per avanzare di un fotogramma.
const PX_PER_FRAME = 18;

/**
 * Stage rotabile dell'auto: una sequenza di fotogrammi mostrata in base al
 * trascinamento orizzontale. Immobile da ferma (nessuna auto-rotazione).
 * I pallini dei servizi arrivano come `children` e vengono sovrapposti.
 */
export default function Car360({
  frame,
  onFrameChange,
  showHint,
  onFirstDrag,
  children,
}: {
  frame: number;
  onFrameChange: (f: number) => void;
  showHint: boolean;
  onFirstDrag: () => void;
  children?: ReactNode;
}) {
  const drag = useRef<{ startX: number; startFrame: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const idx = frameIndex(frame);
  // Fotogramma visibile al primo render: va caricato con priorità (è l'LCP).
  // Catturato una sola volta col lazy initializer, non cambia mai.
  const [initialIdx] = useState(() => frameIndex(frame));

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startFrame: frame };
    onFirstDrag();
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.startX;
    onFrameChange(drag.current.startFrame + dx / PX_PER_FRAME);
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current) (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    drag.current = null;
  };

  return (
    <div
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

      {/* Tutti i fotogrammi montati; solo quello attivo è visibile. Il primo ha
          priority per comparire subito; gli altri fanno da precaricamento. */}
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
            opacity: i === idx ? 1 : 0,
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
