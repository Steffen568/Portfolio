# Handoff: SlateHub — portfolio demo

Project: SlateHub. Paste together with `handoff-COMMON.md`. Do this one first of all six: it is already plain files on GitHub Pages, so it is the rehearsal for the others.

## Finish line

A prospective client on a phone opens one MLB slate, builds lineups with the optimizer, and uses the late-swap feature on a game that has already started, all from sample data. Done when a stranger can do that with no help.

## Scope

- One slate (pick a past slate with a complete player pool and at least one game that was in progress at lock, so late-swap has something to do). Record the slate and date in DEMO_CARD.md.
- The real front end, unchanged in look.
- Everything the app reads from Supabase for that slate is exported once to JSON in `data\`. Replace the Supabase calls with reads from those files for this build. The jsLPSolver library ships inside `assets\`; no CDN.
- Build lineups works. Late-swap works against the frozen "games started" state captured in the data. Any export or save-to-account action is disabled per the common rules.
- A "How this is built" panel from the banner: the three-agent refresh pipeline in plain words (three separate jobs run at the same time to collect data faster), what Supabase holds, and that the solver runs in the browser.
- Demo banner: "Demo · one slate snapshot · <date> · not live".

## Frozen

Other slates. Live Supabase. Account features. Exports.

## DEMO_CARD.md specifics

- Status: Live (personal tool, GitHub Pages).
- "Built with": plain HTML/CSS/JavaScript (no framework, say why that was the right call), Supabase (a hosted database), jsLPSolver (a library that solves "best lineup under a salary cap" math in the browser), GitHub Pages.
- "How it's put together": the refresh pipeline writes to Supabase; the page reads from it; the solver runs on the visitor's device.
- "Data in": each feed the refresh pipeline pulls, with fields and timing.

## graphic.svg

Left: a box "Refresh pipeline" with three small parallel boxes inside labeled "Agent 1", "Agent 2", "Agent 3" and arrows into a cylinder-ish box "Supabase (slate data)". Arrow to a box "Browser" containing "Player pool" → "Solver (jsLPSolver)" → "Lineups". From "Lineups" a curved arrow back to "Solver" labeled "Late swap: re-solve after lock, locked players fixed". Caption: "No server at run time. The solving happens on the visitor's device."
