// Unit 05 — Phone pass + quality standard. Each test names the line it guards (specs/05-phone-pass.md: D1–D6, Done when 2–10).
// Elements are found by the design's own text, roles and aria-labels, not by the classes under test.
import { test, expect } from '@playwright/test';

const WIDTHS = [390, 768, 1280];
const ORDER = ['scout', 'holy', 'wire', 'slate', 'optom', 'dfs'];
const TKR = { scout: 'SCTM', holy: 'HCRS', wire: 'WIRE', slate: 'SLTH', optom: 'OPTO', dfs: 'SDFS' };
const DRAWINGS = ['hero', ...ORDER, 'cm'];
const HASH = { hero: '#home', cm: '#how', ...Object.fromEntries(ORDER.map((id) => [id, '#projects/' + id])) };

function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', (r) => errors.push('failed request: ' + r.url()));
  return errors;
}
async function open(page, w, hash) {
  await page.setViewportSize({ width: w, height: w === 390 ? 844 : 900 });
  await page.goto('./' + hash);
  await page.evaluate(() => Promise.all([document.fonts.ready, ...document.getAnimations().filter((a) => a.animationName === 'pg').map((a) => a.finished)])); // the page has finished opening
}
const noSideScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && scrollX === 0);
const key = (page, label) => page.locator('.topbar button', { hasText: label });

// Smallest rendered text in a drawing: font-size × the drawing's screen scale.
const minText = (svg) => svg.evaluate((s) => Math.min(...[...s.querySelectorAll('text')].map((t) => { const m = t.getScreenCTM(); return parseFloat(getComputedStyle(t).fontSize) * Math.hypot(m.a, m.b); })));

// Pairs of visible texts whose glyphs overlap (text boxes trimmed to the glyph band: line boxes carry padding).
const TEXT_OVERLAPS = `(root) => {
  const vis = (el) => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; } return true; };
  const boxes = [];
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = walk.nextNode());) {
    if (!n.textContent.trim() || !vis(n.parentElement)) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    for (const q of r.getClientRects()) {
      if (q.width < 1) continue;
      const fs = parseFloat(getComputedStyle(n.parentElement).fontSize) * (n.parentElement.closest('svg') ? (n.parentElement.getScreenCTM ? Math.hypot(n.parentElement.getScreenCTM().a, n.parentElement.getScreenCTM().b) : 1) : 1);
      const mid = (q.top + q.bottom) / 2, h = fs * 0.36; // glyph band: about ±0.36 em around the line's middle
      const b = { t: n.textContent.trim(), l: q.left + 0.5, r: q.right - 0.5, t0: mid - h, b0: mid + h, el: n.parentElement };
      for (let e = n.parentElement.parentElement; e && e !== document.body; e = e.parentElement) { // words scrolled out of a box are not on screen
        if (getComputedStyle(e).overflowX === 'visible') continue;
        const c = e.getBoundingClientRect(); b.l = Math.max(b.l, c.left); b.r = Math.min(b.r, c.right);
      }
      if (b.r > b.l) boxes.push(b);
    }
  }
  const out = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
    if (a.l < b.r && b.l < a.r && a.t0 < b.b0 && b.t0 < a.b0) out.push(a.t + ' / ' + b.t);
  }
  return out;
}`;

// ---- D1: the top bar on a phone is two rows; the F1–F4 tags hide; it never changes height.
test('D1: at 390 the top bar is two rows, keys 44 px, F-tags hidden, same height whatever the GO label', async ({ page }) => {
  await open(page, 390, '#home');
  const bar = page.locator('.topbar');
  const h0 = (await bar.boundingBox()).height;
  expect(h0).toBeLessThanOrEqual(120);
  const name = await page.getByText('STEFFEN [LAST NAME]', { exact: true }).boundingBox();
  const go = await key(page, 'START TOUR').boundingBox();
  const keys = await Promise.all(['HOME', 'PROJECTS', 'HOW I WORK', 'CONTACT ↓'].map((k) => page.locator('.topbar button', { hasText: new RegExp(k + '$') }).boundingBox()));
  expect(go.y).toBeLessThan(name.y + name.height); // GO shares the name's row
  for (const k of keys) { expect(Math.abs(k.y - keys[0].y)).toBeLessThan(1); expect(k.y).toBeGreaterThanOrEqual(go.y + go.height); expect(k.height).toBeGreaterThanOrEqual(44); expect(k.x + k.width).toBeLessThanOrEqual(390); }
  expect(go.height).toBeGreaterThanOrEqual(44);
  for (const f of ['F1', 'F2', 'F3', 'F4']) await expect(page.locator('.topbar b', { hasText: new RegExp('^' + f + '$') })).toBeHidden();
  await expect(page.locator('.topbar b', { hasText: /^GO$/ })).toBeVisible();
  for (const hash of ['#projects/scout', '#how', ...ORDER.map((id) => '#projects/' + id)]) { // START TOUR → CONTINUE → DONE ✓
    await page.goto('./' + hash);
    expect((await bar.boundingBox()).height).toBe(h0);
  }
  await expect(key(page, 'DONE ✓')).toBeVisible();
  for (const w of [768, 1280]) { // tablet and desktop keep the F-tags
    await page.setViewportSize({ width: w, height: 900 });
    for (const f of ['F1', 'F2', 'F3', 'F4']) await expect(page.locator('.topbar b', { hasText: new RegExp('^' + f + '$') })).toBeVisible();
  }
});

