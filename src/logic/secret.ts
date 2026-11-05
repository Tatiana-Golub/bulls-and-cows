import { ALPHABET } from "./digits.js";

const MIN_BASE = 2;

const assertSettings = (length: number, base: number): void => {
  if (!Number.isInteger(base) || base < MIN_BASE || base > ALPHABET.length) {
    throw new RangeError(
      `Base must be an integer from ${MIN_BASE} to ${ALPHABET.length}`,
    );
  }
  if (!Number.isInteger(length) || length < 1 || length > base) {
    throw new RangeError(`Length must be an integer from 1 to ${base}, got ${length}`);
  }
};

const withoutIndex = (pool: readonly string[], index: number): readonly string[] => [
  ...pool.slice(0, index),
  ...pool.slice(index + 1),
];

const pickDigits = (
  pool: readonly string[],
  count: number,
  random: () => number,
): readonly string[] => {
  if (count === 0) return [];

  const index = Math.min(pool.length - 1, Math.floor(random() * pool.length));
  const digit = pool[index] as string;

  return [digit, ...pickDigits(withoutIndex(pool, index), count - 1, random)];
};

export const generateSecret = (
  length: number,
  base: number,
  random: () => number = Math.random,
): string => {
  assertSettings(length, base);
  return pickDigits([...ALPHABET.slice(0, base)], length, random).join("");
};
