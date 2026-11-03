# STATUS — Portfolio

Ceiling: 60 lines (`scripts/verify.sh`). History goes to `docs/history/` the day it happens. Last updated 2026-11-03.

**2026-11-03: rebuilding on `main` for the one-page redesign** (`handoff-PORTFOLIO-SITE.md`). The three-page terminal site (v1) is frozen on branch `v1-terminal` (tag `v1-terminal-final`); its specs and history are in `docs/history/v1-terminal/`, its code, tests and screenshots only on that branch.

**Finish line:** SCOPE.md §1. Proven when a stranger on their own phone knows who this is in ~3 s and opens a demo in two taps, with no help.

## Where we are
| Phase | State |
|---|---|
| Setup | CLAUDE.md, SCOPE.md, STATUS.md rewritten for the redesign; `specs/portfolio-site.md` and `specs/01-shell-header.md` written 2026-11-03. |
| Units | **Units 01–04 Checked** 2026-11-03. At 1440×900 the header, the environment window and all four sports cards fit (cards end ~832 px). Detail: `docs/history/2026-11-03-unit-0*.md`. |
| Demos | None copied into `demos/` yet: every card shows the striped placeholder. |
| Publish | Not started (unit 06). |

## Units
| # | Unit | Spec | Build | Checked (Rule 15) | Done (stranger's phone) |
|---|---|---|---|---|---|
| 01 | Shell + header | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 20/20; 3 breaks caught) | ✅ 2026-11-03 (review 1: zero lines) | — |
| 02 | Environment graphic | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 42/42; 4 breaks caught) | ✅ 2026-11-03 (review 1: zero lines) | — |
| 03 | Cards + connectors | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 77/77; 6 breaks caught) | ✅ 2026-11-03 (review 4: zero lines) | — |
| 04 | Skills + panel | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 102/102; 3 breaks caught) | ✅ 2026-11-03 (review 1: zero lines) | — |
| 05 | Phone pass + quality standard | — | — | — | — |
| 06 | Publish (GitHub Pages) | — | — | — | — |

## Proposed changes (Steffen decides)
1. **Skill buttons below 44 px: decided 2026-11-03, keep the design (32 px desktop, 40 px phones).** Steffen's answer; the named exception to the 44 px rule for this row. Unit 04's spec records it.
2. **Clock at midnight:** shows 00:xx, not the design's 24:xx (Chrome quirk; same fix as v1).
3. **CLOSE ✕ is 44 px tall, not the design's 34 px** (the window's amber bar grows to match). The quality standard says every button ≥ 44 and the handoff names no exception, so the spec won (Rule 7). Say if you prefer the design's 34. Not blocking.
4. **Real screenshots on cards are not wired yet** (no demo exists; the design only draws the placeholder). Whoever copies in the first demo adds `demos/<name>/screenshots/desktop.png` to its card. Not blocking.

## Open inputs (SCOPE.md §5)
`[LAST NAME]` (header) · `[YOUR EMAIL]` (header, copy button, footer) · GitHub username · each demo's folder and `screenshots/desktop.png` · Optometry demo and final copy.

**Test corrected (Rule 13, for Steffen to see):** unit 01's scanline check compared the overlay with the full window; the reserved scrollbar strip can't be covered, so it now compares with a full-screen fixed layer. The page was not changed. **Unit 02, same cause:** its 390 px full-bleed check first compared with `clientWidth`, which counts that strip (390 vs a usable 375); it now uses the same fixed-layer measurement. Page unchanged. **Unit 03, superseded by unit 04:** its check "a card click opens nothing yet" was written to expire when the panel arrived; it now checks that each click opens only that card's panel (44 px and no-error checks kept).

## Failing checks
None. `npm run verify` 102/102.

## Next
1. Steffen reads `screenshots/01-…` to `04-skills-panel/`.
2. Unit 05 (phone pass + quality standard) in a new session: write `specs/05-phone-quality.md` first.
