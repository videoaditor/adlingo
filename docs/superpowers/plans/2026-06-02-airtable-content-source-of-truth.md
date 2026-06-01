# Airtable Content Source-of-Truth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Airtable the shared source of truth for all AdLingo course content (worlds + disciplines), edited through the admin portal, with timestamped backups and a never-blank fallback ladder.

**Architecture:** A new `contentStore` service reads/writes a single JSON content record in Airtable (table `AdLingo Content`) and appends pre-save snapshots to `AdLingo Content Backups`. The existing synchronous `courseData` accessors keep serving content from a localStorage cache; `bootstrapContent()` fills that cache from Airtable at app start, and `persistContent()` writes admin edits to both the cache and Airtable. The admin portal gains a Disciplines editor. The hardcoded seed arrays stay as the ultimate fallback and are never deleted.

**Tech Stack:** React 19, Vite 7, plain `fetch` to the Airtable REST API, Vitest + jsdom for unit tests.

**Spec:** `docs/superpowers/specs/2026-06-02-airtable-content-source-of-truth-design.md`

---

## File Structure

| File | Responsibility | Action |
| --- | --- | --- |
| `vitest.config.js` | Vitest config (jsdom env) | Create |
| `package.json` | Add `test` scripts + `vitest`, `jsdom` devDeps | Modify |
| `src/services/airtable.js` | Export shared base URL + headers helper (token stays in one place) | Modify |
| `src/data/courseData.js` | Add `applyContent`, `getLocalContent` (cache write + read of both worlds & disciplines) | Modify |
| `src/services/contentStore.js` | Airtable content I/O + `bootstrapContent` + `persistContent` | Create |
| `src/services/contentStore.test.js` | Unit tests for content store | Create |
| `src/data/courseData.test.js` | Unit tests for cache helpers | Create |
| `src/App.jsx` | Run `bootstrapContent()` before first content render | Modify |
| `src/components/QuestionEditor.jsx` | Reusable question CRUD editor (used by the disciplines tab) | Create |
| `src/pages/Admin.jsx` | Disciplines tab + persist worlds & disciplines to Airtable on save | Modify |

Note on the never-delete rule: no task deletes the `SEED_WORLDS` / `SEED_DISCIPLINES` arrays, any Airtable record, or any field. Saves always append a backup before overwriting the live record.

---

## Task 1: Add Vitest tooling

**Files:**
- Create: `vitest.config.js`
- Modify: `package.json` (scripts + devDependencies)

- [ ] **Step 1: Install test dependencies**

Run:
```bash
cd ~/Desktop/adlingo/adlingo
npm install -D vitest@^2 jsdom@^25
```
Expected: `package.json` devDependencies now include `vitest` and `jsdom`; exit code 0.

- [ ] **Step 2: Create the Vitest config**

Create `vitest.config.js`:
```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

- [ ] **Step 3: Add test scripts to package.json**

In `package.json`, add these two entries to the `"scripts"` object (leave the existing scripts untouched):
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 4: Add a smoke test and run it**

Create `src/smoke.test.js`:
```js
import { describe, it, expect } from 'vitest';

describe('vitest wiring', () => {
  it('runs and has localStorage from jsdom', () => {
    localStorage.setItem('k', 'v');
    expect(localStorage.getItem('k')).toBe('v');
  });
});
```

Run: `npm test`
Expected: PASS — 1 passed.

- [ ] **Step 5: Remove the smoke test and commit**

Run:
```bash
rm src/smoke.test.js
git add vitest.config.js package.json package-lock.json
git commit -m "chore(test): add vitest + jsdom for unit tests"
```

---

## Task 2: Export shared Airtable config from airtable.js

Keep the token and base URL defined in exactly one place so `contentStore` reuses them.

**Files:**
- Modify: `src/services/airtable.js` (after the `headers` definition near line 23)

- [ ] **Step 1: Add the exports**

In `src/services/airtable.js`, immediately after the `const headers = () => ({ ... });` block (currently ending around line 23), add:
```js
// Shared so other services (e.g. contentStore) reuse the same token + base URL.
export const AIRTABLE_BASE_URL = BASE_URL;
export const airtableHeaders = headers;
```

- [ ] **Step 2: Verify the app still builds**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add src/services/airtable.js
git commit -m "refactor(airtable): export shared base URL and headers helper"
```

---

## Task 3: Add cache helpers to courseData.js

`applyContent` writes both localStorage caches; `getLocalContent` reads the current content (which already falls back to seed). These let the content store fill and read the cache without duplicating storage-key knowledge.

