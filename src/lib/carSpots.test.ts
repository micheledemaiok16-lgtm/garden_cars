import { describe, it, expect } from "vitest";
import { carSpots } from "./carSpots";
import { treatments } from "./treatments";
import { SPIN } from "./carSpin";

describe("carSpots", () => {
  it("copre i 5 servizi mappati", () => {
    expect(carSpots.map((s) => s.id).sort()).toEqual(
      ["car-detailing", "centraline", "lucidatura", "restauro-pelle", "trattamento-vetri"].sort(),
    );
  });
  it("ogni id esiste in treatments.ts", () => {
    for (const s of carSpots) {
      expect(treatments.some((t) => t.id === s.id)).toBe(true);
    }
  });
  it("campioni ordinati e dentro il range dei frame", () => {
    for (const s of carSpots) {
      expect(s.samples.length).toBeGreaterThan(0);
      for (let i = 1; i < s.samples.length; i++) {
        expect(s.samples[i].frame).toBeGreaterThan(s.samples[i - 1].frame);
      }
      for (const smp of s.samples) {
        expect(smp.frame).toBeGreaterThanOrEqual(0);
        expect(smp.frame).toBeLessThanOrEqual(SPIN.frameCount - 1);
      }
      expect(s.anchorFrame).toBeGreaterThanOrEqual(0);
      expect(s.anchorFrame).toBeLessThanOrEqual(SPIN.frameCount - 1);
    }
  });
});
