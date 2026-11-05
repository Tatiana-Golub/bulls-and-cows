import { describe, expect, it } from "vitest";
import { evaluateGuess } from "./evaluate.js";

describe("evaluateGuess", () => {
  describe("decimal", () => {
    it.each([
      ["1234", "1234", 4, 0],
      ["1234", "5678", 0, 0],
      ["1234", "4321", 0, 4],
      ["1234", "1243", 2, 2],
      ["1234", "1567", 1, 0],
      ["1234", "5671", 0, 1],
      ["1234", "1325", 1, 2],
    ])("secret %s, guess %s gives %i bulls and %i cows", (secret, guess, bulls, cows) => {
      expect(evaluateGuess(secret, guess)).toStrictEqual({ bulls, cows });
    });

    it("handles leading zeros", () => {
      expect(evaluateGuess("0123", "0123")).toStrictEqual({ bulls: 4, cows: 0 });
      expect(evaluateGuess("0123", "1023")).toStrictEqual({ bulls: 2, cows: 2 });
      expect(evaluateGuess("0123", "0456")).toStrictEqual({ bulls: 1, cows: 0 });
    });

    it("compares digits as characters, not as numbers", () => {
      expect(evaluateGuess("0123", "3210")).toStrictEqual({ bulls: 0, cows: 4 });
    });
  });

  describe("other lengths and bases", () => {
    it("works for binary", () => {
      expect(evaluateGuess("01", "01")).toStrictEqual({ bulls: 2, cows: 0 });
      expect(evaluateGuess("01", "10")).toStrictEqual({ bulls: 0, cows: 2 });
    });

    it("works for octal", () => {
      expect(evaluateGuess("7051", "7015")).toStrictEqual({ bulls: 2, cows: 2 });
    });

    it("works for the longest secret", () => {
      expect(evaluateGuess("012345", "012345")).toStrictEqual({ bulls: 6, cows: 0 });
      expect(evaluateGuess("012345", "543210")).toStrictEqual({ bulls: 0, cows: 6 });
    });
  });

  describe("hexadecimal case-insensitivity", () => {
    it("treats uppercase guess as equal to lowercase secret", () => {
      expect(evaluateGuess("a3f9", "A3F9")).toStrictEqual({ bulls: 4, cows: 0 });
    });

    it("counts cows across different cases", () => {
      expect(evaluateGuess("a3f9", "9F3A")).toStrictEqual({ bulls: 0, cows: 4 });
    });

    it("handles mixed case on both sides", () => {
      expect(evaluateGuess("aB3f", "Ab3F")).toStrictEqual({ bulls: 4, cows: 0 });
      expect(evaluateGuess("aB3f", "Fb3a")).toStrictEqual({ bulls: 2, cows: 2 });
    });
  });

  describe("properties", () => {
    const pairs = [
      ["1234", "1243"],
      ["0123", "3210"],
      ["a3f9", "9f3a"],
      ["012345", "105432"],
    ] as const;

    it.each(pairs)("bulls + cows never exceeds the length (%s, %s)", (secret, guess) => {
      const { bulls, cows } = evaluateGuess(secret, guess);

      expect(bulls + cows).toBeLessThanOrEqual(secret.length);
    });

    it.each(pairs)("is symmetric for unique digits (%s, %s)", (secret, guess) => {
      expect(evaluateGuess(secret, guess)).toStrictEqual(evaluateGuess(guess, secret));
    });

    it("returns exactly the guess length in bulls only for an identical guess", () => {
      expect(evaluateGuess("1234", "1234").bulls).toBe(4);
      expect(evaluateGuess("1234", "1235").bulls).not.toBe(4);
    });

    it("returns the same result on repeated calls", () => {
      expect(evaluateGuess("1234", "1325")).toStrictEqual(evaluateGuess("1234", "1325"));
    });

    it("returns a new object each time", () => {
      expect(evaluateGuess("1234", "1234")).not.toBe(evaluateGuess("1234", "1234"));
    });
  });

  describe("invalid input", () => {
    it.each([
      ["1234", "123"],
      ["1234", "12345"],
      ["1234", ""],
      ["", "1234"],
    ])("throws RangeError when lengths differ (%j, %j)", (secret, guess) => {
      expect(() => evaluateGuess(secret, guess)).toThrow(RangeError);
    });
  });
});
