# AdLingo — Suite Owner Dashboard & Seat Management (Whop iframe)   ·   Größe: L (phased; first slice is fake-tested + flag-gated)

> Child of [`2026-06-21-adlingo-editor-suite-pivot-design.md`](./2026-06-21-adlingo-editor-suite-pivot-design.md)
> (the master). This spec designs the **brand-owner surface** of the suite: a Whop **iframe app**
> that lets an owner manage their editors up to the plan **seat cap**, see training completion, and
> invite / remove editors — where removal actually revokes access. It also formalizes the **Suite
> spine contract v2** (owner/seat-management endpoints) the dashboard consumes.
>
> **Reality check (2026-07-01):** AdLingo already ships a suite **consumer** (Phase-1 foundation,
> commit `c14834c`): `suite.js` / `gate.js` / `viewer.js` gate *editors* through the Aditor Suite
> spine, flag-gated by `VITE_SUITE_URL`, tested against fakes. But the spine is **not deployed**, the
> **`CONTRACT.md` was never written** (it lives only as comments in `suite.js`), and the whole
> contract v1 is **editor-facing** — there is no owner identity, no seat CRUD, no cap enforcement,
> no invite issuance. That gap is this spec.

## Warum
A brand owner buys on Whop and gets a **course** (their strategy/overview) plus editor seats on the
Aditor Suite. Today they have **no way to see or manage those editors**: no roster, no completion
visibility, no invite flow, no seat cap, no removal. AdLingo is the education platform they hand to
their freelancers — so the natural home for "manage my editors + see who's done their training" is
an **AdLingo owner dashboard, embedded as a Whop iframe app** alongside the course.

The load-bearing requirement Alan stressed — *"pretty accurate work has to be done here"* — is the
**allowlist sync**: add an editor → they can log into external AdLingo; remove them → they can't,
immediately. This is correct-by-construction **only if there is one source of truth for a seat**.
There is: the **spine's seat store**. Add = create a seat; remove = revoke it; the editor gate
(`/v1/entitlement/check`, already consumed by `gate.js`) reads that state live on every load. No
second list to drift out of sync.

## Was
Two things, one repo boundary:

