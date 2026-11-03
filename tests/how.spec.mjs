// Unit 04 — How I work. Each test names the spec line it guards (specs/04-how.md).
// Elements are found by the design's own text, roles and aria-labels, not by the classes under test.
// Timed sequences are checked by pausing the page's animations at set times, never by waiting on a clock.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const DESIGN = readFileSync('design/portfolio-design.dc.html', 'utf8');
const AMBER = 'rgb(255, 160, 40)';
const GREEN = 'rgb(124, 196, 106)';
const RED = 'rgb(229, 83, 75)';
const FEATURES = ['HOME', 'YOUR REAL COST', 'ADMISSIONS', 'CONTACT'];
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

// The design's X, evaluated straight from its data() so the test can't drift from the design.
function designData() {
  const src = DESIGN.slice(DESIGN.indexOf('const X = {'), DESIGN.indexOf('const P = {'));
  const p = (name, does, inp, out, runs) => ({ name, does, inp: inp || '—', out: out || '—', runs: runs || '—' });
  return new Function('p', src + '; return X;')(p);
}
const CM = designData().cm;

// The design's How I work markup (page + window), and every visible string in it.
const HOW_SRC = DESIGN.slice(DESIGN.indexOf('<sc-if value="{{PG.how}}"'), DESIGN.indexOf('<footer'));
const WIN_SRC = DESIGN.slice(DESIGN.indexOf('<div class="{{dimCls}}"'), DESIGN.indexOf('<script type="text/x-dc"'));
const textsOf = (src) => [...src.matchAll(/>([^<>]+)</g)].map((m) => decode(m[1]).trim()).filter((t) => t && !t.includes('{{'));
const CM_SRC = HOW_SRC.slice(HOW_SRC.indexOf('<svg class="dg"'), HOW_SRC.indexOf('</svg>', HOW_SRC.indexOf('<svg class="dg"')));
const CM_LABEL = CM_SRC.match(/aria-label="([^"]*)"/)[1];
const PARA = decode(HOW_SRC.match(/A CUSTOM FRAMEWORK<\/div><p>([^<]*)<\/p>/)[1]);
const NOTE = decode(HOW_SRC.match(/<div class="hw-note"><p>([^<]*)<\/p>/)[1]);
const ALT_MAP = WIN_SRC.match(/alt="(The Builder[^"]*)"/)[1];
const ALT_CM = WIN_SRC.match(/alt="(The CLAUDE[^"]*)"/)[1];

// The design's CLAUDE.md drawing as a flat list of elements: tag, attributes (minus bindings), classes (renamed dg-), text.
function designSvgElements() {
  const out = [];
  for (const m of CM_SRC.matchAll(/<(\w+)([^>]*)>([^<]*)/g)) {
    const attrs = {};
    let cls = [];
    for (const a of m[2].matchAll(/([\w:-]+)="([^"]*)"/g)) {
      if (/^on/i.test(a[1])) continue;
      if (a[1] === 'class') cls = a[2].split(/\s+/).map((c) => (/^\{\{K\.cm\d\}\}$/.test(c) ? 'dg-pt' : c === 'dg' ? 'dg' : 'dg-' + c));
      else attrs[a[1]] = a[2];
    }
    out.push({ tag: m[1], attrs, cls: cls.sort(), text: m[1] === 'text' ? decode(m[3]) : '' });
  }
  return out;
}

function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}
const how = (page) => page.locator('[data-page="how"]');
const drawing = (page) => page.locator(`svg[aria-label="${CM_LABEL}"]`);
const parts = (page) => drawing(page).locator('xpath=./*[local-name()="g"]');
const legend = (page, n) => how(page).locator('button', { hasText: new RegExp('^' + n + CM.parts[n - 1].name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') });
const card = (page) => page.locator('[data-dg-card="cm"]');
const pauseBtn = (page) => how(page).getByRole('button', { name: 'Pause or play the loop animation' });
const loopFrame = (page) => how(page).getByText('THE LOOP · ONCE PER PAGE', { exact: true }).locator('xpath=../..');
const cmFrame = (page) => how(page).getByText('CLAUDE.md · TAKEN APART', { exact: true }).locator('xpath=../..');
const loopBody = (page) => loopFrame(page).locator('xpath=./*[2]');
const mapBox = (page) => how(page).getByText('1 · FINISH LINE', { exact: true }).locator('xpath=../..');
const dialog = (page) => page.getByRole('dialog');
const box = (loc) => loc.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
const noSideScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
const settle = (page) => page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.animationName === 'pg').map((a) => a.finished)));
const fresh = async (page, hash = '#how') => { await page.goto('./' + hash); await page.reload(); await settle(page); };
const away = (page) => how(page).getByText('A CUSTOM FRAMEWORK', { exact: true }).hover();

