"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Car } from "@/lib/cars";
import { formatPrice } from "@/lib/utils";

export function CarCard({ car }: { car: Car }) {
  const reduce = useReducedMotion();
  const [imgError, setImgError] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <motion.article
      whileHover={reduce || open ? undefined : { y: -8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card-edge group relative flex flex-col overflow-hidden rounded-2xl text-paper"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {imgError ? (
          // Placeholder finché non viene caricata la foto reale in public/cars/
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-graphite/60">
            <span className="relative h-12 w-12 overflow-hidden rounded-full opacity-80 ring-1 ring-white/15">
              <Image src="/brand/logo.jpg" alt="" fill sizes="48px" className="object-cover" />
            </span>
            <span className="font-display text-xs uppercase tracking-wider text-paper/45">
              Foto in arrivo
            </span>
          </div>
        ) : (
          <Image
            src={car.image}
            alt={`${car.brand} ${car.model} ${car.trim ?? ""}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setImgError(true)}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
        {car.highlight && (
          <span className="absolute left-4 top-4 rounded-full bg-racing/90 px-3 py-1 font-display text-xs font-semibold text-white backdrop-blur-sm">
            {car.highlight}
          </span>
        )}
        <span className="absolute right-4 top-4 rounded-full bg-ink/70 px-3 py-1 font-display text-xs font-medium text-paper/80 backdrop-blur-sm">
          {car.year}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-tight text-paper">
          {car.brand} {car.model}
        </h3>
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
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex items-center gap-1.5 font-display text-sm font-semibold text-paper/70 transition-colors hover:text-paper"
          >
            Dettagli
            <span
              className={`inline-block transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              aria-hidden
            >
              ▾
            </span>
          </button>
        </div>

        {/* Dettaglio a tendina */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-5 border-t border-white/10 pt-4">
                {car.description && (
                  <p className="text-sm leading-relaxed text-paper/70">
                    {car.description}
                  </p>
                )}

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {car.color && <DetailRow label="Colore" value={car.color} />}
                  <DetailRow label="Anno" value={String(car.year)} />
                  <DetailRow label="Cambio" value={car.gearbox} />
                  <DetailRow
                    label="Garanzia"
                    value={car.condition === "nuova" ? "24 mesi" : "12 mesi"}
                  />
                </dl>

                <a href="#contatti" className="btn btn-primary mt-5 w-full justify-center">
                  Richiedi informazioni
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-white/5 pb-1.5">
      <dt className="text-xs uppercase tracking-wider text-fog">{label}</dt>
      <dd className="font-display text-sm font-medium text-paper">{value}</dd>
    </div>
  );
}
