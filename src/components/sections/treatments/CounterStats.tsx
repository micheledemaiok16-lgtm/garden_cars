"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  useInView,
  useReducedMotion,
} from "framer-motion";
import type { CounterStat } from "@/lib/treatments";

/** Singolo numero che sale da 0 al valore finale quando entra in viewport. */
function Counter({ stat }: { stat: CounterStat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, stat.value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, stat.value]);

  // Con reduced-motion mostriamo subito il valore finale, senza animazione.
  const display = reduce ? stat.value : value;

  return (
    <div>
      <span
        ref={ref}
        className="font-display text-5xl font-bold tracking-tight text-paper xl:text-6xl"
      >
        {stat.prefix}
        {display}
        {stat.suffix}
      </span>
      <p className="mt-1 text-sm font-medium uppercase tracking-wide text-paper/55">
        {stat.label}
      </p>
    </div>
  );
}

export function CounterStats({ stats }: { stats: CounterStat[] }) {
  return (
    <div className="flex flex-wrap gap-x-12 gap-y-6">
      {stats.map((s) => (
        <Counter key={s.label} stat={s} />
      ))}
    </div>
  );
}
