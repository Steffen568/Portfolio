// Unit 03 — Cards + connectors. Each test names the spec line it guards (specs/03-cards-connectors.md).
import { test, expect } from '@playwright/test';
import { withCopyChanges } from './copy-changes.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DESIGN = readFileSync(join(process.cwd(), 'design', 'portfolio-design.dc.html'), 'utf8');
const DLINES = DESIGN.split(/\r?\n/);
const ACC = 'rgb(255, 160, 40)';
// The design's order for the six lines, and where each card sits.
const LINE_ORDER = ['holy', 'optom', 'scout', 'wire', 'slate', 'dfs'];
const LEFT = ['scout', 'wire'], RIGHT = ['slate', 'dfs'], WEB = ['holy', 'optom'];

// The design's own data, read straight from its script, so the cards can never drift from it.
function designData() {
  const src = DESIGN.split(/<script type="text\/x-dc"[^>]*>/)[1].split('</script>')[0];
  const Component = new Function('DCLogic', src + '\nreturn Component;')(class {});
  const c = new Component();
  return { skills: c.skillList(), projects: withCopyChanges(c.projects()) };
}

// The usable viewport width (not clientWidth, which counts the reserved scrollbar strip; see unit 02).
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

// Load, wait for fonts and for every card's spawn animation to finish, so the layout is final.
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(document.getAnimations().filter((a) => a.animationName === 'spawn').map((a) => a.finished.catch(() => {})));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}
async function open(browser, width, height = 900, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height }, ...opts });
  await page.goto('./');
  await expect(page.locator('.card')).toHaveCount(6);
  await settle(page);
  return page;
}

// Every connector line: where it starts and ends against the window and its card. Empty list = all land.
function lineFaults(page) {
  return page.evaluate((order) => {
    const fr = document.querySelector('.eng .fwin').getBoundingClientRect();
    const paths = [...document.querySelectorAll('svg.lines path.ln')];
    if (paths.length !== 6) return ['expected 6 paths, found ' + paths.length];
    const bad = [];
    const near = (a, b) => Math.abs(a - b) <= 1;
    paths.forEach((p, i) => {
      const id = order[i];
      const d = p.getAttribute('d') || '';
      if (!/^M-?[\d.]+ -?[\d.]+( [HV]-?[\d.]+)+$/.test(d)) { bad.push(id + ': not a right-angled path: ' + d); return; }
      const m = p.getScreenCTM();
      const L = p.getTotalLength();
      const a = new DOMPoint(p.getPointAtLength(0).x, p.getPointAtLength(0).y).matrixTransform(m);
      const b = new DOMPoint(p.getPointAtLength(L).x, p.getPointAtLength(L).y).matrixTransform(m);
      const r = document.querySelector('[data-card="' + id + '"]').getBoundingClientRect();
      if (r.top > fr.bottom) {
        if (!near(a.y, fr.bottom) || a.x < fr.left + 59 || a.x > fr.right - 59) bad.push(id + ': does not start on the window bottom');
        if (!near(b.x, r.left + r.width / 2) || !near(b.y, r.top)) bad.push(id + ': does not end at the middle of the card top');
      } else {
        const left = r.right < fr.left;
        if (!near(a.x, left ? fr.left : fr.right) || a.y < fr.top + 49 || a.y > fr.bottom - 49) bad.push(id + ': does not start on the window edge');
        if (!near(b.x, left ? r.right : r.left)) bad.push(id + ': does not end on the card edge (' + b.x.toFixed(1) + ' vs ' + (left ? r.right : r.left).toFixed(1) + ')');
        if (!near(b.y, r.top + Math.min(r.height * 0.3, 70))) bad.push(id + ': lands at the wrong height (' + b.y.toFixed(1) + ' vs ' + (r.top + Math.min(r.height * 0.3, 70)).toFixed(1) + ')');
      }
    });
    return bad;
  }, LINE_ORDER);
}

