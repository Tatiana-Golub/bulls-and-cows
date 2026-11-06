import { countPossibleSecrets } from "../logic/count.js";
import { generateSecret } from "../logic/secret.js";
import { BASES, isLengthAvailable, MAX_LENGTH, MIN_LENGTH } from "../logic/settings.js";
import { beginRound, chooseBase, chooseLength } from "./actions.js";
import { h } from "./dom.js";
import type { AppState, Update } from "./state.js";

const LENGTHS = Array.from(
  { length: MAX_LENGTH - MIN_LENGTH + 1 },
  (_, i) => MIN_LENGTH + i,
);

const optionButton = (
  label: string,
  selected: boolean,
  enabled: boolean,
  onClick: () => void,
): HTMLButtonElement =>
  h(
    "button",
    {
      className: selected ? "option selected" : "option",
      attrs: { type: "button", disabled: !enabled, "aria-pressed": String(selected) },
      on: { click: onClick },
    },
    label,
  );

export const settingsView = (state: AppState, update: Update): Node => {
  const { length, base } = state.settings;

  const startRound = (): void => {
    const secret = generateSecret(length, base);
    const now = Date.now();
    update((current) => beginRound(current, secret, now));
  };

  return h(
    "main",
    { className: "app" },
    h("h1", {}, "Bulls and Cows"),
    h(
      "section",
      { className: "setting" },
      h("h2", {}, "Number system"),
      h(
        "div",
        { className: "options" },
        BASES.map((item) =>
          optionButton(item.name, item.base === base, true, () =>
            update((current) => chooseBase(current, item.base)),
          ),
        ),
      ),
    ),
    h(
      "section",
      { className: "setting" },
      h("h2", {}, "Secret length"),
      h(
        "div",
        { className: "options" },
        LENGTHS.map((item) =>
          optionButton(String(item), item === length, isLengthAvailable(item, base), () =>
            update((current) => chooseLength(current, item)),
          ),
        ),
      ),
    ),
    h(
      "p",
      { className: "hint" },
      `Possible secrets: ${countPossibleSecrets(length, base).toLocaleString()}`,
    ),
    h(
      "button",
      { className: "start", attrs: { type: "button" }, on: { click: startRound } },
      "Start",
    ),
  );
};