// ---- D2 + D3: on a phone no drawing word is below 9 px; drawings scroll in their own box; Home and CLAUDE.md open centred.
for (const id of DRAWINGS) {
  test(`D2: at 390 the ${id} drawing renders every word at 9 px or more and scrolls in its own box`, async ({ page }) => {
    await open(page, 390, HASH[id]);
    const svg = page.locator(`svg[data-dg="${id}"]`);
    expect(await minText(svg)).toBeGreaterThanOrEqual(8.95);
    const sc = await svg.evaluate((s) => {
      let b = s.parentElement; while (b && getComputedStyle(b).overflowX !== 'auto') b = b.parentElement; if (!b) return null;
      const r = b.getBoundingClientRect();
      // the drawing's axis: its first line drawn straight down (the dotted line through the stack of plates)
      const axis = [...s.children].find((el) => el.localName === 'path' && /^M[\d.]+ [\d.]+ V[\d.]+$/.test(el.getAttribute('d'))); // Home and CLAUDE.md only
      const ax = axis ? axis.getBoundingClientRect() : r;
      return { over: b.scrollWidth > b.clientWidth, left: b.scrollLeft, right: r.right, axisOff: Math.abs(ax.left + ax.width / 2 - (r.left + r.width / 2)) };
    });
    expect(sc).not.toBeNull();
    expect(sc.over).toBe(true);
    expect(sc.right).toBeLessThanOrEqual(390);
    if (id === 'hero' || id === 'cm') expect(sc.axisOff).toBeLessThanOrEqual(2); // opens centred on its stack of plates
    else expect(sc.left).toBe(0);
    if (id === 'cm') { // D3: the plate labels show first
      for (const t of ['CLAUDE.md', 'RULES 0–12 · HOW TO WORK', 'RULES 13–16 · ENFORCED', 'DONE CHECKLIST · 6 STEPS']) {
        const inBox = await svg.evaluate((s, t) => { const el = [...s.querySelectorAll('text')].find((x) => x.textContent === t); const q = el.getBoundingClientRect(), b = s.parentElement.getBoundingClientRect(); return q.left >= b.left && q.right <= b.right; }, t);
        expect(inBox, t).toBe(true);
      }
    }
    expect(await noSideScroll(page)).toBe(true);
  });
}

test('D2/D3: at 390 tapping a legend button slides its part into view, and the page stays put', async ({ page }) => {
  await open(page, 390, '#how');
  const svg = page.locator('svg[data-dg="cm"]');
  const box = svg.locator('xpath=..');
  for (const [n, name] of [[6, 'CHECK COMMAND'], [7, 'MISTAKE LOG'], [5, 'HOOKS']]) {
    await page.locator('[data-page="how"] button', { hasText: new RegExp('^' + n + name + '$') }).click();
    await expect.poll(() => page.evaluate(([n]) => {
      const p = document.querySelector(`svg[data-dg="cm"] [data-n="${n}"]`).getBoundingClientRect();
      const b = document.querySelector('svg[data-dg="cm"]').parentElement.getBoundingClientRect();
      return p.left >= b.left - 1 && p.right <= b.right + 1 || (p.width > b.width && p.left <= b.left + 1);
    }, [n])).toBe(true);
    expect(await page.evaluate(() => scrollX)).toBe(0);
  }
  expect(await box.evaluate((b) => b.scrollLeft)).toBeGreaterThan(0);
});

