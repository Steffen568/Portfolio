// Unit 01 — Shell. Each test names the spec line it guards (specs/01-shell.md).
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const WIDTHS = [390, 768, 1280];
const PAGES = [
  { key: 'F1', hash: '#home', id: 'home' },
  { key: 'F2', hash: '#projects/scout', id: 'projects' },
  { key: 'F3', hash: '#how', id: 'how' }
];

function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}
const key = (page, k) => page.locator('.topbar .fk', { hasText: k });
// Visible pages; also fails if a page that isn't showing lacks the hidden attribute (CSS-only hiding doesn't count).
const visiblePages = (page) => page.$$eval('[data-page]', (els) => {
  const shown = els.filter((e) => !e.hidden && e.offsetParent !== null).map((e) => e.dataset.page);
  const notHidden = els.filter((e) => !e.hidden).map((e) => e.dataset.page);
  return notHidden.length === shown.length ? shown : ['NOT-HIDDEN:' + notHidden.join(',')];
});

// Line 1: opens over a server with zero console errors, and every key click stays error-free.
test('loads and switches pages with zero console errors', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('./');
  for (const k of ['F2', 'F3', 'F4', 'GO', 'F1']) await key(page, k).click();
  await page.getByRole('button', { name: 'COPY EMAIL' }).click();
  expect(errors).toEqual([]);
});

// Line 1: opens by double-click (file://) with zero console errors.
test('opens from file:// with zero console errors', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto(pathToFileURL(join(process.cwd(), 'index.html')).href);
  await expect(page.locator('.topbar')).toBeVisible();
  await key(page, 'F3').click();
  expect(await visiblePages(page)).toEqual(['how']);
  expect(errors).toEqual([]);
});

