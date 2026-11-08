# Bulls and Cows

A browser game written in TypeScript in a functional style: pure functions, immutable state, higher-order functions, currying, recursion and memoization. See [DESIGN.md](DESIGN.md) for the architecture.

## Rules

The computer picks a secret of unique digits. After each guess you get bulls (right digit, right place) and cows (right digit, wrong place). Settings: length 2–6, number system bin/oct/dec/hex. The length can't exceed the base, so binary allows only length 2. Best results are stored per settings in `localStorage`.

## Scripts

```bash
npm install        # also sets up the Husky hooks
npm test           # Vitest
npm run lint       # ESLint
npm run format     # Prettier
npm run build      # tsc → dist/
```

## Run

```bash
npm run build
npx serve .        # or: python3 -m http.server 8000
```

ES modules don't load from `file://`, so open the page through a static server.

## Hooks

- `pre-commit`: lint-staged (ESLint and Prettier on staged files), no tests, so a red `test:` commit is possible.
- `pre-push`: `npm test`, so failing code can't be pushed.
