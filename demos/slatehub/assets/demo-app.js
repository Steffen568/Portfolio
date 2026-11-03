// Loaded after the app, before the page finishes loading. Adds the demo banner, the
// "How this is built" panel and the "Where this came from" overlay; turns off what needs
// another page, an upload or an outside site. The Game View code itself is the real one.
(function () {
  const DEMO_ONLY = 'Demo only';
  const LINK_OFF = 'Disabled in demo';

  function toast(msg) {
    let t = document.getElementById('demo-toast');
    if (!t) { t = document.createElement('div'); t.id = 'demo-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('show'), 2200);
  }

  document.addEventListener('click', e => {
    const off = e.target.closest('[data-demo-off]');
    if (off) {
      e.preventDefault();
      e.stopPropagation();
      toast(off.dataset.demoOff === 'link' ? LINK_OFF : DEMO_ONLY);
      return;
    }
    if (e.target.closest('a[href="#"]')) e.preventDefault();
  }, true);

  // ── Where each panel's data comes from ─────────────────────────────────────
  // Each claim names the loader script that fills the table and the site it calls;
  // tests/test_portfolio_demo.py checks every pair against the script itself.
  // Badges go just before their panel (the app redraws panel insides, which would wipe them);
  // only the two static weather/park boxes take theirs inside.
  const SOURCES = [
    { at: '.slate-selector-bar', label: 'Schedule and probable pitchers', claims: [
      { name: 'MLB Stats API', how: 'API', when: 'every 15 min', script: 'load_schedule.py', domain: 'statsapi.mlb.com' }] },
    { at: '.pw-left', inside: true, label: 'Weather at first pitch', claims: [
      { name: 'PropFinder', how: 'API', when: 'every 15 min', script: 'load_weather.py', domain: 'api.propfinder.app' }] },
    { at: '.pw-center', inside: true, label: 'Park factors', claims: [
      { name: 'Baseball Savant', how: 'leaderboard, loaded once a season', when: 'yearly', script: 'seed_park_factors_savant.py', domain: 'baseballsavant.mlb.com' }] },
    { at: '#hitterPanelHdr', label: 'Batting orders', claims: [
      { name: 'MLB Stats API', how: 'API', when: 'every 15 min', script: 'load_schedule.py', domain: 'statsapi.mlb.com' },
      { name: 'RotoGrinders', how: 'scraped (projected orders before teams post)', when: 'every 15 min', script: 'load_lineups_rg.py', domain: 'rotogrinders.com' }] },
    { at: '.matchup-bar', label: 'Implied runs', claims: [
      { name: 'ESPN', how: 'scoreboard API, DraftKings betting lines', when: 'every 15 min', script: 'load_odds.py', domain: 'site.api.espn.com' }] },
    { at: '#row1', label: 'Hitter stats, salaries, recent form', claims: [
      { name: 'FanGraphs', how: 'scraped with Playwright (a script-driven browser)', when: '7:30 am', script: 'download_fangraphs.py', domain: 'fangraphs.com' },
      { name: 'Baseball Savant', how: 'CSV downloads', when: '7:00 am', script: 'load_stats.py', domain: 'baseballsavant.mlb.com' },
      { name: 'Baseball Savant bat tracking', how: 'CSV downloads', when: '7:00 am', script: 'load_bat_tracking.py', domain: 'baseballsavant.mlb.com' },
      { name: 'DraftKings', how: 'API', when: '9:00 am', script: 'load_dk_salaries.py', domain: 'api.draftkings.com' },
      { name: 'MLB Stats API game logs', how: 'API', when: '9:00 am and 11:30 pm', script: 'load_game_logs.py', domain: 'statsapi.mlb.com' }] },
    { at: '.p-tab-nav', label: 'Pitcher stats and Stuff+', claims: [
      { name: 'FanGraphs', how: 'scraped with Playwright', when: '7:30 am', script: 'download_fangraphs.py', domain: 'fangraphs.com' },
      { name: 'Baseball Savant', how: 'CSV downloads', when: '7:00 am', script: 'load_stats.py', domain: 'baseballsavant.mlb.com' }] },
    { at: '.p-tab-nav', label: 'Bullpen usage (Bullpen tab)', claims: [
      { name: 'MLB Stats API box scores', how: 'API', when: '9:00 am and 11:30 pm', script: 'load_bullpen.py', domain: 'statsapi.mlb.com' }] },
    { at: '#arsenalBody', label: 'Pitch arsenal and movement', claims: [
      { name: 'Baseball Savant', how: 'leaderboards', when: '7:00 am', script: 'load_arsenal.py', domain: 'baseballsavant.mlb.com' }] },
    { at: '#envStackBody', label: 'Scores and projections', claims: [
      { name: 'SlateHub', how: 'calculated from everything above by the projection engine', when: 'after each refresh' }] },
  ];

  // The one data gap the page itself can't know about: season tables were last refreshed Sep 8.
  function addSeasonNote() {
    document.querySelectorAll('.p-tab-nav, #hitterPanelHdr').forEach(el => {
      const note = document.createElement('div');
      note.className = 'demo-gap';
      note.textContent = 'Demo note: 2026 season totals run through Sep 8, 2026 (last refresh), not just to May 19. Recent form and bullpen stop at May 19.';
      el.before(note);
    });
  }

  function addSourceBadges() {
    SOURCES.forEach(s => {
      const el = document.querySelector(s.at);
      if (!el) { console.warn('[demo] no element for source badge', s.at); return; }
      const badge = document.createElement('div');
      badge.className = 'demo-src';
      badge.innerHTML = `<b>${s.label}</b>` + s.claims.map(c => `<span>${c.name} · ${c.how} · ${c.when}</span>`).join('');
      if (s.inside) el.prepend(badge); else el.before(badge);
    });
  }

  // ── Banner and panel ───────────────────────────────────────────────────────
  function addChrome() {
    document.body.insertAdjacentHTML('afterbegin', `
      <div id="demo-banner">
        <span>Demo · one game snapshot · May 19, 2026 · not live · forms and outside links disabled</span>
        <span class="demo-banner-btns">
          <button id="demo-sources-btn" type="button" aria-pressed="false">Show data sources</button>
          <button id="demo-how-btn" type="button">How this is built</button>
        </span>
      </div>
      <dialog id="demo-how" aria-labelledby="demo-how-title">
        <h2 id="demo-how-title">How this is built</h2>
        <h3>Many sources</h3>
        <p>Each game breakdown joins data from seven outside sources. Some offer an API (a door built for programs to ask for data): the MLB Stats API for schedules, lineups and box scores, DraftKings for salaries, ESPN for betting lines, PropFinder for weather. Others only offer web pages or downloads, so scripts scrape them (read the page the way a browser would): RotoGrinders for projected batting orders, Baseball Savant for pitch tracking, and FanGraphs, where a script drives a real browser with Playwright to download the stat tables.</p>
        <h3>Three jobs, on a schedule</h3>
        <p>A refresh pipeline of Python scripts runs on a schedule all day. It is split into three jobs: the stats job and the lineups-and-salaries job run at the same time to save minutes, and the projections job starts once the second has passed its checks, for example that every team playing has salaries.</p>
        <h3>One database that ties it together</h3>
        <p>Everything lands in Neon, a hosted Postgres database (it moved there from Supabase in 2026). Each source names players and teams its own way, so the loaders join them on shared IDs: MLB's player ID links a hitter's stats, splits, game logs and salary, and the game ID links the lineups, weather and betting line to one game. Names are matched with accents stripped ("Pérez" and "Perez") and wrong IDs from DraftKings are corrected by a mapping table. The page then reads these tables directly.</p>
        <h3>In this demo</h3>
        <p>One game, the Brewers at the Cubs on May 19, 2026, copied out of the database into plain files. Tap "Show data sources" to see where each panel's numbers come from. Nothing connects to the internet.</p>
        <button id="demo-how-close" type="button">Close</button>
      </dialog>`);
    document.getElementById('demo-how-btn').onclick = () => document.getElementById('demo-how').showModal();
    document.getElementById('demo-how-close').onclick = () => document.getElementById('demo-how').close();
    document.getElementById('demo-sources-btn').onclick = e => {
      const on = document.body.classList.toggle('demo-show-sources');
      e.currentTarget.setAttribute('aria-pressed', String(on));
      e.currentTarget.textContent = on ? 'Hide data sources' : 'Show data sources';
    };

    const upload = document.getElementById('projCsvInput');
    if (upload) upload.disabled = true;
    document.querySelectorAll('[data-demo-off]').forEach(el => {
      el.title = el.dataset.demoOff === 'link' ? LINK_OFF : DEMO_ONLY;
      el.classList.add('demo-off');
    });
    addSourceBadges();
    addSeasonNote();
  }

  addChrome();
})();
