# Failure log

date · what escaped · which guardrail now catches it

- 2026-11-03 · The live site answered only at `/Portfolio/` (repo named with a capital P; Pages URLs are case-sensitive) · spec 06 line 8 now names the repository `portfolio`, lowercase; check the lowercase live link after any repo change.
- 2026-11-04 · The cards loaded six full-page screenshots (4.3 MB) to show a strip of each; the page crawled on a phone · `tests/demos.spec.mjs` "a phone scrolling the page downloads under 600 KB of pictures".
