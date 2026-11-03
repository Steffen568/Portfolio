# 05 — Phone pass + quality standard

**Depends on:** units 01–04; `specs/portfolio-site.md`; `handoff-PORTFOLIO-SITE.md` sections "Phone and tablet", "Quality standard: changes from the plan" and "Known limit"; SCOPE.md §6; from `design/portfolio-design.dc.html` the 1000 px and 640 px rules (lines 249–284).
**Next:** 06 — Publish.

Purpose:
"Nothing breaks, and nothing scrolls sideways" (SCOPE.md §1): every line of the quality standard (SCOPE.md §6) is checked at 390, 768 and 1280 px, the phone graphic is measured for the real-phone check, and the proof screenshots are saved.

Done when (each line names the test that guards it; *new* = in `tests/phone-quality.spec.mjs`):
1. **No sideways scroll** at 390, 768 and 1280: on load (unit 01 `no sideways scroll at …`, unit 03 `no sideways scroll with the cards at …`), with a panel open (unit 04 `panel layout at …`), with an image window open (unit 02 `full graphics fit …` at 390, 1280 and 1440; *new* `no sideways scroll with an image window open at …` at 390, 768 and 1280). The skills row scrolls inside its own box on phones (unit 01).
2. **Nothing overflows its box** at 390, 768 and 1280 (*new*): no visible element outside a scrolling box sticks out past the page's usable width; no element with text is cut off (an element that hides its overflow is not wider inside than its box). The design's deliberate bleeds (the skills row and the environment window running to the screen edge at 640 px and below) stay inside the screen.
3. **No overlapping elements** at 390, 768 and 1280 (*new*): the header's blocks, the stage's sections, the cards, each card's thumbnail and body, the tiles and the window buttons don't overlap their neighbours. The connector-line layer is decoration and is excluded.
4. **No font falling back to a default** (unit 01 `tokens on :root, color-scheme dark, both fonts load`).
5. **No broken images, no empty boxes** (*new*): at 390 and 1280 each image window's picture loads (natural width > 0); every visible card, tile, status pill, chip, column heading, button and placeholder thumbnail has text.
6. **Everything meant to be seen is visible on load** (*new*): at 390, 768 and 1280, after the cards' stagger, the header, the environment window, all six cards and the footer are fully opaque and not hidden.
7. **Buttons at least 44 px tall and work by tap** (*new*, at 390, 768 and 1280): every visible button and link (COPY EMAIL, CLAUDE.md ⤢, BUILDER'S MAP ⤢, the six cards, CLOSE ✕, the demo button) and every tile is ≥ 44 px tall, with a panel and an image window opened in turn. **Named exception (Steffen, 2026-11-03):** skill buttons are ≥ 32 px above 640 px and ≥ 40 px at 640 px and below (unit 04 `skill buttons at least …`). Taps: unit 04 `touch: tap pins…`, unit 02 `a tap spotlights a tile…`.
8. **Zero console errors on load and after clicking every button** at 390 (*new*: COPY EMAIL, every skill twice, every tile, both image windows, every card and its CLOSE ✕) and at desktop width (units 01–04's error checks, server and `file://`).
9. **Dark by design, `color-scheme: dark`, readable in light mode** (unit 01 `light-mode phones still get the dark page`; *new*: the same at 390 with a phone's light setting, panel open).
10. **Text never below 9 px** in the page's HTML at 390 (unit 01), 768 and 1280 (*new*). The graphic's SVG labels are the handoff's Known limit (line 12).
11. **The 1440×900 checks:** the 5-second read (unit 01), the whole environment window (unit 02), all four sports cards with left and right edges lined up (unit 03). The 3-second test with a person is a written manual check for Steffen (unit 06's live link).
12. **The phone graphic check (Known limit), measured at 390 × 844:** the SVG draws at 0.469 of its size, so the CLAUDE.md slab labels render at: `CLAUDE.md` 9.4 px, `17 RULES` and `DONE CHECKLIST` 7.5 px (their subtitles are hidden at 640 px and below, as designed). The hook and log names render at 7.5 px, the counter labels at 6.6 px, the pop-ups at 7.7 px (scaled 1.5× on phones); station names 9.8 px, counters 21.6 px. *New* test: these never get smaller than measured. The real-phone read and the decision on the approved fallback graphic are Steffen's (STATUS.md Proposed changes); the fallback is frozen and not built.
13. **Connector lines** land at 1100, 1280 and 1440 and after a resize (unit 03).
14. **One level deep and relative demo links** (*new*): with every panel opened in turn, the only links on the page are the five demo buttons, each `./demos/<name>/index.html` resolving under `/portfolio/` and opening in the same tab; no other element links anywhere. Unit 04 line 7 covers the panel; unit 01 covers "no path starts with /".
15. **Every skill filters the right cards, every pin unpins** (unit 04 `hover previews every skill…`, `every skill pins on click and unpins…`).
16. **Screenshots** at 390, 768, 1280 and 1440×900 in `screenshots/05-phone-quality/` (top of page, the stage, an open panel), looked at beside the design. Written manual check.

Known and accepted (design rules, not defects):
- At 768 px the sports cards keep the 5:2 thumbnail at full column width, so each sports card is tall (unit 03's history).
- Playwright's stitched full-page screenshot drops the website lines below the first screen; screenshots are taken per screen.

Must not:
- Build the phone-only fallback graphic (SCOPE.md §4), resize the graphic's labels, or add anything to it.
- Rewrite a visible string; change units 01–04's tests (Rule 13); use an absolute path; add a framework, build step or third-party script.

How to check:
1. `npx playwright test tests/phone-quality.spec.mjs` — written before any fix, run and the result recorded.
2. `npm run verify` green, output pasted; 2–3 deliberate breaks each caught; screenshots in `screenshots/05-phone-quality/` beside the design.
3. Fresh-chat review: inputs = this spec + `tests/phone-quality.spec.mjs` + any changed page files + the mapped tests; output = lines not met.
4. STATUS.md updated; unit flipped to Checked only after step 3 returns zero lines.
