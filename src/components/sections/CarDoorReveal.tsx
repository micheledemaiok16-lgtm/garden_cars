"use client";

import { useEffect, useRef } from "react";
import {
  getReveal,
  revealFrameSrc,
  revealProgressToFrame,
} from "@/lib/carReveal";

// Durata della dissolvenza spin↔clip (ms). Il clip generato è un PRIMO PIANO
// della portiera (seedance ha reincorniciato), quindi non combacia pixel-per-pixel
// col 3/4 largo dello spin: la comparsa/sparizione è una dissolvenza morbida
// ("push-in registico"), non uno swap secco. La sequenza è: dissolvi sul frame 0
// (porta chiusa) → APRI (scrub) → tieni → RICHIUDI (scrub) → dissolvi via (lo spin
// riprende sotto). Il gate temporale evita che la porta si apra "dentro" la
// dissolvenza (immagini sovrapposte torbide).
const FADE_MS = 300;
const OPEN_K = 0.14; // ease-out apertura
const CLOSE_K = 0.16; // chiusura un filo più rapida

/**
 * Overlay dell'apertura sportello (servizio "Interni"). Sta SOPRA lo spin nel
 * box di Car360 (stesso object-contain) e mostra una sequenza WebP "scrubbata"
 * da un tween: apertura = progress 0→1, chiusura = reverse 1→0. Nessun seek
 * video: solo swap di <img> (istantaneo). Manipolazione diretta del DOM per non
 * ri-renderizzare a ogni frame.
 */
export default function CarDoorReveal({
  revealId,
  open,
  instant = false,
  reduce,
  onClosed,
}: {
  revealId: string;
  open: boolean;
  instant?: boolean;
  reduce: boolean | null;
  onClosed?: () => void;
}) {
  const reveal = getReveal(revealId);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const progressRef = useRef(0); // 0 = chiuso (frame 0), 1 = aperto (interno)
  const openRef = useRef(open);
  const instantRef = useRef(instant);
  const reduceRef = useRef(!!reduce);
  const shownRef = useRef(false); // overlay attualmente visibile (opacity 1)
  const fadeStartRef = useRef(0); // istante d'inizio della dissolvenza in ingresso
  const lastIdxRef = useRef(-1);
  const closedNotifiedRef = useRef(true); // niente notifica spuria al mount
  const onClosedRef = useRef(onClosed);
  const preloadRef = useRef<HTMLImageElement[]>([]);

  // Tieni i ref allineati alle prop senza far ripartire il loop rAF.
  useEffect(() => {
    openRef.current = open;
    if (open) closedNotifiedRef.current = false;
  }, [open]);
  useEffect(() => {
    instantRef.current = instant;
  }, [instant]);
  useEffect(() => {
    reduceRef.current = !!reduce;
  }, [reduce]);
  useEffect(() => {
    onClosedRef.current = onClosed;
  }, [onClosed]);

  // Precarico dei fotogrammi dell'apertura (come Car360 con i frame dello spin):
  // allo swap sono già in cache, niente lampo.
  useEffect(() => {
    if (!reveal) return;
    const imgs: HTMLImageElement[] = [];
    for (let i = 0; i < reveal.frameCount; i++) {
      const im = new Image();
      im.src = revealFrameSrc(reveal, i);
      imgs.push(im);
    }
    preloadRef.current = imgs;
  }, [reveal]);

  // Applica opacità con o senza transizione (instant/reduce = niente dissolvenza).
  const setVisible = (img: HTMLImageElement, visible: boolean, snap: boolean) => {
    img.style.transition = snap ? "none" : `opacity ${FADE_MS}ms ease`;
    img.style.opacity = visible ? "1" : "0";
  };

  useEffect(() => {
    if (!reveal) return;
    let raf = 0;
    const tick = () => {
      const img = imgRef.current;
      if (img) {
        const now = performance.now();
        const isOpen = openRef.current;
        const reduceNow = reduceRef.current;
        const instantNow = instantRef.current;

        // Visibilità: visibile se aperto o se la porta non è ancora del tutto
        // richiusa. Al passaggio non-visibile→visibile parte la dissolvenza in
        // ingresso (di cui il gate temporale aspetta la fine prima di aprire).
        const wantVisible = isOpen || progressRef.current > 0.001;
        if (wantVisible !== shownRef.current) {
          shownRef.current = wantVisible;
          setVisible(img, wantVisible, reduceNow || (instantNow && !wantVisible));
          if (wantVisible) fadeStartRef.current = now;
        }

        // Progressione del tween.
        if (reduceNow || (instantNow && !isOpen)) {
          progressRef.current = isOpen ? 1 : 0; // reduce o chiusura istantanea (drag)
        } else if (isOpen) {
          // apri solo dopo che la dissolvenza in ingresso è completa
          if (now - fadeStartRef.current >= FADE_MS) {
            const p = progressRef.current;
            const next = p + (1 - p) * OPEN_K;
            progressRef.current = Math.abs(1 - next) < 0.004 ? 1 : next;
          }
        } else {
          const p = progressRef.current;
          const next = p + (0 - p) * CLOSE_K;
          progressRef.current = Math.abs(next) < 0.004 ? 0 : next;
        }

        if (shownRef.current) {
          const idx = revealProgressToFrame(progressRef.current, reveal.frameCount);
          if (idx !== lastIdxRef.current) {
            lastIdxRef.current = idx;
            img.src = revealFrameSrc(reveal, idx);
          }
        }

        // Chiusura completata: la porta è tornata a frame 0 → notifica una volta
        // (il genitore fa ripartire lo spin, che riappare sotto la dissolvenza).
        if (!isOpen && progressRef.current === 0 && !closedNotifiedRef.current) {
          closedNotifiedRef.current = true;
          onClosedRef.current?.();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reveal]);

  if (!reveal) return null; // asset assente → fallback silenzioso: nessun overlay

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={revealFrameSrc(reveal, 0)}
      alt={`Abitacolo restaurato in pelle ${reveal.seatColor}: sedili e volante nuovi`}
      draggable={false}
      className="pointer-events-none absolute inset-0 z-30 h-full w-full object-contain"
      style={{ opacity: 0, transition: `opacity ${FADE_MS}ms ease` }}
    />
  );
}
