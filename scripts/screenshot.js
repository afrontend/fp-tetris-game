import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fpTetris from 'fp-tetris';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 5174;
const BASE = '/fp-tetris-game/';
const ROWS = 17;
const COLS = 12;
const PIECES_TO_PLACE = 12;
const RNG_SEED = 42;

// LCG PRNG — same sequence injected into the browser so piece order matches
function makeLcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

// AI heuristics from fp-tetris/scripts/autoplay.js
function countFilled(bgPanel) {
  return bgPanel.reduce(
    (sum, row) => sum + row.filter(item => !fpTetris.isBlank(item)).length,
    0,
  );
}

function evaluate(bgPanel, linesCleared) {
  const rows = bgPanel.length;
  const cols = bgPanel[0].length;
  const heights = Array(cols).fill(0);
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (!fpTetris.isBlank(bgPanel[r][c])) {
        heights[c] = rows - r;
        break;
      }
    }
  }
  const aggregateHeight = heights.reduce((a, b) => a + b, 0);
  let holes = 0;
  for (let c = 0; c < cols; c++) {
    let blockFound = false;
    for (let r = 0; r < rows; r++) {
      if (!fpTetris.isBlank(bgPanel[r][c])) blockFound = true;
      else if (blockFound) holes++;
    }
  }
  let bumpiness = 0;
  for (let c = 0; c < cols - 1; c++) {
    bumpiness += Math.abs(heights[c] - heights[c + 1]);
  }
  return -0.51 * aggregateHeight + 0.76 * linesCleared - 0.36 * holes - 0.18 * bumpiness;
}

function getBestMove(state) {
  const cols = fpTetris.join(state)[0].length;
  let bestScore = -Infinity;
  let bestKeys = [];
  for (let rot = 0; rot < 4; rot++) {
    let rotState = state;
    for (let i = 0; i < rot; i++) rotState = fpTetris.key('up', rotState);
    let leftState = rotState;
    for (let i = 0; i < cols; i++) leftState = fpTetris.key('left', leftState);
    let posState = leftState;
    for (let c = 0; c <= cols; c++) {
      const before = countFilled(posState.bgPanel);
      const dropped = fpTetris.key('space', posState);
      const after = countFilled(dropped.bgPanel);
      const lines = Math.round((before + 4 - after) / cols);
      const score = evaluate(dropped.bgPanel, lines);
      if (score > bestScore) {
        bestScore = score;
        bestKeys = [
          ...Array(rot).fill('up'),
          ...Array(cols).fill('left'),
          ...Array(c).fill('right'),
          'space',
        ];
      }
      posState = fpTetris.key('right', posState);
    }
  }
  return bestKeys;
}

const PLAYWRIGHT_KEY = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  space: 'Space',
};

async function waitForServer(url, timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {}
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error(`Server not ready after ${timeout}ms`);
}

async function main() {
  console.log('Building...');
  const build = spawn('npx', ['vite', 'build'], { stdio: 'inherit', shell: true, cwd: ROOT });
  await new Promise((resolve, reject) => {
    build.on('close', code =>
      code === 0 ? resolve() : reject(new Error(`Build failed: ${code}`))
    );
  });

  console.log('Starting preview server...');
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
    stdio: 'pipe',
    shell: true,
    cwd: ROOT,
  });
  const url = `http://localhost:${PORT}${BASE}`;
  await waitForServer(url);
  console.log(`Server ready at ${url}`);

  // Compute AI moves in Node.js with seeded RNG
  const rng = makeLcg(RNG_SEED);
  let state = fpTetris.init({
    rows: ROWS,
    columns: COLS,
    pieceSelector: len => Math.floor(rng() * len),
  });
  const allKeys = [];
  for (let i = 0; i < PIECES_TO_PLACE; i++) {
    if (fpTetris.isBlankToolPanel(state)) break;
    const moves = getBestMove(state);
    allKeys.push(...moves);
    for (const k of moves) state = fpTetris.key(k, state);
  }
  console.log(`Sending ${allKeys.length} key events for ${PIECES_TO_PLACE} pieces...`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Patch Math.random with same seeded LCG so browser piece order matches Node.js
  await page.addInitScript(`
    (() => {
      let s = ${RNG_SEED} >>> 0;
      Math.random = function () {
        s = (Math.imul(s, 1664525) + 1013904223) | 0;
        return (s >>> 0) / 4294967296;
      };
    })();
  `);

  await page.setViewportSize({ width: 480, height: 760 });
  await page.goto(url);
  await page.waitForTimeout(500);

  // H: show help overlay → pauses tick timer, state.pause stays false so key events still work
  await page.keyboard.press('h');
  await page.waitForTimeout(100);

  for (const k of allKeys) {
    await page.keyboard.press(PLAYWRIGHT_KEY[k]);
  }
  await page.waitForTimeout(200);

  // H: hide help overlay → ticks resume
  await page.keyboard.press('h');
  await page.waitForTimeout(100);

  const outPath = path.resolve(ROOT, 'screenshot.png');
  await page.screenshot({ path: outPath });

  await browser.close();
  server.kill();
  console.log(`Saved: ${outPath}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
