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
  }
};

export const withCopyChanges = (projects) => projects.map((p) => ({ ...p, ...(COPY_CHANGES[p.id] || {}) }));
