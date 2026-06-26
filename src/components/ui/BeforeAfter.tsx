"use client";

import Image from "next/image";
import { useRef, useState } from "react";

/**
 * Confronto "Prima / Dopo" con divisore trascinabile.
 * - L'immagine "dopo" è il fondo; la "prima" viene ritagliata fino al cursore.
 * - Pointer events per trascinare; frecce ←/→ per l'accessibilità da tastiera.
 */
export function BeforeAfter({
  before,
  after,
  beforeAlt,
  afterAlt,
  className,
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [pos, setPos] = useState(50);

  const setFromClientX = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };

  return (
    <div
      ref={ref}
      className={`relative aspect-[4/3] w-full select-none overflow-hidden rounded-3xl ring-1 ring-white/10 ${
        className ?? ""
      }`}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) setFromClientX(e.clientX);
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      {/* DOPO (fondo) */}
      <Image
        src={after}
        alt={afterAlt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />

      {/* PRIMA (ritagliata fino al cursore) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <Image
          src={before}
          alt={beforeAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Etichette */}
      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider text-paper/90 backdrop-blur-sm">
        Prima
      </span>
      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-racing/90 px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
        Dopo
      </span>

      {/* Divisore + maniglia (slider accessibile) */}
      <div
        className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white/90"
        style={{ left: `${pos}%` }}
      >
        <div
          role="slider"
          aria-label="Confronto prima e dopo"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
            if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
          }}
          className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white text-ink shadow-lg ring-1 ring-ink/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-racing-bright"
        >
          <span aria-hidden className="font-display text-sm font-bold tracking-tighter">
            ‹ ›
          </span>
        </div>
      </div>
    </div>
  );
}
