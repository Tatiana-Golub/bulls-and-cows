import { h } from "./dom.js";
import { settingsView } from "./settingsView.js";
import type { AppState, Update } from "./state.js";

const gameView = (state: AppState): Node =>
  h(
    "main",
    { className: "app" },
    h("h1", {}, "Bulls and Cows"),
    h(
      "p",
      {},
      `Round started: ${state.settings.length} digits, base ${state.settings.base}`,
    ),
  );

export const appView = (state: AppState, update: Update): Node =>
  state.screen === "settings" ? settingsView(state, update) : gameView(state);
