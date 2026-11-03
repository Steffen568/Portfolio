# Scope: Portfolio

Sources: `00-PORTFOLIO-PLAN.md` (structure, hosting, demos, quality standard) and `handoff-PORTFOLIO-SITE.md` (the site itself; it replaces the plan's page section and card layout). Where they differ, the handoff wins.

## 1. Finish line

> A prospective client opens one link on a phone and moves through three pages: Home, Projects and How I work. They watch a project's drawing take itself apart, open any working demo, and see the framework that every project is built inside. Nothing overlaps, nothing breaks, and nothing scrolls sideways.

**The test:** a stranger does all of that on their own phone, with no help. Anywhere they get stuck counts as "not done."

---

## 2. What the site is (fixed; do not change)

| | Decision |
|---|---|
| **For** | A prospective client, often on a phone, often not technical. |
| **Says** | Steffen builds the framework the AI works inside, and here are six real projects built inside it. |
| **Look** | Bloomberg terminal crossed with retro-futuristic hacker. Amber on near-black, CRT scanlines, mono type. Dark only. |
| **Theme** | Exploded-view drawings: each project and the framework drawn as its own parts. |
| **Design** | `design/portfolio-design.dc.html`: finished, the source of truth for look and copy. |
| **Tech** | Plain HTML/CSS/JS, no build step, GitHub Pages under `/portfolio/`. |

---

## 3. What is in

| # | Unit | What it delivers |
|---|---|---|
| 1 | Shell | Top bar, hash routing between three pages, contact footer with copy email, F4 scroll + flash, clock, boot screen, scanline overlay, tokens and fonts |
| 2 | Drawing engine + Home | The hero drawing; hover / pin / legend / detail-card engine shared by all eight drawings; bio; cartridge links |
| 3 | Projects | The six-project cycle, selected-project layout, screenshot frame with placeholder, previous / next, GO tour, six drawings and their data |
| 4 | How I work | The loop (with pause), the CLAUDE.md drawing, the Builder's Map phase, the two full-graphic windows |
| 5 | Phone pass + quality standard | Everything at 390 / 768 / 1280, screenshots saved |
| 6 | Publish | GitHub Pages, then the live link on a phone |

**Demos (copied in as each project finishes):** SlateHub → Holy Cross → SCOUT DFS → Scout Team → The Wire → Optometry (last; "coming soon" until then).

---

## 4. Frozen list

Not deleted. Not in this build.

| Item | Source |
|---|---|
| A contact form | Plan |
| A blog | Plan |
| Analytics | Plan |
| A custom domain | Plan |
| Live data in any demo | Plan |
| A dark-mode toggle (dark only by design) | Plan + handoff |
| A PDF version | Plan |
| The design file's accent-color option (production is `#ffa028` only) | Handoff |
| Any drawing beyond the eight | Handoff |
| Per-demo `graphic.svg` on the page (the drawings replace them; demo folders still carry theirs) | Handoff |
| Stack chips on project cards | Handoff |
| A light theme | Handoff |

The pitfall to watch for: "while you're in there." Anything frozen that slips in for free makes every future frozen item look free too.

---

## 5. Inputs only Steffen can give

Each shows as a visible placeholder until supplied.

- Full name: `[LAST NAME]` in the top bar and the Home title.
- Email: `[YOUR EMAIL]` in the footer and the copy button.
- GitHub username, for the live link.
- Optometry: the demo, its screenshot, a new drawing and copy once its spec arrives (`Handoffs/handoff-eye-care.md`).
- Each demo's `screenshots/desktop.png`, which arrives as each demo is copied into `demos/`.

---

## 6. Quality standard (applies to every unit)

From the plan, with the handoff's change on theme:

- Works at 390, 768 and 1280 px. Checked at all three.
- The page never scrolls sideways. Nothing overflows its box. Text wraps; it never shrinks into a strip or gets cut off.
- Images, charts and tables fit their container. Wide things scroll inside their own box.
- No overlapping elements. No font falling back to a default. No broken images. No empty boxes.
- Everything meant to be seen is visible on load.
- Buttons and tabs at least 44 px tall and work by tap.
- Zero console errors on load and after clicking every tab and button.
- **Dark theme by design; `color-scheme: dark`; still readable when the phone is set to light mode.**
- Screenshots at phone and desktop width saved as proof.

Added by the handoff:

- At 390 px the loop and CLAUDE.md drawings stack, and every label in them can be read (never below 9 px).
- The phase map scrolls sideways inside its box at 390 px; the page does not.
- Switching every page and every project shows only one page at a time.
- Every demo link opens `demos/<name>/index.html` under `/portfolio/`, relative paths only.
