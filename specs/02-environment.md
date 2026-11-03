# 02 — Environment graphic

**Depends on:** unit 01 (shell + header); `specs/portfolio-site.md`; from `design/portfolio-design.dc.html`: the `<style>` lines 68 (`.stage`), 72 (`@keyframes dflow`), 116–223 (`.eng`, `.fwin*`, `.e-btns`, `.fw2`, every `.v4-*`, `.ex`, the keyframes `k0`–`k4`, `hk0`–`hk2`, `bolt4`, `mist4`, `logf4`, `rown`, `newr`, `z1`–`z6`, `cBa`…`cSb`, the spotlight rules, the 640 px graphic rules, `.trio`, `.tri`, `tp`/`ts`/`te`), 228–239 and 247 (`.scrim`, `.win-wrap`, `.win`, `.win.img`, `@keyframes crt`, `.wh`, `.x`, `.wb`, `.imgfit`), and the environment parts of the 1000 px and 640 px rules (251, 253–254, 272–273, 280–282); the markup `<section class="eng">` (window header, the inline SVG, the three tiles, the two buttons), the scrim and the image window; `fx`, `openClaude`, `openMap`, `close`, `imgHead` and the Esc handler from the script.
**Next:** 03 — Cards + connectors.

Purpose:
The centerpiece (SCOPE.md §1): in a few seconds a stranger sees that Steffen builds a protected, self-improving environment — the guard blocks a risky move, a mistake becomes a new rule, the work ships — and can open the two full graphics behind it.

