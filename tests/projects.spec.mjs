// Unit 03 — Projects. Each test names the spec line it guards (specs/03-projects.md).
// Elements are found by the design's own text, roles and aria-labels, not by the classes under test.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const DESIGN = readFileSync('design/portfolio-design.dc.html', 'utf8');
const ORDER = ['scout', 'holy', 'wire', 'slate', 'optom', 'dfs'];
const DEMOS = ORDER.filter((id) => id !== 'optom');
const AMBER = 'rgb(255, 160, 40)';
const GREEN = 'rgb(124, 196, 106)';
const ORANGE = 'rgb(255, 107, 44)';

// The design's X and P, evaluated straight from its data() so the test can't drift from the design.
function designData() {
  const src = DESIGN.slice(DESIGN.indexOf('const X = {'), DESIGN.indexOf('this._d = { X: X, P: P };'));
  const p = (name, does, inp, out, runs) => ({ name, does, inp: inp || '—', out: out || '—', runs: runs || '—' });
  return new Function('p', src + '; return { X: X, P: P };')(p);
}
const { X, P } = designData();

// The design's <svg> for project id, and its aria-label.
function designSvgSrc(id) {
  const at = DESIGN.indexOf('<sc-if value="{{W.' + id + '}}"');
  const start = DESIGN.indexOf('<svg', at);
  return DESIGN.slice(start, DESIGN.indexOf('</svg>', start));
}
const LABEL = Object.fromEntries(ORDER.map((id) => [id, designSvgSrc(id).match(/aria-label="([^"]*)"/)[1]]));

// The design's drawing as a flat list of elements: tag, attributes (minus bindings), classes (renamed dg-), text.
function designSvgElements(id) {
  const out = [];
  for (const m of designSvgSrc(id).matchAll(/<(\w+)([^>]*)>([^<]*)/g)) {
    const attrs = {};
    let cls = [];
    for (const a of m[2].matchAll(/([\w:-]+)="([^"]*)"/g)) {
      if (/^on/i.test(a[1])) continue;
      if (a[1] === 'class') cls = a[2].split(/\s+/).map((c) => (/^\{\{K\.\w+\d\}\}$/.test(c) ? 'dg-pt' : c === 'dg' ? 'dg' : 'dg-' + c));
      else attrs[a[1]] = a[2];
    }
    if (id === 'optom' && m[1] === 'text' && m[3] === 'the doctor') attrs.y = '26'; // spec 05 D6 (Steffen, 2026-11-02): lifted off its neighbours
    out.push({ tag: m[1], attrs, cls: cls.sort(), text: m[1] === 'text' ? m[3].replace(/&lt;/g, '<').replace(/&gt;/g, '>') : '' });
  }
  return out;
}
const pageSvgElements = (page, id) => drawing(page, id).evaluate((svg) => [svg, ...svg.querySelectorAll('*')].map((el) => {
  const attrs = {};
  for (const a of el.attributes) if (a.name !== 'class' && a.name !== 'hidden' && !a.name.startsWith('data-') && !/^on/i.test(a.name)) attrs[a.name] = a.value; // hidden: which project shows
  const cls = [...el.classList].filter((c) => c !== 'dg-on' && c !== 'dg-dim').sort();
  return { tag: el.localName, attrs, cls, text: el.localName === 'text' ? el.textContent : '' };
}));

function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}
const proj = (page) => page.locator('[data-page="projects"]');
const tabs = (page) => page.getByRole('tab');
const tab = (page, id) => page.getByRole('tab').filter({ hasText: P[id].tkr });
const title = (page) => proj(page).getByRole('heading', { level: 2 });
const counter = (page) => proj(page).getByText(/^\d \/ 6$/);
const viewed = (page) => proj(page).getByText(/^VIEWED \d\/6$/);
const tourKey = (page) => page.locator('.topbar .fk', { hasText: 'GO' });
const drawing = (page, id) => page.locator(`svg[aria-label="${LABEL[id]}"]`);
const parts = (page, id) => drawing(page, id).locator('xpath=./*[local-name()="g"]');
const partNum = (page, id, n) => parts(page, id).nth(n - 1).locator('text', { hasText: new RegExp('^' + n + '$') });
const legend = (page, id, n) => proj(page).locator('button', { hasText: new RegExp('^' + n + X[id].parts[n - 1].name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }).filter({ visible: true });
const card = (page) => proj(page).getByText('DATA IN', { exact: true }).filter({ visible: true }).locator('xpath=../..');
const drawFrame = (page) => proj(page).getByText("HOW IT'S BUILT", { exact: true }).locator('xpath=../..');
const shotLink = (page, id) => proj(page).getByRole('link', { name: 'Open the ' + P[id].label + ' demo' });
const shotFrame = (page, id) => proj(page).getByText('portfolio/' + P[id].path + 'index.html', { exact: true }).filter({ visible: true }).locator('xpath=../..');
const prevBtn = (page) => proj(page).getByRole('button', { name: /^‹ / });
const nextBtn = (page) => proj(page).getByRole('button', { name: / ›$/ });
const box = (loc) => loc.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
const fresh = async (page, hash) => { await page.goto('./' + hash); await page.reload(); await settle(page); };
// The page reveal (0.35 s clip) and the cartridge stagger swallow clicks until they finish.
const settle = (page) => page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.animationName === 'pg' || a.animationName === 'cin').map((a) => a.finished)));
const subOf = (id, seenSet, cur, nextId) => (seenSet.has(id) ? '✓ ' : id === nextId ? 'NEXT ▸ ' : '') + P[id].sub;

