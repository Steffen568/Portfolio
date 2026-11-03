// Unit 02 — Environment graphic. Each test names the spec line it guards (specs/02-environment.md).
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DESIGN = readFileSync(join(process.cwd(), 'design', 'portfolio-design.dc.html'), 'utf8');
const DLINES = DESIGN.split(/\r?\n/);
const LOOP = 14000;

// The usable viewport width, measured with a full-screen fixed probe. Not clientWidth: with scrollbar-gutter: stable,
// Chromium reports clientWidth including the reserved scrollbar strip, which nothing on the page can occupy.
const usableWidth = () => {
  const p = document.body.appendChild(Object.assign(document.createElement('div'), { style: 'position:fixed;inset:0' }));
  const w = p.getBoundingClientRect().width;
  p.remove();
  return w;
};

function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

// Freeze every 14 s animation (CSS and the dot's SVG motion) at one point in the cycle.
async function freezeAt(page, frac) {
  await page.evaluate(({ t }) => {
    for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; }
    const svg = document.querySelector('.fw2');
    svg.pauseAnimations();
    svg.setCurrentTime(t / 1000);
  }, { t: frac * LOOP });
}
// What the graphic shows at the frozen moment.
function readState(page) {
  return page.evaluate(() => {
    const svg = document.querySelector('.fw2');
    const cs = (el) => getComputedStyle(el);
    const RED = 'rgb(229, 83, 75)', GRN = 'rgb(124, 196, 106)', ACC = 'rgb(255, 160, 40)', YEL = 'rgb(245, 197, 24)';
    const col = (c) => ({ [RED]: 'red', [GRN]: 'green', [ACC]: 'amber', [YEL]: 'yellow' }[c] || 'off');
    const dot = svg.querySelector('.v4-tok').getBoundingClientRect();
    const m = svg.getScreenCTM().inverse();
    const p = new DOMPoint(dot.left + dot.width / 2, dot.top + dot.height / 2).matrixTransform(m);
    const at = [['PLAN', 220, 46], ['BUILD', 560, 46], ['CHECK', 740, 273], ['REVIEW', 560, 500], ['SHIP', 220, 500]].find(([, x, y]) => Math.hypot(p.x - x, p.y - y) < 4);
    const shown = (el) => Number(cs(el).opacity) > 0.5;
    const hk = [...svg.querySelectorAll('.v4-hk')].map((r) => col(cs(r).stroke));
    const st = [...svg.querySelectorAll('.v4-st-r')].map((r) => col(cs(r).stroke));
    const counter = (x) => [...svg.querySelectorAll('.v4-cv')].filter((t) => t.getAttribute('x') === x && shown(t)).map((t) => t.textContent).join('|');
    const tile = (k) => col(cs(document.querySelector('.tri.' + k)).borderTopColor);
    const bolt = svg.querySelector('.v4-bolt');
    return {
      dot: at ? at[0] : 'moving',
      pops: [...svg.querySelectorAll('.v4-pop')].filter(shown).map((g) => g.textContent.trim()),
      guard: hk[0], tidy: hk[1], check: hk[2],
      stations: st.join(' '),
      bolt: Number(cs(bolt).opacity) > 0.5 && parseFloat(cs(bolt).strokeDashoffset) === 0,
      log: col(cs(svg.querySelector('.v4-log-r')).stroke),
      newRow: col(cs(svg.querySelector('.v4-row-new')).fill),
      newRule: shown(svg.querySelector('.v4-newr')),
      blocked: counter('250'), rules: counter('380'), shipped: counter('510'),
      tiles: { p: tile('p'), e: tile('e'), s: tile('s') }
    };
  });
}

// Line 1: the SVG is the design's, character for character (one class name filled in).
test('the SVG is the design\'s, character for character', () => {
  const html = readFileSync('index.html', 'utf8');
  const want = '<svg class="fw2"' + DESIGN.split('<svg class="{{fxCls}}"')[1].split('</svg>')[0] + '</svg>';
  const start = html.indexOf('<svg class="fw2"');
  expect(start, 'index.html has <svg class="fw2"').toBeGreaterThan(-1);
  const got = html.slice(start, html.indexOf('</svg>', start) + 6);
  expect(got).toBe(want);
});

