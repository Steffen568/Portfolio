# 01 — Shell + header

**Depends on:** `specs/portfolio-site.md`; from `design/portfolio-design.dc.html`: the `<style>` lines for tokens, base, `.term`, `.crt`, `.vt`, `.wrap`, `.lbl`, the header (`.hd*`, `.em*`, `.btn`), the skills row (`.skl`, `.sk`, `.skl-def`), the footer (`.ft`), the 640 px header/skills rules and the reduced-motion rule; the markup for `.crt`, `<header class="hd">`, the empty `<main class="stage">` and `<footer class="ft">`; `skillList()` and `projects()`; `componentDidMount` (clock) and `copyEmail` from `renderVals()`.
**Next:** 02 — Environment graphic.

Purpose:
The 5-second read (SCOPE.md §1): who this is and what he builds, legible at the top of the page on a desktop and a phone, inside the frame every later unit sits in.

Done when:
1. `index.html`, `assets/site.css`, `assets/site.js`, `assets/data.js` exist; the page opens over the local server and by double-click (`file://`) with zero console errors, including after clicking COPY EMAIL and every skill button.
2. All 12 design tokens are on `:root`; `color-scheme: dark`; a light-mode phone gets the same dark background; the body font is IBM Plex Mono and the name is VT323, both loaded (no fallback).
3. `assets/data.js` sets `window.PORTFOLIO = { skills, projects }` equal, value for value, to the design's `skillList()` and `projects()`.
4. The header shows, word for word from the design: `TEMPLE, TX · OPEN TO PROJECTS · HH:MM CT`; `STEFFEN [LAST NAME]`; `AI SYSTEMS BUILDER · HARNESS ENGINEERING`; "I build the environment AI works inside."; the bio paragraph; `CONTACT`; `[YOUR EMAIL]` as selectable text; COPY EMAIL. The footer shows `EVERY DEMO IS A FROZEN SNAPSHOT ON REAL DATA · FORMS AND OUTSIDE LINKS OFF` and `[YOUR EMAIL]`.
5. The clock shows the current America/Chicago time as `HH:MM` (00–23, no seconds) and refreshes every 30 s.
6. COPY EMAIL puts `[YOUR EMAIL]` on the clipboard, reads `COPIED ✓`, and reads `COPY EMAIL` again 1.6 s later.
7. The skills row sits directly under the bio: 8 buttons in the design's order, each with its project count (API INGESTION 3, SCRAPING 1, DATABASES 3, DATA PIPELINES 2, DATA VIZ 1, OPTIMIZATION 1, WEB DESIGN 2, INTEGRATIONS 1, counted from `projects()`), and under it the definition line `8 SKILLS ACROSS 6 PROJECTS`. The filter behavior is unit 04; here the buttons are static.
8. **The 5-second read fits above the fold:** at 1440×900, with no scrolling, the label line, name, title, headline, bio, skills row, definition line, email and COPY EMAIL are all fully inside the viewport.
9. No sideways page scroll at 390, 768 and 1280 px. At 640 px and below the skills row stays on one line and scrolls inside its own box.
10. COPY EMAIL is at least 44 px tall. Skill buttons are at least 40 px tall at 640 px and below (the handoff's number; see deviations).
11. The scanline overlay `.crt` covers the screen and never catches clicks (a click at COPY EMAIL's centre lands on the button).
12. `html` has `scrollbar-gutter: stable`. No text on the page is smaller than 9 px at 390.
13. Under reduced motion nothing on the page animates or transitions.
14. No path in `index.html` or `assets/` starts with `/`. No visible text says "framework" or "this site".

Ports from the design:
- CSS: lines 15–55 (tokens through `.skl-def`), 225–226 (footer), the header/skills parts of the 640 px rules (266–268, 274, 283–285), and 287 (reduced motion), as written except the deviations below.
- Markup: `.crt`, `<header class="hd">`, `<main class="stage">` (empty until units 02–03), `<footer class="ft">`.
- Data: `skillList()` and `projects()`, same shape, into `assets/data.js`.
- Behavior: the 30 s clock; `copyEmail` (clipboard write, 1.6 s label); skill counts and the default definition line from `renderVals()`.

Deliberate deviations from the design:
- The clock uses `hourCycle: 'h23'` (the design's `hour12: false` shows midnight as "24:xx" in Chrome; fixed in v1 the same way).
- The email is hard-coded `[YOUR EMAIL]` (the design's `email` prop is frozen).
- Skill buttons keep the design's 32 px (desktop) / 40 px (≤ 640 px), below the 44 px rule, because the handoff names 40 for this row. Raised in STATUS.md Proposed changes for Steffen to decide before unit 04.

Must not:
- Build the stage (environment, cards, lines), the skills filter, the panel or the windows: units 02–04.
- Fill `[LAST NAME]` or `[YOUR EMAIL]`.
- Port anything from the retired design (top bar, F-keys, boot screen, GO tour).
- Use an absolute path; add a framework, a build step or a third-party script.

How to check:
1. `npx playwright test tests/shell-header.spec.mjs` — written before the build, watched failing.
2. `npm run verify` green, output pasted; screenshots at 390 and 1280 (plus 1440×900) in `screenshots/01-shell-header/`.
3. Fresh-chat review: inputs = this spec + `index.html`, `assets/site.css`, `assets/site.js`, `assets/data.js`; output = lines not met.
4. STATUS.md updated; unit flipped to Checked only after step 3 returns zero lines.
