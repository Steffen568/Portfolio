# Scout Team

**Status:** Live beta (taken offline; runs locally)
**One line:** A college football research site that organizes the facts on a game for bettors and fantasy players.

## What it does
Scout Team gathers everything worth knowing about a college football game into one page: the teams, the betting line, the box score, and how each position group and player has graded. Bettors, daily fantasy players and serious fans use it to research a game without opening eight different sites. It shows organized facts and the reader makes the call. It never says what to bet or who to play, and any estimate is marked as one.

## Built with
- Next.js (a tool for building fast websites out of reusable page pieces) with React (the library that draws those pieces) and TypeScript (JavaScript with safety checks)
- Tailwind CSS (a kit of ready-made styling rules), used on the site's older pages
- FastAPI (a Python tool for building the server the website asks for data)
- Python (the language of the server and of every data job)
- SQLAlchemy and Pydantic (Python helpers that talk to the database and check the shape of data)
- pandas, SciPy and scikit-learn (Python tools for crunching numbers and testing whether a pattern is real)
- PostgreSQL on Neon (a database, hosted online by Neon)
- Vercel (hosted the website) and Render (hosted the server), while the site was public at scout-team.com
- In-house sign-in, built with argon2 (scrambles passwords so they cannot be read) and JSON Web Tokens (signed passes that prove who is signed in)
- Resend (a service that sends the site's emails)
- CollegeFootballData, or CFBD (the main college football data service)
- Sports Info Solutions, or SIS (a company whose staff chart every play by hand)
- DraftKings public lobby (the fantasy contests on offer and each player's price)
- ESPN's public roster feed and school athletics websites (who is on each team right now)
- Vitest and pytest (tools that test the code automatically)

## How it's put together
After each weekend, automatic jobs pull the newest games and plays from CFBD, then the hand-charted player data from SIS, and compute every grade and ranking into the database. DraftKings slates and betting lines are pulled again on demand during the week. The website only ever reads from that database, so a page never waits on an outside service.

The Game Center is the page for one game, in three tabs. OVERVIEW holds the game header, final score, team profiles and one row per position group; MATCHUP holds head-to-head tables for each part of the game, opening into each player's full stat sheet; and TEAM holds one team's position groups, schedule, and who arrived and left.

## Data in
- **CFBD:** games, scores, play-by-play (a record of every play), team box scores (each game's team totals), drives, rosters, recruiting classes, transfer portal, polls, team ratings (SP+ and FPI, two widely used formulas for how strong a team is) and betting lines. Pulled the day after games; lines on demand.
- **PFF:** not used. Older data of that lineage was removed from the project on 2026-08-13, and nothing in this demo comes from PFF.
- **SIS:** hand-charted player data, such as routes run, targets, pressures, blown blocks, coverage snaps and quarterback splits. Pulled Monday or Tuesday, once the week is charted.
- **The DraftKings slate (the set of games in one fantasy contest):** which games are in which contest, and each player's salary. Pulled on demand.
- **ESPN and school athletics sites:** current rosters. Pulled before and during the season.

## Data out
A web page for each game, team and player, plus national leaderboards. No picks, and no written takes.

## What this demo shows
One game: Ohio State at Michigan, played November 29, 2025 (Ohio State won 27-9). It is from last season, so the figures come from the finished 2025 season and the records shown (12-2 and 9-4) are final. The box score's season averages are the regular season only, as the page says, so they leave out each team's bowl or playoff games. DraftKings prices start in 2026 in this project, so this game has no price column. It was saved once on November 3, 2026 and runs entirely in the browser from this folder.

All three tabs work, including every expanding row, table and player stat sheet. Tapping a label shows its definition, and a short strip on each tab explains how to read it.

Turned off: the game list, search, other pages, sign-in, and every link out of the page.

Layout: the real site has no phone layout, so this demo adds one. On narrow screens the left menu is hidden, long labels wrap, and wide tables slide sideways inside their own box.

Changed from the real page, because each of these would be false or broken on this finished game:
- Removed: the "Data basis" card and the "Flips to measured" strip, which say no games have been played.
- Removed: the "Is the record real" card, whose saved records stop at different points (9-3 and 12-1) and disagree with the final 9-4 and 12-2 shown elsewhere.
- Removed: a second "% vacated" figure that disagreed with the room's real one, and two table headers with no rows under them.
- Removed: every player's class year, the column built from it, and the "true freshman" and "no snaps" labels, because the saved class years are wrong (most players read as freshmen).
- Removed: a few wording errors, such as "3th" and a line calling one matchup "the clearest edge", and the empty cards in the Team tab's player rows.
- Corrected: the "no games played" label on the team panel, and its "carried" grade labels, which now say the figures are from the 2025 season; signee notes that assumed no college snaps yet; a "0-star" rating for an unrated player; AP ranks that named week 1 for the final poll; bowl games listed as week 1 on the schedule; and a "portal rating" shown for players who never transferred.
- Corrected: the Team tab's historical table now shows each team's own figures. It showed the home team's for both teams.
- Removed: the dashes in a player's drawer header, two portal counts and a portal blue-chip figure that disagreed with the lists under them, and the expand arrow on rows with nothing to show. A footer saying every player was charted now says every player is listed.
- Removed: four captions left over from the design mock-ups, which described figures this game does not have.
- Corrected: a quarterback's missing star rating in the backfield table, unrated players' talent shown as 0, a carry share labelled as a room share, and the room-share definition, which counts receivers and tight ends separately.
- Corrected: absent usage and room shares drawn as 0, which now show a dash, and a designed-carries count that repeated the total carries, now shown as absent.
- Removed: the havoc column, which has no figure for any player, and team figures in the historical table that answered a different question from their row.
- Corrected: transfers shown as unrated in the Matchup tables, which now show their latest rating.
- Corrected: a quarterback success rate printed as 1% instead of 61%, a schedule heading that said "12 GAMES" over 13 and 14 games, tooltips that printed "null" for a figure the data does not have, and two captions that promised details the rows do not show.
- Removed: three team "grades" in the ledger that were really the share of last season's snaps still on the roster, and an opponent-adjusted column that repeated the grade beside it.
- Removed: percentile labels that were not percentiles (game script's shading and tooltips, and a "PCTL" under some team shares that repeated the share), and the schedule's pace column, which showed each opponent's SP+ rating under a pace label, and its edge column, which compared each opponent with a stand-in figure because neither team has an overall rating saved.
- Not corrected: the saved schedules carry no neutral-site flag, so the Big Ten title game and the two bowl games show H or A, from the side the data lists as home.
- Corrected: the header caption, which called the offense and defense columns grades; they are efficiency percentiles.
- Corrected: two rates in a running back's stat sheet that printed as 0%, and blank schedule figures that printed as 0.
- Corrected: tooltips saying a team has "no charted play this season", and the definition of the returning figure.
- Corrected: betting lines labelled a consensus of several books; they are one book's (ESPN Bet), and the labels now say so.
- Corrected: a coach panel saying the program's own prior season applies; it shows the coach's figures here over a span of seasons, which reaches past this game for Ohio State. Tooltips that called 2025's carries, yards, shares and room grades "last season" now say 2025.
- Corrected: the portal arrivals lists, which named 3 of Michigan's transfers and 4 of Ohio State's; every transfer the rosters flag is now listed (15 and 9), and the "who came in" table is rebuilt from the full list by the site's own rule.
- Removed: Ohio State's "20% back" in the historical table, which disagreed with the 31% returning share shown beside it.
- Turned off: the "Live" light in the top bar.
