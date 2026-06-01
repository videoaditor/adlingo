# Airtable as the Source of Truth for Course Content

**Date:** 2026-06-02
**Status:** Approved design (pending spec review)
**Author:** Alan Simon + Claude

## Problem

Course content (worlds, lessons, questions, **and** disciplines) currently lives in
the browser's `localStorage`, seeded from hardcoded arrays in
`src/data/courseData.js`. Two consequences:

1. **Disciplines are detached from the admin portal.** `src/pages/Admin.jsx` only
   imports `getWorlds` / `saveWorlds` and has zero references to disciplines. The
   `saveDisciplines()` accessor exists in `courseData.js` but is never called by any
   UI. So the "extra world" of disciplines (d1 Asset Workflow / Saskia, d2 Podcast /
   Nico, plus d3/d4 TBD placeholders) renders to learners but cannot be managed.
2. **Content is per-browser, not centralized.** Editing a world in the admin portal
   writes only to that one browser's `localStorage`. There is no shared source of
   truth. Airtable today stores **only per-player progress** (the `AdLingo Progress`
   field on the Players table), never the content itself.

## Goal

Make **Airtable the single source of truth** for all course content, edited through
the existing admin portal, shared across every browser and device.

## Hard Constraints

- **Never delete anything.** No dropping records, fields, the hardcoded seed content,
  or any player progress. Saves must be recoverable.
- **Airtable token cannot create schema.** The PAT has data read/write only (no
  `schema:write`). All new tables and fields are created **manually by Alan** in the
  Airtable UI; the app only reads/writes data.
- **Static site, no backend.** AdLingo runs as a Render static site; the client talks
  to Airtable directly. (Token is baked into the public bundle — acceptable because
  the tool is team-only today. See Security note.)
- Base: `appP65kN7D9LjbXb0` ("Aditor Member Sheet").

## Decisions (resolved during brainstorming)

| Fork | Decision |
| --- | --- |
| Editing surface | **Admin portal** stays the editor; saves persist to Airtable. |
| Storage shape | **Single JSON record** (one content blob), mirroring how progress is stored. |
| Save safety | **Timestamped backups** — snapshot prior version on every save (~last 10). |
| Read freshness | **Next page load / refresh** — fetch once at startup, cache, no polling. |

## Airtable Schema (created manually by Alan, once)

Two new tables in base `appP65kN7D9LjbXb0`:

### `AdLingo Content`
The live content. One canonical record.

| Field | Type | Notes |
| --- | --- | --- |
| `Key` | Single line text | Identifies the canonical record; value `"live"`. |
| `Content JSON` | Long text | Full blob: `{ "worlds": [...], "disciplines": [...] }`. |
| `Updated At` | Single line text | ISO timestamp of last save. |
| `Updated By` | Single line text | Admin email (e.g. `alan@aditor.ai`). |

### `AdLingo Content Backups`
Append-only history. Never edited or deleted by the app.

| Field | Type | Notes |
| --- | --- | --- |
| `Snapshot JSON` | Long text | The content blob **as it was before** a save. |
| `Saved At` | Single line text | ISO timestamp. |
| `Saved By` | Single line text | Admin email. |

The app reads these table/field names from constants in the data layer. If Alan names
them differently, only the constants change.

## Architecture

### Data layer (`src/data/courseData.js`)
Stays the **synchronous** read API the rest of the app already uses
(`getWorlds()`, `getDisciplines()`, `getWorldById()`, `getLessonById()`,
`getAllLessonIds()`, etc.). These continue to read from a `localStorage` cache, so
**no page component (WorldMap, Course, Lesson) needs to become async.**

New/changed responsibilities:
- A **bootstrap** step (async) fetches the `live` record from Airtable and writes the
  blob into the existing `localStorage` keys (`adlingo_course_data`,
  `adlingo_disciplines_data`) before the app renders content.
- `saveWorlds()` / `saveDisciplines()` continue to write the `localStorage` cache
  **and** trigger an async push to Airtable (live record + backup append).
- The hardcoded `SEED_WORLDS` / `SEED_DISCIPLINES` arrays **remain in the file** as the
  ultimate fallback — they are not removed.

### Airtable content service (`src/services/airtable.js` or a new `contentStore`)
New functions, parallel to the existing progress functions:
- `fetchLiveContent()` → returns `{ worlds, disciplines }` or `null` if the record is
  absent/unreachable.
- `saveLiveContent(content, adminEmail)` → appends the current live blob to
  `AdLingo Content Backups`, then upserts the `live` record with the new blob,
  `Updated At`, `Updated By`. Reuses the existing retry pattern used for progress sync
  (`savePlayerProgressWithRetry`) where practical.

