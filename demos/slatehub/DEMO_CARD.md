# SlateHub

**Status:** Live (personal tool, GitHub Pages)
**One line:** A daily-fantasy baseball player's research tool that joins seven data sources to break down every game.

## What it does
Pick a game and SlateHub shows everything that shapes it on one screen: the ballpark and how it plays, game-time weather and which way the wind blows, both starting pitchers with their pitch mix and recent form, the bullpens' recent workload, both batting orders with each hitter's stats against pitchers who throw with the same hand as tonight's starter, and the betting market's expected runs. It is built for one player of DraftKings daily fantasy baseball (contests where you pick a team of real players under a salary limit for one night's games). No single site has all of that. SlateHub collects it from many sources every day, matches it up and keeps it in one place, so the whole breakdown loads in seconds.

## Built with
- Python (a programming language; here it runs the scripts that collect, clean and load the data)
- requests and BeautifulSoup (Python tools for asking websites for data and reading web pages)
- Playwright (a tool that drives a real web browser from a script; used for stat tables that can only be downloaded by clicking through a site)
- Neon (a hosted Postgres database, which is an online store of linked tables). The project started on Supabase, a similar service, and moved to Neon in 2026; the page still talks to it through Supabase's free client library (ready-made code a web page uses to ask a database for rows).
- Plain HTML, CSS and JavaScript (the basic building blocks of web pages), with no framework (a large pre-built toolkit for web apps). The page is one file that reads the database directly, so it can be hosted anywhere for free.
- GitHub Pages (free website hosting) and Windows Task Scheduler (the built-in Windows tool that runs programs at set times; it starts the data refreshes)

## How it's put together
Each source has its own loader script (a small program that fetches one source and saves it to the database). Some sources offer an API (a door built for programs to ask for data); the rest are scraped (the script reads the web page or download the way a browser would). A refresh pipeline runs the loaders on a schedule, split into three jobs called agents: the stats agent and the lineups-and-salaries agent run at the same time, and the projections agent starts once the second has passed its checks (for example, that every team playing has salaries). Everything lands in about twenty database tables. Because each source names players and teams its own way, the loaders join them on shared IDs: MLB's player ID ties a hitter's stats, splits, game logs and salary together, and the game ID ties the lineups, weather and betting line to one game. Names are matched with accents removed ("Pérez" and "Perez"), and DraftKings' own player IDs are corrected through a mapping table.

## Data in
- MLB Stats API (Major League Baseball's public data service): schedule, probable pitchers, confirmed batting orders, rosters, box scores, bullpen pitch counts, game logs. Every 15 minutes on game days, plus 9:00 am and 11:30 pm.
- RotoGrinders (a fantasy sports site), scraped: projected batting orders before teams post the real ones. Every 15 minutes.
- PropFinder (a sports-betting data site): game-time temperature, wind and rain chance. Every 15 minutes.
- ESPN scoreboard API: the betting lines, which give each team's expected runs. Every 15 minutes.
- DraftKings: player salaries and positions. 9:00 am, and again when new contests open.
- Baseball Savant (MLB's pitch-tracking site), CSV downloads (plain spreadsheet files): quality of contact, bat speed, pitch types and movement, left/right splits (how a player does against left-handed versus right-handed opponents), park factors. 7:00 am daily; park factors once a season.
- FanGraphs (a baseball statistics site), scraped with Playwright: advanced pitching and hitting stats such as Stuff+ (a rating of how hard a pitcher's pitches are to hit). 7:30 am daily.

## Data out
- One breakdown page per game: park, weather, both starters, both bullpens, both batting orders, expected runs, and scores that sum up the matchup for hitters and pitchers.
- The same tables feed SlateHub's other pages (its lineup builder and simulator), which are not part of this demo.

## What this demo shows
- **The sample:** one game, the Milwaukee Brewers at the Chicago Cubs at Wrigley Field on May 19, 2026, Jacob Misiorowski against Ben Brown, copied out of the database into plain files. The page's clock is set to that day.
- **What works:** the real Game View page. Park, weather, betting line, both starters with pitch arsenals and splits, both bullpens, both batting orders and the hitter detail tabs all fill in. Switching between the Cubs and Brewers hitters switches the pitcher they face with them. "Show data sources" labels each panel with the source and script behind it; "How this is built" explains the pipeline.
- **What's turned off:** other dates and games, links to SlateHub's other pages, uploading projections, the live wind map, the step-by-step tour opening by itself (the ? button still starts it), and saving changes. Nothing connects to the internet.
- **Data gaps, labeled on the page:** the database keeps only the latest day of DraftKings salaries, so May 19's were replaced by later loads and every player shows "No salary". Season-stat tables keep one row per season as of their last refresh (September 8), so season totals include games played after May 19. Game logs and bullpen workload are cut off at May 19, so recent form is as it stood that morning.