// Pause every animation under root (a selector-free handle) at t ms. Returns the names and timings it saw.
const freezeAt = (loc, t) => loc.evaluate((root, t) => root.getAnimations({ subtree: true }).map((a) => {
  a.pause();
  a.currentTime = t;
  const tm = a.effect.getTiming();
  return { name: a.animationName, duration: tm.duration, iterations: tm.iterations, delay: tm.delay };
}), t);

// The loop at its current frame: which caption and pop-ups show, where the token is, each step's border.
const loopState = (page) => loopBody(page).evaluate((body) => {
  const r0 = body.getBoundingClientRect();
  const own = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  const all = [...body.querySelectorAll('*')];
  const caps = all.filter((el) => el.children.length === 2 && el.children[0].localName === 'b' && el.children[1].localName === 'span' && el.parentElement.children.length === 8);
  const shown = caps.filter((el) => +getComputedStyle(el).opacity > 0.5).map((el) => el.children[0].textContent);
  const pops = all.filter((el) => /^[✗✓] /.test(own(el))).filter((el) => +getComputedStyle(el).opacity > 0.5).map(own);
  const tok = all.find((el) => getComputedStyle(el, '::after').content === '"PAGE"');
  const tr = tok.getBoundingClientRect();
  const steps = {};
  all.filter((el) => el.localName === 'b' && el.parentElement.parentElement === body.firstElementChild).forEach((b) => { steps[own(b)] = getComputedStyle(b.parentElement).borderTopColor; });
  const ret = body.querySelector('svg path:nth-of-type(3)');
  // Spec 05 D4: the token rides on the top edge of the stop it waits at. When it does, report that stop's place
  // (its centre, as the design's keyframes name it); anywhere else, the token's own centre.
  const cx = tr.left + tr.width / 2, cy = tr.top + tr.height / 2;
  const stop = [...body.firstElementChild.children].filter((el) => el.querySelector('b')).map((el) => el.getBoundingClientRect())
    .find((q) => Math.abs(cx - (q.left + q.width / 2)) <= 1.5 && Math.abs(cy - q.top) <= 1.5);
  const at = stop ? { x: stop.left + stop.width / 2, y: stop.top + stop.height / 2 } : { x: cx, y: cy };
  return {
    caps: shown, pops,
    tok: { left: Math.round(((at.x - r0.left) / r0.width) * 100), top: Math.round(((at.y - r0.top) / r0.height) * 100) },
    steps, ret: +getComputedStyle(ret).opacity
  };
});

// The phase map at its current frame, found by its own text.
const mapState = (page) => mapBox(page).evaluate((map, FEATURES) => {
  const own = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  const op = (el) => { let o = 1; for (let e = el; e && e !== map.parentElement; e = e.parentElement) o *= +getComputedStyle(e).opacity; return Math.round(o * 100) / 100; };
  const ctr = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  const all = [...map.querySelectorAll('*')];
  const find = (t) => all.find((el) => own(el) === t);
  const rows = {}, chips = {}, slots = {}, counters = {};
  all.forEach((el) => {
    const t = own(el);
    if (FEATURES.includes(t) && el.children.length === 1) rows[t] = { op: op(el), tick: op(el.children[0]) };
    if (FEATURES.includes(t) && el.children.length === 0) chips[t] = { op: op(el), ...ctr(el) };
    if (/^✓ /.test(t) && FEATURES.includes(t.slice(2))) slots[t.slice(2)] = op(el);
    if (/^FEATURE \d OF 4$/.test(t)) counters[t] = op(el);
  });
  const stepBox = (t) => find(t).parentElement;
  const steps = {};
  ['3 · SPEC', '4 · DESIGN', '5 · BUILD', '6 · VERIFY', '7 · STATUS'].forEach((t) => { steps[t] = { ...ctr(stepBox(t)), border: getComputedStyle(stepBox(t)).borderTopColor }; });
  const sentence = all.find((el) => own(el).startsWith('“A parent'));
  const gate = find('GATE').previousElementSibling;
  return {
    clip: getComputedStyle(sentence).clipPath, rows, chips, slots, counters, steps,
    frozen: op(find('STUDENT LIFE · FROZEN')),
    passed: op(find('✓ PASSED')), live: op(find('● LIVE')), banner: op(find('↺ NEXT PHASE STARTS WITH A NEW SENTENCE')),
    gate: getComputedStyle(gate).backgroundColor,
    prove: getComputedStyle(find('PROVE IT').parentElement).borderTopColor,
    ship: getComputedStyle(find('SHIP').parentElement).borderTopColor
  };
}, FEATURES);

