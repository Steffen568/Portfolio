# 03 — Cards + connectors

**Depends on:** units 01 and 02; `specs/portfolio-site.md`; from `design/portfolio-design.dc.html`: the `<style>` lines 56–57 (`.chips`, `.chip`), 69–71 and 73 (`.lines`, `.ln`, `.ln.on`, `@keyframes lnin`; `dflow` at 72 is already ported), 74–89 (`.col`, `.col-h`, `.grid1`, `.grid2`, the `.col-main` rules, `.col-h-r`, `.web-row`, `.grid-web`), 91–114 (`.card` and its hover rules, brackets, `.thumb`, `@keyframes sweep` and `spawn`, `.card-b`, `.card-t`, `.st`, `.go`), the card parts of the 1000 px rule (252, 255–263) and the 640 px rule (269, 275–276); the markup `<svg class="lines">` and the three `<section class="col …">` blocks with the card button (lines 314–334, 389–413); `measure()`, `scr()`, `tick()`, and the `card()` builder, `H.enter` / `H.leave` and the `LC` line classes in `renderVals()`.
**Next:** 04 — Skills + panel.

Purpose:
"Six real projects, led by four sports data tools" (SCOPE.md §1): the projects branch visibly off the environment, sports tools first, and each one is a single button a stranger can tap.

