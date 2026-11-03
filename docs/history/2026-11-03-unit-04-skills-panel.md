# 2026-11-03 — Unit 04: Skills + panel

**Spec:** `specs/04-skills-panel.md` (11 "Done when" lines), written from the handoff's "Skills" and section 5 and the design.

**Decided before the build (Steffen, 2026-11-03):** skill buttons keep the design's height, 32 px on desktop and 40 px on phones: the one named exception to the 44 px rule (spec line 4).

**Built:** the skills filter: pointing at or focusing a skill turns it amber, the definition line explains it and names the projects that show it, matching cards keep an amber border with that chip filled, the rest dim to 32 %, and their connector lines brighten. A click pins it, a second click unpins it. A card click opens the project panel in unit 02's window: ticker and group, the striped 16:10 placeholder, status, name, line, description, SKILLS SHOWN with every proof line word for word, and OPEN THE WORKING DEMO ▸ (relative link) or DEMO COMING SOON for Optometry. ✕, scrim, Esc and Back close it; the hash names the open project, and a link with `#slate` opens SlateHub. The panel stacks at 640 px. The CSS was copied out of the design by line number with a one-off script. In `site.js` one `paint()` step now sets every card, chip, line and skill class from the state (hovered card, active skill, pinned skill, open panel), replacing unit 03's direct class toggles.

**Deviations (in the spec):** leaving a skill while another is pinned shows the pinned one again (the design keeps showing the last one hovered, against the handoff) · the hash, which the design does not have · the card stays lit while its panel is open · the panel's window sits after the image window in `index.html`.

**Test changed (Rule 13, for Steffen to see):** unit 03's "a click opens nothing yet" was written to expire with this unit. It now checks that each click opens only that card's panel, still with the 44 px and no-error checks.

**Tests:** `tests/skills-panel.spec.mjs`, 25 checks, written first: 21 failed against unit 03's page (the 4 that passed checked things already true: button heights and an unknown hash opening nothing). One of mine first read a button's colour mid-transition; it now waits for the 0.15 s fade and reads once.

**Deliberate breaks, all caught:** the design's own "leave" while pinned (pin test) · no hash-less history entry under a linked panel (Back left the page; hash-link test) · the panel not stacking on phones (CSS-as-written and 390 layout tests).

**Screenshots:** `screenshots/04-skills-panel/`: a pinned skill, the SlateHub and Optometry panels at 390, 768, 1280 and 1440×900, and a hovered skill at 1440×900.

**Rule 15 review:** one round, a fresh agent: zero lines.

`npm run verify` 102/102 (25 of them unit 04's).
