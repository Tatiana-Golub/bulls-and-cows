import { describe, expect, it } from "vitest";
import { addAttempt, startGame } from "./game.js";
import {
  compareScores,
  entryFromGame,
  insertScore,
  rankScores,
  recordScore,
  settingsKey,
  tableFor,
  TOP_N,
  type HighScores,
  type ScoreEntry,
} from "./scores.js";

const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

const entry = (attempts: number, timeMs: number): ScoreEntry => ({ attempts, timeMs });

const decimal = { length: 4, base: 10 } as const;
const hex = { length: 4, base: 16 } as const;

describe("settingsKey", () => {
  it("is the same for equal settings", () => {
    expect(settingsKey({ length: 4, base: 10 })).toBe(
      settingsKey({ length: 4, base: 10 }),
    );
  });

  it("differs when the length differs", () => {
    expect(settingsKey({ length: 3, base: 10 })).not.toBe(
      settingsKey({ length: 4, base: 10 }),
    );
  });

  it("differs when the base differs", () => {
    expect(settingsKey(decimal)).not.toBe(settingsKey(hex));
  });

  it("cannot confuse length and base when the digits run together", () => {
    expect(settingsKey({ length: 1, base: 12 })).not.toBe(
      settingsKey({ length: 11, base: 2 }),
    );
  });
});

describe("compareScores", () => {
  it("puts fewer attempts first", () => {
    expect(compareScores(entry(3, 9000), entry(5, 1000))).toBeLessThan(0);
    expect(compareScores(entry(5, 1000), entry(3, 9000))).toBeGreaterThan(0);
  });

  it("breaks a tie by less time", () => {
    expect(compareScores(entry(4, 1000), entry(4, 2000))).toBeLessThan(0);
    expect(compareScores(entry(4, 2000), entry(4, 1000))).toBeGreaterThan(0);
  });

  it("returns 0 for identical results", () => {
    expect(compareScores(entry(4, 1000), entry(4, 1000))).toBe(0);
  });
});

describe("rankScores", () => {
  it("returns an empty table for no entries", () => {
    expect(rankScores([])).toStrictEqual([]);
  });

  it("sorts by attempts, then by time", () => {
    const ranked = rankScores([
      entry(5, 100),
      entry(3, 900),
      entry(3, 400),
      entry(4, 50),
    ]);

    expect(ranked).toStrictEqual([
      entry(3, 400),
      entry(3, 900),
      entry(4, 50),
      entry(5, 100),
    ]);
  });

  it("keeps only the best entries up to the limit", () => {
    const ranked = rankScores([entry(6, 1), entry(2, 1), entry(4, 1), entry(3, 1)], 2);

    expect(ranked).toStrictEqual([entry(2, 1), entry(3, 1)]);
  });

  it("uses a limit of TOP_N by default", () => {
    const many = Array.from({ length: TOP_N + 5 }, (_, i) => entry(i + 1, 0));

    expect(rankScores(many)).toHaveLength(TOP_N);
  });

  it("keeps the original order of equal results", () => {
    const first = entry(4, 1000);
    const second = entry(4, 1000);

    const ranked = rankScores([first, second]);

    expect(ranked[0]).toBe(first);
    expect(ranked[1]).toBe(second);
  });

  it("does not modify the input and returns a new array", () => {
    const input = deepFreeze([entry(5, 1), entry(2, 1)]);

    const ranked = rankScores(input);

    expect(ranked).not.toBe(input);
    expect(input).toStrictEqual([entry(5, 1), entry(2, 1)]);
  });

  it.each([0, -1, 1.5, Number.NaN])("throws RangeError for limit %s", (limit) => {
    expect(() => rankScores([entry(1, 1)], limit)).toThrow(RangeError);
  });
});

