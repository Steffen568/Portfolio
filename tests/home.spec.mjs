// Unit 02 — Drawing engine + Home. Each test names the spec line it guards (specs/02-home.md).
// Elements are found by the design's own text and aria-label, not by the classes under test.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const DESIGN = readFileSync('design/portfolio-design.dc.html', 'utf8');
const HERO_LABEL = 'Four layers: three pages, six working demos, the method behind them, and plain-file hosting.';
const PARTS = ['3 PAGES', 'SIX WORKING DEMOS', 'HOW I WORK', 'HOSTING'];
const AMBER = 'rgb(255, 160, 40)';
const CARTS = [['SCTM', 'scout'], ['HCRS', 'holy'], ['WIRE', 'wire'], ['SLTH', 'slate'], ['OPTO', 'optom'], ['SDFS', 'dfs']];

// The design's X.hero, evaluated straight from its data() so the test can't drift from the design.
function designHero() {
  const a = DESIGN.indexOf('hero: { over:');
  const b = DESIGN.indexOf('cm: { lab:', a);
  const src = DESIGN.slice(a, b).trim().replace(/,$/, '');
  const p = (name, does, inp, out, runs) => ({ name, does, inp: inp || '—', out: out || '—', runs: runs || '—' });
  return new Function('p', 'return {' + src + '}')(p).hero;
}
const HERO = designHero();

// The design's hero <svg> as a flat list of elements: tag, attributes (minus bindings), classes, text.
function designSvgElements() {
  const start = DESIGN.indexOf('<svg class="dg" viewBox="0 0 800 460" role="img" aria-label="' + HERO_LABEL);
  const src = DESIGN.slice(start, DESIGN.indexOf('</svg>', start));
  const out = [];
  for (const m of src.matchAll(/<(\w+)([^>]*)>([^<]*)/g)) {
    const attrs = {};
    let cls = [];
    for (const a of m[2].matchAll(/([\w:-]+)="([^"]*)"/g)) {
      if (/^on/i.test(a[1])) continue;
      if (a[1] === 'class') cls = a[2].split(/\s+/).map((c) => (/^\{\{K\.hero\d\}\}$/.test(c) ? 'dg-pt' : c === 'dg' ? 'dg' : 'dg-' + c));
      else attrs[a[1]] = a[2];
    }
    if (m[1] === 'text' && m[3] === 'HOSTING') attrs.x = '558'; // spec 05 D6 (Steffen, 2026-11-02): moved 18 units off "FREE HOSTING"
    out.push({ tag: m[1], attrs, cls: cls.sort(), text: m[1] === 'text' ? m[3] : '' });
  }
  return out;
}
// Spec 05 D2 (Steffen, 2026-11-02): each cartridge carries an invisible tap area, .dg-hit, not part of the drawing.
const pageSvgElements = (page) => drawing(page).evaluate((svg) => [svg, ...svg.querySelectorAll('*:not(.dg-hit)')].map((el) => {
  const attrs = {};
  for (const a of el.attributes) if (a.name !== 'class' && !a.name.startsWith('data-') && !/^on/i.test(a.name)) attrs[a.name] = a.value;
  const cls = [...el.classList].filter((c) => c !== 'dg-on' && c !== 'dg-dim').sort();
  return { tag: el.localName, attrs, cls, text: el.localName === 'text' ? el.textContent : '' };
}));

function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}
const drawing = (page) => page.locator(`svg[aria-label="${HERO_LABEL}"]`);
const label = (page, name) => drawing(page).locator('text', { hasText: new RegExp('^' + name + '$') });
const part = (page, n) => label(page, PARTS[n - 1]).locator('xpath=..'); // a part is the group holding its label
const legend = (page, n) => page.locator('[data-page="home"] button', { hasText: new RegExp('^' + n + PARTS[n - 1] + '$') });
const card = (page) => page.locator('[data-page="home"] .det');
const away = (page) => page.getByText('I build the framework the AI works inside.').hover();

