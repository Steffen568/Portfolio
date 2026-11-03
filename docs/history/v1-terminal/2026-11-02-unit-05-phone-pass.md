# Unit 05 — Phone pass + quality standard · 2026-11-02

Spec `specs/05-phone-pass.md`. Step 1: six decisions (D1–D6) with 390 px pictures (`screenshots/05-phone-pass/decisions/`). Steffen: "Use all your picks". Tests `tests/phone.spec.mjs` (30) written first; 23 of the first 27 red before any fix (the 4 quality-standard sweeps already passed), then built.

## Build
- **D1 top bar (≤ 600 px):** name + GO on row 1, HOME · PROJECTS · HOW I WORK · CONTACT ↓ on row 2; F1–F4 tags hidden; GO a fixed 128 px so START TOUR / CONTINUE / DONE ✓ never change the height. 184 → 111 px at 390. (On a 360 px phone, or with a long real last name, GO drops to its own row: 3 rows, still the same on every page.)
- **D2 drawings (≤ 640 px):** each drawing in a `.dg-box` that scrolls sideways; min widths Home 601, Scout 686, Holy / Wire / Slate / DFS 655, Optometry 601, CLAUDE.md 848 → smallest word 9 px. Home and CLAUDE.md open centred on their axis (the dotted line through the plates). A legend tap slides its part into view (`bringIntoView`, the box only). Home cartridges: invisible `rect.dg-hit` 60 × 60 units, same centre as the cartridge (≥ 44 px at every width).
- **D4 loop:** `--uP … --uN` (half each stop's height, set by a ResizeObserver) lift the PAGE token onto each stop's top edge in `@keyframes tok`; phone pop-ups `width:max-content` → two lines.
- **D5:** on every project selection the cartridge row slides so the selected one is in view.
- **D6:** Home "HOSTING" x 540 → 558; Optometry "the doctor" y 44 → 26; "NEXT PHASE ↺" shifted 8 px right of its return line.

## Deliberate breaks (13, each caught, then restored byte-for-byte)
F-tags shown · GO moved off row 1 · Home width removed · Scout width 600 · tap areas `fill:none` · CLAUDE.md not centred · legend tap not scrolling · token vars off · pop-ups 3 lines · row not following · HOSTING back · "the doctor" back · NEXT PHASE back on its line.

## Earlier tests changed (Rule 13; each line commented "spec 05")
- `tests/home.spec.mjs`: "as drawn" ignores `.dg-hit` and expects HOSTING at x 558; "Home fits" allows the drawing to scroll in its box at ≤ 640 px.
- `tests/projects.spec.mjs`: "as drawn" expects "the doctor" at y 26; "same size" at 390 now expects the drawing frame taller (handoff's check is 1280 and 768).
- `tests/how.spec.mjs`: the loop helper reports the stop whose top edge the token rides on (was: the token's centre).

## Found while measuring, not changed
- 1280: the "✗ 2 OF 14 FAILED" pop-up sits just above the token at Check (touching, no words overlap).
- 768 (tablet): CLAUDE.md words render 7.5 px (accepted with desktop's 6.4 px under D2).

## Reviews
1. Fresh agent: zero lines (ran the full suite, 127 passed; checked each D1–D6 change against the spec and the design file).

## Verify
`npm run verify`: 127 passed (30 phone + 97 earlier), ALL GREEN.
- One run of four had unit 04's "pause stops the whole loop" fail: all 23 paused animations read 0.03 ms later on the second look. 30 of 30 alone; the next full verify green (127). Logged in STATUS for Steffen; test unchanged (Rule 13).
