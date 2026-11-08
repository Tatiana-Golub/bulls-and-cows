import { ALPHABET } from "./digits.js";
import type { Settings } from "./game.js";

export const MIN_LENGTH = 2;
export const MAX_LENGTH = 6;

export const BASES = [
  { name: "bin", base: 2 },
  { name: "oct", base: 8 },
  { name: "dec", base: 10 },
  { name: "hex", base: 16 },
] as const;

const MIN_BASE = 2;

export const isLengthAvailable = (length: number, base: number): boolean =>
  Number.isInteger(length) &&
  length >= MIN_LENGTH &&
  length <= MAX_LENGTH &&
  length <= base;

export const availableLengths = (base: number): readonly number[] =>
  Array.from({ length: MAX_LENGTH - MIN_LENGTH + 1 }, (_, i) => MIN_LENGTH + i).filter(
    (length) => isLengthAvailable(length, base),
  );

export const setBase = (settings: Settings, base: number): Settings => {
  if (!Number.isInteger(base) || base < MIN_BASE || base > ALPHABET.length) {
    throw new RangeError(
      `Base must be an integer from ${MIN_BASE} to ${ALPHABET.length}`,
    );
  }

  if (base === settings.base) return settings;

  const length = Math.min(settings.length, MAX_LENGTH, base);

  return { length, base };
};

export const setLength = (settings: Settings, length: number): Settings =>
  length === settings.length || !isLengthAvailable(length, settings.base)
    ? settings
    : { ...settings, length };
