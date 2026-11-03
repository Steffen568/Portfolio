/* The terminal's build rules, ported to jsLPSolver (specs/portfolio-demo.md).
 *
 * The real solver is Python on the owner's PC (src/dfs/optimizer/slate.py) and
 * cannot run in a browser, so the CONSTRAINTS are what is copied: same roster,
 * same defaults, same refusals. tests/test_portfolio_demo.py holds the first
 * lineup of each book against the real solver.
 *
 * One lineup at a time, the way the real one works: prove the best remaining
 * roster, record it, go again. `stream` is a generator so the page can draw each
 * card as it is proved and the screen never sits frozen.
 */
(function (root) {
  'use strict';

  var RULES = {
    salaryCap: 50000,   // SALARY_CAP
    minSalary: 45000,   // the terminal's default MIN SALARY
    maxPerTeam: 4,      // the terminal's default MAX PLAYERS PER TEAM
    minGames: 2,        // the vendored CFB settings' min_games
    maxShared: 6,       // the terminal's default MAX REPEATING PLAYERS
    maxLineups: 20,     // the demo's own speed rail
    // THE SPEED GATE'S CUT (spec E1). The full 118 took 3.03 s for 20 plain lineups at
    // phone speed, a miss; 40's slowest setting tried takes 2.27 s press to done. This is
    // the demo's pool, not the terminal's, and the screen says so.
    poolSize: 40,
    seats: ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'FLEX', 'SUPER FLEX'],
    takes: { QB: ['QB'], RB: ['RB'], WR: ['WR'], FLEX: ['RB', 'WR'], 'SUPER FLEX': ['QB', 'RB', 'WR'] },
    // HOW THE ROSTER BECOMES COUNTS. Eight seats with these minimums says exactly
    // what the seat list says: FLEX and SUPER FLEX absorb any spare RB or WR, and
    // only SUPER FLEX can take a second QB, so QB tops out at 2.
    least: { QB: 1, RB: 2, WR: 3 },
    most: { QB: 2 }
  };

  function refusal(text) {
    var e = new Error(text);
    e.refusal = true;
    return e;
  }

  /* `_why_not` in slate.py, already decided by the terminal and frozen in `drop`. */
  function usable(players) {
    return players.filter(function (p) { return !p.drop; });
  }

  /* Who the solver is actually given: the usable players, best projection first,
     cut to poolSize. Ties break on id so the cut is the same on every device. */
  function solverPool(players) {
    return usable(players).slice().sort(function (a, b) {
      return b.proj - a.proj || (a.id < b.id ? -1 : 1);
    }).slice(0, RULES.poolSize);
  }

  function clampLineups(n) {
    var v = Math.floor(Number(n));
    if (!(v >= 1)) v = 1;
    return Math.min(v, RULES.maxLineups);
  }

  /* FLOOR for "at most", CEIL for "at least" - a cap of 55% on 20 is 11, and a
     rounded cap is one exceeded in every book that has one (rule 32). */
  function maxCount(pct, n) { return Math.floor(pct * n / 100 + 1e-9); }
  function minCount(pct, n) { return Math.ceil(pct * n / 100 - 1e-9); }

  function nameOf(byId, id) { return byId[id] ? byId[id].name : id; }

  /* Everything refused BEFORE the solver runs, in the words a person typed. The
     solver can only say "no", which names nothing anybody can go and change. */
  function refuseEarly(pool, byId, s, n) {
    var locked = s.locked || [], excluded = s.excluded || [];
    var caps = s.caps || {}, mins = s.mins || {}, glob = s.maxExposure;
    var seats = RULES.seats.length;
    var i, id;

    for (i = 0; i < locked.length; i++) {
      id = locked[i];
      if (excluded.indexOf(id) >= 0) {
        throw refusal(nameOf(byId, id) + ' is both locked and excluded. Clear one of them on 1<POOL>.');
      }
      if (caps[id] != null && maxCount(caps[id], n) < n) {
        throw refusal(nameOf(byId, id) + ' is locked into every lineup but has a max exposure of ' +
          caps[id] + '%. Clear the lock or raise that max on 1<POOL>.');
      }
      if (glob != null && maxCount(glob, n) < n) {
        throw refusal(nameOf(byId, id) + ' is locked into every lineup, and the global max exposure of ' +
          glob + '% says nobody may be. Clear the lock on 1<POOL> or raise the global cap on 2<BUILD>.');
      }
    }
    // Asked of COUNTS, not percentages. Max rounds down and min rounds up, so 50% and
    // 50% of 5 lineups means at least 3 and at most 2, and the percentages look fine.
    var counted = function (lo, hi) {
      return n + ' lineups, that is at least ' + minCount(lo, n) + ' and at most ' + maxCount(hi, n) + '.';
    };
    for (id in mins) {
      if (excluded.indexOf(id) >= 0) {
        throw refusal(nameOf(byId, id) + ' is excluded but has a min exposure of ' + mins[id] +
          '%. Clear one of them on 1<POOL>.');
      }
      if (caps[id] != null && minCount(mins[id], n) > maxCount(caps[id], n)) {
        throw refusal(nameOf(byId, id) + ' has a min exposure of ' + mins[id] + '% and a max of ' +
          caps[id] + '%. On ' + counted(mins[id], caps[id]) + ' Change one on 1<POOL>.');
      }
      if (glob != null && minCount(mins[id], n) > maxCount(glob, n)) {
        throw refusal(nameOf(byId, id) + ' has a min exposure of ' + mins[id] +
          '% and the global maximum is ' + glob + '%. On ' + counted(mins[id], glob) + ' Change one of them.');
      }
    }
    var inPool = {};
    pool.forEach(function (p) { inPool[p.id] = 1; });
    locked.concat(Object.keys(mins)).forEach(function (who) {
      if (!inPool[who]) {
        throw refusal(nameOf(byId, who) + ' is outside the top ' + RULES.poolSize +
          ' this demo solves, so cannot be locked or given a min exposure.');
      }
    });
    if (locked.length > seats) {
      throw refusal(locked.length + ' players are locked and a lineup has ' + seats + ' seats. Unlock some on 1<POOL>.');
    }
    var lockedSalary = 0, lockedPos = { QB: 0, RB: 0, WR: 0 };
    for (i = 0; i < locked.length; i++) {
      lockedSalary += byId[locked[i]].sal;
      lockedPos[byId[locked[i]].pos] += 1;
    }
    if (lockedPos.QB > RULES.most.QB) {
      throw refusal(lockedPos.QB + ' quarterbacks are locked and a lineup can hold ' + RULES.most.QB + '. Unlock one on 1<POOL>.');
    }
    if (lockedSalary > RULES.salaryCap) {
      throw refusal('The locked players cost $' + lockedSalary.toLocaleString('en-US') +
        ' and the cap is $50,000. Unlock someone on 1<POOL>.');
    }
    var left = pool.filter(function (p) { return excluded.indexOf(p.id) < 0; });
    for (var pos in RULES.least) {
      var have = left.filter(function (p) { return p.pos === pos; }).length;
      if (have < RULES.least[pos]) {
        throw refusal('Only ' + have + ' ' + pos + ' left after your excludes and a lineup needs ' +
          RULES.least[pos] + '. Clear an exclude on 1<POOL>.');
      }
    }
    // The port of `cap_refusal` in slate.py: arithmetic, so it never reaches the solver.
    if (glob != null && left.length * maxCount(glob, n) < seats * n) {
      throw refusal('A global max exposure of ' + glob + '% cannot fill ' + n + ' lineups of ' + seats +
        ' out of the ' + left.length + ' players left to solve. Raise the cap on 2<BUILD>.');
    }
  }

  /* One lineup's model. `banned` are men whose cap has run out; `due` are men whose
     floor needs them in this one. */
  function model(pool, s, previous, banned, due, stackTeam) {
    var constraints = {
      salary: { min: RULES.minSalary, max: RULES.salaryCap },
      seats: { equal: RULES.seats.length }
    };
    var pos;
    for (pos in RULES.least) {
      constraints['pos_' + pos] = { min: RULES.least[pos] };
      if (RULES.most[pos]) constraints['pos_' + pos].max = RULES.most[pos];
    }
    var variables = {}, ints = {};
    var excluded = {};
    (s.excluded || []).forEach(function (id) { excluded[id] = 1; });
    var live = pool.filter(function (p) { return !excluded[p.id] && !banned[p.id]; });

    live.forEach(function (p) {
      var v = 'p' + p.id;
      var row = { proj: p.proj, salary: p.sal, seats: 1 };
      row['pos_' + p.pos] = 1;
      row['team_' + p.team] = 1;
      row['game_' + p.game] = 1;
      row['once_' + p.id] = 1;
      variables[v] = row;
      ints[v] = 1;
      constraints['once_' + p.id] = { max: 1 };
      constraints['team_' + p.team] = { max: RULES.maxPerTeam };
      // At least two games out of eight men is at most seven from any one game.
      constraints['game_' + p.game] = { max: RULES.seats.length - (RULES.minGames - 1) };
    });

    (s.locked || []).forEach(function (id) {
      if (variables['p' + id]) constraints['once_' + id] = { equal: 1 };
    });

    // FLOORS, PACED ACROSS THE BOOK. A man behind his pace is forced into this
    // lineup. Left to the last moment (the vendored MinExposureRule), six floors
    // come due in the same final lineups, and those lineups then share too many
    // men to pass rule 11: 14 of 20 on this slate. Each man's pace is offset by his
    // place in the list so they take turns rather than all falling due together.
    due.forEach(function (id) {
      if (variables['p' + id]) constraints['once_' + id] = { equal: 1 };
    });

    previous.forEach(function (lu, i) {
      var c = 'shared_' + i;
      constraints[c] = { max: RULES.maxShared };
      lu.ids.forEach(function (id) {
        if (variables['p' + id]) variables['p' + id][c] = 1;
      });
    });

    // THE STACK, FOR ONE NAMED TEAM: its quarterback and N of his own receivers.
    // Receivers only: a running back is a teammate and is not a stack (rule 47).
    if (stackTeam) {
      constraints.stack_qb = { min: 1 };
      constraints.stack_wr = { min: Number(s.stack) };
      live.forEach(function (p) {
        if (p.team !== stackTeam) return;
        if (p.pos === 'QB') variables['p' + p.id].stack_qb = 1;
        if (p.pos === 'WR') variables['p' + p.id].stack_wr = 1;
      });
    }

    return { optimize: 'proj', opType: 'max', constraints: constraints, variables: variables, ints: ints };
  }

  /* The best lineup under the rules. Without a stack, one solve.

     WITH A STACK, ONE SOLVE PER TEAM THAT COULD BE THE STACK, because "some QB has
     N of his own receivers" written as a single model took 4.86 s for 20 QB+3
     lineups at phone speed, and this takes 0.56 s. The same rule per team is an easy
     model each time. Each team first gets a quick upper limit (the same model
     allowing fractions of a player), best first, and once a real lineup beats a
     team's limit that team and all below it cannot win. Exact: same answer. */
  function solveBest(pool, s, previous, banned, due) {
    if (!s.stack) return root.solver.Solve(model(pool, s, previous, banned, due));
    var teams = {};
    pool.forEach(function (p) { if (p.pos === 'QB') teams[p.team] = 1; });
    var ranked = Object.keys(teams).sort().map(function (team) {
      var relaxed = model(pool, s, previous, banned, due, team);
      relaxed.ints = {};
      return { team: team, limit: root.solver.Solve(relaxed) };
    }).filter(function (x) { return x.limit.feasible; }).sort(function (a, b) {
      return b.limit.result - a.limit.result || (a.team < b.team ? -1 : 1);
    });
    var best = { feasible: false };
    for (var i = 0; i < ranked.length; i++) {
      if (best.feasible && ranked[i].limit.result <= best.result + 1e-6) break;
      var got = root.solver.Solve(model(pool, s, previous, banned, due, ranked[i].team));
      if (got.feasible && (!best.feasible || got.result > best.result)) best = got;
    }
    return best;
  }

  /* Which man sits where. The cheapest legal reading of counts the solver already
     made legal: required seats first, then the leftovers into FLEX and SUPER FLEX. */
  function seat(ids, byId) {
    var left = ids.map(function (id) { return byId[id]; })
      .sort(function (a, b) { return b.sal - a.sal || (a.id < b.id ? -1 : 1); });
    return RULES.seats.map(function (slot) {
      // A second quarterback can only ever sit in SUPER FLEX, so RB and WR go in
      // FLEX first and SUPER FLEX takes whoever is left.
      for (var i = 0; i < left.length; i++) {
        if (RULES.takes[slot].indexOf(left[i].pos) >= 0) {
          return { slot: slot, id: left.splice(i, 1)[0].id };
        }
      }
      throw new Error('no one left for ' + slot);
    });
  }

  function shortReason(pool, s, made, asked) {
    var bits = ['The solver proved ' + made + ' of the ' + asked + ' lineups asked for and then ran out of legal ones. ' +
      'Every lineup on screen is real. What was in force:'];
    var excluded = (s.excluded || []).length;
    bits.push((pool.length - excluded) + ' players to solve for 8 seats');
    bits.push('MAX REPEATING ' + RULES.maxShared + ' - no two lineups share more than ' + RULES.maxShared + ' of 8');
    if (s.maxExposure != null) bits.push('GLOBAL MAX EXPOSURE ' + s.maxExposure + '%');
    if (excluded) bits.push(excluded + ' excluded on 1<POOL>');
    if ((s.locked || []).length) bits.push(s.locked.length + ' locked into every lineup');
    if (Object.keys(s.caps || {}).length) bits.push(Object.keys(s.caps).length + ' player max exposures');
    if (Object.keys(s.mins || {}).length) bits.push(Object.keys(s.mins).length + ' player min exposures');
    if (s.stack) bits.push('STACK QB+' + s.stack);
    return bits;
  }

  function* stream(players, settings) {
    var s = settings || {};
    var pool = solverPool(players);
    var byId = {};
    players.forEach(function (p) { byId[p.id] = p; });
    var n = clampLineups(s.n);
    refuseEarly(pool, byId, s, n);

    var glob = s.maxExposure;
    var allowed = {};
    pool.forEach(function (p) {
      var caps = [glob, (s.caps || {})[p.id]].filter(function (v) { return v != null; });
      if (caps.length) allowed[p.id] = maxCount(Math.min.apply(null, caps), n);
    });
    var floored = Object.keys(s.mins || {});

    var used = {}, book = [];
    while (book.length < n) {
      var banned = {};
      Object.keys(allowed).forEach(function (id) {
        if ((used[id] || 0) >= allowed[id]) banned[id] = 1;
      });
      var done = book.length + 1;
      var due = floored.filter(function (id, i) {
        var pace = Math.floor(minCount(s.mins[id], n) * done / n + i / floored.length);
        return (used[id] || 0) < pace;
      });
      var solved = solveBest(pool, s, book, banned, due);
      if (!solved.feasible) break;
      var ids = pool.filter(function (p) { return solved['p' + p.id] > 0.5; })
        .map(function (p) { return p.id; });
      var lu = {
        ids: ids,
        seats: seat(ids, byId),
        proj: Math.round(ids.reduce(function (t, id) { return t + byId[id].proj; }, 0) * 100) / 100,
        sal: ids.reduce(function (t, id) { return t + byId[id].sal; }, 0),
        own: Math.round(ids.reduce(function (t, id) { return t + (byId[id].own || 0); }, 0) * 10) / 10
      };
      ids.forEach(function (id) { used[id] = (used[id] || 0) + 1; });
      book.push(lu);
      yield lu;
    }

    if (!book.length) {
      var on = shortReason(pool, s, 0, n).slice(1).join(' · ');
      throw refusal('No lineup satisfies these settings together. In force: ' + on + '. Loosen one and press BUILD again.');
    }
    return { short: book.length < n ? shortReason(pool, s, book.length, n).join('\n') : null };
  }

  /* 4<SWAP>'s pool: every legal version of an entry that changes one seat, best first,
     at most 25 (the real pool's size per entry). Plain arithmetic, no solver: the real
     terminal re-solves and can change several seats, which is more than a disabled
     screen needs. A lineup-level rule check decides what is legal, so there is no
     second copy of the rules here. Exposure and repeats are book rules and do not apply. */
  function swapVersions(players, lu, settings) {
    var s = settings || {}, byId = {}, out = [];
    players.forEach(function (p) { byId[p.id] = p; });
    var rules = { n: 1, stack: s.stack, locked: s.locked, excluded: s.excluded };
    var within = function (men) {
      return Object.keys(RULES.least).every(function (pos) {
        var c = men.filter(function (m) { return m.pos === pos; }).length;
        return c >= RULES.least[pos] && (!RULES.most[pos] || c <= RULES.most[pos]);
      });
    };
    lu.ids.forEach(function (leaving) {
      solverPool(players).forEach(function (p) {
        if (lu.ids.indexOf(p.id) >= 0) return;
        var ids = lu.ids.map(function (id) { return id === leaving ? p.id : id; });
        if (!within(ids.map(function (id) { return byId[id]; }))) return;
        var version = {
          out: leaving, in: p.id, ids: ids, seats: seat(ids, byId),
          proj: Math.round(ids.reduce(function (t, id) { return t + byId[id].proj; }, 0) * 100) / 100
        };
        if (!checkBook(players, [version], rules).length) out.push(version);
      });
    });
    return out.sort(function (a, b) {
      return b.proj - a.proj || (a.in < b.in ? -1 : a.in > b.in ? 1 : (a.out < b.out ? -1 : 1));
    }).slice(0, 25);
  }

  /* Run on what was produced, after it was produced. This is what the screen's
     "RULE CHECK" counts; tests/test_portfolio_demo.py proves it can fail. */
  function checkBook(players, book, settings) {
    var s = settings || {}, n = clampLineups(s.n), byId = {}, bad = [], counts = {};
    players.forEach(function (p) { byId[p.id] = p; });
    book.forEach(function (lu, i) {
      var label = 'LU ' + (i + 1) + ': ';
      var men = lu.ids.map(function (id) { return byId[id]; });
      var sal = men.reduce(function (t, m) { return t + m.sal; }, 0);
      if (sal > RULES.salaryCap) bad.push(label + 'over the salary cap');
      if (sal < RULES.minSalary) bad.push(label + 'under the min salary');
      if (new Set(lu.ids).size !== RULES.seats.length) bad.push(label + 'a player twice');
      if (lu.seats.map(function (x) { return x.slot; }).join() !== RULES.seats.join()) bad.push(label + 'wrong seats');
      lu.seats.forEach(function (x) {
        if (RULES.takes[x.slot].indexOf(byId[x.id].pos) < 0) bad.push(label + byId[x.id].pos + ' in ' + x.slot);
      });
      var team = {}, game = {};
      men.forEach(function (m) {
        team[m.team] = (team[m.team] || 0) + 1;
        game[m.game] = 1;
        counts[m.id] = (counts[m.id] || 0) + 1;
        if (m.drop) bad.push(label + m.name + ' is not usable');
      });
      if (Object.keys(team).some(function (t) { return team[t] > RULES.maxPerTeam; })) bad.push(label + 'over the team limit');
      if (Object.keys(game).length < RULES.minGames) bad.push(label + 'one game only');
      if (s.stack && !men.some(function (q) {
        return q.pos === 'QB' && men.filter(function (m) { return m.team === q.team && m.pos === 'WR'; }).length >= s.stack;
      })) bad.push(label + 'no QB+' + s.stack);
      (s.locked || []).forEach(function (id) { if (lu.ids.indexOf(id) < 0) bad.push(label + nameOf(byId, id) + ' locked, missing'); });
      (s.excluded || []).forEach(function (id) { if (lu.ids.indexOf(id) >= 0) bad.push(label + nameOf(byId, id) + ' excluded, rostered'); });
      for (var j = 0; j < i; j++) {
        var shared = lu.ids.filter(function (id) { return book[j].ids.indexOf(id) >= 0; }).length;
        if (shared > RULES.maxShared) bad.push(label + 'shares ' + shared + ' with LU ' + (j + 1));
      }
    });
    Object.keys(counts).forEach(function (id) {
      var caps = [s.maxExposure, (s.caps || {})[id]].filter(function (v) { return v != null; });
      if (caps.length && counts[id] > maxCount(Math.min.apply(null, caps), n)) bad.push(nameOf(byId, id) + ' over max exposure');
    });
    if (book.length === n) {
      Object.keys(s.mins || {}).forEach(function (id) {
        if ((counts[id] || 0) < minCount(s.mins[id], n)) bad.push(nameOf(byId, id) + ' under min exposure');
      });
    }
    return bad;
  }

  root.DemoBuild = {
    RULES: RULES, usable: usable, solverPool: solverPool, stream: stream, checkBook: checkBook, swapVersions: swapVersions,
    clampLineups: clampLineups, maxCount: maxCount, minCount: minCount
  };
})(window);
