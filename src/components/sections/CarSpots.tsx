"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { carSpots, type TreatmentId } from "@/lib/carSpots";
import { resolveSpot } from "@/lib/carSpin";
import { treatments } from "@/lib/treatments";

/**
 * Pallini dei servizi sovrapposti all'auto: ognuno segue la rotazione
 * (posizione/opacità da resolveSpot) e linka alla sezione del trattamento.
 * I pallini con opacità ~0 sono non interattivi.
 */
export default function CarSpots({
  frame,
  activeId,
  onPreview,
  onEndPreview,
  reduce,
}: {
  frame: number;
  activeId: string;
  onPreview: (id: TreatmentId) => void;
  onEndPreview: () => void;
  reduce: boolean | null;
}) {
  return (
    <>
      {carSpots.map((spot) => {
        const { x, y, opacity } = resolveSpot(spot.samples, frame);
        const hidden = opacity < 0.05;
        const t = treatments.find((tr) => tr.id === spot.id);
        const isActive = spot.id === activeId;
        return (
          <Link
            key={spot.id}
            href={`/trattamenti#${spot.id}`}
            onMouseEnter={() => onPreview(spot.id)}
            onFocus={() => onPreview(spot.id)}
            onMouseLeave={onEndPreview}
            aria-label={`Vai al servizio ${t?.title ?? spot.label}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              opacity,
              pointerEvents: hidden ? "none" : "auto",
              transition: reduce ? undefined : "opacity 200ms ease",
            }}
            tabIndex={hidden ? -1 : 0}
            aria-hidden={hidden}
          >
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-racing-bright shadow-[0_0_0_4px_rgba(46,139,67,0.25)]"
            />
            {!reduce && isActive && !hidden && (
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
    </>
  );
}