// Line 1 (+ Ports): the CSS is the design's, as written; unit 02's temporary placement line is gone.
test('the cards and lines CSS lines are in site.css as written', () => {
  const raw = readFileSync(join('assets', 'site.css'), 'utf8');
  const css = raw.split(/\r?\n/).map((l) => l.trim());
  const ranges = [[56, 57], [69, 71], [73, 89], [91, 114], [252, 252], [255, 263], [269, 269], [275, 276]];
  const missing = [];
  for (const [a, b] of ranges) for (let n = a; n <= b; n++) {
    const l = DLINES[n - 1].trim();
    if (l && !css.includes(l)) missing.push(n + ': ' + l.slice(0, 80));
  }
  expect(missing).toEqual([]);
  expect(raw).not.toContain('grid-column:2');
});

// Line 1: the stage's markup is the design's: lines, left column, environment, right column, websites.
test('stage markup: headings as written, in the design\'s order', async ({ page }) => {
  const html = readFileSync('index.html', 'utf8');
  for (const n of [314, 323, 324, 325, 389, 390, 391, 401, 402, 403]) expect(html, 'design line ' + n).toContain(DLINES[n - 1].trim());
  await page.goto('./');
  const kids = await page.$$eval('main.stage > *', (els) => els.map((e) => e.tagName.toLowerCase() + '.' + [...e.classList].join('.')));
  expect(kids).toEqual(['svg.lines', 'section.col.col-main', 'section.eng', 'section.col.col-main.col-r', 'section.col.web-row']);
  const paths = await page.$$eval('svg.lines > path', (ps) => ps.map((p) => p.getAttribute('class')));
  expect(paths).toEqual(['ln', 'ln', 'ln', 'ln', 'ln', 'ln']);
});

// Line 7: every card's copy comes from the design's projects() and skillList().
test('each card: button, name, status, line, ticker, placeholder and chips from the design', async ({ page }) => {
  const { skills, projects } = designData();
  const label = Object.fromEntries(skills.map((k) => [k.id, k.label]));
  await page.goto('./');
  await settle(page);
  const cols = await page.evaluate(() => ({
    left: [...document.querySelectorAll('.col-main:not(.col-r) .card')].map((c) => c.dataset.card),
    right: [...document.querySelectorAll('.col-r .card')].map((c) => c.dataset.card),
    web: [...document.querySelectorAll('.web-row .card')].map((c) => c.dataset.card)
  }));
  expect(cols).toEqual({ left: LEFT, right: RIGHT, web: WEB });
  for (const p of projects) {
    const r = await page.locator('[data-card="' + p.id + '"]').evaluate((c) => ({
      tag: c.tagName, type: c.getAttribute('type'), cls: c.className, aria: c.getAttribute('aria-label'),
      go: c.querySelector(':scope > .go').textContent,
      tkr: c.querySelector('.thumb > b').textContent, shot: c.querySelector('.thumb > span').textContent,
      name: c.querySelector('.card-t > b').textContent,
      st: c.querySelector('.card-t > .st').textContent, stCls: c.querySelector('.card-t > .st').className, dot: !!c.querySelector('.st > i'),
      line: c.querySelector('.card-b > p').textContent,
      chips: [...c.querySelectorAll('.chips > .chip')].map((h) => h.textContent + '|' + h.className)
    }));
    expect(r).toEqual({
      tag: 'BUTTON', type: 'button', cls: 'card', aria: p.name + ': ' + p.line, go: 'OPEN ▸',
      tkr: p.tkr, shot: 'SCREENSHOT PENDING', name: p.name, st: p.status, stCls: 'st' + (p.wip ? ' wip' : ''), dot: true,
      line: p.line, chips: p.skills.map((x) => label[x[0]] + '|chip')
    });
    expect(r.chips.length).toBeLessThanOrEqual(4);
  }
  const wip = await page.locator('[data-card="optom"] .st').evaluate((e) => getComputedStyle(e).color);
  expect(wip).toBe('rgb(255, 107, 44)');
});

