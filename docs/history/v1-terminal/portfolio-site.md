# Portfolio site — the whole-site spec

**Source:** `handoff-PORTFOLIO-SITE.md` (this file is written from it; where they differ, the handoff wins and this file gets fixed). Look and copy: `design/portfolio-design.dc.html`.
**Units:** `specs/01-shell.md` … `specs/06-publish.md`, one per session, in order.

Purpose:
The finish line in SCOPE.md §1: a stranger on a phone moves through Home, Projects and How I work, watches a drawing come apart, opens any working demo, and sees the framework, with nothing overlapping, breaking or scrolling sideways.

Done when (whole site; each unit spec owns its slice):
1. Three pages reachable from the top bar and by URL: `#home`, `#projects/<id>`, `#how`. Back and forward work; a shared link opens the right page and project. An unknown hash opens Home.
2. Only the active page is in view at any moment, after any sequence of page and project switches.
3. The top bar never moves: same position and height on every page, no animation or transition in it, `scrollbar-gutter: stable`.
4. All eight drawings are ported as drawn, share one hover / pin / legend / detail-card engine, and keep animating.
5. Every demo link is relative (`demos/<name>/index.html`) and opens under `/portfolio/` on GitHub Pages and by double-click.
6. The quality standard in SCOPE.md §6 passes at 390 / 768 / 1280, with screenshots saved.
7. A stranger completes the finish line on their own phone.

## Files

```
index.html                 markup for the bar, three pages, footer, boot, overlay, window
assets/site.css            tokens, components, keyframes (ported from the design's <style>)
assets/site.js             routing, clock, copy email, F4, boot, drawing engine, cycle, scramble, tour, window
assets/data.js             window.PORTFOLIO = { drawings, projects }  (from the design's data(): X and P)
assets/builders-map.png    copied from design/
assets/claude-md-anatomy.png
```

Data stays in `data.js`, not JSON: a JSON file can't be fetched when `index.html` is opened by double-click.

## Look (fixed)

- Amber on near-black, CRT scanlines, mono type. Dark only; `color-scheme: dark`; the phone's light setting changes nothing.
- Fonts: IBM Plex Mono (body, labels), VT323 (display titles), from Google Fonts as in the design.
- Tokens: `--acc #ffa028`, `--yel #f5c518`, `--org #ff6b2c`, `--grn #7cc46a`, `--red #e5534b`, `--bg #050403`, `--pan #0b0906`, `--ln #2a241b`, `--ln2 #3d352a`, `--tx #f0e9dc`, `--mu #b3a892`, `--dim #8f8470`.
- Content max width 1440 px, centered; the top bar's inner content lines up with it.
- No moving background. The only screen-wide effect is the scanline overlay (`.crt`), which never catches clicks.
- Copy is final: descriptive, short, plain. No instructions to the visitor, no "this site", no "taken apart" in visible text.

## Structure

**Top bar (sticky, never moves):** `STEFFEN [LAST NAME]` + green `<GO>`; keys F1 HOME, F2 PROJECTS, F3 HOW I WORK, F4 CONTACT ↓, green GO tour key; `TEMPLE, TX · date · HH:MM CT` (America/Chicago, every 30 s, no seconds), hidden below 820 px.

**Boot:** four amber lines type out over black, fade by 1.4 s, never block clicks, skipped under reduced motion.

**Home (`#home`):** panel `01 · OVERVIEW` / `4 LAYERS`. Left: the four-plate hero drawing (3 pages; six cartridges SCTM HCRS WIRE SLTH OPTO SDFS, each opening that project; How I work; Hosting). Right: name in VT323, headline "I build the framework the AI works inside.", bio, SEE THE 6 PROJECTS ▸ and HOW I WORK, BASED / BUILDS / DEMOS rows, the detail card.

