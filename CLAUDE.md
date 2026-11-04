# CLAUDE.md — Portfolio

Guidance for Claude Code in this repository. Ported 2026-11-02 from the Advanced Eye Care `CLAUDE.md` (rules 0–16, the verify gate, the hooks), which came from Holy Cross and Scout Team. Rewritten 2026-11-03 for the one-page redesign; the three-page terminal site (v1) is frozen on branch `v1-terminal`. Same discipline. The threat model here: **a page that looks finished but breaks on a stranger's phone**, and **a word or animation that drifts from the approved design**.

**This file has a hard 20,000-character ceiling** (`scripts/verify.sh`). Rules only. The story behind a rule goes in the spec or doc it cites.

## Project Overview

One static page that hosts Steffen's portfolio: a header (the 5-second read), a stage with the environment graphic in the middle and six project cards around it, one project panel, and a footer. Six frozen demos live in `demos/<name>/`. Published on GitHub Pages under `/portfolio/`. No server, no database, no backend route, no build step.

**The finish line (SCOPE.md §1):** a stranger opens one link on a phone and within about 3 seconds knows who this is, that he builds a protected, self-improving environment for AI-written software, and that it produced six real projects led by four sports data tools. One tap opens a project, one more opens its working demo. Nothing breaks, nothing scrolls sideways. **Proven when a stranger does all of that on a phone with no help.**

