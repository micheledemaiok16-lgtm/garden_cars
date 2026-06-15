"use client";

import { newCars } from "@/lib/cars";
import { CarCard } from "@/components/ui/CarCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ScrollWheel } from "@/components/ui/ScrollWheel";

export default function NewCars() {
  return (
    <section id="nuove" className="relative overflow-hidden bg-ink py-24 md:py-32">
      <ScrollWheel
        className="absolute -right-36 top-1/2 hidden -translate-y-1/2 lg:block"
        size={504}
        spin={480}
        opacity={0.25}
      />
      <div className="wrap relative">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <span className="eyebrow text-racing-bright">Auto nuove</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="display-xl mt-5 max-w-2xl">
                L&apos;ultima generazione, pronta a partire.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-paper/60">
              Modelli in pronta consegna e configurazioni su richiesta. Prenota un
              test drive e provala su strada.
            </p>
          </Reveal>
        </div>

        <RevealGroup className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4" stagger={0.12}>
          {newCars.map((car) => (
            <RevealItem key={car.id}>
              <CarCard car={car} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