// n = 0: overview, nothing dimmed. n = 1..4: that part amber, the rest at 30 %, the card shows it.
async function expectActive(page, n) {
  for (let i = 1; i <= 4; i++) {
    await expect(part(page, i)).toHaveCSS('opacity', n === 0 || n === i ? '1' : '0.3');
    const num = part(page, i).locator('text', { hasText: new RegExp('^' + i + '$') }).locator('xpath=..').locator('circle'); // the numbered circle (review 1)
    if (n === i) { await expect(label(page, PARTS[i - 1])).toHaveCSS('fill', AMBER); await expect(num).toHaveCSS('fill', AMBER); }
    else { await expect(label(page, PARTS[i - 1])).not.toHaveCSS('fill', AMBER); await expect(num).not.toHaveCSS('fill', AMBER); }
    if (n === i) await expect(legend(page, i)).toHaveCSS('color', AMBER); // the active legend button is amber, hovered or pinned (review 3)
    else await expect(legend(page, i)).not.toHaveCSS('color', AMBER);
  }
  const c = n ? HERO.parts[n - 1] : HERO.over;
  await expect(card(page).locator('h4')).toHaveText((n ? String(n) : '·') + c.name);
  await expect(card(page).locator('p')).toHaveText(c.does);
  await expect(card(page).locator('.io')).toHaveText('TAKES IN' + c.inp + 'GIVES OUT' + c.out + 'RUNS ON' + c.runs);
}
const pinned = (page) => Promise.all([1, 2, 3, 4].map((n) => legend(page, n).getAttribute('aria-pressed')));

// Line 1: every Home string is the design's.
test('Home copy is ported exactly from the design', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./#home');
  const home = page.locator('[data-page="home"]');
  const name = home.locator('.vt');
  await expect(name).toHaveText('STEFFEN[LAST NAME]');
  expect(await name.innerText()).toBe('STEFFEN\n[LAST NAME]');
  expect(DESIGN).toContain('>STEFFEN<br>[LAST NAME]</div>');
  expect(await name.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/^"?VT323/);
  const strings = ['I build the framework the AI works inside.', 'SEE THE 6 PROJECTS ▸'];
  for (const s of strings) { expect(DESIGN).toContain(s); await expect(home.getByText(s, { exact: true })).toBeVisible(); }
  const bio = DESIGN.match(/<p style="margin: 0; font-size: 12.5px; line-height: 1.6; color: #b3a892">([^<]+)<\/p>/)[1];
  await expect(home.getByText(bio, { exact: true })).toBeVisible();
  await expect(home.locator('button', { hasText: /^HOW I WORK$/ })).toBeVisible();
  const rows = [['BASED', 'Temple, TX'], ['BUILDS', 'Websites · data tools'], ['DEMOS', '6 · real data, frozen']];
  for (const [k, v] of rows) expect(DESIGN).toContain(`<span>${k}</span><b>${v}</b>`);
  await expect(home.locator('.kv > div')).toHaveText(rows.map(([k, v]) => k + v));
  await expect(home.locator('button', { hasText: /^\d/ })).toHaveText(PARTS.map((p, i) => i + 1 + p));
  await expectActive(page, 0);
});

// Line 2: the drawing is the design's, element for element, and its data is the design's data().
test('hero drawing is ported as drawn, data from the design', async ({ page }) => {
  await page.goto('./#home');
  expect(await pageSvgElements(page)).toEqual(designSvgElements());
  expect(await page.evaluate(() => window.PORTFOLIO.drawings.hero)).toEqual(HERO);
});

// Line 3 + 4: overview on load; hover lights a part, dims the rest; a dimmed part lights when hovered.
test('hover lights a part, dims the rest, and a dimmed part lights', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./#home');
  await expectActive(page, 0);
  await label(page, '3 PAGES').hover();
  await expectActive(page, 1);
  for (const n of [4, 2, 3, 1]) { // each was dimmed a moment ago
    await label(page, PARTS[n - 1]).hover();
    await expectActive(page, n);
  }
  await legend(page, 2).hover(); // the legend is a second way to hover
  await expectActive(page, 2);
  await away(page);
  await expectActive(page, 0);
});

// Line 5 + 6: click pins, click again unpins; leaving returns to the pin or the overview.
test('click pins, click again unpins, leaving returns to the pin', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./#home');
  await label(page, 'HOW I WORK').click();
  await away(page);
  await expectActive(page, 3);
  expect(await pinned(page)).toEqual(['false', 'false', 'true', 'false']);
  await label(page, 'HOSTING').hover(); // hover beats the pin while it lasts
  await expectActive(page, 4);
  await away(page);
  await expectActive(page, 3);
  await label(page, 'HOW I WORK').click();
  await away(page);
  await expectActive(page, 0);
  expect(await pinned(page)).toEqual(['false', 'false', 'false', 'false']);
  await legend(page, 4).click(); // legend pins too
  await away(page);
  await expectActive(page, 4);
  await legend(page, 1).click(); // pin moves
  await away(page);
  await expectActive(page, 1);
  expect(await pinned(page)).toEqual(['true', 'false', 'false', 'false']);
});

