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
// Ritmo di default del tween, ease-out esponenziale (tarato sull'apertura
// sportello). I reveal con corse di camera lunghe impostano openMs/closeMs in
// config → scrub LINEARE a tempo (ritmo costante, come riprodurre il video).
const OPEN_K = 0.14; // ease-out apertura
const CLOSE_K = 0.16; // chiusura un filo più rapida
const LOOP_HOLD_MS = 1000; // pausa di default agli estremi del loop ping-pong

/**
 * Overlay di un reveal per-servizio (sportello per "Interni", cofano per
 * "Motore"). Sta SOPRA lo spin nel box dello stage (stesso object-contain) e
 * mostra una sequenza WebP "scrubbata"
 * da un tween: apertura = progress 0→1, chiusura = reverse 1→0. Nessun seek
 * video: solo swap di <img> (istantaneo). Manipolazione diretta del DOM per non
 * ri-renderizzare a ogni frame.
 */
export default function CarDoorReveal({
  revealId,
  open,
  instant = false,
  reduce,
  eagerPreload = false,
  onClosed,
}: {
  revealId: string;
  open: boolean;
  instant?: boolean;
  reduce: boolean | null;
  /** Precarica i fotogrammi subito invece che alla prima apertura. Vero solo
   *  dove ha senso spendere la banda (desktop, rete non a risparmio dati): i
   *  sei reveal della home valgono insieme ~15 MB. */
  eagerPreload?: boolean;
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
  const lastTickRef = useRef(0); // timestamp del tick precedente (per il dt)
  const loopDirRef = useRef<1 | -1>(1); // verso corrente del loop ping-pong
  const loopHoldUntilRef = useRef(0); // fine della pausa agli estremi del loop
  const lastIdxRef = useRef(-1);
  const closedNotifiedRef = useRef(true); // niente notifica spuria al mount
  const onClosedRef = useRef(onClosed);
  const preloadRef = useRef<HTMLImageElement[]>([]);
  const preloadStartedRef = useRef(false);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const tickRef = useRef<() => void>(() => {});

  // Precarico dei fotogrammi dell'apertura (come Car360 con i frame dello
  // spin): allo swap sono già in cache, niente lampo. On-demand alla prima
  // apertura, tranne dove `eagerPreload` autorizza a spenderli in anticipo.
  const ensurePreload = () => {
    if (preloadStartedRef.current || !reveal) return;
    preloadStartedRef.current = true;
    const imgs: HTMLImageElement[] = [];
    for (let i = 0; i < reveal.frameCount; i++) {
      const im = new Image();
      im.src = revealFrameSrc(reveal, i);
      imgs.push(im);
    }
    preloadRef.current = imgs;
  };

  // Il loop rAF gira solo quando c'è qualcosa da animare: a riposo si spegne da
  // sé (vedi `idle` nel tick) e riparte all'apertura. Senza questo, i sei
  // reveal della home terrebbero sei loop a 60 fps vivi per sempre.
  const startLoop = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastTickRef.current = 0;
    rafRef.current = requestAnimationFrame(() => tickRef.current());
  };

  // Tieni i ref allineati alle prop senza far ripartire il loop rAF.
  useEffect(() => {
    openRef.current = open;
    if (open) {
      closedNotifiedRef.current = false;
      // Ogni apertura fa ripartire l'eventuale loop dall'andata, senza pausa.
      loopDirRef.current = 1;
      loopHoldUntilRef.current = 0;
      ensurePreload();
      startLoop();
    }
    // ensurePreload/startLoop sono idempotenti e leggono solo ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (eagerPreload) ensurePreload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eagerPreload, reveal]);
  useEffect(() => {
    instantRef.current = instant;
  }, [instant]);
  useEffect(() => {
    reduceRef.current = !!reduce;
  }, [reduce]);
  useEffect(() => {
    onClosedRef.current = onClosed;
  }, [onClosed]);

  // Applica opacità con o senza transizione (instant/reduce = niente dissolvenza).
  const setVisible = (img: HTMLImageElement, visible: boolean, snap: boolean) => {
    img.style.transition = snap ? "none" : `opacity ${FADE_MS}ms ease`;
    img.style.opacity = visible ? "1" : "0";
  };

  useEffect(() => {
    if (!reveal) return;
    const tick = () => {
      const img = imgRef.current;
      if (img) {
        const now = performance.now();
        // dt clampato: dopo un tab nascosto/riattivato lo scrub a tempo non
        // deve "saltare" in avanti di secondi in un tick solo.
        const dt = Math.min(now - (lastTickRef.current || now), 100);
        lastTickRef.current = now;
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
            if (reveal.loop && reveal.openMs) {
              // Loop ping-pong: 0→1, pausa, 1→0, pausa, e ricomincia.
              if (now >= loopHoldUntilRef.current) {
                const next = p + loopDirRef.current * (dt / reveal.openMs);
                if (next >= 1) {
                  progressRef.current = 1;
                  loopDirRef.current = -1;
                  loopHoldUntilRef.current =
                    now + (reveal.loopHoldMs ?? LOOP_HOLD_MS);
                } else if (next <= 0) {
                  progressRef.current = 0;
                  loopDirRef.current = 1;
                  loopHoldUntilRef.current =
                    now + (reveal.loopHoldMs ?? LOOP_HOLD_MS);
                } else {
                  progressRef.current = next;
                }
              }
            } else {
              // openMs → avanzamento lineare a tempo; altrimenti ease-out.
              const next = reveal.openMs
                ? Math.min(1, p + dt / reveal.openMs)
                : p + (1 - p) * OPEN_K;
              progressRef.current = 1 - next < 0.004 ? 1 : next;
            }
          }
        } else {
          const p = progressRef.current;
          const next = reveal.closeMs
            ? Math.max(0, p - dt / reveal.closeMs)
            : p + (0 - p) * CLOSE_K;
          progressRef.current = next < 0.004 ? 0 : next;
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

        // Chiuso, richiusura finita, overlay già svanito: non c'è più nulla da
        // animare → spegni il loop. Lo riaccende la prossima apertura.
        if (
          !isOpen &&
          progressRef.current === 0 &&
          !shownRef.current &&
          closedNotifiedRef.current
        ) {
          runningRef.current = false;
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tickRef.current = tick;
    // Al mount l'overlay è chiuso: nessun loop finché non serve. Se il
    // componente si rimonta mentre è aperto, riparte da qui.
    if (openRef.current || progressRef.current > 0) startLoop();
    return () => {
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
    };
  }, [reveal]);

  if (!reveal) return null; // asset assente → fallback silenzioso: nessun overlay

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={revealFrameSrc(reveal, 0)}
      alt={reveal.alt}
      draggable={false}
      className="pointer-events-none absolute inset-0 z-30 h-full w-full object-contain"
      style={{ opacity: 0, transition: `opacity ${FADE_MS}ms ease` }}
    />
  );
}
