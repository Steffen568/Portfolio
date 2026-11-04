# STATUS — Portfolio

Ceiling: 60 lines (`scripts/verify.sh`). History goes to `docs/history/` the day it happens. Last updated 2026-11-03.

**2026-11-03: rebuilding on `main` for the one-page redesign** (`handoff-PORTFOLIO-SITE.md`). The three-page terminal site (v1) is frozen on branch `v1-terminal` (tag `v1-terminal-final`); its specs and history are in `docs/history/v1-terminal/`, its code, tests and screenshots only on that branch.

**Finish line:** SCOPE.md §1. Proven when a stranger on their own phone knows who this is in ~3 s and opens a demo in two taps, with no help.

## Where we are
| Phase | State |
|---|---|
| Setup | CLAUDE.md, SCOPE.md, STATUS.md rewritten for the redesign; `specs/portfolio-site.md` and `specs/01-shell-header.md` written 2026-11-03. |
| Units | **Units 01–05 Checked** 2026-11-03 (unit 05 found no page defect; no page file changed). At 1440×900 the header, the environment window and all four sports cards fit (cards end ~832 px). Detail: `docs/history/2026-11-03-unit-0*.md`. |
| Demos | **All six copied in 2026-11-03** (unit 07), byte for byte from each project's `portfolio-demo` folder; every card and panel shows the real screenshot. Five demo buttons work; Optometry still says DEMO COMING SOON (your call, Proposed change 7). Pushed 2026-11-03. |
| Publish | **Live 2026-11-03: https://steffen568.github.io/portfolio/** (repo `Steffen568/portfolio`, Pages from `main`, root). Live check at 390 and 1280: 200, six cards, no errors or missing files (`screenshots/06-publish/`). **Live recheck 2026-11-03 after the demos push: all pass** at 390 and 1280: page 200, no errors, six real screenshots; the five demo buttons each open their demo under `/portfolio/demos/` with no errors or missing files; Optometry still DEMO COMING SOON (`screenshots/2026-11-03-live-recheck/`, `docs/history/2026-11-03-live-recheck.md`). |

## Units
| # | Unit | Spec | Build | Checked (Rule 15) | Done (stranger's phone) |
|---|---|---|---|---|---|
| 01 | Shell + header | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 20/20; 3 breaks caught) | ✅ 2026-11-03 (review 1: zero lines) | — |
| 02 | Environment graphic | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 42/42; 4 breaks caught) | ✅ 2026-11-03 (review 1: zero lines) | — |
| 03 | Cards + connectors | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 77/77; 6 breaks caught) | ✅ 2026-11-03 (review 4: zero lines) | — |
| 04 | Skills + panel | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 102/102; 3 breaks caught) | ✅ 2026-11-03 (review 1: zero lines) | — |
| 05 | Phone pass + quality standard | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 125/125; 7 breaks caught) | ✅ 2026-11-03 (review 3: zero lines) | — |
| 06 | Publish (GitHub Pages) | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 132/132; 3 breaks caught; live) | ✅ 2026-11-03 (review 2: zero lines) | — |
| 07 | Demos + screenshots | ✅ 2026-11-03 | ✅ 2026-11-03 (verify 155/155; 3 breaks caught) | ✅ 2026-11-03 (review 3: zero lines) | — |

