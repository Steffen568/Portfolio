// Unit 07 — Demos + screenshots. Each test names the spec line it guards (specs/07-demos.md).
// Runs on a shipped-files server like unit 06's: only tracked files, exact case, under /portfolio/.
import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const WEBDEV = resolve(ROOT, '..');
const DEMOS = [
  { id: 'slate', name: 'slatehub', from: 'slatehub-backend/portfolio-demo' },
  { id: 'holy', name: 'holy-cross', from: 'HolyCrossRevamp/portfolio-demo' },
  { id: 'dfs', name: 'scout-dfs', from: 'SCOUT_DFS/portfolio-demo' },
  { id: 'scout', name: 'scout-team', from: 'CFB_HUB/portfolio-demo' },
  { id: 'wire', name: 'the-wire', from: 'CFB_HUB/portfolio-demo-wire' },
  { id: 'optom', name: 'eye-care', from: 'AEC_ReDesign/portfolio-demo' }
];
const TRACKED = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' }).split('\0').filter((f) => f && existsSync(join(ROOT, f)));
const SHIPS = new Set(TRACKED);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ics': 'text/calendar' };
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = (dir) => walk(dir).map((p) => relative(dir, p).split('\\').join('/')).sort();
const FONTS = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

let server, BASE;
test.beforeAll(async () => {
  server = createServer((req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    const rel = url.startsWith('/portfolio/') ? url.slice('/portfolio/'.length) : null;
    const file = rel === null ? null : !rel ? 'index.html' : rel.replace(/\/$/, '/index.html');
    if (!file || !SHIPS.has(file)) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(readFileSync(join(ROOT, file)));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  BASE = `http://127.0.0.1:${server.address().port}/portfolio/`;
});
test.afterAll(() => new Promise((r) => server.close(r)));

for (const d of DEMOS) {
  // Line 1: the demo is its source folder, byte for byte, nothing extra.
  test(`${d.name} is a byte-for-byte copy of ${d.from}`, () => {
    const src = join(WEBDEV, d.from), dst = join(ROOT, 'demos', d.name);
    expect(existsSync(dst), `demos/${d.name}/ copied in`).toBe(true);
    const want = files(src);
    expect(files(dst)).toEqual(want);
    const differ = want.filter((f) => !readFileSync(join(src, f)).equals(readFileSync(join(dst, f))));
    expect(differ).toEqual([]);
  });

  // Line 2: it opens under /portfolio/demos/<name>/ from the committed files, and stays inside its folder.
  test(`${d.name} opens from the committed files and stays inside its folder`, async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [], bad = [];
    const home = BASE + 'demos/' + d.name + '/';
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('request', (r) => {
      const u = r.url();
      if (/^(data|blob|about):/.test(u) || FONTS.test(u)) return;
      if (!u.startsWith(home)) bad.push('outside its folder: ' + u);
    });
    page.on('response', (r) => { if (r.url().startsWith(BASE) && r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
    page.on('requestfailed', (r) => { if (r.url().startsWith(home)) bad.push('failed ' + r.url()); });
    const res = await page.goto(home, { waitUntil: 'networkidle' });
    expect(res.status()).toBe(200);
    expect(bad).toEqual([]);
    expect(errors).toEqual([]);
    await page.close();
  });

  // Line 3: the folder rules (handoff-COMMON.md "Deliverable").
  test(`${d.name} follows the demo folder rules`, () => {
    const dir = join(ROOT, 'demos', d.name);
    const all = files(dir);
    expect(all).toContain('index.html');
    expect(all).toContain('screenshots/desktop.png');
    const size = all.reduce((n, f) => n + statSync(join(dir, f)).size, 0);
    expect(size, 'bytes').toBeLessThan(25 * 1024 * 1024);
    const abs = all.filter((f) => /\.(html|css|m?js)$/i.test(f)).filter((f) => /(?:\b(?:href|src|action)\s*=\s*["']|url\(\s*["']?)\/(?!\/)/.test(readFileSync(join(dir, f), 'utf8')));
    expect(abs, 'files with a path starting with /').toEqual([]);
  });
}

async function open(browser, width) {
  const page = await browser.newPage({ viewport: { width, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(BASE);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll('.card')].flatMap((c) => c.getAnimations().map((a) => a.finished)));
  });
  return { page, errors };
}
// The picture fills its box (inside the box's border), cropped from the top, and has loaded.
const shot = (img) => {
  const i = img.getBoundingClientRect(), p = img.parentElement, b = p.getBoundingClientRect(), cs = getComputedStyle(img);
  const top = b.top + p.clientTop;
  return { src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0, fit: cs.objectFit, pos: cs.objectPosition, fills: Math.abs(i.width - p.clientWidth) <= 1 && Math.abs(i.height - p.clientHeight) <= 1 && Math.abs(i.top - top) <= 1, visible: cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0 };
};

// Line 4: every card shows its screenshot.
for (const width of [390, 1280]) {
  test(`every card shows its demo screenshot at ${width}`, async ({ browser }) => {
    const { page, errors } = await open(browser, width);
    for (const d of DEMOS) {
      const img = page.locator(`.card[data-card="${d.id}"] .thumb img`);
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0), { message: d.name }).toBe(true);
      expect(await img.evaluate(shot), d.name).toEqual({ src: `./assets/thumbs/${d.name}.webp`, loaded: true, fit: 'cover', pos: '50% 0%', fills: true, visible: true });
    }
    expect(errors).toEqual([]);
    await page.close();
  });
}

// Speed (Steffen, 2026-11-04): the cards loaded six full-page screenshots (4.3 MB) to show a strip of
// each, and the page crawled on a phone. Scrolling the whole page at 390, with nothing opened, must
// download under 600 KB of pictures; the full screenshots wait until a panel opens.
test('a phone scrolling the page downloads under 600 KB of pictures', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const sizes = [];
  page.on('response', async (r) => {
    if (r.url().startsWith(BASE) && r.request().resourceType() === 'image') sizes.push({ url: r.url(), n: (await r.body()).length });
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 400) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(50);
  }
  await page.waitForLoadState('networkidle');
  const total = sizes.reduce((n, s) => n + s.n, 0);
  expect(sizes.filter((s) => s.url.includes('/screenshots/')).map((s) => s.url), 'full screenshots loaded before any panel opened').toEqual([]);
  expect(total, 'picture bytes').toBeLessThan(600 * 1024);
  await page.close();
});

// Speed (Steffen, 2026-11-04): each outside server costs a phone a fresh connection (often 0.5–1 s
// on mobile data), and the Google Fonts stylesheet held up the first paint. Everything the page
// loads, fonts included, comes from the site itself, and both fonts still load for real.
test('the page loads nothing from any other server, and both fonts still load', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const outside = [];
  page.on('request', (r) => { if (!/^(data|blob|about):/.test(r.url()) && !r.url().startsWith(BASE)) outside.push(r.url()); });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return ['IBM Plex Mono', 'VT323'].map((fam) => [...document.fonts].some((f) => f.family.replace(/"/g, '') === fam && f.status === 'loaded'));
  });
  expect(outside).toEqual([]);
  expect(loaded).toEqual([true, true]);
  await page.close();
});

// Line 5: the panel shows the same picture at 16:10.
test('every panel shows its demo screenshot at 16:10', async ({ browser }) => {
  const { page, errors } = await open(browser, 1280);
  for (const d of DEMOS) {
    await page.goto(BASE + '#' + d.id);
    const img = page.locator('[data-win="pj"] .pthumb img');
    await expect(img, d.name).toBeVisible();
    await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0), { message: d.name }).toBe(true);
    expect(await img.evaluate(shot), d.name).toEqual({ src: `./demos/${d.name}/screenshots/desktop.png`, loaded: true, fit: 'cover', pos: '50% 0%', fills: true, visible: true });
    const r = await page.locator('[data-win="pj"] .pthumb').evaluate((t) => { const b = t.getBoundingClientRect(); return +(b.width / b.height).toFixed(2); });
    expect(r, d.name).toBe(1.6);
  }
  expect(errors).toEqual([]);
  await page.close();
});

// Line 6: a picture that fails leaves the placeholder, never an empty box.
test('a screenshot that fails to load leaves the striped placeholder', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('**/screenshots/desktop.png', (r) => r.abort());
  await page.route('**/assets/thumbs/*', (r) => r.abort());
  await page.goto(BASE);
  for (const d of DEMOS) {
    const card = page.locator(`.card[data-card="${d.id}"]`);
    await expect(card.locator('.thumb img'), d.name).toBeHidden();
    await expect(card.locator('.thumb > b'), d.name).toBeVisible();
    await expect(card.locator('.thumb > span'), d.name).toHaveText('SCREENSHOT PENDING');
  }
  await page.goto(BASE + '#slate');
  await expect(page.locator('[data-win="pj"] .pthumb img')).toBeHidden();
  await expect(page.locator('[data-win="pj"] .pthumb > b')).toBeVisible();
  expect(errors).toEqual([]);
  await page.close();
});

// Line 7: Optometry's demo is on (Steffen, 2026-11-05): its panel opens its working demo, and nothing says COMING SOON.
test('Optometry opens its working demo', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '#optom');
  await expect(page.getByRole('button', { name: 'DEMO COMING SOON' })).toHaveCount(0);
  const link = page.getByRole('link', { name: 'OPEN THE WORKING DEMO ▸' });
  await expect(link).toHaveAttribute('href', './demos/eye-care/index.html');
  await link.click();
  await expect(page).toHaveURL(BASE + 'demos/eye-care/index.html');
  await expect(page).toHaveTitle(/name withheld/);
  await page.close();
});
