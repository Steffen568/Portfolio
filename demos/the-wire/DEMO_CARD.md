# The Wire

**Status:** Personal research tool
**One line:** Shows a daily fantasy player where each college football defense can be attacked, and which players fit.

## What it does
A daily fantasy player builds lineups from a slate (the set of games one DraftKings contest covers). For each game on a slate, the Wire lines up each offense against the defense it faces. It lists where that defense gives up clearly more than its own average, where it holds firm, and which players sit on each. It also writes a fixed fact sheet for every game: one comparison table, fourteen set sections and a list of single stated figures, most saying how many plays they rest on, and it says so where a figure could not be stated. It states facts and leaves the choice to the reader; it does not make picks.

## Built with
- TypeScript (JavaScript with checks that catch mistakes before the code runs): the weekly build and the report logic.
- Next.js and React (tools for building web pages from reusable pieces): the Wire's screens.
- Python and FastAPI (a language and a tool for answering data requests from other programs): the private data service the Wire reads.
- SQLAlchemy (a tool that lets Python talk to a database): that service's queries.
- Postgres on Neon (a database, hosted online): everything is stored there first, so no page depends on an outside service while it loads.
- Zod (a tool that checks data has the expected shape): checks replies in the optional writing step.
- Claude Code on a Max subscription (an AI writing tool, run on one computer): optional, words the report from the checked facts. Not used in this demo.

## How it's put together
The pipeline (the chain of steps data passes through) has three stages. Ingest (bringing data in) runs on one PC, from commands the owner starts: football data, charting data (a hand record of what happened on every play) and DraftKings slates are copied into the database. Transform (working the data over) runs in the weekly build on the same PC: it reads each slate game's figures, fills in fixed sentence patterns, checks every sentence against a list of banned phrases, and stores the results. Package (making it readable) runs in the browser when the report is opened: the code narrows the data to one slate, sweeps every game situation for gaps between a defense and its own average, and chooses the players to show. A private key (a password between programs) guards the data service and stays on the server side, so it never reaches a browser.

## Data in
- **SIS DataHub** (Sports Info Solutions, a company that sells that hand record). Pulled after games and captured for each slate within its request limits, through October 2026. Fields include dropbacks (pass plays), attempts, completions, yards, EPA (expected points added, a measure of how much a play helped), carries (running plays), routes (paths a receiver ran), targets (throws at a receiver), broken tackles and yards after contact, split by coverage (how the defense guards receivers), pressure, box count (defenders near the line), blocking scheme (how the line moves on a run), depth and alignment.
- **DraftKings lobby** (its public list of contests, no login), refreshed on request. Fields: slate id, label, date, contest type (the format, such as classic or single game), game count and games. The tool also stores player prices, which its other screens use and this report's no-projection path does not.
- **CollegeFootballData** (a paid college football data service), pulled after games, within a monthly limit. Fields: games and kickoffs, box scores (each player's totals for a game), game logs (those totals game by game), per-game targets, and inputs to percentiles (a rank from 0 to 100 against other players).
- **cfbfastR** (an open college football play-by-play source), pulled after games. Fields: which player each play credits.
- **Betting lines** (through CollegeFootballData), refreshed on request. Fields: sportsbook (the betting company), spread (the expected winning margin) and total (expected combined points), opening and current.
- **ESPN and school athletics sites**, read when a season's rosters are refreshed, by hand. Fields: player, team, position and class year.
- **A projection file** (a spreadsheet of expected fantasy scores the owner uploads for each slate), optional. Fields: name, position, team, price, projected points and ownership (the share of lineups expected to use a player). It is visible only to the person who uploaded it and is not in this demo.

## Data out
- **The gap worksheet:** one game at a time, with where to attack, where the defense holds, and each chosen player's figures in those same situations. It feeds player pool decisions (who is worth considering).
- **The fact lines:** the fact sheet for each game and its stated figures. They feed exposure decisions (how much of a lineup set to put on a player).

## What this demo shows
One real slate: DraftKings Main, Friday 30 October 2026, three games (Tulane at Charlotte, Baylor at UCF, Kent State at Sacramento State), with figures as the tool held them for that week. All three tabs work: the gap worksheet, the fact lines and the pipeline view, where each input opens to its first 20 rows.

Four things differ from the real tool:
- The written paragraphs are off. The real report has an AI word its facts, so the demo shows the facts themselves.
- The raw data rows from SIS are withheld from the input tables under its licence, leaving field names, row counts and identity columns. SIS counts and rates do appear in the report's own tables and sentences, as the tool states them.
- The owner's projection file is absent, so each team shows its passer, three backs and five pass catchers by volume, with no prices.
- Uploads, writing, live refresh and the Black Board (the owner's game-by-game screen) are off.

Nothing reaches the network. Sections open with a tap, because the full fact list is too long for a phone.
