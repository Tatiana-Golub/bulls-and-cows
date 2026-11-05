import { describe, expect, it, vi } from "vitest";
import { ALPHABET } from "./digits.js";
import { generateSecret } from "./secret.js";

const constant = (value: number) => () => value;

const sequence = (...values: number[]) => {
  let index = 0;
  return () => values[index++ % values.length] ?? 0;
};

const seededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

describe("generateSecret", () => {
  describe("with a deterministic random source", () => {
    it("picks the first remaining digit each time when random is 0", () => {
      expect(generateSecret(4, 10, constant(0))).toBe("0123");
    });

    it("picks the last remaining digit each time when random is close to 1", () => {
      expect(generateSecret(4, 10, constant(0.999))).toBe("9876");
    });

    it("maps each random value to an index in the remaining digits", () => {
      expect(generateSecret(3, 10, sequence(0.5, 0, 0.5))).toBe("506");
    });

    it("keeps a leading zero", () => {
      expect(generateSecret(3, 10, constant(0))).toBe("012");
    });

    it("uses lowercase letters for hexadecimal", () => {
      expect(generateSecret(3, 16, constant(0.999))).toBe("fed");
    });

    it("works for binary", () => {
      expect(generateSecret(2, 2, constant(0))).toBe("01");
      expect(generateSecret(2, 2, constant(0.9))).toBe("10");
    });

    it("uses every digit when length equals base", () => {
      expect(generateSecret(5, 5, constant(0))).toBe("01234");
    });

    it("returns the same secret for the same random sequence", () => {
      const first = generateSecret(4, 16, seededRandom(42));
      const second = generateSecret(4, 16, seededRandom(42));

      expect(first).toBe(second);
    });

    it("asks the random source exactly once per digit", () => {
      const random = vi.fn(() => 0);

      generateSecret(4, 10, random);

      expect(random).toHaveBeenCalledTimes(4);
    });
  });

  describe("properties", () => {
    const settings = [
      [2, 2],
      [2, 8],
      [6, 8],
      [4, 10],
      [6, 10],
      [6, 16],
    ] as const;

    it.each(settings)(
      "length %i, base %i: valid and unique for many seeds",
      (length, base) => {
        const allowed = new Set(ALPHABET.slice(0, base));

        for (let seed = 1; seed <= 200; seed++) {
          const secret = generateSecret(length, base, seededRandom(seed));

          expect(secret).toHaveLength(length);
          expect(new Set(secret).size).toBe(length);
          expect([...secret].every((char) => allowed.has(char))).toBe(true);
        }
      },
    );

    it("uses Math.random by default", () => {
      const secret = generateSecret(4, 10);

      expect(secret).toHaveLength(4);
      expect(new Set(secret).size).toBe(4);
    });

    it("calls Math.random when no source is given", () => {
      const spy = vi.spyOn(Math, "random").mockReturnValue(0);

      expect(generateSecret(3, 10)).toBe("012");

      spy.mockRestore();
    });
  });

  describe("invalid input", () => {
    it.each([
      [0, 10],
      [-1, 10],
      [2.5, 10],
      [Number.NaN, 10],
      [3, 2],
      [2, 17],
      [2, 1],
      [2, 10.5],
    ])("throws RangeError for length %s and base %s", (length, base) => {
      expect(() => generateSecret(length, base, constant(0))).toThrow(RangeError);
    });
  });
});
