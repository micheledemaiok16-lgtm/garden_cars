"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usedCars, type Fuel } from "@/lib/cars";
import { CarCard } from "@/components/ui/CarCard";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const brands = ["Tutte", ...Array.from(new Set(usedCars.map((c) => c.brand)))];
const fuels: ("Tutte" | Fuel)[] = [
  "Tutte",
  ...(Array.from(new Set(usedCars.map((c) => c.fuel))) as Fuel[]),
];
const priceBands = [
  { label: "Tutti i prezzi", min: 0, max: Infinity },
  { label: "Fino a 30.000 €", min: 0, max: 30000 },
  { label: "30 – 50.000 €", min: 30000, max: 50000 },
  { label: "Oltre 50.000 €", min: 50000, max: Infinity },
];

export default function UsedCars() {
  const reduce = useReducedMotion();
  const [brand, setBrand] = useState("Tutte");
  const [fuel, setFuel] = useState<"Tutte" | Fuel>("Tutte");
  const [band, setBand] = useState(0);

  const filtered = useMemo(() => {
    const p = priceBands[band];
    return usedCars.filter(
      (c) =>
        (brand === "Tutte" || c.brand === brand) &&
        (fuel === "Tutte" || c.fuel === fuel) &&
        c.price >= p.min &&
        c.price < p.max,
    );
  }, [brand, fuel, band]);

  return (
    <section id="usate" className="relative bg-paper py-24 text-ink md:py-32">
      <div className="wrap">
        <Reveal>
          <span className="eyebrow text-racing">Auto usate</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-xl mt-5 max-w-2xl text-ink">
            Usato garantito, scelto come per noi.
          </h2>
        </Reveal>

        {/* Filtri */}
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col gap-5 border-y border-ink/10 py-6 lg:flex-row lg:items-center lg:gap-10">
            <FilterRow label="Marca" options={brands} value={brand} onChange={setBrand} />
            <FilterRow
              label="Alimentazione"
              options={fuels}
              value={fuel}
              onChange={(v) => setFuel(v as "Tutte" | Fuel)}
            />
            <FilterRow
              label="Prezzo"
              options={priceBands.map((p) => p.label)}
              value={priceBands[band].label}
              onChange={(v) => setBand(priceBands.findIndex((p) => p.label === v))}
            />
          </div>
        </Reveal>

        <p className="mt-6 text-sm text-ink/50">
          {filtered.length} {filtered.length === 1 ? "veicolo" : "veicoli"} disponibili
        </p>

        <motion.div layout className="mt-6 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((car) => (
              <motion.div
                key={car.id}
                layout
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <CarCard car={car} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <p className="mt-10 text-center text-ink/60">
            Nessun veicolo con questi filtri. Prova a modificarli o{" "}
            <a href="#contatti" className="text-racing underline underline-offset-4">
              raccontaci cosa cerchi
            </a>
            .
          </p>
        )}
      </div>
    </section>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-display text-xs font-semibold uppercase tracking-wider text-ink/40">
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-full px-3.5 py-1.5 font-display text-sm font-medium transition-colors",
            value === opt
              ? "bg-racing text-white"
              : "bg-ink/5 text-ink/70 hover:bg-ink/10",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