## Proposed changes (Steffen decides)
1. **Skill buttons below 44 px: decided 2026-11-03, keep the design (32 px desktop, 40 px phones).** Steffen's answer; the named exception to the 44 px rule for this row. Unit 04's spec records it.
2. **Clock at midnight:** shows 00:xx, not the design's 24:xx (Chrome quirk; same fix as v1).
3. **CLOSE ✕ is 44 px tall, not the design's 34 px** (the window's amber bar grows to match). The quality standard says every button ≥ 44 and the handoff names no exception, so the spec won (Rule 7). Say if you prefer the design's 34. Not blocking.
4. **Real screenshots on cards: done 2026-11-03 (unit 07)**, laid over the placeholder, which shows if a picture fails.
5. **Graphic labels on a phone (handoff "Known limit"): read them on a real phone.** At 390 px the graphic draws at 0.47 size: `CLAUDE.md` 9.4 px; `17 RULES`, `DONE CHECKLIST` and the hook names 7.5 px; BLOCKED / RULES / SHIPPED 6.6 px; pop-ups 7.7 px. If they can't be read, the approved phone-only fallback graphic is your call (frozen until you say). Not blocking unit 06.
6. **Design as drawn, for your eye:** the graphic's small subtitles are 7–8.5 px at 768 and 1280 too, and the red "BLOCKED" pop's text just touches its box edges. Left as the design has them.
7. **Optometry demo: turn it on?** Its demo is built and copied in (its screenshot shows), but the button still says DEMO COMING SOON and its line, description and proof are the old ones. Turning it on is your call; its `DEMO_CARD.md` has new wording if you want it.
8. **One unit 06 test changed (Rule 13): approved by Steffen 2026-11-03.** the secrets check matched compressed demo code (`password:!0`, `accessToken:null`), not secrets. It now skips those empties and catches a few forms it used to miss. Spec 07 line 8 has the detail; if you say no, it is reverted and the demos wait.
9. **Wire card reworded, and its demo replaced (Steffen, 2026-11-03).** New demo from CFB_HUB `77c4996`: the Black Board added, slate DraftKings Main, Nov 7, 2026, twelve games. The line and description now follow Steffen's angle (a ready-made research report instead of spreadsheets and filters). The design file keeps its old words, so the three copy tests read `tests/copy-changes.mjs`, the one list of copy changes made after the design (a Rule 13 test change made at Steffen's request). Screenshots: `screenshots/2026-11-03-wire-copy/`.

10. **Scout DFS demo: team logos and jersey numbers added (Steffen, 2026-11-04)**, to match the real app: logos on the game chips, pool rows and lineup cards; a `#` column in the pool (3 players with no number in the real app either show —). Made in `SCOUT_DFS/portfolio-demo` (not committed there) and copied in, so the byte-for-byte check holds. Three logos (Liberty, Missouri State, Sam Houston) downloaded from collegefootballdata's CDN with Steffen's OK.
11. **Scout Team demo replaced (Steffen, 2026-11-04):** copied in from CFB_HUB `4c24474`, Ohio State at Michigan, Nov 29, 2025 (finished 2025 season). The card's last sentence now reads "Demo: Ohio State at Michigan, Nov 29, 2025." (Steffen's OK; logged in `tests/copy-changes.mjs`, the rest of the card unchanged).

12. **Cards load small pictures (Steffen, 2026-11-04: the page was very slow on a phone).** Cards now show a 960×600 top crop of each demo's screenshot (`assets/thumbs/*.webp`, 36–78 KB each): 4.2 MB → 0.33 MB, same crop on screen. The panel still shows the full screenshot. Two unit 07 checks now expect the small pictures, plus a new one capping a phone's picture download at 600 KB (Rule 13 change approved by Steffen). No loading animation (his call). Screenshots: `screenshots/2026-11-04-card-thumbs/`.

## Open inputs (SCOPE.md §5)
Name, email and GitHub username supplied 2026-11-03 (STEFFEN GONZALEZ, sgonzalez568@gmail.com, Steffen568). Still open: Optometry demo on/off and its final copy (Proposed change 7).

**Tests changed (Rule 13, for Steffen to see):** 2026-11-03, unit 01's header checks expected `[LAST NAME]` / `[YOUR EMAIL]`; they now expect the name and email Steffen supplied (the design file keeps its placeholders). Earlier: unit 01's scanline check compared the overlay with the full window; the reserved scrollbar strip can't be covered, so it now compares with a full-screen fixed layer. The page was not changed. **Unit 02, same cause:** its 390 px full-bleed check first compared with `clientWidth`, which counts that strip (390 vs a usable 375); it now uses the same fixed-layer measurement. Page unchanged. **Unit 03, superseded by unit 04:** its check "a card click opens nothing yet" was written to expire when the panel arrived; it now checks that each click opens only that card's panel (44 px and no-error checks kept).

## Failing checks
None. `npm run verify` 156/156 on 2026-11-04 after the cards moved to small pictures (Proposed change 12).

## Next
1. ~~Live recheck of the site and each demo~~ done 2026-11-03, all pass (not yet committed).
2. **Steffen, in person:** the stranger's-phone test on the live link (spec 06 line 10), and the graphic read on a real phone (Proposed change 5).