// Line 5: on a touch screen, a tap is the hover and pins; a second tap unpins.
test('tap pins, tap again unpins (touch phone)', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto('./#home');
  await label(page, '3 PAGES').tap();
  await expectActive(page, 1);
  await label(page, 'HOSTING').tap(); // a dimmed part lights on tap
  await expectActive(page, 4);
  expect(await pinned(page)).toEqual(['false', 'false', 'false', 'true']);
  await label(page, 'HOSTING').tap();
  await expectActive(page, 0);
  await ctx.close();
});

// Line 7: legend buttons are real buttons, keyboard-operable, 44 px, amber when active, ringed when pinned.
test('legend buttons: keyboard, 44px, amber active, ring when pinned', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./#home');
  const ring = (n) => legend(page, n).locator('i').evaluate((el) => getComputedStyle(el).boxShadow);
  for (let n = 1; n <= 4; n++) {
    expect(await legend(page, n).evaluate((el) => el.localName)).toBe('button');
    expect(await ring(n)).toBe('none');
  }
  await page.locator('.topbar .fk', { hasText: 'GO' }).focus();
  let reached = false;
  for (let k = 0; k < 30 && !reached; k++) {
    await page.keyboard.press('Tab');
    reached = await legend(page, 2).evaluate((el) => el === document.activeElement);
  }
  expect(reached).toBe(true);
  await page.keyboard.press('Enter');
  await expect(legend(page, 2)).toHaveAttribute('aria-pressed', 'true');
  expect(await ring(2)).toContain(AMBER);
  await expect(legend(page, 2)).toHaveCSS('border-color', AMBER);
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Space');
  await expect(legend(page, 1)).toHaveAttribute('aria-pressed', 'true');
  await expect(legend(page, 2)).toHaveAttribute('aria-pressed', 'false');
  expect(await ring(2)).toBe('none');
  await away(page);
  await expectActive(page, 1);
});

