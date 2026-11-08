export const ALPHABET = "0123456789abcdef";
const MIN_BASE = 2;
const MAX_BASE = ALPHABET.length;

const isSupportedBase = (base: number): boolean =>
  Number.isInteger(base) && base >= MIN_BASE && base <= MAX_BASE;

export const createDigitValidator = (base: number): ((char: string) => boolean) => {
  if (!isSupportedBase(base)) {
    throw new RangeError(`Base must be an integer from ${MIN_BASE} to ${MAX_BASE}`);
  }

  const validDigits: ReadonlySet<string> = new Set(ALPHABET.slice(0, base));

  return (char: string): boolean => validDigits.has(char.toLowerCase());
};
