import { createDigitValidator } from "../logic/digits.js";
import type { Attempt, GameState } from "../logic/game.js";
import { isValidGuess } from "../logic/guess.js";
import { h } from "./dom.js";
import { formatDuration } from "./format.js";
import type { AppState, Update } from "./state.js";
import { newGame, submitGuess } from "./actions.js";
import { scoresView } from "./scoresView.js";

const elapsed = (game: GameState, now: number): number =>
  (game.finishedAt ?? now) - game.startedAt;

const historyItem = ({ guess, bulls, cows }: Attempt): HTMLLIElement =>
  h(
    "li",
    { className: "attempt" },
    h("span", { className: "guess" }, guess.toUpperCase()),
    h("span", { className: "result" }, `${bulls} bulls, ${cows} cows`),
  );

const timerView = (game: GameState): HTMLSpanElement => {
  const timer = h(
    "span",
    { className: "timer" },
    formatDuration(elapsed(game, Date.now())),
  );

  if (game.status === "playing") {
    const id = setInterval(() => {
      if (!timer.isConnected) {
        clearInterval(id);
        return;
      }
      timer.textContent = formatDuration(elapsed(game, Date.now()));
    }, 500);
  }

  return timer;
};

const guessForm = (state: AppState, game: GameState, update: Update): HTMLFormElement => {
  const { length, base } = game.settings;
  const isDigit = createDigitValidator(base);

  const message = h("p", { className: "message", attrs: { role: "status" } });

  const input = h("input", {
    className: "guess-input",
    attrs: {
      type: "text",
      maxlength: length,
      inputmode: base === 16 ? "text" : "numeric",
      autocomplete: "off",
      autocapitalize: "off",
      spellcheck: false,
      "aria-label": `Your guess, ${length} unique digits`,
    },
    on: {
      input: () => {
        input.value = [...input.value].filter(isDigit).slice(0, length).join("");
        message.textContent = "";
      },
    },
  });

  const submit = (): void => {
    const guess = input.value;

    if (!isValidGuess(guess, length, base)) {
      message.textContent = `Enter ${length} different digits.`;
      return;
    }

    const next = submitGuess(state, guess, Date.now());

    if (next === state) {
      message.textContent = "You already tried this number.";
      return;
    }

    update(() => next);
  };

  queueMicrotask(() => input.focus());

  return h(
    "form",
    {
      className: "guess-form",
      on: {
        submit: (event) => {
          event.preventDefault();
          submit();
        },
      },
    },
    input,
    h("button", { className: "start", attrs: { type: "submit" } }, "Guess"),
    message,
  );
};

export const gameView = (state: AppState, game: GameState, update: Update): Node => {
  const { length, base } = game.settings;
  const won = game.status === "won";

  return h(
    "main",
    { className: "app" },
    h("h1", {}, "Bulls and Cows"),
    h(
      "p",
      { className: "hint" },
      `${length} digits, base ${base} · attempts: ${game.history.length} · time: `,
      timerView(game),
    ),
    won
      ? h(
          "p",
          { className: "win" },
          `Solved in ${game.history.length} attempts, ${formatDuration(elapsed(game, 0))}!`,
        )
      : guessForm(state, game, update),
    h("ol", { className: "history" }, game.history.map(historyItem)),
    won && scoresView(state.scores, game.settings),
    h(
      "button",
      {
        className: won ? "start" : "secondary",
        attrs: { type: "button" },
        on: { click: () => update(newGame) },
      },
      "New game",
    ),
  );
};
