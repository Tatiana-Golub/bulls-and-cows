import { describe, expect, it, vi } from "vitest";
import { memoize } from "./memoize.js";

describe("memoize", () => {
  describe("caching", () => {
    it("returns the same result as the original function", () => {
      const double = memoize((n: number) => n * 2);

      expect(double(21)).toBe(42);
    });

    it("calls the original function once for repeated identical arguments", () => {
      const spy = vi.fn((n: number) => n * 2);
      const double = memoize(spy);

      double(5);
      double(5);
      double(5);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("calls the original function again for different arguments", () => {
      const spy = vi.fn((n: number) => n * 2);
      const double = memoize(spy);

      double(1);
      double(2);
      double(1);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("keeps one cache entry per distinct argument list", () => {
      const spy = vi.fn((a: number, b: number) => a - b);
      const subtract = memoize(spy);

      expect(subtract(5, 2)).toBe(3);
      expect(subtract(2, 5)).toBe(-3);
      expect(subtract(5, 2)).toBe(3);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("distinguishes arguments of different types", () => {
      const spy = vi.fn((value: number | string) => typeof value);
      const typeOf = memoize(spy);

      expect(typeOf(1)).toBe("number");
      expect(typeOf("1")).toBe("string");
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("works with functions that take no arguments", () => {
      const spy = vi.fn(() => "value");
      const get = memoize(spy);

      expect(get()).toBe("value");
      expect(get()).toBe("value");
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("cached values", () => {
    it("caches falsy results such as 0", () => {
      const spy = vi.fn(() => 0);
      const zero = memoize(spy);

      zero();
      zero();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("caches undefined results", () => {
      const spy = vi.fn((): undefined => undefined);
      const nothing = memoize(spy);

      nothing();
      nothing();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("independence", () => {
    it("gives each memoized function its own cache", () => {
      const spy = vi.fn((n: number) => n + 1);
      const first = memoize(spy);
      const second = memoize(spy);

      first(1);
      second(1);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("does not modify the original function", () => {
      const spy = vi.fn((n: number) => n * 3);
      memoize(spy);

      expect(spy(2)).toBe(6);
      expect(spy(2)).toBe(6);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe("errors", () => {
    it("propagates errors from the original function", () => {
      const failing = memoize((): number => {
        throw new Error("boom");
      });

      expect(() => failing()).toThrow("boom");
    });

    it("does not cache a failed call", () => {
      let shouldFail = true;
      const spy = vi.fn(() => {
        if (shouldFail) throw new Error("boom");
        return "ok";
      });
      const flaky = memoize(spy);

      expect(() => flaky()).toThrow("boom");
      shouldFail = false;

      expect(flaky()).toBe("ok");
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe("recursion", () => {
    it("lets a recursive function reuse its own cached results", () => {
      const spy = vi.fn();
      const fib: (n: number) => number = memoize((n: number): number => {
        spy(n);
        return n < 2 ? n : fib(n - 1) + fib(n - 2);
      });

      expect(fib(30)).toBe(832040);
      expect(spy).toHaveBeenCalledTimes(31);
    });
  });
});
