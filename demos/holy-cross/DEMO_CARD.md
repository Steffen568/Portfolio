# Holy Cross of San Antonio website

**Status:** Phase 1 · pending board approval
**One line:** A phone-first school website, English and Spanish, showing parents real cost, results and how to apply.

## What it does
A parent on a phone can find out what Holy Cross would really cost their family after Texas's TEFA school-choice award (state money toward private school tuition). They can see that the most recent graduating class was 100% accepted to college. They can then ask a question, book a visit or apply. All of it works in English or in Spanish, and the goal is about 60 seconds. This is a concept built for the school to consider; the school has not yet approved it or confirmed its figures, and unconfirmed figures are labelled on the page.

## Built with
- Astro (a tool that turns reusable page pieces into a plain, fast website)
- TypeScript (a stricter version of the language web pages use for anything interactive, which catches mistakes early), used for the cost calculator
- Plain CSS (the styling language every browser reads), with the school's colors and two fonts stored with the site, Public Sans and Cormorant Garamond
- Vitest and Playwright (tools that test the math and open the pages in a real browser, automatically)
- Lighthouse (measures how fast a page loads on a phone), axe (checks that a page works for people using assistive technology) and ESLint (catches common code mistakes)
- Static hosting on Cloudflare Pages (a service that hands out finished page files, with no server program running). It is the recommended free host for testing; the plan is to launch in the school's own accounts
- GitHub Actions (a service that runs small jobs on a schedule), which refreshes the calendar every night
- Spanish twins (each page has its own Spanish version, written rather than machine-translated, at its own address under `/es/`). English and Spanish read the same numbers from one shared file, so they can't disagree. The Spanish is marked as a draft until a reviewer at the school approves it
- A hybrid with the school's existing systems. The new site is the public front door. The systems stay underneath, and the new site links out to them and recreates nothing: SOCS (the website platform the school already pays for) keeps the current-family portal (the private area for families already enrolled), calendar, news and giving
- FACTS (the service the school uses for inquiries, applications and tuition payments) and Calendly (an online booking calendar), the school's own accounts, opened from inside the new site's cards when a family taps
- YouTube, for the family videos, which load only when someone taps one

## How it's put together
Every tuition figure, name and phone number lives in one file, the page wording lives in a small set of files for each language, and calendar events have their own saved file. When the site is built, Astro combines those files with the page designs and the school's photos to make finished pages. Those pages sit on the host and need no database (a program that stores records) and no sign-in. The cost calculator does its math on the visitor's own phone. When a family taps to ask a question, book a visit, apply or watch a video, the page opens FACTS, Calendly or YouTube, and those services handle what happens next. Automated checks test the math and the pages on every change, and a fuller comparison with the original designs also runs every night.

## Data in
- The school's own text and photos, plus its published tuition and aid figures, supplied or taken from the school and typed into the one figures file. Updated by hand.
- The school's public Facebook photos (rights still to be confirmed with the school), its YouTube videos and public reviews from families. Chosen and added by hand.
- The state's TEFA award amounts, from the Texas Comptroller (the state's finance office), and the federal poverty guidelines the cost calculator uses for income, from the U.S. Department of Health and Human Services. Updated by hand each year.
- Student and teacher counts from the U.S. Department of Education, for the student-teacher ratio on the home page. Updated by hand.
- Game schedules from Hudl (the sports schedule service the school uses), typed in by hand for the "Next at Holy Cross" line.
- The school's public calendar feed (a list of events that the school's site publishes for other programs to read): event titles, days and times, read once a night into a saved file for the "Next at Holy Cross" line on the home page.
- No live data sources. When someone opens a page, it asks nothing of any other service until they tap.

## Data out
Web pages: five in English and five in Spanish. The cost calculator gives a family an estimate on screen, and what they type into it is never sent or stored. What a family types into the FACTS or Calendly forms goes to those services, under the school's accounts, not to this site.

## What this demo shows
A frozen copy of the six Phase 1 pages (Home, Your real cost, Admissions, Outcomes, Contact, and Español, the Spanish version of the other five), as built on November 2, 2026, with the school's own text, photos and figures. You can move through every page, switch languages and use the cost calculator. Forms, calls, videos and links to any outside site are off and say so when tapped. The "Next at Holy Cross" line doesn't appear, because the site hides it once its calendar is more than a week old, and this copy's calendar was read on October 22, 2026.
