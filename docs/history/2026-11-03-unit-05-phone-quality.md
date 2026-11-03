# 2026-11-03 — Unit 05: Phone pass + quality standard

**Spec:** `specs/05-phone-quality.md` (16 "Done when" lines), one per line of SCOPE.md §6 and the handoff's added checks. Each line names the test that guards it: 10 lines were already covered by units 01–04 and are mapped, not repeated; the gaps got new tests.

**Tests:** `tests/phone-quality.spec.mjs`, 23 checks at 390, 768 and 1280: with an image window open the page never scrolls sideways and the window stays inside the screen; nothing sticks out past the page or cuts its text off; neighbouring blocks never overlap; image windows load their pictures and no card, tile, pill, chip, heading or button is empty; everything is fully visible once the cards have staggered in; every button, link and tile ≥ 44 px (skill buttons are the named exception) on the page, with a panel and with an image window open; zero console errors after clicking every button on a phone; a light-mode phone gets the same colours as a dark one, panel open; no HTML text below 9 px at 768 and 1280; the graphic's labels at 390 never smaller than measured; the only links are the five demo buttons, relative, under `/portfolio/`, same tab.

**Honest result:** written first, the new checks found nothing wrong with the page. The three first-run failures were my own test mistakes ("CHECK" is both a hook and a station name; a cancelled animation aborted a wait), fixed in the test before any page change. **No page file changed in this unit.**

**Deliberate breaks, all caught:** footer text forced onto one line (overflow test: "span spans 14–558 of 390") · tiles pulled 40 px up over the graphic (overlap test) · COPY EMAIL shrunk to 36 px (44 px test) · cards stuck at half opacity (visible-on-load test) · an outside link added to the footer (links test) · the pop-ups' phone scale removed (label-size test) · an image window wider than the screen (image-window test; its first version missed this, since a floating window never makes the page scroll, so it now checks the window's edges too). Files restored after each.

**The phone graphic check (handoff "Known limit"), measured at 390 × 844:** the graphic draws at 0.469 of its size. Slab labels: `CLAUDE.md` 9.4 px, `17 RULES` and `DONE CHECKLIST` 7.5 px (their subtitles hidden, as designed). Hook and log names 7.5 px, counter labels (BLOCKED / RULES / SHIPPED) 6.6 px, pop-ups 7.7 px (scaled 1.5× on phones); station names 9.8 px, counters 21.6 px. All but `CLAUDE.md` and the station names are under the 9 px floor. Flagged for Steffen's real-phone read (STATUS.md Proposed changes); the fallback graphic is frozen and was not built.

**Also seen, design as drawn:** at 768 and 1280 the graphic's small subtitles render at 7.2–8.5 px (the 9 px floor was only ever checked on HTML text). The red "rm -rf data/ · ✗ BLOCKED" pop's text is 0.6 px wider than its box at every width (same markup and CSS as the design). At 768 the sports cards are tall (5:2 thumbnails at full width; unit 03).

**Screenshots:** `screenshots/05-phone-quality/`: top, stage, websites and the SlateHub panel at 390 × 844, 768 × 1024 and 1280 × 800; top and panel at 1440 × 900. Looked at beside the design.

**Rule 15 review:** three rounds, a new agent each. Round 1: the pop-up size was wrong (5.2 px; the 1.5× phone scale makes it 7.7) and the label test skipped the pops: fixed. Round 2: nothing checked 768 with an image window open: test added. Round 3: zero lines.

`npm run verify` 125/125 (23 of them unit 05's), 1.2 min (over the 60 s target).