**Files:**
- Modify: `src/data/courseData.js` (add functions after `saveDisciplines`, near line 1097)
- Test: `src/data/courseData.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/data/courseData.test.js`:
```js
import { describe, it, expect, beforeEach } from 'vitest';
import { applyContent, getLocalContent, getWorlds, getDisciplines } from './courseData';

beforeEach(() => {
  localStorage.clear();
});

describe('applyContent', () => {
  it('writes worlds and disciplines into the cache so getters return them', () => {
    const worlds = [{ id: 'w9', name: 'Test World', order: 1, lessons: [] }];
    const disciplines = [{ id: 'd9', name: 'Test Disc', order: 1, videoUrl: 'x', questions: [] }];

    applyContent({ worlds, disciplines });

    expect(getWorlds()).toEqual(worlds);
    expect(getDisciplines()).toEqual(disciplines);
  });

  it('ignores non-array fields without throwing', () => {
    expect(() => applyContent({ worlds: undefined, disciplines: null })).not.toThrow();
  });
});

describe('getLocalContent', () => {
  it('returns the current worlds and disciplines as a single object', () => {
    const content = getLocalContent();
    expect(Array.isArray(content.worlds)).toBe(true);
    expect(Array.isArray(content.disciplines)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/data/courseData.test.js`
Expected: FAIL — `applyContent` / `getLocalContent` are not exported.

- [ ] **Step 3: Implement the helpers**

In `src/data/courseData.js`, after the `saveDisciplines` function (around line 1097), add:
```js
// Write both content caches at once (used when hydrating from Airtable).
// Bumps the seed-version markers so the synchronous getters serve this content
// instead of re-seeding over it.
export function applyContent({ worlds, disciplines } = {}) {
  if (Array.isArray(worlds)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(worlds));
    localStorage.setItem(SEED_VERSION_KEY, String(CURRENT_SEED_VERSION));
  }
  if (Array.isArray(disciplines)) {
    localStorage.setItem(DISCIPLINES_STORAGE_KEY, JSON.stringify(disciplines));
    localStorage.setItem(
      DISCIPLINES_SEED_VERSION_KEY,
      String(CURRENT_DISCIPLINES_SEED_VERSION)
    );
  }
}

// Read the current content (falls back to seed via the existing getters).
export function getLocalContent() {
  return { worlds: getWorlds(), disciplines: getDisciplines() };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/data/courseData.test.js`
Expected: PASS — all 3 tests pass.

- [ ] **Step 5: Commit**

Run:
```bash
git add src/data/courseData.js src/data/courseData.test.js
git commit -m "feat(content): add applyContent and getLocalContent cache helpers"
```

---

## Task 4: contentStore — fetchLiveContent

Reads and validates the live content blob from Airtable. Returns `null` on absence, bad JSON, or network error (the caller decides what to do).

**Files:**
- Create: `src/services/contentStore.js`
- Test: `src/services/contentStore.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/services/contentStore.test.js`:
```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchLiveContent } from './contentStore';

function mockFetchOnce(jsonValue, ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => jsonValue,
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('fetchLiveContent', () => {
  it('returns parsed worlds and disciplines from the live record', async () => {
    const blob = { worlds: [{ id: 'w1' }], disciplines: [{ id: 'd1' }] };
    mockFetchOnce({ records: [{ id: 'rec1', fields: { 'Content JSON': JSON.stringify(blob) } }] });

    const result = await fetchLiveContent();
    expect(result).toEqual(blob);
  });

  it('returns null when no record exists', async () => {
    mockFetchOnce({ records: [] });
    expect(await fetchLiveContent()).toBeNull();
  });

  it('returns null when Content JSON is malformed', async () => {
    mockFetchOnce({ records: [{ id: 'rec1', fields: { 'Content JSON': '{not json' } }] });
    expect(await fetchLiveContent()).toBeNull();
  });

  it('returns null on a network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline'));
    expect(await fetchLiveContent()).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/services/contentStore.test.js`
Expected: FAIL — `./contentStore` does not exist.

- [ ] **Step 3: Implement fetchLiveContent**

Create `src/services/contentStore.js`:
```js
// Airtable-backed content store. Airtable is the source of truth for course
// content (worlds + disciplines); the synchronous courseData cache serves reads.
//
// Requires two manually-created tables in base appP65kN7D9LjbXb0:
//   - "AdLingo Content"         : Key (text), Content JSON (long text),
//                                 Updated At (text), Updated By (text)
//   - "AdLingo Content Backups" : Snapshot JSON (long text), Saved At (text),
//                                 Saved By (text)
import { AIRTABLE_BASE_URL, airtableHeaders } from './airtable';
import { applyContent, getLocalContent } from '../data/courseData';

const CONTENT_TABLE = 'AdLingo Content';
const BACKUPS_TABLE = 'AdLingo Content Backups';
const CONTENT_KEY = 'live';

function tableUrl(table, suffix = '') {
  return `${AIRTABLE_BASE_URL}/${encodeURIComponent(table)}${suffix}`;
}

// Returns the raw live record ({ id, fields }) or null. Throws on HTTP/network
// failure so callers can distinguish "absent" (null) from "unreachable" (throw).
async function fetchLiveRecord() {
  const formula = encodeURIComponent(`{Key} = "${CONTENT_KEY}"`);
  const res = await fetch(
    tableUrl(CONTENT_TABLE, `?filterByFormula=${formula}&maxRecords=1`),
    { headers: airtableHeaders() }
  );
  if (!res.ok) {
    const err = new Error(`Airtable ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return (data.records && data.records[0]) || null;
}