// Line 2: the environment and window CSS is ported as written.
test('the environment and window CSS lines are in site.css as written', () => {
  const css = readFileSync(join('assets', 'site.css'), 'utf8').split(/\r?\n/).map((l) => l.trim());
  const ranges = [[68, 68], [72, 72], [116, 223], [228, 239], [247, 247], [251, 251], [253, 254], [272, 273], [280, 282]];
  const missing = [];
  for (const [a, b] of ranges) for (let n = a; n <= b; n++) {
    const l = DLINES[n - 1].trim();
    if (l && !css.includes(l)) missing.push(n + ': ' + l.slice(0, 80));
  }
  expect(missing).toEqual([]);
});

// Line 3: every word in the window is the design's.
test('window header, tiles and buttons match the design word for word', async ({ page }) => {
  await page.goto('./');
  const head = DESIGN.match(/<div class="fwin-h"><b>(.*?)<\/b><span>(.*?)<\/span>/);
  await expect(page.locator('.stage .fwin-h b')).toHaveText(head[1]);
  await expect(page.locator('.stage .fwin-h span')).toHaveText(head[2]);
  const tiles = [...DESIGN.split('<div class="trio">')[1].split('</div>\n<div class="e-btns">')[0].matchAll(/<b><i><\/i>(.*?)<\/b><span>(.*?)<\/span>/g)].map((m) => [m[1], m[2]]);
  expect(tiles.map((t) => t[0])).toEqual(['PROTECTS', 'EFFICIENT', 'SELF-LEARNING']);
  const got = await page.$$eval('.trio .tri', (els) => els.map((t) => [t.querySelector('b').textContent, t.querySelector('span').textContent]));
  expect(got).toEqual(tiles);
  const btns = [...DESIGN.split('<div class="e-btns">')[1].split('</div>')[0].matchAll(/>([^<]+)<\/button>/g)].map((m) => m[1]);
  expect(btns).toEqual(['CLAUDE.md ⤢', 'BUILDER’S MAP ⤢']);
  await expect(page.locator('.e-btns .btn')).toHaveText(btns);
});

