import { addAttempt, startGame } from "../logic/game.js";
import { entryFromGame, recordScore } from "../logic/scores.js";
import { setBase, setLength } from "../logic/settings.js";
const withSettings = (state, settings) => settings === state.settings ? state : { ...state, settings };
export const chooseLength = (state, length) => state.screen === "settings"
    ? withSettings(state, setLength(state.settings, length))
    : state;
export const chooseBase = (state, base) => state.screen === "settings"
    ? withSettings(state, setBase(state.settings, base))
    : state;
export const beginRound = (state, secret, now) => state.screen === "settings"
    ? { ...state, screen: "game", game: startGame(state.settings, secret, now) }
    : state;
export const submitGuess = (state, guess, now) => {
    if (state.screen !== "game" || state.game === null)
        return state;
    const game = addAttempt(state.game, guess, now);
    if (game === state.game)
        return state;
    const scores = game.status === "won"
        ? recordScore(state.scores, game.settings, entryFromGame(game))
        : state.scores;
    return { ...state, game, scores };
};
export const newGame = (state) => state.screen === "game" ? { ...state, screen: "settings", game: null } : state;
