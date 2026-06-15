"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
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

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? "-110%" : 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={cn(
          "transition-colors duration-500",
          scrolled
            ? "border-b border-white/10 bg-ink/80 backdrop-blur-xl"
            : "bg-transparent",
        )}
      >
        <nav className="wrap flex h-[72px] items-center justify-between">
          <a href="#top" className="flex items-center gap-3" aria-label="Garden Cars — home">
            <span className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/20">
              <Image src="/brand/logo.jpg" alt="Garden Cars" fill sizes="40px" className="object-cover" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Garden<span className="text-racing-bright">Cars</span>
            </span>
          </a>

          <ul className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="font-display text-sm font-medium text-paper/70 transition-colors hover:text-paper"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a href={site.phoneHref} className="btn btn-primary hidden sm:inline-flex">
              Prenota un test drive
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
      <div className="tricolore-line h-[2px] w-full opacity-80" />

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
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="font-display block py-3 text-2xl font-medium text-paper/80 transition-colors hover:text-racing-bright"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <a href={site.phoneHref} className="btn btn-primary mt-4 justify-center">
                Prenota un test drive
              </a>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
