# 07 — Demos + screenshots

**Depends on:** units 01–06; `handoff-PORTFOLIO-SITE.md` "Cards" (the screenshot line), "Panel" (16:10 screenshot), principle 8 ("Real demo screenshots are required… Until a screenshot exists, show the clean placeholder"); `handoff-COMMON.md` "Deliverable" (the `portfolio-demo\` folder rules); STATUS.md Proposed change 4. Asked for by Steffen in chat, 2026-11-03 ("add the screen caps and the workable demos"), which overrides Rule 16's "copied in by Steffen" for this unit.
**Next:** none. Then the stranger's-phone test.

Purpose:
"One tap opens any project, and one more opens its working demo" (SCOPE.md §1): the six finished demos are in `demos/<name>/`, every demo button opens a working demo under `/portfolio/`, and every card and panel shows the real screenshot.

Sources (copied whole, read not rewritten):
| card | `demos/<name>/` | from `Desktop\WebDev\…` |
|---|---|---|
| slate | slatehub | `slatehub-backend\portfolio-demo` |
| holy | holy-cross | `HolyCrossRevamp\portfolio-demo` |
| dfs | scout-dfs | `SCOUT_DFS\portfolio-demo` |
| scout | scout-team | `CFB_HUB\portfolio-demo` |
| wire | the-wire | `CFB_HUB\portfolio-demo-wire` |
| optom | eye-care | `AEC_ReDesign\portfolio-demo` |

Done when (*new* = in `tests/demos.spec.mjs`):
1. **Each demo is the source folder, byte for byte** (*new*): every file in each source folder is in `demos/<name>/` with the same bytes, and nothing extra.
2. **Each demo opens under `/portfolio/demos/<name>/` from the committed files alone** (*new*, on unit 06's shipped-files, exact-case server): its `index.html` answers 200, every request it makes inside the site answers 200, it makes no request outside its own folder except fonts from Google Fonts, and it logs no page error. Unit 06 `every copied-in demo opens from its panel…` checks the five demo buttons reach it.
3. **Each demo follows the folder rules** (*new*, `handoff-COMMON.md`): no path starting with `/` in its HTML, CSS or JS; under 25 MB; has `index.html`, `screenshots/desktop.png`. Secrets and Jekyll: unit 06 lines 5 and 6 now cover the demo files.
4. **Every card shows its screenshot** (*new*): at 390 and 1280 each of the six cards' thumbnails shows `demos/<name>/screenshots/desktop.png`, loaded, filling the thumbnail (`object-fit: cover; object-position: top`), at the design's ratios (5:2 sports, 21:9 websites, 21:9 at 640 px and below). The hover scan sweep still runs over it.
5. **The panel shows the screenshot** (*new*): each project's panel shows the same picture at 16:10, loaded, cover, top.
6. **The placeholder stays underneath**: the striped placeholder with the ticker and SCREENSHOT PENDING stays in the thumbnail under the picture, so a picture that fails to load leaves the placeholder, never an empty box (*new*: with the picture blocked, the placeholder shows and nothing errors).
7. **Optometry's demo is on** (Steffen, 2026-11-05; until then its button said DEMO COMING SOON): its panel's OPEN THE WORKING DEMO ▸ opens `demos/eye-care/index.html`, and nothing says COMING SOON. Its copy (line, description, proof) is unchanged.
8. Units 01–06 checks pass, unchanged except one, raised with Steffen (Rule 13, STATUS.md): unit 06's secrets check matched minified demo code (`password:!0`, `accessToken:null`), so its name-and-value pattern now skips a value that starts with one of those empties (`null`, `true`, `false`, `undefined`, `void`, `!0`/`!1`, or a 1–3 letter name followed by `}`, `)`, `]`, `,` or `;`). Otherwise it is the old pattern, plus quoted JSON keys and a `db_password=` / `DB_PASSWORD=` line pattern. If Steffen says no, it is reverted and the demos wait.

Must not:
- Edit a file inside a demo folder; rewrite a visible string; change units 01–06's tests beyond line 8's one change.
- Turn on the Optometry demo or change its copy without Steffen's yes.
- Push without Steffen's yes.

How to check:
1. `npx playwright test tests/demos.spec.mjs` — written before the copy and the build, watched failing.
2. `npm run verify` green, output pasted; 2–3 deliberate breaks each caught; screenshots at 390 and 1280 in `screenshots/07-demos/`.
3. Fresh-chat review: this spec + `tests/demos.spec.mjs` + changed files; output = lines not met.
4. STATUS.md updated; Checked only after step 3 returns zero lines.