for (const w of WIDTHS) {
  test(`D2: at ${w} each Home cartridge is a tap target at least 44 px tall that opens its project`, async ({ page }) => {
    await open(page, w, '#home');
    for (const [i, id] of ORDER.entries()) {
      const t = page.locator('svg[data-dg="hero"] text', { hasText: new RegExp('^' + TKR[id] + '$') });
      await t.evaluate((el) => el.scrollIntoView({ block: 'center' })); // it floats, so never 'stable'
      const hits = await t.evaluate((el) => {
        const g = el.closest('[data-open]'); const face = [...g.querySelectorAll('rect')].find((q) => getComputedStyle(q).fill !== 'rgba(0, 0, 0, 0)').getBoundingClientRect();
        const cx = face.left + face.width / 2, cy = face.top + face.height / 2;
        return [-21.9, 0, 21.9].map((d) => { const e = document.elementFromPoint(cx, cy + d); return e && e.closest("[data-open]") === g; });
      });
      expect(hits).toEqual([true, true, true]);
      if (i === 4) { // one tap opens it (the click handler is on the whole cartridge)
        const r = await t.evaluate((el) => { const f = [...el.closest('[data-open]').querySelectorAll('rect')].find((q) => getComputedStyle(q).fill !== 'rgba(0, 0, 0, 0)').getBoundingClientRect(); return { x: f.left + f.width / 2, y: f.top + f.height / 2 + 21 }; });
        await page.mouse.click(r.x, r.y);
        await expect(page).toHaveURL(/#projects\/optom$/);
        await open(page, w, '#home');
      }
    }
  });
}

// ---- D4: the PAGE marker never covers a step's words; on phones the pop-ups stay within two lines inside the loop.
const WAITS = [0.8, 3.5, 5.6, 7.6, 9.1, 10.8, 12.6, 14.0, 15.04]; // seconds: the marker waits at each stop
for (const w of WIDTHS) {
  test(`D4: at ${w} the PAGE marker and its word never cover the loop's text`, async ({ page }) => {
    await open(page, w, '#how');
    const sim = page.locator('[data-page="how"] .frame', { hasText: 'THE LOOP · ONCE PER PAGE' }).locator('[data-loop] > div').first();
    for (const s of WAITS) {
      await page.evaluate((t) => document.getAnimations().forEach((a) => { if (a.effect && a.effect.getTiming().duration === 16000) { a.pause(); a.currentTime = t; } }), s * 1000);
      const bad = await sim.evaluate((root) => {
        const tok = [...root.querySelectorAll('*')].find((el) => getComputedStyle(el, '::after').content === '"PAGE"');
        const tr = tok.getBoundingClientRect();
        const a = getComputedStyle(tok, '::after');
        const c = document.createElement('canvas').getContext('2d');
        c.font = a.fontWeight + ' ' + a.fontSize + ' ' + a.fontFamily;
        const lw = c.measureText('PAGE').width + 3 * parseFloat(a.letterSpacing || 0);
        const lab = { l: tr.left + parseFloat(a.left), t: tr.top + parseFloat(a.top), r: 0, b: 0 }; lab.r = lab.l + lw; lab.b = lab.t + parseFloat(a.fontSize) * 1.2;
        const sq = { l: tr.left, t: tr.top, r: tr.right, b: tr.bottom };
        const vis = (el) => { for (let e = el; e && e !== root.parentElement; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || +s.opacity < 0.05) return false; } return true; };
        const out = [];
        const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        for (let n; (n = walk.nextNode());) {
          if (!n.textContent.trim() || !vis(n.parentElement)) continue;
          const rg = document.createRange(); rg.selectNodeContents(n);
          for (const q of rg.getClientRects()) {
            const g = { l: q.left, r: q.right, t: q.top + q.height * 0.15, b: q.bottom - q.height * 0.15 };
            for (const [nm, k] of [['marker', sq], ['PAGE', lab]]) if (k.l < g.r && g.l < k.r && k.t < g.b && g.t < k.b) out.push(nm + ' over "' + n.textContent.trim() + '"');
          }
        }
        return out;
      });
      expect(bad, `at ${s}s`).toEqual([]);
    }
  });
}

