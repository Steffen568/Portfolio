# STATUS — Portfolio

Ceiling: 60 lines (`scripts/verify.sh`). History goes to `docs/history/` the day it happens. Last updated 2026-11-03.

**2026-11-03: rebuilding on `main` for the one-page redesign** (`handoff-PORTFOLIO-SITE.md`). The three-page terminal site (v1) is frozen on branch `v1-terminal` (tag `v1-terminal-final`); its specs and history are in `docs/history/v1-terminal/`, its code, tests and screenshots only on that branch.

**Finish line:** SCOPE.md §1. Proven when a stranger on their own phone knows who this is in ~3 s and opens a demo in two taps, with no help.

## Where we are
| Phase | State |
|---|---|
| Setup | CLAUDE.md, SCOPE.md, STATUS.md rewritten for the redesign; `specs/portfolio-site.md` and `specs/01-shell-header.md` written 2026-11-03. |
| Units | **Units 01–05 Checked** 2026-11-03 (unit 05 found no page defect; no page file changed). At 1440×900 the header, the environment window and all four sports cards fit (cards end ~832 px). Detail: `docs/history/2026-11-03-unit-0*.md`. |
| Demos | None copied into `demos/` yet: every card shows the striped placeholder. |
| Publish | **Live 2026-11-03: https://steffen568.github.io/portfolio/** (repo `Steffen568/portfolio`, Pages from `main`, root). Live check at 390 and 1280: 200, six cards, no errors or missing files (`screenshots/06-publish/`). The five demo buttons lead to "not found" until the demos are copied in. |

## Units
| # | Unit | Spec | Build | Checked (Rule 15) | Done (stranger's phone) |
|---|---|---|---|---|---|
| 01 | Shell + header | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 20/20; 3 breaks caught) | ✅ 2026-11-03 (review 1: zero lines) | — |
| 02 | Environment graphic | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 42/42; 4 breaks caught) | ✅ 2026-11-03 (review 1: zero lines) | — |
| 03 | Cards + connectors | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 77/77; 6 breaks caught) | ✅ 2026-11-03 (review 4: zero lines) | — |
| 04 | Skills + panel | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 102/102; 3 breaks caught) | ✅ 2026-11-03 (review 1: zero lines) | — |
| 05 | Phone pass + quality standard | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 125/125; 7 breaks caught) | ✅ 2026-11-03 (review 3: zero lines) | — |
| 06 | Publish (GitHub Pages) | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 132/132; 3 breaks caught; live) | ✅ 2026-11-03 (review 2: zero lines) | — |

## Proposed changes (Steffen decides)
1. **Skill buttons below 44 px: decided 2026-11-03, keep the design (32 px desktop, 40 px phones).** Steffen's answer; the named exception to the 44 px rule for this row. Unit 04's spec records it.
2. **Clock at midnight:** shows 00:xx, not the design's 24:xx (Chrome quirk; same fix as v1).
3. **CLOSE ✕ is 44 px tall, not the design's 34 px** (the window's amber bar grows to match). The quality standard says every button ≥ 44 and the handoff names no exception, so the spec won (Rule 7). Say if you prefer the design's 34. Not blocking.
4. **Real screenshots on cards are not wired yet** (no demo exists; the design only draws the placeholder). Whoever copies in the first demo adds `demos/<name>/screenshots/desktop.png` to its card. Not blocking.
5. **Graphic labels on a phone (handoff "Known limit"): read them on a real phone.** At 390 px the graphic draws at 0.47 size: `CLAUDE.md` 9.4 px; `17 RULES`, `DONE CHECKLIST` and the hook names 7.5 px; BLOCKED / RULES / SHIPPED 6.6 px; pop-ups 7.7 px. If they can't be read, the approved phone-only fallback graphic is your call (frozen until you say). Not blocking unit 06.
6. **Design as drawn, for your eye:** the graphic's small subtitles are 7–8.5 px at 768 and 1280 too, and the red "BLOCKED" pop's text just touches its box edges. Left as the design has them.

## Open inputs (SCOPE.md §5)
Name, email and GitHub username supplied 2026-11-03 (STEFFEN GONZALEZ, sgonzalez568@gmail.com, Steffen568). Still open: each demo's folder and `screenshots/desktop.png` · Optometry demo and final copy.

**Tests changed (Rule 13, for Steffen to see):** 2026-11-03, unit 01's header checks expected `[LAST NAME]` / `[YOUR EMAIL]`; they now expect the name and email Steffen supplied (the design file keeps its placeholders). Earlier: unit 01's scanline check compared the overlay with the full window; the reserved scrollbar strip can't be covered, so it now compares with a full-screen fixed layer. The page was not changed. **Unit 02, same cause:** its 390 px full-bleed check first compared with `clientWidth`, which counts that strip (390 vs a usable 375); it now uses the same fixed-layer measurement. Page unchanged. **Unit 03, superseded by unit 04:** its check "a card click opens nothing yet" was written to expire when the panel arrived; it now checks that each click opens only that card's panel (44 px and no-error checks kept).

## Failing checks
None. `npm run verify` 132/132 (1.2 min, over the 60 s target).

## Next
1. Copy in the six demos and wire card screenshots (Steffen asked 2026-11-03); brief in the session notes, `demos-brief.md`. Every demo is already built in its project's `portfolio-demo` folder.
2. The stranger's-phone test on the live link (spec 06 line 10), and the graphic read on a real phone (Proposed change 5).
