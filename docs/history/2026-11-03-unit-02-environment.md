# 2026-11-03 — Unit 02: Environment graphic

**Spec:** `specs/02-environment.md` (14 "Done when" lines), written from the handoff's section 3 and the design.

**Built:** the environment window in `<main class="stage">` (center column above 1000 px, first and centered below, full-bleed at 640 px and below): the design's SVG character for character, the three tiles, CLAUDE.md ⤢ / BUILDER'S MAP ⤢, the scrim and one image window. The SVG and the CSS were copied out of the design file by line number with a one-off script (not retyped), and the tests compare against the design file directly, so drift fails the build. `site.js` adds the tile spotlight, a reusable window (scrim, focus in, Tab kept inside, ✕ / scrim / Esc, focus back) that unit 04's panel can use as is, and the reduced-motion pause for the dot.

**Deviations (in the spec):** relative image paths, fetched on first open · windows always in the markup and closed with `hidden` (+ a `[hidden]` rule) · CLOSE ✕ 44 px tall, not the design's 34 (quality standard; Proposed change 3) · the dot's SVG motion paused under reduced motion (CSS can't stop it) · focus handling for the dialog · `grid-column:2` places the environment until unit 03 adds the side columns.

**Tests:** `tests/environment.spec.mjs`, 22 checks, written first; all 22 failed against unit 01's page, then all passed. The loop is checked by freezing every animation (CSS and the dot) at nine points of the 14-second cycle and reading what shows: the dot's station, the pops, hook and station colours, the bolt, the log, the new rule, the three counters and the lit tile.

**Test corrected before it passed (Rule 13, for Steffen to see):** the 390 px full-bleed check compared the window's right edge with `clientWidth`, which in this test browser counts the reserved scrollbar strip (390 vs a usable 375). It now measures the usable width with a full-screen fixed layer, the same fix unit 01's scanline test needed. The page was not changed. The image-fit and no-sideways-scroll checks in this file use the same measurement.

**Deliberate breaks, all caught:** the guard pop moved from 18 % to 30 % (CSS-as-written and beat tests) · reduced motion no longer parks the dot (reduced-motion test) · focus not handed back on close (both window tests) · "new guard" changed to "new rule" (copy test).

**Measured:** at 1440×900 the environment window runs from about 277 px to 832 px. Unit 03's four sports cards sit beside it, two per side, and must end by 900 px (the design measured about 889).

**Seen for unit 05 (not changed):** at 390 px the BLOCKED pop, scaled 1.5× as designed, runs to the window's right edge; the SVG labels render small on a phone (the handoff's known limit).

**Rule 15 review:** a fresh agent with the spec, the changed files and the design returned zero lines (review 1). It diffed the SVG and the CSS ranges against the design itself and confirmed the tap test fails without the click handler. `npm run verify` 42/42 after STATUS.md was updated.

**Screenshots:** `screenshots/02-environment/environment-390.png`, `environment-1280.png`, `environment-1440x900.png` (frozen at 20 %: the guard event), `spotlight-self-learning-1280.png`, `window-builders-map-1280.png`, `window-claude-md-390.png`.
