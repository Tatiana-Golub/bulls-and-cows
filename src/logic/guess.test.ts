import { describe, expect, it } from "vitest";
import { isValidGuess } from "./guess.js";

describe("isValidGuess", () => {
  describe("valid guesses", () => {
    it.each([
      ["12", 2, 10],
      ["0123", 4, 10],
      ["9876", 4, 10],
      ["01", 2, 2],
      ["10", 2, 2],
      ["01234567", 8, 8],
      ["a3f9", 4, 16],
      ["0123456789abcdef".slice(0, 6), 6, 16],
    ])("accepts %j (length %i, base %i)", (guess, length, base) => {
      expect(isValidGuess(guess, length, base)).toBe(true);
    });

    it("accepts a leading zero", () => {
      expect(isValidGuess("0123", 4, 10)).toBe(true);
    });

    it("accepts uppercase hex digits", () => {
      expect(isValidGuess("A3F9", 4, 16)).toBe(true);
    });

    it("accepts mixed-case hex digits", () => {
      expect(isValidGuess("aB3f", 4, 16)).toBe(true);
    });
  });

  describe("length", () => {
    it.each(["1", "123", "12345"])("rejects %j when length is 4", (guess) => {
      expect(isValidGuess(guess, 4, 10)).toBe(false);
    });

    it("rejects the empty string", () => {
      expect(isValidGuess("", 4, 10)).toBe(false);
    });

    it("rejects a guess that is too long", () => {
      expect(isValidGuess("1234", 3, 10)).toBe(false);
    });
  });

  describe("characters", () => {
    it.each([
      ["12", 2, 2],
      ["18", 2, 8],
      ["1a", 2, 10],
      ["1g", 2, 16],
      ["1-", 2, 10],
      ["1 ", 2, 10],
      ["1.", 2, 10],
    ])("rejects %j (length %i, base %i)", (guess, length, base) => {
      expect(isValidGuess(guess, length, base)).toBe(false);
    });

    it("does not trim whitespace", () => {
      expect(isValidGuess(" 123", 3, 10)).toBe(false);
    });
  });

  describe("repeated digits", () => {
    it.each([
      ["11", 2, 10],
      ["1213", 4, 10],
      ["1231", 4, 10],
      ["00", 2, 2],
      ["aa", 2, 16],
    ])("rejects %j (length %i, base %i)", (guess, length, base) => {
      expect(isValidGuess(guess, length, base)).toBe(false);
    });

    it("treats different cases of the same hex digit as a repeat", () => {
      expect(isValidGuess("aA", 2, 16)).toBe(false);
      expect(isValidGuess("1Bb2", 4, 16)).toBe(false);
    });
  });

  describe("unsupported bases", () => {
    it("propagates the RangeError from createDigitValidator", () => {
      expect(() => isValidGuess("12", 2, 17)).toThrow(RangeError);
    });
  });

  describe("purity", () => {
    it("returns the same result for the same input", () => {
      expect(isValidGuess("1234", 4, 10)).toBe(isValidGuess("1234", 4, 10));
      expect(isValidGuess("1233", 4, 10)).toBe(isValidGuess("1233", 4, 10));
    });
  });
});