test('D4: at 390 every loop pop-up is at most two lines and inside the loop', async ({ page }) => {
  await open(page, 390, '#how');
  const res = await page.evaluate(() => {
    const sim = [...document.querySelectorAll('[data-loop] *')].find((el) => getComputedStyle(el, '::after').content === '"PAGE"').parentElement;
    const r0 = sim.getBoundingClientRect();
    return ['✗ BLOCKED', '✗ 2 OF 14 FAILED', '✓ 14 OF 14 PASS', '✓ 0 ISSUES', '✓ UPDATED'].map((t) => {
      const el = [...sim.children].find((c) => c.textContent === t);
      const rg = document.createRange(); rg.selectNodeContents(el);
      const lines = new Set([...rg.getClientRects()].map((q) => Math.round(q.top))).size;
      const r = el.getBoundingClientRect();
      return t + ': ' + (lines <= 2 ? 'ok' : lines + ' lines') + (r.left >= r0.left && r.right <= r0.right && r.top >= r0.top && r.bottom <= r0.bottom ? '' : ' outside');
    });
  });
  for (const r of res) expect(r).toMatch(/: ok$/);
});

// ---- D5: the project row slides to the selected project, inside its own box only.
for (const w of [390, 768]) {
  test(`D5: at ${w} the selected project's cartridge is always in view in its row`, async ({ page }) => {
    await open(page, w, '#projects/dfs'); // a shared link to the last project
    const inView = (id) => page.getByRole('tab').filter({ hasText: TKR[id] }).evaluate((c) => {
      const r = c.getBoundingClientRect(), b = c.parentElement.getBoundingClientRect();
      return r.left >= b.left - 1 && r.right <= b.right + 1;
    });
    await expect.poll(() => inView('dfs')).toBe(true);
    for (const id of ['scout', 'optom', 'holy', 'dfs', 'wire']) {
      await page.getByRole('tab').filter({ hasText: TKR[id] }).evaluate((c) => c.click());
      await expect.poll(() => inView(id)).toBe(true);
      expect(await noSideScroll(page)).toBe(true);
    }
    await page.goto('./#how'); // leave, then come back by a shared link
    await page.goto('./#projects/optom');
    await expect.poll(() => inView('optom')).toBe(true);
  });
}

// ---- D6 + Done when 3: no two words overlap anywhere on any page at any width.
for (const w of WIDTHS) {
  test(`D6: at ${w} no two words overlap on Home, any project or How I work`, async ({ page }) => {
    for (const hash of ['#home', ...ORDER.map((id) => '#projects/' + id), '#how']) {
      await page.emulateMedia({ reducedMotion: 'reduce' }); // every part at rest in its drawn place
      await open(page, w, hash);
      const ov = await page.locator('main').evaluate(new Function('return ' + TEXT_OVERLAPS)());
      expect(ov, hash).toEqual([]);
    }
  });
}

// ---- D6 (c): "NEXT PHASE ↺" sits clear of the Builder's Map return line (the path that ends "H8 V78").
for (const w of WIDTHS) {
  test(`D6: at ${w} "NEXT PHASE ↺" is clear of the map's return line`, async ({ page }) => {
    await open(page, w, '#how');
    const r = await page.getByText('NEXT PHASE ↺', { exact: true }).evaluate((el) => {
      const svg = [...el.parentElement.querySelectorAll('svg')].find((s) => [...s.querySelectorAll('path')].some((p) => /H8 V78$/.test(p.getAttribute('d'))));
      const s = svg.getBoundingClientRect(), t = el.getBoundingClientRect();
      const x = s.left + s.width * 0.08, y0 = s.top + s.height * 0.78, y1 = s.top + s.height * 0.95; // the line: x 8 %, from 78 % down to 95 %, then along 95 %
      return { crossesVertical: t.left < x + 1 && t.right > x - 1 && t.top < y1 && t.bottom > y0, crossesBottom: t.bottom > y1 - 1 && t.top < y1 + 1 };
    });
    expect(r).toEqual({ crossesVertical: false, crossesBottom: false });
  });
}