export async function fetchLiveContent() {
  try {
    const rec = await fetchLiveRecord();
    if (!rec) return null;
    const raw = rec.fields['Content JSON'];
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.worlds) || !Array.isArray(parsed.disciplines)) {
      return null;
    }
    return { worlds: parsed.worlds, disciplines: parsed.disciplines };
  } catch (err) {
    console.error('[content] fetchLiveContent error:', err.message);
    return null;
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/contentStore.test.js`
Expected: PASS — all 4 tests pass.

- [ ] **Step 5: Commit**

Run:
```bash
git add src/services/contentStore.js src/services/contentStore.test.js
git commit -m "feat(content): contentStore.fetchLiveContent reads live blob from Airtable"
```

---

## Task 5: contentStore — saveLiveContent (backup before overwrite)

Appends the previous blob to the backups table, then upserts the live record. This is the "never delete" guarantee.

**Files:**
- Modify: `src/services/contentStore.js`
- Test: `src/services/contentStore.test.js` (add cases)

- [ ] **Step 1: Write the failing test**

Append to `src/services/contentStore.test.js`:
```js
import { saveLiveContent } from './contentStore';

describe('saveLiveContent', () => {
  it('backs up the previous blob BEFORE patching the live record', async () => {
    const calls = [];
    const prev = JSON.stringify({ worlds: [{ id: 'old' }], disciplines: [] });
    global.fetch = vi.fn((url, opts = {}) => {
      calls.push({ url, method: opts.method || 'GET', body: opts.body });
      // 1st call: fetchLiveRecord (GET) -> existing record with prior content
      if (!opts.method || opts.method === 'GET') {
        return Promise.resolve({
          ok: true, status: 200,
          json: async () => ({ records: [{ id: 'rec1', fields: { 'Content JSON': prev } }] }),
        });
      }
      // backup POST + live PATCH both succeed
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    const next = { worlds: [{ id: 'new' }], disciplines: [{ id: 'd1' }] };
    const ok = await saveLiveContent(next, 'alan@aditor.ai');

    expect(ok).toBe(true);
    // Order: GET live, POST backup, PATCH live
    expect(calls[0].method).toBe('GET');
    expect(calls[1].method).toBe('POST');
    expect(calls[1].url).toContain('AdLingo%20Content%20Backups');
    expect(JSON.parse(calls[1].body).fields['Snapshot JSON']).toBe(prev);
    expect(calls[2].method).toBe('PATCH');
    expect(calls[2].url).toContain('rec1');
    expect(JSON.parse(calls[2].body).fields['Content JSON']).toBe(JSON.stringify(next));
  });

  it('creates the live record (POST) when none exists and skips backup', async () => {
    const calls = [];
    global.fetch = vi.fn((url, opts = {}) => {
      calls.push({ url, method: opts.method || 'GET' });
      if (!opts.method || opts.method === 'GET') {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ records: [] }) });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    const ok = await saveLiveContent({ worlds: [], disciplines: [] }, 'seed');
    expect(ok).toBe(true);
    expect(calls.some((c) => c.method === 'POST' && c.url.includes('AdLingo%20Content%20Backups'))).toBe(false);
    const last = calls[calls.length - 1];
    expect(last.method).toBe('POST');
    expect(last.url).toContain('AdLingo%20Content');
  });

  it('returns false for invalid content', async () => {
    global.fetch = vi.fn();
    expect(await saveLiveContent(null)).toBe(false);
    expect(await saveLiveContent({ worlds: 'x', disciplines: [] })).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/services/contentStore.test.js`
Expected: FAIL — `saveLiveContent` is not exported.

- [ ] **Step 3: Implement saveLiveContent**

In `src/services/contentStore.js`, add after `fetchLiveContent`:
```js
// Persist content to Airtable. Appends the prior blob to the backups table
// first (history is never lost), then upserts the live record. Backup failure
// is logged but does not block the primary save — content truth takes priority.
export async function saveLiveContent(content, adminEmail = 'admin') {
  if (
    !content ||
    !Array.isArray(content.worlds) ||
    !Array.isArray(content.disciplines)
  ) {
    return false;
  }
  const now = new Date().toISOString();
  try {
    const existing = await fetchLiveRecord();

    if (existing && existing.fields['Content JSON']) {
      await fetch(tableUrl(BACKUPS_TABLE), {
        method: 'POST',
        headers: airtableHeaders(),
        body: JSON.stringify({
          fields: {
            'Snapshot JSON': existing.fields['Content JSON'],
            'Saved At': now,
            'Saved By': adminEmail,
          },
        }),
      }).catch((err) =>
        console.error('[content] backup append failed (continuing):', err.message)
      );
    }

    const fields = {
      Key: CONTENT_KEY,
      'Content JSON': JSON.stringify(content),
      'Updated At': now,
      'Updated By': adminEmail,
    };
    const res = existing
      ? await fetch(tableUrl(CONTENT_TABLE, `/${existing.id}`), {
          method: 'PATCH',
          headers: airtableHeaders(),
          body: JSON.stringify({ fields }),
        })
      : await fetch(tableUrl(CONTENT_TABLE), {
          method: 'POST',
          headers: airtableHeaders(),
          body: JSON.stringify({ fields }),
        });

    if (!res.ok) {
      console.error(`[content] saveLiveContent failed: ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[content] saveLiveContent error:', err.message);
    return false;
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/services/contentStore.test.js`
Expected: PASS — all 7 tests pass.

- [ ] **Step 5: Commit**

Run:
```bash
git add src/services/contentStore.js src/services/contentStore.test.js
git commit -m "feat(content): saveLiveContent backs up prior blob then upserts live record"
```

---

## Task 6: contentStore — bootstrapContent & persistContent

`bootstrapContent` hydrates the cache at app start and runs the one-time seed migration without ever overwriting existing remote content. `persistContent` is the admin save path.

**Files:**
- Modify: `src/services/contentStore.js`
- Test: `src/services/contentStore.test.js` (add cases)

- [ ] **Step 1: Write the failing test**

Append to `src/services/contentStore.test.js`:
```js
import { bootstrapContent, persistContent } from './contentStore';

describe('bootstrapContent', () => {
  it('applies remote content to the cache when present', async () => {
    const blob = {
      worlds: [{ id: 'wR', name: 'Remote', order: 1, lessons: [] }],
      disciplines: [{ id: 'dR', name: 'Remote D', order: 1, videoUrl: 'x', questions: [] }],
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({ records: [{ id: 'rec1', fields: { 'Content JSON': JSON.stringify(blob) } }] }),
    });

    const result = await bootstrapContent();
    expect(result).toEqual(blob);
    // Cache was written
    expect(JSON.parse(localStorage.getItem('adlingo_course_data'))).toEqual(blob.worlds);
  });

  it('seeds Airtable from local content when no record exists', async () => {
    const posted = [];
    global.fetch = vi.fn((url, opts = {}) => {
      if (!opts.method || opts.method === 'GET') {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ records: [] }) });
      }
      posted.push({ url, body: opts.body });
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    const result = await bootstrapContent();
    // Local content (seed) was returned and pushed to Airtable
    expect(Array.isArray(result.worlds)).toBe(true);
    expect(result.worlds.length).toBeGreaterThan(0);
    expect(posted.some((p) => p.url.includes('AdLingo%20Content'))).toBe(true);
  });

  it('does NOT overwrite a present-but-invalid remote record', async () => {
    const writes = [];
    global.fetch = vi.fn((url, opts = {}) => {
      if (!opts.method || opts.method === 'GET') {
        return Promise.resolve({
          ok: true, status: 200,
          json: async () => ({ records: [{ id: 'rec1', fields: { 'Content JSON': '{bad json' } }] }),
        });
      }
      writes.push(opts.method);
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    const result = await bootstrapContent();
    expect(Array.isArray(result.worlds)).toBe(true); // falls back to local
    expect(writes).toHaveLength(0); // never wrote to Airtable
  });

  it('falls back to local content when Airtable is unreachable', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline'));
    const result = await bootstrapContent();
    expect(Array.isArray(result.worlds)).toBe(true);
  });
});

describe('persistContent', () => {
  it('writes the cache immediately and pushes to Airtable', async () => {
    global.fetch = vi.fn((url, opts = {}) => {
      if (!opts.method || opts.method === 'GET') {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ records: [] }) });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    const content = {
      worlds: [{ id: 'wP', name: 'P', order: 1, lessons: [] }],
      disciplines: [{ id: 'dP', name: 'PD', order: 1, videoUrl: 'x', questions: [] }],
    };
    const ok = await persistContent(content, 'alan@aditor.ai');
    expect(ok).toBe(true);
    expect(JSON.parse(localStorage.getItem('adlingo_course_data'))).toEqual(content.worlds);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/services/contentStore.test.js`
Expected: FAIL — `bootstrapContent` / `persistContent` are not exported.

- [ ] **Step 3: Implement bootstrapContent & persistContent**

In `src/services/contentStore.js`, add at the end:
```js
// Hydrate the cache at app start. Order of preference:
//   1. Valid remote content -> apply to cache.
//   2. No remote record at all -> seed Airtable from local content (one-time).
//   3. Remote record exists but is invalid -> use local, NEVER overwrite it.
//   4. Airtable unreachable -> use local cache/seed, touch nothing.
export async function bootstrapContent() {
  const remote = await fetchLiveContent();
  if (remote) {
    applyContent(remote);
    return remote;
  }
  try {
    const rec = await fetchLiveRecord();
    if (rec && rec.fields['Content JSON']) {
      // Present but failed validation — do not clobber it.
      return getLocalContent();
    }
    // Truly absent/empty — safe to seed from local content (edits or seed).
    const local = getLocalContent();
    await saveLiveContent(local, 'seed-migration');
    return local;
  } catch {
    // Unreachable — fall back to local, leave Airtable untouched.
    return getLocalContent();
  }
}

// Admin save path: update the cache instantly, then push to Airtable truth.
// Returns true only if the Airtable write succeeded.
export async function persistContent(content, adminEmail = 'admin') {
  applyContent(content);
  return await saveLiveContent(content, adminEmail);
}
```

- [ ] **Step 4: Run the full content-store suite**

Run: `npx vitest run src/services/contentStore.test.js`
Expected: PASS — all 12 tests pass.

- [ ] **Step 5: Run the whole test suite**

Run: `npm test`
Expected: PASS — courseData + contentStore suites all green.

- [ ] **Step 6: Commit**

Run:
```bash
git add src/services/contentStore.js src/services/contentStore.test.js
git commit -m "feat(content): bootstrapContent hydrates cache + seeds; persistContent saves"
```

---

## Task 7: Hydrate content at app startup (App.jsx)

Gate the first content render on `bootstrapContent()` so worlds/disciplines come from Airtable, with the spinner already shown during the existing load.

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Import bootstrapContent**

In `src/App.jsx`, change the services import line (line 3) to also import from contentStore. After the existing line 4 (`import { getStoredAuth, ... } from './services/auth';`) add:
```js
import { bootstrapContent } from './services/contentStore';
```

- [ ] **Step 2: Add a contentReady state**

In `src/App.jsx`, just after the `syncStatus` state (line 17), add:
```js
  const [contentReady, setContentReady] = useState(false);
```

- [ ] **Step 3: Hydrate content on mount**

In `src/App.jsx`, immediately after the "Flush any pending syncs" effect (the block ending at line 38), add:
```js
  // Hydrate course content from Airtable (source of truth) before rendering.
  useEffect(() => {
    bootstrapContent()
      .catch((err) => console.error('Content bootstrap failed:', err))
      .finally(() => setContentReady(true));
  }, []);
```

- [ ] **Step 4: Gate the initial render on contentReady**

In `src/App.jsx`, change the loading guard (currently `if (loading) {` at line 130) to:
```js
  if (loading || !contentReady) {
```

- [ ] **Step 5: Build to verify no errors**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 6: Manual verification**

Run: `npm run dev` and open the printed localhost URL. The app shows the spinner briefly, then the World Map renders with worlds AND the gold Disciplines card. Open DevTools console — no "Content bootstrap failed" error. (Airtable tables may not exist yet; in that case bootstrap falls back to local seed and still renders. That is expected until Task 9 setup.)
Expected: World Map renders content as before; no crash.

- [ ] **Step 7: Commit**

Run:
```bash
git add src/App.jsx
git commit -m "feat(content): hydrate course content from Airtable at app startup"
```

---

## Task 8: Reusable QuestionEditor component

Extracted so the new Disciplines tab can edit questions without duplicating the worlds editor or touching the existing (working) worlds tabs.

**Files:**
- Create: `src/components/QuestionEditor.jsx`

- [ ] **Step 1: Create the component**

Create `src/components/QuestionEditor.jsx`:
```jsx
import React from 'react';
import { Plus, Trash2, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { generateId } from '../data/courseData';

// Controlled editor for a list of quiz questions.
// Props: questions (array), onChange (newQuestions) => void
export default function QuestionEditor({ questions = [], onChange }) {
  const addQuestion = (type = 'text') => {
    const newQ = {
      id: 'q' + generateId(),
      type,
      question: '',
      options: [
        { text: '', correct: true, imageUrl: type === 'image' ? '' : undefined },
        { text: '', correct: false, imageUrl: type === 'image' ? '' : undefined },
        { text: '', correct: false, imageUrl: type === 'image' ? '' : undefined },
        { text: '', correct: false, imageUrl: type === 'image' ? '' : undefined },
      ],
      directorNote: '',
    };
    onChange([...questions, newQ]);
  };

  const updateQuestion = (qId, updates) =>
    onChange(questions.map((q) => (q.id === qId ? { ...q, ...updates } : q)));

  const deleteQuestion = (qId) =>
    onChange(questions.filter((q) => q.id !== qId));

  const updateOption = (qId, optIdx, field, value) =>
    onChange(
      questions.map((q) => {
        if (q.id !== qId) return q;
        const options = q.options.map((o, i) => {
          if (field === 'correct') return { ...o, correct: i === optIdx };
          return i === optIdx ? { ...o, [field]: value } : o;
        });
        return { ...q, options };
      })
    );

  return (
    <div>
      {questions.length === 0 && (
        <div className="text-center py-6 px-4 rounded-xl border border-dashed border-white/[0.08] mb-3">
          <FileText size={20} className="text-gray-700 mx-auto mb-2" />
          <p className="text-[12px] text-gray-500 mb-3">No questions yet — add your first.</p>
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q, qIdx) => (
          <div key={q.id} className="bg-[#111114] rounded-xl p-3 border border-white/[0.05]">
            <div className="flex items-start justify-between mb-2">
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${q.type === 'image' ? 'text-cyan-400 bg-cyan-400/10' : 'text-orange-400 bg-orange-400/10'}`}>
                {q.type === 'image' ? 'Image Q' : 'Text Q'} #{qIdx + 1}
              </span>
              <button onClick={() => deleteQuestion(q.id)} className="text-gray-600 hover:text-red-400 transition">
                <Trash2 size={12} />
              </button>
            </div>

            <textarea
              value={q.question}
              onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
              placeholder="Enter question..."
              rows={2}
              className="w-full px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35] resize-none mb-2"
            />

            <div className="space-y-1.5">
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-start gap-2">
                  <button
                    onClick={() => updateOption(q.id, optIdx, 'correct', true)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-1 transition ${opt.correct ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/[0.12] hover:border-gray-400'}`}
                  >
                    {opt.correct && <CheckCircle size={10} className="text-emerald-400" />}
                  </button>
                  <div className="flex-1 space-y-1">
                    <input
                      value={opt.text}
                      onChange={(e) => updateOption(q.id, optIdx, 'text', e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + optIdx)}...`}
                      className="w-full px-2 py-1 bg-[#17171B] border border-white/[0.08] rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]"
                    />
                    {q.type === 'image' && (
                      <input
                        value={opt.imageUrl || ''}
                        onChange={(e) => updateOption(q.id, optIdx, 'imageUrl', e.target.value)}
                        placeholder="Image URL..."
                        className="w-full px-2 py-1 bg-[#17171B] border border-white/[0.08] rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#8FB9E6]"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <textarea
              value={q.directorNote}
              onChange={(e) => updateQuestion(q.id, { directorNote: e.target.value })}
              placeholder="Director's Note (shown after answering)..."
              rows={2}
              className="w-full mt-2 px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35] resize-none"
            />
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => addQuestion('text')}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] text-[12px] font-semibold text-gray-300 hover:border-[#FF6B35]/50 hover:text-white hover:bg-[#FF6B35]/5 transition"
        >
          <Plus size={13} /> <FileText size={12} /> Text question
        </button>
        <button
          onClick={() => addQuestion('image')}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] text-[12px] font-semibold text-gray-300 hover:border-[#8FB9E6]/50 hover:text-white hover:bg-[#8FB9E6]/5 transition"
        >
          <Plus size={13} /> <ImageIcon size={12} /> Image question
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build to verify no errors**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add src/components/QuestionEditor.jsx
git commit -m "feat(admin): add reusable QuestionEditor component"
```

---

## Task 9: Disciplines tab in the admin portal + Airtable-backed save

Wire disciplines into the admin portal and route all saves (worlds + disciplines) through `persistContent`.

**Files:**
- Modify: `src/pages/Admin.jsx`

- [ ] **Step 1: Update imports**

In `src/pages/Admin.jsx`, replace the data import (line 8):
```js
import { getWorlds, saveWorlds, generateId } from '../data/courseData';
```
with:
```js
import { getWorlds, getDisciplines, generateId } from '../data/courseData';
import { persistContent } from '../services/contentStore';
import QuestionEditor from '../components/QuestionEditor';
```
Then add `Award` to the existing `lucide-react` import (line 4-7) icon list (used for the Disciplines tab icon).

- [ ] **Step 2: Add disciplines + saving state**

In `src/pages/Admin.jsx`, just after the `worlds` state (line 17 `const [worlds, setWorlds] = useState([]);`), add:
```js
  const [disciplines, setDisciplines] = useState([]);
  const [expandedDiscipline, setExpandedDiscipline] = useState(null);
  const [saving, setSaving] = useState(false);
```

- [ ] **Step 3: Load disciplines when authed**

In `src/pages/Admin.jsx`, replace the authed effect (lines 27-29):
```js
  useEffect(() => {
    if (authed) setWorlds(getWorlds());
  }, [authed]);
```
with:
```js
  useEffect(() => {
    if (authed) {
      setWorlds(getWorlds());
      setDisciplines(getDisciplines());
    }
  }, [authed]);
```

- [ ] **Step 4: Make handleSave persist to Airtable**

In `src/pages/Admin.jsx`, replace `handleSave` (lines 70-74):
```js
  const handleSave = () => {
    saveWorlds(worlds);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
```
with:
```js
  const handleSave = async () => {
    setSaving(true);
    const ok = await persistContent({ worlds, disciplines }, 'admin');
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert(
        'Saved on this device, but syncing to Airtable failed. ' +
        'Your changes are kept locally — check your connection and click Save again.'
      );
    }
  };
```

- [ ] **Step 5: Add discipline CRUD handlers**

In `src/pages/Admin.jsx`, just before the `// Theme presets` comment (line 233), add:
```js
  // Discipline CRUD (a discipline is a single lesson-like unit with questions)
  const addDiscipline = () => {
    const id = 'd' + generateId();
    setDisciplines([
      ...disciplines,
      {
        id,
        name: 'New Discipline',
        subtitle: '',
        coach: '',
        order: disciplines.length + 1,
        videoUrl: null,
        videoType: null,
        extraLinks: [],
        questions: [],
      },
    ]);
    setExpandedDiscipline(id);
  };

  const updateDiscipline = (id, field, value) =>
    setDisciplines(disciplines.map((d) => (d.id === id ? { ...d, [field]: value } : d)));

  const deleteDiscipline = (id) => {
    if (!confirm('Delete this discipline?')) return;
    setDisciplines(disciplines.filter((d) => d.id !== id));
  };
```

- [ ] **Step 6: Update the Save button label for the saving state**

In `src/pages/Admin.jsx`, in the Save button (lines 283-293), replace the button's children block:
```jsx
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Saved' : 'Save all'}
```
with:
```jsx
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save all'}
```
And add `disabled={saving}` to that same `<button onClick={handleSave} ...>` opening tag.

- [ ] **Step 7: Add the Disciplines tab button**

In `src/pages/Admin.jsx`, in the tab toggle row (after the `progress` TabButton, line 301), add:
```jsx
          <TabButton active={adminTab === 'disciplines'} onClick={() => setAdminTab('disciplines')} icon={Award} label="Disciplines" />
```

- [ ] **Step 8: Add the Disciplines tab panel**

In `src/pages/Admin.jsx`, immediately before the Progress tab block (`{adminTab === 'progress' && (`, line 700), add:
```jsx
      {/* Disciplines Tab — situational skills, edited like single lessons */}
      {adminTab === 'disciplines' && (
        <div className="max-w-3xl mx-auto p-4 space-y-4">
          <p className="text-gray-500 text-xs">Manage disciplines (situational skills). Each discipline is one video plus its quiz questions.</p>

          {disciplines.sort((a, b) => a.order - b.order).map((d) => (
            <div key={d.id} className="bg-[#111114] rounded-2xl border border-white/[0.06] overflow-hidden">
              <button
                onClick={() => setExpandedDiscipline(expandedDiscipline === d.id ? null : d.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.04] transition text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-xs font-black text-white">
                  {d.order}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{d.name}</div>
                  <div className="text-xs text-gray-500">{(d.questions || []).length} questions{d.coach ? ` · ${d.coach}` : ''}</div>
                </div>
                {expandedDiscipline === d.id ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
              </button>

              {expandedDiscipline === d.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06]">
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">Name</label>
                      <input
                        value={d.name}
                        onChange={(e) => updateDiscipline(d.id, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">Coach</label>
                      <input
                        value={d.coach || ''}
                        onChange={(e) => updateDiscipline(d.id, 'coach', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">Subtitle</label>
                      <input
                        value={d.subtitle || ''}
                        onChange={(e) => updateDiscipline(d.id, 'subtitle', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">Video URL (Loom, Tella, YouTube, Vimeo)</label>
                      <input
                        value={d.videoUrl || ''}
                        onChange={(e) => updateDiscipline(d.id, 'videoUrl', e.target.value || null)}
                        placeholder="https://www.tella.tv/video/..."
                        className="w-full px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">Video Type (tella, loom, youtube, vimeo)</label>
                      <input
                        value={d.videoType || ''}
                        onChange={(e) => updateDiscipline(d.id, 'videoType', e.target.value || null)}
                        placeholder="tella"
                        className="w-full px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Questions</h3>
                    <QuestionEditor
                      questions={d.questions || []}
                      onChange={(qs) => updateDiscipline(d.id, 'questions', qs)}
                    />
                  </div>

                  <button
                    onClick={() => deleteDiscipline(d.id)}
                    className="text-xs text-red-400/60 hover:text-red-400 transition"
                  >
                    Delete discipline
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addDiscipline}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-white/[0.08] text-gray-500 hover:border-yellow-500/60 hover:text-yellow-400 transition flex items-center justify-center gap-2 font-bold text-sm"
          >
            <Plus size={18} /> Add discipline
          </button>
        </div>
      )}
```

- [ ] **Step 9: Build to verify no errors**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 10: Manual verification**

Run: `npm run dev`, open `/admin`, enter the admin password (`404Error!`). Confirm:
1. A new **Disciplines** tab appears; it lists d1 Asset Workflow, d2 Podcast, and the two TBD slots.
2. Expanding a discipline shows name/coach/subtitle/video fields and its questions via the QuestionEditor.
3. Editing a discipline name then clicking **Save all** shows "Saving…" then "Saved".
Expected: all three behave as described; no console errors (Airtable write may fail until Task 10 setup — in that case the alert appears and the local edit persists, which is correct).

- [ ] **Step 11: Commit**

Run:
```bash
git add src/pages/Admin.jsx
git commit -m "feat(admin): Disciplines tab + persist worlds & disciplines to Airtable"
```

---

## Task 10: Airtable setup + end-to-end verification

This task is manual (Alan creates the schema) plus an end-to-end check. It is the only step that requires Airtable changes; do it once the code tasks are merged.

**Files:** none (Airtable UI + manual testing)

- [ ] **Step 1: Create the Airtable tables (Alan, in the Airtable UI)**

In base `appP65kN7D9LjbXb0`:
1. Create table **`AdLingo Content`** with fields: `Key` (Single line text), `Content JSON` (Long text), `Updated At` (Single line text), `Updated By` (Single line text).
2. Create table **`AdLingo Content Backups`** with fields: `Snapshot JSON` (Long text), `Saved At` (Single line text), `Saved By` (Single line text).
3. Confirm the PAT in `VITE_AIRTABLE_API_KEY` has data read/write on both tables.

- [ ] **Step 2: First-run seed**

Run `npm run dev`, open the app as a logged-in editor (or open `/admin`). On first load, `bootstrapContent` finds no `live` record and seeds it.
Verify in Airtable: `AdLingo Content` now has one row with `Key = live` and a populated `Content JSON`.
Expected: one seeded `live` record containing both worlds and disciplines.

- [ ] **Step 3: Cross-device truth check**

In `/admin` → Disciplines, change d1's name, click **Save all** (expect "Saved"). Then in a **different browser / incognito window**, open the app fresh.
Expected: the new d1 name appears — proving content now comes from Airtable, not per-browser localStorage.

- [ ] **Step 4: Backup check**

Make a second edit and save. Open `AdLingo Content Backups` in Airtable.
Expected: a new backup row whose `Snapshot JSON` is the content as it was BEFORE this save (i.e. the prior version), with `Saved At` / `Saved By` populated.

- [ ] **Step 5: Offline fallback check**

Temporarily set `VITE_AIRTABLE_API_KEY` to an invalid value, rebuild, and load the app.
Expected: the app still renders worlds + disciplines (from localStorage cache / seed) and does not crash. Restore the key afterward.

- [ ] **Step 6: Run the full test suite one last time**

Run: `npm test`
Expected: PASS — all suites green.

- [ ] **Step 7: Commit any notes / finish the branch**

If you updated the spec's setup checklist or added notes, commit them. Then use the finishing-a-development-branch skill to merge `feat/airtable-content-source-of-truth`.

---

## Self-Review Notes

- **Spec coverage:** schema (Task 10) · single-JSON-record store (Tasks 4-6) · backups-before-overwrite (Task 5) · admin-portal editing surface (Task 9) · Disciplines in admin (Tasks 8-9) · read-once-at-startup hydration (Task 7) · fallback ladder Airtable→cache→seed (Tasks 6-7) · one-time non-destructive seed migration (Task 6) · never-delete seed arrays (no task removes them). All spec sections map to a task.
- **Type consistency:** content blob shape `{ worlds: [], disciplines: [] }` is used identically across `applyContent`, `getLocalContent`, `fetchLiveContent`, `saveLiveContent`, `bootstrapContent`, `persistContent`, and the Admin `persistContent({ worlds, disciplines }, 'admin')` call. Field names `Content JSON` / `Snapshot JSON` / `Key` / `Updated At` / `Updated By` / `Saved At` / `Saved By` are consistent between the store and the Task 10 schema.
- **No placeholders:** every code step includes complete code; the only manual step (Task 10 Step 1) is an Airtable UI action with exact table/field names.
```
