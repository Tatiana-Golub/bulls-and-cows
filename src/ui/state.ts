import type { GameState, Settings } from "../logic/game.js";
import type { HighScores } from "../logic/scores.js";

export type AppState = {
  readonly screen: "settings" | "game";
  readonly settings: Settings;
  readonly game: GameState | null;
  readonly scores: HighScores;
};

export const initialState: AppState = {
  screen: "settings",
  settings: { length: 4, base: 10 },
  game: null,
  scores: {},
};
