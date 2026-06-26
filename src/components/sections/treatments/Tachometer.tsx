"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Tachimetro vettoriale: al passaggio del mouse la lancetta "sgasa" avanti e
 * indietro fino alla zona rossa (e torna giù), in loop finché il mouse resta
 * sopra. Lancetta elemento separato → animazione coerente, niente immagini.
 *
 * Convenzione angoli: 0° = lancetta verso l'alto; cresce in senso orario.
 */
const MIN = -125; // 0 giri (in basso a sinistra)
const MAX = 125; // zona rossa (in basso a destra)
const TICKS = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // ×1000 giri
const REDLINE_FROM = 7; // da 7k in poi → zona rossa

function angleFor(i: number) {
  return MIN + (i / (TICKS.length - 1)) * (MAX - MIN);
}

/** Punto sulla circonferenza (0°=alto, orario). Coordinate viewBox 200×200. */
function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: 100 + radius * Math.sin(rad),
    y: 100 - radius * Math.cos(rad),
  };
}

/** Path di un arco da startDeg a endDeg (orario). */
function arcPath(startDeg: number, endDeg: number, radius: number) {
  const a = polar(startDeg, radius);
  const b = polar(endDeg, radius);
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${largeArc} 1 ${b.x} ${b.y}`;
}

export function Tachometer() {
  const reduce = useReducedMotion();
  const [revving, setRevving] = useState(false);

  const needleAnim =
    reduce || !revving
      ? { rotate: MIN }
      : { rotate: [MIN, MAX, MIN] as number[] };

  const needleTransition =
    reduce || !revving
      ? { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }
      : { duration: 1.3, ease: "easeInOut" as const, repeat: Infinity };

  return (
    <div
      onMouseEnter={() => setRevving(true)}
      onMouseLeave={() => setRevving(false)}
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-graphite via-ink to-racing-deep"
    >
      <div className="glow-racing pointer-events-none absolute inset-0 opacity-25 blur-2xl" />

      {/* Quadrante */}
      <div className="relative aspect-square w-[78%] max-w-[340px]">
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
          {/* Disco */}
          <circle cx="100" cy="100" r="92" fill="#0c0f0d" />
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="rgba(245,244,240,0.12)"
            strokeWidth="1.5"
          />

          {/* Scala: verde + zona rossa */}
          <path
            d={arcPath(MIN, angleFor(REDLINE_FROM), 80)}
            fill="none"
            stroke="#2e8b43"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d={arcPath(angleFor(REDLINE_FROM), MAX, 80)}
            fill="none"
            stroke="#cd212a"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Tacche + numeri */}
          {TICKS.map((t, i) => {
            const a = angleFor(i);
            const outer = polar(a, 80);
            const inner = polar(a, 70);
            const label = polar(a, 58);
            const red = i >= REDLINE_FROM;
            return (
              <g key={t}>
                <line
                  x1={outer.x}
                  y1={outer.y}
                  x2={inner.x}
                  y2={inner.y}
                  stroke={red ? "#cd212a" : "rgba(245,244,240,0.7)"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="13"
                  fontWeight="700"
                  fill={red ? "#e8525a" : "rgba(245,244,240,0.85)"}
                  fontFamily="var(--font-display)"
                >
                  {t}
                </text>
              </g>
            );
          })}

          {/* Etichetta RPM */}
          <text
            x="100"
            y="138"
            textAnchor="middle"
            fontSize="9"
            letterSpacing="2"
            fill="rgba(245,244,240,0.45)"
            fontFamily="var(--font-display)"
          >
            x1000 RPM
          </text>
        </svg>

        {/* Lancetta (pivot al centro del quadrante) */}
        <motion.div
          aria-hidden
          className="absolute bottom-1/2 left-1/2 h-[40%] w-[4px] origin-bottom rounded-full bg-gradient-to-t from-racing-bright to-white"
          style={{
            marginLeft: -2,
            boxShadow: "0 0 14px rgba(46,139,67,0.85)",
          }}
          initial={{ rotate: MIN }}
          animate={needleAnim}
          transition={needleTransition}
        />

        {/* Perno centrale */}
        <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-racing-bright/50 bg-ink shadow-[0_0_10px_rgba(46,139,67,0.6)]" />
      </div>
    </div>
  );
}