describe("insertScore", () => {
  it("adds an entry to an empty table", () => {
    expect(insertScore([], entry(4, 1000))).toStrictEqual([entry(4, 1000)]);
  });

  it("places the entry at its ranked position", () => {
    const table = [entry(2, 100), entry(5, 100)];

    expect(insertScore(table, entry(3, 100))).toStrictEqual([
      entry(2, 100),
      entry(3, 100),
      entry(5, 100),
    ]);
  });

  it("puts a new entry after an existing equal one", () => {
    const existing = entry(4, 1000);
    const added = entry(4, 1000);

    const table = insertScore([existing], added);

    expect(table[0]).toBe(existing);
    expect(table[1]).toBe(added);
  });

  it("pushes out the worst entry when the table is full and the new one is better", () => {
    const table = [entry(2, 1), entry(3, 1), entry(4, 1)];

    expect(insertScore(table, entry(1, 1), 3)).toStrictEqual([
      entry(1, 1),
      entry(2, 1),
      entry(3, 1),
    ]);
  });

  it("drops a new entry that is worse than every entry in a full table", () => {
    const table = [entry(2, 1), entry(3, 1), entry(4, 1)];

    expect(insertScore(table, entry(9, 1), 3)).toStrictEqual(table);
  });

  it("does not modify the original table", () => {
    const table = deepFreeze([entry(2, 1), entry(5, 1)]);

    const next = insertScore(table, entry(3, 1));

    expect(next).not.toBe(table);
    expect(table).toStrictEqual([entry(2, 1), entry(5, 1)]);
  });

  it("keeps at most TOP_N entries by default", () => {
    const full = Array.from({ length: TOP_N }, (_, i) => entry(i + 1, 0));

    expect(insertScore(full, entry(0, 0))).toHaveLength(TOP_N);
  });
});

describe("recordScore", () => {
  it("creates the table for settings that have none yet", () => {
    const scores = recordScore({}, decimal, entry(4, 1000));

    expect(scores[settingsKey(decimal)]).toStrictEqual([entry(4, 1000)]);
  });

  it("adds to the table of the same settings in ranked order", () => {
    const start = recordScore({}, decimal, entry(5, 1000));
    const next = recordScore(start, decimal, entry(3, 2000));

    expect(tableFor(next, decimal)).toStrictEqual([entry(3, 2000), entry(5, 1000)]);
  });

  it("keeps a separate table for every settings combination", () => {
    const first = recordScore({}, decimal, entry(4, 1000));
    const both = recordScore(first, hex, entry(7, 3000));

    expect(tableFor(both, decimal)).toStrictEqual([entry(4, 1000)]);
    expect(tableFor(both, hex)).toStrictEqual([entry(7, 3000)]);
  });

  it("keeps the other tables as the same objects", () => {
    const first = recordScore({}, decimal, entry(4, 1000));
    const both = recordScore(first, hex, entry(7, 3000));

    expect(tableFor(both, decimal)).toBe(tableFor(first, decimal));
  });

  it("does not modify the previous scores", () => {
    const before: HighScores = deepFreeze(recordScore({}, decimal, entry(4, 1000)));

    const after = recordScore(before, decimal, entry(2, 500));

    expect(after).not.toBe(before);
    expect(tableFor(before, decimal)).toStrictEqual([entry(4, 1000)]);
  });

  it("respects the limit", () => {
    const scores = [entry(1, 1), entry(2, 1), entry(3, 1)].reduce(
      (current, item) => recordScore(current, decimal, item, 2),
      {} as HighScores,
    );

    expect(tableFor(scores, decimal)).toStrictEqual([entry(1, 1), entry(2, 1)]);
  });
});

describe("tableFor", () => {
  it("returns an empty table for unknown settings", () => {
    expect(tableFor({}, decimal)).toStrictEqual([]);
  });

  it("returns the stored table", () => {
    const scores = recordScore({}, hex, entry(6, 4000));

    expect(tableFor(scores, hex)).toStrictEqual([entry(6, 4000)]);
  });

  it("does not return the table of other settings", () => {
    const scores = recordScore({}, hex, entry(6, 4000));

    expect(tableFor(scores, decimal)).toStrictEqual([]);
  });
});

describe("entryFromGame", () => {
  const wonGame = () =>
    ["5678", "1243", "1234"].reduce(
      (state, guess, i) => addAttempt(state, guess, 1000 + (i + 1) * 1500),
      startGame(decimal, "1234", 1000),
    );

  it("counts every attempt, including the winning one", () => {
    expect(entryFromGame(wonGame()).attempts).toBe(3);
  });

  it("measures the time from the start to the winning guess", () => {
    expect(entryFromGame(wonGame()).timeMs).toBe(4500);
  });

  it("returns exactly the attempts and the time", () => {
    expect(entryFromGame(wonGame())).toStrictEqual({ attempts: 3, timeMs: 4500 });
  });

  it("throws RangeError while the round is still in progress", () => {
    const playing = addAttempt(startGame(decimal, "1234", 0), "5678", 10);

    expect(() => entryFromGame(playing)).toThrow(RangeError);
  });
});