// Every string on the selected project, and only that project's drawing showing.
async function expectProject(page, id) {
  const i = ORDER.indexOf(id);
  await expect(page).toHaveURL(new RegExp('#projects/' + id + '$'));
  await expect(title(page)).toHaveText(P[id].label.toUpperCase());
  await expect(proj(page).getByText(P[id].line, { exact: true })).toBeVisible();
  await expect(counter(page)).toHaveText(`${i + 1} / 6`);
  await expect(proj(page).getByText(P[id].status, { exact: true })).toBeVisible();
  await expect(proj(page).getByText(P[id].path, { exact: true })).toBeVisible();
  await expect(proj(page).getByText(P[id].what, { exact: true })).toBeVisible();
  await expect(prevBtn(page)).toHaveText('‹ ' + (i > 0 ? P[ORDER[i - 1]].label.toUpperCase() : 'HOME'));
  await expect(nextBtn(page)).toHaveText((i < 5 ? P[ORDER[i + 1]].label.toUpperCase() : 'HOW I WORK') + ' ›');
  await expect(tab(page, id)).toHaveAttribute('aria-selected', 'true');
  expect(await tabs(page).evaluateAll((els) => els.filter((e) => e.getAttribute('aria-selected') === 'true').length)).toBe(1);
  for (const o of ORDER) {
    if (o === id) await expect(drawing(page, o)).toBeVisible(); else await expect(drawing(page, o)).toBeHidden();
  }
  const shown = await proj(page).getByRole('button').filter({ hasText: /^\d/ }).filter({ visible: true }).allTextContents();
  expect(shown).toEqual(X[id].parts.map((pt, n) => (n + 1) + pt.name)); // only this drawing's legend
  await expect(card(page)).toHaveCount(1); // only this drawing's card
}

// n = 0: overview, nothing dimmed. n = 1..: that part lit, the rest at 30 %, the card shows it.
async function expectActive(page, id, n) {
  const count = X[id].parts.length;
  for (let i = 1; i <= count; i++) {
    await expect(parts(page, id).nth(i - 1)).toHaveCSS('opacity', n === 0 || n === i ? '1' : '0.3');
    const circle = partNum(page, id, i).locator('xpath=..').locator('circle');
    if (n === i) await expect(circle).toHaveCSS('fill', AMBER); else await expect(circle).not.toHaveCSS('fill', AMBER);
  }
  const c = n ? X[id].parts[n - 1] : X[id].over;
  await expect(card(page).locator('h4')).toHaveText((n ? String(n) : '·') + c.name);
  await expect(card(page).locator('p')).toHaveText(c.does);
  await expect(card(page).getByText('DATA IN', { exact: true }).locator('xpath=..')).toHaveText('DATA IN' + c.inp + 'DATA OUT' + c.out + 'RUNS ON' + c.runs);
}
const away = (page) => title(page).hover();

// Line 1 + 2 + 12: every string is the design's, for every project.
test('Projects copy is ported exactly from the design', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/scout');
  await expect(proj(page).locator('.ph')).toHaveText('02 · PROJECTS<GO>VIEWED 1/6');
  await expect(proj(page).getByText('6 PROJECTS', { exact: true })).toBeVisible();
  const hint = proj(page).getByText('WEBSITES · SPORTS DATA TOOLS · EACH WITH A WORKING DEMO', { exact: true });
  await expect(hint).toBeVisible();
  const seenSet = new Set();
  for (const id of ORDER) {
    await tab(page, id).click();
    seenSet.add(id);
    await expectProject(page, id);
    const nextId = ORDER.find((o) => !seenSet.has(o));
    await expect(tabs(page)).toHaveText(ORDER.map((o, i) => `0${i + 1}${P[o].tkr}${P[o].label}${subOf(o, seenSet, id, nextId)}`));
    await expect(proj(page).getByText(X[id].over.does, { exact: true })).toBeVisible(); // the card's overview
  }
  await page.setViewportSize({ width: 819, height: 900 });
  await expect(hint).toBeHidden();
});

