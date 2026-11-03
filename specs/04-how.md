# 04 — How I work

**Depends on:** `specs/01-shell.md`, `specs/02-home.md` (Checked; this unit reuses the drawing engine `mountDrawing`), `specs/03-projects.md`; `specs/portfolio-site.md` (How I work, The drawing engine, Accessibility and motion); from `design/portfolio-design.dc.html`: CSS `.sim`, `.trk`, `.chev`, `.sn`, `.sg`, `.tok`, `.pop`, `.caps`/`.cap`, `.paused`, `.gt`, `.legend`, the window (`.scrim`, `.win-wrap`, `.win`, `.wbody`, `.imgfit`), `.side-col`, `.hw-top`, `.hw2`, `.hw-note`, `.ex`, `.tl-*`, `.pm*` and their keyframes (`tflow`, `fA`, `tok`, `nPlan`…`nNext`, `pG`…`pD`, `c1`…`c8`, `crt`, `ex`, `pm*`) (lines 222–366); the How I work markup inside `<sc-if value="{{PG.how}}">` (lines 890–1050) and the window (lines 1062–1071); `data()` key `X.cm` (line 1103); `togglePause`, `openMap`, `openClaude`, `closeWin`, `simWrap`, `pauseLabel`, `wHead` in `renderVals()`.
**Next:** 05 — Phone pass + quality standard.

Purpose:
The last stop of the finish line: a phone visitor sees the framework every project is built inside — the loop each page goes through, the rules file taken apart part by part, and one real phase of the Builder's Map — and can open both full graphics.

