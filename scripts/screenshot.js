import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 5174;
const BASE = '/fp-tetris-game/';

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
  const build = spawn('npx', ['vite', 'build'], {
    stdio: 'inherit',
    shell: true,
    cwd: ROOT,
  });
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

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 480, height: 760 });
  await page.goto(url);
  await page.waitForTimeout(1500);

  const outPath = path.resolve(ROOT, 'screenshot.png');
  await page.screenshot({ path: outPath });

  await browser.close();
  server.kill();
  console.log(`Saved: ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
