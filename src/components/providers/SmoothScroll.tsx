"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Smooth scroll globale (Lenis) sincronizzato con GSAP ScrollTrigger.
 * Disattivato se l'utente preferisce ridurre il movimento.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Porta in vista un'ancora (#id) con offset per la navbar fissa.
    const scrollToHash = (hash: string, immediate = false) => {
      if (!hash || hash === "#") return false;
      let el: Element | null = null;
      try {
        el = document.querySelector(hash);
      } catch {
        return false; // hash non valido come selettore
      }
      if (!el) return false;
      lenis.scrollTo(el as HTMLElement, { offset: -72, immediate });
      return true;
    };

    // Anchor links → smooth scroll via Lenis quando l'ancora è in questa pagina;
    // se punta a un'altra pagina (es. /trattamenti#... da home) lascia navigare.
    const onClick = (e: MouseEvent) => {
      // Ignora click "speciali" (nuova scheda, ecc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }
      const target = (e.target as HTMLElement)?.closest(
        'a[href]',
      ) as HTMLAnchorElement | null;
      if (!target || target.target === "_blank") return;
      const href = target.getAttribute("href");
      if (!href || !href.includes("#")) return;

      const url = new URL(href, window.location.href);
      // Pagina diversa: lascia che il browser/Next gestisca la navigazione.
      if (url.pathname !== window.location.pathname) return;

      if (scrollToHash(url.hash)) {
        e.preventDefault();
        history.pushState(null, "", url.hash);
      }
    };
    document.addEventListener("click", onClick);

    // Deep-link: se l'URL contiene già un'ancora, portala in vista al caricamento.
    if (window.location.hash) {
      requestAnimationFrame(() => scrollToHash(window.location.hash, true));
    }

    ScrollTrigger.refresh();

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
