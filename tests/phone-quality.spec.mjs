// Unit 05 — Phone pass + quality standard. Each test names the spec line it guards (specs/05-phone-quality.md).
// Lines already guarded by units 01–04 are mapped in the spec, not repeated here.
import { test, expect } from '@playwright/test';

const WIDTHS = [390, 768, 1280];
const IDS = ['scout', 'wire', 'slate', 'dfs', 'holy', 'optom'];

function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}
// Open the page and wait until the fonts are in and the cards have finished staggering in.
async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 844 }, ...opts });
  const errors = trackErrors(page);
  await page.goto('./');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll('.card')].flatMap((c) => c.getAnimations().map((a) => a.finished)));
  });
  return { page, errors };
}
// Every window's open transition (the CRT open) has settled.
const settle = (page) => page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {}))));

// Line 1: an open image window never makes the page scroll sideways (unit 02 checks 390, 1280 and 1440 only).
for (const width of WIDTHS) {
  test(`no sideways scroll with an image window open at ${width}`, async ({ browser }) => {
    const { page } = await open(browser, width);
    for (const btn of ['CLAUDE.md ⤢', 'BUILDER’S MAP ⤢']) {
      await page.getByRole('button', { name: btn }).click();
      await expect(page.locator('[data-win="img"]')).toBeVisible();
      await settle(page);
      // The window floats over the page, so it could stick out without the page scrolling: check both.
      const r = await page.evaluate(() => {
        const w = document.querySelector('[data-win="img"] .win').getBoundingClientRect();
        return { doc: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth, left: w.left, right: w.right };
      });
      expect(r.doc, btn).toBeLessThanOrEqual(r.vw);
      expect(r.left, btn).toBeGreaterThanOrEqual(0);
      expect(r.right, btn).toBeLessThanOrEqual(r.vw);
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-win="img"]')).toBeHidden();
    }
    await page.close();
  });
}

// Line 2: nothing sticks out past the page, and no box cuts its text off.
for (const width of WIDTHS) {
  test(`nothing overflows its box at ${width}`, async ({ browser }) => {
    const { page } = await open(browser, width);
    const bad = await page.evaluate(() => {
      const out = [];
      const vw = document.documentElement.clientWidth;
      const name = (el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().replace(/\s+/g, '.') : '');
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('[hidden]') || el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
        if (!el.getClientRects().length || getComputedStyle(el).visibility === 'hidden' || el.classList.contains('crt')) continue;
        // Inside a box that scrolls or clips, the box itself is what gets checked.
        let clipped = false;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          if (getComputedStyle(a).overflowX !== 'visible') { clipped = true; break; }
        }
        const r = el.getBoundingClientRect();
        if (!clipped && (r.left < -0.5 || r.right > vw + 0.5)) out.push(name(el) + ' spans ' + Math.round(r.left) + '–' + Math.round(r.right) + ' of ' + vw);
        const cs = getComputedStyle(el);
        const hidesX = cs.overflowX === 'hidden' || cs.overflowX === 'clip';
        const hidesY = cs.overflowY === 'hidden' || cs.overflowY === 'clip';
        const text = el.textContent.trim();
        if (text && hidesX && el.scrollWidth > el.clientWidth + 1) out.push(name(el) + ' cuts text sideways ' + el.scrollWidth + '>' + el.clientWidth);
        if (text && hidesY && el.scrollHeight > el.clientHeight + 1) out.push(name(el) + ' cuts text off ' + el.scrollHeight + '>' + el.clientHeight);
      }
      return out;
    });
    expect(bad).toEqual([]);
    await page.close();
  });
}

// Line 3: neighbours never overlap (the connector-line layer is decoration and sits over the gaps by design).
const GROUPS = ['.hd', '.hd-l', '.hd-r', '.em-row', '.skl', '.stage', '.grid1', '.grid-web', '.card', '.card-b', '.card-t', '.fwin', '.trio', '.e-btns', '.ft'];
for (const width of WIDTHS) {
  test(`no overlapping elements at ${width}`, async ({ browser }) => {
    const { page } = await open(browser, width);
    const bad = await page.evaluate((groups) => {
      const out = [];
      const name = (el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().replace(/\s+/g, '.') : '');
      for (const sel of groups) for (const box of document.querySelectorAll(sel)) {
        const kids = [...box.children].filter((k) => {
          if (k.matches('svg.lines, .go') || !k.getClientRects().length) return false;
          const p = getComputedStyle(k).position;
          return p !== 'absolute' && p !== 'fixed';
        });
        for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
          const a = kids[i].getBoundingClientRect(), b = kids[j].getBoundingClientRect();
          const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (w > 0.5 && h > 0.5) out.push(sel + ': ' + name(kids[i]) + ' overlaps ' + name(kids[j]) + ' by ' + Math.round(w) + '×' + Math.round(h));
        }
      }
      return out;
    }, GROUPS);
    expect(bad).toEqual([]);
    await page.close();
  });
}

