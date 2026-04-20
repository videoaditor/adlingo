# AdLingo ↔ Hub integration

**Goal.** Hub surfaces outstanding AdLingo training to editors — both as a persistent progress card on the dashboard and as a top-of-page notification banner. AdLingo stays the source of truth for progress; Hub is the reminder/CTA surface.

**Audience.** Engineers working on either repo, or on the shared Airtable base.

---

## 1. Architecture at a glance

```
  ┌─────────────┐      writes          ┌──────────────┐       reads           ┌──────┐
  │  AdLingo    │ ───────────────────▶ │   Airtable    │ ────────────────────▶ │ Hub  │
  │ (progress)  │   Players table      │  (source of   │   Players table      │      │
  └─────────────┘                      │   truth)      │                       └──────┘
                                       └──────────────┘
```

- AdLingo writes the full progress blob on every quiz completion.
- Hub reads that blob on dashboard load and derives both the training card and the notification banner from it.
- There is **no direct AdLingo ↔ Hub call** — Airtable is the only interface. That keeps the two apps decoupled and avoids CORS/auth plumbing.

---

## 2. What AdLingo writes to Airtable

On every quiz completion, AdLingo PATCHes the editor's row in the **`Players`** table (base `appP65kN7D9LjbXb0`, table `tblJ2RgdTVX5zdgTc`):

| Field | Type | What it contains |
|-------|------|-------------------|
| `AdLingo Progress` | Long text (JSON) | Full progress blob — see shape below |

The JSON shape:

```json
{
  "completedLessons": ["l1", "l2", ...],
  "scores": { "l1": { "correct": 4, "total": 4 }, ... },
  "xp": 120,
  "streak": 3,
  "lastActivity": "2026-04-18T14:22:00.000Z"
}
```

Lesson IDs match the convention in `src/data/courseData.js`. Current roster:

| World | Lesson IDs |
|-------|-----------|
| w1 Editing Town | l1, l2, l3 |
| w2 AI Toolkit | l4, l5, l6, l7, l8 |
| w3 Working Faster | l9, l11, l12 |
| w4 Ad Anatomy | l10, l13, l14, l15 |

Hub's `ADLINGO_WORLDS` constant in `app.js` mirrors this. **When lessons are added or moved in AdLingo, update both sides** — the hub uses its copy to compute "current world", "worlds complete" (which feeds stage auto-sync), and the "all complete" check. An out-of-sync roster silently miscounts progress (e.g. people finishing l15 appearing stuck in w4 forever, or the reverse — looking fully trained when they're not).

---

## 3. What Hub reads

On dashboard entry, Hub calls Airtable once:

```
GET https://api.airtable.com/v0/appP65kN7D9LjbXb0/<players-table>?filterByFormula={Email}="<editor-email>"&maxRecords=1
```

From the returned record it extracts `AdLingo Progress` (parses JSON) plus `Name`, `Rank`, `Trust Score` for the profile card. See `fetchAirtableProfile()` in the hub `app.js`.

If the fetch fails or the record is missing, the training card and AdLingo notification are skipped silently — the rest of the dashboard still renders.

---

## 4. Two surfaces Hub renders

### a) Training banner (always-on, dashboard card)

`renderAdLingoTrainingBanner()` renders a card above the stats row showing the current (first incomplete) world, lesson count, and progress bar. Clicking it deep-links into AdLingo. All worlds complete → shows a green "Training Complete" card instead.

### b) Notification banner (urgency/motivation, top of page)

`computeAdLingoNotification()` derives a synthetic notification from the same progress blob and prepends it to the `notificationsCache` array, so it renders through the existing `#notification-banner` UI alongside any admin-pushed notifications.

**Rules** (evaluated top-down, first match wins):

| State | Condition | Type | Title | Message |
|-------|-----------|------|-------|---------|
| All complete | `completedLessons.length >= totalLessons` | — | *(no notification)* | — |
| Snoozed | Dismissed in last 24h (localStorage) | — | *(no notification)* | — |
| Not started | `completedLessons.length === 0` | `warning` | "Don't get demoted to trainee" | "Start your AdLingo training to keep your rank and unlock higher-tier work." |
| Stale | `lastActivity` ≥ 14 days ago, partial progress | `warning` | "You're at risk of demotion to trainee" | "It's been N days. Jump back into {World} to keep your rank." |
| In progress | Any other partial progress | `training` | "You have an open training: {World name}" | "Continue where you left off." |

