// Unit 01 — Shell + header. Each test names the spec line it guards (specs/01-shell-header.md).
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DESIGN = readFileSync(join(process.cwd(), 'design', 'portfolio-design.dc.html'), 'utf8');

// The design's own data, read straight from its script, so the page can never drift from it.
function designData() {
  const src = DESIGN.split(/<script type="text\/x-dc"[^>]*>/)[1].split('</script>')[0];
  const Component = new Function('DCLogic', src + '\nreturn Component;')(class {});
  const c = new Component();
  return { skills: c.skillList(), projects: c.projects() };
}
// The design's markup text for one element, by its opening tag.
const designText = (open, close) => DESIGN.split(open)[1].split(close)[0];

function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}
async function clickEverything(page) {
  await page.getByRole('button', { name: 'COPY EMAIL' }).click();
  for (const b of await page.locator('.skl .sk').all()) await b.click();
}

// Line 1: opens over a server with zero console errors, and every button click stays error-free.
test('loads and every button click is error-free', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('./');
  await expect(page.locator('.hd')).toBeVisible();
  await clickEverything(page);
  expect(errors).toEqual([]);
});

// Line 1: opens by double-click (file://) with zero console errors.
test('opens from file:// with zero console errors', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto(pathToFileURL(join(process.cwd(), 'index.html')).href);
  await expect(page.locator('.hd-name')).toHaveText('STEFFEN GONZALEZ');
  await clickEverything(page);
  expect(errors).toEqual([]);
});

