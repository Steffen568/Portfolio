# Optometry practice redesign (concept)

**Status:** In progress · concept
**One line:** A concept redesign where an eye-care patient says why they came and gets a short route.

This is a concept redesign for an optometry practice (name withheld). The practice did not ask for it or approve it.

## What it does

Instead of one home page for everyone, the visitor says why they came and gets a short route built for that reason. Someone with dry, burning eyes sees different steps than a parent asking about a child's eyes. Each route answers the same worries in a few taps: who you'll see, whether your insurance plan is taken, what it costs, and how to book. A visitor who would rather browse can leave for a traditional full site at any moment, and the whole tour also comes in Spanish.

## Built with

- Astro (a tool that turns reusable page pieces into a plain, fast website)
- TypeScript (JavaScript, the language of web pages, with extra checks that catch mistakes before anyone sees them)
- Plain CSS (the standard language for how a web page looks), with the design's colors and sizes kept in one place
- JSON files (plain text files that hold structured data) for every fact and every sentence, in English and Spanish
- Instrument Sans and Instrument Serif (the two typefaces), shipped with the site through Fontsource (a package of free fonts)
- Vitest (runs small automatic checks on the code) and Playwright (drives a real browser to check the pages)
- ESLint and Prettier (keep the code free of common errors and consistently formatted)
- axe and Lighthouse (automatic checks for accessibility and phone speed)

## How it's put together

The site is made of plain web pages built ahead of time, so no server has to work anything out when someone visits. The guided tour is one page holding every screen, and a small script shows and hides them as the visitor taps. Every fact on the site lives in one file, and every sentence lives in one file per language, so a page can never show a price or a credential that differs from that file. Each fact is marked as confirmed, waiting to be confirmed, or still needed, and a missing one shows as a visible `[NEEDED]` tag instead of a guess. What a visitor taps stays in the browser's memory and goes nowhere. Automatic checks run on every change and stop the work if a page breaks a rule.

## Data in

- The practice's text and credential details, copied by hand from its website and public directories and checked one at a time. No live feeds; nothing is pulled automatically.

## Data out

Web pages in English and Spanish. The site does not collect or store anything from visitors.

## What this demo shows

A frozen copy of the concept, taken November 1, 2026, running entirely from this folder with the name and details of the practice removed.

- **What works:** the welcome, the "why are you visiting" tiles, all six routes to their end, the insurance plan check, the traditional full-site home, and the Spanish tour.
- **What's turned off:** phone, directions and frame-shop links, links to pages not built yet, and the booking scheduler's day and time buttons. Each says so when tapped.
- **What's swapped out:** doctors are "Dr. A" and "Dr. B". Photos are labeled placeholders. Address, phone, hours, reviews and awards are withheld. Wording that names something real was rewritten for this demo.
- **What's still open on purpose:** the `[NEEDED]` and `[CONFIRM]` tags are the concept's way of showing what only the practice can supply. The Spanish is a draft under review, and it says so on the page.
