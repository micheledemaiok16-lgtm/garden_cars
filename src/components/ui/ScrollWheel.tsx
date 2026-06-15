"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

/**
 * Elemento circolare che ruota in base allo scroll (GSAP ScrollTrigger, scrub).
 * Una maschera radiale sfuma gli angoli quadrati dell'immagine, così si fonde
 * su qualsiasi sfondo. Riutilizzabile con immagini diverse (cerchione, pad…).
 * Rispetta reduced-motion.
 *
 * fadeStart/fadeEnd: % del raggio dove la maschera inizia/finisce a sfumare.
 * Per soggetti che riempiono il riquadro usa valori alti (es. 82/97).
 */
export function ScrollWheel({
  className,
  src = "/generated/rim.png",
  size = 420,
  spin = 540,
  opacity = 1,
  fadeStart = 60,
  fadeEnd = 67,
}: {
  className?: string;
  src?: string;
  size?: number;
  spin?: number;
  opacity?: number;
  fadeStart?: number;
  fadeEnd?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wheel = ref.current?.querySelector<HTMLElement>("[data-wheel]");
    if (!wheel) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wheel,
        { rotate: 0 },
        {
          rotate: spin,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, [spin]);

  const mask = `radial-gradient(circle, black ${fadeStart}%, transparent ${fadeEnd}%)`;

  return (
    <div ref={ref} className={cn("pointer-events-none select-none", className)} aria-hidden>
      <div
        data-wheel
        style={{
          width: size,
          height: size,
          opacity,
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
        className="relative"
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 60vw, 480px"
          className="object-contain"
        />
      </div>
    </div>
  );
}
