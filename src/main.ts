import { loadScores, saveScores, type StorageLike } from "./logic/storage.js";
import { appView } from "./ui/appView.js";
import { h } from "./ui/dom.js";
import { mount } from "./ui/render.js";
import { initialState } from "./ui/state.js";
import { createStore } from "./ui/store.js";

const browserStorage = (): StorageLike => {
  try {
    return window.localStorage;
  } catch {
    return { getItem: () => null, setItem: () => undefined };
  }
};

const storage = browserStorage();

const root = h("div", { attrs: { id: "app" } });
document.body.append(root);

const store = createStore({ ...initialState, scores: loadScores(storage) });

let savedScores = store.getState().scores;
store.subscribe((state) => {
  if (state.scores === savedScores) return;
  savedScores = state.scores;
  saveScores(storage, state.scores);
});

mount(root, store, (state) => appView(state, store.update));
