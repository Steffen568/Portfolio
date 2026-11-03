# Scope: Portfolio

Sources: `00-PORTFOLIO-PLAN.md` (structure, hosting, demos, quality standard) and `handoff-PORTFOLIO-SITE.md` (the one-page site; it replaces the plan's page section and the retired three-page design). Where they differ, the handoff wins.

## 1. Finish line

> A stranger who looks at dozens of portfolios a week opens one link on a phone. Within about 3 seconds they know who this is; that he builds a protected, self-improving environment for AI-written software; and that it has produced six real projects, led by four sports data tools. One tap opens any project, and one more opens its working demo.

**The test:** that stranger does all of it on their own phone with no help, nothing breaks, and nothing scrolls sideways. Anywhere they get stuck counts as "not done."

---

## 2. What the site is (fixed; do not change)

| | Decision |
|---|---|
| **For** | A prospective client, often on a phone, often not technical, giving it seconds, not minutes. |
| **Says** | Steffen builds the environment AI works inside, and here are six real projects built inside it. |
| **Shape** | One page. Header (the 5-second read) → the stage (environment in the middle, sports tools two each side, websites centered below) → footer. One panel per project. |
| **Look** | Retro-futuristic terminal: amber on near-black, faint CRT scanlines, mono type. Dark only. |
| **Design** | `design/portfolio-design.dc.html`: finished, the source of truth for look and copy. |
| **Tech** | Plain HTML/CSS/JS, no build step, GitHub Pages under `/portfolio/`. |

---

## 3. What is in

| # | Unit | What it delivers |
|---|---|---|
| 1 | Shell + header | Tokens, fonts, scanlines; header with clock, name, title, headline, bio, the skills row (static), contact + copy email; footer |
| 2 | Environment graphic | The SVG and its 14-second loop, the three tiles with spotlight, the two full-graphic windows |
| 3 | Cards + connectors | The symmetric stage grid, six cards with hover effects and scramble, the measured connector lines |
| 4 | Skills + panel | Skills filter and definition line, chips, the project panel with proof lines, hash linking |
| 5 | Phone pass + quality standard | 390 / 768 / 1280, the phone graphic check, screenshots |
| 6 | Publish | GitHub Pages, then the live link on a phone |

**Demos (copied in as each project finishes):** SlateHub → Holy Cross → SCOUT DFS → Scout Team → The Wire → Optometry (last; "DEMO COMING SOON" until then).

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
| Tabs, pages, F-key navigation, the boot sequence and the "GO" tour (the retired design) | Handoff |
| Per-project exploded drawings and per-project `graphic.svg` on the page | Handoff |
| Stack-chip lists of tool names | Handoff |
| Any skill beyond the 8 | Handoff |
| A light theme | Handoff |
| The design file's `email` editor prop (production hard-codes the address) | Handoff |
| The phone-only fallback graphic (approved, but only built if Steffen says so after the real-phone check) | Handoff |

The pitfall to watch for: "while you're in there." Anything frozen that slips in for free makes every future frozen item look free too.

---

## 5. Inputs only Steffen can give

Each shows as a visible placeholder until supplied.

- Last name: `[LAST NAME]` in the header.
- Email: `[YOUR EMAIL]` in the header, the copy button and the footer.
- GitHub username, for the live link.
- Each demo's folder and `screenshots/desktop.png`, as each demo is copied into `demos/`.
- Optometry: its demo, plus updated line, description and proof once its spec arrives (`Handoffs/handoff-eye-care.md`).

---

## 6. Quality standard (applies to every unit)

From the plan, with the handoff's changes:

- Works at 390, 768 and 1280 px. Checked at all three.
- The page never scrolls sideways. Nothing overflows its box. Text wraps; it never shrinks into a strip or gets cut off.
- Images and wide things fit their container or scroll inside their own box (the skills row on phones).
- No overlapping elements. No font falling back to a default. No broken images. No empty boxes.
- Everything meant to be seen is visible on load.
- Buttons at least 44 px tall and work by tap.
- Zero console errors on load and after clicking every button.
- **Dark by design; `color-scheme: dark`; still readable when the phone is set to light mode.**
- Screenshots at phone and desktop width saved as proof.

Added by the handoff:

- **The 3-second test:** shown the page at 1440×900 for 3 seconds, someone can say his name, "environment", and at least one of protects / efficient / self-learning.
- **At 1440×900:** the header, the whole environment window and all four sports cards are visible without scrolling; left and right card edges line up.
- Connector lines land on their cards at 1100, 1280 and 1440 px, and after a resize.
- One level deep: card → panel → demo. Nothing else opens anything.
- Every skill button filters the right cards, and every pinned filter unpins.
- Every demo link opens `demos/<name>/index.html` under `/portfolio/`, relative paths only.
