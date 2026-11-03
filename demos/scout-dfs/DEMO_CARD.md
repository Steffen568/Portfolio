# SCOUT DFS

**Status:** Personal tool (runs locally)
**One line:** A DraftKings lineup builder that turns salaries, projections and your rules into valid lineups in seconds.

## What it does
SCOUT DFS helps one person enter daily fantasy contests on DraftKings, where you pick a team of players under a salary limit. You give it the day's slate (the set of games in a contest), a file of projected scores, and your settings: how many lineups, how much of any one player, and which players should be paired. It builds a "book" (a set of lineups) that scores as high as the rules allow, lets you edit by hand, and writes the file DraftKings accepts. If games have started, it can rework the lineups that are still open. After the games, it reads the contest results back in and shows how the book did.

## Built with
- Python 3.12 (the programming language the real tool is written in)
- pydfs-lineup-optimizer (ready-made code, free for anyone to use, that knows DraftKings' roster rules)
- OR-Tools CP-SAT and PuLP (solvers: programs that find the best answer to a problem with strict rules)
- pandas and pyarrow (tools for working with tables of data)
- SQLAlchemy and psycopg2 (tools that let Python talk to a database)
- Neon Postgres (a hosted database, which the tool mostly reads from)
- Flask (a small tool that serves the screen from the owner's own PC)
- Plain JavaScript (the language of web pages; the whole screen is one hand-written page)
- pytest (a tool that runs automatic checks on the code)
- This demo only: jsLPSolver (ready-made linear programming code that runs in a web browser). Linear programming means picking the best combination under a set of hard limits.

## How it's put together
The pieces run in a line: inputs → rules → solver → lineup cards → late-swap pool. Inputs are DraftKings' slate, the projections file and your settings. The rules turn those into hard limits, and the solver finds the highest-scoring lineup that fits, records it, and goes again until the book is full. Lineups appear as cards on the terminal screen, where they can be edited and exported. Once games start, the late-swap pool (other legal versions of each lineup, for the players who have not played yet) keeps the remaining seats useful. Everything runs on the owner's Windows PC, only while it is switched on there; DraftKings' files are saved to disk once and read from there, and the tool's own records live in its own section of the database.

## Data in
- **DraftKings salary file and draftables list** (the players you can pick): name, position, salary, team, game, start time, injury flag. Pulled once per slate and then kept, because a copy pulled after kickoff is different.
- **DraftKings lobby** (the list of contests open today): read fresh each time it is opened.
- **Projections file** (a spreadsheet the owner buys from a projections seller for each slate): name, team, projected points, ownership, floor, ceiling. Uploaded by hand when bought.
- **Basketball projections** (the RPS hub, a public site): projected points, floor, ceiling. Pulled when a new file is made.
- **Scout Team database** (the owner's own college football database): box scores (each player's stats from each game), schedules, betting lines. Read when a slate is opened or a study is run.
- **DraftKings contest results files** (downloaded by hand after the games): every entry's lineup and score.
- News and injuries: DraftKings' own injury flags, as above. There is no separate news feed.

## Data out
A book of lineups on screen, and the upload file DraftKings accepts. Also a late-swap file for games in progress, and a report after the games on how the book did.

## What this demo shows
College football, chosen because it is the one sport where the stacking rule (a quarterback paired with his own receivers) applies. The sample is one real slate: DraftKings' main college football slate for October 8, 2026, four games, 260 players, with the real projections used that day, frozen. You can set the number of lineups (up to 20), maximum and minimum exposure (how much of the book a player may be in), lock or exclude a player, and pick one stacking rule, then press Build. The solver runs on your device, and every lineup is checked against the rules after it is built. To stay under three seconds on a phone, the solver gets the top 40 of the 118 usable players by projection, and the "How this is built" panel says what that costs. Other settings, late swap, contest review and export to DraftKings are visible but turned off. Other sports and live data are not included.
