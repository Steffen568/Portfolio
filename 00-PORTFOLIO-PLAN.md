# Portfolio — Plan and Setup

This is the master plan. Read it first. The six `handoff-*.md` files each go to one project.

## Finish line

A prospective client opens one link on their phone, sees who Steffen is and how he works, and can click into a working demo of any of six projects without anything breaking. Done when a stranger can do that on a phone with no help.

## Structure

One new project hosts everything. Nothing in it needs a server, database or backend route. Every demo runs entirely in the visitor's browser from files sitting in a folder.

```
Desktop\WebDev\Portfolio\
  CLAUDE.md              rules for this project (same template as the others)
  STATUS.md              one page of truth
  SCOPE.md               what is in, and the frozen list
  index.html             the portfolio page itself
  assets\
    builders-map.png     process graphic 1
    claude-md-anatomy.png  process graphic 2
    cards\               one SVG graphic per project (comes from each demo folder)
  demos\
    holy-cross\          copied from HolyCrossRevamp\portfolio-demo\
    eye-care\            copied from the AEC project's portfolio-demo\  (later)
    scout-team\          copied from Scout Team's portfolio-demo\
    the-wire\            copied from Scout Team's portfolio-demo-wire\
    slatehub\            copied from SlateHub\portfolio-demo\
    scout-dfs\           copied from SCOUT_DFS\portfolio-demo\
```

Each `demos\<name>\` folder is self-contained: an `index.html`, its own styles and scripts, a `data\` folder with the one-game or one-slate sample as JSON, `DEMO_CARD.md`, `graphic.svg` and a `screenshots\` folder. The portfolio page links to `demos/<name>/index.html`.

## The portfolio page (index.html)

Sections, top to bottom:

1. **Header.** Full name, one line on what he does ("I design and direct software builds. An AI writes the code; I set the environment, the standards and the finish line."), email shown as selectable text with a copy button, location (Temple, TX).
2. **How I work.** This is the differentiator and it goes above the projects. Two graphics, each with a short explanation beside it:
   - *The Builder's Map.* What it is: a method for one person building software with an AI that writes the code. Seven skills, two loops, five phases, four gates. Why it matters to a client: it's how scope gets cut, how "done" gets defined before work starts, and how work gets checked by someone who didn't write it. Note that it was assembled by Steffen from many sources over a long period.
   - *The CLAUDE.md anatomy.* What it is: the rules file every project carries, read by the AI at the start of every session. Why it matters to a client: it sets the code standards, the protections (what the AI may never do), and the verify gate that runs before anything ships. The skill is building this environment, not typing prompts.
3. **Websites.** Two cards: Holy Cross (Phase 1, pending board approval) and the anonymous optometry practice (in progress).
4. **Sports and data tools.** Four cards: Scout Team, The Wire, SlateHub, SCOUT DFS.
5. **Footer.** Email again, and the line "All demos are frozen snapshots on sample data. Forms and outside links are turned off."

Each project card has, in this order: the project's `graphic.svg` (full width of the card), the project name, a one-line status pill (Live / Phase 1 / In progress / Personal tool), the caption written from `DEMO_CARD.md` (three to five sentences, plain language), a row of stack chips (the real languages and services from `DEMO_CARD.md`), a "Data in" line, and an "Open demo" button.

Card wording rules, from the audit framework: no opinions unless proven, no overselling, state what it does and let the reader decide.

## Quality standard (applies to the portfolio page and every demo)

Not done until every line passes. The project session runs this itself before handing anything back and records the result in STATUS.md.

- Works at phone width (390 px), tablet (768 px) and desktop (1280 px). Checked at all three.
- The page never scrolls sideways. Nothing overflows its box. Text wraps; it does not shrink into a strip or get cut off.
- Images, charts and tables fit their container. A wide table scrolls inside its own box, not the page.
- No overlapping elements. No font falling back to a default. No broken images. No empty boxes waiting on data that never comes.
- Everything meant to be seen is visible on load. Nothing hidden until scrolled.
- Buttons and tabs are at least 44 px tall and work by tap.
- Zero errors in the browser console on load and after clicking every tab and button.
- Looks right in light and dark mode (the visitor's phone setting decides).
- Screenshots at phone and desktop width saved in `screenshots\` as proof.

## Hosting on GitHub Pages

Do this once, after the Portfolio project has an `index.html`.

1. Open a browser and go to github.com. Sign in.
2. Top right, click the **+** button, then **New repository**.
3. Repository name: `portfolio`. Leave it Public. Do not tick any of the "initialize" boxes. Click **Create repository**.
4. Open the Claude desktop app, Code tab, Portfolio project. Ask it: "Connect this folder to the GitHub repository at `<paste the URL GitHub shows you>`, commit everything, and push to the `main` branch."
5. Back on github.com, open the `portfolio` repository. Click **Settings** (top tab), then **Pages** in the left menu.
6. Under "Build and deployment", set Source to **Deploy from a branch**. Under Branch, pick **main** and **/ (root)**. Click **Save**.
7. Wait about two minutes, refresh the Pages settings page. It shows the live link, which looks like `https://<your-github-username>.github.io/portfolio/`. That is the link to send clients.

Every later change: ask the Portfolio project to "commit and push", wait two minutes, refresh.

Because the site lives under `/portfolio/` and not at the root, every demo must use relative links (`./data/game.json`, never `/data/game.json`). Each handoff doc says so.

## Copying a demo into the portfolio

After a project session reports its demo done:

1. Open File Explorer. Go to Desktop, WebDev, the project folder (for example HolyCrossRevamp).
2. Right-click the `portfolio-demo` folder, choose **Copy**.
3. Go to Desktop, WebDev, Portfolio, demos. Right-click empty space, choose **Paste**.
4. Rename the pasted folder to the name in the structure above (for example `holy-cross`).
5. Open the Portfolio project in the Code tab and say: "A new demo is in `demos\holy-cross`. Read its `DEMO_CARD.md` and `graphic.svg`, add or update its card on index.html, run the quality standard, update STATUS.md."

## Order of work

1. Create the Portfolio project and its `index.html` with the header and the How I Work section. Publish to GitHub Pages so the link exists from day one.
2. SlateHub demo (already plain files, already on GitHub Pages: the easiest, and the rehearsal for the others).
3. Holy Cross demo.
4. SCOUT DFS demo.
5. Scout Team demo, then The Wire demo (same project, two handoffs).
6. Eye care: after the tour and restyle are built. Its card shows "in progress" until then.

## Frozen list

Not in this build: a contact form, a blog, analytics, a custom domain, live data in any demo, a dark-mode toggle button (the phone setting handles it), a PDF version.

## Open inputs

- Full name as it should appear.
- Email address to show.
- GitHub username (for the link).