for (const width of [1100, 1280, 1440]) {
  // Lines 1–3: symmetric grid, equal-height side columns with matching card edges, websites centered below.
  test(`symmetric stage at ${width}`, async ({ browser }) => {
    const page = await open(browser, width);
    const r = await page.evaluate(() => {
      const box = (s) => document.querySelector(s).getBoundingClientRect();
      const c = (id) => box('[data-card="' + id + '"]');
      const L = box('.col-main:not(.col-r)'), R = box('.col-r'), E = box('.eng'), F = box('.eng .fwin'), S = box('main.stage');
      const rh = document.querySelector('.col-r .col-h');
      return {
        L, R, E, F, S, web: box('.web-row'),
        cards: Object.fromEntries(['scout', 'wire', 'slate', 'dfs', 'holy', 'optom'].map((id) => [id, c(id)])),
        mirrored: rh.querySelector('.lbl').getBoundingClientRect().left < rh.querySelector('b').getBoundingClientRect().left,
        webHead: [box('.web-row .col-h b'), box('.web-row .col-h .lbl')]
      };
    });
    const near = (a, b, msg) => expect(Math.abs(a - b), msg + ` (${a} vs ${b})`).toBeLessThanOrEqual(1);
    expect(r.L.right).toBeLessThanOrEqual(r.E.left);
    expect(r.R.left).toBeGreaterThanOrEqual(r.E.right);
    near(r.L.width, r.R.width, 'side columns same width');
    expect(r.mirrored, 'right heading: count left of title').toBe(true);
    const k = r.cards;
    near(r.L.bottom, r.R.bottom, 'side columns end together');
    near(k.scout.height, k.wire.height, 'left cards same height');
    near(k.slate.height, k.dfs.height, 'right cards same height');
    for (const [a, b] of [['scout', 'slate'], ['wire', 'dfs']]) {
      near(k[a].top, k[b].top, a + '/' + b + ' top edges');
      near(k[a].bottom, k[b].bottom, a + '/' + b + ' bottom edges');
    }
    expect(r.web.top).toBeGreaterThanOrEqual(r.F.bottom);
    near(k.holy.top, k.optom.top, 'websites side by side');
    near(k.holy.width, r.L.width, 'Holy Cross as wide as a side column');
    near(k.optom.width, r.L.width, 'Optometry as wide as a side column');
    near((k.holy.left + k.optom.right) / 2, (r.S.left + r.S.right) / 2, 'websites centered');
    near((r.webHead[0].left + r.webHead[1].right) / 2, (r.S.left + r.S.right) / 2, 'websites heading centered');
    await page.close();
  });

  // Line 5: every connector line lands on its card.
  test(`connector lines land at ${width}`, async ({ browser }) => {
    const page = await open(browser, width);
    await expect.poll(() => lineFaults(page)).toEqual([]);
    const dashed = await page.$$eval('svg.lines path.ln', (ps) => ps.map((p) => getComputedStyle(p).strokeDasharray));
    expect(dashed).toEqual(Array(6).fill('5px, 8px'));
    await page.close();
  });
}

// Line 5: lines are measured again after the window is resized.
test('connector lines land after a resize', async ({ browser }) => {
  const page = await open(browser, 1440);
  await expect.poll(() => lineFaults(page)).toEqual([]);
  await page.setViewportSize({ width: 1100, height: 900 });
  await expect.poll(() => lineFaults(page)).toEqual([]);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect.poll(() => lineFaults(page)).toEqual([]);
  await page.close();
});

// Line 5: a resize while a card is lifted (hover or focus) must not measure the lift into its line.
test('connector lines land after a resize mid-hover and mid-focus', async ({ browser }) => {
  const page = await open(browser, 1440);
  await page.locator('[data-card="holy"]').hover();
  await page.waitForTimeout(300);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(100);
  // Wait out the card's 0.2 s settle, then read once: a retrying check would pass while the card is still lifted.
  await page.mouse.move(5, 5);
  await page.waitForTimeout(400);
  expect(await lineFaults(page)).toEqual([]);
  await page.keyboard.press('Tab');
  await page.locator('[data-card="optom"]').focus();
  await page.waitForTimeout(300);
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.waitForTimeout(100);
  await page.locator('[data-card="optom"]').blur();
  await page.waitForTimeout(400);
  expect(await lineFaults(page)).toEqual([]);
  await page.close();
});

// Line 6: no lines at 1000 px and below.
for (const width of [1000, 768]) {
  test(`connector lines hidden at ${width}`, async ({ browser }) => {
    const page = await open(browser, width);
    expect(await page.locator('svg.lines').evaluate((s) => getComputedStyle(s).display)).toBe('none');
    await page.close();
  });
}