// Line 2: selected, viewed and next-unviewed states, read from the computed look.
test('cartridge states: selected, viewed, next unviewed', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/scout');
  const sub = (id, text) => tab(page, id).getByText(text, { exact: true });
  await expect(tab(page, 'scout')).toHaveCSS('background-color', AMBER);
  const notch = await tab(page, 'scout').evaluate((el) => { const s = getComputedStyle(el, '::after'); return [s.content, s.borderTopColor, s.borderTopWidth]; });
  expect(notch).toEqual(['""', AMBER, '8px']);
  await expect(sub('holy', 'NEXT ▸ PHASE 1')).toHaveCSS('color', AMBER);
  await expect(tab(page, 'holy')).toHaveCSS('border-top-color', 'rgba(255, 160, 40, 0.6)');
  await expect(tab(page, 'wire')).not.toHaveCSS('background-color', AMBER);
  await expect(sub('wire', 'RESEARCH TOOL')).toBeVisible();
  await tab(page, 'holy').click();
  await expect(sub('scout', '✓ LIVE BETA')).toHaveCSS('color', GREEN);
  await expect(tab(page, 'scout')).not.toHaveCSS('background-color', AMBER);
  await expect(tab(page, 'holy')).toHaveCSS('background-color', AMBER);
  await expect(sub('wire', 'NEXT ▸ RESEARCH TOOL')).toHaveCSS('color', AMBER);
  // The next unviewed is never marked on the selected cartridge: select the first unviewed, then nothing earlier is unviewed.
  await fresh(page, '#projects/holy');
  await expect(sub('scout', 'NEXT ▸ LIVE BETA')).toBeVisible();
  await expect(tab(page, 'holy')).toContainText('✓ PHASE 1');
});

// Line 3: a project counts as viewed however it is reached; the counter is its place in the order.
test('VIEWED counts every way a project is reached', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#home');
  await page.locator('[data-page="home"] svg text', { hasText: /^HCRS$/ }).click({ force: true }); // Home cartridge
  await expectProject(page, 'holy');
  await expect(viewed(page)).toHaveText('VIEWED 1/6');
  await page.locator('.topbar .fk', { hasText: 'F1' }).click();
  await page.locator('.topbar .fk', { hasText: 'F2' }).click(); // F2 returns to the current project
  await expectProject(page, 'holy');
  await expect(viewed(page)).toHaveText('VIEWED 1/6');
  await nextBtn(page).click();
  await expectProject(page, 'wire');
  await expect(viewed(page)).toHaveText('VIEWED 2/6');
  await proj(page).getByRole('button', { name: 'Next project' }).click();
  await expectProject(page, 'slate');
  await expect(viewed(page)).toHaveText('VIEWED 3/6');
  await tourKey(page).click(); // first unviewed in order
  await expectProject(page, 'scout');
  await expect(viewed(page)).toHaveText('VIEWED 4/6');
  await tab(page, 'dfs').click();
  await expect(viewed(page)).toHaveText('VIEWED 5/6');
  await fresh(page, '#projects/optom'); // a shared link
  await expectProject(page, 'optom');
  await expect(viewed(page)).toHaveText('VIEWED 1/6');
});

