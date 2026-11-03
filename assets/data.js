// All site data, ported from the design's data(). Plain JS (not JSON) so index.html works by double-click.
// drawings: the design's X (one entry per drawing: the overview card + up to 8 parts). Unit 04 adds cm.
// Empty fields are '—', as the design's p() fills them.
window.PORTFOLIO = {
  order: ['scout', 'holy', 'wire', 'slate', 'optom', 'dfs'],
  drawings: {
    hero: {
      over: { name: 'THE PORTFOLIO', does: 'Three pages, six working demos, one method, static hosting.', inp: 'Projects and the method behind them', out: 'A working demo per project', runs: 'Any device' },
      parts: [
        { name: '3 PAGES', does: 'Overview, Projects, How I work. Each project has a build drawing, a screenshot and a working demo.', inp: '—', out: 'Projects, method, contact', runs: 'Any device' },
        { name: 'SIX WORKING DEMOS', does: 'Frozen copies of the real tools: real look, real logic, one real dataset each. No server, nothing sent.', inp: 'Real data from one date', out: 'A demo that works like the real thing', runs: 'Your browser' },
        { name: 'HOW I WORK', does: 'The framework: a rules file, automatic checks, and a mapped-out process. Same on every project.', inp: 'Lessons from past builds', out: 'Tested, checked work', runs: 'Every project folder' },
        { name: 'HOSTING', does: 'Static files on GitHub Pages. No logins, no server, nothing to maintain.', inp: 'The files', out: 'A public link', runs: 'GitHub Pages' }
      ]
    },
    // CLAUDE.md (unit 04): its card rows are its own labels, STOPS / WHEN (inp / out); runs is unused.
    cm: {
      lab: ['STOPS', 'WHEN'],
      over: { name: 'CLAUDE.md', does: 'A working environment, not a prompt. Rules say what to know; hooks make the important ones happen every time.', inp: '—', out: '—', runs: '—' },
      parts: [
        { name: 'THE HEADER', does: 'Project overview, finish line, tools, folder map, commands. A hard size limit keeps it readable.', inp: 'The AI guessing how the project works', out: 'Start of every session', runs: '—' },
        { name: 'RULES 0–12', does: 'How to work: plain English, think before coding, simplest fix, touch only what the task needs, code does the math, one job per session, read before writing, fail loud.', inp: 'The confident wrong build', out: 'Every session', runs: '—' },
        { name: 'RULES 13–16', does: 'Rules with a check behind them: tests written first and locked, proof pasted with every “done”, a separate reviewer, a guard on anything expensive to lose.', inp: '“All tests pass” when none ran', out: 'Enforced by the hooks', runs: '—' },
        { name: 'DONE CHECKLIST', does: 'Nothing ships without the full chain: a definition, a known-answer test, always-true checks, a comparison to an official source, a plain explanation, a measured-or-estimated label.', inp: 'The wrong thing, built correctly', out: 'Before anything ships', runs: '—' },
        { name: 'HOOKS', does: 'Small scripts that run by themselves: guard before a command, tidy-up after a save, check when the AI tries to stop. The AI doesn’t decide whether they run.', inp: 'Risky commands, messy code, false “done”', out: 'Automatically', runs: '—' },
        { name: 'CHECK COMMAND', does: 'verify.sh: every test, one line each, under a minute. Red means the session can’t end.', inp: 'Skipped tests', out: 'Every “done”', runs: '—' },
        { name: 'MISTAKE LOG', does: 'Every mistake that gets through is logged with the guard that now catches it, the same week.', inp: 'The same mistake twice', out: 'The week it happens', runs: '—' }
      ]
    },
    holy: {
      over: { name: 'HOLY CROSS', does: 'A new front end on the school’s existing systems, built from one set of content files.', inp: '—', out: '—', runs: '—' },
      parts: [
        { name: 'FRONT DOOR · 5 PAGES', does: 'Home, Your real cost, Admissions, Outcomes, Contact: the pages families use most.', inp: 'The content files', out: 'The public site', runs: 'Any phone · Astro' },
        { name: 'ESPAÑOL TWINS', does: 'Every page in Spanish, with a working language switch. Marked draft (BORRADOR) until the school reviews it.', inp: 'The Spanish words file', out: 'The site in Spanish', runs: 'Any phone' },
        { name: 'CONTENT FILES', does: 'Every figure and word in one place. Each figure is tagged published, estimate or placeholder.', inp: 'The school’s text and figures', out: 'Every page’s words and numbers', runs: 'Built into the site' },
        { name: 'COST ESTIMATOR', does: 'Families enter their numbers and see an estimate. Works in the demo; the math runs on the phone.', inp: 'What the family types', out: 'An estimate', runs: 'The visitor’s browser' },
        { name: 'SCHOOL’S SYSTEMS', does: 'Family portal (SOCS), payments, admissions forms, tours (Calendly), tuition aid (FACTS). Linked, not rebuilt. Off in the demo.', inp: 'Families from the new site', out: 'Unchanged', runs: 'The school’s services' },
        { name: 'PHASE 2 · ON HOLD', does: 'Safety, Our Story, Academics, Student Life. Planned, waiting on the school.', inp: '—', out: '—', runs: '—' }
      ]
    },
    optom: {
      over: { name: 'OPTOMETRY PRACTICE', does: 'Asks why you came, then shows what matters to you.', inp: '—', out: '—', runs: '—' },
      parts: [
        { name: 'FRONT DOOR', does: 'One question first: why are you visiting? Four answers.', inp: 'The visitor’s choice', out: 'A matching route', runs: 'Any phone' },
        { name: 'FOUR ROUTES', does: 'Three stops each: the visit, the doctor, the cost.', inp: 'The practice’s text', out: 'A short tour', runs: 'Any phone' },
        { name: 'EVERY ROUTE ENDS HERE', does: 'Book or call. Off in the demo.', inp: 'A ready visitor', out: 'A booking request', runs: 'The practice’s booking system' },
        { name: 'SIDE EXITS', does: 'The full site and a Spanish tour, one tap away.', inp: '—', out: '—', runs: 'Any phone' }
      ]
    },
    scout: {
      over: { name: 'SCOUT TEAM', does: 'Three sources in, one game, three tabs of charts.', inp: '—', out: '—', runs: '—' },
      parts: [
        { name: 'SOURCES', does: 'CFBD: play-by-play and team stats. SIS: charting of every play. DraftKings: the slate and prices.', inp: 'Every play', out: 'Raw stats + prices', runs: 'Provider APIs' },
        { name: 'SERVER + DATABASE', does: 'Pulls, stores and updates every game. For the demo, saved to files once.', inp: 'Raw stats + prices', out: 'Game data', runs: 'Scout Team server · demo: saved files' },
        { name: 'THE WEEK’S BOARD', does: 'All of week 8, kept so this game’s ranks are real. Only this game is shown.', inp: 'All of week 8', out: 'This game’s ranks', runs: 'Your browser' },
        { name: 'ONE GAME', does: 'Indiana at Michigan, Oct 24, 2026. Week 8, DraftKings main slate, fully charted.', inp: 'Game, matchup, rosters, prices', out: 'Everything on the tabs', runs: 'Your browser' },
        { name: 'OVERVIEW · MATCHUP · TEAM', does: 'Three tabs of charts from the real app’s code. A plain-words guide tops each tab. No predictions, no takes.', inp: 'This game’s data', out: 'What you see', runs: 'Your browser' }
      ]
    },
    wire: {
      over: { name: 'THE WIRE', does: 'Stats and a slate in; a worksheet and fact lines out.', inp: '—', out: '—', runs: '—' },
      parts: [
        { name: 'INPUTS', does: 'SIS charting, the DraftKings slate and salaries, and the Wire’s stored data via its API. Raw SIS numbers stay hidden (licence).', inp: 'SIS · DraftKings', out: 'Raw data per game', runs: 'Wire database via API' },
        { name: 'GAME PACK', does: 'Each team’s pass and run game set against the defense it faces.', inp: 'Stats + slate', out: 'One pack per game', runs: 'Report code (TypeScript)' },
        { name: 'GAP SWEEP', does: 'Compares each side to its own average. Offense ahead: attack. Defense ahead: holds. Every finding shows its evidence.', inp: 'Game packs', out: 'Attack / holds findings', runs: 'Report code' },
        { name: 'THE REPORT', does: 'A gap worksheet and fact lines per game. Built by rules, not AI.', inp: 'Findings + game brief', out: 'Who to pick, how often', runs: 'Your browser · saved files' },
        { name: 'AI WRITE-UP · OFF', does: 'In the real tool, Claude writes paragraphs from the facts. Off in the demo: every line shown is the tool’s own.', inp: 'The fact pack', out: 'Paragraphs (not in demo)', runs: 'Claude · off' }
      ]
    },
    slate: {
      over: { name: 'SLATEHUB', does: 'Many sources, one database, one game broken down.', inp: '—', out: '—', runs: '—' },
      parts: [
        { name: 'SOURCES', does: 'APIs on request (PropFinder weather, every 15 min). Scrapers for pages without one (FanGraphs Stuff+, 7:30 am).', inp: 'Stats sites + data services', out: 'Raw rows', runs: 'Scheduled jobs' },
        { name: 'REFRESH · 3 AGENTS', does: 'Three jobs in parallel. They clean rows and match players, teams and games across sources.', inp: 'Raw rows', out: 'Clean, matched rows', runs: 'Scheduled runs' },
        { name: 'DATABASE · NEON', does: 'Games, players, logs, bullpens, parks, weather, lines, joined by game and player.', inp: 'Clean rows', out: 'One game, assembled', runs: 'Neon (online)' },
        { name: 'GAME VIEW', does: 'Park and weather, betting lines, both lineups, both starters. Brewers at Cubs, May 19, 2026: Misiorowski vs Brown.', inp: 'The assembled game', out: 'What you see', runs: 'Your browser · saved files' },
        { name: 'WHERE THIS CAME FROM', does: 'One toggle tags every panel with its source, e.g. “Weather: PropFinder API, every 15 min.” Missing data is labeled, not blank.', inp: 'Each panel’s loader', out: 'A source tag per panel', runs: 'Your browser' },
        { name: 'OPTIMIZER + SIM · OFF', does: 'Lineup building and slate sims exist in the real tool. Not in this demo.', inp: '—', out: '—', runs: '—' }
      ]
    },
    dfs: {
      over: { name: 'SCOUT DFS', does: 'A slate and your settings in; only rule-valid lineups out.', inp: '—', out: '—', runs: '—' },
      parts: [
        { name: 'THE SLATE', does: 'DraftKings CFB main, Oct 8, 2026. Four games, 260 players, 118 usable.', inp: '—', out: 'The player pool', runs: 'Saved with the demo' },
        { name: 'YOUR SETTINGS', does: 'Lineup count (1–20), exposure limits, lock or exclude players, QB stacks with 1–3 receivers.', inp: 'Your choices', out: 'Rules for this build', runs: 'Your browser' },
        { name: 'THE RULE GATE', does: 'The real rules at real defaults: $45k–$50k salary, 8 seats with super flex, max 4 per team, 2+ games, stacks, exposure, max 6 of 8 shared.', inp: 'Players + settings', out: 'Only valid lineups', runs: 'Your browser (jsLPSolver)' },
        { name: 'LINEUP CARDS', does: 'Best lineup first, then the next best under every rule. Build time and a separate rule check are shown.', inp: 'Valid lineups', out: 'Lineups to enter', runs: 'Your browser' },
        { name: 'LATE-SWAP POOL · OFF', does: 'Legal one-seat swaps per lineup, and the best one. Shown; controls off.', inp: 'Your lineups', out: 'Swap options', runs: 'Your browser' },
        { name: 'YOUR DEVICE', does: 'The real solver is Python on my PC. Its rules were ported to a browser solver: 20 lineups in under 3 seconds.', inp: '—', out: '—', runs: 'Your browser · nothing sent' }
      ]
    }
  },
  // projects: the design's P. shot: true once demos/<name>/screenshots/desktop.png is copied in (spec 03); until then the placeholder shows and nothing is requested.
  projects: {
    holy: { tkr: 'HCRS', label: 'Holy Cross', sub: 'PHASE 1', line: 'A new website for a San Antonio Catholic school, in English and Spanish.', status: 'Phase 1 · pending board approval', what: 'The five pages families use most, each with a Spanish twin. Payments, applications and logins stay on the school’s systems. The cost estimator works in the demo.', path: 'demos/holy-cross/', demo: true, shot: false },
    optom: { tkr: 'OPTO', label: 'Optometry practice', sub: 'IN PROGRESS', line: 'A site for an eye doctor that starts by asking why you came.', status: 'In progress · name withheld', what: 'Each visitor picks a reason and gets a short tour: the visit, the doctor, the cost.', path: 'demos/eye-care/', demo: false, shot: false },
    scout: { tkr: 'SCTM', label: 'Scout Team', sub: 'LIVE BETA', line: 'College football research: one game, three tabs of charts.', status: 'Live beta · runs locally', what: 'Play-by-play, charting and prices turned into charts across Overview, Matchup and Team. No predictions. Demo: Indiana at Michigan, Oct 24, 2026.', path: 'demos/scout-team/', demo: true, shot: false },
    wire: { tkr: 'WIRE', label: 'The Wire', sub: 'RESEARCH TOOL', line: 'The research engine behind Scout Team.', status: 'Research tool · part of Scout Team', what: 'Sets each offense against the defense it faces, flags clear edges, and outputs a gap worksheet and fact lines. Demo: DraftKings Main, Oct 30, 2026, three games, with a Pipeline tab showing each step.', path: 'demos/the-wire/', demo: true, shot: false },
    slate: { tkr: 'SLTH', label: 'SlateHub', sub: 'LIVE', line: 'MLB research: one game broken into pitchers, hitters and conditions.', status: 'Live · personal tool', what: 'Pulls from APIs and scrapers into one database, then breaks down each game. Demo: Brewers at Cubs, May 19, 2026, with a toggle showing every data source.', path: 'demos/slatehub/', demo: true, shot: false },
    dfs: { tkr: 'SDFS', label: 'SCOUT DFS', sub: 'PERSONAL TOOL', line: 'A DFS lineup builder: settings in, valid lineups in seconds.', status: 'Personal tool · runs locally', what: 'The SCOUT‹DFS› terminal. Pick settings, press Build, get lineups that follow every contest rule, solved on your device. Demo: DraftKings CFB main, Oct 8, 2026.', path: 'demos/scout-dfs/', demo: true, shot: false }
  }
};
