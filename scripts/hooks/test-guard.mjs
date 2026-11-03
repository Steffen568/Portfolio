// Sample commands the guard must block or allow. Run by scripts/verify.sh.
import { check } from './guard-commands.mjs';

const block = [
  'git push --force origin main', 'git push -f', 'git reset --hard HEAD~1', 'git clean -fd', 'git branch -D old',
  'rm design/portfolio-design.dc.html', 'Remove-Item -Recurse specs', 'rm -rf assets', 'rm handoff-PORTFOLIO-SITE.md'
];
const allow = [
  'git status', 'git push origin main', 'npx playwright test', 'rm -rf test-results', 'rm -rf node_modules', 'ls design', 'cat specs/01-shell.md'
];
const bad = [
  ...block.filter((c) => !check(c)).map((c) => 'should block: ' + c),
  ...allow.filter((c) => check(c)).map((c) => 'should allow: ' + c)
];
bad.forEach((b) => console.log('FAIL:', b));
console.log(`guard: ${block.length} blocked, ${allow.length} allowed` + (bad.length ? ' — BROKEN' : ' — ok'));
process.exit(bad.length ? 1 : 0);
