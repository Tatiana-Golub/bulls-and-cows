import { tableFor } from "../logic/scores.js";
import { h } from "./dom.js";
import { formatDuration } from "./format.js";
export const scoresView = (scores, settings) => {
    const table = tableFor(scores, settings);
    return h("section", { className: "scores" }, h("h2", {}, `Best results: ${settings.length} digits, base ${settings.base}`), table.length === 0
        ? h("p", { className: "hint" }, "No results yet.")
        : h("table", { className: "score-table" }, h("thead", {}, h("tr", {}, h("th", { attrs: { scope: "col" } }, "#"), h("th", { attrs: { scope: "col" } }, "Attempts"), h("th", { attrs: { scope: "col" } }, "Time"))), h("tbody", {}, table.map((entry, i) => h("tr", {}, h("td", {}, String(i + 1)), h("td", {}, String(entry.attempts)), h("td", {}, formatDuration(entry.timeMs)))))));
};
