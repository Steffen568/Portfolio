// Unit 04 — Skills + panel. Each test names the spec line it guards (specs/04-skills-panel.md).
import { test, expect } from '@playwright/test';
import { withCopyChanges } from './copy-changes.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DESIGN = readFileSync(join(process.cwd(), 'design', 'portfolio-design.dc.html'), 'utf8');
const DLINES = DESIGN.split(/\r?\n/);
const LINE_ORDER = ['holy', 'optom', 'scout', 'wire', 'slate', 'dfs'];

// The design's own data, read straight from its script, so filters and panels can never drift from it.
function designData() {
  const src = DESIGN.split(/<script type="text\/x-dc"[^>]*>/)[1].split('</script>')[0];
  const Component = new Function('DCLogic', src + '\nreturn Component;')(class {});
  const c = new Component();
  return { skills: c.skillList(), projects: withCopyChanges(c.projects()) };
}
const { skills: SKILLS, projects: PROJECTS } = designData();
const has = (p, k) => p.skills.some((x) => x[0] === k);
const LABEL = Object.fromEntries(SKILLS.map((k) => [k.id, k.label]));

// What the page should show for one active skill (the design's card() classes, LC, skDefName / skDef).
function expected(k) {
  if (!k) return { on: [], def: '8 SKILLS ACROSS 6 PROJECTS', hit: [], dim: [], chips: [], lines: [] };
  const sk = SKILLS.find((x) => x.id === k);
  const hit = PROJECTS.filter((p) => has(p, k)).map((p) => p.id);
  return {
    on: [k],
    def: sk.label + ': ' + sk.def + ' Shown in ' + PROJECTS.filter((p) => has(p, k)).map((p) => p.name).join(', ') + '.',
    hit: [...hit].sort(),
    dim: PROJECTS.filter((p) => !has(p, k)).map((p) => p.id).sort(),
    chips: [...hit].sort().map((id) => id + ':' + LABEL[k]),
    lines: [...hit].sort()
  };
}

// The filter as the page shows it right now (read once; nothing here waits on a transition).
function shown(page) {
  return page.evaluate((order) => {
    const ids = (sel) => [...document.querySelectorAll(sel)].map((c) => c.dataset.card).sort();
    return {
      on: [...document.querySelectorAll('.skl .sk.on')].map((b) => b.dataset.skill),
      def: document.querySelector('.skl-def').textContent.replace(/\s+/g, ' ').trim(),
      hit: ids('.card.hit'),
      dim: ids('.card.dim'),
      chips: [...document.querySelectorAll('.card .chip.on')].map((c) => c.closest('.card').dataset.card + ':' + c.textContent).sort(),
      lines: [...document.querySelectorAll('svg.lines .ln')].map((l, i) => l.classList.contains('on') ? order[i] : null).filter(Boolean).sort()
    };
  }, LINE_ORDER);
}

function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}
const usableWidth = () => {
  const p = document.body.appendChild(Object.assign(document.createElement('div'), { style: 'position:fixed;inset:0' }));
  const w = p.getBoundingClientRect().width;
  p.remove();
  return w;
};
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
const skill = (page, id) => page.locator('.skl .sk[data-skill="' + id + '"]');
const away = (page) => page.mouse.move(2, 2);
const panel = (page) => page.locator('.win-wrap:not([hidden]) [role="dialog"]');

// Ports: the skills and panel CSS lines are the design's, as written.
test('the skills and panel CSS lines are in site.css as written', () => {
  const css = readFileSync(join('assets', 'site.css'), 'utf8').split(/\r?\n/).map((l) => l.trim());
  const missing = [];
  for (const [a, b] of [[58, 65], [240, 246], [270, 271]]) for (let n = a; n <= b; n++) {
    const l = DLINES[n - 1].trim();
    if (l && !css.includes(l)) missing.push(n + ': ' + l.slice(0, 80));
  }
  expect(missing).toEqual([]);
});

