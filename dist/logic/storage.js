import { rankScores, } from "./scores.js";
export const STORAGE_KEY = "bulls-and-cows:scores";
const SETTINGS_KEY_PATTERN = /^\d+:\d+$/;
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const isScoreEntry = (value) => isRecord(value) &&
    typeof value.attempts === "number" &&
    Number.isInteger(value.attempts) &&
    value.attempts >= 1 &&
    typeof value.timeMs === "number" &&
    Number.isFinite(value.timeMs) &&
    value.timeMs >= 0;
const toEntry = ({ attempts, timeMs }) => ({ attempts, timeMs });
const parseJson = (raw) => {
    try {
        return raw === null ? null : JSON.parse(raw);
    }
    catch {
        return null;
    }
};
const parseTable = (value) => Array.isArray(value) ? rankScores(value.filter(isScoreEntry).map(toEntry)) : undefined;
export const serializeScores = (scores) => JSON.stringify(scores);
export const parseScores = (raw) => {
    const data = parseJson(raw);
    if (!isRecord(data))
        return {};
    return Object.fromEntries(Object.entries(data)
        .filter(([key]) => SETTINGS_KEY_PATTERN.test(key))
        .flatMap(([key, table]) => {
        const parsed = parseTable(table);
        return parsed === undefined ? [] : [[key, parsed]];
    }));
};
export const loadScores = (storage) => {
    try {
        return parseScores(storage.getItem(STORAGE_KEY));
    }
    catch {
        return {};
    }
};
export const saveScores = (storage, scores) => {
    try {
        storage.setItem(STORAGE_KEY, serializeScores(scores));
        return true;
    }
    catch {
        return false;
    }
};
