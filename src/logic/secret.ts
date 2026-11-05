export const generateSecret = (
  length: number,
  base: number,
  random: () => number = Math.random,
): string => {
  throw new Error(`Not implemented (${length}, ${base}, ${typeof random})`);
};