// Line 1 + 2: hover previews each skill's filter exactly as the design computes it; leaving clears it.
test('hover previews every skill and leaving clears it', async ({ browser }) => {
  const page = await open(browser, 1280);
  expect(await shown(page)).toEqual(expected(''));
  for (const k of SKILLS) {
    await skill(page, k.id).hover();
    expect(await shown(page), k.label).toEqual(expected(k.id));
    const dimOpacity = await page.$$eval('.card.dim', (els) => els.map((e) => getComputedStyle(e).opacity));
    for (const o of dimOpacity) expect(o, k.label + ' dim').toBe('0.32');
    // read once after the button's 0.15 s colour transition ends
    const bg = await skill(page, k.id).evaluate(async (b) => {
      await Promise.all(b.getAnimations().map((a) => a.finished.catch(() => {})));
      return getComputedStyle(b).backgroundColor;
    });
    expect(bg, k.label + ' amber').toBe('rgb(255, 160, 40)');
    await away(page);
    expect(await shown(page), k.label + ' after leave').toEqual(expected(''));
  }
  await page.close();
});

// Line 1 + 2: keyboard focus previews the same filter; blur clears it.
test('focus previews a skill and blur clears it', async ({ browser }) => {
  const page = await open(browser, 1280);
  for (const k of ['db', 'opt']) {
    await skill(page, k).focus();
    expect(await shown(page)).toEqual(expected(k));
    await page.evaluate(() => document.activeElement.blur());
    expect(await shown(page)).toEqual(expected(''));
  }
  await page.close();
});

// Line 3: a click pins every skill (it survives leave and blur); clicking it again unpins it.
test('every skill pins on click and unpins on a second click', async ({ browser }) => {
  const page = await open(browser, 1280);
  for (const k of SKILLS) {
    await skill(page, k.id).click();
    await away(page);
    await page.evaluate(() => document.activeElement.blur());
    expect(await shown(page), k.label + ' pinned').toEqual(expected(k.id));
    await skill(page, k.id).click();
    await away(page);
    await page.evaluate(() => document.activeElement.blur());
    expect(await shown(page), k.label + ' unpinned').toEqual(expected(''));
  }
  await page.close();
});

// Line 2 + 3: the pin moves to another skill; previewing another shows it, leaving it shows the pin again.
test('pinned: another click moves the pin; hovering another previews it, leaving returns to the pin', async ({ browser }) => {
  const page = await open(browser, 1280);
  await skill(page, 'api').click();
  await skill(page, 'viz').hover();
  expect(await shown(page)).toEqual(expected('viz'));
  await away(page);
  await page.evaluate(() => document.activeElement.blur());
  expect(await shown(page)).toEqual(expected('api'));
  await skill(page, 'web').click();
  await away(page);
  await page.evaluate(() => document.activeElement.blur());
  expect(await shown(page)).toEqual(expected('web'));
  await page.close();
});

// Line 3: on a phone a tap pins and a second tap unpins.
test('touch: tap pins a skill, a second tap unpins it', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto('./');
  await settle(page);
  await skill(page, 'scrape').tap();
  expect(await shown(page)).toEqual(expected('scrape'));
  await page.locator('.hd-name').tap();
  expect(await shown(page)).toEqual(expected('scrape'));
  await skill(page, 'scrape').tap();
  expect(await shown(page)).toEqual(expected(''));
  await ctx.close();
});

// Line 4: the named exception: 32 px above 640, 40 px at 640 and below.
for (const [width, min] of [[1280, 32], [768, 32], [390, 40]]) {
  test(`skill buttons at least ${min} px tall at ${width}`, async ({ browser }) => {
    const page = await open(browser, width);
    const hs = await page.$$eval('.skl .sk', (els) => els.map((b) => b.getBoundingClientRect().height));
    expect(hs).toHaveLength(8);
    for (const h of hs) expect(h).toBeGreaterThanOrEqual(min);
    await page.close();
  });
}

