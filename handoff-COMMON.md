# Common rules for every portfolio demo

Paste this into the project session together with that project's handoff file. These rules apply to all six demos.

## What a demo is

A frozen snapshot of the real project, running entirely in the visitor's browser from files in one folder, with the real project's look and the real project's logic, on one game or one slate of sample data. No server. No database. No live API calls. No login.

## Deliverable: the `portfolio-demo\` folder

Create it at the root of this repository. It must contain:

```
portfolio-demo\
  index.html          entry point; opens directly in a browser with no server
  assets\             styles, scripts, fonts, images the demo needs
  data\               the sample data as JSON files (one game / one slate only)
  DEMO_CARD.md        the project explained for the portfolio card (format below)
  graphic.svg         the project explained as one picture (spec in the project handoff)
  screenshots\
    phone.png         390 px wide, full page
    desktop.png       1280 px wide, full page
```

Rules for the folder:

- **Relative paths only.** `./assets/app.js`, `./data/game.json`. Never a path starting with `/`. The demo will be served under `/portfolio/demos/<name>/`, and absolute paths break there. If this project is built with a framework (Astro, Vite, React, Next), set its base path to relative (`base: './'` or the framework's equivalent) for this build.
- **Nothing reaches the network.** Every place the real app calls an API, a database or a file on a server, the demo reads the matching JSON file from `data\` instead. Before handing off, open the browser's Network tab and confirm the only requests are to files inside `portfolio-demo\`.
- **No secrets.** Search the whole folder for API keys, tokens, passwords, database URLs and `.env` contents. None may be present. This is a gate, not a suggestion.
- **Forms and outside links are off.** Inputs that would send data are disabled and show "Demo only" on hover or tap. Links to outside sites, payment pages, logins or the real app point nowhere (`href="#"`) and show "Disabled in demo". Navigation *inside* the demo works fully.
- **Demo banner.** A thin bar at the top of every page: "Demo · frozen snapshot · <game or slate description> · forms and outside links disabled". It must not cover content on a phone.
- **Size.** Keep the folder under 25 MB. Strip data to the one game or slate. Compress images.
- **Self-contained.** Copying the folder anywhere and double-clicking `index.html` must work.

## DEMO_CARD.md format

Plain language. A non-technical reader must not need to look anything up. Every technical term gets a parenthetical in plain words the first time.

```
# <Project name>

**Status:** <Live / Phase 1 / In progress / Personal tool>
**One line:** <what it does, for whom, in under 20 words>

## What it does
<3–5 sentences. What a person uses it for and what they get out of it.>

## Built with
<Bullet list: each language, framework, library and service the REAL project uses, with a plain-words note. Example: "Astro (a tool that turns reusable page pieces into a plain, fast website)".>

## How it's put together
<3–6 sentences on the structure: what the pieces are and how they talk to each other. Where data is stored. What runs when.>

## Data in
<Bullet list: every data source the real project calls or takes in. Name the source, what fields it provides, how often it's pulled.>

## Data out
<What the tool produces: a page, a report, a lineup file, a post.>

## What this demo shows
<What the sample is (which game/slate, what date), what works, what's turned off.>
```

## Quality standard

Not done until every line passes. Run it yourself before reporting done, and record each line's result in STATUS.md.

- Works at phone width (390 px), tablet (768 px) and desktop (1280 px). Check all three.
- The page never scrolls sideways. Nothing overflows its container. Text wraps; it never shrinks into a strip or gets cut off.
- Images, charts and tables fit their container. A wide table scrolls inside its own box with `overflow-x: auto`, never the page.
- No overlapping elements. No font falling back to a default (check the computed font on headings and body). No broken images. No empty boxes waiting on data.
- Everything meant to be seen is visible on load. Nothing hidden behind a scroll trigger.
- Buttons and tabs are at least 44 px tall and work by tap.
- Zero console errors on load and after clicking every tab and button.
- Correct in light and dark mode.
- `screenshots\phone.png` and `screenshots\desktop.png` saved as proof.

## graphic.svg rules

- One SVG file, hand-readable, no embedded raster images.
- Width 800, height between 300 and 500. It will be shown at full card width, so text must be readable at 360 px wide: minimum font size 14 at the SVG's own scale, and no more than about 40 words total.
- Uses `currentColor` for text and lines so it reads in light and dark mode; one accent color only.
- Boxes with short labels and arrows. No decoration, no logos, no photos.
- The project handoff says exactly which boxes and arrows.

## Process

Follow the Builder's Map. The finish line is in the project handoff. Write `specs/portfolio-demo.md` from the handoff before building. Build. Run the quality standard. Have a fresh session grade the result against the spec. Flip STATUS.md. Then report done with the path to the folder.
