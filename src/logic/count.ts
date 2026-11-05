import { memoize } from "./memoize.js";

const assertNonNegativeInteger = (name: string, value: number): void => {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer, got ${value}`);
  }
};

const permutations: (length: number, base: number) => number = memoize(
  (length: number, base: number): number => {
    if (length === 0) return 1;
    if (length > base) return 0;
    return base * permutations(length - 1, base - 1);
  },
);

export const countPossibleSecrets = (length: number, base: number): number => {
  assertNonNegativeInteger("length", length);
  assertNonNegativeInteger("base", base);
  return permutations(length, base);
};