// Line 1 (+ 9, 10): every string from the design's How I work markup is on the page; the header and the two text blocks exactly.
test('How I work shows the design copy', async ({ page }) => {
  await fresh(page);
  await expect(how(page).locator('.ph b').first()).toHaveText('03 · HOW I WORK<GO>');
  await expect(pauseBtn(page)).toHaveText('❚❚ PAUSE');
  const head = how(page).getByText('A CUSTOM FRAMEWORK', { exact: true });
  await expect(head).toBeVisible();
  expect(await head.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/^"?VT323/);
  await expect(how(page).getByText(PARA, { exact: true })).toBeVisible();
  await expect(how(page).getByText(NOTE, { exact: true })).toBeVisible();
  await expect(how(page).getByText("THE BUILDER'S MAP · ONE PHASE: A SENTENCE, CUT INTO FEATURES, EACH BUILT IN A LOOP", { exact: true })).toBeVisible();
  const text = await how(page).evaluate((el) => el.textContent);
  for (const t of [...textsOf(HOW_SRC), ...textsOf(WIN_SRC)]) expect(text, t).toContain(t);
  expect(text).not.toMatch(/this site/i);
});

// Line 2: the loop and the CLAUDE.md drawing are exactly the same size at 1280 and 768: 30 px bar + 800:460 body.
for (const [w, side] of [[1280, true], [768, false]]) {
  test(`loop and CLAUDE.md frames are the same size at ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await fresh(page);
    const a = await box(loopFrame(page));
    const b = await box(cmFrame(page));
    expect(Math.abs(a.w - b.w)).toBeLessThan(0.5);
    expect(Math.abs(a.h - b.h)).toBeLessThan(0.5);
    for (const f of [loopFrame(page), cmFrame(page)]) {
      const bar = await box(f.locator('xpath=./*[1]'));
      const body = await box(f.locator('xpath=./*[2]'));
      expect(Math.round(bar.h)).toBe(30);
      expect(Math.abs(body.h - (body.w * 460) / 800)).toBeLessThan(0.5);
    }
    if (side) { expect(Math.abs(a.y - b.y)).toBeLessThan(1); expect(b.x).toBeGreaterThan(a.x + a.w); }
    else expect(b.y).toBeGreaterThan(a.y + a.h);
  });
}

// Line 3: at 390 the graphics stack; every loop text is ≥ 9 px and inside its box; no two loop boxes overlap;
// the CLAUDE.md drawing never renders a label below 9 px and scrolls in its own box; the page doesn't scroll sideways.
test('at 390 the loop and CLAUDE.md stack and every label is readable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await fresh(page);
  const a = await box(loopFrame(page));
  const b = await box(cmFrame(page));
  expect(b.y).toBeGreaterThan(a.y + a.h);
  const loop = await loopBody(page).evaluate((body) => {
    const r0 = body.getBoundingClientRect();
    const bad = [];
    for (const el of body.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (el.closest('svg') || cs.display === 'none' || el.getClientRects().length === 0) continue;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      const after = getComputedStyle(el, '::after').content;
      if (!hasText && after === 'none') continue;
      if (parseFloat(cs.fontSize) < 9) bad.push('small: ' + el.textContent);
      if (after !== 'none' && parseFloat(getComputedStyle(el, '::after').fontSize) < 9) bad.push('small token label');
      const r = el.getBoundingClientRect();
      if (r.left < r0.left - 0.5 || r.right > r0.right + 0.5 || r.top < r0.top - 0.5 || r.bottom > r0.bottom + 0.5) bad.push('outside: ' + el.textContent);
      if (hasText && (el.scrollWidth > el.clientWidth + 1) && cs.overflow !== 'visible') bad.push('clipped: ' + el.textContent);
    }
    const steps = [...body.querySelectorAll('b')].map((x) => x.parentElement).filter((p) => p.parentElement === body.firstElementChild);
    for (const s of steps) for (const c of s.querySelectorAll('b')) if (c.scrollWidth > s.clientWidth + 1) bad.push('wider than its box: ' + c.textContent);
    for (let i = 0; i < steps.length; i++) for (let j = i + 1; j < steps.length; j++) {
      const p = steps[i].getBoundingClientRect(), q = steps[j].getBoundingClientRect();
      if (p.left < q.right && q.left < p.right && p.top < q.bottom && q.top < p.bottom) bad.push('overlap: ' + steps[i].textContent + ' / ' + steps[j].textContent);
    }
    return { bad, steps: steps.length };
  });
  expect(loop.steps).toBe(7);
  expect(loop.bad).toEqual([]);
  const cm = await drawing(page).evaluate((svg) => {
    const k = svg.getBoundingClientRect().width / 800;
    const sizes = [...svg.querySelectorAll('text')].map((t) => parseFloat(getComputedStyle(t).fontSize) * k);
    const sc = svg.parentElement;
    return { min: Math.min(...sizes), scrolls: sc.scrollWidth > sc.clientWidth, ox: getComputedStyle(sc).overflowX };
  });
  expect(cm.min).toBeGreaterThanOrEqual(8.99);
  expect(cm.scrolls).toBe(true);
  expect(['auto', 'scroll']).toContain(cm.ox);
  expect(await noSideScroll(page)).toBe(true);
});

// Line 4: the loop is 16 s, infinite, on the design's keyframes; at set times the right caption, pop-up, token and step show.
test('the loop runs its 16 s sequence', async ({ page }) => {
  await fresh(page);
  const anims = await freezeAt(loopBody(page), 0);
  expect(anims.filter((a) => a.name === 'tflow').map((a) => a.duration)).toEqual([1000]);
  const timed = anims.filter((a) => a.name !== 'tflow');
  expect(new Set(timed.map((a) => a.name))).toEqual(new Set(['tok', 'nPlan', 'nGuard', 'nBuild', 'nCheck', 'nRev', 'nDone', 'nNext', 'pG', 'pF', 'pP', 'pR', 'pD', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'fA']));
  for (const a of timed) { expect(a.duration, a.name).toBe(16000); expect(a.iterations, a.name).toBe(Infinity); }
  const at = async (s) => { await freezeAt(loopBody(page), s * 1000); return loopState(page); };
  let st = await at(1);
  expect(st.caps).toEqual(['PLAN']); expect(st.pops).toEqual([]); expect(st.tok).toEqual({ left: 14, top: 24 });
  expect(st.steps['01 PLAN']).toBe(AMBER);
  st = await at(3.5);
  expect(st.caps).toEqual(['GUARD · AUTOMATIC']); expect(st.pops).toEqual(['✗ BLOCKED']); expect(st.tok).toEqual({ left: 32, top: 24 });
  expect(st.steps['GUARD']).toBe(RED);
  st = await at(5.5);
  expect(st.caps).toEqual(['BUILD']); expect(st.tok).toEqual({ left: 50, top: 24 }); expect(st.steps['02 BUILD']).toBe(AMBER);
  st = await at(7.5);
  expect(st.caps).toEqual(['CHECK · AUTOMATIC']); expect(st.pops).toEqual(['✗ 2 OF 14 FAILED']); expect(st.tok).toEqual({ left: 86, top: 24 });
  expect(st.steps['03 CHECK']).toBe(RED);
  st = await at(8.5);
  expect(st.ret).toBe(1); // the red line back to Build
  st = await at(9);
  expect(st.tok).toEqual({ left: 50, top: 24 }); expect(st.steps['02 BUILD']).toBe(AMBER);
  st = await at(10.5);
  expect(st.caps).toEqual(['FIXED']); expect(st.pops).toEqual(['✓ 14 OF 14 PASS']); expect(st.tok).toEqual({ left: 86, top: 24 });
  expect(st.steps['03 CHECK']).toBe(GREEN);
  st = await at(12.5);
  expect(st.caps).toEqual(['REVIEW']); expect(st.pops).toEqual(['✓ 0 ISSUES']); expect(st.tok).toEqual({ left: 86, top: 76 });
  st = await at(14);
  expect(st.caps).toEqual(['DONE']); expect(st.pops).toEqual(['✓ UPDATED']); expect(st.tok).toEqual({ left: 50, top: 76 });
  expect(st.steps['05 DONE']).toBe(GREEN);
  st = await at(15.04);
  expect(st.tok).toEqual({ left: 14, top: 76 }); expect(st.steps['NEXT PAGE']).toBe(AMBER);
  st = await at(15.2);
  expect(st.caps).toEqual(['NEXT']); expect(st.pops).toEqual([]);
});

// Line 5: pause stops every moving part of the loop at once, and play resumes from the same point.
test('pause stops the whole loop; play resumes it', async ({ page }) => {
  await fresh(page);
  const states = () => loopBody(page).evaluate((b) => b.getAnimations({ subtree: true }).map((a) => ({ name: a.animationName, state: a.playState, t: a.currentTime })));
  const before = await states();
  expect(before.length).toBeGreaterThan(20);
  expect(before.every((a) => a.state === 'running')).toBe(true);
  expect((await box(pauseBtn(page))).h).toBeGreaterThanOrEqual(44);
  await pauseBtn(page).click();
  await expect(pauseBtn(page)).toHaveText('▶ PLAY');
  const p1 = await states();
  expect(p1.filter((a) => a.state !== 'paused')).toEqual([]);
  expect(p1.map((a) => a.name)).toContain('tflow');
  await page.waitForTimeout(400);
  const p2 = await states();
  expect(p2.map((a) => a.t)).toEqual(p1.map((a) => a.t));
  await pauseBtn(page).click();
  await expect(pauseBtn(page)).toHaveText('❚❚ PAUSE');
  const r = await states();
  expect(r.every((a) => a.state === 'running')).toBe(true);
  const tok = (list) => list.find((a) => a.name === 'tok').t;
  expect(tok(r) - tok(p1)).toBeLessThan(300); // resumed from where it stopped, not from a jump
});

// Line 6: the CLAUDE.md drawing is the design's SVG, element by element; its data is the design's X.cm; 7 parts + caption.
test('CLAUDE.md drawing and data are ported as drawn', async ({ page }) => {
  await fresh(page);
  await expect(drawing(page)).toBeVisible();
  const got = await drawing(page).evaluate((svg) => [svg, ...svg.querySelectorAll('*')].map((el) => {
    const attrs = {};
    for (const a of el.attributes) if (a.name !== 'class' && !a.name.startsWith('data-') && !/^on/i.test(a.name)) attrs[a.name] = a.value;
    const cls = [...el.classList].filter((c) => c !== 'dg-on' && c !== 'dg-dim').sort();
    return { tag: el.localName, attrs, cls, text: el.localName === 'text' ? el.textContent : '' };
  }));
  expect(got).toEqual(designSvgElements());
  expect(await parts(page).count()).toBe(7);
  await expect(drawing(page).locator('xpath=./*[local-name()="text"]')).toHaveText('PROMPTS ARE REQUESTS · HOOKS ARE LAW');
  expect(await page.evaluate(() => window.PORTFOLIO.drawings.cm)).toEqual(CM);
  expect(CM.lab).toEqual(['STOPS', 'WHEN']);
});

// Line 7: each part slides out of the closed stack (ex, 1.1 s after 0.25 s, once) when the page shows; the rest keeps moving.
test('CLAUDE.md parts slide apart on show and keep animating', async ({ page }) => {
  await fresh(page);
  const ex = await drawing(page).evaluate((svg) => svg.getAnimations({ subtree: true }).filter((a) => a.animationName === 'ex').map((a) => {
    const tm = a.effect.getTiming();
    a.pause(); a.currentTime = 250; // the first frame after the delay: the closed stack
    const m = new DOMMatrix(getComputedStyle(a.effect.target).transform);
    return { duration: tm.duration, delay: tm.delay, iterations: tm.iterations, dx: Math.round(m.e), dy: Math.round(m.f) };
  }));
  expect(ex.length).toBe(7);
  for (const a of ex) { expect(a.duration).toBe(1100); expect(a.delay).toBe(250); expect(a.iterations).toBe(1); }
  expect(ex.map((a) => [a.dx, a.dy])).toEqual([[0, 70], [0, 30], [0, -10], [0, -50], [-70, 0], [-70, 0], [70, 0]]);
  await fresh(page);
  await page.waitForTimeout(1500);
  const after = await drawing(page).evaluate((svg) => svg.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').map((a) => ({ name: a.animationName, it: a.effect.getTiming().iterations })));
  const running = new Set(after.filter((a) => a.it === Infinity).map((a) => a.name));
  for (const n of ['sq', 'gq', 'dflow', 'rf', 'gf', 'al']) expect(running.has(n), n).toBe(true);
  expect(after.some((a) => a.name === 'ex')).toBe(false);
  // Shown again later: it slides apart again.
  await page.evaluate(() => { location.hash = '#home'; });
  await page.evaluate(() => { location.hash = '#how'; });
  await expect.poll(() => drawing(page).evaluate((svg) => svg.getAnimations({ subtree: true }).filter((a) => a.animationName === 'ex' && a.playState === 'running').length)).toBe(7);
});

// Line 8: the shared engine on CLAUDE.md — hover, pin, leave; the card's rows are STOPS / WHEN only, and only with a value.
test('CLAUDE.md runs on the shared engine with STOPS / WHEN rows', async ({ page }) => {
  await fresh(page);
  const opac = () => parts(page).evaluateAll((gs) => gs.map((g) => +getComputedStyle(g).opacity));
  const rows = () => card(page).locator('xpath=./*[3]/*').allTextContents();
  await expect(card(page).locator('h4')).toHaveText('·CLAUDE.md');
  await expect(card(page).locator('p')).toHaveText(CM.over.does);
  expect(await rows()).toEqual([]);
  for (let n = 1; n <= 7; n++) {
    await legend(page, n).hover();
    await expect(card(page).locator('h4')).toHaveText(n + CM.parts[n - 1].name);
    await expect(card(page).locator('p')).toHaveText(CM.parts[n - 1].does);
    expect(await rows()).toEqual(['STOPS', CM.parts[n - 1].inp, 'WHEN', CM.parts[n - 1].out]);
    await expect.poll(opac).toEqual([1, 2, 3, 4, 5, 6, 7].map((k) => (k === n ? 1 : 0.3)));
  }
  await expect(card(page)).not.toContainText(/TAKES IN|DATA IN|RUNS ON|GIVES OUT|DATA OUT/);
  // Hover a part itself (its number circle), click to pin, leave: stays pinned; click again: unpins.
  const num = (n) => parts(page).nth(n - 1).locator('text', { hasText: new RegExp('^' + n + '$') });
  await away(page);
  await expect.poll(opac).toEqual([1, 1, 1, 1, 1, 1, 1]);
  await num(3).hover();
  await expect.poll(() => num(3).evaluate((t) => getComputedStyle(t.previousElementSibling).fill)).toBe(AMBER);
  await num(3).click();
  await expect(legend(page, 3)).toHaveAttribute('aria-pressed', 'true');
  await num(6).hover();
  await expect(card(page).locator('h4')).toHaveText('6CHECK COMMAND');
  await away(page);
  await expect(card(page).locator('h4')).toHaveText('3RULES 13–16');
  await num(3).click();
  await away(page);
  await expect(card(page).locator('h4')).toHaveText('·CLAUDE.md');
  // Independence: a pin here leaves Home's drawing alone, and a pin on Home leaves this one alone.
  await legend(page, 2).click();
  await page.locator('.fk[data-go="home"]').click();
  await settle(page);
  const hero = page.locator('svg[data-dg="hero"] > g');
  expect(await hero.evaluateAll((gs) => gs.map((g) => +getComputedStyle(g).opacity))).toEqual([1, 1, 1, 1]);
  await page.locator('[data-page="home"]').locator('button', { hasText: /^4HOSTING$/ }).click();
  await page.locator('.fk[data-go="how"]').click();
  await settle(page);
  await expect(card(page).locator('h4')).toHaveText('2RULES 0–12');
  await expect.poll(opac).toEqual([0.3, 1, 0.3, 0.3, 0.3, 0.3, 0.3]);
});

// Line 9: legend under the loop (AUTO tag, gate diamond) and the CLAUDE.md legend's 7 buttons, 44 px.
test('under the loop: the sentence, the AUTO tag and the gate diamond; 7 legend buttons', async ({ page }) => {
  await fresh(page);
  const lg = how(page).getByText('runs on its own').locator('xpath=..');
  await expect(lg).toContainText('AUTO runs on its own');
  await expect(lg).toContainText('gate: someone else says yes');
  const auto = lg.getByText('AUTO', { exact: true });
  expect(await auto.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(245, 197, 24)');
  const gate = await lg.getByText('gate: someone else says yes').evaluate((sp) => {
    const i = sp.querySelector('i'); const cs = getComputedStyle(i); const m = new DOMMatrix(cs.transform);
    return { bg: cs.backgroundColor, deg: Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI), w: i.getBoundingClientRect().width };
  });
  expect(gate.bg).toBe(GREEN);
  expect(gate.deg).toBe(45);
  expect(gate.w).toBeGreaterThan(8);
  for (let n = 1; n <= 7; n++) {
    await expect(legend(page, n)).toBeVisible();
    expect((await box(legend(page, n))).h).toBeGreaterThanOrEqual(44);
  }
});

// Line 10: the Builder's Map phase — 20 s, one timeline, the sequence at set times, empty at both ends of each pass.
test('the Builder\'s Map phase runs its 20 s sequence and loops cleanly', async ({ page }) => {
  await fresh(page);
  const live = await mapBox(page).evaluate((m) => m.getAnimations({ subtree: true }).filter((a) => a.animationName !== 'tflow').map((a) => ({ name: a.animationName, t: a.currentTime, d: a.effect.getTiming().duration, it: a.effect.getTiming().iterations })));
  expect(live.length).toBe(36);
  for (const a of live) expect(a.name).toMatch(/^pm/);
  for (const a of live) { expect(a.d, a.name).toBe(20000); expect(a.it, a.name).toBe(Infinity); }
  const ts = live.map((a) => a.t);
  expect(Math.max(...ts) - Math.min(...ts)).toBeLessThan(50); // one shared timeline
  const at = async (pct) => { await freezeAt(mapBox(page), pct * 200); return mapState(page); };
  const empty = (s) => {
    expect(s.clip).toBe('inset(0px 100% 0px 0px)');
    for (const f of FEATURES) { expect(s.rows[f].op, f).toBe(0); expect(s.chips[f].op, f).toBe(0); expect(s.slots[f], f).toBe(0); }
    expect(s.frozen).toBe(0);
    expect(Object.values(s.counters)).toEqual([0, 0, 0, 0]);
    expect([s.passed, s.live, s.banner]).toEqual([0, 0, 0]);
    expect(s.gate).not.toBe(GREEN);
  };
  // the start of a pass (before the sentence types) and its last moment are the same empty map
  empty(await at(0.5));
  empty(await at(99.6));
  let s = await at(5); // the sentence is typing in
  const right = parseFloat(s.clip.split(' ')[1]);
  expect(right).toBeGreaterThan(5); expect(right).toBeLessThan(95);
  s = await at(12); // scope rows appearing in order
  expect(FEATURES.map((f) => s.rows[f].op)).toEqual([1, 0, 0, 0]);
  s = await at(18.5); // four features in, Student Life out as frozen
  expect(FEATURES.map((f) => s.rows[f].op)).toEqual([1, 1, 1, 1]);
  expect(s.frozen).toBe(1);
  expect(FEATURES.map((f) => s.rows[f].tick)).toEqual([0, 0, 0, 0]);
  // Feature 1's tag goes Spec → Design → Build → Verify → Status, the station lit as it arrives.
  const stations = [[22, '3 · SPEC'], [24.8, '4 · DESIGN'], [27.3, '5 · BUILD'], [29.8, '6 · VERIFY'], [32.3, '7 · STATUS']];
  for (const [pct, st] of stations) {
    s = await at(pct);
    expect(s.counters).toEqual({ 'FEATURE 1 OF 4': 1, 'FEATURE 2 OF 4': 0, 'FEATURE 3 OF 4': 0, 'FEATURE 4 OF 4': 0 });
    expect(s.chips.HOME.op, st).toBe(1);
    expect(Math.abs(s.chips.HOME.x - s.steps[st].x), st).toBeLessThan(3);
    expect(Math.abs(s.chips.HOME.y - s.steps[st].y), st).toBeLessThan(3);
    expect(s.steps[st].border, st).toBe(st === '6 · VERIFY' ? GREEN : AMBER);
    for (const f of FEATURES.slice(1)) expect(s.chips[f].op).toBe(0);
  }
  s = await at(36); // Home built: in BUILT, ✓ on the scope list; feature 2 starts
  expect(s.slots.HOME).toBe(1); expect(s.rows.HOME.tick).toBe(1); expect(s.slots['YOUR REAL COST']).toBe(0);
  expect(s.counters['FEATURE 2 OF 4']).toBe(1); expect(s.chips['YOUR REAL COST'].op).toBe(1);
  s = await at(66);
  expect(s.counters['FEATURE 4 OF 4']).toBe(1); expect(s.chips.CONTACT.op).toBe(1);
  expect(FEATURES.map((f) => s.slots[f])).toEqual([1, 1, 1, 0]);
  s = await at(85); // all built; prove it
  expect(FEATURES.map((f) => s.slots[f])).toEqual([1, 1, 1, 1]);
  expect(FEATURES.map((f) => s.rows[f].tick)).toEqual([1, 1, 1, 1]);
  expect(s.prove).toBe(GREEN); expect(s.passed).toBe(1); expect(s.live).toBe(0);
  s = await at(91); // ship
  expect(s.ship).toBe(AMBER); expect(s.live).toBe(1); expect(s.gate).not.toBe(GREEN);
  s = await at(96); // the gate turns green; the banner
  expect(s.gate).toBe(GREEN); expect(s.banner).toBe(1);
});

// Line 11: the map keeps 980 px and scrolls sideways inside its own box; the page never does.
for (const w of [390, 768]) {
  test(`the phase map scrolls inside its own box at ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await fresh(page);
    const m = await mapBox(page).evaluate((map) => {
      const sc = map.parentElement;
      return { w: map.getBoundingClientRect().width, scrolls: sc.scrollWidth > sc.clientWidth, ox: getComputedStyle(sc).overflowX };
    });
    expect(Math.round(m.w)).toBe(980);
    expect(m.scrolls).toBe(true);
    expect(['auto', 'scroll']).toContain(m.ox);
    expect(await noSideScroll(page)).toBe(true);
  });
}