// Line 5: no broken images, no empty boxes.
for (const width of [390, 1280]) {
  test(`no broken images, no empty boxes at ${width}`, async ({ browser }) => {
    const { page } = await open(browser, width);
    const empty = await page.evaluate(() => [...document.querySelectorAll('.card, .tri, .st, .chip, .col-h, .btn, .sk, .thumb')]
      .filter((el) => el.getClientRects().length && !el.textContent.trim()).map((el) => el.className));
    expect(empty).toEqual([]);
    for (const btn of ['CLAUDE.md ⤢', 'BUILDER’S MAP ⤢']) {
      await page.getByRole('button', { name: btn }).click();
      const img = page.locator('[data-win="img"] img:not([hidden])');
      await expect(img).toBeVisible();
      await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-win="img"]')).toBeHidden();
    }
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.getAttribute('src') && !(i.complete && i.naturalWidth > 0)).map((i) => i.getAttribute('src')));
    expect(broken).toEqual([]);
    await page.close();
  });
}

// Line 6: once the cards have staggered in, everything meant to be seen is there.
for (const width of WIDTHS) {
  test(`everything meant to be seen is visible on load at ${width}`, async ({ browser }) => {
    const { page } = await open(browser, width);
    const r = await page.evaluate(() => {
      const shown = (el) => {
        if (!el || !el.getClientRects().length) return false;
        for (let a = el; a; a = a.parentElement) {
          const cs = getComputedStyle(a);
          if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 1) return false;
        }
        return true;
      };
      const sels = ['.hd-name', '.hd-title', '.hd-line', '.hd-sub', '.skl', '.skl-def', '.hd-r', '.fwin', '.fw2', '.trio', '.e-btns', '.ft'];
      const out = sels.filter((s) => !shown(document.querySelector(s)));
      document.querySelectorAll('.card').forEach((c) => { if (!shown(c)) out.push('card ' + c.dataset.card); });
      return { out, cards: document.querySelectorAll('.card').length };
    });
    expect(r).toEqual({ out: [], cards: 6 });
    await page.close();
  });
}

// Line 7: every button and link is at least 44 px tall (skill buttons are the named exception: unit 04),
// on the page, with each kind of panel open, and with an image window open.
for (const width of WIDTHS) {
  test(`buttons at least 44 px tall at ${width}`, async ({ browser }) => {
    const { page } = await open(browser, width);
    const short = () => page.evaluate(() => [...document.querySelectorAll('button, a[href], [role="button"], .tri')]
      .filter((b) => !b.classList.contains('sk') && b.getClientRects().length && !b.closest('[hidden]'))
      .map((b) => [b.textContent.trim().slice(0, 30), Math.round(b.getBoundingClientRect().height * 10) / 10])
      .filter(([, h]) => h < 44));
    expect(await short(), 'page').toEqual([]);
    for (const id of ['slate', 'optom']) {
      await page.locator(`[data-card="${id}"]`).click();
      await expect(page.locator('[data-win="pj"]')).toBeVisible();
      await settle(page);
      expect(await short(), id + ' panel').toEqual([]);
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-win="pj"]')).toBeHidden();
    }
    await page.getByRole('button', { name: 'CLAUDE.md ⤢' }).click();
    await expect(page.locator('[data-win="img"]')).toBeVisible();
    await settle(page);
    expect(await short(), 'image window').toEqual([]);
    await page.close();
  });
}

// Line 8: on a phone, clicking every button raises no console error.
test('zero console errors after clicking every button at 390', async ({ browser }) => {
  const { page, errors } = await open(browser, 390, { isMobile: true, hasTouch: true });
  await page.getByRole('button', { name: 'COPY EMAIL' }).click();
  for (const b of await page.locator('.skl .sk').all()) { await b.click(); await b.click(); }
  for (const t of await page.locator('.tri').all()) await t.click();
  for (const btn of ['CLAUDE.md ⤢', 'BUILDER’S MAP ⤢']) {
    await page.getByRole('button', { name: btn }).click();
    await page.locator('[data-win="img"] [data-close]').click();
    await expect(page.locator('[data-win="img"]')).toBeHidden();
  }
  for (const id of IDS) {
    await page.locator(`[data-card="${id}"]`).click();
    await page.locator('[data-win="pj"] [data-close]').click();
    await expect(page.locator('[data-win="pj"]')).toBeHidden();
  }
  expect(errors).toEqual([]);
  await page.close();
});

// Line 9: a phone set to light mode sees exactly the dark page, panel included.
test('a light-mode phone at 390 gets the same dark page, panel open', async ({ browser }) => {
  const SELS = ['body', '.hd-name', '.hd-line', '.hd-sub', '.sk', '.fwin', '.tri', '.card', '.card-b p', '.ft', '[data-win="pj"] .win', '.pinfo h2', '.pinfo p', '.pf'];
  const read = async (scheme) => {
    const { page } = await open(browser, 390, { colorScheme: scheme, isMobile: true, hasTouch: true });
    await page.locator('[data-card="holy"]').click();
    await expect(page.locator('[data-win="pj"]')).toBeVisible();
    await settle(page);
    const r = await page.evaluate((sels) => ({
      scheme: getComputedStyle(document.documentElement).colorScheme,
      looks: sels.map((s) => { const cs = getComputedStyle(document.querySelector(s)); return [s, cs.color, cs.backgroundColor]; })
    }), SELS);
    await page.close();
    return r;
  };
  const light = await read('light');
  const dark = await read('dark');
  expect(light.scheme).toBe('dark');
  expect(light.looks).toEqual(dark.looks);
  expect(light.looks[0][2]).toBe('rgb(5, 4, 3)');
});

