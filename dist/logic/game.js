import { evaluateGuess } from "./evaluate.js";
import { isValidGuess } from "./guess.js";
export const startGame = (settings, secret, now) => {
    if (!isValidGuess(secret, settings.length, settings.base)) {
        throw new RangeError(`Secret "${secret}" does not fit length ${settings.length} in base ${settings.base}`);
    }
    return {
        settings,
        secret: secret.toLowerCase(),
        history: [],
        status: "playing",
        startedAt: now,
        finishedAt: null,
    };
};
export const addAttempt = (state, guess, now) => {
    const { length, base } = state.settings;
    if (!isValidGuess(guess, length, base)) {
        throw new RangeError(`Guess "${guess}" does not fit length ${length} in base ${base}`);
    }
    const normalized = guess.toLowerCase();
    const alreadyMade = state.history.some((entry) => entry.guess === normalized);
    if (state.status === "won" || alreadyMade) {
        return state;
    }
    const { bulls, cows } = evaluateGuess(state.secret, normalized);
    const won = bulls === length;
    return {
        ...state,
        history: [...state.history, { guess: normalized, bulls, cows }],
        status: won ? "won" : "playing",
        finishedAt: won ? now : null,
    };
};
export const isWon = (state) => state.status === "won";