// Line 12: both full graphics open in the CRT window, fit with no scrolling, and close by ✕, scrim, Esc and page change.
const GRAPHICS = [
  ['FULL CLAUDE.MD GRAPHIC ⤢', 'THE CLAUDE.MD ANATOMY · FULL GRAPHIC', 'assets/claude-md-anatomy.png', ALT_CM],
  ['FULL BUILDER\'S MAP ⤢', "THE BUILDER'S MAP · FULL GRAPHIC", 'assets/builders-map.png', ALT_MAP]
];
for (const w of [390, 768, 1280]) {
  test(`full graphics open, fit and close at ${w}`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.setViewportSize({ width: w, height: w === 390 ? 844 : 900 });
    await fresh(page);
    await expect(dialog(page)).toHaveCount(0);
    for (const [btnName, head, src, alt] of GRAPHICS) {
      const btn = how(page).getByRole('button', { name: btnName, exact: true });
      expect((await box(btn)).h).toBeGreaterThanOrEqual(44);
      for (const how2close of ['x', 'scrim', 'esc']) {
        await btn.click();
        await expect(dialog(page)).toBeVisible();
        await expect(dialog(page)).toHaveAccessibleName(head);
        await expect(dialog(page).locator('.ph b')).toHaveText(head + '<GO>');
        const img = dialog(page).getByRole('img', { name: alt, exact: true });
        await expect(img).toBeVisible();
        expect(await img.getAttribute('src')).toBe(src);
        await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
        const crt = await dialog(page).evaluate((d) => d.getAnimations().filter((a) => a.animationName === 'crt').map((a) => a.effect.getTiming().duration));
        expect(crt).toEqual([600]);
        await dialog(page).evaluate((d) => Promise.all(d.getAnimations().map((a) => a.finished)));
        const fit = await img.evaluate((i) => {
          const r = i.getBoundingClientRect(); const b = i.parentElement;
          return { inView: r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth, bodyScroll: b.scrollHeight > b.clientHeight + 1 || b.scrollWidth > b.clientWidth + 1 };
        });
        expect(fit).toEqual({ inView: true, bodyScroll: false });
        const close = dialog(page).getByRole('button', { name: 'Close window' });
        await expect(close).toHaveText('CLOSE ✕');
        await expect(close).toBeFocused();
        expect((await box(close)).h).toBeGreaterThanOrEqual(44);
        if (how2close === 'x') await close.click();
        else if (how2close === 'scrim') await page.mouse.click(3, (w === 390 ? 844 : 900) - 3);
        else await page.keyboard.press('Escape');
        await expect(dialog(page)).toHaveCount(0);
        await expect(btn).toBeFocused();
      }
    }
    // A page change closes it.
    await how(page).getByRole('button', { name: GRAPHICS[1][0], exact: true }).click();
    await expect(dialog(page)).toBeVisible();
    await page.evaluate(() => { location.hash = '#home'; });
    await expect(dialog(page)).toHaveCount(0);
    await page.evaluate(() => { location.hash = '#how'; });
    await expect(dialog(page)).toHaveCount(0);
    expect(await noSideScroll(page)).toBe(true);
    expect(errors).toEqual([]);
  });
}

