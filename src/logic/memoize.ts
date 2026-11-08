export const memoize = <A extends readonly unknown[], R>(
  fn: (...args: A) => R,
): ((...args: A) => R) => {
  const cache = new Map<string, R>();

  return (...args: A): R => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key) as R;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
