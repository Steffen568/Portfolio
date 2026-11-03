# Handoff: the portfolio site (one page)

Project: Portfolio. Read `00-PORTFOLIO-PLAN.md` first.

This file **replaces** two things:

- the plan's section "The portfolio page (index.html)";
- the earlier three-page version of this handoff (F-key tabs, Projects page, How I work page). That design is retired. Don't build any of it.

Everything else in the plan still applies: folder structure, GitHub Pages hosting, copying demos in, the frozen list, and the quality standard (with the changes below).

The design is finished. It lives in `design\portfolio-design.dc.html`. It is the source of truth for every word, color, animation and layout. This spec says what to build and how it must behave. The design file shows exactly what it looks like.

## Finish line

A stranger who looks at dozens of portfolios a week opens one link on a phone. Within about 3 seconds they know three things:

- who this is;
- that he builds a protected, self-improving environment for AI-written software;
- that it has produced six real projects, led by four sports data tools.

One tap opens any project, and one more opens its working demo. Done when that stranger can do all of it with no help, nothing breaks, and nothing scrolls sideways.

## Why it looks like this (guardrails, not suggestions)

The owner redesigned away from tabs and density because a portfolio gets seconds, not minutes. These rules protect that. If a later request breaks one, say so before building it.

1. **One page. No tabs, no pages, no routing between views.**
2. **The 5-second read sits at the top:** name, one headline, short bio, skills, and contact, all without scrolling on desktop.
2a. **Symmetric stage.** Sports tools flank the environment two on each side, and websites sit centered below. Don't widen one side to make room for something.
3. **One centerpiece:** the environment graphic. Projects branch off it. Nothing gets added to the centerpiece unless something comes out.
4. **One level deep.** Tapping a project opens one panel. The panel's button opens the demo. Nothing nests further.
5. **Descriptive copy only.** No instructions to the visitor ("hover here", "tap a card"). No "this site". Plain words for a non-technical reader.
6. **One word for the system: "environment".** Never "framework" in visible text. "Harness engineering" appears once, in the title line, as the name of the discipline.
7. **Skills come from one fixed list of 8, in plain words.** At most 4 per project. No tool or brand names on cards; brand names only appear inside the panel's proof lines. Don't give a project a skill its demo doesn't show.
8. **Proof beats process.** Real demo screenshots are required, not polish. Until a screenshot exists, show the clean placeholder.

## How to read the design file

`design\portfolio-design.dc.html` is a Claude Design file. It does not run by itself. Read it as a reference and port it. Do not copy its runtime.

- `<helmet><style>`: all CSS. Port the tokens, components and keyframes as they are.
- The markup between `<x-dc>` and `</x-dc>` is the page:
  - `{{name}}` is a value filled in by the script;
  - `<sc-for list="{{x}}" as="c">` repeats its contents for each item;
  - `<sc-if value="{{x}}">` shows its contents only when `x` is true.
- The `<script type="text/x-dc">` class holds the logic and **all the copy**:
  - `skillList()`: the 8 skills and their plain-words definitions;
  - `projects()`: each project's name, status, line, description, demo path, and skills with their proof lines;
  - `measure()`: the connector lines between the graphic and the cards;
  - `renderVals()`: hover, filter, panel and scramble behavior.
- The environment graphic is one inline SVG (`<svg class="{{fxCls}}" …>`) plus CSS keyframes. Port it as it is. It was generated, so the numbers are exact.
- The two process graphics: `design\builders-map.png` and `design\claude-md-anatomy.png`. Copy them to `assets\`.

Build in plain HTML, CSS and JavaScript. No framework and no build step:

```
index.html
assets\site.css        tokens, components, keyframes (from the design file)
assets\site.js         skills filter, card hover + scramble, connector lines, panel, copy email, clock
assets\data.js         window.PORTFOLIO = { skills: [...], projects: [...] }   (from skillList() / projects())
assets\builders-map.png
assets\claude-md-anatomy.png
```

Keep data in `data.js`, not JSON. A JSON file can't be fetched when `index.html` is opened by double-click.

## Look (fixed)

- **Retro-futuristic terminal:** amber on near-black, faint CRT scanlines (`.crt`, never catches clicks), no moving background.
- **Dark only.** Set `color-scheme: dark`.
- **Fonts:** IBM Plex Mono (body, labels) and VT323 (name, big numbers).
- **Tokens:** `--acc #ffa028`, `--yel #f5c518`, `--org #ff6b2c`, `--grn #7cc46a`, `--red #e5534b`, `--bg #050403`, `--pan #0b0906`, `--ln #2a241b`, `--ln2 #3d352a`, `--tx #f0e9dc`, `--mu #b3a892`, `--dim #8f8470`.
- **Content max width 1440px**, centered, with 24px side padding (14px on phones).
- **Corners are slightly soft:** 3–6px radius. Not square, not round.

