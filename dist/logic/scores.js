import { isWon } from "./game.js";
export const TOP_N = 10;
export const settingsKey = ({ length, base }) => `${length}:${base}`;
export const compareScores = (a, b) => a.attempts - b.attempts || a.timeMs - b.timeMs;
export const rankScores = (entries, limit = TOP_N) => {
    if (!Number.isInteger(limit) || limit < 1) {
        throw new RangeError(`Limit must be a positive integer, got ${limit}`);
    }
    return [...entries].sort(compareScores).slice(0, limit);
};
export const insertScore = (table, entry, limit = TOP_N) => rankScores([...table, entry], limit);
export const tableFor = (scores, settings) => scores[settingsKey(settings)] ?? [];
export const recordScore = (scores, settings, entry, limit = TOP_N) => ({
    ...scores,
    [settingsKey(settings)]: insertScore(tableFor(scores, settings), entry, limit),
});
export const entryFromGame = (state) => {
    if (!isWon(state) || state.finishedAt === null) {
        throw new RangeError("Only a won game has a score");
    }
    return { attempts: state.history.length, timeMs: state.finishedAt - state.startedAt };
};
