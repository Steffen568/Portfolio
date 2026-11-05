# 2026-11-05 — Optometry demo copied in and turned on

**Asked (Steffen):** the new `portfolio-demo` folder holds the AEC demo; make sure names and images are removed, then add it to the portfolio.

**Name check.** The folder (and `portfolio-demo.zip`, same files) is byte-for-byte AEC_ReDesign `portfolio-demo` at `960401b`. Searched every file for the real practice's details taken from AEC_ReDesign `content/facts.json`: practice name and initials, both doctors' first and last names, street, city, zip, phone, fax, emails, web links, credential letters and treatment brand names. No hits. Doctors show as Dr. A / Dr. B. All six pictures are labeled stand-ins ("Office photo goes here", "Family photo goes here"); no EXIF, XMP or PNG text data in any image. Both screenshots show only the stand-ins. Page titles say "name withheld".

**Done.** `demos/eye-care/` replaced with the new folder (24 old `placeholder-doctor-*` files removed one by one; adds `dry-eye.html`, `es-dry-eye.html`). New card picture `assets/thumbs/eye-care.webp` (960×600 top crop of the new screenshot, 34 KB). `assets/data.js`: Optometry `demo: true`. Copy unchanged.

**Tests (Rule 13, at Steffen's request).** Written first and watched failing (3 failed): `demos.spec.mjs` line 7 now checks Optometry opens its working demo; `phone-quality.spec.mjs` line 14 now expects six demo buttons. `copy-changes.mjs` gains `optom: { demo: true }` (the design file still says no demo).

**Verified.** `npm run verify` 157/157 green. Screenshots at 390 and 1280 of the card, panel and demo: `screenshots/2026-11-05-eye-care-demo/`; no page errors.

**Seen, not changed:** the footer says every demo runs "on real data"; this one runs on stand-in facts. The card's proof line still says "three-stop tour".
**Rule 15 review 1 (fresh agent): zero lines.**
