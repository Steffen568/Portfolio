# The Wire

**Status:** Personal research tool
**One line:** Shows a daily fantasy player where each college football defense can be attacked, and which players fit.

## What it does
A daily fantasy player builds lineups from a slate (the set of games one DraftKings contest covers). Its main screen, the Black Board, reads every game on a slate from the top down: how the game is likely to go, how many plays each side gets in each version of it, then each unit and its players, with every figure colored by what kind of number it is (how often, how many, how well). For each game on a slate, the Wire also lines up each offense against the defense it faces. It lists where that defense gives up clearly more than its own average, where it holds firm, and which players sit on each. It also writes a fixed fact sheet for every game: one comparison table, fourteen set sections and a list of single stated figures, most saying how many plays they rest on, and it says so where a figure could not be stated. It states facts and leaves the choice to the reader; it does not make picks.

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
- **The Black Board:** every game on the slate, top down, from game shape to players. It feeds player pool decisions (who is worth considering), and in the real tool it is where the owner marks his stance on each player.
- **The gap worksheet:** one game at a time, with where to attack, where the defense holds, and each chosen player's figures in those same situations. It feeds player pool decisions (who is worth considering).
- **The fact lines:** the fact sheet for each game and its stated figures. They feed exposure decisions (how much of a lineup set to put on a player).

## What this demo shows
One real slate: DraftKings Main, Saturday 7 November 2026, twelve games (among them Oregon at Ohio State, Alabama at LSU and Texas at Missouri), saved on 3 November, before any of them kicked off. All four tabs work: the Black Board, the gap worksheet, the fact lines and the pipeline view, where each input opens to its first 20 rows. Hand-charted SIS figures run through October 2026, when the subscription ended.

Five things differ from the real tool:
- The written paragraphs are off. The real report has an AI word its facts, so the demo shows the facts themselves.
- The raw data rows from SIS are withheld from the input tables under its license, leaving field names, row counts and identity columns; those three files keep only the 20 rows on screen. SIS counts and rates do appear in the report's own tables and sentences, as the tool states them.
- The owner's projection file is absent, so on the gap worksheet each team shows its passer, three backs and five pass catchers by volume, with no prices. The Black Board shows DraftKings salaries, which are the slate's own.
- The Black Board is drawn by the tool's own board code when the snapshot was saved, and kept as that drawing, because the code itself reads the withheld SIS rows. Its player cards, stances, game notes and rebuild buttons are off, and the projection and ownership columns are left out; each game header's ownership figure reads a dash for the same reason.
- Uploads, writing and live refresh are off.

Nothing reaches the network. Sections open with a tap, because the full fact list is too long for a phone.
