import { gameView } from "./gameView.js";
import { settingsView } from "./settingsView.js";
export const appView = (state, update) => state.screen === "game" && state.game !== null
    ? gameView(state, state.game, update)
    : settingsView(state, update);
