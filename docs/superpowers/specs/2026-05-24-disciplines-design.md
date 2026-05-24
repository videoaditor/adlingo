# Disciplines — Design Spec

**Date:** 2026-05-24
**Author:** Alan + Claude (brainstorming pass)
**Status:** Approved — ready for implementation plan

## Summary

Add a new **Disciplines** section to AdLingo. A Discipline is a situational, standalone skill area — distinct from the sequential Worlds. Each discipline has one page with one video + one quiz, and completing the quiz contributes to overall XP and course progress exactly like a World lesson.

Initial set of 4 disciplines:

| ID | Name | Coach | Status |
|----|------|-------|--------|
| d1 | B-Roll | Saskia | Video + quiz ready this pass |
| d2 | Podcast | Nico | Video + quiz ready this pass |
| d3 | TBD | — | Placeholder, "Coming soon" |
| d4 | TBD | — | Placeholder, "Coming soon" |

All four are unlocked from the start (situational, no sequencing).

## Where it lives

- **Course page (`/course`)** — primary surface. A 5th group renders below the 4 World cards in the curriculum sidebar, with the heading **"Disciplines · Types of Ads"**. Each discipline is a single-row entry (no expand — only one lesson per discipline).
- **Test page (`/`, WorldMap)** — deferred. Once d1/d2 have quizzes shipped and are exercised by real users, add a gold "Disciplines" group below the four World cards. **Not part of this pass.**
- **No new route.** Disciplines reuse `/course?lesson=<id>` for deep-linking, same as Worlds.

## Visual treatment

All four disciplines share a single gold accent (vs. the per-world colors used by Worlds):

- Theme gradient: `from-yellow-500 to-amber-500`
- Accent text: `text-yellow-400`
- Border: `border-yellow-500/30`
- Sidebar prefix: `D · 01`, `D · 02`, … (mirrors `W · 01` for worlds)
- LessonDetail breadcrumb: `DISCIPLINE · 01 · B-ROLL` (gold)

Visually parallel to a World card, but unmistakably its own family.

## Data model

Extend `src/data/courseData.js`.

### New seed array

```js
const SEED_DISCIPLINES = [
  {
    id: 'd1',
    name: 'B-Roll',
    subtitle: 'Sourcing and cutting B-roll',
    coach: 'Saskia',
    order: 1,
    videoUrl: '/disciplines/b-roll.mp4',
    videoType: 'file',
    extraLinks: [
      { label: 'Workflow (Magnific)', url: 'https://www.magnific.com/app/spaces/a1d6ac4c-5932-404a-a2ca-c08594dbb16f/' }
    ],
    questions: [ /* 4 questions, same shape as world lessons */ ]
  },
  {
    id: 'd2',
    name: 'Podcast',
    subtitle: 'Editing podcast content',
    coach: 'Nico',
    order: 2,
    videoUrl: '/disciplines/podcast.mp4',
    videoType: 'file',
    extraLinks: [
      { label: 'Source folder (Drive)', url: 'https://drive.google.com/drive/folders/1tABXr5dyjj1eB-8_FwEdTPqu5DJNaS0M' }
    ],
    questions: [ /* 4 questions */ ]
  },
  {
    id: 'd3',
    name: 'TBD',
    subtitle: 'Coming soon',
    order: 3,
    videoUrl: null,
    questions: []
  },
  {
    id: 'd4',
    name: 'TBD',
    subtitle: 'Coming soon',
    order: 4,
    videoUrl: null,
    questions: []
  }
];
```

### Storage and accessors

- Store under a separate localStorage key (`adlingo_disciplines_data`) using the same versioned-seed pattern as `getWorlds()`.
- Bump `CURRENT_SEED_VERSION` to `4` so existing users pick up the new data (and any seed re-import logic kicks in).
- New exports:
  - `getDisciplines()` — sorted by `order`
  - `getDisciplineById(id)`
  - `saveDisciplines(list)` (parity with worlds, even though no admin UI ships this pass)
- Update existing exports:
  - `getAllLessonIds()` — append discipline IDs whose `videoUrl` is non-null. Placeholders (d3/d4) are excluded so they don't drag the global progress bar down.
  - `getLessonById(id)` — extend to also search disciplines. Return shape becomes `{ lesson, world, discipline }` where exactly one of `world` / `discipline` is non-null. Consumers (LessonDetail) branch on which one is set.

### Progress and XP

No changes to `App.jsx#handleLessonComplete`. It already accepts any lesson ID, writes to `progress.completedLessons` and `progress.scores`, and recomputes XP from all scores. Discipline completions flow through unchanged.

## UI changes

### `src/components/VideoPlayer.jsx`