## The page, top to bottom

### 1. Header: the 5-second read

Left side:

- A small label line: `TEMPLE, TX · OPEN TO PROJECTS · HH:MM CT` (America/Chicago, updates every 30 s, no seconds).
- Name in VT323 (`STEFFEN [LAST NAME]`).
- Title line, small amber caps: **AI SYSTEMS BUILDER · HARNESS ENGINEERING**.
- Headline: **"I build the environment AI works inside."**
- Bio paragraph, word for word:
  > I design multi-agent workflows: rules the AI reads every session, safety checks that block risky moves, and quality gates it can’t skip. Every mistake becomes a new check. Inside that environment I build sports data systems and websites with:
- **The skills row** directly under that sentence, so the buttons finish it. 8 buttons, each with a count of the projects that show it. See "Skills" below.
- **The definition line** under the row. It reads `8 SKILLS ACROSS 6 PROJECTS` until a skill is active, then shows `SKILL NAME:` + its definition + "Shown in …" with the project names.

Right side: `CONTACT`, the email as selectable text, and **COPY EMAIL**, which shows "COPIED ✓" for 1.6 s.

### 2. The stage: symmetric, with the environment in the middle

The layout is mirrored left to right so the page reads as balanced. All cards are the same width.

- **Left: `SPORTS DATA TOOLS` · `1–2 OF 4`.** Scout Team above The Wire.
- **Center: `THE ENVIRONMENT`.** A window with a header bar ("every project is built inside it"), the graphic, the three tiles, and two buttons: **CLAUDE.md ⤢** and **BUILDER'S MAP ⤢**.
- **Right: `SPORTS DATA TOOLS` · `3–4 OF 4`.** SlateHub above SCOUT DFS. The heading is mirrored: the count on the left, the title on the right.
- **Below, centered under the graphic: `WEBSITES` · 2.** Holy Cross and Optometry side by side, each the same width as a side column (`calc((100% - 640px) / 2)`).

Details:

- Desktop columns: `minmax(0,1fr) minmax(440px,580px) minmax(0,1fr)`, gap 30px. The two side columns stretch to the same height, and their two cards share it equally (`grid-template-rows: 1fr 1fr`), so the left and right edges line up.
- Side-column thumbnails are 5:2. Website thumbnails are 21:9.
- Sports headings are 15px; the Websites heading is 12px. Sports cards animate in first.
- **At 1440×900:** the header, the environment window and all four sports cards are visible without scrolling. This was measured in the design (bottom cards end at about 889px); keep it true. The two website cards sit one short scroll below on purpose: the first viewers are in sports.

**Connector lines.** Right-angled dashed amber lines run from the edge of the environment window to each card. They are drawn by measuring the elements on load, on resize, and after fonts load (see `measure()`).

- The dashes flow slowly.
- A line brightens and speeds up when its card is hovered or open, or when the active skill applies to that card.
- Lines to the website cards drop from the bottom edge of the environment window, then turn and land on the top of each card.
- Lines are hidden at 1000px and below.

### 3. The environment graphic (the centerpiece)

This combines the owner's two earlier graphics: the CLAUDE.md exploded view in the middle, and the loop running around the outside. It runs on a 14-second loop. Port the SVG and keyframes exactly.

**Middle (CLAUDE.md, taken apart).** On load, the parts slide apart from a closed stack over 1.1 s (`.ex`):

- Three slabs:
  - **CLAUDE.md** ("read every session");
  - **17 RULES**: 17 amber squares lighting in a sweep, plus one empty dashed slot;
  - **DONE CHECKLIST**: 6 steps ticking green in turn.
- **HOOKS · AUTOMATIC** on the right: GUARD, TIDY-UP and CHECK, with flowing lines into the rules.
- **MISTAKE LOG** on the left, with a flowing line into the rules.
- **Counters:** BLOCKED, RULES and SHIPPED (VT323).

**Outside (the loop).** A rounded track with five stations: **PLAN** (top left), **BUILD** (top right), **CHECK** (right side), **REVIEW** (bottom right) and **SHIP** (bottom left). "↺ NEXT FEATURE" runs up the left side. A glowing dot travels the track, and it is drawn under the stations so it hides while parked.

**What happens each 14-second loop** (percent of the cycle):

