import { createDigitValidator } from "./digits.js";

const hasUniqueItems = (items: readonly string[]): boolean =>
  new Set(items).size === items.length;

export const isValidGuess = (guess: string, length: number, base: number): boolean => {
  const isDigit = createDigitValidator(base);
  const chars = [...guess.toLowerCase()];

  return chars.length === length && chars.every(isDigit) && hasUniqueItems(chars);
};
