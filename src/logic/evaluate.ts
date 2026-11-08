export type Evaluation = { readonly bulls: number; readonly cows: number };

const toDigits = (value: string): readonly string[] => [...value.toLowerCase()];

export const evaluateGuess = (secret: string, guess: string): Evaluation => {
  const secretDigits = toDigits(secret);
  const guessDigits = toDigits(guess);

  if (secretDigits.length !== guessDigits.length) {
    throw new RangeError(
      `Secret and guess must have the same length, got ${secretDigits.length} and ${guessDigits.length}`,
    );
  }

  const secretSet = new Set(secretDigits);

  const bulls = guessDigits.filter((digit, i) => digit === secretDigits[i]).length;
  const shared = guessDigits.filter((digit) => secretSet.has(digit)).length;

  return { bulls, cows: shared - bulls };
};
