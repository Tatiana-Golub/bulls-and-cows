import { ALPHABET } from "./digits.js";
const MIN_BASE = 2;
const assertSettings = (length, base) => {
    if (!Number.isInteger(base) || base < MIN_BASE || base > ALPHABET.length) {
        throw new RangeError(`Base must be an integer from ${MIN_BASE} to ${ALPHABET.length}`);
    }
    if (!Number.isInteger(length) || length < 1 || length > base) {
        throw new RangeError(`Length must be an integer from 1 to ${base}, got ${length}`);
    }
};
const withoutIndex = (pool, index) => [
    ...pool.slice(0, index),
    ...pool.slice(index + 1),
];
const pickDigits = (pool, count, random) => {
    if (count === 0)
        return [];
    const index = Math.min(pool.length - 1, Math.floor(random() * pool.length));
    const digit = pool[index];
    return [digit, ...pickDigits(withoutIndex(pool, index), count - 1, random)];
};
export const generateSecret = (length, base, random = Math.random) => {
    assertSettings(length, base);
    return pickDigits([...ALPHABET.slice(0, base)], length, random).join("");
};
