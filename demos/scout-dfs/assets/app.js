/* The demo's screen. Every rule lives in build.js; this file only draws and asks.
   Same shape as the real terminal (src/dfs/web/static/app.js): one state object,
   one render, events caught at the root. */
(function () {
  'use strict';

  var B = window.DemoBuild;
  var S = {
    doc: null, tab: 'build', how: false, game: 'ALL', pos: 'ALL', search: '',
    n: 20, maxExposure: '', stack: 0,
    locked: {}, excluded: {}, caps: {}, mins: {},
    lineups: [], building: false, ms: null, problems: null, settingsUsed: null,
    refusal: null, short: null
  };

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(v) { return '$' + Number(v).toLocaleString('en-US'); }
  function k(v) { return (v / 1000).toFixed(1) + 'K'; }
  function num(v, places) { return v == null ? '—' : Number(v).toFixed(places); }
  function players() { return S.doc.players; }
  function byId(id) { return S.index[id]; }
  function pct(v) { var x = parseFloat(v); return isNaN(x) ? null : Math.min(100, Math.max(0, x)); }
  // Team logos, the same files the real terminal shows (collegefootballdata team ids), copied into ./assets/logos.
  var LOGO = { ARST: 2032, LIB: 2335, MOST: 2623, SALA: 6, SHSU: 2534, USF: 58, UTSA: 2636, WKU: 98 };
  function logo(team) {
    return LOGO[team] ? '<img class="tlogo" src="./assets/logos/' + LOGO[team] + '.png" alt="" width="18" height="18">' : '';
  }

  /* ---------- what the solver is asked ---------- */
  function settings() {
    var keep = function (map) {
      var out = {};
      Object.keys(map).forEach(function (id) {
        var v = pct(map[id]);
        if (v != null) out[id] = v;
      });
      return out;
    };
    var on = function (map) { return Object.keys(map).filter(function (id) { return map[id]; }); };
    return {
      n: B.clampLineups(S.n),
      maxExposure: pct(S.maxExposure),
      stack: S.stack,
      locked: on(S.locked),
      excluded: on(S.excluded),
      caps: keep(S.caps),
      mins: keep(S.mins)
    };
  }

  /* ---------- pieces ---------- */
  function banner() {
    var d = S.doc.slate, games = S.doc.games.length;
    return '<div class="banner"><div class="banner-text">' +
      '<strong>Demo · one slate · sample projections · solver runs on your device</strong>' +
      '<span>Frozen snapshot · DraftKings college football ' + esc(d.label.toLowerCase()) + ' slate, ' + esc(d.date) + ', ' + games + ' games · forms and outside links disabled</span>' +
      '</div><button class="how-btn" data-a="how" aria-expanded="' + S.how + '">How this is built</button></div>' + howPanel();
  }

  function howPanel() {
    var R = B.RULES, usable = B.usable(players()).length;
    return '<section class="how"' + (S.how ? '' : ' hidden') + '><div class="how-grid">' +
      '<div><h2>INPUTS</h2><ul>' +
        '<li>Player pool and salaries: DraftKings\' own file for this slate, ' + players().length + ' players.</li>' +
        '<li>Projections: the real file used that day, frozen. ' + usable + ' of the ' + players().length + ' have a projection above zero and are not ruled out. Those are the pool.</li>' +
        '<li>Your settings: lineups, exposure, locks, excludes, one stack rule.</li>' +
      '</ul><p></p><h2>THE POOL IS CUT</h2><p>To keep the build under 3 seconds on a phone, the solver gets the top ' + R.poolSize + ' of those ' + usable + ' by projection. Everyone else is listed on 1&lt;POOL&gt; but cannot be picked.</p>' +
      '<p>Measured against the real solver on all ' + usable + ': the top lineup is the same with the stack off and at QB+1, QB+2 and QB+3. The 20-lineup total is the same except at QB+3, where it is 6.3 points lower out of 2,747 (0.23%).</p></div>' +
      '<div><h2>THE RULES THE SOLVER ENFORCES</h2><ol>' +
        '<li>Salary at most ' + money(R.salaryCap) + ', at least ' + money(R.minSalary) + '.</li>' +
        '<li>Eight seats: QB, RB, RB, WR, WR, WR, FLEX (RB or WR), SUPER FLEX (QB, RB or WR).</li>' +
        '<li>No player twice in a lineup.</li>' +
        '<li>At most ' + R.maxPerTeam + ' from one team, from at least ' + R.minGames + ' games.</li>' +
        '<li>Stack, when on: a quarterback with at least N receivers from the same team. A running back does not count.</li>' +
        '<li>Locked: in every lineup. Excluded: in none.</li>' +
        '<li>Max exposure, global and per player; the tighter one wins. Min exposure per player, spread evenly through the book.</li>' +
        '<li>Any two lineups share at most ' + R.maxShared + ' of 8 players.</li>' +
        '<li>Each lineup is the highest projected total those rules allow, given the lineups before it.</li>' +
      '</ol></div>' +
      '<div><h2>WHERE THE SOLVER RUNS</h2><p>On your device. Nothing is sent anywhere: this page has no server behind it.</p>' +
      '<p>It uses jsLPSolver, a linear programming library. Linear programming means picking the best combination under a set of hard limits.</p>' +
      '<p>The real terminal runs on its owner\'s PC with a Python solver and many more settings. These rules are copied from it, and the lineups here were checked against it.</p></div>' +
      '</div></section>';
  }

  function statusBar() {
    var d = S.doc.slate;
    return '<div class="status"><div class="brand">SCOUT&lt;DFS&gt;</div>' +
      '<div class="label">' + esc(d.label) + '</div><div class="dim">' + esc(d.date) + ' · CFB</div>' +
      '<div class="status-right">' +
      '<div>CAP <b class="c-yellow">' + money(B.RULES.salaryCap) + '</b></div>' +
      '<div class="slots">SLOTS <b class="c-text">QB·RB·RB·WR·WR·WR·FLX·SFLX</b></div>' +
      '<div>POOL <b class="c-green">' + B.usable(players()).length + '</b>/' + players().length + '</div>' +
      '</div></div>';
  }

  function implied(g) {
    // The same arithmetic the real banner uses: total and spread into team totals.
    var home = (g.total - g.spread) / 2, away = g.total - home;
    return { home: home, away: away };
  }

  function gameBanner() {
    var chip = function (key, top, sub) {
      return '<button class="chip-game' + (S.game === key ? ' on' : '') + '" data-a="game" data-i="' + esc(key) + '">' +
        top + '<small>' + sub + '</small></button>';
    };
    return '<div class="games">' + chip('ALL', 'ALL GAMES', S.doc.games.length + ' ON SLATE') +
      S.doc.games.map(function (g) {
        var t = implied(g);
        return chip(g.id, logo(g.away) + esc(g.away) + ' <span class="c-yellow">' + t.away.toFixed(1) + '</span> @ ' +
          logo(g.home) + esc(g.home) + ' <span class="c-yellow">'+ t.home.toFixed(1) + '</span>',
          'O/U ' + g.total + ' · ' + esc(g.start) + ' ET');
      }).join('') + '</div>';
  }

  function tabs() {
    var tab = function (key, label) {
      return '<button class="tab' + (S.tab === key ? ' on' : '') + '" data-a="tab" data-i="' + key + '">' + label + '</button>';
    };
    var locked = settings().locked.length, out = settings().excluded.length;
    return '<nav class="tabs">' + tab('pool', '1&lt;POOL&gt;') + tab('build', '2&lt;BUILD&gt;') +
      tab('lineups', '3&lt;LINEUPS&gt;') + tab('swap', '4&lt;SWAP&gt;') +
      '<button class="tab off" data-demo title="Demo only">5&lt;REVIEW&gt;</button>' +
      '<div class="tab-count"><div>LOCKED <span class="c-green" id="count-locked">' + locked + '</span></div>' +
      '<div>EXCLUDED <span class="c-red" id="count-excluded">' + out + '</span></div></div></nav>';
  }

  function runNote() {
    var count = S.lineups.length, word = count + ' lineup' + (count === 1 ? '' : 's');
    if (!count) return 'Set a couple of things below or on 1&lt;POOL&gt;, then press build.';
    if (S.ms == null) return '<b class="c-green">' + word + '</b> on this device.';
    return '<b class="c-green">' + word + ' in ' + (S.ms / 1000).toFixed(2) + ' s</b> on this device, press to done. Change a setting and build again.';
  }

  function runBar() {
    var n = B.clampLineups(S.n);
    return '<div class="runbar"><button class="run" data-a="run"' + (S.building ? ' disabled' : '') + '>▶ BUILD ' + n + ' LINEUP' + (n === 1 ? '' : 'S') + '</button>' +
      '<div class="run-note" id="run-note" aria-live="polite">' + runNote() + '</div></div>' +
      (S.refusal ? '<div class="notice" role="alert"><b>NOT BUILT.</b> ' + esc(S.refusal) + '</div>' : '') +
      (S.short ? '<div class="notice warn" role="status">' + esc(S.short) + '</div>' : '');
  }

  /* ---------- 1<POOL> ---------- */
  function poolRows() {
    var q = S.search.trim().toLowerCase();
    return players().filter(function (p) {
      return (S.game === 'ALL' || p.game === S.game) && (S.pos === 'ALL' || p.pos === S.pos) &&
        (!q || p.name.toLowerCase().indexOf(q) >= 0 || p.team.toLowerCase().indexOf(q) >= 0);
    }).sort(function (a, b) { return b.proj - a.proj || b.sal - a.sal; });
  }

  function poolTable() {
    var rows = poolRows();
    return '<table class="pool"><thead><tr><th class="l">LCK</th><th class="l">XCL</th><th>MAX%</th><th>MIN%</th>' +
      '<th class="l">PLAYER</th><th>#</th><th class="l">POS</th><th class="l">TEAM</th><th>SALARY</th><th>PROJ</th><th>VAL</th><th>FLR</th><th>CEIL</th><th>OWN%</th></tr></thead><tbody>' +
      rows.map(function (p) {
        var gone = !S.solvable[p.id];
        var off = gone ? ' aria-disabled="true" title="' + esc(p.drop || 'outside the top ' + B.RULES.poolSize + ' this demo solves') + '"' : '';
        return '<tr' + (gone ? ' class="gone"' : '') + '>' +
          '<td class="l"><button class="tog lock' + (S.locked[p.id] ? ' on' : '') + '" data-a="lock" data-i="' + p.id + '" aria-pressed="' + !!S.locked[p.id] + '" aria-label="Lock ' + esc(p.name) + '"' + off + '>L</button></td>' +
          '<td class="l"><button class="tog xcl' + (S.excluded[p.id] ? ' on' : '') + '" data-a="exclude" data-i="' + p.id + '" aria-pressed="' + !!S.excluded[p.id] + '" aria-label="Exclude ' + esc(p.name) + '"' + off + '>X</button></td>' +
          '<td><input inputmode="numeric" data-in="cap" data-i="' + p.id + '" placeholder="—" aria-label="Max exposure percent for ' + esc(p.name) + '" value="' + esc(S.caps[p.id] == null ? '' : S.caps[p.id]) + '"' + (gone ? ' readonly' + off : '') + '></td>' +
          '<td><input inputmode="numeric" data-in="min" data-i="' + p.id + '" placeholder="—" aria-label="Min exposure percent for ' + esc(p.name) + '" value="' + esc(S.mins[p.id] == null ? '' : S.mins[p.id]) + '"' + (gone ? ' readonly' + off : '') + '></td>' +
          '<td class="l">' + logo(p.team) + esc(p.name) + (p.status ? ' <span class="status-flag">' + esc(p.status) + '</span>' : '') + '</td>' +
          '<td class="dim">' + (p.jersey == null ? '—' : esc(p.jersey)) + '</td>' +
          '<td class="l">' + esc(p.pos) + '</td><td class="l">' + esc(p.team) + '</td>' +
          '<td>' + k(p.sal) + '</td><td class="' + (gone ? '' : 'c-green') + '">' + num(p.proj, 1) + '</td>' +
          '<td>' + (p.proj > 0 ? (p.proj / (p.sal / 1000)).toFixed(2) : '—') + '</td>' +
          '<td>' + (p.floor > 0 ? num(p.floor, 1) : '—') + '</td><td>' + (p.ceil > 0 ? num(p.ceil, 1) : '—') + '</td>' +
          '<td>' + num(p.own, 1) + '</td></tr>';
      }).join('') + '</tbody></table>' +
      (rows.length ? '' : '<div class="empty">NOBODY MATCHES. CLEAR THE SEARCH OR THE GAME.</div>');
  }

  function poolTab() {
    var pos = ['ALL', 'QB', 'RB', 'WR'];
    return '<div class="body"><div class="panel-head">PLAYER POOL <small>tap L to lock, X to exclude, type a max or min exposure %<span class="swipe-hint">. Swipe the table sideways for salary and projection.</span></small></div>' +
      '<div class="pool-tools">' + pos.map(function (x) {
        return '<button class="' + (S.pos === x ? 'on' : '') + '" data-a="pos" data-i="' + x + '">' + x + '</button>';
      }).join('') +
      '<input type="search" data-in="search" placeholder="Search name or team" aria-label="Search players" value="' + esc(S.search) + '">' +
      '<span class="count" id="pool-count">' + poolRows().length + ' of ' + players().length + '</span></div>' +
      '<div class="pool-box" id="pool-box">' + poolTable() + '</div></div>';
  }

  /* ---------- 2<BUILD> ---------- */
  function liveField(label, help, key, value, attrs) {
    return '<label class="field"><span class="field-text"><b>' + label + '</b><small>' + help + '</small></span>' +
      '<input inputmode="numeric" data-in="' + key + '" value="' + esc(value) + '" ' + (attrs || '') + '></label>';
  }
  function offField(label, help, value) {
    return '<div class="field off" data-demo title="Demo only"><span class="field-text"><b>' + label + '</b><small>' + help + ' · Demo only</small></span>' +
      '<input readonly aria-disabled="true" tabindex="-1" value="' + esc(value) + '" aria-label="' + label + ', demo only"></div>';
  }

  function buildTab() {
    var R = B.RULES;
    var usable = B.usable(players()).length;
    var counts = { QB: 0, RB: 0, WR: 0 };
    var solving = B.solverPool(players());
    solving.forEach(function (p) { counts[p.pos] += 1; });
    return '<div class="body build-grid"><div>' +
      '<div class="panel-head">CONSTRAINTS</div>' +
      liveField('LINEUPS TO GENERATE', '1 to ' + R.maxLineups + ' in this demo', 'n', S.n, 'aria-label="Lineups to generate"') +
      liveField('GLOBAL MAX EXPOSURE %', 'most of the book any one player may be in; blank = no cap', 'maxExposure', S.maxExposure, 'placeholder="—" aria-label="Global max exposure percent"') +
      '<div class="field-text stack-label"><b>STACK: QB + N</b><small>a quarterback plus N receivers from the same team</small></div>' +
      '<div class="seg" role="group" aria-label="Stack rule">' + [0, 1, 2, 3].map(function (v) {
        return '<button class="' + (S.stack === v ? 'on' : '') + '" data-a="stack" data-i="' + v + '" aria-pressed="' + (S.stack === v) + '">' + (v ? 'QB+' + v : 'OFF') + '</button>';
      }).join('') + '</div>' +
      '<div class="panel-head">PLAYERS <small>lock, exclude, per-player min and max % are on 1&lt;POOL&gt;</small></div>' +
      '<button class="tab" data-a="tab" data-i="pool">OPEN 1&lt;POOL&gt;</button>' +
      '<div class="panel-head">FIXED IN THIS DEMO</div>' +
      offField('MAX REPEATING PLAYERS', 'no two lineups share more than this', R.maxShared) +
      offField('MIN SALARY', 'floor on total spend', R.minSalary) +
      offField('MAX SALARY', 'DraftKings\' cap', R.salaryCap) +
      offField('MAX PLAYERS PER TEAM', 'roster concentration limit', R.maxPerTeam) +
      offField('OWNERSHIP SUM CAP', 'max total ownership per lineup; 0 = off', 0) +
      offField('VARIETY %', 'how far down the pool to reach', 0) +
      offField('PACING %', 'a player counts for less as their share grows', 0) +
      offField('CORRELATION %', 'linked draws across one simulated slate', 0) +
      '</div><div>' +
      '<div class="panel-head">SLATE HEALTH</div><div class="health">' +
      '<div><small>ON SLATE</small><b>' + players().length + '</b></div>' +
      '<div><small>USABLE</small><b>' + usable + '</b></div>' +
      '<div><small>SOLVED HERE</small><b class="c-green">' + solving.length + '</b></div>' +
      '<div><small>QB</small><b>' + counts.QB + '</b></div><div><small>RB</small><b>' + counts.RB + '</b></div><div><small>WR</small><b>' + counts.WR + '</b></div>' +
      '<div><small>GAMES</small><b>' + S.doc.games.length + '</b></div></div>' +
      '<div class="panel-head">GAMES</div><div class="scroll"><table><thead><tr><th class="l">TIME</th><th class="l">AWAY</th><th class="l">HOME</th><th>O/U</th><th>SPREAD</th><th>ITT AWAY</th><th>ITT HOME</th></tr></thead><tbody>' +
      S.doc.games.map(function (g) {
        var t = implied(g);
        return '<tr><td class="l c-yellow">' + esc(g.start) + ' ET</td><td class="l">' + esc(g.away) + '</td><td class="l">' + esc(g.home) + '</td><td>' + g.total + '</td><td>' + esc(g.home) + ' ' + g.spread + '</td><td class="c-green">' + t.away.toFixed(1) + '</td><td class="c-green">' + t.home.toFixed(1) + '</td></tr>';
      }).join('') + '</tbody></table></div></div></div>';
  }

  /* ---------- 3<LINEUPS> ---------- */
  function stackTags(lu) {
    var men = lu.ids.map(byId), tags = [];
    men.filter(function (p) { return p.pos === 'QB'; }).forEach(function (q) {
      var mates = men.filter(function (m) { return m.team === q.team && m.pos === 'WR'; }).length;
      tags.push('<span class="tag">' + esc(q.team) + ' QB+' + mates + '</span>');
    });
    var teams = {};
    men.forEach(function (m) { teams[m.team] = (teams[m.team] || 0) + 1; });
    Object.keys(teams).filter(function (t) { return teams[t] > 1; }).sort().forEach(function (t) {
      tags.push('<span class="tag plain">' + esc(t) + ' ×' + teams[t] + '</span>');
    });
    return tags.join('');
  }

  var SLOT_SHORT = { FLEX: 'FLX', 'SUPER FLEX': 'SFLX' };

  function card(lu, i) {
    return '<article class="card"><div class="card-head"><b>LU ' + String(i + 1).padStart(3, '0') + '</b><span>' + k(lu.sal) + '</span></div>' +
      '<div class="card-tags">' + stackTags(lu) + '</div>' +
      '<div class="seat head"><span>SLOT</span><span>PLAYER</span><span>SAL</span><span>PROJ</span><span>OWN</span></div>' +
      lu.seats.map(function (s) {
        var p = byId(s.id);
        return '<div class="seat"><span class="slot">' + (SLOT_SHORT[s.slot] || s.slot) + '</span>' +
          '<span class="who">' + logo(p.team) + esc(p.name) + '<small>' + esc(p.team) + '</small></span>' +
          '<span>' + k(p.sal) + '</span><span class="pts">' + num(p.proj, 1) + '</span><span>' + num(p.own, 1) + '</span></div>';
      }).join('') +
      '<div class="card-foot"><b>' + lu.proj.toFixed(1) + ' PTS</b><span>' + lu.own.toFixed(1) + '% OWN</span></div></article>';
  }

  function exposureRail() {
    var counts = {}, L = S.lineups;
    L.forEach(function (lu) { lu.ids.forEach(function (id) { counts[id] = (counts[id] || 0) + 1; }); });
    var ids = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || byId(b).proj - byId(a).proj; });
    return '<aside class="rail"><div class="panel-head">EXPOSURE <small>' + ids.length + ' players used</small></div>' +
      ids.map(function (id) {
        var share = Math.round(counts[id] * 100 / L.length), p = byId(id);
        return '<div class="rail-row"><div class="rail-top"><span>' + esc(p.name) + ' <span class="dim">' + esc(p.pos) + ' ' + esc(p.team) + '</span></span><span>' + share + '%</span></div>' +
          '<div class="bar"><i style="width:' + share + '%"></i></div></div>';
      }).join('') + '</aside>';
  }

  function lineupsTab() {
    var L = S.lineups;
    if (!L.length) {
      return '<div class="body"><div class="empty">NO LINEUPS YET. SET CONSTRAINTS ON <span class="c-amber">2&lt;BUILD&gt;</span> AND PRESS BUILD.</div></div>';
    }
    var avg = function (f) { return L.reduce(function (t, lu) { return t + f(lu); }, 0) / L.length; };
    var problems = S.problems;
    var failing = {};
    (problems || []).forEach(function (x) { var m = /^LU (\d+):/.exec(x); if (m) failing[m[1]] = 1; });
    var passed = L.length - Object.keys(failing).length;
    var check = problems == null ? '' : problems.length
      ? '<span class="fail">RULE CHECK: ' + passed + ' OF ' + L.length + ' PASS · ' + problems.length + ' PROBLEM' + (problems.length === 1 ? '' : 'S') + ': ' + esc(problems.slice(0, 3).join('; ')) + '</span>'
      : '<span class="pass">RULE CHECK: ' + L.length + ' OF ' + L.length + ' PASS</span>';
    return '<div class="body book-grid"><div style="min-width:0"><div class="summary">' +
      '<span><b>' + L.length + '</b> LINEUPS</span><span>AVG PROJ <b>' + avg(function (x) { return x.proj; }).toFixed(1) + '</b></span>' +
      '<span>AVG OWN <b>' + avg(function (x) { return x.own; }).toFixed(1) + '%</b></span>' +
      '<span>AVG SAL <b>' + money(Math.round(avg(function (x) { return x.sal; }))) + '</b></span>' + check +
      '<button class="export" data-demo title="Demo only" aria-disabled="true">EXPORT DK CSV · Demo only</button></div>' +
      '<div class="cards">' + L.map(card).join('') + '</div></div>' + exposureRail() + '</div>';
  }

  /* ---------- 4<SWAP>: the pool is real, using it is not. ---------- */
  function swapRow(lu, i) {
    var versions = B.swapVersions(players(), lu, S.settingsUsed), best = versions[0];
    var change = best ? best.proj - lu.proj : 0;
    return '<tr><td class="l">LU ' + String(i + 1).padStart(3, '0') + '</td><td>' + lu.proj.toFixed(1) + '</td><td>' + versions.length + '</td>' +
      '<td class="l">' + (best ? esc(byId(best.out).name) + ' → ' + esc(byId(best.in).name) : '—') + '</td>' +
      '<td>' + (best ? best.proj.toFixed(1) : '—') + '</td><td>' + (best ? (change > 0 ? '+' : '') + change.toFixed(1) : '—') + '</td></tr>';
  }

  function swapTab() {
    var L = S.lineups;
    return '<div class="body"><div class="panel-head">LATE SWAP POOL <small>shown, disabled · Demo only</small></div>' +
      '<div class="drop" data-demo title="Demo only"><b>DROP A FRESH DKEntries.csv HERE</b>' +
      'In the real terminal: download it again mid-slate and the tool builds a pool of legal swaps per entry. Locked players never move.</div>' +
      '<div class="swap-tools"><button data-demo title="Demo only" aria-disabled="true">BUILD SWAP POOL · Demo only</button>' +
      '<button data-demo title="Demo only" aria-disabled="true">EXPORT SWAPS · Demo only</button></div>' +
      '<div class="panel-head">THE POOL <small>legal one-seat versions of each lineup you built, up to 25 each, worked out on your device</small></div>' +
      (L.length
        ? '<div class="scroll"><table id="swap-pool"><thead><tr><th class="l">ENTRY</th><th>PROJ</th><th>VERSIONS</th><th class="l">BEST VERSION</th><th>ITS PROJ</th><th>CHANGE</th></tr></thead><tbody>' +
          L.map(swapRow).join('') + '</tbody></table></div>'
        : '<div class="empty">PRESS BUILD AND THE POOL FOR YOUR LINEUPS IS LISTED HERE.</div>') +
      '</div>';
  }

  function render() {
    var body = { pool: poolTab, build: buildTab, lineups: lineupsTab, swap: swapTab }[S.tab]();
    var scroller = document.getElementById('pool-box');
    var top = scroller ? scroller.scrollTop : 0;
    document.getElementById('root').innerHTML = banner() + statusBar() + gameBanner() + tabs() + runBar() +
      '<main>' + body + '</main>' +
      '<button class="cmd" data-demo title="Demo only" aria-disabled="true"><b>SCOUT&gt;</b><span>LOCK &lt;name&gt; · XCL &lt;name&gt; · RUN &lt;n&gt; · EXPORT · Demo only</span></button>' +
      '<div class="toast" id="toast" role="status" hidden></div>';
    var box = document.getElementById('pool-box');
    if (box) box.scrollTop = top;
  }

  /* ---------- the build ---------- */
  function run() {
    if (S.building) return;
    var asked = settings();
    S.n = asked.n;
    S.lineups = []; S.problems = null; S.refusal = null; S.short = null; S.ms = null;
    S.building = true;
    S.settingsUsed = asked;
    var started = performance.now();
    // NOT render(). Redrawing the 260-row pool here took a second at phone speed
    // before the solver had even begun. And the tab goes now, not at the end: the
    // browser repaints around it after every lineup, and it is about to be replaced.
    document.querySelector('.run').disabled = true;
    document.getElementById('run-note').textContent = 'Solving…';
    document.querySelectorAll('.notice').forEach(function (el) { el.remove(); });
    document.querySelector('main').innerHTML = '<div class="body"><div class="empty">SOLVING ON YOUR DEVICE…</div></div>';
    var stream = B.stream(players(), asked);

    function finish() {
      S.building = false;
      S.problems = S.lineups.length ? B.checkBook(players(), S.lineups, asked) : null;
      if (S.lineups.length) S.tab = 'lineups';
      render();
      window.scrollTo(0, 0);
      // The clock stops once the cards are on screen, so it is the wait a person had.
      requestAnimationFrame(function () {
        setTimeout(function () {
          S.ms = performance.now() - started;
          var note = document.getElementById('run-note');
          if (note) note.innerHTML = runNote();
        }, 0);
      });
    }
    function step() {
      var got;
      try {
        got = stream.next();
      } catch (e) {
        if (!e.refusal) throw e;
        S.refusal = e.message;
        return finish();
      }
      if (got.done) {
        S.short = got.value.short;
        return finish();
      }
      S.lineups.push(got.value);
      var note = document.getElementById('run-note');
      if (note) note.textContent = 'Solved ' + S.lineups.length + ' of ' + asked.n + '…';
      // Back to the browser between lineups so the screen can paint and a tap lands.
      setTimeout(step, 0);
    }
    setTimeout(step, 0);
  }

  /* ---------- events ---------- */
  var toastTimer;
  function demoOnly(text) {
    var t = document.getElementById('toast');
    t.textContent = text || 'Demo only';
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 1600);
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-demo]')) return demoOnly();
    var el = e.target.closest('[data-a], input[aria-disabled="true"]');
    if (!el) return;
    if (el.getAttribute('aria-disabled') === 'true') {
      return demoOnly(el.title ? 'Not usable: ' + el.title : 'Not usable');
    }
    var a = el.getAttribute('data-a'), i = el.getAttribute('data-i');
    if (a === 'how') S.how = !S.how;
    if (a === 'tab') S.tab = i;
    if (a === 'game') { S.game = S.game === i ? 'ALL' : i; S.tab = 'pool'; }
    if (a === 'pos') S.pos = i;
    if (a === 'stack') S.stack = Number(i);
    if (a === 'lock') { S.locked[i] = !S.locked[i]; if (S.locked[i]) S.excluded[i] = false; return drawToggles(i); }
    if (a === 'exclude') { S.excluded[i] = !S.excluded[i]; if (S.excluded[i]) S.locked[i] = false; return drawToggles(i); }
    if (a === 'run') return run();
    render();
  });

  /* A tap on L or X changes two buttons and two counts, not 260 rows. */
  function drawToggles(id) {
    [['lock', S.locked], ['xcl', S.excluded]].forEach(function (pair) {
      var btn = document.querySelector('.tog.' + pair[0] + '[data-i="' + id + '"]');
      btn.classList.toggle('on', !!pair[1][id]);
      btn.setAttribute('aria-pressed', String(!!pair[1][id]));
    });
    var now = settings();
    document.getElementById('count-locked').textContent = now.locked.length;
    document.getElementById('count-excluded').textContent = now.excluded.length;
  }

  /* Typing never re-renders the row it is typing in: the input would lose focus. */
  document.addEventListener('input', function (e) {
    var el = e.target, key = el.getAttribute('data-in'), i = el.getAttribute('data-i');
    if (!key || el.readOnly) return;
    if (key === 'n') {
      S.n = el.value;
      var runBtn = document.querySelector('.run');
      var n = B.clampLineups(S.n);
      if (runBtn) runBtn.textContent = '▶ BUILD ' + n + ' LINEUP' + (n === 1 ? '' : 'S');
    }
    if (key === 'maxExposure') S.maxExposure = el.value;
    if (key === 'cap') S.caps[i] = el.value;
    if (key === 'min') S.mins[i] = el.value;
    if (key === 'search') {
      S.search = el.value;
      document.getElementById('pool-box').innerHTML = poolTable();
      document.getElementById('pool-count').textContent = poolRows().length + ' of ' + players().length;
    }
  });

  /* ---------- start ---------- */
  function start(doc) {
    S.doc = doc;
    S.index = {};
    doc.players.forEach(function (p) { S.index[p.id] = p; });
    S.solvable = {};
    B.solverPool(doc.players).forEach(function (p) { S.solvable[p.id] = true; });
    render();
  }

  function fail() {
    document.getElementById('root').innerHTML = '<p class="boot">The sample slate did not load, so there is nothing to build from. Copy the whole folder, not just this page.</p>';
  }

  /* slate.json when served. A double-clicked page may not read a JSON file off the
     disk, so there it loads the same document from slate.js. */
  function fromScript() {
    var tag = document.createElement('script');
    tag.src = './data/slate.js';
    tag.onload = function () { start(window.DEMO_SLATE); };
    tag.onerror = fail;
    document.head.appendChild(tag);
  }
  if (location.protocol === 'file:') fromScript();
  else fetch('./data/slate.json').then(function (r) { return r.json(); }).then(start).catch(fail);
})();
