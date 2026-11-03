# STATUS — Portfolio

Ceiling: 60 lines (`scripts/verify.sh`). History goes to `docs/history/` the day it happens. Last updated 2026-11-03.

**2026-11-03: this terminal design (v1) is frozen** on branch `v1-terminal` (tag `v1-terminal-final`); Steffen is replacing it with a new design, built on `main`. Its open calls (tablet text, the pause test, unit 06) wait unless v1 is revived.

**Finish line:** SCOPE.md §1. Proven when a stranger moves through all three pages and opens a demo on their own phone, with no help.

## Where we are
| Phase | State |
|---|---|
| Setup | CLAUDE.md, SCOPE.md, STATUS.md, `specs/portfolio-site.md`, `specs/01-shell.md` written 2026-11-02 from the plan, the site handoff and the AEC template. |
| Units | **Units 01–05 Checked.** Unit 05 phone pass built 2026-11-02 with Steffen's picks D1–D6: `npm run verify` 127 passed (30 phone + 97 earlier); 13 deliberate breaks all caught; review 1 zero lines. Next: unit 06. |
| Demos | None copied into `demos/` yet: every project shows the striped screenshot placeholder, and its demo link leads nowhere until its folder arrives. |
| Publish | Not started. No git repository yet (unit 06 creates it). |

## Units
| # | Unit | Spec | Build | Checked (Rule 15) | Done (stranger's phone) |
|---|---|---|---|---|---|
| 01 | Shell: bar, routing, footer, F4, clock, boot, scanlines | ✅ | ✅ 2026-11-02 | ✅ 2026-11-02 (accepted after review 4) | — |
| 02 | Drawing engine + Home | ✅ | ✅ 2026-11-02 | ✅ 2026-11-02 (review 4: zero lines) | — |
| 03 | Projects: cycle, six drawings, screenshot frame, previous / next, GO tour | ✅ | ✅ 2026-11-02 | ✅ 2026-11-02 (review 3: zero lines) | — |
| 04 | How I work: loop + pause, CLAUDE.md drawing, Builder's Map phase, full-graphic windows | ✅ | ✅ 2026-11-02 | ✅ 2026-11-02 (review 1: zero lines) | — |
| 05 | Phone pass + quality standard (D1–D6 per Steffen) | ✅ 2026-11-02 | ✅ 2026-11-02 | ✅ 2026-11-02 (review 1: zero lines) | — |
| 06 | Publish (GitHub Pages) | — | — | — | — |

Check lists, reviews and deliberate breaks: `docs/history/2026-11-02-unit-0N-*.md` (01–05). Screenshots: `screenshots/phone.png`, `screenshots/desktop.png`, every page × 390 / 768 / 1280 and both windows in `screenshots/05-phone-pass/`.

**Earlier tests changed (Rule 13, for Steffen to see):** `tests/shell.spec.mjs` — unit 03: Projects header reads `VIEWED 1/6`; unit 04: How's header lookup narrowed, "bodies empty" retired. Unit 05 (your D2/D4/D6 picks): Home and Optometry "as drawn" checks allow the moved words and invisible tap areas; at 390 the drawing frames scroll and are taller than the screenshot frame; the loop check reads the token on a stop's top edge. Detail: unit-05 history.

## Quality standard, unit 05 (390 / 768 / 1280, every page, every project, both windows; all automated in `tests/phone.spec.mjs`)
PASS: no sideways page scroll · nothing spills (wide things scroll in their own box: drawings on phones, project row, phase map) · fonts load (Plex Mono, VT323) · no broken image or empty box · buttons, tabs and keys ≥ 44 px, tap works · zero console errors after every key, tab and button · `color-scheme: dark`, light-mode phone shows the same dark site · only one page ever showing · links relative · no two words overlap (all D6 fixed) · loop token clear of every step's words · UI text ≥ 9 px · drawing words ≥ 9 px at 390.
ACCEPTED by Steffen (D2 desktop): drawing words ~8 px on Projects at 1280 and 6.4 px CLAUDE.md at 1280. **Needs your OK:** CLAUDE.md at 768 (tablet) is 7.5 px — I treated it like desktop.

## Proposed changes (Steffen decides)
1. Top-bar keys raised from 38 to 44 px and the footer button from 40 to 44 px (tap rule). Phone layout decided in unit 05 (D1).
2. The clock uses a 00–23 hour (the design's setting shows midnight as "24:xx" in Chrome).
3. Legend buttons raised from 34 to 44 px (spec 02, from the handoff). Drawing classes renamed `dg-` (handoff).
4–5, 7, 10, 14. **Decided 2026-11-02 (unit 05, D1–D6, "use all your picks"):** see `specs/05-phone-pass.md`; built and tested.
6. Under reduced motion Home's page lines and hosting arrows stay at the design's dim 0.3. Ported as drawn.
8. **"6 PROJECTS" font:** the handoff says VT323; the design sets it in the body font (IBM Plex Mono). Ported as the design (Rule 7: design wins on look).
9. **Screenshots switch on per project:** a project's `shot` in `assets/data.js` is set to true when its demo and `screenshots/desktop.png` are copied in. Asking for a missing picture would log a console error, so nothing is requested until then.
11. Under reduced motion the SCOUT DFS "✓ VALID" badge shows (the design hides it; the handoff says every part is visible).
12. **How I work (spec 04 deviations):** pause and CLOSE ✕ are 44 px (design 28), so How's amber header is taller than the other pages'; pause also stops the flowing track; the PAGE token rests at Plan when still; reduced motion shows the phase map finished. On phones (≤ 640 px) the loop is 4:5, step subtitles hide, pop-ups wrap.
13. **Copy conflict:** the handoff says no "taken apart" in visible text, yet names the frame `CLAUDE.md · TAKEN APART` (also the design's text). Ported as the design.
15. Under reduced motion the CLAUDE.md CHECK hook shows its ✗ (the design hides the ✓ when still).
16. **New, from unit 05:** on a 360 px phone (or with a long real last name) the GO key drops to its own row, so the bar is 3 rows there (same on every page). At 1280 the "✗ 2 OF 14 FAILED" pop-up sits just above the PAGE token at Check (touching; no words overlap).

## Open inputs (SCOPE.md §5)
`[LAST NAME]` (top bar, Home title) · `[YOUR EMAIL]` (footer, copy button) · GitHub username · Optometry demo + drawing · each demo's folder and `screenshots/desktop.png`.

## Failing checks
None failing. **Flaky once:** unit 04's "pause stops the whole loop" failed 1 of 4 full runs (2026-11-02, unit 05): all 23 paused animations read 0.03 ms later on the second look (the browser settling the pause a frame late under load); 30 of 30 alone, and the next full run green. Rule 13: the test is unchanged; your call whether it may allow a sub-millisecond settle. Not yet set up: the Stop hook that runs verify before a session ends (needs git to tell whether code changed; add in unit 06).

## Next
1. Steffen reads the screenshots in `screenshots/05-phone-pass/` and answers the 768 px CLAUDE.md question. Then unit 06 (publish).
2. When a demo is copied in: set its `shot: true` in `assets/data.js`, check its card text against `DEMO_CARD.md`, run verify.
