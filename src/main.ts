import { h } from "./ui/dom.js";
import { mount } from "./ui/render.js";
import { initialState } from "./ui/state.js";
import { createStore } from "./ui/store.js";

const view = (): Node => h("main", { className: "app" }, h("h1", {}, "Bulls and Cows"));

const root = h("div", { attrs: { id: "app" } });
document.body.append(root);

mount(root, createStore(initialState), view);
