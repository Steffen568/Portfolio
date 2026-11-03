// PreToolUse (Bash/PowerShell) — block destructive commands from agent sessions (CLAUDE.md Rule 16).
// Ported from the Holy Cross / AEC guard-commands.sh, in Node so it needs no Python.
// Exit 2 = blocking error, stderr is fed back to Claude. Exit 1 blocks nothing — never use it here.
import { readFileSync } from 'node:fs';

export function check(cmd) {
  if (!cmd) return null;
  if (/git\s+push\s.*(--force|-f(\s|$))|git\s+reset\s+--hard|git\s+clean\s+-[a-z]*f|git\s+branch\s+-D/i.test(cmd))
    return 'BLOCKED: destructive git is prohibited from agent sessions (CLAUDE.md Rule 16). Ask Steffen to run it.';
  if (/(rm|Remove-Item|del|rmdir)\b[^|;&]*(design|Handoffs|00-PORTFOLIO-PLAN\.md|handoff-[\w-]+\.md|specs)([\\/\s"']|$)/i.test(cmd))
    return 'BLOCKED: design/, the plan, the handoffs and specs/ are protected (CLAUDE.md Rule 16). Move, don\'t delete.';
  if (/rm\s+-[a-z]*r[a-z]*f|rm\s+-[a-z]*f[a-z]*r|Remove-Item\b[^|;&]*-Recurse/i.test(cmd) && !/node_modules|test-results|playwright-report/i.test(cmd))
    return 'BLOCKED: no recursive deletes on repo folders from a session (CLAUDE.md Rule 16).';
  return null;
}

if (process.argv[1] && process.argv[1].endsWith('guard-commands.mjs')) {
  let cmd = '';
  try { cmd = JSON.parse(readFileSync(0, 'utf8')).tool_input?.command || ''; } catch {}
  const msg = check(cmd);
  if (msg) { process.stderr.write(msg + '\n'); process.exit(2); }
  process.exit(0);
}
