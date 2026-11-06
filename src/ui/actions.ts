import { setBase, setLength } from "../logic/settings.js";
import type { AppState } from "./state.js";
import { addAttempt, startGame, type GameState, type Settings } from "../logic/game.js";

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

const withGame = (state: AppState, game: GameState): AppState =>
  game === state.game ? state : { ...state, game };

export const submitGuess = (state: AppState, guess: string, now: number): AppState =>
  state.screen === "game" && state.game !== null
    ? withGame(state, addAttempt(state.game, guess, now))
    : state;
