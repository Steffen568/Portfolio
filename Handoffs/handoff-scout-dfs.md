# Handoff: SCOUT DFS — portfolio demo

Project: SCOUT_DFS. Paste together with `handoff-COMMON.md`.

This is the one demo that must *work* rather than show. A classic optimizer is best understood by pressing Build and watching lineups appear.

## Finish line

A prospective client on a phone opens one sample slate in the SCOUT<DFS> terminal, adjusts a couple of settings, presses Build, and gets a set of valid lineups in under three seconds, all in the browser. Done when a stranger can do that with no help and every lineup produced is valid under the real rules.

## Scope

- One slate, one sport (pick the sport whose rules are cleanest to show; record it in DEMO_CARD.md). The full player pool with salaries and projections saved as JSON in `data\`. Projections may be the real ones used that day.
- The terminal's real look.
- **The solver runs in the browser.** If the real solver already runs in JavaScript, reuse it. If it runs in Python or on a server, port *the constraints* (salary cap, roster slots, team limits, stacking rules, exposure limits, uniqueness between lineups) to jsLPSolver for this demo, the way SlateHub does. Ship the library inside `assets\`. The spec must list every constraint and the fresh-grader must check each one against the produced lineups.
- Controls that work: number of lineups (cap at 20 for speed), min/max exposure, lock and exclude a player, one stacking rule. Everything else visible but disabled with "Demo only".
- Late-swap pool shown but disabled.
- A "How this is built" panel from the banner: inputs, the rules the solver enforces (listed), where the solver runs.
- Demo banner: "Demo · one slate · sample projections · solver runs on your device".
- Speed gate: 20 lineups in under 3 seconds on a phone. If not, cut the pool to the top N by projection and say so in the panel.

## Frozen

Other sports. Live data. Saved settings. Export to DraftKings.

## DEMO_CARD.md specifics

- Status: Personal tool (runs locally).
- "Built with": the real stack, and name the solver library and what "linear programming" means in plain words (picking the best combination under a set of hard limits).
- "How it's put together": inputs → rules → solver → lineup cards → late-swap pool.
- "Data in": the DraftKings salary file (fields), projections (where from), news/injury inputs if any.

## graphic.svg

Left: three stacked input boxes "Player pool + salaries", "Projections", "Your settings (locks, exposure, stacks)". Arrows into a center box "Solver" with the rules listed inside as short lines: "Salary cap", "Roster slots", "Team limits", "Stacks", "Exposure", "Unique lineups". Arrow out to a right box showing three small lineup cards stacked. Caption: "Press Build. Every lineup is valid under every rule."
