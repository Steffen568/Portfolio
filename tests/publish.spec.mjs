// Unit 06 — Publish. Each test names the spec line it guards (specs/06-publish.md).
// GitHub Pages serves only what git tracks, and matches file names letter-for-letter in upper/lower case.
// Windows (and scripts/serve.mjs on it) ignores case and serves untracked files, so these checks build their own server.
import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const TRACKED = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' }).split('\0').filter((f) => f && existsSync(join(ROOT, f)));
const SHIPS = new Set(TRACKED);
const lower = (p) => p.toLowerCase();
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
// A path the page names → the tracked file GitHub would serve for it ('demos/x/' → 'demos/x/index.html').
const target = (p) => p.replace(/^\.\//, '').replace(/\/$/, '/index.html');
const text = (f) => readFileSync(join(ROOT, f), 'utf8');
const isText = (f) => /\.(html?|css|m?js|json|md|txt|svg|ya?ml|sh|xml)$/i.test(f) || !extname(f);

// The shipped-files server: only tracked files, exact case, under /portfolio/ (as GitHub Pages).
let server, BASE;
test.beforeAll(async () => {
  server = createServer((req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    if (!url.startsWith('/portfolio/')) { res.writeHead(404); return res.end(); }
    const rel = url.slice('/portfolio/'.length);
    const file = rel ? target(rel) : 'index.html';
    if (!SHIPS.has(file)) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(readFileSync(join(ROOT, file)));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  BASE = `http://127.0.0.1:${server.address().port}/portfolio/`;
});
test.afterAll(() => new Promise((r) => server.close(r)));

// Line 1: what's committed works on its own, served the way GitHub serves it.
for (const width of [390, 1280]) {
  test(`the committed files alone load the whole page under /portfolio/ at ${width}`, async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    const errors = [];
    const missing = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('response', (r) => { if (r.url().startsWith(BASE) && r.status() >= 400) missing.push(`${r.status()} ${r.url()}`); });
    page.on('requestfailed', (r) => { if (r.url().startsWith(BASE)) missing.push(`failed ${r.url()}`); });
    await page.goto(BASE);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.card')).toHaveCount(6);
    await expect(page.locator('svg.fw2')).toBeVisible();
    // Both image windows: their pictures are fetched on open, so open each and wait for it to draw.
    for (const btn of ['CLAUDE.md ⤢', 'BUILDER’S MAP ⤢']) {
      await page.getByRole('button', { name: btn }).click();
      const img = page.locator('[data-win="img"] img:not([hidden])');
      await expect(img).toBeVisible();
      await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth), { message: btn }).toBeGreaterThan(0);
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-win="img"]')).toBeHidden();
    }
    expect(missing, 'files the page asked for that GitHub would not have').toEqual([]);
    expect(errors).toEqual([]);
    await page.close();
  });
}

