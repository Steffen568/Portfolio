# Handoff: The Wire — portfolio demo

Project: Scout Team (CFB Hub), the Wire. Paste together with `handoff-COMMON.md`. Build this into `portfolio-demo-wire\` so it does not collide with the Game Center demo folder.

This demo exists to show API work and analytics research, so the pipeline is part of what the visitor sees, not just the output.

## Finish line

A prospective client on a phone opens one DraftKings slate's Wire report, reads the packaged output, and can open a pipeline view that shows what data came in, what was done to it, and what came out. Done when a non-DFS reader can say in one sentence what the Wire does.

## Scope

- One slate: the same week as the Scout Team demo game if possible. The full Wire output for that slate (the worksheet that sweeps the brief for matchup-data gaps, and the Hribar-style line/fact output) exactly as the real tool renders it.
- Every input the Wire ingested for that slate saved as JSON in `data\`: the SIS pull (the fields actually used), the DraftKings slate file, and any intermediate tables. The demo renders from these.
- A **Pipeline view** (a second screen, reachable from the banner and from a tab): three columns, Inputs / Processing / Output.
  - Inputs: each source as a card with the real field names used and the row count for this slate.
  - Processing: each step the real code performs, in order, in one plain sentence each (joins, filters, the tendency / volume / adjusted quality / raw quality marking, the gap sweep). Taken from the code, not written from memory.
  - Output: the report sections and what decision each one feeds.
  - Clicking an input card shows the first 20 rows of that JSON in a table (scrolls inside its own box).
- Demo banner: "Demo · one slate snapshot · <slate name, date> · not live".

## Frozen

Other slates. Live refresh. The Black Board. Model-written prose of any kind.

## DEMO_CARD.md specifics

- Status: Personal research tool (part of Scout Team).
- "How it's put together" is the pipeline: ingest → transform → package, with where each step runs.
- "Data in": SIS (fields, pull frequency), DraftKings slate (fields), anything else the code reads.
- "Data out": the worksheet and the fact lines, and what decision they feed (player pool and exposure).

## graphic.svg

A left-to-right pipeline. Left: two input boxes stacked, "SIS data" and "DraftKings slate". Arrows into a middle box "The Wire" containing three stacked steps: "Join and filter to the slate", "Mark every figure: tendency / volume / adjusted quality / raw quality", "Sweep for matchup gaps". Arrow out to a right box "Report" containing "Gap worksheet" and "Fact lines". Below the right box: "feeds player pool and exposure decisions".