**Read in this order on a fresh session:** `00-PORTFOLIO-PLAN.md` → `handoff-PORTFOLIO-SITE.md` (replaces the plan's page section and the retired three-page design) → `SCOPE.md` → this file → `STATUS.md` → `specs/portfolio-site.md` → the one unit spec you are building → the matching part of `design/portfolio-design.dc.html`.

## Key Principles

1. **The design file is the look; the specs are the contract.** `design/portfolio-design.dc.html` is the source of truth for every word, color, animation and layout. Port it; never run its runtime and **never edit it**. Spec wins on behavior; design wins on look. Disagreements go in STATUS.md **Proposed changes**; nothing visible changes silently.
2. **The copy is final.** Every visible string comes from the design file (`skillList()`, `projects()` and the markup). No rewriting, no instructions to the visitor ("hover here", "tap a card"), no "this site". **One word for the system: "environment"**, never "framework" in visible text; "harness engineering" appears once, in the title line. Proposed wording goes in STATUS.md.
3. **Placeholders stay visible until Steffen supplies them.** `[LAST NAME]`, `[YOUR EMAIL]`, the Optometry demo, each demo's `screenshots/desktop.png`. Never guess one, never fill one from another source.
4. **One page, one centerpiece, one level deep.** No tabs, pages or routing between views. Nothing is added to the environment graphic unless something comes out. Card → panel → demo; nothing nests further. The stage is symmetric: two sports tools each side, websites centered below. If a request breaks one of these, say so before building it.
5. **Relative paths only.** `./assets/site.css`, `demos/holy-cross/index.html`. Never a path starting with `/`. The site lives under `/portfolio/` and must also open by double-click (`file://`).
6. **Dark only.** `color-scheme: dark`; a light-mode phone gets the same dark page. No moving background; the scanline overlay (`.crt`) never catches clicks. `scrollbar-gutter: stable`.
7. **Phone first.** 390 / 768 / 1280 px, plus 1440×900 for the above-the-fold checks. No sideways scroll; wide things scroll inside their own box. Buttons ≥ 44 px tall (any exception the handoff makes is named in the unit spec). Text never below 9 px.
8. **Skills come from one fixed list of 8**, at most 4 per project, proof lines ported word for word. No tool or brand names on cards; brand names only inside the panel's proof lines.
9. **Demos are frozen and self-contained.** A demo folder is copied in from its project and read, not rewritten here.

## Tech Stack (decided; change it only with a STATUS.md entry saying why)

- **Plain HTML, CSS and JavaScript.** No framework, no bundler, no build step. `index.html`, `assets/site.css`, `assets/site.js`, `assets/data.js` (`window.PORTFOLIO = { skills, projects }`; data in JS, not JSON, so `file://` works).
- **Fonts:** IBM Plex Mono and VT323, the design's Google Fonts, self-hosted in `assets/fonts/` (Latin set; `@font-face` inline in `index.html`). The page loads nothing from another server (STATUS change 13).
- **The URL hash** only names an open project panel (`#slatehub`); it never switches views.
- **Tests:** Playwright (Chromium) in `tests/`, run against `scripts/serve.mjs` (a tiny local file server). Dev-only; nothing in `node_modules/` ships.
- **Hosting:** GitHub Pages, branch `main`, root.
- **Not in use, do not add without a decision:** a framework, a build step, a backend, analytics, a contact form, any third-party script.

## Repository Structure

```
CLAUDE.md  SCOPE.md  STATUS.md        ← every session reads these
00-PORTFOLIO-PLAN.md  handoff-*.md    the plan and the handoffs (read-only inputs)
Handoffs/                             the six demo handoffs (for the other projects)
design/                               the approved design + the two PNGs (immutable)
specs/                                portfolio-site.md + one spec per unit; _TEMPLATE.md
index.html                            the page
assets/   site.css site.js data.js builders-map.png claude-md-anatomy.png
demos/<name>/                         one frozen demo per project (copied in)
screenshots/<unit>/                   quality-standard proof (390 and 1280)
tests/                                Playwright checks, one file per unit
scripts/  verify.sh serve.mjs hooks/
docs/history/                         what happened, by date (v1-terminal/ = the retired design's specs)
```

## Common Commands

```bash
npm run verify     # scripts/verify.sh — the gate, every Stop (< 60 s)
npm test           # Playwright checks only
npm run serve      # local site on http://127.0.0.1:4600/portfolio/ (the Browser pane uses .claude/launch.json)
```

## STATUS.md and the one-page rule

`STATUS.md` is the one page of truth: the units with their spec / build / checked state, proposed changes, open inputs, failing checks. **Ceiling: 60 lines.** History goes in `docs/history/`. A unit is Checked only after the Rule 15 review returns zero lines. Update STATUS.md in the same step as the change, never after.

---

# The rules

These apply to every task unless Steffen overrides one in the session. Bias: caution over speed on anything a visitor can see; judgment on trivial work.

## Rule 0 — Communication: plain English, always
Talk to Steffen like a smart friend who doesn't work in software. Short sentences, everyday words. First sentence = the point. No jargon without explaining it in the same sentence. **When you explain a problem:** (1) what went wrong, one sentence; (2) why it matters; (3) what you're doing about it, or what you need from him. Never paste raw errors as the explanation: translate first, output underneath. Bad news first.

## Rule 1 — Think before coding
State assumptions. Unsure → ask. A spec reads two ways → show both. Push back when a simpler approach exists.

## Rule 2 — Simplicity first
Minimum code that solves the problem. Nothing speculative, no abstraction for single-use code, no feature beyond the spec line being built.

## Rule 3 — Surgical changes
Touch only what the spec line needs. Don't "improve" adjacent code, comments or formatting. Match existing style.

## Rule 4 — Goal-driven execution
Every task starts from a spec's "Done when" line, stated as an executable check. Loop until the check passes.

## Rule 5 — Code decides, the model judges
Deterministic things (what shows above the fold, element sizes, overflow, where a connector line lands) are checked by code, not by eye. If code can answer, code answers.

## Rule 6 — One unit per session
A session builds one unit spec. Restarts beat marathons. Can't describe your state in three sentences? Write them into STATUS.md "Next" and restart.

## Rule 7 — Surface conflicts, don't average them
Spec vs design, handoff vs plan: the handoff replaces the plan's page section; the spec wins on behavior; the design wins on look. Say which you picked and why, flag the other in STATUS.md. Never blend.

## Rule 8 — Read before you write
Read the part of the design you're porting, the code you're touching and what calls it. Before porting a string, find it in the design file.

## Rule 9 — Tests verify intent, not just behavior
A test encodes why the line matters: "the 5-second read fits above the fold at 1440×900", not "the header has a name".

## Rule 10 — Checkpoint after every significant step
What was done, what's verified (with output), what's left. Small commits, one goal each, message says what was verified.

## Rule 11 — Match the codebase's conventions, even if you disagree
Conformance beats taste inside the repo. If a convention is harmful, say so; don't fork silently.

## Rule 12 — Fail loud
"Completed" is wrong if anything was skipped. "Tests pass" is wrong if any were skipped. A placeholder left in is reported, not hidden.

## Rule 13 — Tests before implementation; tests are immutable
For every spec check that can be automated: write the test first, watch it fail, then implement. Never change a test to make it pass; a test that looks wrong is raised with Steffen.

## Rule 14 — Evidence or it didn't happen
"Done" requires pasted output of `npm run verify` and, for anything visible, screenshots at 390 and 1280 compared with the design. `scripts/verify.sh` puts every gate on its own line (`set -e` only reaches the last command of an `&&` chain; that bug hid four lint errors in Scout Team for a week). Keep it that way.

## Rule 15 — The worker is not the grader
Before a unit's STATUS line flips to Checked, a fresh chat reads the spec and the changed files with one brief: *list every "Done when" and "Must not" line not met; correctness only.* Fix, re-review. The chat that built it never grades it. Prompt in `specs/_TEMPLATE.md`.

## Rule 16 — The design and the inputs are protected
- `design/`, `00-PORTFOLIO-PLAN.md`, `handoff-*.md` and `Handoffs/` are never edited or deleted from a session (hook blocks shell deletes).
- `demos/<name>/` is copied in by Steffen; a session reads it and links to it, and changes it only when a spec says so.
- No destructive git (`push --force`, `reset --hard`, `branch -D`, `clean -f`), no `rm -rf` on repo folders. Hook blocks them.
- No absolute path (`href="/…"`, `src="/…"`) in `index.html` or `assets/` (verify blocks it).

## Unit Definition of Done
No unit flips to Checked without all five: each "Done when" line mapped to a test or a written manual check → `npm run verify` green with output pasted → screenshots at 390 and 1280 → Rule 15 review listing zero unmet lines → STATUS.md updated. "Done" for the whole site is a stranger's phone.

## The ratchet
Every escaped defect becomes a permanent guardrail the same week: a test in `tests/`, a hook, a rule here, or a spec clarification. Log it in `docs/failure-log.md`: date · what escaped · which guardrail now catches it. (Carried over from v1: a top bar that "breathed" → no motion in fixed chrome; a hidden view still showing → hide with the `hidden` attribute, and test it; short shared class names breaking hover → prefix new graphic classes; the clock reading 24:xx at midnight → `hourCycle: 'h23'`.)

## The autonomy dial

| Work type | Autonomy | Required gates |
|---|---|---|
| Visible words, the environment graphic, anything copied from a demo's card | **Low** | Port from the design exactly → Rule 15 review → Steffen reads the screenshots |
| Layout, the stage grid, connector lines, the panel, animations | Medium | Tests + verify green; Steffen spot-checks against the design |
| Test scripts, docs, hosting config | High | Verify green |

Goal-setting, scope and "no" stay human.
