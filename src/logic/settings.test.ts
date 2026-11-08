import { describe, expect, it } from "vitest";
import {
  availableLengths,
  BASES,
  isLengthAvailable,
  MAX_LENGTH,
  MIN_LENGTH,
  setBase,
  setLength,
} from "./settings.js";

const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

describe("constants", () => {
  it("offers lengths from 2 to 6", () => {
    expect(MIN_LENGTH).toBe(2);
    expect(MAX_LENGTH).toBe(6);
  });

  it("offers bin, oct, dec and hex", () => {
    expect(BASES.map(({ name, base }) => [name, base])).toStrictEqual([
      ["bin", 2],
      ["oct", 8],
      ["dec", 10],
      ["hex", 16],
    ]);
  });
});

describe("isLengthAvailable", () => {
  it.each([
    [2, 2, true],
    [3, 2, false],
    [6, 2, false],
    [2, 8, true],
    [6, 8, true],
    [6, 10, true],
    [6, 16, true],
  ])("length %i in base %i is %s", (length, base, expected) => {
    expect(isLengthAvailable(length, base)).toBe(expected);
  });

  it.each([0, 1, 7, 2.5, Number.NaN])("rejects length %s in every base", (length) => {
    expect(BASES.some(({ base }) => isLengthAvailable(length, base))).toBe(false);
  });
});

describe("availableLengths", () => {
  it("allows only length 2 in binary", () => {
    expect(availableLengths(2)).toStrictEqual([2]);
  });

  it.each([8, 10, 16])("allows 2 to 6 in base %i", (base) => {
    expect(availableLengths(base)).toStrictEqual([2, 3, 4, 5, 6]);
  });

  it("agrees with isLengthAvailable", () => {
    BASES.forEach(({ base }) => {
      const allowed = availableLengths(base);

      [0, 1, 2, 3, 4, 5, 6, 7].forEach((length) => {
        expect(allowed.includes(length)).toBe(isLengthAvailable(length, base));
      });
    });
  });
});

describe("setBase", () => {
  it("changes the base and keeps an available length", () => {
    expect(setBase({ length: 4, base: 10 }, 16)).toStrictEqual({ length: 4, base: 16 });
  });

  it("lowers the length to the largest available one when it does not fit", () => {
    expect(setBase({ length: 5, base: 10 }, 2)).toStrictEqual({ length: 2, base: 2 });
  });

  it("keeps length 2 when switching to binary", () => {
    expect(setBase({ length: 2, base: 10 }, 2)).toStrictEqual({ length: 2, base: 2 });
  });

  it("does not raise the length when switching back from binary", () => {
    expect(setBase({ length: 2, base: 2 }, 10)).toStrictEqual({ length: 2, base: 10 });
  });

  it("returns the same object when nothing changes", () => {
    const settings = { length: 4, base: 10 };

    expect(setBase(settings, 10)).toBe(settings);
  });

  it("returns a new object and leaves the old one unchanged", () => {
    const settings = deepFreeze({ length: 4, base: 10 });

    const next = setBase(settings, 8);

    expect(next).not.toBe(settings);
    expect(settings).toStrictEqual({ length: 4, base: 10 });
  });

  it.each([1, 17, 2.5, Number.NaN])("throws RangeError for base %s", (base) => {
    expect(() => setBase({ length: 2, base: 10 }, base)).toThrow(RangeError);
  });
});

describe("setLength", () => {
  it("changes the length", () => {
    expect(setLength({ length: 4, base: 10 }, 6)).toStrictEqual({ length: 6, base: 10 });
  });

  it("keeps the base", () => {
    expect(setLength({ length: 2, base: 16 }, 3).base).toBe(16);
  });

  it("returns the same object for an unavailable length", () => {
    const binary = { length: 2, base: 2 };

    expect(setLength(binary, 4)).toBe(binary);
  });

  it.each([0, 1, 7, 2.5, Number.NaN])(
    "returns the same object for length %s",
    (length) => {
      const settings = { length: 4, base: 10 };

      expect(setLength(settings, length)).toBe(settings);
    },
  );

  it("returns the same object when the length is already selected", () => {
    const settings = { length: 4, base: 10 };

    expect(setLength(settings, 4)).toBe(settings);
  });

  it("returns a new object and leaves the old one unchanged", () => {
    const settings = deepFreeze({ length: 4, base: 10 });

    const next = setLength(settings, 5);

    expect(next).not.toBe(settings);
    expect(settings).toStrictEqual({ length: 4, base: 10 });
  });
});
