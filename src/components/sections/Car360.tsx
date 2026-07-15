"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SPIN_ASSET_VERSION } from "@/lib/carSpin";

// Deve combaciare con FADE_MS di CarDoorReveal (300 ms): le due dissolvenze si
// incrociano — lo spin svanisce mentre il reveal compare, così non si vedono
// mai due auto ad angoli diversi sovrapposte.
const FADE_MS = 300;

/**
 * Stage dell'auto: un VIDEO in loop, PASSIVO. Il file è un giro 360° vero
 * (start=end), riprodotto a velocità nativa (playbackRate 1.0: un rate ≠ 1
 * introduce judder contro il refresh del monitor). Nessuna interazione, nessun
 * loop rAF, nessun seek: il browser lo compone in GPU e basta.
 *
 * `dimmed` (= un reveal è in scena) lo fa svanire; il video però continua a
 * girare sotto, così alla chiusura del reveal riappare già in movimento.
 *
 * La dissolvenza dei bordi verso il nero (#000) della sezione è BAKATA
 * nell'asset: niente overlay né CSS mask sul <video> — la mask disattiverebbe
 * il compositing accelerato dalla GPU.
 */
export default function Car360({
  reduce,
  dimmed,
  children,
}: {
  reduce: boolean | null;
  dimmed: boolean;
  children?: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  // Il video (4,7 MB) viene agganciato solo quando la sezione si avvicina al
  // viewport: chi non scorre fin qui non lo scarica affatto. Una volta sola:
  // `near` non torna mai a false, o riscaricheremmo il file a ogni passaggio.
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNear(true); // niente IO (browser antico): carica e vai
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Aggiungere un <source> a un <video> già montato non fa partire il download
  // da solo: va chiesto esplicitamente con load().
  useEffect(() => {
    if (near) videoRef.current?.load();
  }, [near]);

  // Fuori dal viewport il video va in pausa (niente decodifica a vuoto).
  // Con prefers-reduced-motion non parte mai: resta il poster.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || reduce || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        const v = videoRef.current;
        if (!v) return;
        if (e.isIntersecting) {
          const p = v.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    // Niente touch-none / cursor-grab: lo stage non è più interattivo, il dito
    // ci scorre sopra come su qualunque altra parte della pagina.
    // L'auto in 16/9 su un telefono sarebbe alta ~210px: sotto sm passiamo a
    // 4/3, che le dà spazio reale senza sfondare il viewport.
    <div
      ref={boxRef}
      className="relative aspect-[4/3] w-full select-none sm:aspect-[16/9]"
    >
      <video
        ref={videoRef}
        muted
        playsInline
        loop
        autoPlay={!reduce}
        preload="auto"
        poster={`/home/spin/spin-poster.webp?v=${SPIN_ASSET_VERSION}`}
        aria-label="Audi nera Garden's Cars che ruota su fondo scuro"
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        style={{
          opacity: dimmed ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      >
        {near && (
          <source
            src={`/home/spin/spin-loop.mp4?v=${SPIN_ASSET_VERSION}`}
            type="video/mp4"
          />
        )}
      </video>

      {/* Vignettatura: spegne verso il nero (#000, lo stesso a cui sfuma il
          video) tutto il "pavimento studio" bakato nell'asset — non solo
          l'alone diffuso, ma soprattutto l'ANELLO della piattaforma girevole
          che si vede sul pavimento e sembra "muoversi" mentre l'auto ruota.
          L'anello è vicino all'auto, quindi la sfumatura parte stretta
          (trasparente fino al 34%, nero pieno al 66%): abbastanza aggressiva da
          coprire l'anello a ogni angolo, ma tarata a vista su muso/fiancata/tre
          quarti perché non intacchi carrozzeria e ruote. È un div SOPRA il
          <video>, NON una CSS mask sul video (quella spegnerebbe il compositing
          GPU e riporterebbe il judder). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(88% 72% at 50% 40%, transparent 34%, #000 66%)",
        }}
      />

      {children}
    </div>
  );
}
