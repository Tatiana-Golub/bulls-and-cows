## Architecture

```
src/logic/   pure functions, no DOM, no clock, no randomness of their own
src/ui/      DOM code: views, actions (state transitions), store, helpers
src/main.ts  entry point: loads and saves scores, mounts the app
```

Impure calls (`Math.random`, `Date.now`, `localStorage`) are only in the UI layer: `main.ts`, `settingsView.ts` and `gameView.ts`. `src/logic/` never calls them directly.

- All game logic is plain functions over plain readonly objects. There are no classes (ESLint forbids `ClassDeclaration`) and `no-param-reassign` is on.
- Impure inputs are passed in as parameters: `generateSecret(length, base, random)`, `startGame(settings, secret, now)`, `addAttempt(state, guess, now)`, `loadScores(storage)`. Tests pass fixed values.
- The UI is a function of state: `view(state) → DOM`. State changes only through pure transitions `AppState → AppState` (`src/ui/actions.ts`). `src/ui/store.ts` is a closure holding the current state, with no classes.
- No `innerHTML` or `insertAdjacentHTML`. `h()` in `src/ui/dom.ts` builds elements with `createElement` and `append`, so text is never parsed as HTML.

## Data structures and algorithms

### Alphabet and digits (`digits.ts`)

`ALPHABET = "0123456789abcdef"`. A base uses `ALPHABET.slice(0, base)`. Digits are characters, so hex needs letters and leading zeros are kept.
`createDigitValidator(base)` is a curried factory. It validates the base once, builds a `Set` of the valid lowercase characters, and returns `(char) => set.has(char.toLowerCase())`. Membership is O(1), and case is ignored for hex.

### Secret and guess

Both are strings of unique characters. A string keeps leading zeros (`"0123"`) and is compared character by character.

### `generateSecret` (`secret.ts`)

The algorithm picks from a pool of unused digits instead of retrying until digits are unique:

1. Start with the pool `ALPHABET.slice(0, base)`.
2. Pick the index `floor(random() * pool.length)`, take that digit, and recurse on a new pool without it (`withoutIndex`, built with `slice` and spread).
3. Stop when `count === 0`.

Uniqueness holds by construction, exactly `length` random values are used, and no array is mutated. Because `random` is a parameter, a test can pass a constant or a seeded generator and know the result.

### `evaluateGuess` (`evaluate.ts`)

Both strings are lowercased and spread into arrays. Then:

- `bulls = guess.filter((d, i) => d === secret[i]).length`
- `shared = guess.filter((d) => secretSet.has(d)).length`
- `cows = shared - bulls`

Every bull is also a shared digit, so the shared digits that are not bulls are the cows. This relies on unique digits, which `generateSecret` and `isValidGuess` guarantee. There are no loops and no counters, only `filter` and `Set`.

### `isValidGuess` (`guess.ts`)

Three checks: the length matches, every character passes `createDigitValidator(base)` (`every`), and no digit repeats (`new Set(chars).size === chars.length`). The guess is lowercased first, so `aA` counts as a repeat.

### `countPossibleSecrets` (`count.ts`)

The count is the number of permutations P(base, length) = base! / (base − length)!. A leading zero is allowed, so nothing is subtracted. The recursion is

```
count(0, base)       = 1
count(length, base)  = 0                          if length > base
count(length, base)  = base * count(length - 1, base - 1)
```

The recursive function is wrapped in the generic higher-order function `memoize` (`memoize.ts`) and calls itself through the memoized name, so every recursive step is cached. A call for `(6, 16)` also stores `(5, 15)`, `(4, 14)` and so on. `memoize` keeps a `Map` in a closure, keyed by `JSON.stringify(args)`. It uses `has` before `get`, so cached `0` and `undefined` work, and a call that throws is not cached. It is meant for primitive arguments, which is all this game needs.

### Game state and history (`game.ts`)

```ts
type GameState = {
  settings;
  secret;
  history: readonly Attempt[]; // { guess, bulls, cows }
  status: "playing" | "won";
  startedAt: number;
  finishedAt: number | null;
};
```

- `addAttempt` never changes its input. It returns `{ ...state, history: [...state.history, entry], status, finishedAt }`.
- A repeated guess (compared case-insensitively) or any guess after a win returns the same state object, so callers detect "nothing happened" with `===` and the history never contains duplicates.
- The round is won when `bulls === length`. `finishedAt` is the `now` of the winning guess, so the time is `finishedAt - startedAt`.
- Time is a parameter, so the logic never reads the clock.

### Settings (`settings.ts`)