// Line 4: the header, the whole environment window and all four sports cards fit 1440×900.
test('at 1440×900 the header, the environment and all four sports cards fit without scrolling', async ({ browser }) => {
  const page = await open(browser, 1440, 900);
  const r = await page.evaluate(() => ({
    y: scrollY,
    bottoms: ['.hd', '.eng .fwin', ...['scout', 'wire', 'slate', 'dfs'].map((id) => '[data-card="' + id + '"]')].map((s) => [s, document.querySelector(s).getBoundingClientRect().bottom])
  }));
  expect(r.y).toBe(0);
  for (const [s, b] of r.bottoms) expect(b, s + ' ends inside 900 px').toBeLessThanOrEqual(900);
  await page.close();
});

// Line 8: striped placeholder; 5:2 side, 21:9 websites; 21:9 everywhere at 640 and below.
for (const [width, side, web] of [[1280, 5 / 2, 21 / 9], [768, 5 / 2, 21 / 9], [640, 21 / 9, 21 / 9], [390, 21 / 9, 21 / 9]]) {
  test(`thumbnails at ${width}`, async ({ browser }) => {
    const page = await open(browser, width);
    const r = await page.$$eval('.card', (cs) => cs.map((c) => {
      const t = c.querySelector('.thumb'), b = t.getBoundingClientRect();
      return { id: c.dataset.card, ratio: b.width / b.height, bg: getComputedStyle(t).backgroundImage };
    }));
    for (const t of r) {
      const want = ['holy', 'optom'].includes(t.id) ? web : side;
      expect(Math.abs(t.ratio - want), t.id + ' ratio ' + t.ratio.toFixed(3)).toBeLessThanOrEqual(0.05);
      expect(t.bg, t.id + ' striped').toContain('repeating-linear-gradient');
    }
    await page.close();
  });
}

// Line 9: hover brings every effect and brightens only this card's line; the name scrambles for 380 ms.
test('hover: lift, border, brackets, OPEN ▸, sweep, glow, its line, scramble', async ({ browser }) => {
  const page = await open(browser, 1280);
  const card = page.locator('[data-card="slate"]');
  await card.hover();
  await page.waitForTimeout(450);
  const r = await card.evaluate((c) => {
    const cs = getComputedStyle(c), t = c.querySelector('.thumb');
    return {
      transform: cs.transform, border: cs.borderTopColor, glow: cs.boxShadow,
      before: getComputedStyle(c, '::before').opacity, after: getComputedStyle(c, '::after').opacity,
      go: getComputedStyle(c.querySelector('.go')).opacity,
      sweep: getComputedStyle(t, '::after').animationName, tkr: getComputedStyle(t.querySelector('b')).textShadow,
      lines: [...document.querySelectorAll('svg.lines path.ln')].map((p) => p.classList.contains('on')),
      name: c.querySelector('.card-t > b').textContent, aria: c.getAttribute('aria-label')
    };
  });
  expect(r.transform).toBe('matrix(1, 0, 0, 1, 0, -3)');
  expect(r.border).toBe(ACC);
  expect(r.glow).toContain('255, 160, 40');
  expect([r.before, r.after, r.go]).toEqual(['1', '1', '1']);
  expect(r.sweep).toBe('sweep');
  expect(r.tkr).not.toBe('none');
  expect(r.lines).toEqual(LINE_ORDER.map((id) => id === 'slate'));
  expect(r.name).toBe('SlateHub');
  expect(r.aria).toBe('SlateHub: MLB research: one game broken into pitchers, hitters and conditions.');
  await page.mouse.move(5, 5);
  await page.waitForTimeout(300);
  const off = await card.evaluate((c) => ({
    transform: getComputedStyle(c).transform, go: getComputedStyle(c.querySelector('.go')).opacity,
    on: c.classList.contains('on'), lines: document.querySelectorAll('svg.lines path.ln.on').length
  }));
  expect(off).toEqual({ transform: 'none', go: '0', on: false, lines: 0 });
  await page.close();
});

