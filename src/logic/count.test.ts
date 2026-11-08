import { describe, expect, it } from "vitest";
import { countPossibleSecrets } from "./count.js";

describe("countPossibleSecrets", () => {
  describe("known values for the game's settings", () => {
    it.each([
      [2, 2, 2],
      [2, 8, 56],
      [3, 8, 336],
      [6, 8, 20160],
      [2, 10, 90],
      [4, 10, 5040],
      [6, 10, 151200],
      [2, 16, 240],
      [4, 16, 43680],
      [6, 16, 5765760],
    ])("length %i in base %i gives %i", (length, base, expected) => {
      expect(countPossibleSecrets(length, base)).toBe(expected);
    });
  });

  describe("edge cases", () => {
    it("counts exactly one empty secret for length 0", () => {
      expect(countPossibleSecrets(0, 10)).toBe(1);
    });

    it("counts one digit as the base itself", () => {
      expect(countPossibleSecrets(1, 10)).toBe(10);
    });

    it("counts all full-length permutations when length equals base", () => {
      expect(countPossibleSecrets(5, 5)).toBe(120);
    });

    it("returns 0 when length exceeds the number of available digits", () => {
      expect(countPossibleSecrets(3, 2)).toBe(0);
      expect(countPossibleSecrets(6, 2)).toBe(0);
    });
  });

  describe("recurrence", () => {
    const cases = Array.from({ length: 15 }, (_, i) => i + 2).flatMap((base) =>
      Array.from({ length: Math.min(base, 6) }, (_, i) => [i + 1, base] as const),
    );

    it.each(cases)(
      "count(%i, %i) equals base * count(length - 1, base - 1)",
      (length, base) => {
        expect(countPossibleSecrets(length, base)).toBe(
          base * countPossibleSecrets(length - 1, base - 1),
        );
      },
    );
  });

  describe("invalid input", () => {
    it.each([
      [-1, 10],
      [2.5, 10],
      [Number.NaN, 10],
      [2, -1],
      [2, 10.5],
      [2, Number.NaN],
    ])("throws RangeError for length %s and base %s", (length, base) => {
      expect(() => countPossibleSecrets(length, base)).toThrow(RangeError);
    });
  });

  describe("repeatability", () => {
    it("returns the same value on repeated calls", () => {
      expect(countPossibleSecrets(6, 16)).toBe(countPossibleSecrets(6, 16));
    });

    it("is not affected by the order of earlier calls", () => {
      const first = countPossibleSecrets(6, 16);
      countPossibleSecrets(2, 16);
      countPossibleSecrets(4, 10);

      expect(countPossibleSecrets(6, 16)).toBe(first);
      expect(countPossibleSecrets(2, 16)).toBe(240);
    });
  });
});
