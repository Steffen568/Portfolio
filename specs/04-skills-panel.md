# 04 — Skills + panel

**Depends on:** units 01–03; `specs/portfolio-site.md`; from `design/portfolio-design.dc.html`: the `<style>` lines 58–65 (`.chip.on`, `.card.dim`, `.card.hit`, `.proof`, `.pf` and its 640 px rule), 240–246 (`.pgrid`, `.pthumb`, `.pinfo`) and the 640 px panel rules 270–271; the panel markup inside `<sc-if value="{{isProj}}">` (lines 420–442); in the script, `H.sk` (on / off / tap), `H.open`, `H.close`, the `card()` classes (`on`, `hit`, `dim`, chip `on`), `LC` (line `.on`), `skDefName` / `skDef` and `pj`.
**Next:** 05 — Phone pass + quality standard.

Purpose:
"One tap opens any project, and one more opens its working demo" (SCOPE.md §1), and the skills row shows which of the six projects prove each skill.

Done when:
1. **Hover or focus a skill button** previews its filter: the button is amber (`.on`); the definition line reads the skill's label + `:` in bold, then its definition and `Shown in <names>.` (project names in the design's order, joined by `, `); every card with that skill gets `.hit` (amber border) and the chip for that skill fills (`.chip.on`); every other card gets `.dim` (opacity 0.32); the connector lines of the matching cards get `.on` and the others don't. All of it from `window.PORTFOLIO`, for each of the 8 skills.
2. **Leave or blur** clears the preview: no `.on` skill, no `.hit` / `.dim` card, no filled chip, no skill-lit line, definition line back to `8 SKILLS ACROSS 6 PROJECTS`. If a skill is pinned, leaving any skill shows the pinned skill again.
3. **Tap or click pins:** after a click the filter stays when the pointer leaves and focus moves away. **Tap the same skill again to unpin:** the filter clears. Clicking a different skill moves the pin to it. Every one of the 8 pins and unpins. Works with touch (tap = enter, leave, click).
4. **Skill button height (named exception, Steffen 2026-11-03):** skill buttons keep the design's height, at least 32 px above 640 px and at least 40 px at 640 px and below. This is the one exception to the 44 px rule; every other button in this unit is ≥ 44 px.
5. **A card click opens its panel:** the panel window (`role="dialog"`, `aria-modal="true"`, named the project name) shows over the scrim with the CRT open; the card stays `.on` and its line `.on` while it is open. One panel at a time.
6. **Panel content, word for word from `window.PORTFOLIO`:** the header bar reads `TICKER · WEBSITE` (websites) or `TICKER · SPORTS DATA TOOL` (sports tools) with CLOSE ✕; a 16:10 screenshot placeholder (striped, ticker + `SCREENSHOT PENDING`); the status pill (orange `.wip` for Optometry); the name upper-cased in VT323 (`h2.vt`); the one line; the description; `SKILLS SHOWN` with one row per skill in the project's order: a filled chip with the skill's label and its proof line, word for word.
7. **Demo button:** `OPEN THE WORKING DEMO ▸`, a green link at least 52 px tall to `./demos/<name>/index.html` (relative, from the project's `path`) for the five projects with a demo; `DEMO COMING SOON`, a disabled button at least 52 px tall, for Optometry. Nothing else in the panel opens anything (one level deep).
8. **Close:** CLOSE ✕, a click on the scrim and Esc each close the panel; focus moves to CLOSE ✕ on open and back to the card on close; Tab stays inside the panel.
9. **Hash:** opening a panel sets the URL hash to the project id (`#slate`); Back closes the panel and clears the hash; closing with ✕ / scrim / Esc clears the hash too. Loading the page with a project's hash opens that panel, and Back then closes it (the page stays). An unknown hash opens nothing and logs no error. Works over the server and by double-click (`file://`).
10. **At 640 px and below** the panel stacks: screenshot above, details below; the name is 38 px; each proof row puts the chip above its text. Above 640 px the screenshot is left of the details. No sideways scroll with the panel open at 390, 768 and 1280; the panel fits the screen and scrolls inside itself.
11. **No regressions:** zero console errors on load and after every skill and card click; units 01–03's checks still pass (with the one superseded unit 03 line below); reduced motion: the panel opens with no animation.

Ports from the design:
- CSS: lines 58–65, 240–246 and 270–271 as written.
- Markup: the panel's `win-wrap` / `win` / `wh` / `wb` / `pgrid` / `pinfo` / `proof` structure (lines 421–441), with empty slots filled by `site.js`.
- Behavior: `H.sk` on / off / tap, the `card()` classes and `LC`, `skDefName` / `skDef`, `H.open` / `H.close` and the `pj` values (`group` → WEBSITE / SPORTS DATA TOOL, `nameUp`, `href = './' + path + 'index.html'`).

Deliberate deviations from the design:
- Leaving a skill while another is pinned shows the pinned skill again. The design leaves the last hovered skill showing (its `off` does nothing while anything is pinned), which contradicts the handoff's "leave: the filter clears, unless it was pinned".
- The panel reuses unit 02's window (`showWin` / `closeWin`): CLOSE ✕ is 44 px (STATUS.md Proposed change 3), Tab is trapped, focus returns to the card.
- The panel's `win-wrap` sits after the image window's in `index.html` (the design has it first); the two never show together, so nothing visible changes, and unit 02's close check keeps pointing at the image window.
- Hash: the design has none. The handoff asks for it. Opening pushes one history entry (`#id`); ✕ / scrim / Esc step back over it; Back closes. A page loaded with `#id` first puts a hash-less entry under it, so Back closes the panel instead of leaving the site.
- The card stays `.on` while its panel is open (the design lights only its line).
- The real screenshot is still the placeholder (no demo exists; STATUS.md Proposed change 4).

Supersedes: unit 03's line 13 "clicking one opens nothing yet (the panel is unit 04)". Its test now checks the 44 px height and that each click opens only that card's panel, with no errors (STATUS.md logs the change for Steffen).

Must not:
- Add a skill, rewrite a visible string or proof line, show a guessed screenshot, or put a tool or brand name on a card.
- Nest anything deeper than card → panel → demo, or use the hash for anything but naming an open panel.
- Use an absolute path; add a framework, a build step or a third-party script.
- Change units 01–03's tests beyond the superseded line above.

How to check:
1. `npx playwright test tests/skills-panel.spec.mjs` — written before the build, watched failing.
2. `npm run verify` green, output pasted; screenshots at 390, 768, 1280 and 1440×900 in `screenshots/04-skills-panel/` (a previewed skill, a pinned skill, an open panel), beside the design.
3. Fresh-chat review: inputs = this spec + `index.html`, `assets/site.css`, `assets/site.js`, `tests/skills-panel.spec.mjs` (+ the changed unit 03 test) + the design file as reference; output = lines not met.
4. STATUS.md updated; unit flipped to Checked only after step 3 returns zero lines.