// Line 10: the page's own text never drops below 9 px at tablet and desktop widths (390 is unit 01's).
for (const width of [768, 1280]) {
  test(`no HTML text below 9 px at ${width}`, async ({ browser }) => {
    const { page } = await open(browser, width);
    const small = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('svg')) continue;
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (own && el.getClientRects().length && parseFloat(getComputedStyle(el).fontSize) < 9) out.push(el.className || el.tagName);
      }
      return out;
    });
    expect(small).toEqual([]);
    await page.close();
  });
}

// Line 12: the phone graphic check. At 390 × 844 the graphic's labels render at the sizes measured 2026-11-03;
// they must never get smaller (the real-phone read and the fallback decision are Steffen's).
// Keyed by class and text: CHECK is both a hook and a station.
const FLOOR = {
  'v4-tt CLAUDE.md': 9.4, 'v4-lb 17 RULES': 7.5, 'v4-lb DONE CHECKLIST': 7.5,
  'v4-lb HOOKS · AUTOMATIC': 7.5, 'v4-hn GUARD': 7.5, 'v4-hn TIDY-UP': 7.5, 'v4-hn CHECK': 7.5, 'v4-hn MISTAKE LOG': 7.5,
  'v4-cl BLOCKED': 6.6, 'v4-cl RULES': 6.6, 'v4-cl SHIPPED': 6.6,
  'v4-stt PLAN': 9.8, 'v4-stt BUILD': 9.8, 'v4-stt CHECK': 9.8, 'v4-stt REVIEW': 9.8, 'v4-stt SHIP': 9.8,
  'v4-cv 03': 21.6, 'v4-cv 17': 21.6, 'v4-cv 12': 21.6,
  'pop rm -rf data/ · ✗ BLOCKED': 7.7, 'pop ✗ 2 OF 14 FAIL': 7.7, 'pop +1 GUARD': 7.7,
  'pop ✓ 14 OF 14 PASS': 7.7, 'pop ✓ 0 ISSUES': 7.7, 'pop ✓ SHIPPED': 7.7
};
test('the graphic\'s labels at 390 are never smaller than measured', async ({ browser }) => {
  const { page } = await open(browser, 390);
  const got = await page.evaluate(() => {
    const svg = document.querySelector('.fw2');
    const k = svg.getBoundingClientRect().width / 800;
    const out = {};
    for (const t of svg.querySelectorAll('text')) {
      if (!t.getClientRects().length) continue;
      // The pops are scaled up on phones (transform: scale(1.5)), so their own scale counts too.
      const pop = t.closest('.v4-pop');
      const m = pop && getComputedStyle(pop).transform;
      const own = m && m !== 'none' ? new DOMMatrix(m).a : 1;
      const px = Math.round(parseFloat(getComputedStyle(t).fontSize) * k * own * 10) / 10;
      const s = (pop ? 'pop' : t.classList[0]) + ' ' + t.textContent.trim();
      out[s] = s in out ? Math.min(out[s], px) : px;
    }
    return out;
  });
  for (const [label, min] of Object.entries(FLOOR)) {
    expect(got[label], label).toBeGreaterThanOrEqual(min);
  }
  await page.close();
});

// Line 14: one level deep. With each panel open, the only link on the page is that project's demo,
// relative, resolving under /portfolio/, in the same tab (all six since 2026-11-05).
test('the only links are the six demo buttons, relative and under /portfolio/', async ({ browser }) => {
  const { page } = await open(browser, 1280);
  const links = () => page.evaluate(() => [...document.querySelectorAll('a, [href], [onclick], form')].map((a) => ({
    inPanel: !!a.closest('[data-win="pj"] .pinfo'),
    tag: a.tagName.toLowerCase(),
    href: a.getAttribute('href'),
    resolved: a.href,
    target: a.getAttribute('target')
  })).filter((a) => a.tag !== 'link'));
  expect(await links(), 'closed').toEqual([]);
  const demos = [];
  for (const id of IDS) {
    await page.locator(`[data-card="${id}"]`).click();
    await expect(page.locator('[data-win="pj"]')).toBeVisible();
    const l = await links();
    {
      expect(l.length, id).toBe(1);
      expect(l[0].inPanel, id).toBe(true);
      expect(l[0].tag, id).toBe('a');
      expect(l[0].target, id).toBeNull();
      expect(l[0].href, id).toMatch(/^\.\/demos\/[a-z0-9-]+\/index\.html$/);
      expect(l[0].resolved, id).toBe('http://127.0.0.1:4600/portfolio/' + l[0].href.slice(2));
      demos.push(l[0].href);
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-win="pj"]')).toBeHidden();
  }
  expect(new Set(demos).size).toBe(6);
  await page.close();
});
