# 05 — Phone pass + quality standard

**Depends on:** `specs/01-shell.md` … `specs/04-how.md` (all Checked); `SCOPE.md` §6; `00-PORTFOLIO-PLAN.md` "Quality standard"; `handoff-PORTFOLIO-SITE.md` "Quality standard: change from the plan"; STATUS.md Proposed changes 1, 4, 5, 7, 10, 12, 14.
**Next:** 06 — Publish.

Purpose:
The finish line's last clause: on a stranger's phone (and on a tablet and a desktop) nothing overlaps, nothing breaks, nothing scrolls sideways, and every word can be read.

## Steffen's answers (2026-11-02): "Use all your picks"

D1-A · D2-A (phones) + D2-A (desktop: accept) · D3-A · D4-A · D5-A · D6-A. How they're built, and what they change in earlier checks:
- **D1:** at 600 px and below, the name and the GO key share row 1 and HOME · PROJECTS · HOW I WORK · CONTACT ↓ share row 2; the yellow F1–F4 tags hide; the GO key keeps a fixed width so its label (START TOUR / CONTINUE / DONE ✓) never changes the bar's height.
- **D2 (phones, ≤ 640 px):** each drawing gets the width its smallest word needs for 9 px (Home 601, Scout Team 686, Holy Cross / The Wire / SlateHub / SCOUT DFS 655, Optometry 601, CLAUDE.md 848) and scrolls in its own box. Home and CLAUDE.md open centred on their stack of plates (my call: the plates' labels sit in the middle); the project drawings open at the left, where part 1 starts. Tapping a legend button slides its part into view. Each Home cartridge gets an invisible 60 × 60-unit tap area (`.dg-hit`, ≥ 44 px at every width) centred on it, so its float animation is unchanged.
- **D2 consequence (Rule 13, earlier tests changed, logged in STATUS):** at 390 a project's drawing frame is now taller than its screenshot frame (the handoff's "same size" check is 1280 and 768; spec 03 had added 390), and Home's drawing no longer fits inside the screen at 390 (it scrolls in its box). The "ported as drawn" checks allow exactly the `.dg-hit` areas and the D6 word moves.
- **Not covered by D2, accepted with the desktop (flagged for Steffen):** at 768 (tablet) CLAUDE.md renders 7.5 px, like desktop.
- **D4:** the PAGE square rides on the top edge of the step's box at every width; on phones pop-ups wrap to at most two lines inside the loop's box.
- **D6:** the moved words: Home "HOSTING" label; Optometry "the doctor" lifted above its neighbours; "NEXT PHASE ↺" lifted off its line.

## Decisions needed (Steffen answers before anything visible changes)

Measured 2026-11-02 at 390 px (a common phone), 768 (tablet) and 1280 (desktop). Pictures of today's 390 px state are in `screenshots/05-phone-pass/decisions/`. Each item: what's wrong, the options, my pick.