// Line 2: tokens, dark color scheme, real fonts (no fallback).
test('tokens on :root, color-scheme dark, both fonts load', async ({ page }) => {
  await page.goto('./');
  const r = await page.evaluate(async () => {
    await document.fonts.ready;
    const cs = getComputedStyle(document.documentElement);
    const tok = ['--acc', '--yel', '--org', '--grn', '--red', '--bg', '--pan', '--ln', '--ln2', '--tx', '--mu', '--dim'];
    const loaded = (fam) => [...document.fonts].some((f) => f.family.replace(/"/g, '') === fam && f.status === 'loaded');
    return {
      tokens: Object.fromEntries(tok.map((t) => [t, cs.getPropertyValue(t).trim().toLowerCase()])),
      scheme: cs.colorScheme,
      body: getComputedStyle(document.querySelector('.term')).fontFamily,
      name: getComputedStyle(document.querySelector('.hd-name')).fontFamily,
      plex: loaded('IBM Plex Mono'),
      vt: loaded('VT323')
    };
  });
  expect(r.tokens).toEqual({ '--acc': '#ffa028', '--yel': '#f5c518', '--org': '#ff6b2c', '--grn': '#7cc46a', '--red': '#e5534b', '--bg': '#050403', '--pan': '#0b0906', '--ln': '#2a241b', '--ln2': '#3d352a', '--tx': '#f0e9dc', '--mu': '#b3a892', '--dim': '#8f8470' });
  expect(r.scheme).toBe('dark');
  expect(r.body).toMatch(/^"?IBM Plex Mono/);
  expect(r.name).toMatch(/^"?VT323/);
  expect(r.plex).toBe(true);
  expect(r.vt).toBe(true);
});

// Line 2: a phone set to light mode still gets the dark page.
test('light-mode phones still get the dark page', async ({ browser }) => {
  const page = await browser.newPage({ colorScheme: 'light' });
  await page.goto('./');
  const r = await page.evaluate(() => ({ body: getComputedStyle(document.body).backgroundColor, tx: getComputedStyle(document.querySelector('.hd-line')).color }));
  expect(r.body).toBe('rgb(5, 4, 3)');
  expect(r.tx).toBe('rgb(240, 233, 220)');
  await page.close();
});

// Line 3: the data the cards, skills and panel run on is the design's, value for value.
test('data.js matches the design\'s skillList() and projects()', async ({ page }) => {
  await page.goto('./');
  const data = await page.evaluate(() => window.PORTFOLIO);
  expect(data).toEqual(designData());
});

// Line 4: every header and footer string is the design's, word for word; placeholders stay visible.
test('header and footer copy match the design word for word', async ({ page }) => {
  await page.goto('./');
  const label = designText('<span class="lbl">TEMPLE', '{{clock}}');
  await expect(page.locator('.hd-l > .lbl')).toHaveText(new RegExp('^TEMPLE' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\d\\d:\\d\\d CT$'));
  await expect(page.locator('.hd-name')).toHaveText(designText('<div class="vt hd-name">', '</div>').replace('[LAST NAME]', 'GONZALEZ'));
  await expect(page.locator('.hd-name')).toHaveText('STEFFEN GONZALEZ');
  await expect(page.locator('.hd-title')).toHaveText(designText('<span class="hd-title">', '</span>'));
  await expect(page.locator('.hd-line')).toHaveText(designText('<div class="hd-line">', '</div>'));
  await expect(page.locator('.hd-sub')).toHaveText(designText('<p class="hd-sub">', '</p>'));
  await expect(page.locator('.hd-r > .lbl')).toHaveText('CONTACT');
  await expect(page.locator('.hd-r .em')).toHaveText('sgonzalez568@gmail.com');
  await expect(page.locator('.hd-r .em')).toHaveCSS('user-select', 'all');
  await expect(page.locator('.hd-r .btn')).toHaveText('COPY EMAIL');
  const ft = page.locator('footer.ft > span');
  await expect(ft).toHaveText([designText('<footer class="ft"><span>', '</span>'), 'sgonzalez568@gmail.com']);
});

// Line 5: the clock is Chicago time, HH:MM on a 00–23 hour, refreshed every 30 s.
test('clock shows Chicago HH:MM and refreshes every 30 s', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-03T05:59:45Z') }); // 23:59:45 CST
  await page.goto('./');
  const lbl = page.locator('.hd-l > .lbl');
  await expect(lbl).toContainText('· 23:59 CT');
  await page.clock.runFor(30000);
  await expect(lbl).toContainText('· 00:00 CT'); // never "24:00"
});

// Line 6: copy puts the email on the clipboard and confirms for 1.6 s.
test('COPY EMAIL copies, confirms, then resets after 1.6 s', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.clock.install();
  await page.goto('./');
  const btn = page.locator('.hd-r .btn');
  await btn.click();
  await expect(btn).toHaveText('COPIED ✓');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('sgonzalez568@gmail.com');
  await page.clock.runFor(1500);
  await expect(btn).toHaveText('COPIED ✓');
  await page.clock.runFor(200);
  await expect(btn).toHaveText('COPY EMAIL');
});

// Line 7: the skills finish the bio's sentence, in order, with counts taken from the projects.
test('skills row: 8 buttons in order with project counts, definition line under it', async ({ page }) => {
  await page.goto('./');
  const { skills, projects } = designData();
  const want = skills.map((k) => [k.label, String(projects.filter((p) => p.skills.some((x) => x[0] === k.id)).length)]);
  expect(want).toEqual([['API INGESTION', '3'], ['SCRAPING', '1'], ['DATABASES', '3'], ['DATA PIPELINES', '2'], ['DATA VIZ', '1'], ['OPTIMIZATION', '1'], ['WEB DESIGN', '2'], ['INTEGRATIONS', '1']]);
  const got = await page.$$eval('.skl .sk', (els) => els.map((b) => [b.firstChild.textContent.trim(), b.querySelector('i').textContent, b.tagName, b.type]));
  expect(got).toEqual(want.map((w) => [...w, 'BUTTON', 'button']));
  const order = await page.evaluate(() => {
    const s = document.querySelector('.skl');
    return [s.previousElementSibling.className, s.nextElementSibling.className];
  });
  expect(order).toEqual(['hd-sub', 'skl-def']);
  await expect(page.locator('.skl-def')).toHaveText('8 SKILLS ACROSS 6 PROJECTS');
});

// Line 8: the 5-second read is fully on screen at 1440×900 without scrolling.
test('the 5-second read fits above the fold at 1440×900', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);
  const r = await page.evaluate(() => ({
    y: scrollY,
    boxes: ['.hd-l > .lbl', '.hd-name', '.hd-title', '.hd-line', '.hd-sub', '.skl', '.skl-def', '.hd-r .em', '.hd-r .btn'].map((s) => {
      const b = document.querySelector(s).getBoundingClientRect();
      return { s, top: b.top, bottom: b.bottom, left: b.left, right: b.right, h: b.height };
    })
  }));
  expect(r.y).toBe(0);
  for (const b of r.boxes) {
    expect(b.h, b.s + ' has height').toBeGreaterThan(0);
    expect(b.top, b.s + ' top').toBeGreaterThanOrEqual(0);
    expect(b.bottom, b.s + ' bottom').toBeLessThanOrEqual(900);
    expect(b.left, b.s + ' left').toBeGreaterThanOrEqual(0);
    expect(b.right, b.s + ' right').toBeLessThanOrEqual(1440);
  }
  await page.close();
});

// Line 9: no sideways page scroll at any width; on phones the skills row scrolls in its own box, on one line.
for (const width of [390, 768, 1280]) {
  test(`no sideways scroll at ${width}`, async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(() => {
      const skl = document.querySelector('.skl');
      const tops = [...skl.querySelectorAll('.sk')].map((b) => b.offsetTop);
      return { doc: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth, sklScroll: skl.scrollWidth, sklBox: skl.clientWidth, sklOverflow: getComputedStyle(skl).overflowX, oneLine: new Set(tops).size === 1 };
    });
    expect(r.doc).toBeLessThanOrEqual(r.vw);
    if (width <= 640) {
      expect(r.oneLine).toBe(true);
      expect(r.sklOverflow).toBe('auto');
      expect(r.sklScroll).toBeGreaterThan(r.sklBox);
    }
    await page.close();
  });
}

// Line 10: tap sizes — COPY EMAIL ≥ 44 px everywhere; skill buttons ≥ 40 px on phones.
for (const width of [390, 1280]) {
  test(`tap sizes at ${width}`, async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.goto('./');
    const copy = await page.locator('.hd-r .btn').boundingBox();
    expect(copy.height).toBeGreaterThanOrEqual(44);
    if (width <= 640) {
      const hs = await page.$$eval('.skl .sk', (els) => els.map((b) => b.getBoundingClientRect().height));
      for (const h of hs) expect(h).toBeGreaterThanOrEqual(40);
    }
    await page.close();
  });
}

