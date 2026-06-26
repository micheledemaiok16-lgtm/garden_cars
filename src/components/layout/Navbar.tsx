"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { nav, site, isMenu, type NavItem } from "@/lib/site";
import { cn } from "@/lib/utils";

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className={cn("h-3 w-3 transition-transform", className)}
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Voce del menu mobile attualmente espansa (accordion)
  const [mobileSub, setMobileSub] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (!reduce) setHidden(y > last && y > 320 && !open);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open, reduce]);

  const closeMobile = () => {
    setOpen(false);
    setMobileSub(null);
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? "-110%" : 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={cn(
          "relative z-20 transition-colors duration-500",
          scrolled
            ? "border-b border-white/10 bg-ink/80 backdrop-blur-xl"
            : "bg-transparent",
        )}
      >
        <nav className="wrap flex h-[72px] items-center justify-between">
          <Link href="/#top" className="flex items-center gap-3" aria-label="Garden Cars, home">
            <span className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/20">
              <Image src="/brand/logo.jpg" alt="Garden Cars" fill sizes="40px" className="object-cover" />
            </span>
            <span className="font-logo -skew-x-6 whitespace-nowrap text-base font-normal tracking-tight text-paper">
              GARDEN&apos;S <span className="text-racing-bright">CARS</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-8 lg:flex xl:gap-12">
            {nav.map((item) => (
              <DesktopItem key={item.label} item={item} />
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a href={site.consultHref} className="btn btn-primary hidden whitespace-nowrap sm:inline-flex">
              Prenota una consulenza gratuita
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/20 lg:hidden"
              aria-label={open ? "Chiudi menu" : "Apri menu"}
              aria-expanded={open}
            >
              <div className="flex flex-col gap-[5px]">
                <span className={cn("h-[2px] w-5 bg-paper transition-transform", open && "translate-y-[7px] rotate-45")} />
                <span className={cn("h-[2px] w-5 bg-paper transition-opacity", open && "opacity-0")} />
                <span className={cn("h-[2px] w-5 bg-paper transition-transform", open && "-translate-y-[7px] -rotate-45")} />
              </div>
            </button>
          </div>
        </nav>
      </div>
      <div className="tricolore-line relative z-10 h-[2px] w-full opacity-80" />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="border-b border-white/10 bg-ink/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="wrap flex flex-col gap-1 py-6">
              {nav.map((item) =>
                isMenu(item) ? (
                  <li key={item.label}>
                    <button
                      onClick={() =>
                        setMobileSub((s) => (s === item.label ? null : item.label))
                      }
                      aria-expanded={mobileSub === item.label}
                      className="font-display flex w-full items-center justify-between py-3 text-2xl font-medium text-paper/80 transition-colors hover:text-racing-bright"
                    >
                      {item.label}
                      <Chevron className={cn(mobileSub === item.label && "rotate-180")} />
                    </button>
                    <AnimatePresence initial={false}>
                      {mobileSub === item.label && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden pl-4"
                        >
                          {item.children.map((c) => (
                            <li key={c.label}>
                              <a
                                href={c.href}
                                onClick={closeMobile}
                                className="font-display block border-l border-white/10 py-2.5 pl-4 text-lg font-medium text-paper/60 transition-colors hover:text-racing-bright"
                              >
                                {c.label}
                              </a>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                ) : (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={closeMobile}
                      className="font-display block py-3 text-2xl font-medium text-paper/80 transition-colors hover:text-racing-bright"
                    >
                      {item.label}
                    </a>
                  </li>
                ),
              )}
              <a href={site.consultHref} onClick={closeMobile} className="btn btn-primary mt-4 justify-center">
                Prenota una consulenza gratuita
              </a>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/** Voce del menu desktop: link semplice oppure tendina su hover/focus. */
function DesktopItem({ item }: { item: NavItem }) {
  if (!isMenu(item)) {
    return (
      <li>
        <a
          href={item.href}
          className="font-display whitespace-nowrap text-base font-medium text-paper/80 transition-colors hover:text-paper xl:text-lg"
        >
          {item.label}
        </a>
      </li>
    );
  }

  return (
    <li className="group relative">
      <button
        className="font-display flex items-center gap-1.5 whitespace-nowrap text-base font-medium text-paper/80 transition-colors hover:text-paper group-hover:text-paper xl:text-lg"
        aria-haspopup="true"
      >
        {item.label}
        <Chevron className="text-paper/50 group-hover:rotate-180" />
      </button>
      {/* pt-3 crea un ponte invisibile per non perdere l'hover scendendo */}
      <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <ul className="min-w-[190px] rounded-2xl border border-white/10 bg-ink/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {item.children.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                className="font-display block rounded-xl px-4 py-2.5 text-sm font-medium text-paper/70 transition-colors hover:bg-white/[0.06] hover:text-racing-bright"
              >
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