// Line 2: every local file the page names is tracked, with the exact case.
test('every file the page names is in the repo with the exact case', () => {
  const refs = new Set();
  for (const m of text('index.html').matchAll(/\b(?:href|src|data-src)="([^"]+)"/g)) refs.add(m[1]);
  for (const m of text('assets/site.css').matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) refs.add(m[1]);
  for (const f of TRACKED.filter((f) => /^assets\/[^/]+\.js$/.test(f))) {
    for (const m of text(f).matchAll(/['"](?:\.\/)?((?:assets|demos)\/[A-Za-z0-9_./-]*)['"]/g)) refs.add(m[1]);
  }
  const local = [...refs].filter((r) => !/^(https?:|data:|#|mailto:)/.test(r));
  expect(local.length).toBeGreaterThan(5);
  const bad = [];
  const openInputs = [];
  for (const r of local) {
    const f = target(r);
    if (SHIPS.has(f)) continue;
    const wrongCase = TRACKED.find((t) => lower(t) === lower(f) || lower(t).startsWith(lower(f.replace(/index\.html$/, ''))) && /^demos\//.test(f));
    if (/^demos\/[^/]+\/index\.html$/.test(f) && !wrongCase) { openInputs.push(f); continue; }
    bad.push(wrongCase ? `${r} → tracked as ${wrongCase} (case differs or index.html missing)` : `${r} → not tracked`);
  }
  if (openInputs.length) console.log('Open inputs (demo folders not copied in yet):', openInputs.join(', '));
  expect(bad).toEqual([]);
});

// Line 3: every demo folder that is in the repo opens from its panel on the shipped-files server.
test('every copied-in demo opens from its panel under /portfolio/', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE);
  const projects = await page.evaluate(() => window.PORTFOLIO.projects.map((p) => ({ id: p.id, name: p.name, demo: p.demo, path: p.path })));
  for (const p of projects.filter((p) => p.demo && SHIPS.has(target(p.path)))) {
    await page.goto(BASE + '#' + p.id);
    const link = page.getByRole('link', { name: 'OPEN THE WORKING DEMO ▸' });
    await expect(link, p.name).toBeVisible();
    const res = await page.request.get(await link.evaluate((a) => a.href));
    expect(res.status(), p.name).toBe(200);
  }
  await page.close();
});

// Line 4: nothing dev-only ships.
test('nothing dev-only is committed', () => {
  const dev = TRACKED.filter((f) => /^(node_modules|test-results|playwright-report)\//.test(f) || /(^|\/)\.env(\.|$)/.test(f) || /\.log$/i.test(f));
  expect(dev).toEqual([]);
  const ignore = text('.gitignore').split(/\r?\n/).map((l) => l.trim());
  for (const d of ['node_modules/', 'test-results/', 'playwright-report/']) expect(ignore, d).toContain(d);
});

// Line 5: no secrets ship (handoff-COMMON.md "No secrets": a gate, not a suggestion).
test('no committed file holds a key, token or password', () => {
  const PATTERNS = [
    /\bsk-[A-Za-z0-9_-]{20,}/, /\b(ghp|gho|ghs|ghu)_[A-Za-z0-9]{30,}/, /\bgithub_pat_[A-Za-z0-9_]{30,}/, /\bAKIA[0-9A-Z]{16}\b/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    // A name with a written-out value. Minified demo code's `password:!0`, `accessToken:null`, `{accessToken:p}=…` are not values.
    /\b(password|passwd|api[_-]?key|secret[_-]?key|access[_-]?token)['"]?\s*[:=]\s*['"]?(?!(?:null|true|false|undefined|void)\b|![01]\b|[A-Za-z_$][\w$]{0,2}[})\],;])[^\s'"]{6,}/i,
    /^\s*(export\s+)?[A-Za-z0-9_]*(password|api_key|secret|token)[A-Za-z0-9_]*\s*=\s*[^\s#]{6,}/i
  ];
  const hits = [];
  for (const f of TRACKED.filter(isText)) {
    text(f).split(/\r?\n/).forEach((line, i) => { if (PATTERNS.some((p) => p.test(line))) hits.push(`${f}:${i + 1}`); });
  }
  expect(hits).toEqual([]);
});

// Line 6: GitHub's page builder (Jekyll) drops nothing the site serves.
test('Jekyll would drop or rewrite no file the site serves', () => {
  if (SHIPS.has('.nojekyll')) return;
  const served = TRACKED.filter((f) => f === 'index.html' || /^(assets|demos)\//.test(f));
  const dropped = served.filter((f) => f.split('/').some((seg) => /^[_.]/.test(seg)));
  expect(dropped, 'add a .nojekyll file at the repo root (spec line 6)').toEqual([]);
  const templated = served.filter((f) => isText(f) && readFileSync(join(ROOT, f)).subarray(0, 3).toString() === '---');
  expect(templated, 'add a .nojekyll file at the repo root (spec line 6)').toEqual([]);
});
