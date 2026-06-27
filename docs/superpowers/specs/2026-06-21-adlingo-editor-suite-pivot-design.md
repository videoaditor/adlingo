# AdLingo Editor-Suite Pivot — Master Design Spec   ·   Größe: L (split into phases)

> Master/architecture doc. The buildable unit is **Phase 1** →
> [`2026-06-21-adlingo-foundation-phase1-design.md`](./2026-06-21-adlingo-foundation-phase1-design.md).
> Later phases are seeded into `ROADMAP.md` and become their own specs when their
> prerequisites (P0 provisioning) are met. Section headers follow the loop template;
> content is English to match the repo (README, HUB_INTEGRATION, PRD).

## Warum
AdLingo today is **single-tenant and internal-only**: an editor logs in by email, which is
looked up directly in the **`Players`** table — the *same* table **dispatch** reads to decide
who gets work. We want AdLingo to stay our internal training tool **and** become a sellable
**editor suite**: Whop-paying brand owners train and compare *their own* freelancers on the
same universal curriculum, minus our internal-only content. We can then truthfully say "this is
the exact training our team goes through."

The load-bearing constraint, stated by Alan as a "crucial fuck-up to avoid at all costs":
**external freelancers must never enter the internal Players/dispatch database.** This spec
defines the target **data architecture** and a phased path that adds it *alongside* the live
system without migrating or risking existing data.

## Was
A multi-tenant data model + auth supporting **three viewer kinds** (internal editor, brand
owner, brand editor); a curriculum that can **exclude internal-only worlds** for external
accounts; **Whop-billing-derived access** that works both inside the Whop iframe and on the
standalone site; brand-owner org management (invite by email, see accepted vs pending, see
progress + accuracy); and a premium **co-branded** look. All added behind flags, default =
today's behavior, with **zero destructive change** to live data. Delivered in phases; **Phase 1
(Foundation) is the first buildable spec**, chosen because everything else depends on it and it
is the safety layer that protects live data.

## Grenzen
- **Muss:**
  - External orgs + freelancers live in **new tables** (`Brands`, `BrandEditors`) in the *same*
    Airtable base. **Dispatch keeps reading only `Players`.**
  - Curriculum **audience filter**: worlds tagged `internal` are excluded for `universal`
    (external) viewers; disciplines stay universal.
  - External account `active` state **derives from Whop billing** (in-iframe via signed token,
    standalone via OAuth) — must work *with and without* the Whop iframe.
  - **Co-branded** "Powered by Aditor" — store name + logo per brand only.
  - **Non-disruption:** no destructive change to `Players` or the progress-JSON shape; all new
    behavior flag-gated (default = current internal behavior); keep the live static site working
    until the backend cutover is verified.
- **Darf nicht:**
  - Never write a `BrandEditor` into `Players`. Never let `getAllPlayers()` / dispatch include
    external people. (This is an *invariant*, enforced by a test — see Phase 1.)
  - No product surface beyond what each phase specs. No unrequested dependencies.
  - Once external users exist, **no secrets in the browser bundle** (Airtable PAT, Whop secret,
    admin password).