// Line 11: the scanlines cover the screen and never catch a click.
test('scanline overlay covers the screen and lets clicks through', async ({ page }) => {
  await page.goto('./');
  const r = await page.evaluate(() => {
    const crt = document.querySelector('.crt');
    const b = crt.getBoundingClientRect();
    const btn = document.querySelector('.hd-r .btn').getBoundingClientRect();
    const hit = document.elementFromPoint(btn.left + btn.width / 2, btn.top + btn.height / 2);
    // Compared with a full-screen fixed probe, not innerWidth: scrollbar-gutter: stable reserves a strip no fixed layer can cover.
    const probe = document.body.appendChild(Object.assign(document.createElement('div'), { style: 'position:fixed;inset:0' }));
    const v = probe.getBoundingClientRect();
    probe.remove();
    return { pe: getComputedStyle(crt).pointerEvents, pos: getComputedStyle(crt).position, covers: b.top <= v.top && b.left <= v.left && b.right >= v.right && b.bottom >= v.bottom && v.width > 0, hitsButton: hit.closest('.btn') !== null };
  });
  expect(r).toEqual({ pe: 'none', pos: 'fixed', covers: true, hitsButton: true });
});

// Line 12: stable scrollbar gutter; no text below 9 px on a phone.
test('scrollbar gutter stable; no text below 9 px at 390', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('./');
  const r = await page.evaluate(() => {
    const small = [];
    for (const el of document.querySelectorAll('body *')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (own && el.getClientRects().length && parseFloat(getComputedStyle(el).fontSize) < 9) small.push(el.className || el.tagName);
    }
    return { gutter: getComputedStyle(document.documentElement).scrollbarGutter, small };
  });
  expect(r.gutter).toBe('stable');
  expect(r.small).toEqual([]);
  await page.close();
});

// Line 13: reduced motion means nothing moves, even on hover.
test('reduced motion: nothing animates or transitions', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.locator('.hd-r .btn').hover();
  await page.locator('.skl .sk').first().hover();
  const r = await page.evaluate(() => ({
    running: document.getAnimations().length,
    btn: getComputedStyle(document.querySelector('.hd-r .btn')).transitionDuration,
    sk: getComputedStyle(document.querySelector('.skl .sk')).transitionDuration
  }));
  expect(r).toEqual({ running: 0, btn: '0s', sk: '0s' });
  await page.close();
});

// Line 14: relative paths only (the site lives under /portfolio/ and opens by double-click).
test('no path in index.html or assets/ starts with /', () => {
  const files = ['index.html', ...readdirSync('assets').filter((f) => /\.(css|js|html)$/.test(f)).map((f) => join('assets', f))];
  const bad = [];
  for (const f of files) {
    const s = readFileSync(f, 'utf8');
    for (const m of s.matchAll(/(?:src|href)\s*=\s*["']\/|url\(\s*["']?\//g)) bad.push(f + ': ' + m[0]);
  }
  expect(bad).toEqual([]);
});

// Line 14: one word for the system, and nothing about "this site".
test('visible text never says "framework" or "this site"', async ({ page }) => {
  await page.goto('./');
  const text = (await page.locator('body').innerText()).toLowerCase();
  expect(text).not.toContain('framework');
  expect(text).not.toContain('this site');
});
