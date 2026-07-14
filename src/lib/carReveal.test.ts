import { describe, it, expect } from "vitest";
import {
  REVEAL_ASSET_VERSION,
  getReveal,
  revealFrameSrc,
  revealProgressToFrame,
} from "./carReveal";

describe("getReveal", () => {
  it("restituisce la config per restauro-pelle", () => {
    const r = getReveal("restauro-pelle");
    expect(r).toBeTruthy();
    expect(r?.anchorFrame).toBe(4);
    expect(r?.alt).toContain("cognac");
  });
  it("restituisce la config per centraline (cofano/motore)", () => {
    const r = getReveal("centraline");
    expect(r).toBeTruthy();
    expect(r?.anchorFrame).toBe(18);
    expect(r?.dir).toBe("/home/centralina-reveal");
  });
  it("restituisce la config per antifurto (allarme in loop)", () => {
    const r = getReveal("antifurto");
    expect(r).toBeTruthy();
    expect(r?.anchorFrame).toBe(136);
    expect(r?.dir).toBe("/home/antifurto-reveal");
    expect(r?.loop).toBe(true);
  });
  it("undefined per id sconosciuti", () => {
    // Ormai tutti i servizi hanno un reveal: il caso "senza" resta solo
    // per id inesistenti (fallback silenzioso di CarDoorReveal).
    expect(getReveal("servizio-inesistente")).toBeUndefined();
  });
});

describe("revealFrameSrc", () => {
  it("pad a 3 cifre, cartella e versione", () => {
    const r = getReveal("restauro-pelle")!;
    expect(revealFrameSrc(r, 0)).toBe(
      `/home/interni-reveal/frame-000.webp?v=${REVEAL_ASSET_VERSION}`,
    );
  });
  it("clampa fuori range", () => {
    const r = getReveal("restauro-pelle")!;
    expect(revealFrameSrc(r, -5)).toContain("frame-000.webp");
    expect(revealFrameSrc(r, 9999)).toContain(
      `frame-${String(r.frameCount - 1).padStart(3, "0")}.webp`,
    );
  });
});

describe("revealProgressToFrame", () => {
  it("mappa 0→0, 1→ultimo, 0.5→metà", () => {
    expect(revealProgressToFrame(0, 48)).toBe(0);
    expect(revealProgressToFrame(1, 48)).toBe(47);
    expect(revealProgressToFrame(0.5, 48)).toBe(24);
  });
  it("clampa oltre gli estremi", () => {
    expect(revealProgressToFrame(-1, 48)).toBe(0);
    expect(revealProgressToFrame(2, 48)).toBe(47);
  });
});