// Line 4: one 14-second loop — every timed animation and the dot share it.
test('every timed animation runs on one 14-second loop', async ({ page }) => {
  await page.goto('./');
  const r = await page.evaluate(() => {
    const eng = document.querySelector('.eng');
    const loop = ['k0', 'k1', 'k2', 'k3', 'k4', 'hk0', 'hk1', 'hk2', 'bolt4', 'mist4', 'logf4', 'rown', 'newr', 'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'cBa', 'cBb', 'cRa', 'cRb', 'cSa', 'cSb', 'tp', 'te', 'ts'];
    const anims = document.getAnimations().filter((a) => eng.contains(a.effect.target) && loop.includes(a.animationName));
    const motion = document.querySelector('.fw2 .v4-tok animateMotion');
    return {
      names: [...new Set(anims.map((a) => a.animationName))].sort(),
      want: loop.slice().sort(),
      bad: anims.filter((a) => { const t = a.effect.getTiming(); return t.duration !== 14000 || t.iterations !== Infinity || t.delay !== 0; }).map((a) => a.animationName),
      dot: motion && motion.getAttribute('dur') + ' ' + motion.getAttribute('repeatCount')
    };
  });
  expect(r.names).toEqual(r.want);
  expect(r.bad).toEqual([]);
  expect(r.dot).toBe('14s indefinite');
});

// Lines 4–5: frozen at each beat, the graphic shows the handoff's table and the counters tick.
const BEATS = [
  [0.03, { dot: 'PLAN', pops: [], blocked: '03', rules: '17', shipped: '12', bolt: false, newRule: false, tiles: { p: 'off', e: 'off', s: 'off' } }],
  [0.20, { dot: 'BUILD', pops: ['rm -rf data/ · ✗ BLOCKED'], guard: 'red', bolt: true, blocked: '04', rules: '17', shipped: '12', tiles: { p: 'yellow', e: 'off', s: 'off' } }],
  [0.36, { dot: 'CHECK', pops: ['✗ 2 OF 14 FAIL'], check: 'red', stations: 'off off red off off', blocked: '04', tiles: { p: 'off', e: 'off', s: 'red' } }],
  [0.44, { log: 'red', newRow: 'red', newRule: false, rules: '17' }],
  [0.50, { dot: 'BUILD', pops: ['+1 GUARD'], newRule: true, tidy: 'amber', rules: '18', tiles: { p: 'off', e: 'off', s: 'red' } }],
  [0.59, { dot: 'CHECK', pops: ['✓ 14 OF 14 PASS'], check: 'green', stations: 'off off green off off', tiles: { p: 'off', e: 'amber', s: 'off' } }],
  [0.71, { dot: 'REVIEW', pops: ['✓ 0 ISSUES'], stations: 'off off off green off', shipped: '12' }],
  [0.84, { dot: 'SHIP', pops: ['✓ SHIPPED'], stations: 'off off off off green', blocked: '04', rules: '18', shipped: '13', tiles: { p: 'off', e: 'amber', s: 'off' } }],
  [0.995, { dot: 'PLAN', pops: [], blocked: '03', rules: '17', shipped: '12', newRule: false, newRow: 'off', bolt: false }]
];
test('frozen at each beat, the graphic plays the handoff\'s table', async ({ page }) => {
  await page.goto('./');
  for (const [frac, want] of BEATS) {
    await freezeAt(page, frac);
    const got = await readState(page);
    for (const k of Object.keys(want)) expect(got[k], `${k} at ${Math.round(frac * 1000) / 10}%`).toEqual(want[k]);
  }
});

// Line 6: reduced motion — a still, complete graphic.
test('reduced motion: still and complete, first counter values, no pops', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const svg = document.querySelector('.fw2');
    const vis = (el) => { const c = getComputedStyle(el); return c.display !== 'none' && c.visibility !== 'hidden' && Number(c.opacity) > 0.3 && el.getBoundingClientRect().width > 0; };
    return {
      running: document.getAnimations().length,
      paused: svg.animationsPaused(),
      time: svg.getCurrentTime(),
      parts: ['.v4-file', '.v4-rules', '.v4-done', '.v4-hooks', '.v4-log', '.v4-loop'].map((s) => vis(svg.querySelector(s))),
      stations: [...svg.querySelectorAll('.v4-st')].map(vis),
      hooks: [...svg.querySelectorAll('.v4-hk')].map(vis),
      counters: [...svg.querySelectorAll('.v4-cv')].filter(vis).map((t) => t.textContent),
      pops: [...svg.querySelectorAll('.v4-pop')].filter((g) => Number(getComputedStyle(g).opacity) > 0).length,
      bolt: parseFloat(getComputedStyle(svg.querySelector('.v4-bolt')).strokeDashoffset),
      tiles: [...document.querySelectorAll('.tri')].map((t) => vis(t) && t.innerText.length > 10)
    };
  });
  expect(r.running).toBe(0);
  expect(r.paused).toBe(true);
  expect(r.time).toBe(0);
  expect(r.parts).toEqual([true, true, true, true, true, true]);
  expect(r.stations).toEqual([true, true, true, true, true]);
  expect(r.hooks).toEqual([true, true, true]);
  expect(r.counters).toEqual(['03', '17', '12']);
  expect(r.pops).toBe(0);
  expect(r.bolt).toBe(160);
  expect(r.tiles).toEqual([true, true, true]);
  await page.close();
});

// Line 7: pointing at a tile spotlights its part; leaving clears it.
test('tiles spotlight their part on hover and clear on leave', async ({ page }) => {
  await page.goto('./');
  const svg = page.locator('svg.fw2');
  const dims = [
    ['p', '.v4-loop', '.v4-hooks'],
    ['e', '.v4-hooks', '.v4-loop'],
    ['s', '.v4-hooks', '.v4-log']
  ];
  for (const [k, dimmed, lit] of dims) {
    await page.locator('.tri.' + k).hover();
    await expect(svg).toHaveClass(new RegExp('\\bfx-' + k + '\\b'));
    await expect(page.locator('.fw2 ' + dimmed)).toHaveCSS('opacity', '0.2');
    await expect(page.locator('.fw2 ' + lit)).toHaveCSS('opacity', '1');
    await page.locator('.hd-name').hover();
    await expect(svg).toHaveClass('fw2');
  }
});

