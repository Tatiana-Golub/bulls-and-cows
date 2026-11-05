export type Evaluation = { readonly bulls: number; readonly cows: number };

export const evaluateGuess = (secret: string, guess: string): Evaluation => {
  throw new Error(`Not implemented (${secret}, ${guess})`);
};