Add support for self-hosted MP4 (and webm) files alongside the existing iframe embeds. Detection rule: `videoType === 'file'` OR URL ends in `.mp4` / `.webm` / starts with `/`. Render a native `<video controls preload="metadata" className="w-full h-full">` inside the same rounded container.

Keep iframe behaviour for all existing video types (Loom, Tella, YouTube, Vimeo) — no regression.

### `src/pages/Course.jsx`

**Sidebar** — after rendering all worlds, render a new `<section>` for disciplines using the same card shell:
- Header button shows `D · ALL`, name "Disciplines", subtitle "TYPES OF ADS", and `done/total` counter in gold
- Expanded body: one row per discipline, each with `D · 0X` prefix, name, completion state, and (for D3/D4 with no video) a disabled "Coming soon" treatment

**Main pane (`LessonDetail`)** — accept an optional `discipline` prop. When set:
- Replace `VOL · 01 · W · 0X` breadcrumb with `DISCIPLINE · 0X · NAME` in gold
- Below the video, render `extraLinks` as a small "Resources" strip with an external-link icon
- Title and "Take the test" CTA behave identically

**Auto-select logic** — extend the existing useEffect that honours `?lesson=<id>` so it also resolves discipline IDs.

### `src/pages/WorldMap.jsx`

No changes this pass. (Future: gold Disciplines block below worlds.)

### `src/pages/Admin.jsx`

Out of scope. Seed-only management for this pass.

## Video pipeline (one-time)

Implementation script work, not user-facing app code. Run before/alongside the data-model PR.

1. **Download Saskia parts**
   - `yt-dlp` Loom Part 1: `https://www.loom.com/share/f4aea0b3c2a440e0905f8b404821f415`
   - `yt-dlp` Loom Part 2: `https://www.loom.com/share/1967c04b603c43948a92bda5a7517678`
2. **Stitch** with ffmpeg concat demuxer → `b-roll.mp4`. Re-encode if codecs/parameters differ between parts.
3. **Download Nico video** — try the Google Drive MCP first (whichever account it's bound to). If the player@aditor.ai account is not the connected one, the Drive folder may be inaccessible — fall back to asking Alan to share or upload the file directly. Pick the most representative single video; the rest of the folder is referenced via the resources link.
4. **Write to** `adlingo/public/disciplines/{b-roll,podcast}.mp4`. Vite serves `public/` at the site root, so `/disciplines/b-roll.mp4` resolves correctly.
5. **Transcripts** — Loom's share page embeds a transcript in its page payload; scrape directly first (fast, free). Fall back to `hyperframes transcribe` on the downloaded MP4 if scraping fails.
6. **Quiz questions** — draft 4 per discipline grounded in the transcripts, matching the existing `{ id, type, question, options, directorNote }` shape (`type: 'text'`, single correct answer per question).

### File size caveat

If `b-roll.mp4` or `podcast.mp4` exceeds ~25–50 MB, shipping in `public/` bloats the build and slows initial download. Acceptable for the first pass per Alan's call; revisit by uploading the stitched cut to Loom/Tella and swapping `videoUrl` if size becomes a problem. Add the MP4s to `.gitignore` only if they are large enough that committing them to the repo becomes the bottleneck (decision deferred to implementation).

## Testing

- **Manual** — load `/course`, confirm Disciplines section renders below worlds in gold, B-Roll and Podcast play, Take-the-test flow records completion, XP and global progress bar update, deep link `?lesson=d1` selects B-Roll.
- **Regression** — Worlds and existing lessons render unchanged. `VideoPlayer` still embeds Loom/Tella/YouTube/Vimeo correctly.
- No new automated tests; the codebase has none today and this change doesn't warrant introducing a test harness.

## Out of scope

- Admin UI for disciplines (add later)
- WorldMap (Test page) integration — deferred until quizzes ship and stabilise
- Disciplines unlocking other content, or being gated by Worlds
- New routes
- Hosting the stitched MP4 anywhere other than `public/`

## Open questions (resolved during brainstorm)

| Question | Resolution |
|----------|-----------|
| Where do disciplines live? | Course sidebar (option C) |
| Multi-video per discipline? | One stitched video; extra resources as links below |
| Quiz source? | Download + transcribe → write quizzes from transcripts |
| Unlock gating? | All unlocked from start |
| XP / progress contribution? | Yes, identical to world lessons |
| WorldMap appearance? | Deferred until quizzes exist |
| Nico Drive access? | Try MCP; fall back to plain link + ask Alan |
| Naming / visual? | "Disciplines · Types of Ads", same card as worlds, gold |
| Self-hosted MP4 OK to start? | Yes |
| D3 / D4 visible? | Yes, "Coming soon" disabled state |