// Line 2: tokens, dark color scheme, real fonts (no fallback).
test('tokens on :root, color-scheme dark, both fonts load', async ({ page }) => {
  await page.goto('./');
  const r = await page.evaluate(async () => {
    await document.fonts.ready;
    const cs = getComputedStyle(document.documentElement);
    const tok = ['--acc', '--yel', '--org', '--grn', '--red', '--bg', '--pan', '--ln', '--ln2', '--tx', '--mu', '--dim'];
    return {
      tokens: Object.fromEntries(tok.map((t) => [t, cs.getPropertyValue(t).trim().toLowerCase()])),
      scheme: cs.colorScheme,
      body: getComputedStyle(document.querySelector('.term')).fontFamily,
      plex: [...document.fonts].some((f) => f.family.replace(/"/g, '') === 'IBM Plex Mono' && f.status === 'loaded'),
      vt: [...document.fonts].some((f) => f.family.replace(/"/g, '') === 'VT323' && f.status === 'loaded'),
      vtUsed: getComputedStyle(document.querySelector('.foot .vt')).fontFamily
    };
  });
  expect(r.tokens).toEqual({ '--acc': '#ffa028', '--yel': '#f5c518', '--org': '#ff6b2c', '--grn': '#7cc46a', '--red': '#e5534b', '--bg': '#050403', '--pan': '#0b0906', '--ln': '#2a241b', '--ln2': '#3d352a', '--tx': '#f0e9dc', '--mu': '#b3a892', '--dim': '#8f8470' });
  expect(r.scheme).toBe('dark');
  expect(r.body).toMatch(/^"?IBM Plex Mono/);
  expect(r.vtUsed).toMatch(/^"?VT323/);
  expect(r.plex).toBe(true);
  expect(r.vt).toBe(true);
});

// Line 2: the phone's light setting changes nothing.
test('light-mode phones still get the dark page', async ({ browser }) => {
  const page = await browser.newPage({ colorScheme: 'light' });
  await page.goto('./');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(5, 4, 3)');
  await page.close();
});

// Line 3: top-bar content, clock format and Chicago time, clock hidden below 820.
test('top bar shows name, keys, START TOUR and the Chicago clock', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./');
  const bar = page.locator('.topbar');
  await expect(bar.locator('.cmdname')).toHaveText('STEFFEN [LAST NAME]<GO>');
  await expect(bar.locator('.fk')).toHaveText(['F1HOME', 'F2PROJECTS', 'F3HOW I WORK', 'F4CONTACT ↓', 'GOSTART TOUR']);
  const clk = bar.locator('.clk');
  await expect(clk).toBeVisible();
  await expect(clk).toHaveText(/^TEMPLE, TX[A-Z]{3} \d{2}, \d{4}\d{2}:\d{2} CT$/);
  await page.setViewportSize({ width: 819, height: 800 });
  await expect(clk).toBeHidden();
});
test('clock reads Chicago time on a non-Chicago machine and refreshes every 30 s', async ({ browser }) => {
  const ctx = await browser.newContext({ timezoneId: 'Asia/Tokyo', viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-11-02T23:59:40Z') }); // 17:59:40 in Chicago, 08:59 next day in Tokyo
  await page.goto('./');
  await expect(page.locator('[data-clock]')).toHaveText('17:59 CT');
  await expect(page.locator('[data-date]')).toHaveText('NOV 02, 2026');
  await page.clock.runFor(30000);
  await expect(page.locator('[data-clock]')).toHaveText('18:00 CT');
  await ctx.close();
});

// Line 4: the bar never moves, at every width, on every page; nothing in it animates.
for (const w of WIDTHS) {
  test(`top bar never moves between pages at ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto('./');
    const boxes = [];
    for (const p of PAGES) {
      await key(page, p.key).click();
      await page.waitForTimeout(450);
      boxes.push(await page.locator('.topbar').evaluate((el) => { const r = el.getBoundingClientRect(); return [r.top, r.left, r.width, r.height]; }));
    }
    expect(boxes[1]).toEqual(boxes[0]);
    expect(boxes[2]).toEqual(boxes[0]);
  });
}
test('nothing in the top bar animates; scrollbar gutter is stable', async ({ page }) => {
  await page.goto('./');
  const r = await page.evaluate(() => {
    const els = [document.querySelector('.topbar'), ...document.querySelectorAll('.topbar *')];
    const moving = els.filter((el) => { const s = getComputedStyle(el); return s.animationName !== 'none' || s.transitionDuration.split(',').some((d) => parseFloat(d) > 0); });
    return { moving: moving.length, gutter: getComputedStyle(document.documentElement).scrollbarGutter };
  });
  expect(r.moving).toBe(0);
  expect(r.gutter).toBe('stable');
});

// Line 5 + 6: hash routing, deep links, back/forward, unknown hashes, aria-current; only one page ever shows.
test('keys set the hash, mark the active key, and show exactly one page', async ({ page }) => {
  await page.goto('./');
  expect(await visiblePages(page)).toEqual(['home']);
  for (const p of [...PAGES, ...PAGES.slice().reverse()]) {
    await key(page, p.key).click();
    await expect(page).toHaveURL(new RegExp(p.hash.replace('/', '\\/') + '$'));
    expect(await visiblePages(page)).toEqual([p.id]);
    await expect(key(page, p.key)).toHaveAttribute('aria-current', 'page');
    await expect(key(page, p.key)).toHaveCSS('background-color', 'rgb(255, 160, 40)'); // amber
    expect(await page.locator('.topbar .fk[aria-current="page"]').count()).toBe(1);
  }
});
test('deep links, back/forward and unknown hashes', async ({ page }) => {
  // A hash-only goto stays on the same document; reload makes each one a real fresh load (review 3).
  const fresh = async (hash) => { await page.goto('./' + hash); await page.reload(); };
  for (const p of PAGES) {
    await fresh(p.hash);
    expect(await visiblePages(page)).toEqual([p.id]);
  }
  await fresh('#projects/holy');
  expect(await visiblePages(page)).toEqual(['projects']);
  await key(page, 'F2').click();
  await expect(page).toHaveURL(/#projects\/holy$/);
  await key(page, 'F3').click();
  await key(page, 'F1').click();
  await page.goBack();
  await expect(page).toHaveURL(/#how$/);
  expect(await visiblePages(page)).toEqual(['how']);
  await page.goBack();
  expect(await visiblePages(page)).toEqual(['projects']);
  await page.goForward();
  expect(await visiblePages(page)).toEqual(['how']);
  await fresh('#nowhere');
  expect(await visiblePages(page)).toEqual(['home']);
  await fresh('#projects/nope');
  await expect(page).toHaveURL(/#projects\/scout$/);
  expect(await visiblePages(page)).toEqual(['projects']);
});

// Line 7: panel headers.
test('each page carries its panel header', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./#home');
  await expect(page.locator('[data-page="home"] .ph')).toHaveText('01 · OVERVIEW<GO>4 LAYERS');
  await page.goto('./#projects/scout');
  await expect(page.locator('[data-page="projects"] .ph')).toHaveText('02 · PROJECTS<GO>VIEWED 1/6'); // the project counts as viewed once shown (unit 03)
  await page.goto('./#how');
  await expect(page.locator('[data-page="how"] > .ph b')).toHaveText('03 · HOW I WORK<GO>'); // > : the page's own header, not the full-graphic window's (unit 04)
  // "Bodies empty until units 2–4" retired: all three bodies have arrived (Home unit 02, Projects unit 03, How I work unit 04).
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('./#home');
  const layers = page.locator('[data-page="home"] .ph > span', { hasText: '4 LAYERS' }); // found by text, so a dropped class can't hide the check (review 4)
  await expect(layers).toHaveCount(1);
  await expect(layers).toBeHidden();
});

// Line 8: footer content on every page; copy email flips to COPIED ✓ for 1.6 s.
test('footer on every page, copy email confirms then resets', async ({ page }) => {
  await page.goto('./');
  for (const p of PAGES) {
    await key(page, p.key).click();
    const f = page.locator('footer.foot');
    await expect(f).toHaveCount(1);
    await expect(f).toContainText('HAVE A PROJECT IN MIND?');
    await expect(f).toContainText('What do you want built, and who is it for?');
    await expect(f.locator('.foot-em')).toHaveText('[YOUR EMAIL]');
    await expect(f.locator('.foot-s')).toHaveText('TEMPLE, TX · OPEN TO PROJECTSEVERY DEMO IS A FROZEN SNAPSHOT ON SAMPLE DATA · FORMS AND OUTSIDE LINKS OFF');
  }
  expect(await page.locator('.foot-em').evaluate((el) => getComputedStyle(el).userSelect)).toBe('all');
  const btn = page.locator('.foot .btn');
  await page.clock.install();
  await btn.click();
  await expect(btn).toHaveText('COPIED ✓');
  await page.clock.runFor(1550);
  await expect(btn).toHaveText('COPIED ✓');
  await page.clock.runFor(100);
  await expect(btn).toHaveText('COPY EMAIL');
});

// Line 9: F4 scrolls to the footer and flashes once, without changing page.
test('F4 scrolls to the footer and flashes it once', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto('./#how');
  await page.locator('[data-page="how"]').evaluate((el) => { el.style.minHeight = '2000px'; }); // push the footer off screen
  await expect(page.locator('footer.foot')).not.toBeInViewport();
  await key(page, 'F4').click();
  await expect(page.locator('footer.foot')).toHaveClass(/\bflash\b/);
  const maxY = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  expect(await page.evaluate(() => scrollY)).toBeLessThan(maxY); // still travelling: smooth, not a jump
  expect(await page.locator('footer.foot').evaluate((el) => [getComputedStyle(el).animationName, getComputedStyle(el).animationDuration])).toEqual(['pflash', '1s']);
  expect(await page.evaluate(() => [...document.styleSheets].filter((ss) => /assets\/site\.css$/.test(ss.href || '')).some((ss) => [...ss.cssRules].some((r) => r.type === CSSRule.KEYFRAMES_RULE && r.name === 'pflash')))).toBe(true);
  await expect(page.locator('footer.foot')).toBeInViewport();
  await expect(page).toHaveURL(/#how$/);
  await expect(page.locator('footer.foot')).not.toHaveClass(/\bflash\b/, { timeout: 1500 });
});

// Line 10: GO opens the first project.
test('GO opens the first project', async ({ page }) => {
  await page.goto('./#how');
  await key(page, 'GO').click();
  await expect(page).toHaveURL(/#projects\/scout$/);
  expect(await visiblePages(page)).toEqual(['projects']);
});

// Line 11 + 12: boot never blocks, is gone by ~1.9 s, and is skipped under reduced motion; overlay never catches clicks.
test('boot and scanlines never catch clicks; boot fades out', async ({ page }) => {
  await page.goto('./');
  const pe = await page.evaluate(() => [getComputedStyle(document.querySelector('.boot')).pointerEvents, getComputedStyle(document.querySelector('.crt')).pointerEvents]);
  expect(pe).toEqual(['none', 'none']);
  await expect(page.locator('.boot div')).toHaveText(['STEFFEN-TERM v2.2 · COLD BOOT', 'LOADING EXPLODED VIEWS ...... OK', 'LINKING 6 WORKING DEMOS ..... OK', 'ALL DEMOS: FROZEN SNAPSHOTS · OK']);
  const boot = await page.evaluate(() => {
    const b = getComputedStyle(document.querySelector('.boot'));
    const lines = [...document.querySelectorAll('.boot div')].map((d) => getComputedStyle(d));
    return { color: b.color, anim: [b.animationName, b.animationDuration, b.animationDelay], lines: lines.map((l) => [l.animationName, l.animationDelay]) };
  });
  expect(boot.color).toBe('rgb(255, 160, 40)'); // amber
  expect(boot.anim).toEqual(['bootout', '0.5s', '1.4s']); // fades from 1.4 s
  expect(boot.lines).toEqual([['type', '0s'], ['type', '0.3s'], ['type', '0.6s'], ['type', '0.9s']]); // lines type out in turn
  await key(page, 'F3').click();
  await expect(page).toHaveURL(/#how$/);
  await page.waitForTimeout(2100);
  expect(await page.locator('.boot').evaluate((el) => getComputedStyle(el).visibility)).toBe('hidden');
  const crt = await page.locator('.crt').evaluate((el) => { const r = el.getBoundingClientRect(); return [getComputedStyle(el).position, r.left === 0 && r.top === 0 && r.width >= innerWidth - 20, r.height === innerHeight]; }); // fixed layers stop at the scrollbar strip
  expect(crt).toEqual(['fixed', true, true]);
});
test('reduced motion: no boot, nothing animates', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.goto('./');
  expect(await page.locator('.boot').evaluate((el) => getComputedStyle(el).display)).toBe('none');
  const moving = await page.evaluate(() => [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).animationName !== 'none').length);
  expect(moving).toBe(0);
  await page.close();
});

// Line 13: no sideways scroll; tap targets at least 44 px.
for (const w of WIDTHS) {
  test(`no sideways scroll and 44px targets at ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto('./');
    for (const p of PAGES) {
      await key(page, p.key).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    const small = await page.$$eval('.topbar .fk, .foot .btn', (els) => els.filter((e) => e.getBoundingClientRect().height < 44).map((e) => e.textContent));
    expect(small).toEqual([]);
  });
}

// Line 14: relative paths only.
test('no absolute paths in index.html or assets/', () => {
  const files = ['index.html', ...readdirSync('assets').filter((f) => /\.(css|js|html)$/.test(f)).map((f) => join('assets', f))];
  const bad = [];
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/(?:href|src)\s*=\s*["']\/(?!\/)[^"']*|url\(\s*["']?\/(?!\/)[^)]*/g)) bad.push(`${f}: ${m[0]}`);
    if (f.endsWith('.js')) for (const m of src.matchAll(/["'`]\/(?![/*])[\w.-][^"'`]*/g)) bad.push(`${f}: ${m[0]}`); // fetch('/x'), location = '/x'
  }
  expect(bad).toEqual([]);
});
