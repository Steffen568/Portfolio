# 03 — Projects

**Depends on:** `specs/01-shell.md`, `specs/02-home.md` (Checked; this unit reuses the drawing engine); `specs/portfolio-site.md` (Projects, GO key, The drawing engine); from `design/portfolio-design.dc.html`: CSS `.shot*`, `.live-badge`, `.cyc*`, `.cart*`, `@keyframes cin` / `pulse`, `.ptitle`, `.pduo`, `.frame`, `.fbar` (lines 156–210); the Projects markup inside `<sc-if value="{{PG.projects}}">` (lines 468–888, including the six `W.<id>` drawings); `data()` keys `X.holy/optom/scout/wire/slate/dfs` and `P` (lines 1112–1164); `scr()`, `startTicker()`, `selectProject()`, `nextProj` / `prevProj` / `startTour`, and the `carts` / `pj` values in `renderVals()`.
**Next:** 04 — How I work.

Purpose:
The middle of the finish line: a phone visitor steps through all six projects, watches each one's drawing, and opens any working demo from it, with the tour key leading them through and on to How I work.

Done when:
1. The Projects page shows, from the design: the panel header `02 · PROJECTS<GO>` / `VIEWED n/6`; the cycle title `6 PROJECTS`, the hint `WEBSITES · SPORTS DATA TOOLS · EACH WITH A WORKING DEMO` (hidden below 820 px) and the counter `n / 6`. Every string matches the design.
2. Six cartridges in the fixed order Scout Team, Holy Cross, The Wire, SlateHub, Optometry, SCOUT DFS, each showing its number (01–06), ticker, name and subtitle from `P`. **Selected:** amber fill with the down-pointing notch, `aria-selected="true"`. **Viewed:** `✓ ` before its subtitle, in green. **Next unviewed** (the first unviewed in order, unless it is the selected one): `NEXT ▸ ` before its subtitle, amber border.
3. A project counts as viewed the moment it is shown, however it was reached (cartridge, arrows, previous / next, GO, F2, a Home cartridge, a shared link). `VIEWED n/6` counts them; the counter `n / 6` is the selected project's place in the order.
4. ‹ and › (beside the row) and ‹ previous / next › (below) step through the order; before the first goes to Home, past the last goes to How I work. The bottom buttons read `‹ <PREVIOUS NAME>` / `<NEXT NAME> ›`, with `HOME` and `HOW I WORK` at the ends. At 700 px and below (the design's `max-width: 700px`) ‹ › are hidden and the row scrolls sideways inside its own box; the page never does.
5. The row is a tablist: each cartridge is a `tab`; Left / Right arrow keys select the previous / next project (wrapping within the six) and move focus to it.
6. Hovering a cartridge scrambles its name for 400 ms, then it reads exactly. On every selection the project title scrambles in over 550 ms (after 60 ms) and then reads the name in capitals. Under reduced motion neither scrambles.
7. Cartridges stagger in on load: `cin`, 0.45 s, delays 0, 0.06, 0.12, 0.18, 0.24, 0.30 s.
8. The selected project shows its title and one line, then two columns: `HOW IT'S BUILT` with that project's drawing, and the screenshot frame. Only the selected project's drawing, legend and card are showing.
9. **Same size:** the drawing frame and the screenshot frame have the same width and height (within 0.5 px) at 1280, 768 and 390 px; each is a 30 px bar over an 800 : 460 body. Side by side above 900 px, stacked at 900 px and below (the design's `max-width: 900px`).
10. **Screenshot frame (a project with a demo):** the bar reads `portfolio/demos/<name>/index.html`. The whole frame is one link to `demos/<name>/index.html` (relative). Hovering it shows the green `OPEN THE DEMO ▸` overlay. While the project's `shot` is not set in `assets/data.js` the body is the striped placeholder `[SCREENSHOT OF THE DEMO]` / `demos/<name>/screenshots/desktop.png`, and no image is requested. When `shot` is set, `demos/<name>/screenshots/desktop.png` fills the body (`object-fit: cover; object-position: top`); if that file fails to load, the placeholder shows again. A broken image is never visible.
11. **Optometry:** the frame is not a link and shows `[SCREENSHOT · DEMO IN PROGRESS]` / `demos/eye-care/screenshots/desktop.png`; the status badge is orange; the button reads `DEMO COMING SOON` and is disabled; there is no `OPEN THE WORKING DEMO ▸`.
12. Below, two columns: left, the drawing's legend and detail card with rows `DATA IN`, `DATA OUT`, `RUNS ON`; right, the status badge (green dot for a working demo) with the project's status and its path, `OPEN THE WORKING DEMO ▸` (green, linking to the same `demos/<name>/index.html`), the description, and the previous / next buttons.
13. **Six drawings, as drawn:** each project SVG has the same shapes, positions, texts, inline styles and `aria-label` as the design, in the same order (classes renamed `dg-`). Its data (`over` + parts) is `PORTFOLIO.drawings.<id>`, equal to the design's `X.<id>`; `PORTFOLIO.projects` holds the design's `P` (plus `shot`). Each drawing runs on unit 02's engine (hover lights a part and dims the rest, click pins, again unpins, leaving returns to the pin or the overview), and **drawings stay independent**: a pin or hover in one never changes another (project or Home).
14. **The hash stays in step:** every selection sets `#projects/<id>`; Back returns to the previous project; a shared `#projects/<id>` opens that project.
15. **GO tour key:** reads `START TOUR` before anything is viewed, `CONTINUE` while some are unviewed, `DONE ✓` once all six are. Pressing it opens the next unviewed project in order; once all six are viewed, How I work.
16. **Reduced motion:** nothing on Projects animates, and every element of every project drawing is visible.
17. No sideways scroll on Projects at 390 / 768 / 1280; every button and tab on the page is at least 44 px tall; zero console errors after using every control on the page; units 01–02 stay green.

Ports from the design:
- CSS: lines 156–210 as written (`.shot*`, `.live-badge`, `pulse`, `.cyc*`, `.cart*`, `cin`, `.ptitle`, `.pduo`, `.frame`, `.fbar`).
- Markup: the Projects body (lines 471–886); `{{…}}` bindings become `data-` hooks; the cartridges and legends are built by `assets/site.js` from the data, as the design's `sc-for` builds them.
- Drawings: the six `W.<id>` SVGs, class `x` → `dg-x`, parts `<g class="dg-pt" data-n>`.
- Data: `X.holy … X.dfs` and `P`, with the design's `—` for empty fields.
- Behavior: `scr()` and the ticker, `selectProject`, `nextProj` / `prevProj`, `startTour`, `carts`, `pj`, `prevLabel` / `nextLabel`, `tourLabel`, `seenN`.

Deliberate deviations from the design (each required by the handoff, the quality standard or another spec):
- The screenshot `<img>` is new (the design shows only the placeholder). Whether it is requested is set per project by `shot` in `assets/data.js`, set when the demo and its screenshot are copied in: requesting a missing file logs an error in the console, which the quality standard forbids.
- The hash carries the selection (`#projects/<id>`); a project reached by a shared link counts as viewed.
- Tabs use a roving `tabindex` and arrow keys (handoff: "arrow keys move between projects").
- Under reduced motion the SCOUT DFS `✓ VALID` badge (`.dg-gf`) shows; the design leaves it at opacity 0, and the handoff says every part is visible.
- Unit 01's test changes: the Projects header on `#projects/scout` reads `VIEWED 1/6` (the project is viewed once shown); the "bodies empty" check now covers How I work only.

Must not:
- Rewrite a visible string or add an instruction to the visitor; add stack chips or a card `graphic.svg` (frozen).
- Build one template drawing for the six; add a drawing; create anything in `demos/`.
- Reuse a short class name inside a drawing; use an absolute path; add motion to the top bar.
- Build How I work content (unit 04).

How to check:
1. `npx playwright test tests/projects.spec.mjs` — written before the build, watched failing.
2. `npm run verify` green, output pasted; screenshots at 390 and 1280 in `screenshots/03-projects/`, compared with the design; every drawing checked for overlapping text at 390 / 768 / 1280.
3. Fresh-chat review: inputs = this spec + `index.html`, `assets/site.css`, `assets/site.js`, `assets/data.js`, `tests/projects.spec.mjs`, `tests/shell.spec.mjs`; output = lines not met.
4. STATUS.md updated; unit flipped to Checked only after step 3 returns zero lines.
