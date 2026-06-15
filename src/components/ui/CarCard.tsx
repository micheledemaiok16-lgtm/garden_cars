"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { Car } from "@/lib/cars";
import { formatPrice } from "@/lib/utils";

export function CarCard({ car }: { car: Car }) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card-edge group relative flex flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={car.image}
          alt={`${car.brand} ${car.model} ${car.trim ?? ""}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
        {car.highlight && (
          <span className="absolute left-4 top-4 rounded-full bg-racing/90 px-3 py-1 font-display text-xs font-semibold backdrop-blur-sm">
            {car.highlight}
          </span>
        )}
        <span className="absolute right-4 top-4 rounded-full bg-ink/70 px-3 py-1 font-display text-xs font-medium text-paper/80 backdrop-blur-sm">
          {car.year}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-tight">
            {car.brand} {car.model}
          </h3>
        </div>
        {car.trim && <p className="mt-0.5 text-sm text-fog">{car.trim}</p>}

        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-center">
          <Spec label="Km" value={car.km === 0 ? "0" : car.km.toLocaleString("it-IT")} />
          <Spec label="Alim." value={car.fuel} />
          <Spec label="Potenza" value={`${car.power} CV`} />
        </dl>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-xs text-fog">{car.gearbox}</p>
            <p className="font-display text-2xl font-bold text-racing-bright">
              {formatPrice(car.price)}
            </p>
          </div>
          <a
            href="#contatti"
            className="font-display text-sm font-semibold text-paper/70 transition-colors hover:text-paper"
          >
            Dettagli →
          </a>
        </div>
      </div>
    </motion.article>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="font-display text-sm font-semibold leading-tight">{value}</dd>
      <dt className="mt-0.5 text-[0.65rem] uppercase tracking-wider text-fog">{label}</dt>
    </div>
  );
}