- **Out of Scope (YAGNI):** extending Aditor "editor tools" access to invited emails (we *store*
  the data to enable it later, but don't build it now); Supabase/Firestore migration; full
  white-label theming; touching the `Training` table `tblmOSnZKy8l4vJIG` (purpose unconfirmed —
  verify before any use).

## Ausgangslage
Existing architecture (the files this pivot touches):
- **Auth / login:** [src/services/auth.js](../../../src/services/auth.js) (admin pw compared in
  bundle), [src/App.jsx:40](../../../src/App.jsx) (`?email=` auto-login from hub),
  [src/pages/Login.jsx](../../../src/pages/Login.jsx) (email → `findPlayerByEmail`).
- **Data access:** [src/services/airtable.js](../../../src/services/airtable.js) — base
  `appP65kN7D9LjbXb0`, `Players` `tblJ2RgdTVX5zdgTc`, progress JSON
  `{completedLessons, scores{correct,total}, xp, streak, lastActivity}`; `getAllPlayers()`
  (admin), `savePlayerProgressWithRetry`, `mergeProgress`.
- **Curriculum:** [src/data/courseData.js](../../../src/data/courseData.js) — `SEED_WORLDS`
  (w1–w4) + `SEED_DISCIPLINES`; localStorage-backed, admin-editable; `getWorlds()`,
  `getAllLessonIds()`. **Worlds have no `audience` field today.** Seed versioning via
  `CURRENT_SEED_VERSION`.
- **Render:** [src/pages/WorldMap.jsx](../../../src/pages/WorldMap.jsx) (world/lesson gating via
  `unlockAfterWorld`), [src/pages/Admin.jsx](../../../src/pages/Admin.jsx) (Progress tab reads
  `getAllPlayers`).
- **Dormant backend:** [server/index.js](../../../server/index.js) + the `/api/*` contract
  documented in [README.md](../../../README.md) (proxy holds the PAT, rate-limits, debounces
  writes, issues admin bearer tokens). **Prod currently bypasses it** (static site → direct
  Airtable; secrets in bundle — explicitly accepted as "team-only, low risk").
- **Cross-repo coupling (LANDMINE):** `aditor-hub/app.js` mirrors the world→lesson map
  (`ADLINGO_WORLDS`) and derives editor **stage** (Trainee/Verified/Veteran) from completed-world
  count (see [docs/HUB_INTEGRATION.md](../../HUB_INTEGRATION.md)). **Adding or reordering worlds
  changes internal dispatch stage math** unless the hub is updated in lockstep.
- **Whop integration primitives** (researched against docs.whop.com, 2025/2026):
  - iframe identity: `x-whop-user-token` header → `whopSdk.verifyUserToken(headers)` → `{userId}`
    (needs app id + app API key, server-side).
  - entitlement: `whopSdk.access.checkIfUserHasAccessToAccessPass({accessPassId, userId})` →
    `hasAccess` boolean (REST equivalent: `checkAccess` → `access_level` customer|admin|no_access).
  - webhooks: `membership_went_valid` / `membership_went_invalid` (+ `payment_failed`), verified
    via Standard Webhooks / `whopSdk.webhooks.unwrap(body, {headers})`, secret `WHOP_WEBHOOK_SECRET`.
  - standalone login: OAuth 2.1 + PKCE (`GET /oauth/authorize`, `POST /oauth/token`, scopes
    `openid profile email`), then the same entitlement check.
  - app is created in the Whop dashboard (company locked at creation); `@whop-apps/dev-proxy` for
    local; rate-limit → HTTP 429 + ~60s cooldown; no separate sandbox env.

## Target data architecture  (the core deliverable Alan asked for)

### Tables — Airtable base `appP65kN7D9LjbXb0` (one base, new tables; token has no schema:write → Alan creates them, P0)
| Table | Status | Who | Key fields |
|---|---|---|---|
| **`Players`** `tblJ2RgdTVX5zdgTc` | existing, **unchanged** | internal editors ONLY | Name, Email, Rank, Trust Score, Gold, `AdLingo Progress` (JSON). **Dispatch reads only this.** |
| **`Brands`** | NEW | one row per Whop-paying org | `Name`, `Owner Email`, `Whop User ID`, `Whop Membership ID`, `Whop Access Pass ID`, `Status` (active\|inactive), `Logo URL`, `Seats?`, `Created At` |
| **`BrandEditors`** | NEW | external freelancers | `Brand` (link→Brands), `Email`, `Name`, `Status` (pending\|active\|removed), `Invited At`, `Accepted At`, `Invite Token`, `Last Active`, **`AdLingo Progress` (JSON — identical shape to Players)** |

- `BrandEditors` is the **external mirror of `Players`** — same progress shape so all progress
  code (`mergeProgress`, scoring, XP, streak) is reused — but a **physically separate table**.
  Pending invite = a `BrandEditors` row with `Status=pending` (360Learning model); accepting sets
  `active` + `Accepted At`.
- **Separation guarantee:** dispatch + `getAllPlayers()` are bound to the `Players` table id only;
  the external store writes to `BrandEditors` only. The two never join. Enforced by an invariant
  test (Phase 1, T-guard).

### Viewer / entitlement model  (pure code module — single source of identity)
```
Viewer = {
  kind: 'internal' | 'brand_owner' | 'brand_editor',
  email,
  audience: 'internal' | 'universal',        // drives the curriculum filter
  orgId: brandId | null,
  whopUserId: string | null,
  entitlementActive: boolean,                 // internal: always true; external: from Whop billing
  record: { table: 'Players' | 'BrandEditors', id }
}
```
- **internal** → `audience:'internal'` (sees Home Base + everything). Entry: email login /
  `?email=`. **No Whop call** — internal works even if Whop is down.
- **brand_owner** → manages org, sees the manager dashboard. Entry: Whop iframe token *or*
  standalone Whop OAuth; `entitlementActive` from Whop billing.
- **brand_editor** → `audience:'universal'` (no internal world). Access valid only while the parent
  `Brands.Status = active` (i.e. the owner's Whop billing is live).

### Curriculum audience filter  (the "exclude internal world" mechanic)
- Add to the world shape: `audience: 'internal' | 'universal'` (**default `'universal'`**) and
  `countsTowardStage: boolean` (**default `true`**).
- `getCurriculumForAudience(audience)` drops `internal` worlds for `universal` viewers. Disciplines
  remain universal. Pure, unit-tested.
- The new internal world **"Home Base"** (working name) = `audience:'internal'`,
  `countsTowardStage:false` → excluded from external curricula **and** from the hub's stage math,
  so adding it does **not** shift internal dispatch eligibility. Hub `ADLINGO_WORLDS` is updated in
  lockstep (P1 task + HUB_INTEGRATION note).

### Auth / Whop  (billing = source of truth, works with & without the iframe)
- Backend (`server/index.js`, deployed as a Render **Web Service**) holds the Airtable PAT, admin
  pw, Whop app key, and webhook secret. Client talks to `/api/*` (contract already in README).
- `GET /api/account/me` resolves the **Viewer**: internal = Players lookup (existing); external =
  Whop verify (iframe `x-whop-user-token` *or* OAuth) → entitlement check → Brands/BrandEditors
  lookup.
- `POST /api/whop/webhook`: `membership_went_valid|invalid` → flip `Brands.Status` → cascades to
  that brand's editors. Keeps account state in sync with billing without polling.

### World order  (LOCKED 2026-06-21; admin can still reorder — low blast radius)
1. **Editing Town** [universal] — first wow (editing)
2. **AI Toolkit** [universal] — second wow (AI)
3. **Home Base** [internal · no-stage] — logins, how we structure projects, claiming cards,
   "we've got you" ← **excluded for external** *(name locked: "Home Base")*
4. **Working Faster** [universal] — cards down to 2h, claim your first cards in week 1
5. **Ad Anatomy** [universal] + **Disciplines** [universal]

External curriculum = worlds 1, 2, 4, 5 + Disciplines. (Internal sees all five.)

### Home Base content  (internal world 3)
Provided by Alan 2026-06-21. **Completion gate decided: keep quizzes**; Claude drafted them from the
Tella transcripts → full content + quizzes in
[`2026-06-21-home-base-content.md`](./2026-06-21-home-base-content.md) (awaiting Alan's taste review).
| # | Lesson (id) | Video | Status |
|---|---|---|---|
| 1 | How to log into the shared mail (l16) | `…/how-to-log-into-playeraditorai-3whj` (Tella) | ready · 3-Q quiz drafted |
| 2 | How to get projects — the dispatcher, *with Tim* (l17) | `…/dispatcher-1-cxn3` (Tella) | ready · 4-Q quiz drafted |
| 3 | How to bill your work — autobilling (l18) | — | **coming soon** → `videoUrl:null`, excluded from progress |

- Lesson 3 follows the `d4` TBD pattern (`videoUrl:null` + empty `questions`) so it does **not** drag
  the progress denominator — needs the world-lesson denominator fix (Phase 1 T1b), since world lessons
  (unlike disciplines) are currently always counted.

### "What's new" content feed  (P5 — makes the brand owner feel on top of things)
When **we** (Aditor) ship a new lesson/discipline, brand owners and editors see a **status /
notification** — "new content dropped" — written in a playful, hype one-liner voice (Minecraft
patch-notes energy, e.g. *"let's see what the boys do with Seedance 2.0"*). Derive "new since you
last visited" from the existing seed-version pattern (`CURRENT_SEED_VERSION` bump) + an optional
`publishedAt` on lessons + a per-viewer "last seen version" — **no heavy new table.** The one-liner
copy is authored by us per drop (a small `announcements` seed list). The hub already floated this
("New-content notification — bump a courseVersion key"; see HUB_INTEGRATION §6).

## Phases  (each becomes its own spec / ROADMAP item)
- **P0 — Provisioning** *(Alan, manual — prerequisite, not night-loop-able)*: create
  `Brands` + `BrandEditors` tables/fields in Airtable; create the Whop app + access pass + API key
  + webhook; create the Render Web Service + env vars. → Stop & Eskalation gate for everything that
  touches live infra.
- **P1 — Foundation** *(FIRST; code-only, flag-gated, no infra, no live writes)*: audience model +
  curriculum filter + Viewer resolver + external data-access **contract** (faked + tested) +
  backend Whop/auth **logic** (pure, tested, not deployed) + separation invariant test + add a
  test runner. → child spec
  [`2026-06-21-adlingo-foundation-phase1-design.md`](./2026-06-21-adlingo-foundation-phase1-design.md).
- **P2 — Backend cutover**: deploy the proxy, move secrets server-side, switch the client to
  `/api/*`, keep the static path as fallback until verified. (Depends P0.)
- **P3 — External onboarding**: Whop iframe + standalone OAuth; create a `Brand` on first owner
  login; invite-by-email + accept flow; `brand_editor` login gated by Whop billing. (Depends P0,P1,P2.)
- **P4 — Manager dashboard (zero-config).** **Nothing for the brand owner to set up** — it just
  runs. They can check on their editors anytime (roster ranked by completion % / accuracy, accepted
  vs pending, per-learner drill-down), while accountability happens **automatically**: auto-reminders
  to stalled editors + an automatic digest to the owner (no toggles, no schedules to configure). The
  whole point is "feel on top of things." (Research Tier-1 + auto-accountability — maps onto existing data.)
- **P5 — Premium + "what's new" + retention.** Co-branded premium polish (benefits the internal team
  too); the **"what's new" content feed** (hype one-liner notifications when we ship lessons, see
  above); streak surfacing + freeze; completion certificates. (Research Tiers 2–3; streak = biggest
  moat vs LMSs.)

## Done  (master — design-level)
The master is a design doc; build-Done lives in each phase spec. Master is "done" when:
- Alan taste-approves the architecture + world taxonomy at the gate (recorded in the digest), AND
- the Phase 1 spec exists and is seeded as a `ready` item in `ROADMAP.md`.

## Stop & Eskalation
Night-loop must STOP (not guess) and write to the report when:
- it would need to create Airtable tables/fields, the Whop app, or deploy infra (all P0, Alan-only);
- the hub stage math can't be coordinated for the new internal world (don't silently change
  internal dispatch eligibility);
- Whop's token/billing/webhook contract behaves differently than the researched primitives;
- **any** code path could write a `BrandEditor` into `Players`, or include external people in
  `getAllPlayers()` / dispatch (hard invariant);
- the internal-vs-universal classification of a piece of content is ambiguous beyond the proposed
  split;
- the same build error recurs twice despite a fix attempt.

## Doctrine-Gate
- [x] **M1** Spec-first: Purpose + Non-Goals/YAGNI explicit; altitude is design-level for the
  master and task-level in the Phase 1 child (split per L-rule).
- [x] **M2** Start simple: same base + new tables (not a new DB); reuse the existing `/api/*` proxy
  (already built) instead of a new backend; co-branded (name+logo) not full white-label; Phase 1 is
  pure code with no infra. Each tool/dependency (Whop SDK, vitest) has a forcing reason.
- [x] **M3** Loop-first: `Done` is machine-checkable in the Phase 1 child; `Stop & Eskalation`
  explicit; provisioning fenced off as P0.
- [x] **1 State:** Single source of truth named — Airtable base `appP65kN7D9LjbXb0`; `Players` =
  internal SoT (durable-first), `Brands`/`BrandEditors` = external SoT; **Whop billing = SoT for
  external entitlement**. Account state mirrored from Whop via webhooks.
- [x] **2 Separation of Concerns:** audience filter, Viewer resolver, external store, and Whop
  entitlement are isolated pure modules, unit-testable without a server/browser.
- [x] **3 Idempotenz:** table creation is additive; seed-version bump re-seeds safely; webhook
  handlers key on Whop membership id (re-delivery → same state, no dupes); invites keyed by
  (Brand, Email).
- [x] **4 Coupling:** contracts explicit + versioned — progress-JSON shape shared by Players &
  BrandEditors; world shape gains `audience`/`countsTowardStage`; hub `ADLINGO_WORLDS` kept in sync;
  Whop token/webhook contract documented in Ausgangslage.
- [x] **5 Context Window:** work segmented into phases + per-phase specs; the master stays a sketch.
- [x] **6 Error-Taxonomie:** Whop 429 → backoff (60s cooldown); token invalid/expired → re-auth;
  billing inactive → deny + friendly upsell; Airtable 429/5xx → existing retry queue; webhook bad
  signature → reject. Per-class behavior named in Phase 1 / P3.
- [x] **7 Defensive Design:** flag-gated, default = current behavior; static site stays up during
  cutover (fail-and-recover, no big-bang); separation invariant is a tripwire test.
- [x] **F1 Richtiger Hebel:** we sharpened the data contracts + spec first; no model/prompt tuning
  involved (not an LLM feature).
- [x] **Tests:** Phase 1 adds a test runner (vitest) and pure-function tests for the audience
  filter, Viewer resolver, entitlement decision, webhook→status mapping, and the separation
  invariant.
