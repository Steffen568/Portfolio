#!/usr/bin/env bash
# Single entry point for verification (< ~60 s). Wired as `npm run verify`.
#
# EVERY GATE GETS ITS OWN LINE, AND THAT IS NOT STYLE (Scout Team, 2026-09-28).
# bash exempts a command in an `&&` chain from `set -e` unless it is the LAST one. A chain like
# `npm run lint && npx tsc --noEmit` failed on lint, short-circuited, never ran tsc, and the script
# exited 0 — the gate was structurally incapable of failing. One gate per line, `set -e`, `set -o pipefail`.
set -e
set -o pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "== CLAUDE.md under its ceiling; STATUS.md under one page =="
node -e "
const fs = require('fs');
const c = fs.readFileSync('CLAUDE.md', 'utf8').length;
const s = fs.readFileSync('STATUS.md', 'utf8').split(/\r?\n/).filter((l, i, a) => i < a.length - 1 || l).length;
const bad = [];
if (c > 20000) bad.push('CLAUDE.md is ' + c + ' chars (ceiling 20,000): move the story to the spec or doc it cites');
if (s > 60) bad.push('STATUS.md is ' + s + ' lines (ceiling 60): history goes to docs/history/');
bad.forEach((b) => console.log('FAIL:', b));
console.log('CLAUDE.md ' + c + ' chars · STATUS.md ' + s + ' lines');
process.exit(bad.length ? 1 : 0);
"

echo "== JavaScript parses =="
for f in assets/*.js; do node --check "$f"; done

echo "== Hook still blocks what it should =="
node scripts/hooks/test-guard.mjs

echo "== Playwright checks (copy and data match the design, above the fold, widths, tap sizes, relative paths) =="
npx playwright test --reporter=dot

echo "VERIFY: ALL GREEN"
