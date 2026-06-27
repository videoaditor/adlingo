# AdLingo Pivot — Phase 1: Foundation   ·   Größe: M

> Child of [`2026-06-21-adlingo-editor-suite-pivot-design.md`](./2026-06-21-adlingo-editor-suite-pivot-design.md).
> **Code-only, flag-gated, no infrastructure, no live-data writes.** This phase makes the codebase
> *ready* for multi-tenant + Whop without changing one byte of production behavior. Provisioning
> (Airtable tables, Whop app, Render Web Service) is **P0 — Alan's manual prerequisite** and is a
> Stop & Eskalation here.

## Warum
Everything in the pivot depends on three abstractions that don't exist yet: an **audience-aware
curriculum**, a **Viewer identity model**, and a **separate external store**. Building these as
pure, tested modules first de-risks every later phase and — critically — installs the **separation
invariant** (external people can never reach `Players`/dispatch) as code before any external data
exists. It also protects live data: nothing here writes to Airtable or changes prod.

## Was
Pure modules + tests that:
1. tag worlds with `audience` and filter the curriculum by it;
2. resolve a `Viewer` (defaulting today's email→Players flow to `kind:'internal'`);
3. define the external store **contract** (Brands/BrandEditors/invites) with an in-memory fake;
4. hold Whop auth/entitlement **logic** as pure functions (token-claims → decision, webhook →
   status), mocked, not wired to the network;
5. assert the **separation invariant** with a test;
6. add a test runner so `Done` is machine-checkable.

Production behavior is **unchanged**: internal users still log in by email and see all worlds;
no `/api/*`, no Whop calls, no new tables touched at runtime.

## Grenzen
- **Muss:** pure ES modules under `src/` (and `server/` for Whop logic); default flags = current
  behavior; `getCurriculumForAudience('internal')` returns exactly today's world set; new world
  field `audience` defaults to `'universal'` so existing seeds are unaffected; everything covered by
  unit tests.
- **Darf nicht:** call Airtable or Whop over the network; deploy anything; modify `Players` reads
  in a way that changes current output; write `BrandEditors`/`Brands` to real Airtable; add the
  Home Base *content* (that's P3/curriculum authoring — here we only add the field + a fixture).
- **Out of Scope (YAGNI):** real Airtable wiring for the external store; the manager dashboard UI;
  email sending; OAuth redirect plumbing; premium redesign.

## Ausgangslage
- World shape + accessors: [src/data/courseData.js](../../../src/data/courseData.js) —
  `SEED_WORLDS`, `getWorlds()`, `getAllLessonIds()`, seed-version pattern (`CURRENT_SEED_VERSION`).
  Follow this module's existing export style.
- Progress shape + Airtable table constant: [src/services/airtable.js](../../../src/services/airtable.js)
  (`TABLE='Players'`, progress JSON shape, `mergeProgress`). Reuse the shape; **do not** broaden
  `getAllPlayers()`.
- Auth surface: [src/services/auth.js](../../../src/services/auth.js) (export names callers depend
  on). New Viewer module sits beside it.
- Backend: [server/index.js](../../../server/index.js) — add a `server/whop/` folder of pure
  functions; **don't** mount new routes in this phase (logic only, tested in isolation).
- No test runner exists (see [package.json](../../../package.json)) → add **vitest** (pairs with
  the existing Vite 7 + ESLint setup).

## Tasks  (each = one reviewable commit)
- **T0 — Test runner.** Add `vitest` (devDep) + `"test": "vitest run"` and `"test:watch"` scripts;
  minimal `vitest.config.js`. · Files: `package.json`, `vitest.config.js`, `src/__tests__/smoke.test.js`
  · **Verifiziert:** `npm test` runs and the smoke test passes.
- **T1 — Audience model + curriculum filter.** Add `audience:'internal'|'universal'` (default
  `'universal'`) and `countsTowardStage:boolean` (default `true`) to the world shape; add a pure
  `getCurriculumForAudience(audience, {worlds, disciplines})` that drops `internal` worlds for
  `'universal'` **and re-links the unlock chain** — each surviving world's `unlockAfterWorld` is
  rewritten to the nearest preceding *surviving* world (or `null`), so removing a mid-chain internal
  world can't leave a dangling `unlockAfterWorld` (today's `isWorldUnlocked` treats a missing prev as
  "unlocked", which would wrongly unlock everything for external). Bump `CURRENT_SEED_VERSION`. Seed
  the **real Home Base world** at order 3 (shifting Working Faster→4, Ad Anatomy→5; internal chain
  w1→w2→w5→w3→w4) per [`2026-06-21-home-base-content.md`](./2026-06-21-home-base-content.md):
  lessons l16 & l17 **with their drafted quizzes**, l18 (autobilling) as a `videoUrl:null` "coming
  soon" placeholder.
  · Files: `src/data/courseData.js`, `src/data/__tests__/curriculum.test.js`
  · **Verifiziert:** tests prove (a) `'universal'` excludes Home Base and the surviving world-id set
  equals today's; (b) `'internal'` includes Home Base with l16 (3 questions) + l17 (4 questions) + the
  l18 placeholder; (c) after filtering, no surviving world has an `unlockAfterWorld` pointing at a
  dropped world (external: Working Faster re-links to AI Toolkit).
- **T1b — World-lesson progress denominator fix.** In `getAllLessonIds()` (and any world-progress %
  calc), exclude world lessons with no `videoUrl` *and* no `questions`, mirroring the discipline
  `.filter(d => d.videoUrl)` rule, so "coming soon" placeholders don't peg users below 100%.
  Behavior-preserving for existing data (no current world lesson is video-less).
  · Files: `src/data/courseData.js`, `src/data/__tests__/curriculum.test.js`
  · **Verifiziert:** test: a null-video placeholder world lesson is absent from `getAllLessonIds()`;
  the existing w1–w4 lesson-id set is unchanged.
- **T2 — Viewer resolver.** New pure module `src/services/viewer.js` exporting `resolveViewer(input)`
  returning the `Viewer` shape (see master). Map current internal login (email→Players record) to
  `{kind:'internal', audience:'internal', entitlementActive:true}`; external kinds derived from
  passed-in args (no network). · Files: `src/services/viewer.js`,
  `src/services/__tests__/viewer.test.js`
  · **Verifiziert:** tests cover all three kinds + the internal default; audience mapping correct.
- **T3 — External store contract + fake.** New module `src/services/externalStore.js` defining the
  interface for `Brands`/`BrandEditors`/invites (createBrand, getBrandByOwner, inviteEditor,
  acceptInvite, listEditors, saveEditorProgress) over an injectable backend, plus an in-memory fake
  for tests. Declare table-id constants (`BRAND_EDITORS_TABLE`, `BRANDS_TABLE`) **distinct from**
  `Players`. **No real Airtable calls.** · Files: `src/services/externalStore.js`,
  `src/services/__tests__/externalStore.test.js`
  · **Verifiziert:** fake round-trips an invite (pending→active) and a progress save.
- **T4 — Whop logic (pure).** New `server/whop/entitlement.js` with pure functions:
  `decideEntitlement(tokenClaims, accessCheck)` → `{active, whopUserId}`; `mapWebhookToStatus(event)`
  → `'active'|'inactive'|null`. Mock the Whop responses; **no SDK network calls, no routes mounted.**
  · Files: `server/whop/entitlement.js`, `server/whop/__tests__/entitlement.test.js`
  · **Verifiziert:** `membership_went_valid`→active, `membership_went_invalid`→inactive,
  no-access→denied, valid token+access→active.
- **T5 — Separation invariant (tripwire).** Test asserting the external store's table constants are
  not `Players`/`tblJ2RgdTVX5zdgTc`, that `externalStore` never references the Players table id, and
  that `getAllPlayers` is not imported by external/dashboard modules. · Files:
  `src/services/__tests__/separation.invariant.test.js`
  · **Verifiziert:** invariant test passes (and would fail if a `BrandEditor` write targeted Players).
- **T6 — Hub-sync note.** Append a short section to [docs/HUB_INTEGRATION.md](../../HUB_INTEGRATION.md):
  the new internal world is `countsTowardStage:false` and must be excluded from `ADLINGO_WORLDS`
  stage math; list the exact hub change required. (Doc only — the hub repo change is coordinated
  separately, see Stop & Eskalation.) · Files: `docs/HUB_INTEGRATION.md`
  · **Verifiziert:** section present; names the hub constant + the rule.

## Done  (maschinell prüfbar)
- `npm test` → **green** (all of T0–T5's tests).
- `npm run lint` → **clean**.
- `npm run build` → **succeeds**.
- Behavior-unchanged check: `getCurriculumForAudience('internal', …)` deep-equals the pre-change
  `getWorlds()` world set (asserted in T1's test) — proves production (internal) curriculum is byte-identical.

## Stop & Eskalation
- Any task appears to need a real Airtable table/field, the Whop app/keys, or a deploy → **STOP**
  (P0, Alan-only).
- A change would alter current internal output (curriculum, login, `getAllPlayers`) → **STOP**, that
  violates non-disruption.
- The separation invariant can't be expressed as a test for a given module boundary → **STOP**,
  surface it rather than weakening the rule.
- Whop's real contract differs from the researched primitives → **STOP** (logic is mocked here; flag
  for P3 before any live wiring).
- Same build/test error twice despite a fix → **STOP**, write to report.

## Doctrine-Gate
- [x] **M1** Purpose + Non-Goals explicit; altitude task-level; behavior-unchanged is the explicit goal.
- [x] **M2** Simplest stage: pure modules + a fake; vitest is the minimal runner for this stack; no
  infra, no network.
- [x] **M3** `Done` is `npm test`/`lint`/`build` + a deep-equal behavior check; `Stop & Eskalation`
  explicit → night-loop builds without guessing.
- [x] **1 State:** no new runtime state; table-id constants name the future stores; `Players`
  untouched.
- [x] **2 Separation of Concerns:** audience filter / Viewer / external store / Whop logic are four
  isolated pure modules.
- [x] **3 Idempotenz:** seed-version bump re-seeds safely; fake invite keyed by (Brand, Email);
  `mapWebhookToStatus` is a pure function of the event.
- [x] **4 Coupling:** progress-JSON shape reused; world shape extension is additive + defaulted; hub
  contract documented (T6).
- [x] **5 Context Window:** six small commits, each independently reviewable.
- [x] **6 Error-Taxonomie:** entitlement decision covers token-invalid / no-access / inactive
  branches in tests; runtime/network error handling deferred to P2/P3 (logic-only here).
- [x] **7 Defensive Design:** flags default to current behavior; separation invariant is a tripwire;
  nothing deployed.
- [x] **F1** Contracts/spec sharpened first; not an LLM feature.
- [x] **Tests:** the deliverable *is* pure-function tests + a test runner.
