import type { GameState, Settings } from "./game.js";

export type ScoreEntry = { readonly attempts: number; readonly timeMs: number };
export type ScoreTable = readonly ScoreEntry[];
export type HighScores = Readonly<Record<string, ScoreTable>>;

export const TOP_N = 10;

export const settingsKey = (settings: Settings): string => {
  throw new Error(`Not implemented (${settings.length}, ${settings.base})`);
};

export const compareScores = (a: ScoreEntry, b: ScoreEntry): number => {
  throw new Error(`Not implemented (${a.attempts}, ${b.attempts})`);
};

export const rankScores = (
  entries: readonly ScoreEntry[],
  limit: number = TOP_N,
): ScoreTable => {
  throw new Error(`Not implemented (${entries.length}, ${limit})`);
};

export const insertScore = (
  table: ScoreTable,
  entry: ScoreEntry,
  limit: number = TOP_N,
): ScoreTable => {
  throw new Error(`Not implemented (${table.length}, ${entry.attempts}, ${limit})`);
};

export const recordScore = (
  scores: HighScores,
  settings: Settings,
  entry: ScoreEntry,
  limit: number = TOP_N,
): HighScores => {
  throw new Error(
    `Not implemented (${Object.keys(scores).length}, ${settings.base}, ${entry.attempts}, ${limit})`,
  );
};

export const tableFor = (scores: HighScores, settings: Settings): ScoreTable => {
  throw new Error(`Not implemented (${Object.keys(scores).length}, ${settings.base})`);
};

export const entryFromGame = (state: GameState): ScoreEntry => {
  throw new Error(`Not implemented (${state.status})`);
};
