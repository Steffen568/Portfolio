# Handoff: Eye-care practice redesign — portfolio demo

Project: Advanced Eye Care redesign. Paste together with `handoff-COMMON.md`.

**Do this after the guided-tour front door and the site restyle are built.** Until then the portfolio card shows "In progress" with the graphic only.

## Finish line

A prospective client on a phone opens the demo, lands on the guided-tour front door, picks a "why are you visiting" route, follows it to the end, and can also reach the traditional full-site home and the Español tour, with no sign anywhere of which real practice this is. Done when a stranger can do that and nobody could identify the practice.

## Anonymization (a gate)

Nothing in `portfolio-demo\` may identify the practice. Before handing off, search the whole folder, including image file names, alt text, page titles and metadata, for:

- the practice name and its initials
- the doctors' names
- the street address, phone number, email, website address
- any photo of the real office, staff or doctors (replace with clearly labeled placeholder images: "Office photo goes here")
- the logo

Replace the practice name everywhere with "the practice". Replace doctor names with "Dr. A" and "Dr. B" and keep their credential types generic ("optometrist, 25+ years"). The card and the demo describe it as "a concept redesign for an optometry practice (name withheld)".

## Scope

- The guided-tour front door: load, hero, welcome, the "why are you visiting" tiles, each route to its end, the link to the traditional home, the Español tour.
- The restyled site pages that exist at build time.
- Static export with relative paths. Demo banner: "Demo · concept redesign · practice name withheld · forms and outside links disabled".
- Appointment booking, contact and insurance forms disabled per the common rules.

## Frozen

Pages not yet built. Any real photo. Any real name.

## DEMO_CARD.md specifics

- Status: In progress · concept.
- "What it does" must explain the guided-tour idea in plain words: instead of one home page for everyone, the visitor says why they came and gets a short route built for that reason.
- "Built with": the real stack of this project.
- "Data in": the practice's text and credential details; no live feeds.

## graphic.svg

A fork diagram. Left: one box "Front door: why are you visiting?". From it, four arrows to four boxes, one per tile route (use the actual tile names). Each route box has a short arrow to a box "Book / call (disabled in demo)". Below the fork, two side exits: "Traditional full site" and "Tour in Español". Caption at the bottom: "Concept redesign · optometry practice · name withheld".
