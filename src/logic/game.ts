import { evaluateGuess } from "./evaluate.js";
import { isValidGuess } from "./guess.js";

export type Settings = { readonly length: number; readonly base: number };

export type Attempt = {
  readonly guess: string;
  readonly bulls: number;
  readonly cows: number;
};

export type GameStatus = "playing" | "won";

export type GameState = {
  readonly settings: Settings;
  readonly secret: string;
  readonly history: readonly Attempt[];
  readonly status: GameStatus;
  readonly startedAt: number;
  readonly finishedAt: number | null;
};

export const startGame = (settings: Settings, secret: string, now: number): GameState => {
  if (!isValidGuess(secret, settings.length, settings.base)) {
    throw new RangeError(
      `Secret "${secret}" does not fit length ${settings.length} in base ${settings.base}`,
    );
  }

  return {
    settings,
    secret: secret.toLowerCase(),
    history: [],
    status: "playing",
    startedAt: now,
    finishedAt: null,
  };
};

export const addAttempt = (state: GameState, guess: string, now: number): GameState => {
  const { length, base } = state.settings;

  if (!isValidGuess(guess, length, base)) {
    throw new RangeError(
      `Guess "${guess}" does not fit length ${length} in base ${base}`,
    );
  }

  const normalized = guess.toLowerCase();
  const alreadyMade = state.history.some((entry) => entry.guess === normalized);

  if (state.status === "won" || alreadyMade) {
    return state;
  }

  const { bulls, cows } = evaluateGuess(state.secret, normalized);
  const won = bulls === length;

  return {
    ...state,
    history: [...state.history, { guess: normalized, bulls, cows }],
    status: won ? "won" : "playing",
    finishedAt: won ? now : null,
  };
};

export const isWon = (state: GameState): boolean => state.status === "won";