Done when:
1. **Symmetric grid above 1000 px:** in `<main class="stage">`, in this order: `<svg class="lines">`, the left column (`SPORTS DATA TOOLS` · `1–2 OF 4`: Scout Team above The Wire), the environment, the right column (`SPORTS DATA TOOLS` · `3–4 OF 4`: SlateHub above SCOUT DFS) and the websites row (`WEBSITES` · `2`: Holy Cross, Optometry practice). The left column is left of the environment and the right column right of it; the two side columns are the same width (±1 px). The right heading is mirrored: its count sits left of its title. The temporary `grid-column:2` line from unit 02 is gone.
2. **Equal heights, matching edges** (1100, 1280, 1440 px): both side columns end at the same y (±1 px); in each column the two cards are the same height (±1 px); Scout Team and SlateHub share top and bottom edges, as do The Wire and SCOUT DFS (±1 px).
3. **Websites centered below:** the websites row starts below the environment window; its two cards sit side by side, each the width of a side column (±1 px), the pair centered on the stage (±1 px), heading centered.
4. **At 1440×900, no scrolling:** the header, the whole environment window and all four sports cards are inside the viewport at scroll 0 (the design measured the bottom cards at about 889 px).
5. **Connector lines land** at 1100, 1280 and 1440 px wide, and again after the window is resized (1440 → 1100 and 1100 → 1280): six dashed paths, one per card. A side card's line starts on the environment window's near edge (inside its top and bottom by 50 px) and ends on the card's inner edge, inside the card's height; it is right-angled (H/V segments only). A website's line starts on the window's bottom edge and ends at the middle of the card's top edge. Every end is within 1 px. Measured on load, on resize, after fonts load and after each card's spawn animation ends.
6. **Lines hidden at 1000 px and below** (`.lines` not displayed at 1000 and 768).
7. **Cards copy from `window.PORTFOLIO`:** each card is a `<button type="button" class="card" data-card="<id>">` named "Name: line" (the design's `aria-label`), holding `OPEN ▸`, the thumbnail (ticker + `SCREENSHOT PENDING`), the name, the status pill (green dot; orange `.wip` for Optometry), the one line and one chip per skill (the skill's label, in the project's order, at most 4). Every string matches the design's `projects()` / `skillList()`.
8. **Thumbnails:** the striped placeholder (the design's `.thumb` background) on every card, since no demo has a screenshot yet; side cards 5:2 and website cards 21:9 above 640 px; every card 21:9 at 640 px and below (±0.05).
9. **Hover or focus** a card: it lifts 3 px with an amber border and glow, the corner brackets and `OPEN ▸` show, the thumbnail's scan line sweeps and the ticker glows, its line (and only its line) gets `.on`, and the name scrambles: it differs from the real name right after, and is the real name again by 420 ms. Leaving or blurring clears all of it. The accessible name never scrambles.
10. **Stagger in:** every card runs `spawn`; delays are 0.50 s, 0.62 s (left), 0.74 s, 0.86 s (right), 0.98 s, 1.10 s (websites); left cards come in from +30 px, right from −30 px, websites from 0.
11. **At 1000 px and below:** environment first, then Scout Team, The Wire, SlateHub, SCOUT DFS, then the websites; the right column's heading is hidden; each group has the 2 px dashed stem on its left; cards size to their content (side-column cards need not match heights); website cards one per row.
12. **At 640 px and below:** every card one per row, full width of its column, thumbnails 21:9.
13. **Real buttons, nothing more:** all six cards are focusable buttons at least 44 px tall with the 2 px amber focus outline; clicking one opens nothing yet (the panel is unit 04) and logs no error. No sideways scroll at 390, 768, 1100, 1280, 1440. Zero console errors on load, over the server and by double-click. Units 01 and 02's checks still pass.
14. **Reduced motion:** cards and lines show at once with no animation, and the name does not scramble.

Ports from the design:
- CSS: the lines under "Depends on", as written.
- Markup: `<svg class="lines">` with six `<path class="ln">` (the design's order: holy, optom, scout, wire, slate, dfs); the two `col-main` sections around the environment and the `web-row` section after it, headings as written; the card button built in `site.js` from the design's markup and `card()`.
- Behavior: `measure()` (geometry as written), `scr()` + `tick()` (380 ms scramble, 33 ms steps), `H.enter` / `H.leave` (hover state = `.on` on the card and its line).

Deliberate deviations from the design:
- Cards are built in `site.js` from `window.PORTFOLIO` (the design renders them from `projects()` the same way).
- Focus and blur do what pointer enter and leave do: the handoff says "hover or focus"; the design only listens to the pointer.
- Lines are measured once more when each card's `spawn` animation ends. The design measures at 60 ms, 700 ms and on font load, while the cards are still mid-animation (shifted and scaled), so its lines can miss by a few pixels until a resize.
- A card's current lift (hover or focus, `translateY(-3px)`) is taken out when measuring, so a resize mid-hover doesn't leave its line 3 px short once the card settles (the design measures the lifted card).
- One card is on at a time (the design's single `hov`): entering a card turns the previous one off, and leaving a card only clears it if it is still the active one.
- Unmeasured paths keep `d="M0 0"` (as the design) but without its unstyled `off` class.
- The scramble is skipped under reduced motion (the handoff: all animation stops).
- The real screenshot (`demos/<name>/screenshots/desktop.png`) is not wired yet: no demo exists, and the design itself only renders the placeholder. Whoever copies in the first demo adds it (logged in STATUS.md).
- `.chip.on`, `.card.dim`, `.card.hit` (lines 58–60), the panel CSS and a card's `.on` while its panel is open belong to unit 04.

Must not:
- Build the skills filter, the definition line's changes, filled chips, card dimming, or the project panel and hash (unit 04).
- Add anything to the environment graphic, rewrite a visible string, or show a guessed screenshot.
- Use an absolute path; add a framework, a build step or a third-party script.
- Change unit 01's or unit 02's tests.

How to check:
1. `npx playwright test tests/cards-connectors.spec.mjs` — written before the build, watched failing.
2. `npm run verify` green, output pasted; screenshots at 390, 768, 1280 and 1440×900 (plus one hovered card) in `screenshots/03-cards-connectors/`, beside the design.
3. Fresh-chat review: inputs = this spec + `index.html`, `assets/site.css`, `assets/site.js`, `tests/cards-connectors.spec.mjs` + the design file as reference; output = lines not met.
4. STATUS.md updated; unit flipped to Checked only after step 3 returns zero lines.
