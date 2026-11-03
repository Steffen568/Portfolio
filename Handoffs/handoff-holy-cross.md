# Handoff: Holy Cross — portfolio demo

Project: HolyCrossRevamp. Paste together with `handoff-COMMON.md`.

## Finish line

A prospective client on a phone opens the demo, moves through all six Phase 1 pages in English and Spanish, and understands this is a Phase 1 concept pending the school's board. Done when a stranger can do that with no help and nothing breaks.

## Scope

- The six Phase 1 pages exactly as built, plus their Spanish twins. Real school name, colors and photos stay.
- Built as a static export of the Astro site into `portfolio-demo\` (run the production build with a relative base path; copy the output in; confirm every internal link still works from a plain folder).
- Demo banner text: "Demo · Phase 1 concept · pending board approval · forms and outside links disabled".
- Every link to SOCS, payment, donation, admissions forms, Facebook and any outside site is turned off per the common rules. The language toggle keeps working.
- A small "About this build" panel reachable from the banner: Phase 1 scope in one paragraph, what Phase 2 holds (safety, our story, academics, student life), and the line "Built for the school as a concept. Pending board approval."

## Frozen

Phase 2 pages. Any content change. Any new photo. A contact form.

## DEMO_CARD.md specifics

- Status: Phase 1 · pending board approval.
- "Built with" must name Astro, the hosting approach, the Spanish-twin approach, and how the hybrid with the school's existing SOCS platform works (the new site as public front door, existing systems kept underneath, nothing recreated).
- "Data in": the school's supplied text and photos; no live data sources. Say so plainly; a website with no data feeds is still a true answer.
- "What this demo shows": six pages, two languages, forms off.

## graphic.svg

A site map. Left: a box "Front door (new site)" containing six small boxes, one per Phase 1 page, with the Spanish twin shown as a small "ES" tag on each. Right: a box "School's existing systems" containing "Payments", "Admissions forms", "Current-family portal". Arrows from the front door to the existing systems labeled "links out, nothing rebuilt". Below, a dashed box "Phase 2 (frozen)" listing Safety, Our Story, Academics, Student Life. Caption text inside the SVG, bottom: "Concept, Phase 1 · pending board approval".