// Lines 5–8: every card opens its own panel with the design's words, its demo button, and ✕ closes it.
for (const p of PROJECTS) {
  test(`${p.name}: card opens its panel, word for word; ✕ closes it`, async ({ browser }) => {
    const page = await open(browser, 1280);
    const errors = trackErrors(page);
    const card = page.locator('[data-card="' + p.id + '"]');
    await card.click();
    const dlg = panel(page);
    await expect(dlg).toHaveCount(1);
    const r = await dlg.evaluate((d, id) => {
      const q = (s) => d.querySelector(s);
      const demo = q('.pinfo a.btn.green'), none = q('.pinfo button.btn[disabled]');
      const thumb = q('.pthumb').getBoundingClientRect();
      return {
        modal: d.getAttribute('aria-modal'), name: d.getAttribute('aria-label'),
        head: q('.wh b').textContent, close: q('.wh .x').textContent,
        tkr: q('.pthumb b').textContent, shot: q('.pthumb span').textContent, ratio: +(thumb.width / thumb.height).toFixed(2),
        stripes: getComputedStyle(q('.pthumb')).backgroundImage.includes('repeating-linear-gradient'),
        st: q('.pinfo .st').className, status: q('.pinfo .st').textContent,
        h2: q('.pinfo h2').textContent, vt: getComputedStyle(q('.pinfo h2')).fontFamily.includes('VT323'),
        one: q('.pinfo .one').textContent, what: q('.pinfo p').textContent,
        lbl: q('.proof .lbl').textContent,
        proof: [...d.querySelectorAll('.proof .pf')].map((f) => [f.querySelector('.chip.on').textContent, f.querySelector('span:last-child').textContent]),
        demo: demo && { text: demo.textContent, href: demo.getAttribute('href'), h: demo.getBoundingClientRect().height, bg: getComputedStyle(demo).backgroundColor },
        none: none && { text: none.textContent, h: none.getBoundingClientRect().height },
        links: d.querySelectorAll('a[href]').length,
        wins: document.querySelectorAll('.win-wrap:not([hidden])').length,
        scrim: document.querySelector('[data-scrim]').classList.contains('on'),
        cardOn: document.querySelector('[data-card="' + id + '"]').classList.contains('on'),
        lineOn: document.querySelectorAll('svg.lines .ln')[['holy', 'optom', 'scout', 'wire', 'slate', 'dfs'].indexOf(id)].classList.contains('on'),
        hash: location.hash
      };
    }, p.id);
    expect(r).toEqual({
      modal: 'true', name: p.name,
      head: p.tkr + ' · ' + (p.group === 'web' ? 'WEBSITE' : 'SPORTS DATA TOOL'), close: 'CLOSE ✕',
      tkr: p.tkr, shot: 'SCREENSHOT PENDING', ratio: 1.6, stripes: true,
      st: 'st' + (p.wip ? ' wip' : ''), status: p.status,
      h2: p.name.toUpperCase(), vt: true, one: p.line, what: p.what,
      lbl: 'SKILLS SHOWN',
      proof: p.skills.map((x) => [LABEL[x[0]], x[1]]),
      demo: p.demo ? { text: 'OPEN THE WORKING DEMO ▸', href: './' + p.path + 'index.html', h: expect.any(Number), bg: 'rgb(124, 196, 106)' } : null,
      none: p.demo ? null : { text: 'DEMO COMING SOON', h: expect.any(Number) },
      links: p.demo ? 1 : 0,
      wins: 1, scrim: true, cardOn: true, lineOn: true, hash: '#' + p.id
    });
    expect((r.demo || r.none).h).toBeGreaterThanOrEqual(52);
    await expect(dlg.getByRole('button', { name: 'Close' })).toBeFocused();
    await dlg.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('.win-wrap:not([hidden])')).toHaveCount(0);
    await expect(page.locator('[data-scrim]')).not.toHaveClass(/\bon\b/);
    await expect(card).toBeFocused();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('');
    expect(errors).toEqual([]);
    await page.close();
  });
}

// Line 8: the scrim and Esc close it too; focus starts on ✕, Tab stays inside, focus returns to the card.
test('scrim and Esc close the panel; Tab stays inside', async ({ browser }) => {
  const page = await open(browser, 1280);
  const card = page.locator('[data-card="slate"]');
  for (const how of ['scrim', 'esc']) {
    await card.click();
    const dlg = panel(page);
    await expect(dlg).toHaveCount(1);
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement.closest('.win-wrap:not([hidden])'))).toBe(true);
    }
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => !!document.activeElement.closest('.win-wrap:not([hidden])'))).toBe(true);
    if (how === 'scrim') await page.mouse.click(4, 4);
    else await page.keyboard.press('Escape');
    await expect(page.locator('.win-wrap:not([hidden])')).toHaveCount(0);
    await expect(card).toBeFocused();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('');
  }
  await page.close();
});

// Line 9: Back closes an opened panel and leaves the page where it was.
test('Back closes the panel', async ({ browser }) => {
  const page = await open(browser, 1280);
  const base = page.url();
  await page.locator('[data-card="wire"]').click();
  await expect(panel(page)).toHaveCount(1);
  expect(page.url()).toBe(base + '#wire');
  await page.goBack();
  await expect(page.locator('.win-wrap:not([hidden])')).toHaveCount(0);
  expect(page.url()).toBe(base);
  await expect(page.locator('.card')).toHaveCount(6);
  await page.close();
});

