# 2026-11-03 — Unit 03: Cards + connectors

**Spec:** `specs/03-cards-connectors.md` (14 "Done when" lines), written from the handoff's sections 2 and 4 and the design.

**Built:** the symmetric stage: dashed connector lines (`<svg class="lines">`), Scout Team and The Wire left, the environment in the middle, SlateHub and SCOUT DFS right with the mirrored heading, Holy Cross and Optometry centered below at side-column width. Cards are real buttons built in `site.js` from `window.PORTFOLIO`: striped placeholder (ticker + SCREENSHOT PENDING), name, status pill, one line, skill chips. Hover or focus lifts the card, shows the brackets, OPEN ▸ and the scan sweep, brightens its line and scrambles the name for 380 ms; cards stagger in. The CSS was copied out of the design by line number with a one-off script; `measure()`, `scr()` and the hover state are the design's logic. Unit 02's temporary `grid-column:2` line is gone (the markup order now places the environment).

**Deviations (in the spec):** focus does what hover does · lines measured again as each card lands · no scramble under reduced motion · no unstyled `off` class on unmeasured lines · real screenshots not wired yet (no demo exists).

**Tests:** `tests/cards-connectors.spec.mjs`, 33 checks, written first; all 33 failed against unit 02's page, then all passed. Lines are checked by reading each path's real start and end points against the window and card boxes, at 1100 / 1280 / 1440 px and after resizing.

**Deliberate breaks, all caught (plus two more in review: a 2 s scramble, and the mid-hover resize):** the design's own measuring timing (no re-measure when cards land) leaves lines a few pixels off their cards: 4 line tests failed, which is the evidence for that deviation · hover no longer brightens its line (hover and focus tests) · the right column's stagger restarted at 0 (stagger test) · side cards no longer share the column height (CSS-as-written and three symmetric-stage tests).

**Measured:** at 1440×900 the four sports cards end with the environment window at about 832 px, inside 900.

**Seen, not changed:** Playwright's stitched full-page screenshot drops the website lines below the first screen (they show when the page is actually scrolled or the window is tall), so the 1280 screenshot is one tall window. At 768 px the 5:2 thumbnails at full width make each sports card very tall; that is the design's rule, noted for unit 05.

**Rule 15 review, four rounds, a fresh agent each time:**
1. The scramble test used a retrying check, so a scramble lasting up to ~5 s would pass. It now reads once at 420 ms; a 2 s scramble fails it.
2. Hover on one card plus keyboard focus on another lit both cards and both lines. Now one card is on at a time, as the design's single `hov`. A new test was written first and watched fail.
3. A resize while a card was lifted measured the lift, so the line ended 3 px short once the card settled (the design has the same flaw). `measure()` now takes out the card's current lift. The first version of the new test passed wrongly, because its retrying check caught the card mid-settle. It now waits for the card to settle and reads once, and it failed before the fix.
4. Zero lines.

`npm run verify` 77/77 after the fixes (35 of them unit 03's: the original 33 plus the two review tests).

**Screenshots:** `screenshots/03-cards-connectors/cards-390.png`, `cards-768.png`, `cards-1280.png`, `cards-1440x900.png`, `hover-slatehub-1280.png`.
