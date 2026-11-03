# 02 — Drawing engine + Home

**Depends on:** `specs/01-shell.md` (Checked); `specs/portfolio-site.md` (Home, The drawing engine, Accessibility and motion); from `design/portfolio-design.dc.html`: CSS `.hero`, `.kv`, `.det`, `.io`, `.lg`, `.lgb` and the "exploded drawings" block (lines 61–62, 81–154); the Home markup (lines 394–466); `data()` key `X.hero` (lines 1097–1102); the hover / pin / legend / detail-card logic in `renderVals()` (lines 1243–1283) and `R.<id>.open` (cartridges).
**Next:** 03 — Projects (reuses this engine for six drawings).

Purpose:
The first thing a phone visitor sees: who Steffen is, and the portfolio drawn as four parts they can light up one at a time, with a way into each of the six projects. The engine built here runs all eight drawings.

Done when:
1. Home shows, from the design: the hero drawing (four plates), the legend, the name `STEFFEN` / `[LAST NAME]` in VT323, the headline "I build the framework the AI works inside.", the bio paragraph, buttons SEE THE 6 PROJECTS ▸ and HOW I WORK, the rows BASED Temple, TX · BUILDS Websites · data tools · DEMOS 6 · real data, frozen, and the detail card (TAKES IN / GIVES OUT / RUNS ON). Every string matches the design file exactly.
2. The hero SVG is ported as drawn: the same shapes, positions, texts, inline styles and `aria-label` as the design, in the same order. Its data (`over` + 4 parts) is `PORTFOLIO.drawings.hero` in `assets/data.js`.
3. On load, with nothing hovered or pinned, every part is at full opacity and the card shows the overview (`·` THE PORTFOLIO).
4. **Hover a part (or its legend button):** that part turns amber (its label and number amber), the other parts dim to 30 %, and the card shows that part's name, text and three rows. **Hovering a dimmed part lights it** (the design-round bug).
5. **Click or tap a part, or its legend button:** pins it. Click or tap it again: unpins. On a touch screen a tap is the hover.
6. **Leave the drawing (or a legend button):** it returns to the pinned part if one is pinned, otherwise to the overview card with no part dimmed.
7. Legend buttons are real `<button>`s: reachable by keyboard (Tab) and work with Enter / Space, at least 44 px tall at 390 / 768 / 1280, the active one amber, the pinned one with the ring (`aria-pressed="true"`).
8. Each of the six cartridges SCTM HCRS WIRE SLTH OPTO SDFS opens its project (`#projects/scout`, `holy`, `wire`, `slate`, `optom`, `dfs`) and does not pin part 2 on the way.
9. SEE THE 6 PROJECTS ▸ opens `#projects/<current project>` (`scout` on a fresh load); HOW I WORK opens `#how`.
10. The drawing animations play on load and keep running (`.dg-sq` steps, cartridges float, the loop ring turns).
11. **Reduced motion:** nothing animates and every part of the drawing is visible at full opacity.
12. **One engine, namespaced:** one shared drawing engine in `assets/site.js` drives any `svg[data-dg]` with up to 8 parts from `PORTFOLIO.drawings`; every class inside a drawing and every engine state class starts with `dg-` (no `.on`, `.dim`, `.bar`, `.big` inside drawings).
13. No sideways scroll on Home at 390 / 768 / 1280 (the hero stacks below 1000 px); zero console errors after hovering, pinning and clicking everything on Home; unit 01's checks stay green.

Ports from the design:
- CSS: `.hero` (+ its 1000 px query), `.kv`, `.det`, `.io`, `.lg`, `.lgb`, the whole exploded-drawings block (shared by units 03–04), each drawing class renamed `x` → `dg-x`; the reduced-motion `.rf` → `.dg-rf`.
- Markup: the Home body (lines 397–464) as written, with `{{…}}` bindings replaced by `data-` hooks.
- Data: `X.hero` (`over` + 4 parts), with the design's `—` for empty fields.
- Behavior: `hv` / `lv` / `pk` / `K` / `L` / `C` from `renderVals()`; `R.<id>.open` (stop the click, open the project).

Deliberate deviations from the design (each required by the handoff or the quality standard):
- Legend buttons `min-height` 34 → 44.
- Drawing and engine state classes prefixed `dg-` (`.pt` → `.dg-pt`, `.on` → `.dg-on`, `.dim` → `.dg-dim`, `.lgb.pin` → `.lgb.dg-pin`, …).
- Legend buttons carry `aria-pressed` (pinned or not) so the pinned ring is also announced.
- Unit 01's "bodies empty until units 2–4" check now covers Projects and How I work only (Home has its body).

Must not:
- Rewrite a visible string or add an instruction to the visitor ("hover a part", "tap a cartridge").
- Build one template drawing; port the hero exactly; add a drawing beyond the eight.
- Reuse a short class name inside a drawing; use an absolute path; add motion to the top bar.
- Build Projects or How I work content (units 03–04).

How to check:
1. `npx playwright test tests/home.spec.mjs` — written before the build, watched failing.
2. `npm run verify` green, output pasted; screenshots at 390 and 1280 in `screenshots/02-home/`, compared with the design.
3. Fresh-chat review: inputs = this spec + `index.html`, `assets/site.css`, `assets/site.js`, `assets/data.js`, `tests/home.spec.mjs`; output = lines not met.
4. STATUS.md updated; unit flipped to Checked only after step 3 returns zero lines.