// Line 7: on a touch screen a tap sets the spotlight, keeps it, and another tap switches it.
test('a tap spotlights a tile and another tap switches it', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto('./');
  const svg = page.locator('svg.fw2');
  await page.locator('.tri.e').tap();
  await page.waitForTimeout(300);
  await expect(svg).toHaveClass('fw2 fx-e');
  await page.locator('.tri.s').tap();
  await page.waitForTimeout(300);
  await expect(svg).toHaveClass('fw2 fx-s');
  await ctx.close();
});

// Line 10: closed windows are hidden by attribute and the scrim catches nothing.
test('on load every window is hidden and the scrim lets clicks through', async ({ page }) => {
  await page.goto('./');
  const r = await page.evaluate(() => ({
    wins: [...document.querySelectorAll('.win-wrap')].map((w) => [w.hidden, getComputedStyle(w).display]),
    scrim: getComputedStyle(document.querySelector('.scrim')).pointerEvents
  }));
  expect(r.wins.length).toBeGreaterThan(0);
  for (const w of r.wins) expect(w).toEqual([true, 'none']);
  expect(r.scrim).toBe('none');
});

// Line 8: both buttons open their graphic in a dialog; ✕, scrim and Esc close it; focus goes in and comes back.
const WINS = [
  ['CLAUDE.md ⤢', 'THE CLAUDE.MD ANATOMY', 'assets/claude-md-anatomy.png', 'The CLAUDE.md anatomy'],
  ['BUILDER’S MAP ⤢', 'THE BUILDER’S MAP', 'assets/builders-map.png', 'The Builder\'s Map']
];
for (const [btn, head, file, altStart] of WINS) {
  test(`${btn} opens ${head}; ✕, scrim and Esc close it`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./');
    const designHead = DESIGN.match(/imgHead: s\.open === 'img-claude' \? '(.*?)' : '(.*?)'/);
    expect([designHead[1], designHead[2]]).toContain(head);
    const alt = DESIGN.match(new RegExp('alt="(' + altStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^"]*)"'))[1];
    const opener = page.getByRole('button', { name: btn });
    const dialog = page.getByRole('dialog', { name: head });
    const close = dialog.getByRole('button', { name: 'Close' });
    for (const how of ['x', 'scrim', 'esc']) {
      await opener.click();
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      await expect(dialog.locator('.wh b')).toHaveText(head);
      await expect(close).toHaveText('CLOSE ✕');
      await expect(close).toBeFocused();
      const img = dialog.locator('img.imgfit:visible');
      await expect(img).toHaveCount(1);
      await expect(img).toHaveAttribute('src', './' + file);
      await expect(img).toHaveAttribute('alt', alt);
      await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
      await expect(page.locator('.scrim')).toHaveClass(/\bon\b/);
      await page.keyboard.press('Tab');
      await expect(close).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(close).toBeFocused();
      if (how === 'x') await close.click();
      if (how === 'scrim') await page.mouse.click(4, 4);
      if (how === 'esc') await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(page.locator('.win-wrap').first()).toHaveAttribute('hidden', '');
      await expect(page.locator('.scrim')).not.toHaveClass(/\bon\b/);
      await expect(opener).toBeFocused();
    }
    expect(errors).toEqual([]);
  });
}

// Line 9: the image fits the screen with no scrolling.
for (const [w, h] of [[390, 844], [1280, 800], [1440, 900]]) {
  test(`full graphics fit with no scrolling at ${w}×${h}`, async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto('./');
    for (const [btn] of WINS) {
      await page.getByRole('button', { name: btn }).click();
      const img = page.locator('.win-wrap:not([hidden]) img.imgfit:visible');
      await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
      await page.waitForTimeout(700); // the CRT opening
      const vw = await page.evaluate(usableWidth);
      const r = await img.evaluate((i, vw) => {
        const b = i.getBoundingClientRect(), wb = i.closest('.wb');
        return { top: b.top, left: b.left, bottom: b.bottom, right: b.right, vw, vh: innerHeight, sh: wb.scrollHeight, ch: wb.clientHeight, sw: wb.scrollWidth, cw: wb.clientWidth };
      }, vw);
      expect(r.top).toBeGreaterThanOrEqual(0);
      expect(r.left).toBeGreaterThanOrEqual(0);
      expect(r.bottom).toBeLessThanOrEqual(r.vh);
      expect(r.right).toBeLessThanOrEqual(r.vw);
      expect(r.sh).toBeLessThanOrEqual(r.ch);
      expect(r.sw).toBeLessThanOrEqual(r.cw);
      await page.keyboard.press('Escape');
    }
    await page.close();
  });
}