| When | What happens | Which promise |
|---|---|---|
| 0–6% | Dot at PLAN | |
| 12–26% | At BUILD: a red bolt shoots to the GUARD hook. GUARD flashes red. Pop: "rm -rf data/ · ✗ BLOCKED". BLOCKED 03 → 04 | **Protects** |
| 32–40% | At CHECK: red. CHECK hook red. Pop: "✗ 2 OF 14 FAIL" | |
| 36–47% | A red block drops into the MISTAKE LOG, which flashes and gains a red row | **Self-learning** |
| 46–54% | A new yellow rule fills the empty slot. Pop: "+1 GUARD". RULES 17 → 18. The dot goes back to BUILD | **Self-learning** |
| 56–62% | CHECK green. Pop: "✓ 14 OF 14 PASS" | |
| 68–74% | REVIEW green. Pop: "✓ 0 ISSUES" | **Efficient** |
| 80–88% | SHIP green. Pop: "✓ SHIPPED". SHIPPED 12 → 13 | **Efficient** |
| 98–100% | Everything resets; the dot is back at PLAN | |

**The three tiles under the graphic:**

- **PROTECTS**: "Guards block risky moves before they run." Lights 14–26%.
- **EFFICIENT**: "Every feature runs the same loop to ship." Lights 56–88%.
- **SELF-LEARNING**: "Every mistake becomes a new guard." Lights 32–54%.

Hovering or tapping a tile spotlights its part of the graphic and dims the rest (classes `fx-p`, `fx-e`, `fx-s` on the SVG):

- Protects: the hooks.
- Efficient: the loop track.
- Self-learning: the mistake log and the rule slot.

Leaving the tile clears the spotlight. On a phone, tapping another tile switches it.

**Full-graphic windows.** The two buttons open the PNGs in a window that opens like a CRT turning on (`@keyframes crt`), over a dark scrim. Close with ✕, a click on the scrim, or Esc. The image fits the screen with no scrolling.

### 4. Project cards

Each card is one button:

- the demo screenshot (5:2 for sports cards and 21:9 for websites on desktop; `demos/<name>/screenshots/desktop.png`, `object-fit: cover; object-position: top`), or the striped placeholder with the ticker (HCRS, SCTM…) and "SCREENSHOT PENDING";
- the name;
- a status pill (green dot; orange for in progress);
- one line;
- the skill chips.

Hover or focus effects:

- the card lifts 3px with an amber border and glow;
- amber brackets snap into the top-left and bottom-right corners;
- a scan line sweeps the thumbnail and the ticker glows;
- the name scrambles for 380 ms;
- an "OPEN ▸" tag slides in;
- its connector line brightens.

Cards stagger in on load.

### 5. The project panel (one level deep)

Clicking a card opens one panel over a scrim, with the same CRT open. It contains:

- Header bar: `TICKER · WEBSITE` or `SPORTS DATA TOOL`, and CLOSE ✕.
- Left: a large screenshot (16:10).
- Right:
  - the status pill;
  - the name in VT323;
  - the one line;
  - the description;
  - **SKILLS SHOWN**: one row per skill, with a filled chip and its proof line;
  - **OPEN THE WORKING DEMO ▸** (green, 52px tall, links to `demos/<name>/index.html`), or **DEMO COMING SOON** (disabled) for Optometry.

Close with ✕, the scrim, or Esc. Opening a panel sets the URL hash (`#slatehub`), so a project can be linked directly. Back closes it.

### 6. Footer

`EVERY DEMO IS A FROZEN SNAPSHOT ON REAL DATA · FORMS AND OUTSIDE LINKS OFF` on the left, the email on the right.

## Skills

The 8 skills, in this order. Definitions are in `skillList()`.

| Skill | Shown in |
|---|---|
| API INGESTION | Scout Team, The Wire, SlateHub |
| SCRAPING | SlateHub |
| DATABASES | Scout Team, The Wire, SlateHub |
| DATA PIPELINES | The Wire, SlateHub |
| DATA VIZ | Scout Team |
| OPTIMIZATION | SCOUT DFS |
| WEB DESIGN | Holy Cross, Optometry |
| INTEGRATIONS | Holy Cross |

Behavior:

- **Hover or focus a skill button:** it turns amber; the definition line explains it; cards with that skill keep an amber border and their matching chip fills; the other cards dim to 32%; matching connector lines brighten.
- **Leave:** the filter clears, unless it was pinned.
- **Tap or click:** pins the filter. Tap the same skill again to unpin.
- Each project's skills and one proof line per skill live in `projects()`. **The proof lines are the substance.** Port them word for word.

