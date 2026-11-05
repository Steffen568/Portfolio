// Card copy Steffen changed after the design was approved (the design file itself is never edited).
// Each entry: project id → fields that replace the design's projects() values. Logged in STATUS.md.
export const COPY_CHANGES = {
  // 2026-11-03, Steffen: the Wire's angle is a ready-made research report instead of spreadsheets and filters; demo moved to the 7 Nov slate.
  wire: {
    line: 'Ready-made research, not endless spreadsheets.',
    what: 'Instead of endless spreadsheets and filters, it packages every charted play into a ready-made research report: the Black Board reads each game from the top down, a gap worksheet sets each offense against the defense it faces, and fact lines state the numbers. Demo: DraftKings Main, Nov 7, 2026, twelve games.'
  },
  // 2026-11-04, Steffen: the Scout Team demo was replaced (CFB_HUB 4c24474); only the demo sentence changes.
  scout: {
    what: 'Play-by-play, charting and prices turned into charts across Overview, Matchup and Team. No predictions. Demo: Ohio State at Michigan, Nov 29, 2025.'
  },
  // 2026-11-05, Steffen: the Optometry demo is added to the portfolio (AEC_ReDesign 960401b); its button turns on.
  // Same day, Steffen: its copy follows the demo's DEMO_CARD.md (six short routes, not a three-stop tour).
  // Same day, Steffen: with the AI pictures back in the demo (AEC_ReDesign bcca2bd), its status reads WORKING DEMO, not IN PROGRESS.
  optom: {
    demo: true,
    status: 'WORKING DEMO',
    wip: false,
    skills: [['web', 'Asks why you came, then a short route: the doctor, the plan, the cost, the booking.']],
    line: 'A concept redesign where an eye-care patient says why they came and gets a short route.',
    what: 'Instead of one home page for everyone, each visitor says why they came and gets a short route: who they\'ll see, whether their plan is taken, what it costs, how to book. Also in Spanish. Practice name withheld.'
  }
};

// 2026-11-05, Steffen: the footer no longer says "ON REAL DATA"; the Optometry demo runs on stand-in facts.
export const FOOTER = 'EVERY DEMO IS A FROZEN SNAPSHOT · FORMS AND OUTSIDE LINKS OFF';

export const withCopyChanges = (projects) => projects.map((p) => ({ ...p, ...(COPY_CHANGES[p.id] || {}) }));
