import {
  rankScores,
  type HighScores,
  type ScoreEntry,
  type ScoreTable,
} from "./scores.js";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export const STORAGE_KEY = "bulls-and-cows:scores";

const SETTINGS_KEY_PATTERN = /^\d+:\d+$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isScoreEntry = (value: unknown): value is ScoreEntry =>
  isRecord(value) &&
  typeof value.attempts === "number" &&
  Number.isInteger(value.attempts) &&
  value.attempts >= 1 &&
  typeof value.timeMs === "number" &&
  Number.isFinite(value.timeMs) &&
  value.timeMs >= 0;

const toEntry = ({ attempts, timeMs }: ScoreEntry): ScoreEntry => ({ attempts, timeMs });

const parseJson = (raw: string | null): unknown => {
  try {
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
};

const parseTable = (value: unknown): ScoreTable | undefined =>
  Array.isArray(value) ? rankScores(value.filter(isScoreEntry).map(toEntry)) : undefined;

export const serializeScores = (scores: HighScores): string => JSON.stringify(scores);

export const parseScores = (raw: string | null): HighScores => {
  const data = parseJson(raw);

  if (!isRecord(data)) return {};

  return Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => SETTINGS_KEY_PATTERN.test(key))
      .flatMap(([key, table]): [string, ScoreTable][] => {
        const parsed = parseTable(table);
        return parsed === undefined ? [] : [[key, parsed]];
      }),
  );
};

export const loadScores = (storage: StorageLike): HighScores => {
  try {
    return parseScores(storage.getItem(STORAGE_KEY));
  } catch {
    return {};
  }
};

export const saveScores = (storage: StorageLike, scores: HighScores): boolean => {
  try {
    storage.setItem(STORAGE_KEY, serializeScores(scores));
    return true;
  } catch {
    return false;
  }
};