// Line 4: ‹ › and previous / next step through the order; the ends lead to Home and How I work.
test('previous / next and the arrows step through; the ends go Home and How I work', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/scout');
  for (const id of ORDER.slice(1)) { await nextBtn(page).click(); await expectProject(page, id); }
  await nextBtn(page).click();
  await expect(page).toHaveURL(/#how$/);
  await expect(page.locator('[data-page="how"]')).toBeVisible();
  await fresh(page, '#projects/dfs');
  for (const id of ORDER.slice(0, 5).reverse()) { await proj(page).getByRole('button', { name: 'Previous project' }).click(); await expectProject(page, id); }
  await proj(page).getByRole('button', { name: 'Previous project' }).click();
  await expect(page).toHaveURL(/#home$/);
  await fresh(page, '#projects/holy');
  await prevBtn(page).click();
  await expectProject(page, 'scout');
  await prevBtn(page).click();
  await expect(page).toHaveURL(/#home$/);
  await fresh(page, '#projects/dfs');
  await proj(page).getByRole('button', { name: 'Next project' }).click();
  await expect(page).toHaveURL(/#how$/);
});

// Line 4: below 700 px the arrows hide and the row scrolls inside its own box, never the page.
test('arrows hide below 700 px; the row scrolls in its own box', async ({ page }) => {
  await page.setViewportSize({ width: 699, height: 900 });
  await fresh(page, '#projects/scout');
  await expect(proj(page).getByRole('button', { name: 'Previous project' })).toBeHidden();
  await expect(proj(page).getByRole('button', { name: 'Next project' })).toBeHidden();
  const rail = page.getByRole('tablist');
  const r = await rail.evaluate((el) => ({ over: el.scrollWidth > el.clientWidth, ox: getComputedStyle(el).overflowX }));
  expect(r).toEqual({ over: true, ox: 'auto' });
  await rail.evaluate((el) => { el.scrollLeft = 300; });
  expect(await rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 390, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 700, height: 900 }); // the design's query is max-width: 700px
  await expect(proj(page).getByRole('button', { name: 'Previous project' })).toBeHidden();
  await page.setViewportSize({ width: 701, height: 900 });
  await expect(proj(page).getByRole('button', { name: 'Previous project' })).toBeVisible();
  await expect(proj(page).getByRole('button', { name: 'Next project' })).toBeVisible();
});

// Line 5: a tablist; arrow keys move the selection and the focus, wrapping within the six.
test('tablist: arrow keys move between projects', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/scout');
  await expect(page.getByRole('tablist')).toHaveCount(1);
  await expect(tabs(page)).toHaveCount(6);
  await tab(page, 'scout').focus();
  await page.keyboard.press('ArrowRight');
  await expectProject(page, 'holy');
  await expect(tab(page, 'holy')).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft'); // wraps to the last
  await expectProject(page, 'dfs');
  await expect(tab(page, 'dfs')).toBeFocused();
  await page.keyboard.press('ArrowRight'); // wraps to the first
  await expectProject(page, 'scout');
  // Roving tabindex: Tab reaches the selected cartridge only.
  expect(await tabs(page).evaluateAll((els) => els.map((e) => e.tabIndex))).toEqual([0, -1, -1, -1, -1, -1]);
});

// Line 6: hover scrambles a name for 400 ms.
test('hovering a cartridge scrambles its name for 400 ms', async ({ page }) => {
  await page.clock.install();
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/scout');
  await page.clock.pauseAt(Date.now() + 5000);
  const before = await tab(page, 'holy').textContent();
  await tab(page, 'holy').dispatchEvent('pointerenter');
  await page.clock.runFor(50);
  const during = await tab(page, 'holy').textContent();
  expect(during).not.toContain('Holy Cross');
  expect(during.length).toBe(before.length);
  await page.clock.runFor(300);
  expect(await tab(page, 'holy').textContent()).not.toContain('Holy Cross');
  await page.clock.runFor(150);
  expect(await tab(page, 'holy').textContent()).toBe(before);
});

// Line 6: on every selection the title scrambles in over 550 ms, after 60 ms.
test('the title scrambles in over 550 ms on every selection', async ({ page }) => {
  await page.clock.install();
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/scout');
  await page.clock.pauseAt(Date.now() + 5000);
  for (const id of ['holy', 'wire']) {
    const want = P[id].label.toUpperCase();
    await tab(page, id).dispatchEvent('click');
    await page.clock.runFor(40);
    const t = await title(page).textContent();
    expect(t).not.toBe(want);
    expect(t.length).toBe(want.length);
    expect([...t].map((c) => c === ' ')).toEqual([...want].map((c) => c === ' '));
    await page.clock.runFor(300);
    expect(await title(page).textContent()).not.toBe(want);
    await page.clock.runFor(300); // 640 ms > 60 + 550
    expect(await title(page).textContent()).toBe(want);
  }
});
// Line 6, exact timing (review 1): with random glyphs pinned to 'A', the settled share is (t − 60) / 550 of the title.
test('the title settles on the design timing: 60 ms delay, 550 ms', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.clock.install();
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/scout');
  await page.clock.pauseAt(Date.now() + 5000);
  await tab(page, 'holy').dispatchEvent('click');
  await page.clock.runFor(70); // last redraw at 66 ms: nothing settled yet
  expect(await title(page).textContent()).toBe('AAAA AAAAA');
  await page.clock.runFor(270); // 330 ms: (330 − 60) / 550 → 4 of 10
  expect(await title(page).textContent()).toBe('HOLY AAAAA');
  await page.clock.runFor(260); // 594 ms: 9 of 10
  expect(await title(page).textContent()).toBe('HOLY CROSA');
  await page.clock.runFor(40); // 627 ms ≥ 610
  expect(await title(page).textContent()).toBe('HOLY CROSS');
});
test('reduced motion: names and titles never scramble', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  await page.clock.install();
  await page.goto('./#projects/scout');
  await page.clock.pauseAt(Date.now() + 5000);
  await tab(page, 'holy').dispatchEvent('click');
  await page.clock.runFor(40);
  expect(await title(page).textContent()).toBe('HOLY CROSS');
  await tab(page, 'wire').dispatchEvent('pointerenter');
  await page.clock.runFor(40);
  expect(await tab(page, 'wire').textContent()).toContain('The Wire');
  await page.close();
});