Done when:
1. The SVG in `index.html` is the design's SVG character for character, with one change: `class="{{fxCls}}"` becomes `class="fw2"`.
2. Every CSS line listed under "Depends on" appears in `assets/site.css` as written in the design.
3. The window reads, word for word from the design: `THE ENVIRONMENT` · `every project is built inside it`; the tiles `PROTECTS` "Guards block risky moves before they run.", `EFFICIENT` "Every feature runs the same loop to ship.", `SELF-LEARNING` "Every mistake becomes a new guard."; the buttons `CLAUDE.md ⤢` and `BUILDER’S MAP ⤢`.
4. **One 14-second loop, all three events:** every timed animation in the graphic and the tiles lasts 14 s and repeats forever, and the travelling dot's motion lasts 14 s. Frozen at points in the cycle, the graphic shows the handoff's table: 20 % dot at BUILD, red bolt drawn, GUARD red, "rm -rf data/ · ✗ BLOCKED" showing, PROTECTS tile lit; 36 % dot at CHECK, CHECK hook and station red, "✗ 2 OF 14 FAIL", SELF-LEARNING lit; 44 % mistake log red with its new red row; 50 % new yellow rule in the slot, "+1 GUARD", dot back at BUILD, TIDY-UP lit; 59 % CHECK green, "✓ 14 OF 14 PASS", EFFICIENT lit; 71 % dot at REVIEW, REVIEW green, "✓ 0 ISSUES"; 84 % dot at SHIP, SHIP green, "✓ SHIPPED"; 3 % dot parked at PLAN with no pop showing; 99.5 % everything reset.
5. **The counters tick:** BLOCKED reads 03 before 18 % and 04 after; RULES 17 before 46 % and 18 after; SHIPPED 12 before 82 % and 13 after; all three read their first values again at 99.5 %.
6. **Reduced motion shows a still, complete graphic:** no CSS animation runs, the dot's motion is paused at the start (parked under PLAN), every slab, hook, the log, all five stations and the three counters are visible, the counters show 03 / 17 / 12, no pop and no bolt shows, and the tiles still read as text.
7. **Spotlight:** pointing at a tile puts `fx-p` / `fx-e` / `fx-s` on the SVG (Protects dims everything but the hooks; Efficient dims everything but the loop; Self-learning dims everything but the mistake log and the rule slot, to 0.2); moving off clears it. On a touch screen a tap sets it and stays; tapping another tile switches it.
8. **Full-graphic windows:** `CLAUDE.md ⤢` opens a dialog titled `THE CLAUDE.MD ANATOMY` showing `./assets/claude-md-anatomy.png`; `BUILDER’S MAP ⤢` opens `THE BUILDER’S MAP` showing `./assets/builders-map.png`; both with the design's alt text, over the scrim. Focus moves to `CLOSE ✕`; Tab stays inside the window; ✕, a click on the scrim, and Esc each close it, set `hidden` again, clear the scrim and put focus back on the button that opened it.
9. **The image fits with no scrolling** at 390×844, 1280×800 and 1440×900: the whole image is inside the viewport and the window body does not scroll.
10. **Closed means hidden:** on load every window has the `hidden` attribute and is not displayed, and the scrim catches no clicks.
11. **Reusable window:** the scrim, open, close, Esc, focus-in, focus-back and Tab-trap code takes any `.win-wrap`, so unit 04's panel reuses it without a copy (manual check: read `assets/site.js`).
12. **Placement:** the environment sits in `<main class="stage">`. Above 1000 px it is in the center column (centered in the stage, 440–580 px wide). At 1000 px and below it is first in the stage, up to 620 px wide and centered. At 640 px and below it is full-bleed (edge to edge, no side borders), the window header's subtitle and the graphic's small labels (station and slab subtitles, "NEXT FEATURE") are hidden, and station names are 21 px, layer and hook names 16 px, counters 46 px.
13. **At 1440×900, the whole environment window is visible without scrolling** (the four sports cards are unit 03's half of this check).
14. Both window buttons are at least 44 px tall, and so is `CLOSE ✕` (see deviations). Zero console errors on load, over the server and by double-click, after opening and closing both windows and tapping every tile. Unit 01's checks still pass.

Ports from the design:
- CSS: the lines under "Depends on", as written.
- Markup: `<section class="eng">` with its SVG, tiles and buttons into `<main class="stage">`; the scrim and one image window after `.wrap`.
- Behavior: `fx` (pointer enter / leave / click on the tiles), `openClaude` / `openMap` / `close`, the Esc key; the window titles from `imgHead`.

Deliberate deviations from the design:
- Image `src` is relative (`./assets/claude-md-anatomy.png`, `./assets/builders-map.png`), not the design's `/_blob/…`. The image is fetched when its window first opens (`data-src`), so a phone doesn't download 1.5 MB it may never show.
- Windows are always in the markup and closed with the `hidden` attribute (the design creates them on open). A `[hidden]{display:none !important}` rule backs this up, because `.win-wrap` and `.imgfit` set their own `display`.
- `CLOSE ✕` is 44 px tall, not the design's 34 px: the quality standard says every button is at least 44 px and the handoff names no exception for it (Rule 7: the spec wins on behavior). The window's header bar grows to match. Logged in STATUS.md Proposed changes.
- Under reduced motion the dot's motion (SVG `animateMotion`, which CSS can't stop) is paused at the start in `site.js`; the design's reduced-motion rule only stops CSS animation.
- Focus moves into the window and Tab is kept inside it (the handoff's dialog rule; the design has no focus handling).
- Until unit 03 adds the side columns, the environment is placed in the center column with `grid-column:2` above 1000 px. Unit 03 may keep or remove that line.
- The `.stage` grid rules (68, 251, 273) are ported now so the environment has its column; the cards, side columns, websites row and connector lines are unit 03.

Known limit (unit 05): at 390 px the SVG is drawn at about half size, so its labels render below 9 px on screen even though their CSS size is larger. The handoff names this; the real-phone check and the approved fallback (ask Steffen first) belong to unit 05.

Must not:
- Build the cards, the side columns, the websites row or the connector lines (unit 03), the skills filter or the project panel (unit 04).
- Add anything to the environment graphic or change its numbers; rewrite a visible string.
- Build the phone-only fallback graphic (frozen until Steffen says so).
- Use an absolute path; add a framework, a build step or a third-party script.
- Change unit 01's tests.

How to check:
1. `npx playwright test tests/environment.spec.mjs` — written before the build, watched failing.
2. `npm run verify` green, output pasted; screenshots at 390, 1280 and 1440×900 (plus one with a window open) in `screenshots/02-environment/`, beside the design.
3. Fresh-chat review: inputs = this spec + `index.html`, `assets/site.css`, `assets/site.js`, `tests/environment.spec.mjs` + the design file as reference; output = lines not met.
4. STATUS.md updated; unit flipped to Checked only after step 3 returns zero lines.
