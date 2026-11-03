# STATUS — Portfolio

Ceiling: 60 lines (`scripts/verify.sh`). History goes to `docs/history/` the day it happens. Last updated 2026-11-03.

**2026-11-03: rebuilding on `main` for the one-page redesign** (`handoff-PORTFOLIO-SITE.md`). The three-page terminal site (v1) is frozen on branch `v1-terminal` (tag `v1-terminal-final`); its specs and history are in `docs/history/v1-terminal/`, its code, tests and screenshots only on that branch.

**Finish line:** SCOPE.md §1. Proven when a stranger on their own phone knows who this is in ~3 s and opens a demo in two taps, with no help.

## Where we are
| Phase | State |
|---|---|
| Setup | CLAUDE.md, SCOPE.md, STATUS.md rewritten for the redesign; `specs/portfolio-site.md` and `specs/01-shell-header.md` written 2026-11-03. |
| Units | **Units 01, 02 and 03 Checked** 2026-11-03. At 1440×900 the header, the environment window and all four sports cards fit (cards end ~832 px). Detail: `docs/history/2026-11-03-unit-0*.md`. |
| Demos | None copied into `demos/` yet: every card shows the striped placeholder. |
| Publish | Not started (unit 06). |

## Units
| # | Unit | Spec | Build | Checked (Rule 15) | Done (stranger's phone) |
|---|---|---|---|---|---|
| 01 | Shell + header | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 20/20; 3 breaks caught) | ✅ 2026-11-03 (review 1: zero lines) | — |
| 02 | Environment graphic | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 42/42; 4 breaks caught) | ✅ 2026-11-03 (review 1: zero lines) | — |
| 03 | Cards + connectors | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 77/77; 6 breaks caught) | ✅ 2026-11-03 (review 4: zero lines) | — |
| 04 | Skills + panel | — | — | — | — |
| 05 | Phone pass + quality standard | — | — | — | — |
| 06 | Publish (GitHub Pages) | — | — | — | — |

## Proposed changes (Steffen decides)
1. **Skill buttons below 44 px.** The design makes them 32 px on desktop and 40 px on phones; the handoff says "at least 40px" for this row; our rule says 44. Ported as designed for now. Raising them to 44 everywhere would likely wrap the row onto two lines on desktop and push the stage down. Needed before unit 04.
2. **Clock at midnight:** shows 00:xx, not the design's 24:xx (Chrome quirk; same fix as v1).
3. **CLOSE ✕ is 44 px tall, not the design's 34 px** (the window's amber bar grows to match). The quality standard says every button ≥ 44 and the handoff names no exception, so the spec won (Rule 7). Say if you prefer the design's 34. Not blocking.
4. **Real screenshots on cards are not wired yet** (no demo exists; the design only draws the placeholder). Whoever copies in the first demo adds `demos/<name>/screenshots/desktop.png` to its card. Not blocking.

## Open inputs (SCOPE.md §5)
`[LAST NAME]` (header) · `[YOUR EMAIL]` (header, copy button, footer) · GitHub username · each demo's folder and `screenshots/desktop.png` · Optometry demo and final copy.

**Test corrected (Rule 13, for Steffen to see):** unit 01's scanline check compared the overlay with the full window; the reserved scrollbar strip can't be covered, so it now compares with a full-screen fixed layer. The page was not changed. **Unit 02, same cause:** its 390 px full-bleed check first compared with `clientWidth`, which counts that strip (390 vs a usable 375); it now uses the same fixed-layer measurement. Page unchanged.

## Failing checks
None. `npm run verify` 77/77.

## Next
1. **Steffen answers Proposed change 1 (skill button height): unit 04 waits on it.** Also reads `screenshots/01-…`, `02-…`, `03-cards-connectors/`.
2. Unit 04 (skills + panel) in a new session: write `specs/04-skills-panel.md` first.
