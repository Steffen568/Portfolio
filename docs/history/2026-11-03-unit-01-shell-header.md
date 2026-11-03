# 2026-11-03 — Unit 01: Shell + header (one-page redesign)

**Setup the same day:** v1 (three-page terminal site) retired from `main`; it stays whole on branch `v1-terminal`. Its specs and history moved to `docs/history/v1-terminal/`; its tests and screenshots removed from `main` (still on the branch). CLAUDE.md, SCOPE.md, STATUS.md rewritten for the redesign; `specs/portfolio-site.md` and `specs/01-shell-header.md` written from `handoff-PORTFOLIO-SITE.md`.

**Built:** `index.html`, `assets/site.css` (design CSS for tokens, base, header, skills row, footer, phone rules, reduced motion), `assets/site.js` (clock, copy email, skills row from data), `assets/data.js` (generated from the design's `skillList()` / `projects()`, value for value).

**Tests:** `tests/shell-header.spec.mjs`, 20 checks, written first; 18 failed against the old v1 page, then all 20 passed. Two tests read the design file directly (copy and data), so drift from the design fails the build.

**Deliberate breaks, all caught:** a changed bio word (copy test) · the clock without `hourCycle: 'h23'` (midnight test) · the phone skills row allowed to wrap (390 test).

**Test corrected before the build passed (Rule 13, for Steffen to see):** the scanline check first compared the overlay with the full window width; `scrollbar-gutter: stable` (Principle 6) reserves a 15 px strip no fixed layer can cover, so it now compares with a full-screen fixed probe. The overlay itself was never changed.

**Measured:** at 1440×900 the header ends at 261 px (budget for unit 03: environment window + four sports cards in the remaining ~640 px). At 390 the header ends at 494 px.

**Screenshots:** `screenshots/01-shell-header/header-390.png`, `header-1280.png`, `header-1440.png`.
