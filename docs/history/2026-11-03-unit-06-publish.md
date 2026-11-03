# Unit 06 — Publish, 2026-11-03

**Spec:** `specs/06-publish.md`. **Tests:** `tests/publish.spec.mjs` (7 new). No page file changed.

**What the tests add:** a second test server that serves only the files git tracks, matching names letter-for-letter in upper/lower case, under `/portfolio/` — the way GitHub Pages serves them. The local server on Windows ignores case and serves untracked files, so it could never catch either. Also: every file the page names is tracked with the exact case (demo folders not yet copied in are listed as open inputs); copied-in demos open from their panels; nothing dev-only or secret is committed; nothing the site serves would be dropped by GitHub's page builder (Jekyll), so no `.nojekyll` is needed today.

**First run:** 3 failures, all bugs in the new test (its server mapped the bare `/portfolio/` wrong; it looked for the first `<svg>`, which is the connector layer hidden on phones). No page defect found.

**Breaks caught:** `./assets/site.js` → `./assets/Site.js` in `index.html` (3 tests fail; every earlier test still passed on Windows) · a fake GitHub token added to STATUS.md (1 fails) · `playwright-report/` removed from `.gitignore` (1 fails). All restored.

**Verify:** 132/132, 1.2 min.

**Rule 15:** review 1 zero lines, noting the secrets check skipped `package-lock.json` while the spec says every file; the skip was removed. Review 2 zero lines.

**Not done (waits on Steffen):** spec lines 8–10. Creating the repo, the push, the Pages setting, the live screenshots and the stranger's-phone test.
