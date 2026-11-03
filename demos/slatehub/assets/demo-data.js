// Loaded before the app. Two jobs: stop the clock at the frozen moment, and answer the app's
// database queries from the JSON in data/ (no database, no network).
(function () {
  // ── Frozen clock ───────────────────────────────────────────────────────────
  // The page shows "today's" games, so today is May 19, 2026, at noon in the visitor's
  // own time zone (the date is the 19th everywhere). Time still ticks for timers, looping
  // inside a 30-minute window so the date can never roll over.
  const FROZEN_MS = new Date(2026, 4, 19, 12, 0, 0).getTime();
  const WINDOW_MS = 30 * 60 * 1000;
  const RealDate = Date;
  const loadedAt = RealDate.now();
  const frozenNow = () => FROZEN_MS + (RealDate.now() - loadedAt) % WINDOW_MS;
  class DemoDate extends RealDate {
    constructor(...args) { args.length ? super(...args) : super(frozenNow()); }
    static now() { return frozenNow(); }
  }
  window.Date = DemoDate;

  // ── Frozen data ────────────────────────────────────────────────────────────
  const TABLES = ['games', 'dk_slate_games', 'dk_salaries', 'lineups', 'rosters', 'players', 'player_projections', 'slate_ownership',
    'batter_stats', 'batter_splits', 'bat_tracking', 'pinch_hit_rates', 'batter_game_logs', 'pitcher_stats', 'pitcher_splits',
    'pitch_arsenal', 'bullpen_appearances', 'park_factors', 'weather', 'game_odds'];

  function loadTables() {
    if (location.protocol === 'file:') {   // a double-clicked page cannot fetch() files
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = './assets/data-bundle.js';
        s.onload = () => resolve(window.__DEMO_BUNDLE__);
        s.onerror = () => reject(new Error('data-bundle.js did not load'));
        document.head.appendChild(s);
      });
    }
    return Promise.all(TABLES.map(t => fetch(`./data/${t}.json`).then(r => {
      if (!r.ok) throw new Error(`data/${t}.json: ${r.status}`);
      return r.json();
    }))).then(rows => Object.fromEntries(TABLES.map((t, i) => [t, rows[i]])));
  }
  const tablesReady = loadTables();

  // Same chain the app already calls on the database client. A call this class does not
  // know throws, rather than quietly returning nothing.
  class Query {
    constructor(table) { this.table = table; this.tests = []; this.sorts = []; this.max = Infinity; this.from = 0; this.one = false; }
    select() { return this; }
    eq(c, v) { this.tests.push(r => r[c] === v); return this; }
    neq(c, v) { this.tests.push(r => r[c] !== v); return this; }
    gt(c, v) { this.tests.push(r => r[c] > v); return this; }
    gte(c, v) { this.tests.push(r => r[c] >= v); return this; }
    lt(c, v) { this.tests.push(r => r[c] < v); return this; }
    lte(c, v) { this.tests.push(r => r[c] <= v); return this; }
    in(c, vals) { const s = new Set(vals); this.tests.push(r => s.has(r[c])); return this; }
    order(c, o = {}) { this.sorts.push([c, o.ascending === false ? -1 : 1]); return this; }
    limit(n) { this.max = n; return this; }
    range(a, b) { this.from = a; this.max = b - a + 1; return this; }
    single() { this.one = true; return this; }
    maybeSingle() { this.one = true; return this; }
    // The live page saves a few computed scores back to the database. A frozen demo keeps nothing.
    upsert() { this.write = true; return this; }
    update() { this.write = true; return this; }
    insert() { this.write = true; return this; }
    run(tables) {
      if (this.write) return { data: null, error: null };
      if (!(this.table in tables)) throw new Error(`Demo has no data for table "${this.table}"`);
      let rows = tables[this.table].filter(r => this.tests.every(t => t(r)));
      for (const [c, dir] of [...this.sorts].reverse()) {
        rows = rows.map((r, i) => [r, i]).sort(([a, i], [b, j]) => a[c] === b[c] ? i - j : (a[c] > b[c] ? dir : -dir)).map(([r]) => r);
      }
      rows = rows.slice(this.from, this.from + this.max).map(r => ({ ...r }));   // copies: the app edits rows it receives
      return { data: this.one ? rows[0] ?? null : rows, error: null };
    }
    then(ok, fail) { return tablesReady.then(t => this.run(t)).then(ok, fail); }
  }

  window.__demoClient = { from: table => new Query(table) };
  window.__demoTables = tablesReady;
})();