**Projects (`#projects/<id>`):** panel `02 · PROJECTS` / `VIEWED n/6`. Cycle: `6 PROJECTS`, `n / 6`, six cartridges in fixed order Scout Team, Holy Cross, The Wire, SlateHub, Optometry, SCOUT DFS, with ‹ › (hidden below 700 px; the row scrolls in its own box). States: selected (amber, notch), viewed (green ✓), next unviewed (amber border, NEXT ▸). Hover scrambles a name for 400 ms; cartridges stagger in. Selected project: title scrambles in (550 ms) with its one line; two equal columns (30 px bar + 800×460 body): HOW IT'S BUILT drawing, and the screenshot frame (`demos/<name>/screenshots/desktop.png`, cover/top, green OPEN THE DEMO ▸ on hover, whole frame links to the demo; striped placeholder if the file is missing). Below: legend + detail card (DATA IN / DATA OUT / RUNS ON); status badge + path, OPEN THE WORKING DEMO ▸, description, ‹ previous / next ›. Past the last → How I work; before the first → Home. Optometry: frame is not a link; button reads DEMO COMING SOON, disabled.

**How I work (`#how`):** panel `03 · HOW I WORK` with a pause/play button. `A CUSTOM FRAMEWORK` + paragraph. Two same-size graphics: THE LOOP · ONCE PER PAGE (16 s, pause stops all of it) and CLAUDE.md · TAKEN APART (7-part interactive drawing, parts slide apart on load, caption "PROMPTS ARE REQUESTS · HOOKS ARE LAW", rows STOPS / WHEN). Under the loop: one sentence and the legend. The Builder's Map phase (20 s, Holy Cross example, loops; scrolls inside its own box below 980 px). FULL CLAUDE.MD GRAPHIC ⤢ and FULL BUILDER'S MAP ⤢ open the PNG in a CRT-style window over a scrim; close with ✕, scrim or Esc; the image fits with no scrolling.

**Footer (every page):** HAVE A PROJECT IN MIND? / "What do you want built, and who is it for?"; the email as selectable text + COPY EMAIL (→ "COPIED ✓" for 1.6 s); bottom line `TEMPLE, TX · OPEN TO PROJECTS` / `EVERY DEMO IS A FROZEN SNAPSHOT ON SAMPLE DATA · FORMS AND OUTSIDE LINKS OFF`. F4 scrolls here smoothly and flashes the border once.

**GO key:** START TOUR (nothing viewed) → CONTINUE (some unviewed) → DONE ✓ (all six). Opens the next unviewed project; once all are viewed, How I work.

## The drawing engine (all eight drawings)

- Animations play on load and keep running (`.fl`, `.sq`, `.gq`, `.rf`/`.gf`, …).
- Hover a part or its legend button: it turns amber, others dim to 30 %, the detail card shows it. Leave: back to the pinned part, else the overview.
- Click / tap pins; tap again unpins. On a phone, tap is the hover.
- Legend buttons are real buttons, focusable, show the pinned ring, **44 px tall** (design has 34).
- Up to 8 parts per drawing.
- **Drawing classes are namespaced `dg-`** (`.dg-on`, `.dg-dim`, `.dg-bar`, …). The design's short shared names (`.bar`, `.dim`, `.big`) clashed and broke hover; don't recreate it.

## Accessibility and motion

- Reduced motion: all animation stops, boot skipped, every drawing part visible, the loop shows its first caption, the phase map shows its finished state.
- Every SVG keeps its `aria-label` from the design. Focus visible (2 px amber outline). The project cycle is a tablist; arrow keys move between projects.

## Must not

- Anything on SCOPE.md §4 (frozen), including the accent-color option, stack chips, card `graphic.svg`, a light theme, a ninth drawing.
- Copy the design file's runtime (`support.js`, `<x-dc>`, `sc-if`); port it.
- Rewrite copy; fill a placeholder by guessing; use an absolute path; animate the top bar.

## Open inputs

`[LAST NAME]`, `[YOUR EMAIL]`, GitHub username, the Optometry demo and drawing, each demo's `screenshots/desktop.png`. See SCOPE.md §5.