// Line 13: reduced motion — nothing moves; CLAUDE.md fully drawn (bar the CHECK ✓ the design hides when still);
// the loop shows PLAN with the token at Plan; the phase map shows its finished state.
test('reduced motion: still, with the first caption and the finished phase', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./#how');
  await page.reload();
  expect(await how(page).evaluate((s) => s.getAnimations({ subtree: true }).length)).toBe(0);
  const hidden = await drawing(page).evaluate((svg) => [...svg.querySelectorAll('*')].filter((el) => {
    for (let e = el; e !== svg; e = e.parentElement) if (+getComputedStyle(e).opacity === 0 || getComputedStyle(e).display === 'none') return true;
    return false;
  }).map((el) => el.localName + ':' + el.textContent + '@' + el.getAttribute('x') + ',' + el.getAttribute('y')));
  expect(hidden).toEqual(['text:✓@764,298']);
  expect(await parts(page).evaluateAll((gs) => gs.map((g) => +getComputedStyle(g).opacity))).toEqual([1, 1, 1, 1, 1, 1, 1]);
  const st = await loopState(page);
  expect(st.caps).toEqual(['PLAN']);
  expect(st.pops).toEqual([]);
  expect(st.tok).toEqual({ left: 14, top: 24 });
  const m = await mapState(page);
  expect(m.clip).toBe('none');
  for (const f of FEATURES) { expect(m.rows[f], f).toEqual({ op: 1, tick: 1 }); expect(m.slots[f], f).toBe(1); expect(m.chips[f].op, f).toBe(0); }
  expect(m.frozen).toBeGreaterThan(0.4);
  expect(Object.values(m.counters)).toEqual([0, 0, 0, 0]);
  expect([m.passed, m.live, m.banner]).toEqual([1, 1, 1]);
  expect(m.gate).toBe(GREEN);
  await how(page).getByRole('button', { name: 'FULL BUILDER\'S MAP ⤢', exact: true }).click();
  await expect(dialog(page)).toBeVisible();
  expect(await dialog(page).evaluate((d) => d.getAnimations().length)).toBe(0);
});

// Line 14: no sideways scroll, every button ≥ 44 px, zero console errors after using every control.
for (const w of [390, 768, 1280]) {
  test(`no sideways scroll, 44 px buttons, no errors at ${w}`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.setViewportSize({ width: w, height: 900 });
    await fresh(page);
    expect(await noSideScroll(page)).toBe(true);
    const small = await how(page).evaluate((s) => [...s.querySelectorAll('button')].filter((b) => b.getClientRects().length && b.getBoundingClientRect().height < 44).map((b) => b.textContent));
    expect(small).toEqual([]);
    await pauseBtn(page).click();
    await pauseBtn(page).click();
    for (let n = 1; n <= 7; n++) { await legend(page, n).click(); await legend(page, n).click(); }
    for (let n = 1; n <= 7; n++) await parts(page).nth(n - 1).locator('text', { hasText: new RegExp('^' + n + '$') }).click({ force: true });
    for (const [btnName] of GRAPHICS) {
      await how(page).getByRole('button', { name: btnName, exact: true }).click();
      await page.keyboard.press('Escape');
    }
    expect(await noSideScroll(page)).toBe(true);
    expect(errors).toEqual([]);
  });
}
