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
})();