### Read path (startup)
```
App boot
  └─ fetchLiveContent()
       ├─ success → write blob to localStorage cache → render
       ├─ record empty (first run) → run one-time seed migration (below)
       └─ Airtable unreachable → fall back to existing localStorage cache,
                                  then to hardcoded SEED_* arrays
```
Synchronous `getWorlds()` / `getDisciplines()` then serve from the cache as they do
today. **Fallback ladder, never blank:** Airtable → localStorage cache → hardcoded seed.

### Write path (admin save)
```
Admin clicks Save (worlds or disciplines)
  └─ update localStorage cache (instant, as today)
  └─ saveLiveContent(content, adminEmail)
       1. read current live blob
       2. append it to AdLingo Content Backups   (history)
       3. upsert live record with new blob        (truth)
  └─ on failure: keep localStorage change, surface a sync-failed indicator,
     retry (reuse progress retry queue pattern)
```
Only the admin (gated by the existing `VITE_ADMIN_PASSWORD` check) ever calls
`saveLiveContent`. Learners read only.

### One-time seed migration (no data loss)
On boot, if the `live` record **does not exist or has empty `Content JSON`**:
- Build the initial blob from the **current localStorage content if present**
  (preserves any edits already made in this browser), otherwise from the hardcoded
  `SEED_*` arrays.
- Write it to the `live` record.
- If the `live` record **already has content, never overwrite it via seeding.**

This is idempotent and safe to run on every boot.

## Admin Portal Changes (`src/pages/Admin.jsx`)

- Import `getDisciplines` / `saveDisciplines`.
- Add a **Disciplines** management section alongside Worlds: list d1–d4, edit
  name/subtitle/coach/videoUrl/videoType/extraLinks and their questions, reorder, and
  add new disciplines. Reuse the existing world/lesson/question editor components where
  possible.
- Saving any content (worlds or disciplines) routes through the new
  Airtable-persisting path.
- Optional polish (low priority): a small "last synced / sync failed" indicator,
  consistent with the existing progress sync status UI.

## Error Handling

- **Airtable read fails at boot:** silent fallback to cache → seed; app still works
  offline/read-only against the last known content.
- **Airtable write fails on save:** localStorage already updated so the admin sees their
  change; a visible sync-failed state + retry queue (reuse `setPendingSync` pattern)
  ensures the change eventually lands. No data is lost locally.
- **Malformed `Content JSON`:** `try/catch` parse; on failure fall back to cache then
  seed, and log — never crash the content pages.
- **Backups table missing/misconfigured:** the save still updates the live record; the
  backup append failure is logged and surfaced but does not block the primary save
  (content truth takes priority over history). This is revisited if it proves fragile.

## Testing

- Unit: `fetchLiveContent` parsing (valid blob, empty record, malformed JSON, network
  error → correct fallback).
- Unit: `saveLiveContent` ordering — backup append happens before live upsert; verify
  the prior blob is what gets archived.
- Unit: seed migration idempotency — empty record seeds; populated record is never
  overwritten; existing localStorage edits win over hardcoded seed.
- Manual: edit a world in admin on browser A → reload browser B → change appears.
- Manual: edit a discipline in admin → appears for a learner on next load.
- Manual: simulate Airtable down → app still renders content from cache/seed.

## Security Note (carried forward, not solved here)

The Airtable PAT and admin password are baked into the public JS bundle (static-site
trade-off, acceptable while team-only). This change **expands** what the in-bundle token
can write (content, not just progress). Before any non-team rollout: stand up the
planned Express backend, move the token server-side, switch the client to `/api/*`, and
scope the PAT to base `appP65kN7D9LjbXb0` only. Out of scope for this spec but recorded.

## Out of Scope

- Editing content directly in the Airtable grid (relational Worlds/Lessons/Questions
  tables). Rejected in favor of single-JSON-record + admin-portal editing.
- Near-real-time content updates / polling.
- The backend/token-hardening migration (tracked separately).

## Manual Setup Checklist for Alan (before/at rollout)

1. In base `appP65kN7D9LjbXb0`, create table **`AdLingo Content`** with fields `Key`,
   `Content JSON` (long text), `Updated At`, `Updated By`.
2. Create table **`AdLingo Content Backups`** with fields `Snapshot JSON` (long text),
   `Saved At`, `Saved By`.
3. (Optional) Add one row to `AdLingo Content` with `Key = live` and empty
   `Content JSON` — or let the app's first-run migration create/seed it.
4. Confirm the PAT has data read/write on these tables.
