# 06 — Publish (GitHub Pages)

**Depends on:** units 01–05; `00-PORTFOLIO-PLAN.md` "Hosting on GitHub Pages" (steps 1–7); `handoff-PORTFOLIO-SITE.md` build order item 6 and "Every demo link…"; `handoff-COMMON.md` "No secrets"; SCOPE.md §1, §5, §6. Ports nothing from the design.
**Next:** none (the last unit). Then the open inputs (SCOPE.md §5) and the stranger's-phone test.

Purpose:
"A stranger opens one link on a phone" (SCOPE.md §1): the site goes live at `https://<username>.github.io/portfolio/`, served by GitHub Pages from branch `main`, folder `/ (root)`, and works there exactly as it does locally.

Done when (each line names its check; *new* = in `tests/publish.spec.mjs`):
1. **What ships is exactly what's committed, and it works on its own** (*new*): a test server that serves only the files git tracks, under `/portfolio/`, matching names letter-for-letter in upper/lower case as GitHub Pages does, loads the page at 390 and 1280 with every request to it answered (no 404), zero console errors, the six cards and the environment graphic drawn, and both image windows' pictures loaded. (Windows ignores case; GitHub does not. This is the check the local server can't make.)
2. **Every local file the page names exists in the repo with the exact case** (*new*): every `href`/`src` in `index.html`, every `url(…)` in `assets/site.css`, and every `assets/…` or `demos/…` path in `assets/*.js` is a tracked file (a demo folder path counts when its `index.html` is tracked). A demo folder not yet copied in is an open input (SCOPE.md §5), listed by the test, and must not exist under a different case.
3. **Every demo link opens under `/portfolio/`** (*new*, plus unit 05 line 14): for each demo folder that is tracked, its link from the panel answers 200 on the shipped-files server. Until a folder is copied in, its button leads to GitHub's "not found" page; that is the open input, reported in STATUS.md, not hidden.
4. **Nothing dev-only ships** (*new*): no tracked file under `node_modules/`, `test-results/` or `playwright-report/`, no `.env` file, no log file; `.gitignore` lists those three folders.
5. **No secrets ship** (*new*, `handoff-COMMON.md`): no tracked text file contains an API key, access token or private key (`sk-…`, `ghp_…`/`github_pat_…`, `AKIA…`, `-----BEGIN … PRIVATE KEY`), or a `password=`/`api_key=` assignment with a value.
6. **GitHub's page builder drops nothing** (*new*): Pages runs Jekyll unless a `.nojekyll` file is present, and Jekyll leaves out any file or folder whose name starts with `_` or `.`, and runs any file starting with `---` through its template engine. So, unless `.nojekyll` is tracked: no file the site serves (`index.html`, `assets/`, `demos/`) has such a name, and none starts with `---`. The plan calls for no `.nojekyll` and none is needed today; the day a demo needs one, this test says so.
7. **The relative-path rule** (unit 01 `no path starts with /`; `scripts/verify.sh`): unchanged.
8. **Published** (manual, Steffen's go-ahead): Steffen creates the public `portfolio` repository (plan steps 1–3); with his go-ahead the session adds it as `origin` and pushes `main`; Steffen sets Pages to "Deploy from a branch", `main`, `/ (root)` (plan steps 5–6). Only `main` is pushed.
9. **Live check** (manual, the session): the live link answers, and screenshots at 390 and 1280 are saved in `screenshots/06-publish/`, looked at beside unit 05's.
10. **The stranger's-phone test** (manual, Steffen; the finish line): the live link opened on a real phone; the 3-second test (unit 05 line 11); the graphic's labels read on the phone (STATUS.md Proposed change 5); no sideways scroll; one tap opens a project. Recorded in STATUS.md "Done (stranger's phone)".

Must not:
- Push, add a remote, create a repository or change GitHub settings without Steffen's explicit go-ahead; guess his username; push any branch or tag other than `main`; force-push.
- Fill a placeholder (`[LAST NAME]`, `[YOUR EMAIL]`, demos) to make the live site look finished.
- Add a custom domain, analytics, a build step, a GitHub Actions workflow or any third-party script (SCOPE.md §4).
- Change a page file, a visible string, or units 01–05's tests (Rule 13).

How to check:
1. `npx playwright test tests/publish.spec.mjs` — written before any change, run and the result recorded.
2. `npm run verify` green, output pasted; 2–3 deliberate breaks each caught; live screenshots in `screenshots/06-publish/` (after the push).
3. Fresh-chat review: inputs = this spec + `tests/publish.spec.mjs` + any changed files; output = lines not met (lines 8–10 are reported as pending Steffen, not as unmet, until he acts).
4. STATUS.md updated; unit flipped to Checked only after step 3 returns zero lines.
