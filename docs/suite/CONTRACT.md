# Aditor Suite — Consumer Contract (v2)

The spine issues + verifies all identity and is the single DB across every tool
(AdLingo, Ad Mixer, AutoReview). Apps are consumers. `suite.js` (editor) and
`ownerClient.js` (owner) are AdLingo's only callers. Base URL = `VITE_SUITE_URL`
(unset → suite mode off, internal Players behavior unchanged).

## Identity & dedupe
- **One account per normalized (lowercased, trimmed) email, globally.** A person
  may arrive via the Whop iframe token AND via magic-link/OAuth — the spine
  dedupes on **email**, not Whop user-id, and links auth methods to the same
  account. Never create a second account for an existing email.
- A **seat** = a `(brand, email)` membership. One account holds many seats across
  many brands. Progress is **per-account**, shared across brands, computed against
  the **current** curriculum (a newly shipped lesson re-opens that module).

## Plan → seat cap
`PLAN_SEAT_CAPS = { course: 2, upgrade: 12 }`. Source of truth = Whop entitlement;
the spine resolves the owner's tier → cap. AdLingo enforces only the seat cap.

## Editor endpoints (v1 — already consumed by suite.js)
- `POST /v1/entitlement/check` `{ tool, capability? }` (Bearer editor-JWT)
  → `{ allow, reason, tool, capability?, gate:{ state, overdueSince? } }`.
  **Fails OPEN**: on spine error the client synthesizes `{ allow:true, reason:'degraded_open' }`.
- `POST /v1/training/state` `{ trainingId, dueAt?, completedAt? }` → 200.
- `POST /v1/metrics/ingest` `{ seatId, source:'adlingo', payload }` → 200.
- `GET  /v1/auth/magic?token=…` → `{ ok, token, seat }` | `{ ok:false }`.

### Reason enum (gate.js)
- allow: `ok`, `training_nudge`, `training_warning`, `degraded_open`
- deny: `brand_subscription_inactive`, `tool_not_in_plan`, `seat_unknown_or_revoked`,
  `training_soft_locked`, `training_hard_locked`

## Owner endpoints (v2 — consumed by ownerClient.js)
All take a Bearer **owner-JWT** (from the Whop iframe token via `verifyUserToken`).
**Management writes FAIL CLOSED** — a spine error surfaces as a failed op, never a
phantom success.

- `GET /v1/brand/seats`
  → `{ cap, used, seats:[ { seatId, email, name, status, invitedAt, lastActive,
       completionPct, overdueDays } ] }`
  `status ∈ pending | active | removed`. `used = count(pending|active)`
  (**pending reserves**). `completionPct` is vs the current lesson set.
- `POST /v1/brand/seats` `{ email }`
  → `201 { seat }` (resolve-or-create account by normalized email, create a
    `(brand,email)` membership `pending`, issue + auto-email a magic link)
  → `409 { reason:'seat_cap_reached' }` when `used >= cap`.
  Never duplicates an existing email.
- `POST /v1/brand/invite-link`
  → `{ url, active }` — the brand's ONE general link. `active=false` when at cap
    (link inactive until a seat frees; auto-reactivates). Redeeming creates a
    membership iff `used < cap`. A shared link can never overflow the plan.
- `DELETE /v1/brand/seats/:seatId` → `200` — **kick**: membership → `removed`,
  frees a seat. The account + training record are retained (re-add resumes).
  The editor's next `/v1/entitlement/check` returns `seat_unknown_or_revoked`.

## Billing webhook (spine-internal; informs deny reasons)
`membership_went_valid|invalid` → `Brand.status` active|inactive → drives the
`brand_subscription_inactive` deny reason.
