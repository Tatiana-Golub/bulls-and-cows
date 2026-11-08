import { describe, expect, it } from "vitest";
import { addAttempt, isWon, startGame, type GameState } from "./game.js";

const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

const decimal = { length: 4, base: 10 } as const;
const hex = { length: 4, base: 16 } as const;

const newGame = (): GameState => startGame(decimal, "1234", 1000);

const play = (state: GameState, guesses: readonly string[], now = 2000): GameState =>
  guesses.reduce((current, guess) => addAttempt(current, guess, now), state);

describe("startGame", () => {
  it("creates a round in the playing status", () => {
    expect(startGame(decimal, "1234", 1000)).toStrictEqual({
      settings: { length: 4, base: 10 },
      secret: "1234",
      history: [],
      status: "playing",
      startedAt: 1000,
      finishedAt: null,
    });
  });

  it("accepts a secret with a leading zero", () => {
    expect(startGame(decimal, "0123", 0).secret).toBe("0123");
  });

  it("returns independent objects on every call", () => {
    const first = startGame(decimal, "1234", 0);
    const second = startGame(decimal, "1234", 0);

    expect(first).not.toBe(second);
    expect(first.history).not.toBe(second.history);
  });

  it.each([
    ["too short", "123"],
    ["too long", "12345"],
    ["with a repeated digit", "1223"],
    ["with a character outside the base", "12a4"],
    ["empty", ""],
  ])("throws RangeError for a secret that is %s", (_label, secret) => {
    expect(() => startGame(decimal, secret, 0)).toThrow(RangeError);
  });

  it("throws RangeError for an unsupported base", () => {
    expect(() => startGame({ length: 2, base: 17 }, "12", 0)).toThrow(RangeError);
  });
});

describe("addAttempt", () => {
  describe("adding an entry", () => {
    it("appends the guess with its bulls and cows", () => {
      const next = addAttempt(newGame(), "1243", 2000);

      expect(next.history).toStrictEqual([{ guess: "1243", bulls: 2, cows: 2 }]);
    });

    it("keeps the entries in the order of the attempts", () => {
      const next = play(newGame(), ["5678", "1243", "4321"]);

      expect(next.history.map((entry) => entry.guess)).toStrictEqual([
        "5678",
        "1243",
        "4321",
      ]);
    });

    it("does not modify or remove older entries", () => {
      const first = addAttempt(newGame(), "5678", 2000);
      const second = addAttempt(first, "1243", 3000);

      expect(second.history[0]).toBe(first.history[0]);
      expect(second.history).toHaveLength(2);
    });

    it("keeps the round playing after a wrong guess", () => {
      const next = addAttempt(newGame(), "5678", 2000);

      expect(next.status).toBe("playing");
      expect(next.finishedAt).toBeNull();
    });

    it("keeps settings, secret and start time unchanged", () => {
      const before = newGame();
      const after = addAttempt(before, "5678", 2000);

      expect(after.settings).toBe(before.settings);
      expect(after.secret).toBe(before.secret);
      expect(after.startedAt).toBe(before.startedAt);
    });

    it("stores hexadecimal guesses in lowercase", () => {
      const next = addAttempt(startGame(hex, "a3f9", 0), "A3F1", 10);

      expect(next.history[0]?.guess).toBe("a3f1");
    });
  });

  describe("immutability", () => {
    it("returns a new state and a new history array", () => {
      const before = newGame();
      const after = addAttempt(before, "5678", 2000);

      expect(after).not.toBe(before);
      expect(after.history).not.toBe(before.history);
    });

    it("leaves the previous state unchanged", () => {
      const before = newGame();
      addAttempt(before, "5678", 2000);

      expect(before.history).toStrictEqual([]);
      expect(before.status).toBe("playing");
    });

    it("works on a deeply frozen state, so nothing is mutated", () => {
      const frozen = deepFreeze(play(newGame(), ["5678"]));

      expect(() => addAttempt(frozen, "1243", 3000)).not.toThrow();
      expect(() => addAttempt(frozen, "1234", 3000)).not.toThrow();
    });

    it("can be replayed with reduce to the same result", () => {
      const guesses = ["5678", "1243", "1234"];

      expect(play(newGame(), guesses)).toStrictEqual(play(newGame(), guesses));
    });
  });

  describe("winning", () => {
    it("finishes the round when every digit is a bull", () => {
      const next = addAttempt(newGame(), "1234", 5000);

      expect(next.status).toBe("won");
      expect(next.finishedAt).toBe(5000);
    });

    it("records the winning attempt in the history", () => {
      const next = play(newGame(), ["5678", "1234"]);

      expect(next.history).toHaveLength(2);
      expect(next.history[1]).toStrictEqual({ guess: "1234", bulls: 4, cows: 0 });
    });

    it("wins with an uppercase hexadecimal guess", () => {
      const next = addAttempt(startGame(hex, "a3f9", 0), "A3F9", 10);

      expect(next.status).toBe("won");
    });

    it("does not finish the round when there are only cows", () => {
      expect(addAttempt(newGame(), "4321", 2000).status).toBe("playing");
    });

    it("returns the same state for any guess after the round is won", () => {
      const won = addAttempt(newGame(), "1234", 5000);

      expect(addAttempt(won, "5678", 6000)).toBe(won);
      expect(won.history).toHaveLength(1);
      expect(won.finishedAt).toBe(5000);
    });
  });

  describe("repeated guesses", () => {
    it("returns the same state when the guess was already made", () => {
      const once = addAttempt(newGame(), "5678", 2000);

      expect(addAttempt(once, "5678", 3000)).toBe(once);
    });

    it("does not add a duplicate entry to the history", () => {
      const next = play(newGame(), ["5678", "1243", "5678"]);

      expect(next.history).toHaveLength(2);
    });

    it("treats guesses that differ only by case as repeated", () => {
      const once = addAttempt(startGame(hex, "a3f9", 0), "A3F1", 10);

      expect(addAttempt(once, "a3f1", 20)).toBe(once);
    });
  });

  describe("invalid guesses", () => {
    it.each([
      ["too short", "123"],
      ["too long", "12345"],
      ["with a repeated digit", "1223"],
      ["with a character outside the base", "12a4"],
      ["empty", ""],
    ])("throws RangeError for a guess that is %s", (_label, guess) => {
      expect(() => addAttempt(newGame(), guess, 2000)).toThrow(RangeError);
    });

    it("does not change the state when the guess is invalid", () => {
      const before = deepFreeze(newGame());

      expect(() => addAttempt(before, "12", 2000)).toThrow(RangeError);
      expect(before.history).toStrictEqual([]);
    });
  });
});

describe("isWon", () => {
  it("is false for a new round", () => {
    expect(isWon(newGame())).toBe(false);
  });

  it("is false after wrong guesses", () => {
    expect(isWon(play(newGame(), ["5678", "4321"]))).toBe(false);
  });

  it("is true after the secret is guessed", () => {
    expect(isWon(play(newGame(), ["5678", "1234"]))).toBe(true);
  });

  it("does not change by itself between calls", () => {
    const state = newGame();

    expect(isWon(state)).toBe(isWon(state));
  });
});