// Line 12: in the center column on desktop, first on tablets, full-bleed on phones with the small labels hidden.
for (const width of [390, 768, 1280, 1440]) {
  test(`environment placement at ${width}`, async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    const vw = await page.evaluate(usableWidth);
    const r = await page.evaluate((vw) => {
      const stage = document.querySelector('main.stage'), eng = stage.querySelector(':scope > section.eng');
      if (!eng) return null;
      const s = stage.getBoundingClientRect(), e = eng.getBoundingClientRect(), fwin = getComputedStyle(eng.querySelector('.fwin'));
      const fs = (sel) => getComputedStyle(document.querySelector(sel)).fontSize;
      const shown = (sel) => [...document.querySelectorAll(sel)].some((t) => getComputedStyle(t).display !== 'none');
      return {
        w: e.width, left: e.left, right: e.right, center: e.left + e.width / 2, stageCenter: s.left + s.width / 2,
        vw, first: stage.firstElementChild === eng || getComputedStyle(eng).order === '-1',
        borderL: fwin.borderLeftWidth, sub: shown('.fwin-h span'), small: shown('.v4-sts') || shown('.v4-ts') || shown('.v4-next'),
        stt: fs('.v4-stt'), lb: fs('.v4-lb'), hn: fs('.v4-hn'), cv: fs('.v4-cv'), doc: document.documentElement.scrollWidth
      };
    }, vw);
    expect(r, 'section.eng is a direct child of main.stage').not.toBeNull();
    expect(r.doc).toBeLessThanOrEqual(r.vw);
    if (width > 1000) {
      expect(Math.abs(r.center - r.stageCenter)).toBeLessThanOrEqual(1);
      expect(r.w).toBeGreaterThanOrEqual(440);
      expect(r.w).toBeLessThanOrEqual(580);
    } else if (width > 640) {
      expect(r.first).toBe(true);
      expect(r.w).toBeLessThanOrEqual(620);
      expect(Math.abs(r.center - r.stageCenter)).toBeLessThanOrEqual(1);
    } else {
      expect(r.first).toBe(true);
      expect(r.left).toBe(0);
      expect(r.right).toBe(r.vw);
      expect(r.borderL).toBe('0px');
      expect(r.sub).toBe(false);
      expect(r.small).toBe(false);
      expect([r.stt, r.lb, r.hn, r.cv]).toEqual(['21px', '16px', '16px', '46px']);
    }
    await page.close();
  });
}

// Line 13: at 1440×900 the whole environment window is on screen without scrolling.
test('the whole environment window is above the fold at 1440×900', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);
  const b = await page.locator('.eng .fwin').boundingBox();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(b.y).toBeGreaterThanOrEqual(0);
  expect(b.y + b.height).toBeLessThanOrEqual(900);
  await page.close();
});

// Line 14: tap sizes for the window buttons and CLOSE ✕.
test('window buttons and CLOSE ✕ are at least 44 px tall', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('./');
  for (const b of await page.locator('.e-btns .btn').all()) expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await page.getByRole('button', { name: 'CLAUDE.md ⤢' }).click();
  expect((await page.getByRole('button', { name: 'Close' }).boundingBox()).height).toBeGreaterThanOrEqual(44);
  await page.close();
});

// Line 14: zero console errors over the server and by double-click, after every window and tile.
for (const where of ['server', 'file']) {
  test(`zero console errors after windows and tiles (${where})`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto(where === 'server' ? './' : pathToFileURL(join(process.cwd(), 'index.html')).href);
    await expect(page.locator('svg.fw2')).toBeVisible();
    for (const t of await page.locator('.tri').all()) await t.click();
    for (const [btn] of WINS) {
      await page.getByRole('button', { name: btn }).click();
      await expect.poll(() => page.locator('.win-wrap:not([hidden]) img.imgfit:visible').evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
      await page.getByRole('button', { name: 'Close' }).click();
    }
    expect(errors).toEqual([]);
  });
}
