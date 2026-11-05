import type { HighScores } from "./scores.js";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export const STORAGE_KEY = "bulls-and-cows:scores";

export const serializeScores = (scores: HighScores): string => {
  throw new Error(`Not implemented (${Object.keys(scores).length})`);
};

export const parseScores = (raw: string | null): HighScores => {
  throw new Error(`Not implemented (${raw})`);
};

export const loadScores = (storage: StorageLike): HighScores => {
  throw new Error(`Not implemented (${typeof storage.getItem})`);
};

export const saveScores = (storage: StorageLike, scores: HighScores): boolean => {
  throw new Error(
    `Not implemented (${typeof storage.setItem}, ${Object.keys(scores).length})`,
  );
};
