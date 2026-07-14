"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media query reattiva. Restituisce `null` sul server e al primo render di
 * hydration: il viewport lì non esiste, e inventarsi un `false` porterebbe a un
 * mismatch. Chi legge il valore deve trattare `null` come "non ancora noto":
 * di solito → comportati come desktop per il layout, ma NON avviare precarichi
 * pesanti.
 *
 * `useSyncExternalStore` invece di `useState` + `useEffect` perché una media
 * query è esattamente uno store esterno: React si sottoscrive e legge, senza
 * il render a cascata di un setState nell'effect.
 */
export function useMediaQuery(query: string): boolean | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore<boolean | null>(subscribe, getSnapshot, () => null);
}

/** Viewport stretto: sotto il breakpoint `lg` di Tailwind (1024px). */
export function useIsMobile(): boolean | null {
  return useMediaQuery("(max-width: 1023.98px)");
}

/**
 * Puntatore grossolano (dito) invece che fine (mouse). È il segnale giusto per
 * decidere se un'interazione va ripensata (hover assente, drag che compete con
 * lo scroll della pagina), mentre la larghezza dice solo quanto spazio c'è.
 */
export function useIsTouch(): boolean | null {
  return useMediaQuery("(pointer: coarse)");
}

type NetworkInfo = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (t: string, cb: () => void) => void;
  removeEventListener?: (t: string, cb: () => void) => void;
};

// `navigator.connection` è non-standard (solo Chromium): su Safari/Firefox è
// assente, e in quel caso non presumiamo una rete lenta.
const getConnection = (): NetworkInfo | undefined =>
  (navigator as Navigator & { connection?: NetworkInfo }).connection;

const SLOW_TYPES = new Set(["slow-2g", "2g", "3g"]);

/**
 * `true` quando l'utente ha chiesto di risparmiare dati o il browser segnala
 * una connessione lenta. Serve a non scaricare i megabyte di fotogrammi dello
 * stage auto su una rete mobile. `null` = non ancora noto (server/hydration).
 */
export function useSaveData(): boolean | null {
  const subscribe = useCallback((onChange: () => void) => {
    const c = getConnection();
    c?.addEventListener?.("change", onChange);
    return () => c?.removeEventListener?.("change", onChange);
  }, []);

  const getSnapshot = useCallback(() => {
    const c = getConnection();
    if (!c) return false;
    return !!c.saveData || SLOW_TYPES.has(c.effectiveType ?? "");
  }, []);

  return useSyncExternalStore<boolean | null>(subscribe, getSnapshot, () => null);
}

/**
 * Il precarico pesante (144 WebP dello spin + 61×6 fotogrammi dei reveal,
 * ~19 MB in tutto) ha senso solo dove c'è banda e schermo: desktop con mouse,
 * rete non a risparmio dati. Altrove i fotogrammi si scaricano su richiesta,
 * alla prima interazione che li usa davvero.
 *
 * Finché il client non ha risposto resta `false`: nessun precarico speculativo
 * durante l'hydration.
 */
export function useAllowHeavyPreload(): boolean {
  const isTouch = useIsTouch();
  const isMobile = useIsMobile();
  const saveData = useSaveData();
  if (isTouch === null || isMobile === null || saveData === null) return false;
  return !isTouch && !isMobile && !saveData;
}