`isLengthAvailable(length, base)` is the single rule: an integer from 2 to 6, not above the base. `availableLengths`, `setLength` and the disabled buttons in the view all use it, so binary allows only length 2 in every place. `setBase` lowers the length to `min(length, 6, base)` and never raises it.

### High scores (`scores.ts`, `storage.ts`)

- `HighScores` is a record from `"length:base"` to a ranked `ScoreTable`, so every settings combination has its own table.
- `compareScores` is the one definition of "better": fewer attempts, then less time. `rankScores` sorts a copy (the sort is stable) and cuts the result to `TOP_N`. `insertScore` is "append, then rank". `recordScore` replaces one key and keeps the other tables as the same objects.
- Data in `localStorage` is untrusted. `parseScores` never throws: it validates the JSON, the key pattern `/^\d+:\d+$/`, every entry (`attempts` integer ≥ 1, `timeMs` finite ≥ 0), strips extra fields, and re-ranks. One bad entry does not drop the good ones.
- `loadScores` and `saveScores` take a `StorageLike` (`getItem`, `setItem`), so tests use a `Map`-backed fake. `saveScores` returns `false` instead of throwing when the storage is full or blocked.

## Complexity

Notation: `n` = secret length, `b` = base.

| Function                     | Time                         | Space    | Why                                                                                                                                                                                                                                                                                                       |
| ---------------------------- | ---------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateSecret(n, b)`       | O(n·b)                       | O(n·b)   | There are `n` recursion levels. Each copies a pool of at most `b` digits (`withoutIndex`) and uses one random value. Since `n ≤ b`, the cost of building the result array (O(n) per level) is dominated by the pool copy. The stack holds one pool per level. With `b ≤ 16` and `n ≤ 6` the cost is tiny. |
| `evaluateGuess(s, g)`        | O(n)                         | O(n)     | Two `filter` passes, each with O(1) `Set` lookups, plus building the `Set` and arrays. With `includes` instead of a `Set` it would be O(n²).                                                                                                                                                              |
| `isValidGuess(g, n, b)`      | O(n + b)                     | O(n + b) | Building the validator makes a `Set` of `b` digits, `every` is one pass with O(1) lookups, and the duplicate check builds a `Set` of `n` items.                                                                                                                                                           |
| `countPossibleSecrets(n, b)` | O(n) first call, O(1) cached | O(n)     | The recursion has depth `n` with one multiplication per level. The memo `Map` stores at most one entry per level, and a repeated call is a single lookup. Without memoization every call would cost O(n).                                                                                                 |

## Clean Code principles applied

| Principle                             | Where                                                                                                                                                                              |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Small functions that do one thing     | `evaluate.ts` (`toDigits`), `guess.ts` (`hasUniqueItems`), `secret.ts` (`withoutIndex`, `pickDigits`, `assertSettings`), `storage.ts` (`isScoreEntry`, `parseJson`, `parseTable`)  |
| Intention-revealing names             | `isLengthAvailable`, `compareScores`, `entryFromGame`, `beginRound`, `chooseBase`                                                                                                  |
| No magic numbers                      | `MIN_BASE`, `MAX_BASE` in `digits.ts`, `MIN_LENGTH` and `MAX_LENGTH` in `settings.ts`, `TOP_N` in `scores.ts`, `STORAGE_KEY` in `storage.ts`                                       |
| Guard clauses instead of deep nesting | `createDigitValidator`, `generateSecret`, `rankScores`, `entryFromGame`                                                                                                            |
| DRY: one source of truth              | `ALPHABET` shared by the validator, the generator and `setBase`. `isLengthAvailable` is used by the logic and the view. `compareScores` is used by `rankScores` and `insertScore`. |
| Functional core, impure edge          | Pure functions in `src/logic/`. Clock, `Math.random` and `localStorage` are touched only in `settingsView.ts` (click handler) and `main.ts`.                                       |
| Dependency injection for testability  | `random` in `generateSecret`, `now` in `startGame` and `addAttempt`, `StorageLike` in `loadScores` and `saveScores`                                                                |
| Errors as exceptions, not error codes | `RangeError` for programmer errors (`setBase`, `addAttempt`), a no-op for normal user actions (`setLength` on a disabled button)                                                   |
| Immutability and no side effects      | Spread, `[...history, entry]` and `slice` everywhere. Tests use `deepFreeze` to prove no function mutates its input.                                                               |
| Separate the layers                   | The logic does not import the DOM. Views get `update` as a parameter. Actions are pure transitions.                                                                                |
| Tests that follow FIRST               | Fast and independent (no shared mutable state, fakes instead of `localStorage`), repeatable (seeded random, injected time), self-validating (assertions only)                      |