Done when:
1. **Header:** the panel header reads `03 · HOW I WORK<GO>` with the pause/play button on the right; below it `A CUSTOM FRAMEWORK` (VT323) and the design's paragraph. Every visible string on the page matches the design file exactly.
2. **Two graphics, same size:** `THE LOOP · ONCE PER PAGE` and `CLAUDE.md · TAKEN APART` frames have the same width and height (within 0.5 px) at 1280 and 768 px; each is a 30 px bar over an 800 : 460 body. Side by side above 900 px, stacked at 900 and below (the design's `.pduo` rule).
3. **Phone (390 px):** the two graphics stack (loop above). Every text in the loop is at least 9 px and sits inside the loop's box, and no two loop boxes overlap; the small subtitles inside the loop's step boxes may hide. The CLAUDE.md drawing never renders a label below 9 px: below 641 px it keeps its proportions and scrolls sideways inside its own box; the page never scrolls sideways.
4. **The loop runs 16 s and repeats:** a PAGE token travels Plan → Guard (✗ BLOCKED) → Build → Check (✗ 2 OF 14 FAILED, red return line) → Build → Check (✓ 14 OF 14 PASS) → Review (✓ 0 ISSUES) → Done (✓ UPDATED) → Next page, with one caption at a time in the middle in this order: PLAN, GUARD · AUTOMATIC, BUILD, CHECK · AUTOMATIC, FIXED, REVIEW, DONE, NEXT. Every timed part is 16 s, infinite, on the design's keyframes.
5. **Pause / play:** the header button reads `❚❚ PAUSE`; pressing it stops every moving part of the loop at once (token, steps, guard, pop-ups, captions, the flowing track, the red return line) and reads `▶ PLAY`; pressing again resumes from the same point. It is a real button, 44 px tall.
6. **CLAUDE.md drawing, as drawn:** the SVG has the same shapes, positions, texts, inline styles and `aria-label` as the design, in the same order (classes renamed `dg-`), with 7 parts: THE HEADER, RULES 0–12, RULES 13–16, DONE CHECKLIST, HOOKS, CHECK COMMAND, MISTAKE LOG, and the caption `PROMPTS ARE REQUESTS · HOOKS ARE LAW`. Its data is `PORTFOLIO.drawings.cm`, equal to the design's `X.cm` (including `lab: ['STOPS', 'WHEN']`).
7. **Slides apart, keeps moving:** each part's body slides from the closed stack (`ex`, 1.1 s, 0.25 s delay, once) when the page shows; the squares, ticks, flowing lines, ✗/✓ and the tidy-up bar keep animating after.
8. **Shared engine:** hover a part or its legend button → it lights, the rest dim to 30 %, the card shows it; click / tap pins, again unpins; leaving returns to the pin or the overview. The card shows the overview `·` CLAUDE.md with no rows, and for a part only the rows **STOPS** and **WHEN** that have a value (never TAKES IN / DATA IN / RUNS ON). The CLAUDE.md drawing never changes the Home or project drawings, or the reverse.
9. **Under the loop:** the sentence "Each page goes around once: plan, build, check, review, done. The guard and the check run on their own; the AI can’t skip them." and the legend `AUTO` runs on its own · gate diamond gate: someone else says yes. Beside it the CLAUDE.md legend (7 buttons, 44 px) and card.
10. **Builder's Map phase:** the heading `THE BUILDER'S MAP · ONE PHASE: A SENTENCE, CUT INTO FEATURES, EACH BUILT IN A LOOP`, then the map: finish line sentence types in; HOME, YOUR REAL COST, ADMISSIONS, CONTACT appear and STUDENT LIFE · FROZEN slides out; each feature's amber tag goes Spec → Design → Build → Verify → Status with `FEATURE n OF 4`; each drops into BUILT and gets ✓ on the scope list; PROVE IT ✓ PASSED → SHIP ● LIVE → the gate turns green and `↺ NEXT PHASE STARTS WITH A NEW SENTENCE` shows. Every timed part is 20 s, infinite, on one timeline; at the start and in the last moment of each pass the map is empty (no rows, ticks, tags, built slots, PASSED, LIVE, banner; gate unlit), so it loops cleanly.
11. **Map scrolls in its box:** below 980 px of map width the map keeps its 980 px width and scrolls sideways inside its own box; the page never does (390 and 768).
12. **Full graphics:** `FULL CLAUDE.MD GRAPHIC ⤢` opens `assets/claude-md-anatomy.png` and `FULL BUILDER'S MAP ⤢` opens `assets/builders-map.png` in the window (header `THE CLAUDE.MD ANATOMY · FULL GRAPHIC` / `THE BUILDER'S MAP · FULL GRAPHIC`, the design's `alt` texts) over the dark scrim, with the `crt` opening (0.6 s). It closes with `CLOSE ✕`, a click on the scrim, or Esc, and when the page changes. The whole image is on screen with no scrolling inside the window or the page, at 390, 768 and 1280. Focus moves to `CLOSE ✕` on open and back to the opening button on close.
13. **Reduced motion:** nothing on the page animates (window opens without the `crt` effect); every element of the CLAUDE.md drawing is visible except the CHECK row's ✓, which the design hides when still (its ✗ shows); the loop shows its first caption (PLAN) with the token at Plan; the phase map shows its finished state: the full sentence, all four scope rows with ✓, STUDENT LIFE · FROZEN, all four in BUILT, ✓ PASSED, ● LIVE, the gate green and the banner, and no feature tag or counter.
14. No sideways scroll at 390 / 768 / 1280; every button on the page and in the window is at least 44 px tall; zero console errors after using every control; units 01–03 stay green.

Ports from the design:
- CSS: lines 222–281 and 283–366 as written (`.hw-loop` and `.esim` are unused and left out); drawing classes renamed `x` → `dg-x` (`.ex` → `.dg-ex`).
- Markup: the How I work body (lines 892–1048) and the window (lines 1062–1071), `{{…}}` bindings replaced by `data-` hooks; the window sits inside the How I work section; image sources become `assets/builders-map.png` and `assets/claude-md-anatomy.png`.
- Data: `X.cm` → `PORTFOLIO.drawings.cm` (`lab`, `over`, 7 parts; `runs` is `—`).
- Behavior: `togglePause` / `simWrap` / `pauseLabel`; `openMap` / `openClaude` / `closeWin` / `wHead`; the engine's card rows filtered by `lab` (design: `C.rows`).

Deliberate deviations from the design (each required by the handoff or the quality standard):
- The pause button and `CLOSE ✕` are 44 px tall (design 28) — tap rule.
- Pause also stops the loop's flowing track (`.trk .f`), which the design leaves running — "stops every part of it at once".
- The PAGE token rests at Plan (`left 14%; top 24%`) when still; the design leaves it in the top-left corner under reduced motion.
- Phone (≤ 640 px): the loop body is 4 : 5 (the design's own phone rule, which `.hw2 .sim` overrode), step subtitles hide, step and pop-up text tightens (never below 9 px); the CLAUDE.md drawing keeps 848 px (smallest label 9 px) and scrolls in its own box.
- Reduced motion shows the phase map's finished state (the design only covers `.sn`, the first caption and `.rf`).
- The engine's card can list rows from a drawing's own labels (`data-dg-rows`), for STOPS / WHEN.
- Focus moves into the window and back (accessibility; the design has no focus handling).

Must not:
- Rewrite a visible string or add an instruction to the visitor; build a ninth drawing; port `.esim` or the accent option.
- Reuse a short class name inside the CLAUDE.md drawing; use an absolute path; add motion to the top bar.
- Touch Projects or Home content (units 02–03).

How to check:
1. `npx playwright test tests/how.spec.mjs` — written before the build, watched failing.
2. `npm run verify` green, output pasted; screenshots at 390 and 1280 in `screenshots/04-how/`, compared with the design.
3. Fresh-chat review: inputs = this spec + `index.html`, `assets/site.css`, `assets/site.js`, `assets/data.js`, `tests/how.spec.mjs`; output = lines not met.
4. STATUS.md updated; unit flipped to Checked only after step 3 returns zero lines.
