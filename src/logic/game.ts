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
  throw new Error(`Not implemented (${settings.length}, ${secret}, ${now})`);
};

export const addAttempt = (state: GameState, guess: string, now: number): GameState => {
  throw new Error(`Not implemented (${state.status}, ${guess}, ${now})`);
};

export const isWon = (state: GameState): boolean => {
  throw new Error(`Not implemented (${state.status})`);
};
