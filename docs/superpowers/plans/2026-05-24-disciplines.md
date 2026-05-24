# Disciplines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Disciplines section to AdLingo — single-page situational skill areas (B-Roll, Podcast, +2 placeholders) with one video + one quiz each, rendered below Worlds in the Course sidebar, gold-themed, counting toward XP/global progress.

**Architecture:** New `SEED_DISCIPLINES` array in `src/data/courseData.js` parallel to `SEED_WORLDS`. Discipline IDs (`d1`, `d2`, …) flow through the existing `progress.completedLessons` / `progress.scores` machinery so no auth/XP changes are needed. UI lives entirely inside `/course` — new gold section in the sidebar and a discipline-aware branch in `LessonDetail`. Videos are self-hosted MP4s in `public/disciplines/`, served by Vite as `/disciplines/*.mp4`. `VideoPlayer` gets a native `<video>` branch for file URLs.

**Tech Stack:** React 19, Vite, Tailwind 4, Framer Motion, lucide-react, react-router. CLI: `yt-dlp`, `ffmpeg`, `hyperframes transcribe`. No automated test harness in repo — verification is manual.

**Source spec:** `docs/superpowers/specs/2026-05-24-disciplines-design.md`

---

## File Map

**Modify:**
- `src/data/courseData.js` — add `SEED_DISCIPLINES`, `getDisciplines`, `getDisciplineById`, `saveDisciplines`; extend `getAllLessonIds`, `getLessonById`; bump `CURRENT_SEED_VERSION` to 4 and add a separate seed-version key for disciplines.
- `src/components/VideoPlayer.jsx` — add native `<video>` branch for `videoType === 'file'` or URLs ending in `.mp4` / `.webm` / starting with `/`.
- `src/pages/Course.jsx` — add Disciplines section to sidebar; teach `LessonDetail` to render the discipline variant (breadcrumb + resources strip); make auto-select honor discipline IDs.