1. **Suite CONTRACT v2 — owner/management additions** (formalized as `platform/suite/CONTRACT.md`;
   currently only comments in `suite.js`). New owner-facing surface:
   - **Owner identity:** Whop iframe `x-whop-user-token` → spine `verifyUserToken` → owner + their
     `Brand` + **plan tier → `seatCap`**. (Standalone OAuth is a later add — iframe-first.) The spine
     **resolves the account by normalized email**, linking the Whop identity to any existing
     magic-link/OAuth account — never a second account for the same email.
   - `GET  /v1/brand/seats` → `{ cap, used, seats:[{ seatId, email, name, status, invitedAt,
     lastActive, completionPct, overdueDays }] }` — the roster. `completionPct` is vs the **current**
     lesson set, so it drops when we ship new content.
   - `POST /v1/brand/seats` `{ email }` → **resolve-or-create the account by normalized email**,
     create a `(brand, email)` membership (`pending`) **iff `used < cap`**, issue a magic link and
     **auto-email it**; **`409 seat_cap_reached`** at cap. Never duplicates an existing email.
   - `POST /v1/brand/invite-link` → return the brand's **one general link**; redeem creates a
     membership **iff `used < cap`** (resolve-or-create by email), else the link is **inactive** and
     **auto-reactivates when a seat frees**. A shared link can never overflow the plan.
   - `DELETE /v1/brand/seats/:seatId` → **kick**: membership `→ removed`, frees a seat; next
     `/v1/entitlement/check` for that `(email, brand)` returns `seat_unknown_or_revoked` (a deny
     reason `gate.js` **already** renders). **Account + training record are retained** (re-add resumes).
   - **Webhook** `membership_went_valid|invalid` → `Brand.status` active|inactive → cascades to the
     `brand_subscription_inactive` gate reason (already in `gate.js`).
   - **Cap = f(plan tier)**, **pending reserves a seat** (so N pending can't all accept past cap).
2. **AdLingo owner dashboard** — a new Whop-iframe route that consumes the above: roster with
   completion % + days-overdue, a **cap meter**, **invite by link** (greyed at cap) **or by email**,
   and **remove** (with confirm). Co-branded, "feel on top of things" tone. Owner can **"view as
   editor"** via the `readOnly` JWT already handled in `viewer.js`.

Plus the retention layer Alan asked for:

3. **Reminder emails** (nudges to take lessons) — **spine-side scheduled job** over training state
   (`dueAt` / overdue), because the spine is the only place that holds editor emails + due dates +
   cross-app seats. Copy in the established **hype / patch-notes voice** (Minecraft energy). Editors
   get curiosity-baiting nudges; the owner gets a periodic digest. AdLingo supplies the deep links
   and the copy; the spine sends.
4. **Incentives (owner-configurable, zero-config default)** — MVP = the **days-overdue column** is
   the incentive (the owner's stick, editors' FOMO). Optional ⚙️ toggles stored per-Brand:
   onboarding **deadline** per seat, **nudge intensity**, and a free-text **perk note** ("finish all
   worlds → you're in the rotation"). Default: everything on sensible auto, nothing to configure.

### Plan → seat cap (the only number the dashboard enforces)
| Plan | AdLingo seats | AutoReview | Ad Mixer |
|---|---|---|---|
| **Course** (base) | **2** | up to 100 ads | *TBD — cost-capped* |
| **Upgrade** (€500 / 4 wks) | **12** | unlimited | unlimited |

AdLingo is metered by **people** (2 / 12). AutoReview (ads) and Ad Mixer (usage) are **different
units, metered by those apps** — out of scope for this dashboard. Encode the map as a named constant
`PLAN_SEAT_CAPS = { course: 2, upgrade: 12 }` (easy to change); **source of truth is the Whop
entitlement**, this is a mirror the spine resolves per owner.

### Identity & seat model  (decided 2026-07-01)
- **One account per normalized email, globally.** The spine issues and verifies all identity and is
  the single DB across every tool (AdLingo, Ad Mixer, AutoReview). A person may authenticate via the
  **Whop iframe token** *and* via **magic-link / OAuth** — the spine **dedupes on lowercased email**,
  not on Whop user-id, and links the auth methods to the **same** account. Never create a second
  account for an email that already exists. *(This is the double-account trap Alan flagged.)*
- **Seats are memberships, not accounts.** A seat = a `(brand, email)` membership. One account can
  hold **many seats across many brands** — a freelancer working for 3 owners = 1 account, 3
  memberships. The cap counts memberships **per brand**.
- **Seats are role-agnostic.** The owner allocates a seat to whoever they like — an employee, a
  freelancer, or **themselves** (to take the training). Owner **dashboard** access comes from the
  Whop owner entitlement and **does not consume a seat**; the owner only counts against the cap if
  they seat their own email as a trainee.
- **Progress is per-account and shared across brands.** The editor does the universal curriculum
  **once**; every brand that seats that email sees the same completion (hire-a-pre-certified-editor).
  **Kick keeps the record** — re-adding the same email resumes, never resets.
- **New content re-opens a module.** Completion is computed against the **current** lesson set (the
  T1b denominator rule already does this), so when *we* ship a new lesson into a world, that world
  drops below 100% for everyone until they do it — the new lesson is uncompleted, prior lessons are
  not wiped. This is the hook that feeds the "what's new" nudge: new lesson → you're at 80% again.
- **Cap counting:** `used = pending + active` memberships for the brand (**pending reserves**). The
  **general brand link** is active while `used < cap` and **auto-reactivates** when a seat frees —
  via a **kick** (owner removes a membership) or a membership going inactive.

### Data flow (add / see / remove)
```
Whop iframe (owner)                 AdLingo dashboard (consumer)          Aditor Suite spine (SoT)
──────────────────                  ───────────────────────────          ───────────────────────
open app  ── x-whop-user-token ───▶ resolve owner + cap  ── GET /v1/brand/seats ─▶ verify token,
                                    render roster + cap meter  ◀───────────────── seats + metrics
add email ────────────────────────▶ POST /v1/brand/seats {email} ───────────────▶ used<cap? create
                                                                                    seat(pending) +
                                    show "invited" / "at cap" ◀────────────────── magic link (email)
share link (used<cap) ────────────▶ POST /v1/brand/invite-link ──────────────────▶ issue magic link
remove ───────────────────────────▶ DELETE /v1/brand/seats/:id ──────────────────▶ status→removed
                                                                        (editor's next gate = deny)
editor logs into AdLingo ────────────────────────────────────────────▶ POST /v1/entitlement/check
                                    allow → curriculum / deny → lock ◀── reads the SAME seat state
```

## Grenzen
- **Muss:**
  - Reuse the shipped consumer contract: the owner client speaks the **same spine dialect** as
    `suite.js`; deny reasons reuse the `gate.js` enum (`seat_unknown_or_revoked`,
    `brand_subscription_inactive`, …); "view as" reuses `viewer.js` `readOnly`.
  - **One account per normalized email** — the spine dedupes across the Whop-iframe token,
    magic-link, and OAuth, and across all tools (one DB). Seats are `(brand, email)` memberships;
    progress is per-account (shared across brands, recomputed against the current curriculum).
  - **Flag-gated by `VITE_SUITE_URL`**: spine unset → the owner dashboard route is hidden/disabled
    and **internal (Players) behavior is byte-unchanged.**
  - **Seats + training progress live in the spine, never Airtable/Players.** The dashboard is a thin
    consumer; it holds no durable external state.
  - **Cap enforced server-side (spine)**, not just greyed in the UI — the UI state is a mirror; the
    `POST /v1/brand/seats` `409` is the real guard. **Pending counts against cap.**
  - **Removal is a revoke**, verified: after `DELETE`, an entitlement check for that seat must deny.
- **Darf nicht:**
  - Never create an external editor in `Players` / `BrandEditors`-in-Airtable / anything
    `getAllPlayers()` reads. External identity is **spine-only** (the separation invariant in
    `viewer.js`/`separation.invariant.test.js` must still pass with these modules added).
  - No secrets in the browser bundle: Whop `verifyUserToken`, magic-link issuance, and the webhook
    secret are **spine-side**. The dashboard only ever holds a short-lived owner JWT.
  - Don't route internal (Players) users through any owner/seat path.
- **Out of Scope (YAGNI):**
  - **Building / deploying the spine service itself** — this spec defines the **contract + the
    AdLingo consumer**, built and tested against fakes exactly like Phase-1. Going live needs the
    spine deployed + the Whop app provisioned (**P0, Alan-manual**).
  - Ad Mixer / AutoReview owner UIs and their usage caps; standalone (non-iframe) owner OAuth;
    billing/pricing pages; full white-label (co-branded name+logo only).

## Ausgangslage  (real files — build on these, don't reinvent)
- **Shipped consumer (`c14834c`):**
  - [src/services/suite.js](../../../src/services/suite.js) — spine client: `createSuiteClient`,
    `checkEntitlement` (**fails open** on outage → `degraded_open`), `reportTraining`
    (`/v1/training/state` + `/v1/metrics/ingest`, source `'adlingo'`), `redeemMagic`
    (`GET /v1/auth/magic`). `fetch` injected → unit-testable with zero network. Flag: `VITE_SUITE_URL`.
  - [src/services/gate.js](../../../src/services/gate.js) — `decideGate(decision)` + the allow/deny
    **reason enum** + value-first lock copy (incl. `seat_unknown_or_revoked`,
    `brand_subscription_inactive`, `training_soft_locked`/`hard_locked`).
  - [src/services/viewer.js](../../../src/services/viewer.js) — `resolveSuiteViewer`, `decodeJwt`,
    `readOnly` (admin "view as"), and the **hard separation invariant** (imports no Players fn).
  - [src/services/completion.js](../../../src/services/completion.js) + `src/services/__tests__/`.
- **Contract v1** is documented **only in `suite.js` comments**; `platform/suite/CONTRACT.md`
  **does not exist yet**; the spine is **not deployed** (tests inject fakes). ← Phase A writes it.
- **Curriculum:** internal world is now **"Internal Operations"** (renamed from "Home Base",
  `1242b10`), `audience:'internal'`, excluded for `universal` viewers — external editors already
  never see it.
- **Backend:** [server/index.js](../../../server/index.js) exists (dormant). The spine is a
  **separate** service (per the master + the June-29 ROADMAP note), not this file.
- **Master + roadmap:** [pivot master](./2026-06-21-adlingo-editor-suite-pivot-design.md),
  [`ROADMAP.md`](../../../ROADMAP.md) (P3 external onboarding, P4 manager dashboard).
- **Not on this machine yet:** Ad Mixer and AutoReview repos — so we author the shared contract and
  build AdLingo against it; the other two adopt it when they exist.

## Tasks  (first slice = A–D, buildable now against fakes + flag-gated; E–G need the spine live)
- **A — CONTRACT.md v2 (doc).** Write `docs/suite/CONTRACT.md` in this repo (mirror to
  `aditor-ops/platform/suite/CONTRACT.md` when the spine is built): formalize v1 (from `suite.js`)
  **plus** every owner endpoint in *Was §1*, request/response shapes, the reason enums, the
  `PLAN_SEAT_CAPS` map, the **email-dedupe rule** (one account per normalized email across auth
  methods + tools), and the webhook. · **Verifiziert:** every endpoint `suite.js` **and** the new
  owner client call is listed with I/O; reason enums match `gate.js`; the dedupe rule is explicit.
- **B — Owner spine client (fake-tested).** New `src/services/ownerClient.js` (or extend
  `suite.js`): `getSeats(jwt)`, `createSeat(jwt,email)`, `issueInviteLink(jwt)`, `removeSeat(jwt,id)`
  — pure, `fetch`-injected. Management writes **fail closed** (unlike the editor gate's fail-open):
  a spine error on "add/remove" must **not** silently succeed. · Files: `ownerClient.js`,
  `__tests__/ownerClient.test.js` · **Verifiziert:** fake round-trips add(pending)→list→remove; a
  `409` surfaces as "at cap"; a network error surfaces as a failed write, not a phantom success.
- **C — Cap logic (pure).** `src/services/seatCap.js`: `usage(seats)` (counts `pending`+`active`
  memberships for the brand, **role-agnostic** — an owner who seats himself counts too),
  `capFor(planTier)`, `canInvite({cap,used})`, `linkEnabled({cap,used})`. · Files: `seatCap.js`,
  `__tests__/seatCap.test.js` · **Verifiziert:** at `used==cap` both `canInvite` and `linkEnabled`
  are false; `pending` counts; **kicking a member flips `linkEnabled` back to true**;
  `capFor('upgrade')===12`, `capFor('course')===2`. **(The "accurate work" core — the one place the
  cap math lives.)**
- **D — Owner dashboard UI (Whop-iframe route).** New route (e.g. `/owner`), gated by
  `VITE_SUITE_URL` + an `owner` viewer: roster table (completion %, days-overdue, status chips),
  cap meter (`used / cap`), **invite-by-link** (button greys + tooltips "at cap" when `linkEnabled`
  is false) and **add-email**, **remove** (confirm dialog), and a **"view as editor"** using the
  `readOnly` token. Co-branded header. · **Verifiziert:** renders against a fake client (screenshot);
  with `VITE_SUITE_URL` unset the route is absent and internal behavior is byte-unchanged; matches
  the design skill checklist (real data, 4/8px grid, OKLCH — see `emil-design-eng` / `ui-ux-pro-max`).
- **E — Whop iframe owner identity** *(needs spine + Whop app; P0-gated).* Pass `x-whop-user-token`
  from the iframe to the spine; spine verifies → owner + brand + cap. Consumer side only here.
  **Build the live `createOwnerClient(ownerJwt)` ONCE (module scope or `useMemo`), never inline in
  render** — an unstable client identity re-fires the dashboard's load effect (owner-dashboard code
  review, Task 4).
- **F — Reminder emails + owner digest** *(spine-side; needs spine live).* Scheduled job over
  training state → hype-voice editor nudges + owner digest. AdLingo owns copy + deep links. Config
  read from per-Brand settings (Task G).
- **G — Incentives config** *(later).* Per-Brand settings (deadline, nudge intensity, perk note) +
  a dashboard settings panel. Zero-config defaults; the days-overdue column ships in Task D already.

## Done  (maschinell prüfbar — first slice A–D)
- `npm test` green incl. `ownerClient` (fake) + `seatCap` (pure) tests · `npm run lint` clean ·
  `npm run build` succeeds.
- **Flag-off byte-identity:** with `VITE_SUITE_URL` unset, `getCurriculumForAudience('internal', …)`
  and the internal login path are unchanged; the `/owner` route is not reachable.
- **Separation invariant still green:** the owner/dashboard/cap modules import no Players function
  (extend `separation.invariant.test.js` to cover them).
- `docs/suite/CONTRACT.md` exists and lists every endpoint the client calls, consistent with `suite.js`.
- Dashboard renders against a fake client (screenshot in the review) — cap meter, greyed link at cap,
  remove-confirm all visible.

## Stop & Eskalation
- Any task needs the spine **deployed**, the **Whop app/access-pass/keys/webhook** created, or real
  **plan→cap numbers** set in prod → **STOP** (P0, Alan-only).
- **Any** code path could put an external editor into `Players` / `getAllPlayers()` → **STOP** (hard
  invariant).
- The spine's real contract diverges from v1/v2 as documented → **STOP**, reconcile `CONTRACT.md`
  before wiring anything live.
- Plan tier→cap is ambiguous beyond AdLingo seats (e.g. Ad Mixer's unit undecided) → **STOP**; the
  dashboard only needs the AdLingo seat cap (2/12) — don't invent Mixer/AutoReview caps.
- Whop iframe token/verify behaves differently than the researched primitives → **STOP** (defer to E).
- Same build/test error twice despite a fix → **STOP**, write to the report.

## Doctrine-Gate
- [x] **M1** Spec-first: Purpose + Non-Goals/YAGNI explicit; altitude is task-level for the A–D
  slice, design-level for E–G (which depend on P0 infra).
- [x] **M2** Start simple: reuse the shipped consumer (`suite.js`/`gate.js`/`viewer.js`) + its
  contract dialect; build the dashboard against fakes (no new infra) exactly like Phase-1; co-branded
  not white-label; one cap constant, not a config system. Each new module has a forcing reason.
- [x] **M3** Loop-first: A–D `Done` is `npm test`/`lint`/`build` + a flag-off identity check + a
  screenshot; P0 infra fenced into Stop & Eskalation so the night-loop builds without guessing.
- [x] **1 State:** single source of truth = the **spine seat store** (external) / `Players`
  (internal); the dashboard holds no durable state; cap SoT = Whop entitlement, mirrored by the spine.
- [x] **2 Separation of Concerns:** owner client (transport), `seatCap` (pure math), dashboard (UI),
  spine contract (interface) are isolated and independently testable.
- [x] **3 Idempotenz:** seat create keyed by (Brand, Email) → re-invite is not a duplicate; `DELETE`
  is idempotent (removed→removed); webhook keyed on membership id.
- [x] **4 Coupling:** contract versioned (v1 shipped → v2 additive); reason enum shared with
  `gate.js`; progress/metric field names reused from `suite.js` (`completionPct`, `dueAt`, `seatId`).
- [x] **5 Context Window:** phased; A–D is the reviewable slice, E–G are separate specs once the
  spine + Whop app exist.
- [x] **6 Error-Taxonomie:** editor gate **fails open** (`degraded_open`, already in `suite.js`);
  owner **management writes fail closed**; `409` = at cap; Whop 429 → backoff; webhook bad sig →
  reject; billing inactive → `brand_subscription_inactive` deny + upsell.
- [x] **7 Defensive Design:** flag-gated (default = current behavior); cap enforced server-side not
  just in UI; removal verified by a follow-up gate check; separation invariant is a tripwire test.
- [x] **F1 Richtiger Hebel:** the leverage is the **single seat source of truth** + a sharp contract,
  not UI polish — that's what makes add/remove correct. Not an LLM feature.
- [x] **Tests:** `seatCap` (pure) + `ownerClient` (fake) + the extended separation invariant are the
  machine-checkable core of the A–D slice.
