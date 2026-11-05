export const memoize = <A extends readonly unknown[], R>(
  fn: (...args: A) => R,
): ((...args: A) => R) => {
  throw new Error(`Not implemented (${fn.name})`);
};