test('the name scrambles on enter and settles by 420 ms', async ({ browser }) => {
  const page = await open(browser, 1280);
  const first = await page.locator('[data-card="slate"]').evaluate((c) => {
    c.dispatchEvent(new PointerEvent('pointerenter'));
    return c.querySelector('.card-t > b').textContent;
  });
  expect(first).not.toBe('SlateHub');
  expect(first).toHaveLength('SlateHub'.length);
  await page.waitForTimeout(420);
  // A plain read, not a retrying check: the name must already be back at 420 ms.
  expect(await page.locator('[data-card="slate"] .card-t > b').textContent()).toBe('SlateHub');
  await page.close();
});

// Line 9: keyboard focus does what hover does; blur clears it.
test('focus brings the hover state and its line; blur clears it', async ({ browser }) => {
  const page = await open(browser, 1280);
  await page.keyboard.press('Tab');
  const card = page.locator('[data-card="wire"]');
  await card.focus();
  await page.waitForTimeout(450);
  const r = await card.evaluate((c) => ({
    on: c.classList.contains('on'), go: getComputedStyle(c.querySelector('.go')).opacity,
    lines: [...document.querySelectorAll('svg.lines path.ln')].map((p) => p.classList.contains('on')),
    outline: [getComputedStyle(c).outlineStyle, getComputedStyle(c).outlineWidth, getComputedStyle(c).outlineColor]
  }));
  expect(r.on).toBe(true);
  expect(r.go).toBe('1');
  expect(r.lines).toEqual(LINE_ORDER.map((id) => id === 'wire'));
  expect(r.outline).toEqual(['solid', '2px', ACC]);
  await card.blur();
  expect(await card.evaluate((c) => c.classList.contains('on') || !!document.querySelector('svg.lines path.ln.on'))).toBe(false);
  await page.close();
});

// Line 9: one card at a time, as the design's single hover state: hover one, focus another, only the newest is on.
test('hover one card and focus another: only the newest card and line are on', async ({ browser }) => {
  const page = await open(browser, 1280);
  await page.locator('[data-card="scout"]').hover();
  await page.keyboard.press('Tab');
  await page.locator('[data-card="slate"]').focus();
  const on = () => page.evaluate(() => ({
    cards: [...document.querySelectorAll('.card.on')].map((c) => c.dataset.card),
    lines: [...document.querySelectorAll('svg.lines path.ln')].map((p) => p.classList.contains('on'))
  }));
  expect(await on()).toEqual({ cards: ['slate'], lines: LINE_ORDER.map((id) => id === 'slate') });
  await page.mouse.move(5, 5);
  expect(await on(), 'leaving scout leaves the focused card on').toEqual({ cards: ['slate'], lines: LINE_ORDER.map((id) => id === 'slate') });
  await page.close();
});

// Line 10: stagger in, from the sides toward the environment.
test('cards stagger in with spawn', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.card')).toHaveCount(6);
  const r = await page.$$eval('.card', (cs) => cs.map((c) => {
    const s = getComputedStyle(c);
    return [c.dataset.card, s.animationName, s.animationDelay, s.getPropertyValue('--fx').trim()];
  }));
  expect(r).toEqual([
    ['scout', 'spawn', '0.5s', '30px'], ['wire', 'spawn', '0.62s', '30px'],
    ['slate', 'spawn', '0.74s', '-30px'], ['dfs', 'spawn', '0.86s', '-30px'],
    ['holy', 'spawn', '0.98s', '0px'], ['optom', 'spawn', '1.1s', '0px']
  ]);
});

