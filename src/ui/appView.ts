import { gameView } from "./gameView.js";
import { settingsView } from "./settingsView.js";
import type { AppState, Update } from "./state.js";

export const appView = (state: AppState, update: Update): Node =>
  state.screen === "game" && state.game !== null
    ? gameView(state, state.game, update)
    : settingsView(state, update);
