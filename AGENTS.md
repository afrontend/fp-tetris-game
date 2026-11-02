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

PRs (including Dependabot) run `test.yml` (`npm test`). Actions are pinned to commit SHAs with a `# vN` comment and updated via Dependabot (`.github/dependabot.yml`: github-actions + npm, monthly); keep the SHA pin when editing by hand. CI runs Node 24. `actions/checkout` uses `persist-credentials: false`; release uploads get `GH_TOKEN` per step and the gh-pages deploy passes `github_token` to the action.

`vite.config.js` sets `base: '/fp-tetris-game/'`; keep it in sync with the Pages path.

## Layout

- `src/App.jsx` — rendering and game-specific parts (help items, debug panel labels, overlays)
- `src/useGame.js` — game loop, 3-2-1 countdown, keyboard, swipe, quick save/load, status message. **Identical in fp-tetris-game, fp-block-game and fp-snake-game**: copy changes to all three and check with `diff`
- `src/utils/keyMap.js` — keyCode → key symbol (`left`/`right`/`up`/`down`/`space`, plus app keys `p`, `save`, `load`, `debug`, `help`)
- `src/utils/getArgs.js` — URL query params (`?debug` enables debug mode)
- `src/*.test.jsx`, `src/utils/*.test.js` — vitest + Testing Library; setup in `src/setupTests.js`
- `scripts/` — Playwright screenshot/demo scripts used by CI

## App.jsx pattern

1. `const { gameState, showHelp, isDebug, countdown, message, appRef } = useGame(fpTetris, { createState: () => fpTetris.init({ rows: 17, columns: 12 }), initialDebug, isOver: fpTetris.isBlankToolPanel })`
2. The hook ticks with `setInterval(…, fpTetris.getTickInterval(state))` after the countdown, skipping ticks while help is open (and stopping when `isOver` is true)
3. Keys: `keyboard-handler` → `getKeySymbol` → `fpTetris.key(symbol, state)`; `S`/`L` quick save/load via `serializeState`/`restoreState`, `H` help overlay, `D` debug. Taps map to `space`, swipes to the strongest direction (`swipeToSymbol`)
4. `fpTetris.join(state).flat()` → `{ color }` cells rendered as `<div class="block">` (`'grey'` = empty)
5. Game-specific UI stays in `App.jsx`: score (`getScore`), game-over overlay
