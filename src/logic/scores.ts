import { isWon, type GameState, type Settings } from "./game.js";

export type ScoreEntry = { readonly attempts: number; readonly timeMs: number };
export type ScoreTable = readonly ScoreEntry[];
export type HighScores = Readonly<Record<string, ScoreTable>>;

export const TOP_N = 10;

export const settingsKey = ({ length, base }: Settings): string => `${length}:${base}`;

export const compareScores = (a: ScoreEntry, b: ScoreEntry): number =>
  a.attempts - b.attempts || a.timeMs - b.timeMs;

export const rankScores = (entries: readonly ScoreEntry[], limit = TOP_N): ScoreTable => {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError(`Limit must be a positive integer, got ${limit}`);
  }

  return [...entries].sort(compareScores).slice(0, limit);
};

export const insertScore = (
  table: ScoreTable,
  entry: ScoreEntry,
  limit = TOP_N,
): ScoreTable => rankScores([...table, entry], limit);

export const tableFor = (scores: HighScores, settings: Settings): ScoreTable =>
  scores[settingsKey(settings)] ?? [];

export const recordScore = (
  scores: HighScores,
  settings: Settings,
  entry: ScoreEntry,
  limit = TOP_N,
): HighScores => ({
  ...scores,
  [settingsKey(settings)]: insertScore(tableFor(scores, settings), entry, limit),
});

export const entryFromGame = (state: GameState): ScoreEntry => {
  if (!isWon(state) || state.finishedAt === null) {
    throw new RangeError("Only a won game has a score");
  }

  return { attempts: state.history.length, timeMs: state.finishedAt - state.startedAt };
};