// Line 7: cartridges stagger in.
test('cartridges stagger in', async ({ page }) => {
  await page.goto('./#projects/scout');
  const a = await tabs(page).evaluateAll((els) => els.map((e) => { const s = getComputedStyle(e); return [s.animationName, s.animationDuration, s.animationDelay]; }));
  expect(a).toEqual(['0s', '0.06s', '0.12s', '0.18s', '0.24s', '0.3s'].map((d) => ['cin', '0.45s', d]));
});

// Line 9: drawing frame and screenshot frame are exactly the same size; 30 px bar over an 800:460 body.
for (const w of [1280, 768, 390]) {
  test(`drawing and screenshot frames are the same size at ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await fresh(page, '#projects/scout');
    for (const id of ORDER) {
      await tab(page, id).click();
      await expectProject(page, id);
      const a = await box(drawFrame(page));
      const b = await box(shotFrame(page, id));
      expect(Math.abs(a.w - b.w)).toBeLessThanOrEqual(0.5);
      // Spec 05 D2 (Steffen, 2026-11-02): at 390 the drawing keeps 9 px words, so its frame is taller (handoff: same size at 1280 and 768).
      if (w !== 390) expect(Math.abs(a.h - b.h)).toBeLessThanOrEqual(0.5);
      else expect(a.h).toBeGreaterThan(b.h);
      expect((await box(proj(page).getByText("HOW IT'S BUILT", { exact: true }).locator('xpath=..'))).h).toBe(30);
      expect((await box(proj(page).getByText('portfolio/' + P[id].path + 'index.html', { exact: true }).filter({ visible: true }).locator('xpath=..'))).h).toBe(30);
      const svg = await box(drawing(page, id));
      const body = await box(proj(page).getByText(P[id].path + 'screenshots/desktop.png', { exact: true }).filter({ visible: true }).locator('xpath=..'));
      expect(Math.abs(svg.h - svg.w * 460 / 800)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(body.h - body.w * 460 / 800)).toBeLessThanOrEqual(0.5);
      if (w >= 900) expect(b.x).toBeGreaterThanOrEqual(a.x + a.w); // side by side
      else expect(b.y).toBeGreaterThanOrEqual(a.y + a.h); // stacked
    }
  });
}

// Line 9, the breakpoint (review 2): stacked at 900 px, side by side from 901 px.
test('the two frames stack at 900 px and sit side by side at 901 px', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await fresh(page, '#projects/scout');
  let a = await box(drawFrame(page)), b = await box(shotFrame(page, 'scout'));
  expect(b.y).toBeGreaterThanOrEqual(a.y + a.h);
  await page.setViewportSize({ width: 901, height: 900 });
  a = await box(drawFrame(page)); b = await box(shotFrame(page, 'scout'));
  expect(b.x).toBeGreaterThanOrEqual(a.x + a.w);
  expect(Math.abs(a.h - b.h)).toBeLessThanOrEqual(0.5);
});

// Line 10: the whole frame links to the demo; bar, placeholder and the green overlay; nothing requested while shot is unset.
test('screenshot frame: relative link, placeholder, green overlay, no request', async ({ page }) => {
  const asked = [];
  page.on('request', (r) => { if (/desktop\.png$/.test(r.url())) asked.push(r.url()); });
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/scout');
  for (const id of DEMOS) {
    await tab(page, id).click();
    const link = shotLink(page, id);
    await expect(link).toHaveAttribute('href', P[id].path + 'index.html');
    await expect(link).toContainText('portfolio/' + P[id].path + 'index.html');
    await expect(link).toContainText('[SCREENSHOT OF THE DEMO]');
    await expect(link).toContainText(P[id].path + 'screenshots/desktop.png');
    const body = link.getByText('[SCREENSHOT OF THE DEMO]', { exact: true }).locator('xpath=..');
    expect(await body.evaluate((el) => getComputedStyle(el).backgroundImage)).toMatch(/^repeating-linear-gradient/);
    const ov = link.getByText('OPEN THE DEMO ▸', { exact: true });
    await expect(ov.locator('xpath=..')).toHaveCSS('opacity', '0');
    await link.hover();
    await expect(ov.locator('xpath=..')).toHaveCSS('opacity', '1');
    await expect(ov).toHaveCSS('background-color', GREEN);
    await away(page);
    expect(await link.locator('img').filter({ visible: true }).count()).toBe(0);
  }
  expect(asked).toEqual([]);
  await tab(page, 'holy').click();
  const href = await shotLink(page, 'holy').evaluate((a) => a.href);
  expect(href).toMatch(/\/portfolio\/demos\/holy-cross\/index\.html$/); // resolves under /portfolio/
});

// Line 10: with shot set, the screenshot covers the body from the top; a missing file falls back; never a broken image.
test('screenshot shows when set, falls back when missing, never broken', async ({ page }) => {
  await page.addInitScript(() => {
    let v;
    Object.defineProperty(window, 'PORTFOLIO', { configurable: true, get: () => v, set: (x) => { Object.keys(x.projects).forEach((k) => { x.projects[k].shot = true; }); v = x; } });
  });
  const png = readFileSync('design/builders-map.png');
  await page.route('**/demos/holy-cross/screenshots/desktop.png', (r) => r.fulfill({ status: 200, contentType: 'image/png', body: png }));
  await page.route('**/demos/the-wire/screenshots/desktop.png', (r) => r.fulfill({ status: 404, body: 'Not found' }));
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/holy');
  const img = shotLink(page, 'holy').locator('img');
  await expect(img).toBeVisible();
  const r = await img.evaluate((el) => ({ ok: el.complete && el.naturalWidth > 0, src: el.getAttribute('src'), fit: getComputedStyle(el).objectFit, pos: getComputedStyle(el).objectPosition }));
  expect(r).toEqual({ ok: true, src: 'demos/holy-cross/screenshots/desktop.png', fit: 'cover', pos: '50% 0%' });
  const body = await box(shotLink(page, 'holy').getByText('[SCREENSHOT OF THE DEMO]', { exact: true }).locator('xpath=..'));
  const ib = await box(img);
  expect([ib.x, ib.y, ib.w, ib.h].map(Math.round)).toEqual([body.x, body.y, body.w, body.h].map(Math.round));
  const a = await box(drawFrame(page));
  const b = await box(shotFrame(page, 'holy'));
  expect(Math.abs(a.h - b.h)).toBeLessThanOrEqual(0.5);
  await shotLink(page, 'holy').hover();
  await expect(shotLink(page, 'holy').getByText('OPEN THE DEMO ▸', { exact: true }).locator('xpath=..')).toHaveCSS('opacity', '1'); // overlay above the picture
  await tab(page, 'wire').click();
  await expect(shotLink(page, 'wire').getByText('[SCREENSHOT OF THE DEMO]', { exact: true })).toBeVisible();
  await expect(shotLink(page, 'wire').locator('img')).toBeHidden();
  await page.waitForTimeout(300);
  const broken = await page.evaluate(() => [...document.images].filter((i) => i.offsetParent !== null && (!i.complete || i.naturalWidth === 0)).map((i) => i.getAttribute('src')));
  expect(broken).toEqual([]);
  await tab(page, 'holy').click();
  await expect(img).toBeVisible(); // back to the loaded picture
});

// Line 11: Optometry has no demo yet.
test('Optometry: not a link, DEMO COMING SOON disabled, orange badge', async ({ page }) => {
  const asked = [];
  page.on('request', (r) => { if (/desktop\.png$/.test(r.url())) asked.push(r.url()); });
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/optom');
  await expectProject(page, 'optom');
  const ph = proj(page).getByText('[SCREENSHOT · DEMO IN PROGRESS]', { exact: true });
  await expect(ph).toBeVisible();
  await expect(proj(page).getByText('demos/eye-care/screenshots/desktop.png', { exact: true }).filter({ visible: true })).toHaveCount(1);
  expect(await ph.evaluate((el) => el.closest('a'))).toBeNull();
  await expect(proj(page).getByRole('link', { name: /demo/i })).toHaveCount(0);
  await expect(proj(page).getByText('OPEN THE WORKING DEMO ▸').filter({ visible: true })).toHaveCount(0); // display: none, so not there for a reader either
  await expect(proj(page).getByText('[SCREENSHOT OF THE DEMO]').filter({ visible: true })).toHaveCount(0);
  const btn = proj(page).getByRole('button', { name: 'DEMO COMING SOON' });
  await expect(btn).toBeVisible();
  await expect(btn).toBeDisabled();
  const badge = proj(page).getByText(P.optom.status, { exact: true });
  await expect(badge).toHaveCSS('color', ORANGE);
  expect(await badge.evaluate((el) => getComputedStyle(el.querySelector('i')).animationName)).toBe('none');
  expect(asked).toEqual([]);
});

// Line 12: the badge, the demo button and the card rows for a working demo.
test('working demo: green badge, OPEN THE WORKING DEMO, DATA IN / OUT / RUNS ON', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/scout');
  for (const id of DEMOS) {
    await tab(page, id).click();
    const badge = proj(page).getByText(P[id].status, { exact: true });
    await expect(badge).toHaveCSS('color', GREEN);
    expect(await badge.evaluate((el) => getComputedStyle(el.querySelector('i')).backgroundColor)).toBe(GREEN);
    const open = proj(page).getByRole('link', { name: 'OPEN THE WORKING DEMO ▸' });
    await expect(open).toHaveCount(1);
    await expect(open).toHaveAttribute('href', P[id].path + 'index.html');
    await expect(open).toHaveCSS('background-color', GREEN);
    await expect(proj(page).getByRole('button', { name: 'DEMO COMING SOON' })).toBeHidden();
    await expectActive(page, id, 0);
  }
});

// Line 13: six drawings ported as drawn; data equal to the design's X and P; classes dg-.
test('six drawings ported as drawn, data from the design', async ({ page }) => {
  await page.goto('./#projects/scout');
  for (const id of ORDER) {
    expect(await pageSvgElements(page, id)).toEqual(designSvgElements(id));
    expect(await page.evaluate((k) => window.PORTFOLIO.drawings[k], id)).toEqual(X[id]);
    const pj = await page.evaluate((k) => window.PORTFOLIO.projects[k], id);
    expect(typeof pj.shot).toBe('boolean');
    delete pj.shot;
    expect(pj).toEqual(P[id]);
    const cls = await drawing(page, id).evaluate((svg) => [svg, ...svg.querySelectorAll('*')].flatMap((el) => [...el.classList]));
    expect(cls.filter((c) => c !== 'dg' && !c.startsWith('dg-'))).toEqual([]);
  }
  expect(await page.evaluate(() => window.PORTFOLIO.order)).toEqual(ORDER);
});

// Line 13: the shared engine runs every project drawing: hover, pin, unpin, leave.
for (const id of ORDER) {
  test(`engine runs the ${id} drawing`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await fresh(page, '#projects/' + id);
    const count = X[id].parts.length;
    expect(await parts(page, id).count()).toBe(count);
    await expectActive(page, id, 0);
    for (let n = 1; n <= count; n++) { // each was dimmed a moment ago
      await partNum(page, id, n).hover({ force: true });
      await expectActive(page, id, n);
    }
    await legend(page, id, 1).hover();
    await expectActive(page, id, 1);
    await partNum(page, id, 2).click({ force: true });
    await away(page);
    await expectActive(page, id, 2);
    await expect(legend(page, id, 2)).toHaveAttribute('aria-pressed', 'true');
    await legend(page, id, 2).click();
    await away(page);
    await expectActive(page, id, 0);
    await expect(legend(page, id, 2)).toHaveAttribute('aria-pressed', 'false');
  });
}

// Line 13: drawings stay independent of each other and of Home.
test('drawings stay independent', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/holy');
  await legend(page, 'holy', 2).click();
  await away(page);
  await expectActive(page, 'holy', 2);
  await tab(page, 'scout').click();
  await expectActive(page, 'scout', 0);
  await legend(page, 'scout', 4).click();
  await away(page);
  await expectActive(page, 'scout', 4);
  // Hover in one drawing never reaches another (review 1): read the hidden Holy Cross and Home parts while hovering Scout Team.
  await partNum(page, 'scout', 1).hover({ force: true });
  await expectActive(page, 'scout', 1);
  const others = await page.evaluate(([h]) => ({
    holy: [...document.querySelector(`svg[aria-label="${h}"]`).querySelectorAll(':scope > g')].map((g) => getComputedStyle(g).opacity),
    hero: [...document.querySelector('[data-page="home"] svg').querySelectorAll(':scope > g')].map((g) => getComputedStyle(g).opacity)
  }), [LABEL.holy]);
  expect(others).toEqual({ holy: ['0.3', '1', '0.3', '0.3', '0.3', '0.3'], hero: ['1', '1', '1', '1'] });
  await tab(page, 'holy').click();
  await expectActive(page, 'holy', 2); // its own pin, kept
  await page.locator('.topbar .fk', { hasText: 'F1' }).click();
  const heroPressed = await page.locator('[data-page="home"] button[aria-pressed]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-pressed')));
  expect(heroPressed).toEqual(['false', 'false', 'false', 'false']);
  const heroDim = await page.locator('[data-page="home"] svg').evaluate((svg) => [...svg.querySelectorAll(':scope > g')].map((g) => getComputedStyle(g).opacity));
  expect(heroDim).toEqual(['1', '1', '1', '1']);
});

// Line 14: the hash follows the selection; Back returns to the previous project.
test('the hash stays in step; back and forward move between projects', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/scout');
  await tab(page, 'holy').click();
  await expectProject(page, 'holy');
  await proj(page).getByRole('button', { name: 'Next project' }).click();
  await expectProject(page, 'wire');
  await page.goBack();
  await expectProject(page, 'holy');
  await page.goBack();
  await expectProject(page, 'scout');
  await page.goForward();
  await expectProject(page, 'holy');
  await fresh(page, '#projects/slate');
  await expectProject(page, 'slate');
});

// Line 15: GO reads START TOUR → CONTINUE → DONE ✓ and walks the unviewed projects, then How I work.
test('GO tour: next unviewed project, then How I work', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#home');
  await expect(tourKey(page)).toHaveText('GOSTART TOUR');
  for (const [i, id] of ORDER.entries()) {
    await tourKey(page).click();
    await expectProject(page, id);
    await expect(tourKey(page)).toHaveText(i < 5 ? 'GOCONTINUE' : 'GODONE ✓');
  }
  await tourKey(page).click();
  await expect(page).toHaveURL(/#how$/);
  await expect(page.locator('[data-page="how"]')).toBeVisible();
  await expect(tourKey(page)).toHaveText('GODONE ✓');
  await fresh(page, '#projects/wire');
  await expect(tourKey(page)).toHaveText('GOCONTINUE');
  await tourKey(page).click();
  await expectProject(page, 'scout'); // first unviewed in the order
  await tourKey(page).click();
  await expectProject(page, 'holy');
  await tourKey(page).click();
  await expectProject(page, 'slate'); // wire was already viewed
});

// Line 13: every project drawing animates on load and keeps running.
test('project drawings animate and keep running', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/scout');
  for (const id of ORDER) {
    await tab(page, id).click();
    const read = () => drawing(page, id).evaluate((svg) => svg.getAnimations({ subtree: true }).map((a) => [a.animationName, a.playState, a.effect.getTiming().iterations, a.currentTime]));
    const a = await read();
    expect(a.length).toBeGreaterThan(0);
    expect(a.every((x) => x[1] === 'running' && x[2] === Infinity)).toBe(true);
    await page.waitForTimeout(300);
    const b = await read();
    expect(b.every((x, i) => x[1] === 'running' && x[3] > a[i][3])).toBe(true);
  }
});

// Line 16: reduced motion — nothing on Projects animates and every element of every drawing is visible.
test('reduced motion: Projects is still and every drawing element is visible', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  await page.goto('./#projects/scout');
  for (const id of ORDER) {
    await tab(page, id).click();
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    const hiddenEls = await drawing(page, id).evaluate((svg) => [...svg.querySelectorAll('*')].filter((el) => { const s = getComputedStyle(el); return +s.opacity === 0 || s.visibility === 'hidden' || s.display === 'none'; }).map((el) => el.outerHTML.slice(0, 60)));
    expect(hiddenEls).toEqual([]);
    await expectActive(page, id, 0);
  }
  await page.close();
});

// Line 17: no sideways scroll, every button and tab at least 44 px.
for (const w of [390, 768, 1280]) {
  test(`Projects fits at ${w}px with 44px targets`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await fresh(page, '#projects/scout');
    for (const id of ORDER) {
      await tab(page, id).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const small = await proj(page).locator('button, a, [role="tab"]').filter({ visible: true }).evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height < 44).map((e) => e.textContent));
      expect(small).toEqual([]);
      const fits = await drawFrame(page).evaluate((el) => el.getBoundingClientRect().right <= innerWidth);
      expect(fits).toBe(true);
    }
  });
}

// Line 17: zero console errors after using every control on Projects.
test('zero console errors while using Projects', async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await fresh(page, '#projects/scout');
  for (const id of ORDER) {
    await tab(page, id).click();
    for (let n = 1; n <= X[id].parts.length; n++) { await partNum(page, id, n).hover({ force: true }); await legend(page, id, n).hover(); await legend(page, id, n).click(); }
    await away(page);
    if (id !== 'optom') await shotLink(page, id).hover();
  }
  await proj(page).getByRole('button', { name: 'Previous project' }).click();
  await proj(page).getByRole('button', { name: 'Next project' }).click();
  await prevBtn(page).click();
  await nextBtn(page).click();
  await tab(page, 'holy').click();
  await tab(page, 'holy').focus();
  await page.keyboard.press('ArrowRight');
  await tourKey(page).click(); // all six viewed: How I work
  await expect(page).toHaveURL(/#how$/);
  expect(errors).toEqual([]);
});
