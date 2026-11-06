import type { Settings } from "./game.js";

export const MIN_LENGTH = 2;
export const MAX_LENGTH = 6;

export const BASES = [
  { name: "bin", base: 2 },
  { name: "oct", base: 8 },
  { name: "dec", base: 10 },
  { name: "hex", base: 16 },
] as const;

export const isLengthAvailable = (length: number, base: number): boolean => {
  throw new Error(`Not implemented (${length}, ${base})`);
};

export const availableLengths = (base: number): readonly number[] => {
  throw new Error(`Not implemented (${base})`);
};

export const setBase = (settings: Settings, base: number): Settings => {
  throw new Error(`Not implemented (${settings.length}, ${base})`);
};

export const setLength = (settings: Settings, length: number): Settings => {
  throw new Error(`Not implemented (${settings.base}, ${length})`);
};