**D1 — The top bar is too tall on a phone.** At 390 px it is 184 px tall: the name, then five keys wrapping onto three rows. It stays pinned to the top, so it covers about a fifth of the screen on every page. (768: 84 px; 1280: 61 px.) Picture: `d1-topbar-390.png`.
- **A (my pick):** below 600 px, two rows (~110 px): the name and the green GO key on top, then HOME · PROJECTS · HOW I WORK · CONTACT ↓ in one row. The yellow F1–F4 tags hide on phones (they name keyboard keys a phone doesn't have); every key stays 44 px tall. Tablet and desktop unchanged.
- B: keep the full bar, but on phones let it scroll away with the page instead of staying pinned. Frees the whole screen, but the keys are gone until you scroll back up.
- C: leave it at 184 px.

**D2 — Words inside the drawings are too small; Home's project cartridges are too small to tap.** The drawings shrink to fit the screen, so their words shrink too. Rule: never below 9 px. Today: Home 5 px at 390; projects 4.3–5 px at 390 and 7.9–8.3 px at 1280 (two columns side by side); CLAUDE.md 7.5 px at 768 and 6.4 px at 1280. 768 is fine for Home and projects (9.3 px and up). Home's six cartridges (SCTM … SDFS) are 22 × 18 px at 390 (rule: 44 px). Pictures: `d2-home-drawing-390.png`, `d2-project-drawing-390.png`.
- Phones:
  - **A (my pick):** every drawing keeps the width its smallest word needs to stay ≥ 9 px (Home ~600 px, projects ~690 px, CLAUDE.md 848 px) and scrolls sideways inside its own frame, as CLAUDE.md already does. Tapping a legend button slides that part into view. Home's cartridges then measure ~40 × 34 px; each gets an invisible 44 px-tall tap area (no change to the look).
  - B: drawings keep fitting the screen (whole picture visible, words ~5 px, unreadable); the legend buttons and detail card below carry the readable words. Breaks the 9 px rule inside drawings; cartridges stay ~22 × 18 (they'd get the invisible tap area, as tall as fits).
- Desktop (1280):
  - **A (my pick):** accept the design's look: project drawings ~8 px, CLAUDE.md 6.4 px. A mouse visitor can hover any part and read its card, and CLAUDE.md has its FULL GRAPHIC button. Logged as an accepted exception.
  - B: stack the drawing above the screenshot on Projects and the loop above CLAUDE.md on How I work at every width, so both get the full width (~8 → ~13 px). A large change to the desktop look.

**D3 — The CLAUDE.md drawing on a phone shows only its left half.** It keeps 848 px (so every word is 9 px) and scrolls in a 331 px box, so a visitor first sees part 7 and the left edge of the plates; "CLAUDE.md" and "RULES 0–12" are cut off. The handoff wants every label readable at 390. Picture: `d3-claude-md-390.png`.
- **A (my pick):** keep the scroll; open the box already scrolled to the middle so the plates and their labels show first; tapping a legend button slides that part into view (same as D2-A).
- B: shrink it to fit the screen. Whole drawing visible, words ~3.5 px. Breaks the handoff's 9 px line.
- C: leave it starting at the left edge.

**D4 — In the loop, the moving PAGE marker covers the step's name, and a pop-up wraps tight.** When the PAGE square waits at a step it sits on the step's box, and the word "PAGE" lands on the title ("03 CHECK" at 390, "Tests run by" at 1280). At 390 "✗ 2 OF 14 FAILED" wraps onto three lines. Picture: `d4-loop-token-on-check-390.png`.
- **A (my pick):** the square rides on the box's top edge instead of its middle, with "PAGE" beside it on the track, at every width, so the step's name stays clear; on phones the pop-ups get room for at most two lines, still inside the loop's box.
- B: phones only: hide the word "PAGE" (the square stays) and widen the pop-ups. Desktop keeps the overlap.
- C: accept as designed.

**D5 — On a phone the project row doesn't follow the selected project.** Open Optometry (5 of 6) and its cartridge is off-screen to the right, at 390 and also at 768. Picture: `d5-cartridge-row-optom-390.png`.
- **A (my pick):** whenever a project is selected, the row slides (inside its own box only; the page doesn't move) so the selected cartridge is in view.
- B: leave it; the visitor swipes the row.

**D6 — Overlaps drawn into the design itself.** (a) Home, plate 4: "PLAIN FILES · FREE HOSTING" runs into the "HOSTING" label (`d6-home-hosting-overlap-390.png`, every width). (b) Optometry drawing: "the visit", "the doctor", "the cost" print on top of each other (`d2-project-drawing-390.png`, every width). (c) Builder's Map: "NEXT PHASE ↺" sits on its return line (`screenshots/04-how/how-1280.png`, bottom left). (The loop's PAGE overlap is D4.)
- **A (my pick):** move each of those words the smallest distance that clears the overlap; nothing else in the drawing changes. Logged as deviations.
- B: accept all three as designed (Optometry's drawing will be replaced when its spec arrives anyway).
- C: fix some, accept others (say which).

Not a decision (already as the handoff wants): dark only with `color-scheme: dark`, so a phone in light mode shows the same dark site.

## Done when (filled in with the chosen fixes once Steffen answers)

1. Each decision D1–D6 is recorded here with Steffen's answer, and each chosen fix has a test in `tests/phone.spec.mjs`, written first and watched failing.
2. At 390, 768 and 1280, on Home, every project and How I work, and with each full-graphic window open: the page never scrolls sideways; nothing spills out of its box; wide things (project row, phase map, any drawing D2/D3 says scrolls) scroll inside their own box.
3. No two texts overlap (except any Steffen accepts above); no font falls back (IBM Plex Mono and VT323 loaded); no broken image; no empty box; everything meant to be seen is there on load.
4. Every button, tab and key is ≥ 44 px tall and works by tap.
5. Zero console errors on load and after pressing every key, tab and button.
6. `color-scheme: dark`; a phone set to light mode shows the same dark site.
7. No text renders below 9 px, except what Steffen accepts in D2.
8. The phase map scrolls sideways inside its box at 390; the page doesn't.
9. Switching every page and every project, only one page is ever showing.
10. Every demo link is relative (`demos/<name>/index.html`).
11. Screenshots: `screenshots/phone.png` and `screenshots/desktop.png` (Home, full page) and per-page shots at 390 / 768 / 1280 in `screenshots/05-phone-pass/`. STATUS.md records PASS / FAIL for each line above.

Must not:
- Change anything visible that Steffen hasn't chosen above; rewrite a visible string; add an instruction to the visitor.
- Redraw a drawing beyond the word moves chosen in D6; add a drawing.
- Animate the top bar or let it change size between pages (D1 may change its phone layout, the same on every page).
- Use an absolute path; touch `design/` or `demos/`.

How to check:
1. `npx playwright test tests/phone.spec.mjs` — written before the fixes, watched failing.
2. `npm run verify` green, output pasted; screenshots at 390 / 768 / 1280.
3. Each strengthened test proven by breaking the code on purpose and restoring it.
4. Fresh-chat review: inputs = this spec + `index.html`, `assets/site.css`, `assets/site.js`, `assets/data.js`, `tests/phone.spec.mjs`; output = lines not met. Repeat until zero lines.
5. STATUS.md updated; unit flipped to Checked only after step 4 returns zero lines.