// Line 9: a link with a hash opens that panel on load; Back closes it and stays on the page.
test('loading #slate opens SlateHub; Back closes it and stays on the page', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = trackErrors(page);
  await page.goto('./#slate');
  await expect(page.getByRole('dialog', { name: 'SlateHub' })).toBeVisible();
  await page.goBack();
  await expect(page.locator('.win-wrap:not([hidden])')).toHaveCount(0);
  expect(new URL(page.url()).pathname).toBe('/portfolio/');
  expect(new URL(page.url()).hash).toBe('');
  await expect(page.locator('.card')).toHaveCount(6);
  expect(errors).toEqual([]);
  await page.close();
});

test('an unknown hash opens nothing and logs no error', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = trackErrors(page);
  await page.goto('./#nope');
  await settle(page);
  await expect(page.locator('.win-wrap:not([hidden])')).toHaveCount(0);
  expect(errors).toEqual([]);
  await page.close();
});

// Line 9: works by double-click too.
test('file://: a card opens its panel with a hash, Esc closes it, #dfs opens on load', async ({ page }) => {
  const errors = trackErrors(page);
  const url = pathToFileURL(join(process.cwd(), 'index.html')).href;
  await page.goto(url);
  await expect(page.locator('.card')).toHaveCount(6);
  await page.locator('[data-card="holy"]').click();
  await expect(page.getByRole('dialog', { name: 'Holy Cross' })).toBeVisible();
  expect(await page.evaluate(() => location.hash)).toBe('#holy');
  await page.keyboard.press('Escape');
  await expect(page.locator('.win-wrap:not([hidden])')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('');
  await page.goto(url + '#dfs');
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'SCOUT DFS' })).toBeVisible();
  expect(errors).toEqual([]);
});

// Line 10: the panel stacks at 640 and below; side by side above; it fits and nothing scrolls sideways.
for (const [width, height] of [[390, 844], [768, 1024], [1280, 800]]) {
  test(`panel layout at ${width}`, async ({ browser }) => {
    const page = await open(browser, width, height);
    await page.locator('[data-card="slate"]').click();
    const dlg = panel(page);
    await expect(dlg).toHaveCount(1);
    await dlg.evaluate((d) => Promise.all(d.getAnimations().map((a) => a.finished.catch(() => {}))));
    const r = await dlg.evaluate((d) => {
      const t = d.querySelector('.pthumb').getBoundingClientRect(), i = d.querySelector('.pinfo').getBoundingClientRect();
      const f = d.querySelector('.pf'), c = f.querySelector('.chip').getBoundingClientRect(), s = f.querySelector('span:last-child').getBoundingClientRect();
      const w = d.getBoundingClientRect();
      return {
        stacked: t.bottom <= i.top + 0.5, beside: t.right <= i.left + 0.5,
        chipAbove: c.bottom <= s.top + 0.5, h2: getComputedStyle(d.querySelector('.pinfo h2')).fontSize,
        fits: w.top >= -0.5 && w.bottom <= innerHeight + 0.5 && w.left >= -0.5 && w.right <= innerWidth + 0.5,
        doc: document.documentElement.scrollWidth
      };
    });
    const small = width <= 640;
    expect(r.stacked).toBe(small);
    expect(r.beside).toBe(!small);
    expect(r.chipAbove).toBe(small);
    expect(r.h2).toBe(small ? '38px' : '46px');
    expect(r.fits).toBe(true);
    expect(r.doc).toBeLessThanOrEqual(await page.evaluate(usableWidth));
    await page.close();
  });
}

// Line 11: every skill and every card click, opened and closed, with zero console errors.
test('every skill and card click is error-free', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = trackErrors(page);
  await page.goto('./');
  await settle(page);
  for (const b of await page.locator('.skl .sk').all()) { await b.click(); await b.click(); }
  for (const id of LINE_ORDER) {
    await page.locator('[data-card="' + id + '"]').click();
    await expect(panel(page)).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('.win-wrap:not([hidden])')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
  await page.close();
});

// Line 11: reduced motion: the panel opens with no animation.
test('reduced motion: the panel opens still', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await page.goto('./');
  await page.locator('[data-card="scout"]').click();
  await expect(panel(page)).toHaveCount(1);
  expect(await panel(page).evaluate((d) => d.getAnimations({ subtree: true }).length)).toBe(0);
  await page.close();
});
