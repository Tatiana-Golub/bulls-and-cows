import { addAttempt, startGame, type Settings } from "../logic/game.js";
import { entryFromGame, recordScore } from "../logic/scores.js";
import { setBase, setLength } from "../logic/settings.js";
import type { AppState } from "./state.js";

const withSettings = (state: AppState, settings: Settings): AppState =>
  settings === state.settings ? state : { ...state, settings };

export const chooseLength = (state: AppState, length: number): AppState =>
  state.screen === "settings"
    ? withSettings(state, setLength(state.settings, length))
    : state;

export const chooseBase = (state: AppState, base: number): AppState =>
  state.screen === "settings"
    ? withSettings(state, setBase(state.settings, base))
    : state;

export const beginRound = (state: AppState, secret: string, now: number): AppState =>
  state.screen === "settings"
    ? { ...state, screen: "game", game: startGame(state.settings, secret, now) }
    : state;

export const submitGuess = (state: AppState, guess: string, now: number): AppState => {
  if (state.screen !== "game" || state.game === null) return state;

  const game = addAttempt(state.game, guess, now);
  if (game === state.game) return state;

  const scores =
    game.status === "won"
      ? recordScore(state.scores, game.settings, entryFromGame(game))
      : state.scores;

  return { ...state, game, scores };
};

export const newGame = (state: AppState): AppState =>
  state.screen === "game" ? { ...state, screen: "settings", game: null } : state;