Every synthetic notification has:
- `id` prefixed `adlingo-synth-*` — used by the dismiss handler to route to localStorage snooze instead of the DB.
- `action_url`: `https://adlingo.onrender.com/?email=<url-encoded-email>` (auto-login via the `?email=` query param — see [App.jsx:40](../src/App.jsx:40)).
- `action_label`: CTA text ("Start training" / "Resume training" / "Continue").

### Why no DB row for synthetic notifications?

The `editor_notifications` table requires a `user_id` FK to `auth.users`, and the copy depends on live progress that changes as the editor works. Storing derived state in the DB would rot immediately. Computing client-side on every dashboard load keeps the message always-fresh and avoids a stale-row cleanup job.

Dismissing a synthetic notification writes an expiry timestamp to `localStorage['adlingo_notif_snooze_until']`. Next dashboard load within 24h skips the notification; after that it recomputes from current progress.

---

## 5. Motivation framing (why the rank threats)

Aditor's editor progression is Trainee → Verified → Veteran (Supabase `stage` column), with rank (Bronze / Silver / Gold) layered on top. `autoSyncStageFromTraining()` in the hub already derives stage from completed-worlds count:

- 0–1 worlds complete → Stage 1 (Trainee)
- 2+ worlds → Stage 2 (Verified)
- All 4 worlds → Stage 3 (Veteran)

So the "demoted to trainee" copy isn't just motivational — it reflects the actual gate. An editor who doesn't train stays Stage 1 and misses out on higher-tier cards and pay. The notification copy leans into that stake.

---

## 6. Extension ideas (not implemented)

- **Scheduled email/Slack nudges** — Airtable view filtered on "progress JSON indicates stale/not-started" → Airtable Automation → Slack DM. Low-effort, doesn't need hub-side cron.
- **Streak-at-risk notification** — fire if `streak >= 3` and `lastActivity` is yesterday. Requires a non-dismissible daily trigger to be useful; defer until there's demand.
- **New-content notification** — when course authors ship a new world, bump a `courseVersion` localStorage key and show "New lessons dropped" until acknowledged.
- **Promotion-ready chip** — when `completedLessons.length === totalLessons` but `rank` is still Unranked/Bronze, show a one-time "Training complete — ask Alan about promotion" chip in the profile area.

---

## 7. Test plan

1. Pick a test editor email in the Airtable `Players` table.
2. Clear their `AdLingo Progress` → log into Hub → **"Don't get demoted to trainee"** banner shows.
3. In AdLingo, complete one lesson → reload Hub → **"You have an open training: {World}"** banner shows.
4. Click the banner → lands in AdLingo auto-logged-in.
5. Complete all lessons across all worlds → reload Hub → no banner.
6. Dismiss any synthetic banner → reload within 24h → banner gone. Wait >24h or clear `localStorage['adlingo_notif_snooze_until']` → banner returns.
7. Manually edit `AdLingo Progress.lastActivity` to 15 days ago while keeping partial `completedLessons` → reload Hub → **"You're at risk of demotion to trainee"** banner shows.

---

## 8. Files touched

**Hub** (`/Users/alansimon/aditor-hub/app.js`):
- `ADLINGO_WORLDS` — lesson → world mapping (keep in sync with AdLingo `courseData.js`)
- `renderAdLingoTraining()` / `renderAdLingoTrainingBanner()` — dashboard card
- `computeAdLingoNotification()` — synthetic notification rules
- `loadNotifications()` — prepends synthetic notif to `notificationsCache`
- `dismissNotification()` — routes `adlingo-synth-*` IDs to localStorage snooze
- `autoSyncStageFromTraining()` — stage derivation from training progress

**AdLingo** (`src/services/airtable.js`): writes the `AdLingo Progress` JSON field. No hub-specific code.
