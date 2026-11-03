// Page behavior, ported from the design's componentDidMount() and renderVals(). Each unit adds its own block.
(function () {
  var P = window.PORTFOLIO;

  // Clock: America/Chicago, HH:MM, every 30 s. hourCycle h23 so midnight reads 00:xx, not 24:xx.
  var clock = document.querySelector('[data-clock]');
  function tick() {
    try { clock.textContent = new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }); } catch (e) {}
  }
  tick();
  setInterval(tick, 30000);

  // Copy email: clipboard, then "COPIED ✓" for 1.6 s.
  var copy = document.querySelector('[data-copy]');
  var ct;
  copy.addEventListener('click', function () {
    var v = document.querySelector('.hd-r .em').textContent;
    try { if (navigator.clipboard) navigator.clipboard.writeText(v).catch(function () {}); } catch (e) {}
    copy.textContent = 'COPIED ✓';
    clearTimeout(ct);
    ct = setTimeout(function () { copy.textContent = 'COPY EMAIL'; }, 1600);
  });

  // Skills row: one button per skill with the number of projects that show it.
  var row = document.querySelector('[data-skills]');
  P.skills.forEach(function (k) {
    var b = document.createElement('button');
    b.className = 'sk';
    b.type = 'button';
    b.dataset.skill = k.id;
    b.textContent = k.label;
    var n = document.createElement('i');
    n.textContent = String(P.projects.filter(function (p) { return p.skills.some(function (x) { return x[0] === k.id; }); }).length);
    b.appendChild(n);
    row.appendChild(b);
  });

  // Environment tiles: pointing at one spotlights its part of the graphic (fx-p / fx-e / fx-s); leaving clears it.
  // A tap fires enter, leave, then click, so on a phone the click keeps it and the next tap switches it.
  var fw = document.querySelector('.fw2');
  function fx(k) {
    fw.classList.remove('fx-p', 'fx-e', 'fx-s');
    if (k) fw.classList.add('fx-' + k);
  }
  document.querySelectorAll('.tri[data-fx]').forEach(function (t) {
    var k = t.dataset.fx;
    t.addEventListener('pointerenter', function () { fx(k); });
    t.addEventListener('pointerleave', function () { fx(''); });
    t.addEventListener('click', function () { fx(k); });
  });

  // Reduced motion: CSS stops every animation, but not the dot's SVG motion, so park it at the start (under PLAN).
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  function park() {
    if (still.matches) { fw.pauseAnimations(); fw.setCurrentTime(0); } else fw.unpauseAnimations();
  }
  park();
  if (still.addEventListener) still.addEventListener('change', park);

  // Windows over the scrim: one open at a time. Any .win-wrap works (the image window here, the project panel in unit 04).
  // Focus moves to CLOSE ✕ on open, Tab stays inside, and ✕, the scrim or Esc close it and hand focus back.
  // An optional done() runs when the window closes, however it closes (the project panel uses it for the hash).
  var scrim = document.querySelector('[data-scrim]');
  var openWin = null, opener = null, onClose = null;
  function showWin(wrap, from, done) {
    if (openWin) closeWin();
    openWin = wrap;
    opener = from || null;
    onClose = done || null;
    wrap.hidden = false;
    scrim.classList.add('on');
    wrap.querySelector('[data-close]').focus();
  }
  function closeWin() {
    if (!openWin) return;
    var done = onClose;
    openWin.hidden = true;
    openWin = null;
    onClose = null;
    scrim.classList.remove('on');
    if (done) done();
    if (opener) opener.focus();
    opener = null;
  }
  scrim.addEventListener('click', closeWin);
  document.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', closeWin); });
  document.addEventListener('keydown', function (e) {
    if (!openWin) return;
    if (e.key === 'Escape') { closeWin(); return; }
    if (e.key !== 'Tab') return;
    var f = openWin.querySelectorAll('a[href], button:not([disabled])');
    var first = f[0], last = f[f.length - 1], at = document.activeElement;
    if (!openWin.contains(at) || (e.shiftKey ? at === first : at === last)) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  });

  // CLAUDE.md ⤢ / BUILDER'S MAP ⤢: the full graphic in the image window. Each image loads the first time it is shown.
  var imgWin = document.querySelector('[data-win="img"]');
  document.querySelectorAll('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      imgWin.querySelectorAll('[data-img]').forEach(function (img) {
        var on = img.dataset.img === b.dataset.open;
        img.hidden = !on;
        if (!on) return;
        if (!img.getAttribute('src')) img.setAttribute('src', img.dataset.src);
        imgWin.querySelector('.wh b').textContent = img.dataset.head;
        imgWin.querySelector('[role="dialog"]').setAttribute('aria-label', img.dataset.head);
      });
      showWin(imgWin, b);
    });
  });

  // Project cards, built from the data as the design's card() does: sports tools two each side, websites centered below.
  // Stagger: 0.5 s + 0.12 s per card; left cards spawn from +30 px, right from −30 px, websites in place.
  var label = {};
  P.skills.forEach(function (k) { label[k.id] = k.label; });
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  var data = P.projects.filter(function (p) { return p.group === 'data'; });
  [
    [document.querySelector('.col-main:not(.col-r) .grid1'), data.slice(0, 2), '30px', 0],
    [document.querySelector('.col-r .grid1'), data.slice(2), '-30px', 2],
    [document.querySelector('.web-row .grid-web'), P.projects.filter(function (p) { return p.group === 'web'; }), '0px', 4]
  ].forEach(function (place) {
    place[1].forEach(function (p, i) {
      var b = el('button', 'card');
      b.type = 'button';
      b.dataset.card = p.id;
      b.style.cssText = '--fx: ' + place[2] + '; animation-delay: ' + (0.5 + (place[3] + i) * 0.12).toFixed(2) + 's';
      b.setAttribute('aria-label', p.name + ': ' + p.line);
      var thumb = el('span', 'thumb');
      thumb.append(el('b', null, p.tkr), el('span', null, 'SCREENSHOT PENDING'));
      var st = el('span', 'st' + (p.wip ? ' wip' : ''));
      st.append(el('i'), p.status);
      var top = el('span', 'card-t');
      top.append(el('b', null, p.name), st);
      var chips = el('span', 'chips');
      p.skills.forEach(function (x) {
        var c = el('span', 'chip', label[x[0]]);
        c.dataset.skill = x[0];
        chips.appendChild(c);
      });
      var body = el('span', 'card-b');
      body.append(top, el('p', null, p.line), chips);
      b.append(el('span', 'go', 'OPEN ▸'), thumb, body);
      place[0].appendChild(b);
    });
  });

  // Hover or focus: the card and its line light up (.on) and the name scrambles for 380 ms (the design's scr() and tick()).
  // The lines are in the design's project order. No scramble under reduced motion.
  var lineFor = {};
  var lines = document.querySelectorAll('svg.lines .ln');
  P.projects.forEach(function (p, i) { lineFor[p.id] = lines[i]; });
  var G = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/';
  var sc = null, iv = null, hov = null; // one card on at a time, as the design's hov
  var sk = '', pin = '', openId = null; // the active skill, the pinned skill, the project whose panel is open

  // Every class that follows from the state, as the design's card() and LC: a card is on while hovered or open;
  // with a skill active, cards that show it are .hit with that chip filled and the rest .dim; a line is on
  // for its hovered or open card, or when its card shows the active skill. The definition line follows the skill.
  var skDef = document.querySelector('.skl-def');
  function paint() {
    P.projects.forEach(function (p) {
      var card = document.querySelector('[data-card="' + p.id + '"]');
      var match = !!sk && p.skills.some(function (x) { return x[0] === sk; });
      card.classList.toggle('on', hov === card || openId === p.id);
      card.classList.toggle('hit', !!sk && match);
      card.classList.toggle('dim', !!sk && !match);
      card.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c.dataset.skill === sk); });
      lineFor[p.id].classList.toggle('on', hov === card || openId === p.id || match);
    });
    document.querySelectorAll('.skl .sk').forEach(function (b) { b.classList.toggle('on', b.dataset.skill === sk); });
    var k = P.skills.find(function (x) { return x.id === sk; });
    if (!k) { skDef.replaceChildren(el('b', null, '8 SKILLS ACROSS 6 PROJECTS')); return; }
    var names = P.projects.filter(function (p) { return p.skills.some(function (x) { return x[0] === sk; }); }).map(function (p) { return p.name; });
    skDef.replaceChildren(el('b', null, k.label + ':'), ' ' + k.def + ' Shown in ' + names.join(', ') + '.');
  }
  function scr(text, t0, now) {
    var p = (now - t0) / 380;
    if (p >= 1) return text;
    var n = Math.floor(Math.max(0, p) * text.length);
    var o = text.slice(0, n);
    for (var i = n; i < text.length; i++) o += text[i] === ' ' ? ' ' : G[Math.floor(Math.random() * G.length)];
    return o;
  }
  function step() {
    var now = Date.now();
    sc.el.textContent = scr(sc.name, sc.t0, now);
    if (now - sc.t0 > 420) { clearInterval(iv); iv = null; }
  }
  document.querySelectorAll('.card').forEach(function (card) {
    var p = P.projects.find(function (x) { return x.id === card.dataset.card; });
    function enter() {
      if (hov === card) return;
      hov = card;
      paint();
      if (still.matches) return;
      if (sc && sc.el !== card.querySelector('.card-t > b')) sc.el.textContent = sc.name;
      sc = { el: card.querySelector('.card-t > b'), name: p.name, t0: Date.now() };
      step();
      if (!iv) iv = setInterval(step, 33);
    }
    function leave() { if (hov === card) { hov = null; paint(); } }
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointerleave', leave);
    card.addEventListener('focus', enter);
    card.addEventListener('blur', leave);
    card.addEventListener('animationend', function (e) { if (e.animationName === 'spawn') measure(); });
  });

  // Connector lines, the design's measure(): right-angled paths from the environment window to each card, in stage
  // coordinates. Measured on load, on resize, after fonts load, and again as each card lands (the design misses that).
  // A hovered or focused card is lifted 3 px; its current lift is taken out so the line lands on the resting card.
  var stage = document.querySelector('.stage'), fwin = document.querySelector('[data-eng] .fwin');
  function resting(card) {
    var b = card.getBoundingClientRect(), m = new DOMMatrixReadOnly(getComputedStyle(card).transform);
    return { left: b.left - m.e, right: b.right - m.e, top: b.top - m.f, bottom: b.bottom - m.f, width: b.width, height: b.height };
  }
  function measure() {
    var wide = window.innerWidth > 1000;
    var sr = stage.getBoundingClientRect(), fr = fwin.getBoundingClientRect();
    P.projects.forEach(function (p) {
      var d = 'M0 0';
      var r = resting(document.querySelector('[data-card="' + p.id + '"]'));
      if (!wide) {
        // no lines at 1000 px and below
      } else if (r.top > fr.bottom) {
        var tx = r.left + r.width / 2 - sr.left, ty = r.top - sr.top;
        var sx = Math.max(fr.left + 60, Math.min(fr.right - 60, r.left + r.width / 2)) - sr.left, sy = fr.bottom - sr.top;
        var my = (sy + ty) / 2;
        d = 'M' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ' V' + my.toFixed(1) + ' H' + tx.toFixed(1) + ' V' + ty.toFixed(1);
      } else {
        var left = r.right < fr.left;
        var ty2 = r.top + Math.min(r.height * 0.3, 70) - sr.top;
        var tx2 = (left ? r.right : r.left) - sr.left;
        var sx2 = (left ? fr.left : fr.right) - sr.left;
        var sy2 = Math.max(fr.top - sr.top + 50, Math.min(fr.bottom - sr.top - 50, ty2));
        var mx = left ? (tx2 + sx2) / 2 : (sx2 + tx2) / 2;
        d = 'M' + sx2.toFixed(1) + ' ' + sy2.toFixed(1) + ' H' + mx.toFixed(1) + ' V' + ty2.toFixed(1) + ' H' + tx2.toFixed(1);
      }
      lineFor[p.id].setAttribute('d', d);
    });
  }
  measure();
  window.addEventListener('resize', measure);
  setTimeout(measure, 60);
  setTimeout(measure, 700);
  try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure); } catch (e) {}

  // Skills filter, the design's H.sk: pointing at or focusing a skill previews it; leaving shows the pinned skill
  // (or none). A click pins it, a second click unpins it. A tap fires enter, leave, then click, so it pins too.
  document.querySelectorAll('.skl .sk').forEach(function (b) {
    var id = b.dataset.skill;
    function on() { if (sk !== id) { sk = id; paint(); } }
    function off() { if (sk !== pin) { sk = pin; paint(); } }
    b.addEventListener('pointerenter', on);
    b.addEventListener('pointerleave', off);
    b.addEventListener('focus', on);
    b.addEventListener('blur', off);
    b.addEventListener('click', function () { pin = pin === id ? '' : id; sk = pin; paint(); });
  });

  // The project panel (the design's pj), in unit 02's window. One level deep: its only link is the demo.
  var pjWin = document.querySelector('[data-win="pj"]');
  function fill(p) {
    var q = function (s) { return pjWin.querySelector(s); };
    q('[role="dialog"]').setAttribute('aria-label', p.name);
    q('.wh b').textContent = p.tkr + ' · ' + (p.group === 'web' ? 'WEBSITE' : 'SPORTS DATA TOOL');
    q('.pthumb b').textContent = p.tkr;
    q('.pinfo .st').className = 'st' + (p.wip ? ' wip' : '');
    q('.pinfo .st').replaceChildren(el('i'), p.status);
    q('.pinfo h2').textContent = p.name.toUpperCase();
    q('.pinfo .one').textContent = p.line;
    q('.pinfo p').textContent = p.what;
    var proof = q('.proof');
    proof.querySelectorAll('.pf').forEach(function (f) { f.remove(); });
    p.skills.forEach(function (x) {
      var f = el('div', 'pf');
      f.append(el('span', 'chip on', label[x[0]]), el('span', null, x[1]));
      proof.appendChild(f);
    });
    var old = q('.pinfo > .btn');
    if (old) old.remove();
    var go;
    if (p.demo) {
      go = el('a', 'btn green', 'OPEN THE WORKING DEMO ▸');
      go.setAttribute('href', './' + p.path + 'index.html');
      go.style.cssText = 'min-height: 52px; font-size: 13px';
    } else {
      go = el('button', 'btn', 'DEMO COMING SOON');
      go.type = 'button';
      go.disabled = true;
      go.style.cssText = 'min-height: 52px';
    }
    q('.pinfo').appendChild(go);
  }

  // Hash: an open panel is named in the URL (#slate). Opening pushes one history entry, so Back closes it;
  // ✕, the scrim and Esc step back over that entry. A page loaded with #id gets a hash-less entry put under it,
  // so Back closes the panel instead of leaving the page. file:// may refuse history changes; then the hash is set plainly.
  function byId(id) { return P.projects.find(function (p) { return p.id === id; }); }
  function openPj(p) {
    var card = document.querySelector('[data-card="' + p.id + '"]');
    fill(p);
    showWin(pjWin, card, function () {
      openId = null;
      paint();
      if (location.hash !== '#' + p.id) return; // closed by Back, or by a hash naming another panel
      if (history.state && history.state.pj === p.id) history.back();
      else try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; }
    });
    openId = p.id;
    paint();
  }
  function sync() {
    var p = byId(location.hash.slice(1));
    if (p && openId !== p.id) openPj(p);
    else if (!p && openId) closeWin();
  }
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('click', function () {
      var p = byId(card.dataset.card);
      openPj(p);
      try { history.pushState({ pj: p.id }, '', '#' + p.id); } catch (e) { location.hash = p.id; }
    });
  });
  window.addEventListener('hashchange', sync);
  window.addEventListener('popstate', sync);
  var first = byId(location.hash.slice(1));
  if (first) {
    try {
      history.replaceState(null, '', location.pathname + location.search);
      history.pushState({ pj: first.id }, '', '#' + first.id);
    } catch (e) {}
    openPj(first);
  }
})();
