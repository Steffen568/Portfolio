/* Draws the demo from window.WIRE_DATA (data-bundle.js, which check.mjs proves equals data/).
   No network, no storage. Every string with a figure in it comes from the data. */
(function () {
  "use strict";
  var D = window.WIRE_DATA;
  var state = { view: "worksheet", game: 0, team: 0 };
  var root = document.getElementById("app");

  /** A DOM builder. Text always goes in as text, never as markup. */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] == null || attrs[k] === false) return;
        if (k === "onclick") el.addEventListener("click", attrs[k]);
        else if (k === "class") el.className = attrs[k];
        else if (k === "style") el.setAttribute("style", attrs[k]);
        else el.setAttribute(k, attrs[k]);
      });
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) c.forEach(function (x) { add(el, x); });
    else el.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  }

  function go(view, game) {
    state.view = view;
    if (game != null && game !== state.game) { state.game = game; state.team = 0; }
    draw();
    window.scrollTo(0, 0);
  }

  // ---- marks: the pieces `markReport` produced at build time ----
  function piece(x) {
    if (x.kind === "plain") return x.text;
    var shade = x.shade ? " sh" + (x.shade > 0 ? "p" : "n") + Math.abs(x.shade) : "";
    return h("span", { class: "srm-" + x.kind + shade }, x.text);
  }
  function para(pieces) { return h("p", null, pieces.map(piece)); }

  /** A section one tap away. The body is drawn on first open. Nothing opens on scroll. */
  function fold(title, count, body, cls) {
    var box = h("div", { class: "fold-body", hidden: "hidden" });
    var arrow = h("span", { class: "arrow" }, "▸");
    var btn = h("button", {
      class: "fold-btn", "aria-expanded": "false",
      onclick: function () {
        var opening = box.hasAttribute("hidden");
        if (opening && !box.firstChild) add(box, body());
        if (opening) box.removeAttribute("hidden"); else box.setAttribute("hidden", "hidden");
        btn.setAttribute("aria-expanded", String(opening));
        arrow.textContent = opening ? "▾" : "▸";
      },
    }, arrow, h("span", { class: "fold-title" }, title), count != null && h("span", { class: "fold-count" }, count));
    return h("div", { class: "fold" + (cls ? " " + cls : "") }, btn, box);
  }

  // ---- the same functions as SlateReportPanel.tsx ----
  function rankChip(rank) {
    var r = Math.round(rank);
    var cls = r >= 80 ? "rk2" : r >= 60 ? "rk1" : r <= 20 ? "rkm2" : r <= 40 ? "rkm1" : "rk0";
    return h("span", { class: "sr-rank " + cls }, r);
  }
  function rankCell(text) {
    if (!text) return "—";
    var m = text.match(/^(.*) \((\d+)(?:st|nd|rd|th)\)$/);
    return m ? [m[1], rankChip(Number(m[2]))] : text;
  }
  function sgn(v) { return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(2); }
  function epaClass(delta) {
    return delta >= 0.2 ? "srm-num shp2" : delta >= 0.1 ? "srm-num shp1" : delta <= -0.2 ? "srm-num shn2" : delta <= -0.1 ? "srm-num shn1" : "srm-num";
  }
  function epaStrip(epa, team) {
    if (!epa || (!epa.def && !epa.off)) return null;
    return h("p", { class: "sr-epa" },
      h("span", { class: "k" }, "EPA AN " + epa.unit.toUpperCase()),
      epa.def && ["Defense allows ", h("span", { class: epaClass(epa.def.slice - epa.def.whole) }, sgn(epa.def.slice)), " here, " + sgn(epa.def.whole) + " overall."],
      epa.off && [" " + team + " gains ", h("span", { class: epaClass(epa.off.slice - epa.off.whole) }, sgn(epa.off.slice)), " here, " + sgn(epa.off.whole) + " overall."]);
  }
  function macroCell(c) {
    if (!c) return "—";
    return [c.value, c.season != null && h("span", { class: "yr" }, " (" + c.season + ")"), c.rank != null && rankChip(c.rank)];
  }
  function macroTable(rows, team, faces) {
    if (!rows.length) return null;
    return h("div", { class: "scroll tablewrap" }, h("table", { class: "sr-envtable sr-macro" },
      h("thead", null, h("tr", null, h("th"), h("th", null, team + " offense"), h("th", null, faces + " defense"))),
      h("tbody", null, rows.map(function (r) {
        return h("tr", null, h("th", null, r.label), h("td", null, macroCell(r.off)), h("td", null, macroCell(r.def)));
      }))));
  }
  function envTable(g) {
    return h("div", { class: "scroll tablewrap" }, h("table", { class: "sr-envtable" },
      h("thead", null, h("tr", null, h("th"), h("th", null, g.away), h("th", null, g.home))),
      h("tbody", null, g.table.map(function (r) {
        return h("tr", null, h("th", null, r.label),
          r.both != null ? h("td", { colspan: 2, class: "both" }, r.both)
            : [h("td", null, rankCell(r.away)), h("td", null, rankCell(r.home))]);
      }))));
  }
  function finding(kind, f, i, team) {
    return h("div", { class: "sr-finding " + kind },
      h("h5", null, h("span", { class: "n" }, i + 1), f.label),
      f.lead.map(para), epaStrip(f.epa, team),
      f.rest.length + f.fits.length > 0 && fold("Field figures and who fits", f.rest.length + f.fits.length, function () { return [f.rest.map(para), f.fits.map(para)]; }));
  }
  function part(title, faces, p, team) {
    return h("div", { class: "sr-part" },
      h("h4", null, h("span", null, title), " ", h("span", { class: "vs" }, "against " + faces)),
      macroTable(p.macro, team, faces),
      p.allowed.length > 0 && fold("WHAT IT HAS ALLOWED", p.allowed.length, function () { return h("div", { class: "sr-allowed" }, p.allowed.map(para)); }, "kicker"),
      p.attack.length > 0 && h("div", { class: "sr-kicker attack" }, "WHERE TO ATTACK"),
      p.attack.map(function (f, i) { return finding("attack", f, i, team); }),
      p.holds.length > 0 && h("div", { class: "sr-kicker holds" }, "WHERE IT HOLDS"),
      p.holds.map(function (f, i) { return finding("holds", f, i, team); }));
  }
  function players(list) {
    return list.map(function (p) {
      return fold([h("span", { class: "sr-name" }, p.name), " ", h("span", { class: "sr-chip" }, p.pos)], p.lines.length, function () {
        return p.lines.length ? p.lines.map(para) : h("p", { class: "sr-missing" }, "No charted figure on record.");
      }, "sr-player");
    });
  }
  function group(title, list) {
    return list.length ? [h("div", { class: "sr-group" }, title), players(list)] : null;
  }

  function demoOnly(label) {
    var note = h("span", { class: "demo-note", role: "status" });
    return [h("button", {
      class: "sr-btn", "aria-disabled": "true", title: "Demo only",
      onclick: function () { note.textContent = "Demo only"; },
    }, label), note];
  }

  function gameTabs(view, list, state2) {
    return h("div", { class: "sr-tabs", role: "tablist" }, list.map(function (g, i) {
      return h("button", {
        role: "tab", "aria-selected": String(state.game === i),
        class: state.game === i ? "sr-tab on" : "sr-tab", onclick: function () { go(view, i); },
      }, h("span", { class: "sr-tab-name" }, g.away, " ", h("span", { class: "at" }, "at"), " ", g.home), h("span", { class: "sr-tab-state" }, state2(g)));
    }));
  }

  // ---- gap worksheet ----
  function worksheet() {
    var g = D.report[state.game];
    return [
      h("div", { class: "sr-toolbar" }, demoOnly("UPLOAD PROJECTIONS"), demoOnly("WRITE SLATE REPORT")),
      h("p", { class: "sr-hint" }, h("b", null, "Fact pack, as the code chose it."), " Model-written paragraphs are off in this demo."),
      h("p", { class: "sr-hint" }, "With no projection file, each team is written from its role instead: the passer, three backs and five pass catchers, with no price, projection or ownership beside the names."),
      gameTabs("worksheet", D.report, function (x) {
        var n = 0; x.teams.forEach(function (t) { n += t.pass.attack.length + t.pass.holds.length + t.run.attack.length + t.run.holds.length; });
        return n + " FINDINGS";
      }),
      h("article", { class: "sr-article" },
        h("h2", null, g.away, " ", h("span", { class: "at" }, "at"), " ", g.home),
        envTable(g),
        h("div", { class: "sr-tabs team-tabs", role: "tablist" }, g.teams.map(function (t, i) {
          return h("button", { role: "tab", "aria-selected": String(state.team === i), class: state.team === i ? "sr-tab on" : "sr-tab", onclick: function () { state.team = i; draw(); } },
            h("span", { class: "sr-tab-name" }, t.team + " offense"), h("span", { class: "sr-tab-state" }, "AGAINST " + t.faces.toUpperCase()));
        })),
        (function (t) {
          return h("section", { class: "sr-team" },
            h("h3", null, t.team),
            t.uncharted && h("p", { class: "sr-missing" }, t.uncharted),
            part("Pass game", t.faces, t.pass, t.team),
            group("QUARTERBACK", t.qb), group("PASS CATCHERS", t.catchers),
            part("Run game", t.faces, t.run, t.team),
            group("RUNNING BACKS", t.backs));
        })(g.teams[state.team]),
        h("p", { class: "sr-legend" },
          h("b", null, "How to read the figures."), " A plain number is a count. ",
          h("span", { class: "srm-pct" }, "50%"), " is a percentage and ", h("span", { class: "srm-rank" }, "82nd"), " is a rank. A colored figure has been judged against that side's own average: ",
          h("span", { class: "srm-num shp2" }, "8.9"), " is much better for the offense, ",
          h("span", { class: "srm-num shp1" }, "8.1"), " a little better, ",
          h("span", { class: "srm-num shn1" }, "6.4"), " a little worse and ",
          h("span", { class: "srm-num shn2" }, "4.2"), " much worse."))
    ];
  }

  // ---- fact lines ----
  function briefShade(pct) {
    return pct >= 80 ? "var(--volume)" : pct >= 50 ? "var(--ink)" : pct >= 20 ? "var(--efficiency)" : "var(--quality)";
  }
  function isExtreme(c) { return c && c.rank != null && (c.rank <= 15 || c.rank >= 85); }
  function bValue(c, side) {
    if (!c) return h("div", { class: "dash" }, "—");
    return h("div", { class: "v " + side },
      h("span", { class: isExtreme(c) ? "x" : null }, c.value),
      c.note && h("span", { class: "note", title: c.tip || null }, " " + c.note),
      c.season != null && h("span", { class: "yr" }, " ’" + String(c.season).slice(2)));
  }
  function bBar(c, side) {
    if (!c || c.rank == null) return h("div", { class: "dash" }, "—");
    var s = briefShade(c.rank);
    var fill = h("i", null, h("u", { style: "width:" + Math.max(2, c.rank) + "%;background:" + s }));
    var num = h("em", { style: "color:" + s }, Math.round(c.rank));
    return h("div", { class: "bar " + side }, side === "l" ? [num, fill] : [fill, num]);
  }
  function briefTable(g) {
    var blocks = [];
    g.table.rows.forEach(function (r) {
      var f = blocks.filter(function (x) { return x.block === r.block; })[0];
      if (f) f.rows.push(r); else blocks.push({ block: r.block, rows: [r] });
    });
    return h("div", { class: "brief" },
      h("div", { class: "brief-head" }, h("b", { style: "text-align:right;padding-right:5px" }, g.away.toUpperCase()), h("span", null, "PCTL"), h("span"), h("span", { style: "text-align:right" }, "PCTL"), h("b", { style: "padding-left:5px" }, g.home.toUpperCase())),
      blocks.map(function (b) {
        return h("div", { class: "brief-block" },
          h("h4", null, b.block, h("span", null, " · " + b.rows.length + " rows")),
          b.rows.map(function (r) {
            return h("div", { class: "brow" + (isExtreme(r.away) || isExtreme(r.home) ? " lit" : "") },
              bValue(r.away, "a"), bBar(r.away, "l"),
              h("div", { class: "lab" }, r.label, r.inverted && h("span", { title: "Lower is better" }, " ▾")),
              bBar(r.home, "r"), bValue(r.home, "h"));
          }));
      }));
  }
  function slot(s, who) {
    return h("div", { class: "slot" },
      h("h5", null, who && h("span", null, who.toUpperCase() + " · "), s.heading),
      h("p", null, s.filled ? s.blurb : s.absence),
      s.sample && h("div", { class: "sample" }, s.sample));
  }
  function slots(g) {
    var gameSlots = g.slots.filter(function (s) { return s.scope === "GAME"; });
    var side = g.slots.filter(function (s) { return s.scope !== "GAME"; });
    var seen = [];
    side.forEach(function (s) { if (seen.indexOf(s.slot) < 0) seen.push(s.slot); });
    return [
      gameSlots.map(function (s) { return slot(s, null); }),
      h("div", { class: "pair" }, seen.map(function (id) {
        var a = side.filter(function (s) { return s.slot === id && s.team_id === g.table.away_team_id; })[0];
        var b = side.filter(function (s) { return s.slot === id && s.team_id === g.table.home_team_id; })[0];
        return [a ? slot(a, g.away) : h("div"), b ? slot(b, g.home) : h("div")];
      }))
    ];
  }
  function fline(l) {
    return h("div", { class: "fline", style: "border-left-color:" + (kindColor(l.kind)) },
      h("span", { class: "tag", style: "color:" + kindColor(l.kind) }, l.tag),
      h("p", null, l.evidence),
      l.sample && h("span", { class: "sample" }, l.sample));
  }
  function kindColor(k) {
    return k === "VOLUME" ? "var(--volume)" : k === "EFFICIENCY" ? "var(--efficiency)" : k === "QUALITY" ? "var(--quality)" : "var(--context)";
  }
  function teamLines(g, id, name) {
    var every = g.lines.filter(function (l) { return l.team_id === id; });
    var mine = every.filter(function (l) { return !l.absence; });
    var absent = every.filter(function (l) { return l.absence; });
    if (!every.length) return null;
    var team = mine.filter(function (l) { return !l.player_name; });
    var names = [];
    mine.forEach(function (l) { if (l.player_name && names.indexOf(l.player_name) < 0) names.push(l.player_name); });
    return h("div", { class: "team-lines" },
      h("h4", null, name),
      team.length > 0 && fold("Team figures", team.length, function () { return team.map(fline); }),
      names.map(function (n) {
        var rows = mine.filter(function (l) { return l.player_name === n; });
        return fold([h("span", { class: "who" }, n), " ", h("span", { class: "sr-chip" }, rows[0].position || "—")], rows.length, function () { return rows.map(fline); });
      }),
      absent.length > 0 && fold("Stated absences", absent.length, function () {
        return absent.map(function (l) {
          return h("div", { class: "fline absent" }, h("span", { class: "tag" }, l.tag), h("p", null, l.absence));
        });
      }));
  }
  function builtOn() {
    var d = new Date(D.meta.lines_built_at);
    return d.getUTCDate() + " " + ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getUTCMonth()] + " " + d.getUTCFullYear();
  }
  function factLines() {
    var g = D["fact-lines"][state.game];
    var stated = g.lines.filter(function (l) { return !l.absence; });
    var other = stated.filter(function (l) { return l.team_id !== g.table.away_team_id && l.team_id !== g.table.home_team_id; });
    return [
      h("p", { class: "sr-hint" }, "Every sentence here is a fixed template filled by code. None says what to do about it."),
      h("p", { class: "sr-hint" }, "Built " + builtOn() + ". The worksheet's market table holds the last line stored after that, so its spread and total can differ from the table here."),
      gameTabs("lines", D["fact-lines"], function (x) { return x.lines.filter(function (l) { return !l.absence; }).length + " LINES · " + x.slots.filter(function (s) { return s.filled; }).length + " OF " + x.slots.length + " SLOTS"; }),
      briefTable(g),
      h("div", { class: "kick" }, "WRITTEN SECTIONS"),
      slots(g),
      h("div", { class: "kick" }, "FACT LINES · " + stated.length),
      teamLines(g, g.table.away_team_id, g.away),
      teamLines(g, g.table.home_team_id, g.home),
      other.length > 0 && other.map(fline)
    ];
  }

  // ---- pipeline ----
  function cellText(v) {
    if (v == null) return "—";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  }
  function rowsTable(id) {
    var rows = D["input-" + id].slice(0, 20);
    var cols = [];
    rows.forEach(function (r) { Object.keys(r).forEach(function (k) { if (cols.indexOf(k) < 0) cols.push(k); }); });
    return h("div", { class: "scroll" }, h("table", null,
      h("thead", null, h("tr", null, cols.map(function (c) { return h("th", null, c); }))),
      h("tbody", null, rows.map(function (r) {
        return h("tr", null, cols.map(function (c) {
          var t = cellText(r[c]);
          return h("td", { class: t === "withheld" ? "wh" : t.length > 60 ? "long" : null }, t);
        }));
      }))));
  }
  function inputCard(i) {
    var box = h("div", { class: "rows", hidden: "hidden" });
    var hint = h("div", { class: "open" }, "▸ First 20 rows");
    var btn = h("button", {
      "aria-expanded": "false",
      onclick: function () {
        var opening = box.hasAttribute("hidden");
        if (opening) {
          if (!box.firstChild) {
            add(box, h("p", null, i.row_count <= 20 ? "All " + i.row_count + (i.row_count === 1 ? " row. " : " rows. ") + "data/input-" + i.id + ".json" : "First 20 of " + i.row_count.toLocaleString("en-US") + " rows. data/input-" + i.id + ".json"));
            if (i.note) add(box, h("p", null, i.note));
            add(box, rowsTable(i.id));
          }
          box.removeAttribute("hidden");
        } else box.setAttribute("hidden", "hidden");
        btn.setAttribute("aria-expanded", String(opening));
        hint.textContent = (opening ? "▾" : "▸") + " First 20 rows";
      },
    },
      h("div", { class: "top" }, h("span", null, i.title), h("span", { class: "count" }, i.row_count.toLocaleString("en-US") + (i.row_count === 1 ? " row" : " rows"))),
      h("div", { class: "stage" }, i.stage.toUpperCase()),
      h("div", { class: "from" }, i.from),
      h("div", { class: "fields" }, i.fields.map(function (f) { return h("code", null, f); })),
      hint);
    return h("div", { class: "card", "data-input": i.id }, btn, box);
  }
  function pipeline() {
    var P = D.pipeline, lastAt = null, items = [];
    P.steps.forEach(function (s) {
      if (s.at !== lastAt) { items.push(h("li", { class: "at" }, s.at.toUpperCase())); lastAt = s.at; }
      items.push(h("li", { class: "step" + (s.at.indexOf("Off") === 0 ? " off" : "") }, h("p", null, s.text), h("code", null, s.where)));
    });
    return [
      h("div", { class: "pipe" },
        h("div", { class: "col" }, h("h2", null, "INPUTS"), h("p", { class: "sub" }, "Each source with the fields read and this slate's row count."), P.inputs.map(inputCard)),
        h("div", { class: "col" }, h("h2", null, "PROCESSING"), h("p", { class: "sub" }, "Each step in order, with the file and function that performs it."), h("ol", { class: "steps" }, items),
          h("div", { class: "legend" }, h("h3", null, "FIGURE MARKS IN KINDS.TS"),
            P.legend.rows.map(function (r) {
              return h("div", { class: "lr" }, h("span", { class: "sw" }, r.swatches.map(function (c) { return h("i", { class: c }); })), h("b", null, r.name), h("p", null, r.text));
            }),
            h("p", null, P.legend.note))),
        h("div", { class: "col" }, h("h2", null, "OUTPUT"), h("p", { class: "sub" }, "Each report section and the decision it feeds."),
          P.outputs.map(function (o) { return h("div", { class: "out" }, h("b", null, o.section), h("small", null, o.tab.toUpperCase()), h("p", null, o.feeds)); })))
    ];
  }

  // ---- page ----
  function tab(view, label) {
    return h("button", { class: state.view === view ? "tab on" : "tab", "aria-pressed": String(state.view === view), onclick: function () { go(view); } }, label);
  }
  function draw() {
    root.textContent = "";
    add(root, [
      h("div", { class: "banner" },
        h("span", null, "Demo · one slate snapshot · " + D.meta.slate_name + " · not live"),
        h("button", { onclick: function () { go("pipeline"); } }, "PIPELINE")),
      h("div", { class: "wrap" },
        h("div", { class: "mark" }, h("b", null, "SCOUT"), " TEAM"),
        h("h1", { class: "title" }, "THE WIRE"),
        h("p", { class: "what" }, "For one fantasy contest's games, this research tool lines up each offense against the defense it faces, lists where that defense gives up more than its own average and where it holds firm, and names the players involved."),
        h("p", { class: "gloss" }, "A DraftKings slate is the set of games one daily fantasy contest covers. This one has " + D.meta.games.length + " games, " + D.meta.counts.findings + " findings, " + D.meta.counts.players + " player blocks and " + D.meta.counts.fact_lines + " fact lines."),
        h("div", { class: "tabs" }, tab("worksheet", "GAP WORKSHEET"), tab("lines", "FACT LINES"), tab("pipeline", "PIPELINE")),
        state.view === "worksheet" ? worksheet() : state.view === "lines" ? factLines() : pipeline())
    ]);
  }
  draw();
})();