## Phone and tablet

**At 1000px and below:**

- The environment comes first, then all four sports tools (the second sports heading is hidden), then Websites.
- Project groups run down a single dashed stem on the left (`border-left: 2px dashed`). Cards size to their content; the equal-height rule is desktop only.
- No connector lines.

**At 640px and below:**

- **Skills row:** one line that scrolls sideways inside its own box, never the page. Buttons are at least 40px tall.
- **Environment window:** full-bleed (edge to edge, no side borders).
  - Hidden inside the graphic: the station subtitles, the slab subtitles and "NEXT FEATURE".
  - Enlarged: station names 21px, layer and hook names 16px, counters 46px; pops scaled to 1.5×.
- **Tiles:** stack one per row.
- **Cards:** single column, thumbnails 21:9.
- **Panel:** stacks (screenshot above, details below). Proof lines put the chip above the text.

Known limit: on a phone, the labels on the three CLAUDE.md slabs are small. Check them on a real phone. If they can't be read, the approved fallback is a phone-only version of the graphic: the loop and counters around a single "CLAUDE.md" block, with no slabs and no hooks list. Ask the owner before building it.

## Accessibility and motion

- **Reduced motion:**
  - all animation stops, and every part of the graphic is visible;
  - counters show their first values, and pops stay hidden;
  - the tiles still work as plain text.
- The SVG has an `aria-label` describing the whole cycle (in the design).
- **Cards and skill buttons are real buttons** with visible focus (2px amber outline). Focusing a skill button previews its filter the same as hover.
- The panel and the image windows are dialogs: focus moves into them on open and back to the card on close. Esc closes.

## Quality standard: changes from the plan

The plan's line "Looks right in light and dark mode" becomes: **"Dark by design; `color-scheme: dark`; still readable when the phone is set to light mode."**

Everything else applies as written: 390 / 768 / 1280px, no sideways scroll, nothing overflowing, buttons at least 44px tall, zero console errors, screenshots saved. Add these checks:

- **The 3-second test.** Show the page at 1440×900 to someone for 3 seconds. They can say his name, "environment", and at least one of protects / efficient / self-learning.
- **At 1440×900,** the header, the whole environment window and all four sports cards are visible without scrolling. Left and right card edges line up.
- **Connector lines** land on their cards at 1100, 1280 and 1440px wide, and after a resize.
- **One level deep:** card → panel → demo. Nothing else opens anything.
- **Every skill button** filters the right cards, and every pinned filter unpins.
- **Every demo link** opens `demos/<name>/index.html` under `/portfolio/` on GitHub Pages. Use relative paths only.

## Build order (one unit per session)

Write `specs\portfolio-site.md` from this handoff first, then one spec per unit.

1. **Shell + header.** Tokens, fonts, scanlines, header with clock, bio, copy email, footer. *Check:* the 5-second read fits above the fold at 1440×900.
2. **Environment graphic.** Port the SVG and keyframes, the three tiles with spotlight, and the full-graphic windows. *Check:* all three events play in one 14-second loop, the counters tick, and reduced motion shows a still, complete graphic.
3. **Cards + connectors.** The stage grid, the six cards with hover effects and scramble, and the measured connector lines. *Check:* lines land correctly at three widths.
4. **Skills + panel.** The skills row, filter and definition line, chips, the panel with proof lines, and hash linking. *Check:* every skill filters correctly; Esc and Back close the panel.
5. **Phone pass + quality standard.** 390 / 768 / 1280, then the phone graphic check (see "Known limit"), then screenshots.
6. **Publish.** Follow the plan's GitHub Pages steps, then open the live link on a phone.

After each unit, have a fresh session grade it against its spec, then update STATUS.md.

## Frozen (not in this build)

Everything on the plan's frozen list, plus:

- tabs, pages, F-key navigation, the boot sequence and the "GO" tour from the retired design;
- per-project exploded drawings and per-project `graphic.svg` on the page;
- stack-chip lists of tool names;
- any skill beyond the 8;
- a light theme;
- the design file's `email` editor prop (production hard-codes the address).

## Open inputs (placeholders until the owner supplies them)

- Last name: `[LAST NAME]` in the header.
- Email: `[YOUR EMAIL]` in the header, footer and copy button.
- GitHub username, for the live link.
- Each demo's `screenshots\desktop.png`, which arrives as each demo is copied into `demos\`.
- Optometry: its demo, plus updated line, description and proof once its spec arrives (`Handoffs\handoff-eye-care.md`). Until then, it stays "IN PROGRESS" with DEMO COMING SOON.
