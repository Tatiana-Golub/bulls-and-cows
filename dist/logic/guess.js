import { createDigitValidator } from "./digits.js";
const hasUniqueItems = (items) => new Set(items).size === items.length;
export const isValidGuess = (guess, length, base) => {
    const isDigit = createDigitValidator(base);
    const chars = [...guess.toLowerCase()];
    return chars.length === length && chars.every(isDigit) && hasUniqueItems(chars);
};
