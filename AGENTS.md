# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, OpenCode, pi, …) working in this repository.
`CLAUDE.md` only imports this file (`@AGENTS.md`); edit this file, not `CLAUDE.md`.

## What this is

`fp-tetris-game` is the React web frontend for the Tetris game, deployed to GitHub Pages at https://afrontend.github.io/fp-tetris-game. It sits in the afrontend game stack:

```
fp-panel (npm) → fp-tetris (npm, game logic) → fp-tetris-game (this repo)
```

All game rules live in the `fp-tetris` npm package; this repo only renders state and maps input. Fix rule bugs in `fp-tetris`, publish, then bump the dependency here (or `npm link` while iterating).

## Commands

```sh
npm start           # Vite dev server
npm run build       # production build → dist/
npm run preview     # serve the built dist/
npm test            # vitest run (jsdom)
npm run screenshot  # Playwright screenshot (scripts/screenshot.js)
npm run demo        # Playwright + ffmpeg demo GIF (scripts/demo.js)
npm run deploy      # manual fallback: build + gh-pages -d dist
```

## Deployment (CI)

Pushing to `master` runs GitHub Actions:

- `deploy.yml` — `npm ci` → `npm test` (gate) → `npm run build` → publish `dist/` to the `gh-pages` branch
- `screenshot.yml` / `demo.yml` — regenerate `screenshot.png` / `demo.gif` and upload them to the `screenshots` GitHub release (README images point there)

PRs (including Dependabot) run `test.yml` (`npm test`). Actions are pinned to commit SHAs with a `# vN` comment and updated via Dependabot (`.github/dependabot.yml`: github-actions + npm, monthly); keep the SHA pin when editing by hand. CI runs Node 24.

`vite.config.js` sets `base: '/fp-tetris-game/'`; keep it in sync with the Pages path.

## Layout

- `src/App.jsx` — the whole game UI
- `src/utils/keyMap.js` — keyCode → key symbol (`left`/`right`/`up`/`down`/`space`, plus app keys `p`, `save`, `load`, `debug`, `help`)
- `src/utils/getArgs.js` — URL query params (`?debug` enables debug mode)
- `src/*.test.jsx`, `src/utils/*.test.js` — vitest + Testing Library; setup in `src/setupTests.js`
- `scripts/` — Playwright screenshot/demo scripts used by CI

## App.jsx pattern

1. `useState(() => fpTetris.init({ rows: 17, columns: 12 }))` — game state
2. `setInterval(() => setGameState(s => fpTetris.tick(s)), fpTetris.getTickInterval(state))` — game loop; a 3-2-1 countdown runs before it starts
3. `keyboard-handler` `keyPressed` → `getKeySymbol` → `fpTetris.key(symbol, state)`; `S`/`L` quick save/load via `serializeState`/`restoreState`, `H` help overlay, `D` debug
4. `fpTetris.join(state).flat()` → `{ color }` cells rendered as memoized `<div class="block">` (`'grey'` = empty)
5. Touch: swipe / tap detection on the container element
