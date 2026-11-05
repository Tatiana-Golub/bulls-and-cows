import { describe, expect, it } from "vitest";
import { createDigitValidator } from "./digits.js";

describe("createDigitValidator", () => {
  describe("binary (base 2)", () => {
    const isDigit = createDigitValidator(2);

    it.each(["0", "1"])("accepts %s", (char) => {
      expect(isDigit(char)).toBe(true);
    });

    it.each(["2", "9", "a", "-"])("rejects %s", (char) => {
      expect(isDigit(char)).toBe(false);
    });
  });

  describe("octal (base 8)", () => {
    const isDigit = createDigitValidator(8);

    it.each(["0", "3", "7"])("accepts %s", (char) => {
      expect(isDigit(char)).toBe(true);
    });

    it.each(["8", "9", "a"])("rejects %s", (char) => {
      expect(isDigit(char)).toBe(false);
    });
  });

  describe("decimal (base 10)", () => {
    const isDigit = createDigitValidator(10);

    it.each(["0", "5", "9"])("accepts %s", (char) => {
      expect(isDigit(char)).toBe(true);
    });

    it.each(["a", "f", "-", ".", " "])("rejects %j", (char) => {
      expect(isDigit(char)).toBe(false);
    });
  });

  describe("hexadecimal (base 16)", () => {
    const isDigit = createDigitValidator(16);

    it.each(["0", "9", "a", "f"])("accepts lowercase %s", (char) => {
      expect(isDigit(char)).toBe(true);
    });

    it.each(["A", "B", "F"])("accepts uppercase %s like lowercase", (char) => {
      expect(isDigit(char)).toBe(true);
    });

    it.each(["g", "G", "z", "#"])("rejects %s", (char) => {
      expect(isDigit(char)).toBe(false);
    });
  });

  describe("input shape", () => {
    const isDigit = createDigitValidator(16);

    it("rejects the empty string", () => {
      expect(isDigit("")).toBe(false);
    });

    it.each(["01", "ab", "10"])("rejects multi-character string %s", (value) => {
      expect(isDigit(value)).toBe(false);
    });
  });

  describe("currying", () => {
    it("returns a function when given a base", () => {
      expect(typeof createDigitValidator(10)).toBe("function");
    });

    it("produces independent validators for different bases", () => {
      const isBinary = createDigitValidator(2);
      const isDecimal = createDigitValidator(10);

      expect(isBinary("7")).toBe(false);
      expect(isDecimal("7")).toBe(true);
    });

    it("is reusable and deterministic across calls", () => {
      const isDigit = createDigitValidator(8);

      expect(isDigit("5")).toBe(true);
      expect(isDigit("5")).toBe(true);
      expect(isDigit("9")).toBe(false);
      expect(isDigit("9")).toBe(false);
    });

    it("works directly as a predicate for array methods", () => {
      const isBinary = createDigitValidator(2);

      expect([..."1010"].every(isBinary)).toBe(true);
      expect([..."1020"].every(isBinary)).toBe(false);
    });
  });

  describe("unsupported bases", () => {
    it.each([0, 1, 17, 2.5, Number.NaN])("throws RangeError for base %s", (base) => {
      expect(() => createDigitValidator(base)).toThrow(RangeError);
    });
  });
});
