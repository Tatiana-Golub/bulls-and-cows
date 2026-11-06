import type { GameState, Settings } from "../logic/game.js";
import type { HighScores } from "../logic/scores.js";
import type { Store } from "./store.js";

export type AppState = {
  readonly screen: "settings" | "game";
  readonly settings: Settings;
  readonly game: GameState | null;
  readonly scores: HighScores;
};

export type Update = Store<AppState>["update"];

export const initialState: AppState = {
  screen: "settings",
  settings: { length: 4, base: 10 },
  game: null,
  scores: {},
};
