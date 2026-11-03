# <Unit number> — <Unit name>

**Depends on:** <earlier units, the part of design/portfolio-design.dc.html this ports>
**Next:** <the unit this unlocks>

Purpose:
<one sentence — which part of the finish line (SCOPE.md §1) this unit serves>

Done when:
<checks someone other than the builder can run; each mapped to a test in tests/<unit>.spec.mjs or a written manual check>

Ports from the design:
- <CSS blocks, markup, data() keys, renderVals() behavior>

Must not:
- <frozen-list items (SCOPE.md §4) this unit will be tempted to touch>
- Rewrite a visible string; use an absolute path; add anything to the environment graphic; nest anything deeper than card → panel → demo

How to check:
1. `npx playwright test tests/<unit>.spec.mjs` — written before the build, watched failing
2. `npm run verify` green, output pasted; screenshots at 390 and 1280 beside the design
3. Fresh-chat review: inputs = this spec + the changed files; output = lines of this spec not met
4. STATUS.md updated; unit flipped to Checked only after step 3 returns zero lines

---
Fresh-chat check prompt (paste into a NEW chat with this spec and the changed files; the chat that built it never grades it):
"Inputs: the spec file and the changed files below. Output: only the lines of the spec that these files do not meet, each with one sentence of evidence. If every line is met, output 'zero lines'."
