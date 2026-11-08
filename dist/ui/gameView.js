import { createDigitValidator } from "../logic/digits.js";
import { isValidGuess } from "../logic/guess.js";
import { h } from "./dom.js";
import { formatDuration } from "./format.js";
import { newGame, submitGuess } from "./actions.js";
import { scoresView } from "./scoresView.js";
const elapsed = (game, now) => (game.finishedAt ?? now) - game.startedAt;
const historyItem = ({ guess, bulls, cows }) => h("li", { className: "attempt" }, h("span", { className: "guess" }, guess.toUpperCase()), h("span", { className: "result" }, `${bulls} bulls, ${cows} cows`));
const historyList = (game) => {
    const list = h("ol", { className: "history", attrs: { "aria-label": "Attempt history" } }, game.history.map(historyItem));
    const scrollToEnd = () => {
        list.scrollTop = list.scrollHeight;
    };
    requestAnimationFrame(() => {
        scrollToEnd();
        requestAnimationFrame(scrollToEnd);
    });
    return list;
};
const timerView = (game) => {
    const timer = h("span", { className: "timer" }, formatDuration(elapsed(game, Date.now())));
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
const guessForm = (state, game, update) => {
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
    const submit = () => {
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
    return h("form", {
        className: "guess-form",
        on: {
            submit: (event) => {
                event.preventDefault();
                submit();
            },
        },
    }, input, h("button", { className: "start", attrs: { type: "submit" } }, "Guess"), message);
};
export const gameView = (state, game, update) => {
    const { length, base } = game.settings;
    const won = game.status === "won";
    return h("main", { className: "app" }, h("h1", {}, "Bulls and Cows"), h("p", { className: "hint" }, `${length} digits, base ${base} · attempts: ${game.history.length} · time: `, timerView(game)), won
        ? h("p", { className: "win" }, `Solved in ${game.history.length} attempts, ${formatDuration(elapsed(game, 0))}!`)
        : guessForm(state, game, update), historyList(game), won && scoresView(state.scores, game.settings), h("button", {
        className: won ? "start" : "secondary",
        attrs: { type: "button" },
        on: { click: () => update(newGame) },
    }, "New game"));
};