// ---- Done when 2–10: the quality standard, every page × every width.
for (const w of WIDTHS) {
  test(`quality standard at ${w}: no sideways scroll, nothing spills, fonts, images, 44 px targets, one page, relative links`, async ({ page }) => {
    const errors = trackErrors(page);
    const pages = ['#home', ...ORDER.map((id) => '#projects/' + id), '#how'];
    for (const hash of pages) {
      await open(page, w, hash);
      expect(await noSideScroll(page), hash).toBe(true);
      // exactly one page section showing
      expect(await page.locator('main > section:visible').count(), hash).toBe(1);
      // fonts: both families loaded, nothing on screen set in a fallback
      expect(await page.evaluate(() => document.fonts.check('13px "IBM Plex Mono"') && document.fonts.check('20px VT323'))).toBe(true);
      // every visible element stays inside the screen, or inside a box that scrolls
      const spill = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll('main *, .topbar *, footer *')) {
          const r = el.getBoundingClientRect();
          if (!r.width || !el.checkVisibility()) continue;
          let s = el.parentElement, scrolls = false;
          for (; s; s = s.parentElement) { const ox = getComputedStyle(s).overflowX; if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') { scrolls = true; break; } }
          if (!scrolls && (r.left < -0.5 || r.right > innerWidth + 0.5)) out.push(el.tagName + ' ' + (el.textContent || '').slice(0, 30));
        }
        return out;
      });
      expect(spill, hash).toEqual([]);
      // no broken image, no empty frame
      expect(await page.evaluate(() => [...document.querySelectorAll('img')].filter((i) => i.checkVisibility() && !(i.complete && i.naturalWidth)).length)).toBe(0);
      // every visible button, tab and link-button is 44 px tall
      const small = await page.evaluate(() => [...document.querySelectorAll('button, [role="tab"], a.btn')].filter((b) => b.checkVisibility() && b.getBoundingClientRect().height < 43.5).map((b) => b.textContent.trim()));
      expect(small, hash).toEqual([]);
      // every visible text outside the drawings is at least 9 px
      const tiny = await page.evaluate(() => [...document.querySelectorAll('main *, .topbar *, footer *')].filter((el) => !el.closest('svg') && el.checkVisibility() && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(el).fontSize) < 9).map((el) => el.textContent.trim()));
      expect(tiny, hash).toEqual([]);
      // every link is relative
      const abs = await page.evaluate(() => [...document.querySelectorAll('[href], [src]')].map((e) => e.getAttribute('href') || e.getAttribute('src')).filter((u) => u && (u.startsWith('/') || /^https?:/.test(u)) && !u.startsWith('https://fonts.')));
      expect(abs).toEqual([]);
    }
    // the phase map scrolls inside its box on narrow screens
    if (w < 1000) {
      await open(page, w, '#how');
      const m = await page.getByText('NEXT PHASE ↺', { exact: true }).evaluate((el) => { let b = el.parentElement; while (getComputedStyle(b).overflowX !== 'auto') b = b.parentElement; return b.scrollWidth > b.clientWidth; });
      expect(m).toBe(true);
      expect(await noSideScroll(page)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test('quality standard: dark by design; a phone in light mode shows the same dark site', async ({ page }) => {
  for (const scheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: scheme });
    await open(page, 390, '#home');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe('dark');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(5, 4, 3)');
    expect(await page.getByText('I build the framework the AI works inside.').evaluate((e) => getComputedStyle(e).color)).toBe('rgb(240, 233, 220)');
  }
});

test('quality standard: zero console errors after pressing every key, tab and button at 390', async ({ page }) => {
  const errors = trackErrors(page);
  await open(page, 390, '#home');
  for (const k of ['PROJECTS', 'HOW I WORK', 'HOME', 'CONTACT ↓']) await page.locator('.topbar button', { hasText: new RegExp(k + '$') }).click();
  await page.locator('.topbar button').filter({ has: page.locator('b', { hasText: /^GO$/ }) }).click(); // the tour key, whatever its label
  await page.goto('./#home');
  for (const b of await page.locator('[data-page="home"] button:visible').all()) { await b.click(); await page.goto('./#home'); }
  await page.goto('./#projects/scout');
  for (const id of ORDER) {
    await page.getByRole('tab').filter({ hasText: TKR[id] }).evaluate((c) => c.click());
    for (const b of await page.locator('[data-page="projects"] button:visible').filter({ hasNotText: /›|‹|COMING/ }).all()) await b.click();
  }
  await page.goto('./#how');
  for (const b of await page.locator('[data-page="how"] button:visible').all()) { await b.click(); await page.keyboard.press('Escape'); }
  await page.getByRole('button', { name: 'COPY EMAIL' }).click();
  expect(errors).toEqual([]);
});