**Create:**
- `public/disciplines/b-roll.mp4` — stitched Saskia Loom Part 1 + Part 2.
- `public/disciplines/podcast.mp4` — Nico video from the Drive folder.
- `scripts/disciplines/build-videos.sh` — committed shell script that re-runs the download+stitch pipeline (so it's reproducible, not a one-off command sequence lost in chat).

**Touch:**
- `.gitignore` — only if final MP4 size exceeds 25 MB (decision made in Task 3).

---

## Sequencing notes

Tasks 1–6 are video pipeline + quiz drafting. They produce artefacts (MP4 files, quiz JSON) that Task 7 embeds into the codebase. Tasks 7–11 are the actual app changes. Task 12 is end-to-end manual verification.

If the Drive folder for Nico is inaccessible (Task 4), park `d2` with `videoUrl: null` and `questions: []` so it ships as a "Coming soon" placeholder alongside d3/d4 — do not block the entire feature. Note this in commit message.

---

### Task 1: Download Saskia Loom parts

**Files:**
- Create (transient, not committed): `/tmp/disciplines-work/saskia-part1.mp4`, `/tmp/disciplines-work/saskia-part2.mp4`

- [ ] **Step 1: Create working directory**

```bash
mkdir -p /tmp/disciplines-work
```

- [ ] **Step 2: Download Part 1**

```bash
yt-dlp -f 'best[ext=mp4]/best' \
  -o '/tmp/disciplines-work/saskia-part1.%(ext)s' \
  'https://www.loom.com/share/f4aea0b3c2a440e0905f8b404821f415'
```

Expected: a single `.mp4` file in `/tmp/disciplines-work/saskia-part1.mp4`. If yt-dlp picks `.webm`, rename to `.mp4` after verifying it's H.264-compatible, or re-encode in Task 3.

- [ ] **Step 3: Download Part 2**

```bash
yt-dlp -f 'best[ext=mp4]/best' \
  -o '/tmp/disciplines-work/saskia-part2.%(ext)s' \
  'https://www.loom.com/share/1967c04b603c43948a92bda5a7517678'
```

- [ ] **Step 4: Verify both downloads**

```bash
ls -lh /tmp/disciplines-work/saskia-part*.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate \
  -of default=noprint_wrappers=1 /tmp/disciplines-work/saskia-part1.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate \
  -of default=noprint_wrappers=1 /tmp/disciplines-work/saskia-part2.mp4
```

Expected: both files exist with non-zero size; record the codec/resolution/framerate of each. If they match (both H.264, same WxH, same fps), Task 2 can use `-c copy`. If not, Task 2 must re-encode.

---

### Task 2: Stitch Saskia parts into one MP4

**Files:**
- Create: `adlingo/public/disciplines/b-roll.mp4`
- Create: `adlingo/scripts/disciplines/build-videos.sh` (reproducible pipeline script, committed)

- [ ] **Step 1: Create destination directory**

```bash
mkdir -p /Users/alansimon/Desktop/adlingo/adlingo/public/disciplines
mkdir -p /Users/alansimon/Desktop/adlingo/adlingo/scripts/disciplines
```

- [ ] **Step 2: Attempt stream-copy concat (fast path, only if codecs match from Task 1 Step 4)**

```bash
cat > /tmp/disciplines-work/concat.txt <<'EOF'
file '/tmp/disciplines-work/saskia-part1.mp4'
file '/tmp/disciplines-work/saskia-part2.mp4'
EOF

ffmpeg -y -f concat -safe 0 -i /tmp/disciplines-work/concat.txt \
  -c copy \
  /Users/alansimon/Desktop/adlingo/adlingo/public/disciplines/b-roll.mp4
```

If the result plays correctly end-to-end (open it), skip to Step 4. If the concat boundary is glitchy or codecs mismatched, do Step 3 instead.

- [ ] **Step 3: Re-encode concat (fallback for mismatched codecs)**

```bash
ffmpeg -y \
  -i /tmp/disciplines-work/saskia-part1.mp4 \
  -i /tmp/disciplines-work/saskia-part2.mp4 \
  -filter_complex '[0:v:0][0:a:0][1:v:0][1:a:0]concat=n=2:v=1:a=1[v][a]' \
  -map '[v]' -map '[a]' \
  -c:v libx264 -preset medium -crf 23 -movflags +faststart \
  -c:a aac -b:a 128k \
  /Users/alansimon/Desktop/adlingo/adlingo/public/disciplines/b-roll.mp4
```

- [ ] **Step 4: Verify output**

```bash
ls -lh /Users/alansimon/Desktop/adlingo/adlingo/public/disciplines/b-roll.mp4
ffprobe -v error -show_entries format=duration,size \
  -of default=noprint_wrappers=1 \
  /Users/alansimon/Desktop/adlingo/adlingo/public/disciplines/b-roll.mp4
```

Expected: duration ≈ sum of part1 + part2 durations, single continuous file.

- [ ] **Step 5: File-size decision (record in commit message)**

If `b-roll.mp4` > 25 MB, append `public/disciplines/*.mp4` to `.gitignore` and document in the commit message that the videos must be re-built locally via `scripts/disciplines/build-videos.sh` (or later uploaded to Loom/Tella and `videoUrl` swapped). If ≤ 25 MB, commit the file.

- [ ] **Step 6: Capture the pipeline in a script**

Write `adlingo/scripts/disciplines/build-videos.sh`:

```bash
#!/usr/bin/env bash
# Re-build Disciplines MP4s. Run from repo root.
# Requires: yt-dlp, ffmpeg.
set -euo pipefail

WORK=/tmp/disciplines-work
OUT="$(dirname "$0")/../../public/disciplines"
mkdir -p "$WORK" "$OUT"

# --- B-Roll (Saskia) ---
yt-dlp -f 'best[ext=mp4]/best' -o "$WORK/saskia-part1.%(ext)s" \
  'https://www.loom.com/share/f4aea0b3c2a440e0905f8b404821f415'
yt-dlp -f 'best[ext=mp4]/best' -o "$WORK/saskia-part2.%(ext)s" \
  'https://www.loom.com/share/1967c04b603c43948a92bda5a7517678'

ffmpeg -y \
  -i "$WORK/saskia-part1.mp4" \
  -i "$WORK/saskia-part2.mp4" \
  -filter_complex '[0:v:0][0:a:0][1:v:0][1:a:0]concat=n=2:v=1:a=1[v][a]' \
  -map '[v]' -map '[a]' \
  -c:v libx264 -preset medium -crf 23 -movflags +faststart \
  -c:a aac -b:a 128k \
  "$OUT/b-roll.mp4"

echo "Built $OUT/b-roll.mp4"
# Podcast (Nico) is sourced manually from a Google Drive folder — see plan Task 4.
```

```bash
chmod +x /Users/alansimon/Desktop/adlingo/adlingo/scripts/disciplines/build-videos.sh
```

- [ ] **Step 7: Commit (script only; MP4 commit decided in Step 5)**

```bash
cd /Users/alansimon/Desktop/adlingo/adlingo
git add scripts/disciplines/build-videos.sh
# If MP4 is ≤ 25 MB:
git add public/disciplines/b-roll.mp4
# If MP4 is > 25 MB:
# echo 'public/disciplines/*.mp4' >> .gitignore && git add .gitignore
git commit -m "feat(disciplines): stitch and ship B-Roll video"
```

---

### Task 3: Transcribe Saskia parts (for quiz authoring)

**Files:**
- Create (transient): `/tmp/disciplines-work/saskia-part1.txt`, `/tmp/disciplines-work/saskia-part2.txt`

- [ ] **Step 1: Try Loom's in-page transcript first (fast path)**

Loom share pages render a transcript in their page payload. Fetch the share page HTML and grep for the transcript JSON:

```bash
curl -sL 'https://www.loom.com/share/f4aea0b3c2a440e0905f8b404821f415' \
  -A 'Mozilla/5.0' \
  -o /tmp/disciplines-work/saskia-part1.html
curl -sL 'https://www.loom.com/share/1967c04b603c43948a92bda5a7517678' \
  -A 'Mozilla/5.0' \
  -o /tmp/disciplines-work/saskia-part2.html
```

Inspect each HTML file for a `transcript` field. If found, extract to `.txt`. If not present (Loom has been gating transcripts behind auth), continue to Step 2.

- [ ] **Step 2: Fallback — local transcription via hyperframes**

```bash
hyperframes transcribe /tmp/disciplines-work/saskia-part1.mp4 > /tmp/disciplines-work/saskia-part1.txt
hyperframes transcribe /tmp/disciplines-work/saskia-part2.mp4 > /tmp/disciplines-work/saskia-part2.txt
```

- [ ] **Step 3: Verify transcripts are non-empty**

```bash
wc -l /tmp/disciplines-work/saskia-part*.txt
head -20 /tmp/disciplines-work/saskia-part1.txt
```

Expected: each file contains a coherent transcript of the corresponding video.

---

### Task 4: Source Nico's Podcast video from Drive

**Files:**
- Create: `adlingo/public/disciplines/podcast.mp4` (or skip if inaccessible — see fallback)

- [ ] **Step 1: List the Drive folder via MCP**

Use the connected Google Drive MCP (tool prefix `mcp__aed0e787-d48d-431c-beb5-5eb02fff5e36__*`). Call `search_files` or `list_recent_files` against folder ID `1tABXr5dyjj1eB-8_FwEdTPqu5DJNaS0M`. If the connected account does not have access, log the failure and proceed to Step 4.

- [ ] **Step 2: Pick the representative video**

If multiple videos exist, choose the most comprehensive overview video (likely the longest, or one named like "overview" / "workflow" / "intro"). If only one video exists, use it. Record the chosen file ID and name.

- [ ] **Step 3: Download to working dir, then re-encode/copy to `public/disciplines/podcast.mp4`**

Use `download_file_content` from the Drive MCP to write the video into `/tmp/disciplines-work/podcast-source.<ext>`. Then normalize:

```bash
ffmpeg -y -i /tmp/disciplines-work/podcast-source.* \
  -c:v libx264 -preset medium -crf 23 -movflags +faststart \
  -c:a aac -b:a 128k \
  /Users/alansimon/Desktop/adlingo/adlingo/public/disciplines/podcast.mp4

ls -lh /Users/alansimon/Desktop/adlingo/adlingo/public/disciplines/podcast.mp4
```

(`movflags +faststart` puts the moov atom at the front for instant `<video>` playback start.)

- [ ] **Step 4: Fallback if Drive access fails**

If Steps 1–3 are blocked by permissions, do NOT block the plan. Park `d2` as a placeholder identical to d3/d4:
- `videoUrl: null`
- `extraLinks: [{ label: 'Source folder (Drive)', url: '...' }]` so the Drive link is still surfaced to whoever can access it
- `questions: []`
- subtitle: `'Coming soon — pending video'`

Tasks 6 (quiz authoring) and 11 (resources strip rendering for d2) become no-ops if this fallback fires. Note in the commit message.

- [ ] **Step 5: Commit (only if a real video was downloaded)**

```bash
cd /Users/alansimon/Desktop/adlingo/adlingo
git add public/disciplines/podcast.mp4
git commit -m "feat(disciplines): add Podcast video from Nico's Drive folder"
```

---

### Task 5: Transcribe Podcast video

**Files:**
- Create (transient): `/tmp/disciplines-work/podcast.txt`

Skip entirely if Task 4 Step 4 fallback fired.

- [ ] **Step 1: Transcribe**

```bash
hyperframes transcribe /Users/alansimon/Desktop/adlingo/adlingo/public/disciplines/podcast.mp4 \
  > /tmp/disciplines-work/podcast.txt
wc -l /tmp/disciplines-work/podcast.txt
head -20 /tmp/disciplines-work/podcast.txt
```

Expected: non-empty transcript.

---

### Task 6: Draft quiz questions from transcripts

**Files:**
- Create (transient): `/tmp/disciplines-work/quiz-b-roll.json`, `/tmp/disciplines-work/quiz-podcast.json`

For each transcript, write 4 multiple-choice questions matching the existing world-lesson shape. Use the existing Editing-Town questions in `src/data/courseData.js` as a stylistic reference: concrete scenario in the question stem, 4 options with one correct, a 1–2 sentence `directorNote` that explains *why* the correct answer is correct.

Shape per question:

```json
{
  "id": "q-d1-1",
  "type": "text",
  "question": "Scenario-based stem grounded in the transcript",
  "options": [
    { "text": "Plausible wrong answer", "correct": false },
    { "text": "Correct answer", "correct": true },
    { "text": "Plausible wrong answer", "correct": false },
    { "text": "Plausible wrong answer", "correct": false }
  ],
  "directorNote": "Why the correct answer is correct — 1-2 sentences from the transcript."
}
```

- [ ] **Step 1: Read both Saskia transcripts and write 4 B-Roll questions**

IDs: `q-d1-1` through `q-d1-4`. Save as a JSON array to `/tmp/disciplines-work/quiz-b-roll.json`.

- [ ] **Step 2: Read Podcast transcript and write 4 Podcast questions** (skip if Task 4 fallback fired)

IDs: `q-d2-1` through `q-d2-4`. Save as JSON array to `/tmp/disciplines-work/quiz-podcast.json`.

- [ ] **Step 3: Sanity check**

For each question file, verify exactly one option per question has `correct: true`, all stems are answerable from the transcript content, and tone matches existing world questions (practical, scenario-based, not abstract).

---

### Task 7: Extend `courseData.js` with disciplines

**Files:**
- Modify: `src/data/courseData.js`

- [ ] **Step 1: Add disciplines storage constants near the top of the file**

In `src/data/courseData.js`, immediately after the existing constant declarations (`STORAGE_KEY`, `SEED_VERSION_KEY`, `CURRENT_SEED_VERSION`), add:

```js
const DISCIPLINES_STORAGE_KEY = 'adlingo_disciplines_data';
const DISCIPLINES_SEED_VERSION_KEY = 'adlingo_disciplines_seed_version';
const CURRENT_DISCIPLINES_SEED_VERSION = 1;
```

Also bump the existing `CURRENT_SEED_VERSION` from `3` to `4` so users on the previous seed pick up any unrelated tweaks (and so the version space stays monotonic — even though disciplines have their own version key, bumping signals "data layer changed").

- [ ] **Step 2: Add `SEED_DISCIPLINES` immediately below `SEED_WORLDS`**

Paste the questions drafted in Task 6 into the `questions: [...]` arrays. If Task 4 fallback fired, leave `d2` as a `videoUrl: null` placeholder.

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
    questions: [ /* paste 4 from /tmp/disciplines-work/quiz-b-roll.json */ ]
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
    questions: [ /* paste 4 from /tmp/disciplines-work/quiz-podcast.json */ ]
  },
  {
    id: 'd3',
    name: 'TBD',
    subtitle: 'Coming soon',
    order: 3,
    videoUrl: null,
    videoType: null,
    extraLinks: [],
    questions: []
  },
  {
    id: 'd4',
    name: 'TBD',
    subtitle: 'Coming soon',
    order: 4,
    videoUrl: null,
    videoType: null,
    extraLinks: [],
    questions: []
  }
];
```

- [ ] **Step 3: Add discipline accessors below the existing world accessors**

Append at the bottom of `src/data/courseData.js`, after `generateId`:

```js
export function getDisciplines() {
  const storedVersion = parseInt(
    localStorage.getItem(DISCIPLINES_SEED_VERSION_KEY) || '0',
    10
  );
  if (storedVersion < CURRENT_DISCIPLINES_SEED_VERSION) {
    localStorage.setItem(DISCIPLINES_STORAGE_KEY, JSON.stringify(SEED_DISCIPLINES));
    localStorage.setItem(
      DISCIPLINES_SEED_VERSION_KEY,
      String(CURRENT_DISCIPLINES_SEED_VERSION)
    );
    return SEED_DISCIPLINES;
  }
  const stored = localStorage.getItem(DISCIPLINES_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return SEED_DISCIPLINES;
    }
  }
  localStorage.setItem(DISCIPLINES_STORAGE_KEY, JSON.stringify(SEED_DISCIPLINES));
  localStorage.setItem(
    DISCIPLINES_SEED_VERSION_KEY,
    String(CURRENT_DISCIPLINES_SEED_VERSION)
  );
  return SEED_DISCIPLINES;
}

