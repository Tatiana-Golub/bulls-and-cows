import { appView } from "./ui/appView.js";
import { h } from "./ui/dom.js";
import { mount } from "./ui/render.js";
import { initialState } from "./ui/state.js";
import { createStore } from "./ui/store.js";

const root = h("div", { attrs: { id: "app" } });
document.body.append(root);

const store = createStore(initialState);

mount(root, store, (state) => appView(state, store.update));
