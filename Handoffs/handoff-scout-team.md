# Handoff: Scout Team — portfolio demo

Project: Scout Team (CFB Hub). Paste together with `handoff-COMMON.md`. The Wire has its own handoff; do this one first.

## Finish line

A prospective client on a phone opens one game in the Game Center and uses all three tabs, each fully populated, and understands what each tab tells them without being a CFB expert. Done when a stranger can do that with no help and no broken view.

## Scope

- One game, chosen for a clean, complete data set with no missing fields (pick one from the current season where every tab has real content). Record which game and date in DEMO_CARD.md.
- All three tabs working with their real visual encoding, charts and cards, exactly as the real app renders them.
- Everything the app would fetch for that game, from the backend, the database, CFBD, PFF and SIS, is pulled once and saved as JSON in `data\`. The demo reads those files. Confirm in the Network tab that nothing leaves the folder.
- SIS, PFF and CFBD-derived figures may appear in the demo; this is a non-commercial portfolio. Keep the attribution the real app shows.
- A "How this is built" panel reachable from the banner, listing in plain words: where the data comes from, how often the real app refreshes it, what runs on the server versus in the browser.
- Demo banner: "Demo · one game snapshot · <Away at Home, date> · not live".

## Frozen

The game list, search, other games, the Black Board, the Wire, anything that needs a login or live data.

## DEMO_CARD.md specifics

- Status: Live beta (taken offline; runs locally).
- "Built with": the full real stack, front end and back end, hosting, database, and each data vendor with a plain-words note.
- "How it's put together": the refresh pipeline in two or three sentences, then the Game Center's components across the three tabs.
- "Data in": CFBD (what fields), PFF (what fields), SIS (what fields), the DraftKings slate.

## graphic.svg

Three panels side by side, one per tab, each with the tab's real name as its title and one line of 8–12 words on what the visitor learns there. Above the three panels, one bar labeled "One game" with three small input boxes feeding into it: "CFBD", "PFF", "SIS". Below the panels, one line: "No projections. No written takes. The data is shown, not narrated."