export function saveDisciplines(disciplines) {
  localStorage.setItem(DISCIPLINES_STORAGE_KEY, JSON.stringify(disciplines));
}

export function getDisciplineById(id) {
  return getDisciplines().find((d) => d.id === id) || null;
}
```

- [ ] **Step 4: Extend `getAllLessonIds` to count playable disciplines**

Replace the existing `getAllLessonIds` body with:

```js
export function getAllLessonIds() {
  const worldIds = getWorlds()
    .sort((a, b) => a.order - b.order)
    .flatMap((w) => w.lessons.sort((a, b) => a.order - b.order).map((l) => l.id));
  const disciplineIds = getDisciplines()
    .filter((d) => d.videoUrl) // exclude placeholders so they don't drag the progress bar
    .sort((a, b) => a.order - b.order)
    .map((d) => d.id);
  return [...worldIds, ...disciplineIds];
}
```

- [ ] **Step 5: Extend `getLessonById` to also resolve discipline IDs**

Replace the existing `getLessonById` with:

```js
export function getLessonById(lessonId) {
  for (const world of getWorlds()) {
    const lesson = world.lessons.find((l) => l.id === lessonId);
    if (lesson) return { lesson, world, discipline: null };
  }
  const discipline = getDisciplines().find((d) => d.id === lessonId);
  if (discipline) {
    // A discipline IS its own single lesson — expose it with a synthetic lesson shape
    // so existing consumers (Lesson.jsx) can read .title / .videoUrl / .questions.
    return {
      lesson: {
        id: discipline.id,
        title: discipline.name,
        subtitle: discipline.subtitle,
        order: discipline.order,
        videoUrl: discipline.videoUrl,
        videoType: discipline.videoType,
        questions: discipline.questions
      },
      world: null,
      discipline
    };
  }
  return { lesson: null, world: null, discipline: null };
}
```

- [ ] **Step 6: Manual verification in the running app**

Start the dev server (or use a running one) and open the browser console at `/course`. Run:

```js
const cd = await import('/src/data/courseData.js');
console.log('disciplines:', cd.getDisciplines());
console.log('all lesson ids:', cd.getAllLessonIds());
console.log('d1 lookup:', cd.getLessonById('d1'));
```

Expected: 4 disciplines returned; `getAllLessonIds()` includes `d1` and `d2` (if d2 has a video) at the end of the array; `getLessonById('d1')` returns a `{ lesson, world: null, discipline }` shape with discipline populated.

- [ ] **Step 7: Commit**

```bash
cd /Users/alansimon/Desktop/adlingo/adlingo
git add src/data/courseData.js
git commit -m "feat(disciplines): add data model and accessors"
```

---

### Task 8: Teach `VideoPlayer` to render self-hosted MP4s

**Files:**
- Modify: `src/components/VideoPlayer.jsx`

- [ ] **Step 1: Add file detection at the top of `getEmbedUrl`**

In `src/components/VideoPlayer.jsx`, leave `getEmbedUrl` alone (it handles iframes). Instead, branch *before* calling it. Replace the default export with:

```jsx
export default function VideoPlayer({ url, title, videoType }) {
  if (!url) {
    return (
      <div className="w-full aspect-video bg-gray-800/50 rounded-2xl flex items-center justify-center border border-gray-700/50">
        <p className="text-gray-500 text-sm">No video for this lesson</p>
      </div>
    );
  }

  const isFile =
    videoType === 'file' ||
    /\.(mp4|webm|mov)(\?|$)/i.test(url) ||
    url.startsWith('/');

  if (isFile) {
    return (
      <div className="w-full aspect-video rounded-2xl overflow-hidden border border-gray-700/50 bg-black">
        <video
          src={url}
          title={title || 'Lesson Video'}
          className="w-full h-full"
          controls
          preload="metadata"
          playsInline
        />
      </div>
    );
  }

  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) {
    return (
      <div className="w-full aspect-video bg-gray-800/50 rounded-2xl flex items-center justify-center border border-gray-700/50">
        <p className="text-gray-500 text-sm">No video for this lesson</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-gray-700/50 bg-black">
      <iframe
        src={embedUrl}
        title={title || 'Lesson Video'}
        className="w-full h-full"
        style={{ border: 'none' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
```

- [ ] **Step 2: Manual verification**

Reload `/course`. Pick any existing world lesson — Loom/Tella iframe must still render unchanged (regression check). Then, in the browser console at `/course`, temporarily render the player with a file URL to confirm the new branch works:

```js
// quick sanity — just check the served file resolves
fetch('/disciplines/b-roll.mp4', { method: 'HEAD' }).then(r => console.log(r.status));
```

Expected: `200` for `/disciplines/b-roll.mp4`. End-to-end UI check happens in Task 12 after the sidebar is wired.

- [ ] **Step 3: Commit**

```bash
cd /Users/alansimon/Desktop/adlingo/adlingo
git add src/components/VideoPlayer.jsx
git commit -m "feat(video-player): support self-hosted MP4 via native video tag"
```

---

### Task 9: Add Disciplines section to Course sidebar

**Files:**
- Modify: `src/pages/Course.jsx`

- [ ] **Step 1: Import `getDisciplines` and load it alongside worlds**

At the top of `src/pages/Course.jsx`, update the existing import:

```jsx
import { getWorlds, getDisciplines } from '../data/courseData';
```

Inside the `Course` component, immediately after `const worlds = getWorlds().sort((a, b) => a.order - b.order);`, add:

```jsx
const disciplines = getDisciplines().sort((a, b) => a.order - b.order);
```

- [ ] **Step 2: Treat `expandedWorlds` as ToC-wide**

Rename the local state to better reflect that it covers both worlds and disciplines. Replace:

```jsx
const [expandedWorlds, setExpandedWorlds] = useState(() => new Set(worlds.map((w) => w.id)));
```

with:

```jsx
const [expandedSections, setExpandedSections] = useState(
  () => new Set([...worlds.map((w) => w.id), 'disciplines'])
);
```

And rename `toggleWorld` → `toggleSection` (same body, just operating on `expandedSections`):

```jsx
const toggleSection = (sectionId) => {
  haptic('light');
  setExpandedSections((prev) => {
    const next = new Set(prev);
    if (next.has(sectionId)) next.delete(sectionId); else next.add(sectionId);
    return next;
  });
};
```

Update existing references in `renderSidebar` from `expandedWorlds` → `expandedSections`, `toggleWorld(world.id)` → `toggleSection(world.id)`.

Also update `selectLesson` to use `expandedSections`:

```jsx
const selectLesson = (lesson, world) => {
  setActiveLesson({ lesson, world, discipline: null });
  setSearchParams({ lesson: lesson.id }, { replace: true });
  setExpandedSections((prev) => {
    if (prev.has(world.id)) return prev;
    const next = new Set(prev);
    next.add(world.id);
    return next;
  });
};
```

(Note: `activeLesson` shape grows a `discipline` slot — see Task 10 for the discipline-select path.)

- [ ] **Step 3: Add a `selectDiscipline` handler**

Below `selectLesson`, add:

```jsx
const selectDiscipline = (discipline) => {
  // A discipline IS its own single lesson — synthesize a lesson object so LessonDetail can read it
  const lesson = {
    id: discipline.id,
    title: discipline.name,
    subtitle: discipline.subtitle,
    order: discipline.order,
    videoUrl: discipline.videoUrl,
    videoType: discipline.videoType,
    questions: discipline.questions
  };
  setActiveLesson({ lesson, world: null, discipline });
  setSearchParams({ lesson: discipline.id }, { replace: true });
  setExpandedSections((prev) => {
    if (prev.has('disciplines')) return prev;
    const next = new Set(prev);
    next.add('disciplines');
    return next;
  });
};
```

- [ ] **Step 4: Render Disciplines section at the end of `renderSidebar`**

At the end of `renderSidebar` (just before the closing `</div>` of the `space-y-2.5` wrapper), append:

```jsx
{disciplines.length > 0 && (
  <section className="rounded-xl overflow-hidden border border-yellow-500/20 bg-yellow-500/[0.02]">
    <button
      onClick={() => toggleSection('disciplines')}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-yellow-500/[0.04] transition-colors"
    >
      <ChevronDown
        size={13}
        className={`text-yellow-600/70 shrink-0 transition-transform duration-200 ${expandedSections.has('disciplines') ? '' : '-rotate-90'}`}
        strokeWidth={2.5}
      />
      <span className="meta-label text-yellow-600/80 shrink-0 tabular-nums">D · ALL</span>
      <span className="text-[12px] font-semibold tracking-tight truncate flex-1 text-yellow-100">
        Disciplines · Types of Ads
      </span>
      <span className="meta-label tabular-nums shrink-0 text-yellow-500/80">
        {disciplines.filter((d) => completedLessons.includes(d.id)).length}
        /
        {disciplines.filter((d) => d.videoUrl).length}
      </span>
    </button>

    <AnimatePresence initial={false}>
      {expandedSections.has('disciplines') && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="border-t border-yellow-500/20 pb-1">
            {disciplines.map((discipline, dIdx) => {
              const isComplete = completedLessons.includes(discipline.id);
              const isPlayable = !!discipline.videoUrl;
              const isActive = selectedLesson?.id === discipline.id;
              return (
                <button
                  key={discipline.id}
                  onClick={() => { if (isPlayable) { haptic('light'); selectDiscipline(discipline); } }}
                  disabled={!isPlayable}
                  className={`
                    w-full flex items-center gap-3 pl-3 pr-3 py-2 text-left transition-colors
                    ${isActive
                      ? 'bg-yellow-500/10'
                      : isPlayable
                        ? 'hover:bg-yellow-500/[0.04]'
                        : 'opacity-35 cursor-not-allowed'}
                  `}
                >
                  <span className={`meta-label tabular-nums shrink-0 w-6 ${
                    isActive ? 'text-yellow-300' : 'text-yellow-600/70'
                  }`}>
                    D · {String(dIdx + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-[13px] truncate flex-1 transition-colors ${
                    isActive ? 'text-yellow-50 font-semibold'
                    : isComplete ? 'text-yellow-200/60 line-through decoration-[0.5px] decoration-yellow-600/40 decoration-skip-ink-none'
                    : isPlayable ? 'text-yellow-100/85 font-medium'
                    : 'text-yellow-100/30'
                  }`}>
                    {discipline.name}
                  </span>
                  {isComplete && !isActive && (
                    <Check size={11} className="text-yellow-500/70 shrink-0" strokeWidth={2.5} />
                  )}
                  {isActive && (
                    <span className="meta-label text-yellow-300 shrink-0">Now</span>
                  )}
                  {!isPlayable && (
                    <span className="meta-label text-yellow-100/30 shrink-0">Soon</span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </section>
)}
```

- [ ] **Step 5: Manual verification**

Reload `/course`. The Disciplines section appears as the last group in the sidebar with B-Roll, Podcast (or "Soon"), and two "Coming soon" placeholders. Counter reads `0/2` (or `0/1` if d2 is a placeholder). Clicking B-Roll selects it and highlights the row gold. Clicking a "Soon" row does nothing.

- [ ] **Step 6: Commit**

```bash
cd /Users/alansimon/Desktop/adlingo/adlingo
git add src/pages/Course.jsx
git commit -m "feat(course): render Disciplines section in sidebar"
```

---

### Task 10: Teach `LessonDetail` the discipline variant

**Files:**
- Modify: `src/pages/Course.jsx` (specifically the `LessonDetail` component at the bottom)

- [ ] **Step 1: Pass `discipline` into `LessonDetail` at both call sites**

In `Course.jsx`, the desktop and mobile blocks both render `<LessonDetail world={selectedWorld} lesson={selectedLesson} ... />`. Replace both with:

```jsx
<LessonDetail
  world={selectedWorld}
  discipline={activeLesson?.discipline || null}
  lesson={selectedLesson}
  completedLessons={completedLessons}
  onTakeTest={() => { haptic('nav'); navigate(`/lesson/${selectedLesson.id}`); }}
  size="desktop" /* or "mobile" */
/>
```

Also handle the `!selectedWorld && !discipline` case: today the desktop right pane shows "Select a lesson to start learning" when `selectedLesson` is null. That branch already works because it gates on `selectedLesson`. No change needed there.

- [ ] **Step 2: Rewrite `LessonDetail` to branch on discipline vs world**

Replace the existing `LessonDetail` function at the bottom of `src/pages/Course.jsx` with:

```jsx
function LessonDetail({ world, discipline, lesson, completedLessons, onTakeTest, size }) {
  const isDiscipline = !!discipline;
  const isTested = completedLessons.includes(lesson.id);
  const isDesktop = size === 'desktop';
  const headingSize = isDesktop ? 'text-[32px]' : 'text-[22px]';

  // Breadcrumb: discipline variant or world variant
  const breadcrumb = isDiscipline ? (
    <div className="mb-3 flex items-center gap-2 flex-wrap">
      <span className="meta-label text-yellow-600/80 tabular-nums">DISCIPLINE</span>
      <span className="text-gray-700 text-[10px]">·</span>
      <span className="meta-label text-yellow-600/80 tabular-nums">
        D · {String(discipline.order).padStart(2, '0')}
      </span>
      <span className="text-gray-700 text-[10px]">·</span>
      <span className={`meta-label tabular-nums ${isTested ? 'text-emerald-400/70' : 'text-yellow-400'}`}>
        {discipline.name.toUpperCase()}
      </span>
      {discipline.coach && (
        <>
          <span className="text-gray-700 text-[10px]">·</span>
          <span className="meta-label text-gray-500">with {discipline.coach}</span>
        </>
      )}
    </div>
  ) : (
    <div className="mb-3 flex items-center gap-2 flex-wrap">
      <span className="meta-label text-gray-500 tabular-nums">VOL · 01</span>
      <span className="text-gray-700 text-[10px]">·</span>
      <span className="meta-label text-gray-500 tabular-nums">
        W · {String(world.order || 1).padStart(2, '0')} · {world.name.toUpperCase()}
      </span>
      <span className="text-gray-700 text-[10px]">·</span>
      <span className={`meta-label tabular-nums ${isTested ? 'text-emerald-400/70' : 'text-[#FF6B35]'}`}>
        Lesson · {String(world.lessons.findIndex((l) => l.id === lesson.id) + 1).padStart(2, '0')}
      </span>
    </div>
  );

  const ctaClassName = isDiscipline
    ? 'shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 text-yellow-950 font-bold text-[13px] uppercase tracking-wider border-b-[3px] border-amber-800 active:border-b-0 active:translate-y-[3px] shadow-lg shadow-yellow-500/20 transition-all'
    : 'shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#C44D1E] text-white font-bold text-[13px] uppercase tracking-wider border-b-[3px] border-[#8A2F0F] active:border-b-0 active:translate-y-[3px] shadow-brand-glow transition-all';

  const accentClass = isDiscipline ? 'text-yellow-400' : world?.accentColor || 'text-orange-400';

  return (
    <>
      {breadcrumb}

      <h1 className={`${headingSize} font-bold text-[#F5F5F2] leading-[1.1] tracking-tight mb-2`}>
        {lesson.title}
      </h1>
      {lesson.subtitle && (
        <p className="text-[#A8A8A4] text-[15px] leading-relaxed mb-6 max-w-2xl">
          {lesson.subtitle}
        </p>
      )}

      <div className="h-px bg-white/[0.06] my-5" />

      {/* Video */}
      <div className="mb-6">
        {lesson.videoUrl ? (
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <VideoPlayer url={lesson.videoUrl} videoType={lesson.videoType} title={lesson.title} />
          </div>
        ) : (
          <div className="w-full aspect-video bg-[#111114] rounded-xl flex flex-col items-center justify-center border border-white/[0.06]">
            <Play size={32} className="text-gray-700 mb-2" />
            <p className="text-gray-500 text-[13px] font-medium">Video not yet published</p>
          </div>
        )}
      </div>

      {/* Resources strip — disciplines only */}
      {isDiscipline && discipline.extraLinks && discipline.extraLinks.length > 0 && (
        <div className="mb-8 -mt-2">
          <div className="meta-label text-gray-500 mb-2">Resources</div>
          <div className="flex flex-wrap gap-2">
            {discipline.extraLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/25 text-yellow-200 hover:bg-yellow-500/15 hover:border-yellow-400/40 transition text-[12px] font-medium"
              >
                {link.label}
                <ArrowRight size={11} strokeWidth={2.5} className="-rotate-45" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Take the test (only when not yet tested AND lesson has questions) */}
      {!isTested && lesson.questions && lesson.questions.length > 0 && (
        <div className="border-t border-white/[0.06] pt-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="meta-label text-gray-500 mb-0.5">Next</div>
              <div className="text-[15px] font-semibold text-[#F5F5F2] tracking-tight">
                Test your knowledge
              </div>
              <div className="text-[12px] text-gray-500 mt-0.5">
                {lesson.questions.length} questions · ~{Math.max(1, Math.ceil(lesson.questions.length * 0.5))} min
              </div>
            </div>
            <button onClick={onTakeTest} className={ctaClassName}>
              Take the test
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* Completed footer */}
      {isTested && (
        <div className="border-t border-white/[0.06] pt-5 flex items-center justify-end gap-3">
          <span className="meta-label text-gray-500 flex items-center gap-1.5">
            <Check size={11} strokeWidth={2.5} className={accentClass} />
            Completed
          </span>
          <span className="text-gray-700">·</span>
          <button onClick={onTakeTest} className="meta-label text-gray-400 hover:text-[#FF6B35] transition-colors">
            Retake test
          </button>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Manual verification**

Reload `/course?lesson=d1`. Confirm:
- Breadcrumb reads `DISCIPLINE · D · 01 · B-ROLL · with Saskia` in gold
- Video plays via the native `<video>` element (controls visible, no Loom branding)
- "Resources" strip shows the Magnific link below the video
- "Take the test" CTA is gold
- Clicking Take-the-test navigates to `/lesson/d1` (next task wires the quiz machinery — confirm route resolves)

Also reload `/course` with a normal world lesson selected — breadcrumb must still be orange `VOL · 01 · W · 01 · EDITING TOWN · Lesson · 01` (regression).

- [ ] **Step 4: Commit**

```bash
cd /Users/alansimon/Desktop/adlingo/adlingo
git add src/pages/Course.jsx
git commit -m "feat(course): discipline variant in LessonDetail (breadcrumb, resources, gold CTA)"
```

---

### Task 11: Auto-select disciplines from `?lesson=<id>` and verify Lesson route

**Files:**
- Modify: `src/pages/Course.jsx`

- [ ] **Step 1: Extend the auto-select effect to resolve discipline IDs**

The existing useEffect at the top of `Course.jsx` honours `?lesson=<id>` for worlds. Update it to also check disciplines. Replace the effect with:

```jsx
useEffect(() => {
  if (activeLesson) return;
  const queryLessonId = searchParams.get('lesson');
  if (queryLessonId) {
    // Try worlds first
    for (const world of worlds) {
      const match = world.lessons.find((l) => l.id === queryLessonId);
      if (match && isWorldUnlocked(world)) {
        setActiveLesson({ lesson: match, world, discipline: null });
        return;
      }
    }
    // Then disciplines
    const matchD = disciplines.find((d) => d.id === queryLessonId && d.videoUrl);
    if (matchD) {
      selectDiscipline(matchD);
      return;
    }
  }
  for (const world of worlds) {
    if (!isWorldUnlocked(world)) continue;
    for (const lesson of world.lessons.sort((a, b) => a.order - b.order)) {
      if (isLessonUnlocked(lesson, world)) {
        setActiveLesson({ lesson, world, discipline: null });
        return;
      }
    }
  }
}, []);
```

- [ ] **Step 2: Verify the existing `/lesson/:lessonId` route handles discipline IDs**

The Lesson page (`src/pages/Lesson.jsx`) uses `getLessonById` from `courseData.js`. Because Task 7 Step 5 extended `getLessonById` to also return discipline lessons synthesized as a lesson shape, no changes should be needed in `Lesson.jsx`. Open it and confirm it does not destructure `world` in a way that would crash when `world: null` — if it does, guard it.

```bash
grep -n 'world' /Users/alansimon/Desktop/adlingo/adlingo/src/pages/Lesson.jsx
```

If `Lesson.jsx` reads e.g. `world.accentColor` for theming, add a fallback: `const accentColor = world?.accentColor || (discipline ? 'text-yellow-400' : 'text-orange-400');`. Make the minimal edit needed; do not refactor unrelated code.

- [ ] **Step 3: Manual verification end-to-end**

1. Navigate to `/course?lesson=d1` directly — B-Roll is auto-selected, video loads.
2. Click "Take the test" — `/lesson/d1` opens, quiz renders with the 4 B-Roll questions.
3. Complete the quiz. Get all 4 correct → `+40 XP`.
4. Navigate to `/` (WorldMap). Confirm the global progress bar percentage increased and total XP in the header increased.
5. Return to `/course`. The B-Roll row shows the strikethrough "completed" style; the disciplines counter reads `1/2` (or `1/1`).

- [ ] **Step 4: Commit**

```bash
cd /Users/alansimon/Desktop/adlingo/adlingo
git add src/pages/Course.jsx src/pages/Lesson.jsx
git commit -m "feat(course): deep-link disciplines via ?lesson and wire quiz route"
```

---

### Task 12: Final manual verification pass

No code changes. Walk the full feature end-to-end and confirm nothing regressed.

- [ ] **Step 1: Regression — Worlds untouched**

At `/course`, expand each of the 4 worlds. Lessons still render with their world's accent color, video embeds still work (Loom + Tella), Take-the-test still launches `/lesson/<id>`. Completion state for any previously-completed lessons is preserved.

- [ ] **Step 2: Discipline sidebar**

Disciplines section is the last group in the sidebar, gold-accented, expandable, counter reads `<done>/<playable>`. D3 and D4 ("Coming soon") are disabled and visually dimmed.

- [ ] **Step 3: B-Roll page**

Selecting B-Roll renders the gold breadcrumb, the stitched MP4 plays via native controls (seek bar, volume, fullscreen all work), the Magnific link opens in a new tab.

- [ ] **Step 4: Podcast page**

Either renders Nico's video (real case) or shows "Video not yet published" placeholder (fallback case). If real: video plays, Drive link opens. If placeholder: no Take-the-test button.

- [ ] **Step 5: Quiz + progress flow**

Complete the B-Roll quiz. Verify XP and global progress update. Verify the row strikethrough on the sidebar. Verify the "Retake test" link appears on the completed B-Roll page.

- [ ] **Step 6: Bottom-tab navigation**

Course tab and Test tab both still navigable. Test page (WorldMap) is unchanged this pass — Disciplines do NOT appear there. (Future work, per spec.)

- [ ] **Step 7: Mobile viewport (lg breakpoint and below)**

Resize the browser to mobile width. The mobile curriculum view shows Worlds + Disciplines section. Selecting B-Roll on mobile shows the video full-width with back-to-curriculum link working.

- [ ] **Step 8: Final commit (if any tiny polish fixes happened during verification)**

```bash
cd /Users/alansimon/Desktop/adlingo/adlingo
git status
# If anything was tweaked:
git add -p
git commit -m "polish(disciplines): verification-pass fixes"
```

---

## Self-Review

**Spec coverage check (against `docs/superpowers/specs/2026-05-24-disciplines-design.md`):**

| Spec requirement | Implementing task |
|---|---|
| 4 disciplines, 2 with video, 2 "Coming soon" | Task 7 Step 2 |
| B-Roll = Saskia (stitched), Podcast = Nico | Tasks 1–5 |
| All unlocked from start | Implicit — no gating logic added; sidebar renders every discipline regardless of state |
| Lives in Course sidebar, "Disciplines · Types of Ads" heading | Task 9 Step 4 |
| Gold theme treatment | Tasks 9 Step 4 & 10 Step 2 |
| `D · 0X` prefix in sidebar | Task 9 Step 4 |
| Discipline breadcrumb `DISCIPLINE · 0X · NAME` in LessonDetail | Task 10 Step 2 |
| Magnific / Drive surfaced as Resources strip below video | Task 10 Step 2 |
| Counts toward XP and global progress | Task 7 Step 4 (getAllLessonIds) — existing handleLessonComplete handles the rest |
| `progress.completedLessons` / `scores` keys reused | No code change needed; covered by `lesson.id === discipline.id` |
| Stitched MP4 in `public/disciplines/` | Tasks 1–2 |
| `VideoPlayer` handles file URLs | Task 8 |
| `getAllLessonIds` excludes placeholders so progress isn't dragged down | Task 7 Step 4 |
| Seed-version bump | Task 7 Step 1 (course bumped to 4, disciplines seed key starts at 1) |
| WorldMap NOT touched this pass | Confirmed — no task modifies WorldMap |
| No admin UI this pass | Confirmed — no task modifies Admin.jsx |
| Reproducible video pipeline | Task 2 Step 6 (`scripts/disciplines/build-videos.sh`) |
| Drive-access fallback | Task 4 Step 4 |
| File-size gitignore decision | Task 2 Step 5 |

All spec items mapped.

**Placeholder scan:** No "TBD"/"fill in later" steps. Quiz content is the one piece authored mid-plan (Task 6) rather than pre-baked — this is intentional because it depends on transcripts produced in Tasks 3 and 5.

**Type/name consistency:** `selectDiscipline`, `getDisciplines`, `getDisciplineById`, `expandedSections`, `toggleSection`, `activeLesson.discipline` — all consistent across Tasks 7, 9, 10, 11. The synthesized `lesson` shape from a discipline (Task 7 Step 5 and Task 9 Step 3) has the same fields used by `LessonDetail` and `Lesson.jsx` (`id`, `title`, `subtitle`, `order`, `videoUrl`, `videoType`, `questions`).