// Line 11: at 1000 px and below, one stem: environment, four sports tools, websites.
for (const width of [1000, 768]) {
  test(`one stem at ${width}`, async ({ browser }) => {
    const page = await open(browser, width);
    const r = await page.evaluate(() => {
      const top = (s) => document.querySelector(s).getBoundingClientRect().top;
      const card = (id) => document.querySelector('[data-card="' + id + '"]');
      return {
        order: ['.eng', ...['scout', 'wire', 'slate', 'dfs', 'holy', 'optom'].map((id) => '[data-card="' + id + '"]')].map(top),
        rightHead: getComputedStyle(document.querySelector('.col-r .col-h')).display,
        stems: [...document.querySelectorAll('.stage > .col')].map((c) => getComputedStyle(c).borderLeftWidth + ' ' + getComputedStyle(c).borderLeftStyle),
        fit: ['scout', 'wire', 'slate', 'dfs'].map((id) => {
          const c = card(id), h = c.getBoundingClientRect().height;
          return Math.abs(h - c.querySelector('.thumb').getBoundingClientRect().height - c.querySelector('.card-b').getBoundingClientRect().height - 2) <= 1;
        })
      };
    });
    for (let i = 1; i < r.order.length; i++) expect(r.order[i], 'item ' + i + ' below the one before').toBeGreaterThan(r.order[i - 1]);
    expect(r.rightHead).toBe('none');
    expect(r.stems).toEqual(['2px dashed', '2px dashed', '2px dashed']);
    expect(r.fit).toEqual([true, true, true, true]);
    await page.close();
  });
}

// Lines 11–12: one card per row at 768 for websites, and for every card at 390, each the full width of its column.
for (const width of [768, 390]) {
  test(`one card per row at ${width}`, async ({ browser }) => {
    const page = await open(browser, width);
    const r = await page.$$eval('.card', (cs) => cs.map((c) => {
      const b = c.getBoundingClientRect(), g = c.parentElement.getBoundingClientRect();
      return { id: c.dataset.card, left: b.left - g.left, width: b.width - g.width };
    }));
    for (const c of r) {
      expect(Math.abs(c.left), c.id + ' starts at its column edge').toBeLessThanOrEqual(1);
      expect(Math.abs(c.width), c.id + ' fills its column').toBeLessThanOrEqual(1);
    }
    await page.close();
  });
}

// Line 13: real buttons, 44 px, a click opens nothing yet; no sideways scroll at five widths.
// Superseded by unit 04 (specs/04-skills-panel.md, "Supersedes"): a click used to open nothing; now it opens
// only that card's panel, nothing else.
test('cards are 44 px+ buttons and a click opens only that card\'s panel', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('./');
  await settle(page);
  for (const id of ['scout', 'wire', 'slate', 'dfs', 'holy', 'optom']) {
    const c = page.locator('[data-card="' + id + '"]');
    expect((await c.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await c.click();
    expect(await page.evaluate(() => ({
      open: [...document.querySelectorAll('.win-wrap:not([hidden])')].map((w) => w.dataset.win), hash: location.hash,
      scrim: document.querySelector('[data-scrim]').classList.contains('on')
    }))).toEqual({ open: ['pj'], hash: '#' + id, scrim: true });
    await page.keyboard.press('Escape');
    await expect(page.locator('.win-wrap:not([hidden])')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

for (const width of [390, 768, 1100, 1280, 1440]) {
  test(`no sideways scroll with the cards at ${width}`, async ({ browser }) => {
    const page = await open(browser, width);
    const vw = await page.evaluate(usableWidth);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vw);
    await page.close();
  });
}

test('opens from file:// with six cards and zero console errors', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto(pathToFileURL(join(process.cwd(), 'index.html')).href);
  await expect(page.locator('.card')).toHaveCount(6);
  await settle(page);
  await page.locator('[data-card="holy"]').hover();
  expect(errors).toEqual([]);
});

// Line 14: reduced motion: no spawn, no line animation, no scramble.
test('reduced motion: cards and lines still, no scramble', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.locator('.card')).toHaveCount(6);
  const r = await page.evaluate(() => {
    const c = document.querySelector('[data-card="slate"]');
    c.dispatchEvent(new PointerEvent('pointerenter'));
    return {
      name: c.querySelector('.card-t > b').textContent,
      cardAnims: [...document.querySelectorAll('.card')].map((e) => getComputedStyle(e).animationName),
      lineAnims: [...document.querySelectorAll('svg.lines path.ln')].map((e) => getComputedStyle(e).animationName),
      opacity: [...document.querySelectorAll('.card')].map((e) => getComputedStyle(e).opacity)
    };
  });
  expect(r.name).toBe('SlateHub');
  expect(r.cardAnims).toEqual(Array(6).fill('none'));
  expect(r.lineAnims).toEqual(Array(6).fill('none'));
  expect(r.opacity).toEqual(Array(6).fill('1'));
  await page.close();
});
