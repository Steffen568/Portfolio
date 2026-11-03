// Site behavior, ported from the design's renderVals(). Unit 01: routing, clock, copy email, F4. Unit 02: drawing engine, Home buttons. Unit 03: Projects, GO tour.
(function () {
  'use strict';
  var D = window.PORTFOLIO;
  var ORDER = D.order;
  var PAGES = ['home', 'projects', 'how'];
  var state = { page: null, cur: ORDER[0] };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  function scrollTop() {
    try { window.scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }

  // ---- Routing: #home, #projects/<id>, #how. The hash is the page state.
  function route() {
    var h = location.hash.replace(/^#/, '');
    var parts = h.split('/');
    var page = parts[0];
    if (page === 'projects') {
      var id = parts[1];
      if (!id) id = state.cur;
      if (ORDER.indexOf(id) < 0) id = ORDER[0];
      if (h !== 'projects/' + id) { history.replaceState(null, '', '#projects/' + id); }
      state.cur = id;
      seen[id] = true;
      titleT0 = Date.now();
    } else if (PAGES.indexOf(page) < 0) {
      if (h) history.replaceState(null, '', '#home');
      page = 'home';
    }
    show(page);
    renderProjects();
    if (page === 'projects') {
      ticking();
      var rail = $('[data-carts]'); // spec 05 D5: the row slides to the selected project
      bringIntoView(rail, rail.children[ORDER.indexOf(state.cur)]);
    }
  }

  function show(page) {
    var changed = state.page !== null && state.page !== page;
    state.page = page;
    $$('[data-page]').forEach(function (el) { el.hidden = el.getAttribute('data-page') !== page; });
    $$('.fk[data-go]').forEach(function (el) {
      var on = el.getAttribute('data-go') === page;
      el.classList.toggle('on', on);
      if (on) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
    if (changed) scrollTop();
    if (page !== 'how') closeWin(); // the full-graphic window belongs to How I work (unit 04)
    // Spec 05 D2/D3: a drawing that scrolls in its own box (phones) opens centred on its stack of plates where marked
    // (the drawing's axis, the dotted line through the stack).
    $$('[data-page="' + page + '"] [data-centre]').forEach(function (b) {
      var ax = b.querySelector('svg > .dg-ax').getBoundingClientRect(), r = b.getBoundingClientRect();
      b.scrollLeft += ax.left + ax.width / 2 - (r.left + r.width / 2);
    });
  }

  // Spec 05: slide a box sideways (never the page) so el is in view.
  function bringIntoView(box, el) {
    var b = box.getBoundingClientRect(), r = el.getBoundingClientRect(), d = 0;
    if (r.left < b.left) d = r.left - b.left - 8;
    else if (r.right > b.right) d = Math.min(r.right - b.right + 8, r.left - b.left - 8);
    if (!d) return;
    try { box.scrollTo({ left: box.scrollLeft + d, behavior: reduced.matches ? 'auto' : 'smooth' }); } catch (e) { box.scrollLeft += d; }
  }

  // pushState + route() switches the page in the same tick as the address (no flash of the old page).
  function go(hash) {
    if (location.hash !== hash) history.pushState(null, '', hash);
    route();
  }

  // ---- F4: scroll to the footer and flash its border once.
  var flashT;
  function goContact() {
    var f = $('[data-foot]');
    try { f.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'end' }); } catch (e) { f.scrollIntoView(false); }
    f.classList.remove('flash');
    void f.offsetWidth; // restart the animation on a repeat press
    f.classList.add('flash');
    clearTimeout(flashT);
    flashT = setTimeout(function () { f.classList.remove('flash'); }, 1000);
  }

  var ACTIONS = {
    home: function () { go('#home'); },
    projects: function () { go('#projects/' + state.cur); },
    how: function () { go('#how'); },
    contact: goContact,
    // GO: the next unviewed project in order; once all six are viewed, How I work (design: startTour).
    tour: function () {
      var nx = ORDER.filter(function (id) { return !seen[id]; })[0];
      go(nx ? '#projects/' + nx : '#how');
      scrollTop();
    }
  };
  $$('.fk[data-go]').forEach(function (el) {
    el.addEventListener('click', function () { ACTIONS[el.getAttribute('data-go')](); });
  });

  // ---- Copy email: "COPIED ✓" for 1.6 s.
  var copyBtn = $('[data-copy]');
  var copyT;
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }
  copyBtn.addEventListener('click', function () {
    var v = $('[data-email]').textContent.trim();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).catch(function () { fallbackCopy(v); });
      else fallbackCopy(v);
    } catch (e) { fallbackCopy(v); }
    copyBtn.textContent = 'COPIED ✓';
    clearTimeout(copyT);
    copyT = setTimeout(function () { copyBtn.textContent = 'COPY EMAIL'; }, 1600);
  });

  // ---- Clock: Temple, TX (America/Chicago), every 30 s, no seconds.
  function tick() {
    var d = new Date(), clock, date = '';
    try {
      clock = d.toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hourCycle: 'h23', hour: '2-digit', minute: '2-digit' });
      date = d.toLocaleDateString('en-US', { timeZone: 'America/Chicago', month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
    } catch (e) { clock = d.toTimeString().slice(0, 5); }
    $('[data-clock]').textContent = clock + ' CT';
    $('[data-date]').textContent = date;
  }
  tick();
  setInterval(tick, 30000);

  // ---- Drawing engine, shared by all eight drawings (ported from renderVals(): hv / lv / pk / K / L / C).
  // Hover a part or its legend button: it lights, the rest dim, the card shows it. Click / tap pins; again unpins.
  // Leaving returns to the pin, else the overview. Engine classes are dg- (spec 02): short names clashed in the design.
  function mountDrawing(svg) {
    var key = svg.getAttribute('data-dg');
    var X = D.drawings[key];
    var parts = $$('svg[data-dg="' + key + '"] [data-n]');
    var card = $('[data-dg-card="' + key + '"]');
    var lg = $('[data-dg-legend="' + key + '"]');
    var hov = 0, pin = 0;

    var btns = X.parts.map(function (pt, i) {
      var b = document.createElement('button');
      var n = document.createElement('i');
      b.type = 'button';
      b.className = 'lgb';
      n.textContent = String(i + 1);
      b.appendChild(n);
      b.appendChild(document.createTextNode(pt.name));
      b.addEventListener('click', function () {
        pick(i + 1);
        var box = svg.parentElement; // spec 05: on phones the drawing scrolls in its box; bring the tapped part into view
        if (box.scrollWidth > box.clientWidth) bringIntoView(box, parts.filter(function (g) { return +g.getAttribute('data-n') === i + 1; })[0]);
      });
      b.addEventListener('pointerenter', function () { hover(i + 1); });
      b.addEventListener('pointerleave', function () { hover(0); });
      lg.appendChild(b);
      return b;
    });

    function apply() {
      var act = hov || pin;
      parts.forEach(function (g) {
        var n = +g.getAttribute('data-n');
        g.classList.toggle('dg-on', act === n);
        g.classList.toggle('dg-dim', act !== 0 && act !== n);
      });
      btns.forEach(function (b, i) {
        b.classList.toggle('dg-on', act === i + 1);
        b.classList.toggle('dg-pin', pin === i + 1);
        b.setAttribute('aria-pressed', pin === i + 1 ? 'true' : 'false');
      });
      var c = act ? X.parts[act - 1] : X.over;
      var v = { n: act ? String(act) : '·', name: c.name, does: c.does, inp: c.inp, out: c.out, runs: c.runs };
      card.querySelectorAll('[data-f]').forEach(function (el) { el.textContent = v[el.getAttribute('data-f')]; });
      // A drawing with its own row labels (CLAUDE.md: STOPS / WHEN) lists only the rows that have a value (design: C.rows).
      var rows = card.querySelector('[data-dg-rows]');
      if (rows) {
        rows.textContent = '';
        [c.inp, c.out, c.runs].forEach(function (val, j) {
          if (!X.lab[j] || !val || val === '—') return;
          var l = document.createElement('span'), b = document.createElement('b');
          l.textContent = X.lab[j];
          b.textContent = val;
          rows.appendChild(l);
          rows.appendChild(b);
        });
      }
    }
    function hover(n) { if (hov !== n) { hov = n; apply(); } }
    function pick(n) { pin = pin === n ? 0 : n; apply(); }

    parts.forEach(function (g) {
      var n = +g.getAttribute('data-n');
      g.addEventListener('pointerenter', function () { hover(n); });
      g.addEventListener('click', function () { pick(n); });
    });
    svg.addEventListener('pointerleave', function () { hover(0); });
    // A part can hold links to projects (the Home cartridges): open it, without pinning the part.
    svg.querySelectorAll('[data-open]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.stopPropagation(); go('#projects/' + el.getAttribute('data-open')); });
    });
    apply();
  }
  $$('svg[data-dg]').forEach(mountDrawing);

  // ---- Projects (unit 03): the cycle, the selected project, previous / next. Ported from selectProject / carts / pj / scr.
  // A project counts as viewed once shown (route marks it). Each project's drawing, legend and card carry data-proj.
  var PJ = D.projects;
  var seen = {};
  var titleT0 = 0, hovCart = null, tickIv = null;
  var shotImg = $('.shot-img');
  var badgeText = $('[data-pj="badge"]').appendChild(document.createTextNode('')); // the status sits beside the dot, as in the design
  function setText(k, v) { $$('[data-pj="' + k + '"]').forEach(function (el) { el.textContent = v; }); }

  // Text scramble: the settled share grows left to right; the rest is random glyphs, spaces kept.
  function scr(text, t0, dur, now) {
    if (!t0 || reduced.matches) return text;
    var p = (now - t0) / dur;
    if (p >= 1) return text;
    var G = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/[]';
    var n = Math.floor(Math.max(0, p) * text.length);
    var o = text.slice(0, n);
    for (var i = n; i < text.length; i++) o += text[i] === ' ' ? ' ' : G[Math.floor(Math.random() * G.length)];
    return o;
  }
  // Redraws while a scramble runs, then stops (design: startTicker).
  function ticking() {
    if (tickIv || reduced.matches) return;
    tickIv = setInterval(function () {
      var now = Date.now();
      var busy = (hovCart && now - hovCart.t0 < 480) || now - titleT0 < 1000;
      renderProjects();
      if (!busy) { clearInterval(tickIv); tickIv = null; }
    }, 33);
  }

  function step(d) {
    var i = ORDER.indexOf(state.cur) + d;
    go(i < 0 ? '#home' : i >= ORDER.length ? '#how' : '#projects/' + ORDER[i]);
  }
  $$('[data-step]').forEach(function (el) {
    el.addEventListener('click', function () { step(+el.getAttribute('data-step')); });
  });

  // The cartridges: a tablist; arrow keys move the selection and the focus, wrapping within the six.
  var carts = ORDER.map(function (id, i) {
    var b = document.createElement('button');
    var parts = [['span', 'cart-n'], ['b', ''], ['span', 'cart-nm'], ['i', '']].map(function (t) {
      var el = document.createElement(t[0]);
      if (t[1]) el.className = t[1];
      b.appendChild(el);
      return el;
    });
    b.type = 'button';
    b.className = 'cart';
    b.setAttribute('role', 'tab');
    b.style.animationDelay = (i * 0.06).toFixed(2) + 's';
    parts[0].textContent = '0' + (i + 1);
    parts[1].textContent = PJ[id].tkr;
    b.addEventListener('click', function () { go('#projects/' + id); });
    b.addEventListener('pointerenter', function () { hovCart = { id: id, t0: Date.now() }; renderProjects(); ticking(); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var j = (i + d + ORDER.length) % ORDER.length;
      go('#projects/' + ORDER[j]);
      carts[j].el.focus();
    });
    $('[data-carts]').appendChild(b);
    return { el: b, name: parts[2], sub: parts[3] };
  });

  // The screenshot is only requested once its project's shot is set (a missing file logs a console error);
  // it stays hidden until it loads, so the striped placeholder shows if it fails.
  shotImg.addEventListener('load', function () { shotImg.hidden = false; });

  function renderProjects() {
    var now = Date.now();
    var cur = state.cur, P = PJ[cur], i = ORDER.indexOf(cur);
    var seenN = ORDER.filter(function (id) { return seen[id]; }).length;
    var nextId = ORDER.filter(function (id) { return !seen[id]; })[0] || null;
    var hov = hovCart && now - hovCart.t0 < 480 ? hovCart : null;
    carts.forEach(function (c, k) {
      var id = ORDER[k], Q = PJ[id], on = id === cur;
      c.el.className = 'cart' + (on ? ' on' : '') + (seen[id] ? ' seen' : '') + (id === nextId && !on ? ' nx' : '');
      c.el.setAttribute('aria-selected', on ? 'true' : 'false');
      c.el.tabIndex = on ? 0 : -1;
      c.name.textContent = hov && hov.id === id ? scr(Q.label, hov.t0, 400, now) : Q.label;
      c.sub.textContent = seen[id] ? '✓ ' + Q.sub : (id === nextId ? 'NEXT ▸ ' + Q.sub : Q.sub);
    });
    $('[data-seen]').textContent = 'VIEWED ' + seenN + '/' + ORDER.length;
    $('[data-tour-label]').textContent = seenN === 0 ? 'START TOUR' : (nextId ? 'CONTINUE' : 'DONE ✓');
    setText('idx', String(i + 1));
    setText('title', scr(P.label.toUpperCase(), titleT0 + 60, 550, now));
    setText('line', P.line);
    badgeText.nodeValue = P.status;
    setText('path', P.path);
    setText('what', P.what);
    setText('url', 'portfolio/' + P.path + 'index.html');
    setText('shotFile', P.path + 'screenshots/desktop.png');
    setText('prev', '‹ ' + (i > 0 ? PJ[ORDER[i - 1]].label.toUpperCase() : 'HOME'));
    setText('next', (i < ORDER.length - 1 ? PJ[ORDER[i + 1]].label.toUpperCase() : 'HOW I WORK') + ' ›');
    $('[data-pj="badge"]').className = 'live-badge' + (P.demo ? '' : ' wip');
    $$('[data-pj="demo"]').forEach(function (el) { el.hidden = !P.demo; el.setAttribute('href', P.path + 'index.html'); });
    $$('[data-pj="nodemo"]').forEach(function (el) { el.hidden = !!P.demo; });
    $('a.shot').setAttribute('aria-label', 'Open the ' + P.label + ' demo');
    $$('[data-proj]').forEach(function (el) { el.toggleAttribute('hidden', el.getAttribute('data-proj') !== cur); }); // svg has no .hidden
    var src = P.path + 'screenshots/desktop.png';
    if (!P.shot) { shotImg.hidden = true; shotImg.removeAttribute('src'); }
    else if (shotImg.getAttribute('src') !== src) { shotImg.hidden = true; shotImg.setAttribute('src', src); }
  }

  // ---- Home buttons: SEE THE 6 PROJECTS ▸ (current project) and HOW I WORK.
  $$('[data-act]').forEach(function (el) {
    el.addEventListener('click', function () { ACTIONS[el.getAttribute('data-act')](); });
  });

  // ---- How I work (unit 04): pause / play the loop (design: togglePause, simWrap, pauseLabel).
  var loop = $('[data-loop]');
  var pauseBtn = $('[data-pause]');
  // Spec 05 D4: the PAGE token rides on the top edge of each stop; the keyframes read half of each stop's height.
  var tokSim = $('.tok').parentElement;
  var stops = Array.prototype.slice.call(tokSim.querySelectorAll(':scope > .sn, :scope > .sg')); // Plan, Guard, Build, Check, Review, Done, Next
  function setStops() {
    stops.forEach(function (el, i) { tokSim.style.setProperty('--u' + 'PGBCRDN'[i], el.offsetHeight / 2 + 'px'); });
  }
  if (window.ResizeObserver) { var ro = new ResizeObserver(setStops); stops.forEach(function (el) { ro.observe(el); }); }
  setStops();
  pauseBtn.addEventListener('click', function () {
    var p = loop.classList.toggle('paused');
    pauseBtn.textContent = p ? '▶ PLAY' : '❚❚ PAUSE';
  });

  // The full-graphic window: opens like a CRT turning on; closes with ✕, the scrim, Esc or a page change
  // (design: openMap / openClaude / closeWin / wHead). Focus goes to CLOSE ✕ and back to the opener (spec 04).
  var WIN = { map: "THE BUILDER'S MAP · FULL GRAPHIC", claude: 'THE CLAUDE.MD ANATOMY · FULL GRAPHIC' };
  var scrim = $('[data-scrim]'), winWrap = $('[data-win-wrap]'), win = $('[data-win-wrap] [role="dialog"]');
  var winHead = $('[data-win-head]'), winClose = $('[data-win-close]'), opener = null;
  function openWin(key, btn) {
    opener = btn;
    winHead.firstChild.nodeValue = WIN[key];
    win.setAttribute('aria-label', WIN[key]);
    $$('[data-win-img]').forEach(function (img) { img.hidden = img.getAttribute('data-win-img') !== key; });
    scrim.classList.add('on');
    winWrap.classList.add('on');
    winClose.focus();
  }
  function closeWin() {
    if (!winWrap || !winWrap.classList.contains('on')) return;
    scrim.classList.remove('on');
    winWrap.classList.remove('on');
    if (opener) opener.focus();
    opener = null;
  }
  $$('[data-win]').forEach(function (b) {
    b.addEventListener('click', function () { openWin(b.getAttribute('data-win'), b); });
  });
  winClose.addEventListener('click', closeWin);
  scrim.addEventListener('click', closeWin);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeWin(); });

  window.addEventListener('hashchange', route);
  route();
})();
