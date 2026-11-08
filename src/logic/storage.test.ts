import { describe, expect, it, vi } from "vitest";
import type { HighScores } from "./scores.js";
import { TOP_N } from "./scores.js";
import {
  loadScores,
  parseScores,
  saveScores,
  serializeScores,
  STORAGE_KEY,
  type StorageLike,
} from "./storage.js";

const sample: HighScores = {
  "4:10": [
    { attempts: 3, timeMs: 9000 },
    { attempts: 5, timeMs: 4000 },
  ],
  "3:16": [{ attempts: 7, timeMs: 12000 }],
};

const memoryStorage = (initial: Record<string, string> = {}): StorageLike => {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
};

describe("serializeScores", () => {
  it("returns a JSON string", () => {
    expect(typeof serializeScores(sample)).toBe("string");
    expect(() => JSON.parse(serializeScores(sample))).not.toThrow();
  });

  it("serializes empty scores as an empty object", () => {
    expect(serializeScores({})).toBe("{}");
  });

  it("is reversible with parseScores", () => {
    expect(parseScores(serializeScores(sample))).toStrictEqual(sample);
  });

  it("gives the same string for the same scores", () => {
    expect(serializeScores(sample)).toBe(serializeScores(sample));
  });
});

describe("parseScores", () => {
  describe("missing or unreadable data", () => {
    it("returns empty scores for null", () => {
      expect(parseScores(null)).toStrictEqual({});
    });

    it("returns empty scores for an empty string", () => {
      expect(parseScores("")).toStrictEqual({});
    });

    it.each(["{", "not json", "undefined", "{'a': 1}"])(
      "returns empty scores for invalid JSON %j",
      (raw) => {
        expect(parseScores(raw)).toStrictEqual({});
      },
    );

    it.each(["null", "42", '"text"', "true", "[]", '[{"attempts":1,"timeMs":1}]'])(
      "returns empty scores when the JSON is not an object (%s)",
      (raw) => {
        expect(parseScores(raw)).toStrictEqual({});
      },
    );
  });

  describe("valid data", () => {
    it("restores every table", () => {
      expect(parseScores(JSON.stringify(sample))).toStrictEqual(sample);
    });

    it("ranks a table that was stored in the wrong order", () => {
      const raw = JSON.stringify({
        "4:10": [
          { attempts: 9, timeMs: 1 },
          { attempts: 2, timeMs: 5 },
          { attempts: 2, timeMs: 3 },
        ],
      });

      expect(parseScores(raw)["4:10"]).toStrictEqual([
        { attempts: 2, timeMs: 3 },
        { attempts: 2, timeMs: 5 },
        { attempts: 9, timeMs: 1 },
      ]);
    });

    it("keeps at most TOP_N entries per table", () => {
      const many = Array.from({ length: TOP_N + 5 }, (_, i) => ({
        attempts: i + 1,
        timeMs: 0,
      }));

      expect(parseScores(JSON.stringify({ "4:10": many }))["4:10"]).toHaveLength(TOP_N);
    });

    it("drops unknown extra fields of an entry", () => {
      const raw = JSON.stringify({ "4:10": [{ attempts: 3, timeMs: 10, name: "x" }] });

      expect(parseScores(raw)["4:10"]).toStrictEqual([{ attempts: 3, timeMs: 10 }]);
    });
  });

  describe("tampered data", () => {
    it("drops a table that is not an array", () => {
      const raw = JSON.stringify({ "4:10": "oops", "3:16": sample["3:16"] });

      expect(parseScores(raw)).toStrictEqual({ "3:16": sample["3:16"] });
    });

    it.each([
      ["a negative number of attempts", { attempts: -1, timeMs: 10 }],
      ["zero attempts", { attempts: 0, timeMs: 10 }],
      ["a fractional number of attempts", { attempts: 2.5, timeMs: 10 }],
      ["a negative time", { attempts: 3, timeMs: -5 }],
      ["a string instead of a number", { attempts: "3", timeMs: 10 }],
      ["a missing field", { attempts: 3 }],
      ["null", null],
      ["a number", 7],
      ["a null time", { attempts: 3, timeMs: null }],
    ])("drops an entry with %s", (_label, bad) => {
      const good = { attempts: 4, timeMs: 20 };
      const raw = JSON.stringify({ "4:10": [bad, good] });

      expect(parseScores(raw)["4:10"]).toStrictEqual([good]);
    });

    it("drops keys that are not a settings key", () => {
      const raw = JSON.stringify({
        "4:10": sample["3:16"],
        constructor: sample["3:16"],
        abc: sample["3:16"],
        "4-10": sample["3:16"],
      });

      expect(Object.keys(parseScores(raw))).toStrictEqual(["4:10"]);
    });

    it("does not pollute the prototype", () => {
      parseScores('{"__proto__": [{"attempts": 1, "timeMs": 1}]}');

      expect(({} as Record<string, unknown>)["attempts"]).toBeUndefined();
      expect(Object.getPrototypeOf({})).toBe(Object.prototype);
    });
  });
});

describe("loadScores", () => {
  it("returns empty scores when nothing is stored", () => {
    expect(loadScores(memoryStorage())).toStrictEqual({});
  });

  it("reads the scores stored under STORAGE_KEY", () => {
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(sample) });

    expect(loadScores(storage)).toStrictEqual(sample);
  });

  it("asks the storage for exactly STORAGE_KEY", () => {
    const getItem = vi.fn(() => null);

    loadScores({ getItem, setItem: vi.fn() });

    expect(getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it("returns empty scores when the stored data is corrupted", () => {
    expect(loadScores(memoryStorage({ [STORAGE_KEY]: "{broken" }))).toStrictEqual({});
  });

  it("ignores data stored under other keys", () => {
    expect(loadScores(memoryStorage({ other: JSON.stringify(sample) }))).toStrictEqual(
      {},
    );
  });

  it("returns empty scores when reading from the storage throws", () => {
    const storage: StorageLike = {
      getItem: () => {
        throw new Error("access denied");
      },
      setItem: vi.fn(),
    };

    expect(loadScores(storage)).toStrictEqual({});
  });
});

describe("saveScores", () => {
  it("writes the serialized scores under STORAGE_KEY", () => {
    const setItem = vi.fn();

    saveScores({ getItem: () => null, setItem }, sample);

    expect(setItem).toHaveBeenCalledTimes(1);
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, serializeScores(sample));
  });

  it("returns true when the write succeeds", () => {
    expect(saveScores(memoryStorage(), sample)).toBe(true);
  });

  it("makes the scores readable by loadScores", () => {
    const storage = memoryStorage();

    saveScores(storage, sample);

    expect(loadScores(storage)).toStrictEqual(sample);
  });

  it("replaces previously saved scores", () => {
    const storage = memoryStorage();

    saveScores(storage, sample);
    saveScores(storage, {});

    expect(loadScores(storage)).toStrictEqual({});
  });

  it("returns false instead of throwing when the write fails", () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota exceeded");
      },
    };

    expect(saveScores(storage, sample)).toBe(false);
  });

  it("does not modify the scores it saves", () => {
    const frozen = Object.freeze({ "4:10": Object.freeze([{ attempts: 3, timeMs: 1 }]) });

    expect(() => saveScores(memoryStorage(), frozen)).not.toThrow();
  });
});
