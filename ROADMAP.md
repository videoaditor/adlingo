# AdLingo Roadmap

Seeded by the `/spec` loop. `nachtschicht` builds items under **## Ready** top-down. Items in
**## Blocked (Alan / P0)** are manual prerequisites the night-loop cannot do. **## Backlog** items
become `ready` once their prerequisites are met.

Pivot context: [Editor-Suite Pivot — Master Design Spec](docs/superpowers/specs/2026-06-21-adlingo-editor-suite-pivot-design.md).

---

## Ready

### P1 — Foundation (multi-tenant + Whop, code-only, flag-gated)
Add the audience-aware curriculum, Viewer identity model, external-store contract (faked), Whop
auth/entitlement logic (pure, mocked), and the separation invariant — **without changing any
production behavior or touching live data.** Installs a test runner so Done is machine-checkable.
- Spec: [Phase 1 — Foundation](docs/superpowers/specs/2026-06-21-adlingo-foundation-phase1-design.md)
- Done: `npm test` green · `npm run lint` clean · `npm run build` succeeds · `getCurriculumForAudience('internal')` deep-equals today's world set (behavior unchanged).
- Stop & escalate: anything needing a real Airtable table, Whop app/keys, or a deploy (those are P0 below).

---

## Blocked (Alan / P0 — manual prerequisites, not night-loop-able)
These unblock P2–P3. The Airtable token has no `schema:write`, and infra/Whop can't be provisioned by an agent.
- **Airtable:** create `Brands` and `BrandEditors` tables + fields per the master spec (BrandEditors
  carries an `AdLingo Progress` JSON field identical to Players). Do **not** add external people to `Players`.
- **Whop:** create the Whop app (company is locked at creation), an access pass for the editor-suite
  product, an app API key, and a webhook → note the app id, key, `WHOP_WEBHOOK_SECRET`, access-pass id.
- **Render:** create a **Web Service** for `server/index.js` (build `npm install && npm run build`,
  start `npm start`) with env vars (Airtable PAT scoped to base `appP65kN7D9LjbXb0`, admin password,
  Whop keys). Scope the PAT to that base only.
- **Hub coordination:** confirm we can update `aditor-hub` `ADLINGO_WORLDS` so the new internal
  "Home Base" world is excluded from stage math (`countsTowardStage:false`).

*(Taste decisions resolved 2026-06-21: world name "Home Base" at position 3; P4 = zero-config
automatic accountability + "what's new" hype notifications. No open taste questions blocking.)*

---

## Backlog (becomes Ready after its prerequisites)
- **P2 — Backend cutover** (after P0 Render): deploy the `/api/*` proxy, move secrets server-side,
  switch the client off direct-Airtable, keep the static path as fallback until verified. → needs its own spec.
- **P3 — External onboarding** (after P0, P1, P2): Whop iframe + standalone OAuth; create a `Brand`
  on first owner login; invite-by-email + accept; `brand_editor` login gated by Whop billing. → needs its own spec.
- **P4 — Manager dashboard (zero-config)**: nothing for the owner to set up; check editors anytime
  (roster, accepted vs pending, drill-down) + automatic accountability (auto-reminders + auto digest).
  "Feel on top of things." → needs its own spec.
- **P5 — Premium + what's-new + retention**: co-branded premium polish; "what's new" hype-voice
  lesson notifications; streak surfacing + freeze; completion certificates. → needs its own spec.
