export const ALPHABET = "0123456789abcdef";
const MIN_BASE = 2;
const MAX_BASE = ALPHABET.length;
const isSupportedBase = (base) => Number.isInteger(base) && base >= MIN_BASE && base <= MAX_BASE;
export const createDigitValidator = (base) => {
    if (!isSupportedBase(base)) {
        throw new RangeError(`Base must be an integer from ${MIN_BASE} to ${MAX_BASE}`);
    }
    const validDigits = new Set(ALPHABET.slice(0, base));
    return (char) => validDigits.has(char.toLowerCase());
};
