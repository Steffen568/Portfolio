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
  var scrim = document.querySelector('[data-scrim]');
  var openWin = null, opener = null;
  function showWin(wrap, from) {
    if (openWin) closeWin();
    openWin = wrap;
    opener = from || null;
    wrap.hidden = false;
    scrim.classList.add('on');
    wrap.querySelector('[data-close]').focus();
  }
  function closeWin() {
    if (!openWin) return;
    openWin.hidden = true;
    openWin = null;
    scrim.classList.remove('on');
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
})();
