import { describe, it, expect } from "vitest";
import {
  SPIN,
  SPIN_ASSET_VERSION,
  normalizeFrame,
  frameIndex,
  resolveSpot,
  frameDistance,
} from "./carSpin";

describe("SPIN config", () => {
  it("ha 144 frame e arco 360 con wrap (loop vero)", () => {
    expect(SPIN.frameCount).toBe(144);
    expect(SPIN.arcDegrees).toBe(360);
    expect(SPIN.wrap).toBe(true);
  });
  it("srcFor pad a 3 cifre e versiona gli asset", () => {
    expect(SPIN.srcFor(0)).toBe(
      `/home/spin/frame-000.webp?v=${SPIN_ASSET_VERSION}`,
    );
    expect(SPIN.srcFor(143)).toBe(
      `/home/spin/frame-143.webp?v=${SPIN_ASSET_VERSION}`,
    );
  });
});

describe("normalizeFrame", () => {
  it("clampa fuori range quando wrap=false", () => {
    expect(normalizeFrame(-3, 36, false)).toBe(0);
    expect(normalizeFrame(40, 36, false)).toBe(35);
    expect(normalizeFrame(12.4, 36, false)).toBeCloseTo(12.4);
  });
  it("wrappa quando wrap=true", () => {
    expect(normalizeFrame(-1, 36, true)).toBe(35);
    expect(normalizeFrame(36, 36, true)).toBe(0);
  });
});

describe("frameIndex", () => {
  it("arrotonda all'intero più vicino", () => {
    expect(frameIndex(12.4, 36, false)).toBe(12);
    expect(frameIndex(12.6, 36, false)).toBe(13);
  });
});

describe("resolveSpot", () => {
  const samples = [
    { frame: 0, x: 10, y: 50, visible: true },
    { frame: 10, x: 30, y: 50, visible: true },
    { frame: 20, x: 50, y: 50, visible: false },
  ];
  it("interpola x/y tra due campioni", () => {
    const r = resolveSpot(samples, 5);
    expect(r.x).toBeCloseTo(20);
    expect(r.opacity).toBeCloseTo(1);
  });
  it("sfuma l'opacità verso un campione non visibile", () => {
    const r = resolveSpot(samples, 15);
    expect(r.x).toBeCloseTo(40);
    expect(r.opacity).toBeCloseTo(0.5);
  });
  it("usa gli estremi fuori range", () => {
    expect(resolveSpot(samples, -5).x).toBeCloseTo(10);
    expect(resolveSpot(samples, 99).opacity).toBeCloseTo(0);
  });
});

describe("frameDistance", () => {
  it("distanza semplice senza wrap", () => {
    expect(frameDistance(0, 5, 144, false)).toBe(5);
    expect(frameDistance(5, 0, 144, false)).toBe(-5);
  });
  it("prende il percorso più corto attraverso la giunzione (wrap)", () => {
    expect(frameDistance(143, 1, 144, true)).toBe(2);
    expect(frameDistance(1, 143, 144, true)).toBe(-2);
  });
  it("frame identici → 0", () => {
    expect(frameDistance(30, 30, 144, true)).toBe(0);
  });
});
