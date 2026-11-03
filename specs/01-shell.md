# 01 — Shell

**Depends on:** `specs/portfolio-site.md`; from `design/portfolio-design.dc.html`: the `<style>` block (tokens, `.term`, `.crt`, `.boot`, chrome, panels, buttons, footer), the markup for `.crt`, `.boot`, `.topbar`, the three `.pnl` headers and `<footer>`, and `renderVals()` for `copyEmail`, `goContact`, `setPage`, the clock.
**Next:** 02 — Drawing engine + Home.

Purpose:
The frame every later unit sits in: a top bar that never moves, three pages a phone visitor can move between (with working back button and shareable links), and a contact footer on every page.

Done when:
1. `index.html`, `assets/site.css`, `assets/site.js`, `assets/data.js` exist; the page opens over a local server and by double-click (`file://`) with zero console errors.
2. All design tokens are on `:root`; `color-scheme: dark` is set; the body font is IBM Plex Mono and VT323 loads for display text (no fallback font).
3. The top bar shows `STEFFEN [LAST NAME]` + `<GO>`, the keys F1 HOME, F2 PROJECTS, F3 HOW I WORK, F4 CONTACT ↓ and the GO key reading START TOUR, and `TEMPLE, TX`, `<MMM DD, YYYY>`, `HH:MM CT` as three spaced items (the design separates them by gap, not by `·`; the handoff's dots describe the layout) in America/Chicago time, refreshed every 30 s, hidden below 820 px.
4. **The top bar never moves:** its top, left, width and height are identical on Home, Projects and How I work at 390, 768 and 1280 px; nothing inside it has an animation or transition; `html` has `scrollbar-gutter: stable`.
5. Hash routing: F1 → `#home`, F2 → `#projects/<id>` (default `scout`), F3 → `#how`. Loading any of those URLs opens that page. Back and forward move between pages. An empty or unknown hash opens Home; an unknown project id opens `#projects/scout`. The active key is amber and has `aria-current="page"`.
6. **Only one page shows:** after every switch (including back/forward), exactly one page section is visible and the other two are `hidden`.
7. Each page shows its panel header from the design: `01 · OVERVIEW <GO>` / `4 LAYERS` (hidden below 820 px), `02 · PROJECTS <GO>` / `VIEWED 0/6`, `03 · HOW I WORK <GO>`. Bodies stay empty until units 2–4.
8. Footer on every page: HAVE A PROJECT IN MIND?, "What do you want built, and who is it for?", `[YOUR EMAIL]` as selectable text, COPY EMAIL (→ "COPIED ✓" for 1.6 s, then back), and the bottom line `TEMPLE, TX · OPEN TO PROJECTS` / `EVERY DEMO IS A FROZEN SNAPSHOT ON SAMPLE DATA · FORMS AND OUTSIDE LINKS OFF`.
9. F4 scrolls the footer into view smoothly and flashes its border once (the `pflash` animation, 1 s). It does not change the page.
10. The GO key opens the first project (`#projects/scout`); the full tour logic lands in unit 3.
11. Boot: four amber lines from the design type out over black and fade by ~1.9 s; the boot layer never catches clicks; under reduced motion it is not shown and nothing animates.
12. The scanline overlay `.crt` covers the screen and never catches clicks.
13. No sideways scroll at 390, 768 and 1280 px on any page. Every top-bar key and the copy button are at least 44 px tall.
14. No path in `index.html` or `assets/` starts with `/`.

Ports from the design:
- CSS: lines 15–60, 67–77, 211–220, 367 (reduced motion), as written, except the deviations below.
- Markup: `.crt`, `.boot` (four lines), `.topbar`, the three `.ph` headers, `<footer>`.
- Behavior: `copyEmail`, `goContact`, `setPage` (scroll to top on page change), the clock (`toLocaleTimeString` / `toLocaleDateString` in America/Chicago).

Deliberate deviations from the design (each required by the handoff or the quality standard):
- Top-bar keys: `min-height` 38 → 44 (inner `b` 36 → 42); footer button 40 → 44.
- The accent-color prop and `applyAccent()` are not ported (frozen).
- The hash is the page state (the design keeps it in memory).
- Inactive pages get the `hidden` attribute (the design relied on its runtime removing them, which failed once).

Must not:
- Add any animation, transition, glow or blink to the top bar, or anything that changes its size between pages.
- Fill `[LAST NAME]` or `[YOUR EMAIL]`.
- Build page content (drawings, cycle, loop): those are units 2–4.
- Use an absolute path; add a framework, a build step or a third-party script.

How to check:
1. `npx playwright test tests/shell.spec.mjs` — written before the build, watched failing.
2. `npm run verify` green, output pasted; screenshots at 390 and 1280 in `screenshots/01-shell/`.
3. Fresh-chat review: inputs = this spec + `index.html`, `assets/site.css`, `assets/site.js`, `assets/data.js`; output = lines not met.
4. STATUS.md updated; unit flipped to Checked only after step 3 returns zero lines.