// Line 8: each cartridge opens its project, without pinning part 2 on the way.
for (const [tkr, id] of CARTS) {
  test(`cartridge ${tkr} opens #projects/${id}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('./#home');
    await page.reload();
    // The page's reveal (.pg, a 0.35 s clip) swallows clicks until it ends; force skips that wait, so wait here.
    await page.locator('[data-page="home"]').evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    await drawing(page).locator('text', { hasText: new RegExp('^' + tkr + '$') }).click({ force: true }); // cartridges float forever, so never "stable"
    await expect(page).toHaveURL(new RegExp('#projects/' + id + '$'));
    await expect(page.locator('[data-page="projects"]')).toBeVisible();
    await expect(page.locator('[data-page="home"]')).toBeHidden();
    await page.goBack();
    await expect(page.locator('[data-page="home"]')).toBeVisible();
    expect(await pinned(page)).toEqual(['false', 'false', 'false', 'false']);
    await away(page);
    await expectActive(page, 0);
  });
}

// Line 9: the two buttons route.
test('SEE THE 6 PROJECTS and HOW I WORK route', async ({ page }) => {
  await page.goto('./#home');
  await page.reload();
  const home = page.locator('[data-page="home"]');
  await home.getByRole('button', { name: 'SEE THE 6 PROJECTS ▸' }).click();
  await expect(page).toHaveURL(/#projects\/scout$/);
  await expect(page.locator('[data-page="projects"]')).toBeVisible();
  await page.goto('./#projects/wire');
  await page.locator('.topbar .fk', { hasText: 'F1' }).click();
  await home.getByRole('button', { name: 'SEE THE 6 PROJECTS ▸' }).click();
  await expect(page).toHaveURL(/#projects\/wire$/); // the current project, as in the design
  await page.locator('.topbar .fk', { hasText: 'F1' }).click();
  await home.locator('button', { hasText: /^HOW I WORK$/ }).click();
  await expect(page).toHaveURL(/#how$/);
  await expect(page.locator('[data-page="how"]')).toBeVisible();
  await expect(home).toBeHidden();
});

// Line 10: animations play on load and keep running.
test('drawing animations play and keep running', async ({ page }) => {
  await page.goto('./#home');
  const read = () => drawing(page).evaluate((svg) => svg.getAnimations({ subtree: true }).map((a) => [a.animationName, a.playState, a.effect.getTiming().iterations, a.currentTime]));
  const a = await read();
  const names = a.map((x) => x[0]);
  expect(names.filter((n) => n === 'lf')).toHaveLength(6); // six floating cartridges
  expect(names.filter((n) => n === 'sq')).toHaveLength(6); // three page lines + three hosting arrows step
  expect(names).toContain('orb'); // the loop ring turns
  expect(a.every((x) => x[1] === 'running' && x[2] === Infinity)).toBe(true);
  await page.waitForTimeout(1000);
  const b = await read();
  expect(b.length).toBe(a.length);
  expect(b.every((x, i) => x[1] === 'running' && x[3] > a[i][3])).toBe(true);
});

// Line 11: reduced motion — nothing animates, every part fully visible.
test('reduced motion: still, and every part visible', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.goto('./#home');
  expect(await drawing(page).evaluate((svg) => svg.getAnimations({ subtree: true }).length)).toBe(0);
  for (let n = 1; n <= 4; n++) {
    await expect(part(page, n)).toBeVisible();
    await expect(part(page, n)).toHaveCSS('opacity', '1');
  }
  // Nothing inside the drawing is left invisible (an element only an animation would reveal) (review 2).
  const hiddenEls = await drawing(page).evaluate((svg) => [...svg.querySelectorAll('*')].filter((el) => { const s = getComputedStyle(el); return +s.opacity === 0 || s.visibility === 'hidden' || s.display === 'none'; }).map((el) => el.outerHTML.slice(0, 60)));
  expect(hiddenEls).toEqual([]);
  await expectActive(page, 0);
  await page.close();
});

// Line 12: every class in the drawing and every engine state class is namespaced dg-.
test('drawing and engine classes are namespaced dg-', async ({ page }) => {
  await page.goto('./#home');
  await label(page, '3 PAGES').click();
  await label(page, 'HOSTING').hover();
  const svgCls = await drawing(page).evaluate((svg) => [svg, ...svg.querySelectorAll('*')].flatMap((el) => [...el.classList]));
  expect(svgCls.filter((c) => c !== 'dg' && !c.startsWith('dg-'))).toEqual([]);
  expect(svgCls).toContain('dg-on');
  expect(svgCls).toContain('dg-dim');
  const lgCls = await page.locator('[data-page="home"] button', { hasText: /^\d/ }).evaluateAll((els) => els.flatMap((el) => [...el.classList]));
  expect(lgCls.filter((c) => c !== 'lgb' && !c.startsWith('dg-'))).toEqual([]);
  expect(lgCls).toContain('dg-pin');
});

// Line 13: no sideways scroll, legend and buttons at least 44 px, drawing fits its column.
for (const w of [390, 768, 1280]) {
  test(`Home fits at ${w}px with 44px targets`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('./#home');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const small = await page.locator('[data-page="home"] button').evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height < 44).map((e) => e.textContent));
    expect(small).toEqual([]);
    // Spec 05 D2 (Steffen, 2026-11-02): below 641 px the drawing is wider than the screen and scrolls inside its own box.
    const fits = await drawing(page).evaluate((svg) => { const r = svg.getBoundingClientRect(); const p = svg.parentElement.getBoundingClientRect(); const box = p.right <= innerWidth && (r.right <= p.right + 0.5 || getComputedStyle(svg.parentElement).overflowX === 'auto'); return r.width > 0 && box && (innerWidth <= 640 || r.right <= innerWidth); });
    expect(fits).toBe(true);
    // Below 1000 px the text column sits under the drawing; above, beside it (review 1).
    const cols = await page.evaluate(([label]) => {
      const left = document.querySelector(`svg[aria-label="${label}"]`).parentElement.getBoundingClientRect();
      const right = [...document.querySelectorAll('[data-page="home"] div')].find((d) => d.textContent === 'I build the framework the AI works inside.').parentElement.getBoundingClientRect();
      return { below: right.top >= left.bottom - 0.5, beside: right.left >= left.right - 0.5 };
    }, [HERO_LABEL]);
    expect(cols).toEqual(w < 1000 ? { below: true, beside: false } : { below: false, beside: true });
  });
}

// Line 13: zero console errors after using everything on Home.
test('zero console errors while using Home', async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./#home');
  for (const n of [1, 2, 3, 4]) { await label(page, PARTS[n - 1]).hover(); await legend(page, n).hover(); await legend(page, n).click(); }
  await label(page, '3 PAGES').click();
  await away(page);
  await page.locator('[data-page="home"]').getByRole('button', { name: 'SEE THE 6 PROJECTS ▸' }).click();
  await page.goBack();
  await drawing(page).locator('text', { hasText: /^OPTO$/ }).click({ force: true });
  expect(errors).toEqual([]);
});
