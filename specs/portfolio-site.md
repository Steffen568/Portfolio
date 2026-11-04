# Portfolio site — the whole-site spec

**Source:** `handoff-PORTFOLIO-SITE.md` (this file is written from it; where they differ, the handoff wins and this file gets fixed). Look and copy: `design/portfolio-design.dc.html`.
**Units:** `specs/01-shell-header.md` … `specs/06-publish.md`, one per session, in order.

Purpose:
The finish line in SCOPE.md §1: a stranger on a phone knows in about 3 seconds who this is, that he builds a protected, self-improving environment for AI-written software, and that it produced six real projects led by four sports data tools; one tap opens a project, one more opens its demo; nothing breaks or scrolls sideways.

Done when (whole site; each unit spec owns its slice):
1. One page, no views to switch. The hash only names an open panel (`#slatehub`); loading it opens that panel; Back closes it.
2. At 1440×900, without scrolling: the header, the whole environment window and all four sports cards. Left and right card edges line up.
3. The environment graphic plays its 14-second loop as designed; reduced motion shows it still and complete.
4. Card → panel → demo, one level deep. Every demo link is relative (`demos/<name>/index.html`) and opens under `/portfolio/` on GitHub Pages and by double-click.
5. Every skill button filters the right cards; every pinned filter unpins.
6. The quality standard in SCOPE.md §6 passes at 390 / 768 / 1280, with screenshots saved.
7. A stranger completes the finish line on their own phone.

## Files

```
index.html                 markup: scanlines, header, stage, footer, scrim, panel, image windows
assets/site.css            tokens, components, keyframes (ported from the design's <style>)
assets/site.js             clock, copy email, skills filter, tiles, card hover + scramble, connectors, panel, windows
assets/data.js             window.PORTFOLIO = { skills, projects }   (from skillList() / projects(), same shape)
assets/builders-map.png    copied from design/
assets/claude-md-anatomy.png
```

Data stays in `data.js`, not JSON: a JSON file can't be fetched when `index.html` is opened by double-click.

## Look (fixed)

- Retro-futuristic terminal: amber on near-black, faint CRT scanlines (`.crt`, never catches clicks), no moving background.
- Dark only; `color-scheme: dark`; the phone's light setting changes nothing.
- Fonts: IBM Plex Mono (body, labels), VT323 (name, big numbers): the design's Google Fonts, self-hosted in `assets/fonts/` (STATUS change 13).
- Tokens: `--acc #ffa028`, `--yel #f5c518`, `--org #ff6b2c`, `--grn #7cc46a`, `--red #e5534b`, `--bg #050403`, `--pan #0b0906`, `--ln #2a241b`, `--ln2 #3d352a`, `--tx #f0e9dc`, `--mu #b3a892`, `--dim #8f8470`.
- Content max width 1440 px, centered, 24 px side padding (14 px at 640 px and below). Corners 3–6 px.
- Copy is final: descriptive, plain. No instructions to the visitor, no "this site", "environment" never "framework".

## Structure, top to bottom

**Header (the 5-second read).** Left: `TEMPLE, TX · OPEN TO PROJECTS · HH:MM CT` (America/Chicago, every 30 s, no seconds); `STEFFEN [LAST NAME]` in VT323; `AI SYSTEMS BUILDER · HARNESS ENGINEERING`; "I build the environment AI works inside."; the bio (word for word from the design), ending "…with:"; the 8 skill buttons with project counts; the definition line (`8 SKILLS ACROSS 6 PROJECTS` until a skill is active). Right: `CONTACT`, the email as selectable text, COPY EMAIL (→ "COPIED ✓" for 1.6 s).

**Stage.** Desktop grid `minmax(0,1fr) minmax(440px,580px) minmax(0,1fr)`, gap 30 px. Left: `SPORTS DATA TOOLS` · `1–2 OF 4` (Scout Team, The Wire). Center: `THE ENVIRONMENT` window. Right: mirrored heading `3–4 OF 4` (SlateHub, SCOUT DFS). Side columns stretch to equal height, cards share it (`1fr 1fr`), thumbnails 5:2. Below, centered: `WEBSITES` · `2` (Holy Cross, Optometry), each the width of a side column, thumbnails 21:9. Dashed connector lines from the window to each card (measured on load, resize, fonts ready; hidden ≤ 1000 px).

**Environment window.** Header bar, the SVG graphic (CLAUDE.md slabs, hooks, mistake log, counters, the loop with five stations and a travelling dot; 14-second cycle per the handoff's table), the three tiles PROTECTS / EFFICIENT / SELF-LEARNING (light in step; hover or tap spotlights `fx-p` / `fx-e` / `fx-s`), and CLAUDE.md ⤢ / BUILDER'S MAP ⤢ opening the PNGs in a CRT window (✕, scrim, Esc).

**Cards.** One button each: screenshot or striped placeholder (ticker + SCREENSHOT PENDING), name, status pill, one line, skill chips. Hover/focus: lift 3 px, amber border + glow, corner brackets, scan sweep, name scramble 380 ms, OPEN ▸ tag, its line brightens. Stagger in on load.

**Panel.** Scrim + CRT window: `TICKER · WEBSITE|SPORTS DATA TOOL` and CLOSE ✕; screenshot 16:10; status, name (VT323), line, description, SKILLS SHOWN (chip + proof line per skill), OPEN THE WORKING DEMO ▸ (green, 52 px, relative link) or DEMO COMING SOON (disabled, Optometry). ✕, scrim, Esc and Back close it; focus returns to the card.

**Footer.** `EVERY DEMO IS A FROZEN SNAPSHOT ON REAL DATA · FORMS AND OUTSIDE LINKS OFF` left, the email right.

## Skills

Hover/focus previews the filter (button amber, definition + "Shown in …", matching cards amber with chip filled, others dim to 32 %, matching lines brighten); leaving clears it unless pinned; tap pins; tap again unpins. Counts and "Shown in" come from `projects()`.

## Phone and tablet

≤ 1000 px: environment first, then the four sports tools (second sports heading hidden), then websites, down one dashed stem; no connector lines; cards size to content.
≤ 640 px: skills row one line scrolling inside its own box (buttons ≥ 40 px); environment window full-bleed with the graphic's small labels hidden and the rest enlarged; tiles stack; cards one column, 21:9; panel stacks.

## Accessibility and motion

Reduced motion: all animation stops, the graphic shows complete with first counter values and no pops, tiles still work. Cards and skill buttons are real buttons with a 2 px amber focus outline. Panel and image windows are dialogs: focus in on open, back on close, Esc closes.
