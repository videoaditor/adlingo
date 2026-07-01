# AdLingo Suite Owner Dashboard — Implementation Plan (slice A–D)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the brand-owner surface of the Aditor Suite — a Whop-iframe dashboard where an owner manages editors up to their plan seat cap (Course 2 / Upgrade 12), sees training completion + who's overdue, invites by link or email, and kicks to free a seat — built and verified against fakes, flag-gated by `VITE_SUITE_URL`, with zero change to internal (Players) behavior.

**Architecture:** AdLingo is a *consumer* of the Aditor Suite spine (already true for editors: `suite.js`/`gate.js`/`viewer.js`). This slice adds the **owner** consumer: a pure cap-math module (`seatCap.js`), a fail-closed owner spine client (`ownerClient.js`, sibling of `suite.js`), and a React dashboard (`OwnerDashboard.jsx`). Seats + progress live in the spine — nothing here writes Airtable. Live Whop owner identity + the spine service itself are **out of this slice** (they need P0 infra); the dashboard is proven against a fake client via a DEV-only route + screenshot.

**Tech Stack:** React 19, react-router-dom 7, framer-motion, lucide-react, Tailwind 4, Vitest 2 (node env — pure-logic tests only; UI verified via the preview MCP, per the repo's node-only test setup).

**Spec:** [`docs/superpowers/specs/2026-07-01-adlingo-suite-owner-dashboard-design.md`](../specs/2026-07-01-adlingo-suite-owner-dashboard-design.md) (Tasks A–D).

---

## File Structure

| File | New/Mod | Responsibility |
|---|---|---|
| `docs/suite/CONTRACT.md` | new | The spine contract (v1 editor endpoints, formalized from `suite.js`, **+ v2 owner endpoints**). Source of truth for both apps. |
| `src/services/seatCap.js` | new | Pure cap math: `PLAN_SEAT_CAPS`, `capFor`, `usage`, `hasFreeSeat`. The one place the cap rule lives. |
| `src/services/__tests__/seatCap.test.js` | new | Unit tests for the cap math. |
| `src/services/ownerClient.js` | new | Owner spine client (list/add/remove seats, invite link). Sibling of `suite.js`; **management writes fail closed**. No Airtable. |
| `src/services/__tests__/ownerClient.test.js` | new | Fake-fetch tests mirroring `suite.test.js`. |
| `src/pages/OwnerDashboard.jsx` | new | The dashboard UI. Consumes `ownerClient` + `seatCap`. Holds no durable state. |
| `src/services/ownerClient.fake.js` | new | DEV-only fake client for previewing the dashboard without a live spine. |
| `src/App.jsx` | mod | Add a DEV-only `/owner` preview route (bypasses auth in dev; live wiring is Task E, out of slice). |
| `src/services/__tests__/separation.invariant.test.js` | mod | Extend the tripwire to cover `ownerClient.js`, `seatCap.js`, and the dashboard page. |
| `.claude/launch.json` | new (if absent) | Dev-server config for the preview MCP. |

**Conventions to follow (from the existing code):**
- Tests: `import { describe, it, expect, vi } from 'vitest'`; fake responses via a local `res(status, body)` helper; inject `fetchImpl` (see `src/services/__tests__/suite.test.js`).
- Spine client shape: base-URL + injected `fetch`, per-call JWT (see `src/services/suite.js` `createSuiteClient`).
- Design language: dark `#0B0B0D` / card `#17171B`, orange `#FF6B35→#C44D1E`, `font-display`, `framer-motion`, `lucide-react` (see `src/components/SuiteLock.jsx`).

---

## Task 1: Suite CONTRACT.md (v1 + v2 owner endpoints)

**Files:**
- Create: `docs/suite/CONTRACT.md`

- [ ] **Step 1: Write the contract doc**

Create `docs/suite/CONTRACT.md`:

````markdown
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
````

- [ ] **Step 2: Verify the doc covers every endpoint the clients call**

Run: `grep -c -E "/v1/(entitlement|training|metrics|auth/magic|brand/seats|brand/invite-link)" docs/suite/CONTRACT.md`
Expected: a number `>= 7` (all v1 + v2 endpoints present).

- [ ] **Step 3: Commit**

```bash
git add docs/suite/CONTRACT.md
git commit -m "docs(suite): formalize CONTRACT.md v2 (editor v1 + owner seat endpoints)"
```

---

## Task 2: Seat-cap math (`seatCap.js`)

**Files:**
- Create: `src/services/seatCap.js`
- Test: `src/services/__tests__/seatCap.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/seatCap.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { PLAN_SEAT_CAPS, capFor, usage, hasFreeSeat } from '../seatCap.js';

describe('capFor', () => {
  it('maps plan tiers to seat counts', () => {
    expect(capFor('course')).toBe(2);
    expect(capFor('upgrade')).toBe(12);
    expect(PLAN_SEAT_CAPS.course).toBe(2);
  });
  it('unknown tier → 0 (deny)', () => {
    expect(capFor('mystery')).toBe(0);
    expect(capFor(undefined)).toBe(0);
  });
});

describe('usage', () => {
  it('counts pending + active, ignores removed', () => {
    const seats = [
      { status: 'active' }, { status: 'pending' }, { status: 'removed' }, null,
    ];
    expect(usage(seats)).toBe(2);
  });
  it('empty/undefined → 0', () => {
    expect(usage()).toBe(0);
    expect(usage([])).toBe(0);
  });
});

describe('hasFreeSeat (the shared add-email + share-link rule)', () => {
  it('true below cap, false at/over cap', () => {
    expect(hasFreeSeat({ cap: 2, used: 1 })).toBe(true);
    expect(hasFreeSeat({ cap: 2, used: 2 })).toBe(false);
    expect(hasFreeSeat({ cap: 2, used: 3 })).toBe(false);
  });
  it('kicking a member frees a seat → flips back to true', () => {
    const seats = [{ status: 'active' }, { status: 'active' }]; // course, cap 2
    expect(hasFreeSeat({ cap: 2, used: usage(seats) })).toBe(false);
    const afterKick = seats.map((s, i) => (i === 0 ? { status: 'removed' } : s));
    expect(hasFreeSeat({ cap: 2, used: usage(afterKick) })).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/services/__tests__/seatCap.test.js`
Expected: FAIL — `Cannot find module '../seatCap.js'` / imports undefined.

- [ ] **Step 3: Write minimal implementation**

Create `src/services/seatCap.js`:

```js
// Seat-cap math for a brand's editor roster. Pure — the ONE place the cap rule
// lives, so the dashboard's "add editor" button, the share link, and the meter
// all agree. Cap comes from the Whop plan tier (source of truth = Whop
// entitlement; this maps the resolved tier to a number).

export const PLAN_SEAT_CAPS = { course: 2, upgrade: 12 };

// Resolved plan tier → number of AdLingo editor seats. Unknown tier → 0 (deny).
export function capFor(planTier) {
  return PLAN_SEAT_CAPS[planTier] ?? 0;
}

// Occupied seats = pending + active memberships. Pending RESERVES a seat, so an
// unaccepted invite still counts (can't over-allocate past cap). 'removed'
// (kicked) frees the seat. Role-agnostic: an owner who seats himself counts too.
export function usage(seats = []) {
  return seats.filter((s) => s && (s.status === 'pending' || s.status === 'active')).length;
}

// The single rule the add-email button AND the share link share: is there a free
// seat? At cap → both go inactive; kick one → both come back.
export function hasFreeSeat({ cap, used } = {}) {
  return typeof cap === 'number' && typeof used === 'number' && used < cap;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/services/__tests__/seatCap.test.js`
Expected: PASS (3 describe blocks, all green).

- [ ] **Step 5: Commit**

```bash
git add src/services/seatCap.js src/services/__tests__/seatCap.test.js
git commit -m "feat(suite): seat-cap math (capFor/usage/hasFreeSeat), pending reserves"
```

---

## Task 3: Owner spine client (`ownerClient.js`)

**Files:**
- Create: `src/services/ownerClient.js`
- Test: `src/services/__tests__/ownerClient.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/ownerClient.test.js`:

```js
import { describe, it, expect, vi } from 'vitest';
import { createOwnerClient } from '../ownerClient.js';

const URL = 'https://suite.example';
function res(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

describe('createOwnerClient guardrails', () => {
  it('throws when suite url is unset (flag off)', () => {
    expect(() => createOwnerClient({ suiteUrl: '', fetchImpl: () => {} })).toThrow();
  });
});

describe('getSeats', () => {
  it('GETs /v1/brand/seats with bearer JWT and returns roster', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      res(200, { cap: 2, used: 1, seats: [{ seatId: 's1', email: 'a@b.com', status: 'active' }] }),
    );
    const client = createOwnerClient({ suiteUrl: URL, fetchImpl });
    const out = await client.getSeats('owner-jwt');

    expect(out).toEqual({ ok: true, cap: 2, used: 1, seats: [{ seatId: 's1', email: 'a@b.com', status: 'active' }] });
    const [calledUrl, opts] = fetchImpl.mock.calls[0];
    expect(calledUrl).toBe('https://suite.example/v1/brand/seats');
    expect(opts.method).toBe('GET');
    expect(opts.headers.Authorization).toBe('Bearer owner-jwt');
  });

  it('FAILS CLOSED on a non-2xx (no fake-empty roster)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(500, {}));
    const client = createOwnerClient({ suiteUrl: URL, fetchImpl });
    expect(await client.getSeats('j')).toEqual({ ok: false, status: 500 });
  });

  it('FAILS CLOSED on a network error', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('down'));
    const client = createOwnerClient({ suiteUrl: URL, fetchImpl });
    expect((await client.getSeats('j')).ok).toBe(false);
  });
});

describe('createSeat', () => {
  it('POSTs the email and returns the new seat', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(201, { seat: { seatId: 's2', email: 'x@y.com', status: 'pending' } }));
    const client = createOwnerClient({ suiteUrl: URL, fetchImpl });
    const out = await client.createSeat('j', 'x@y.com');

    expect(out.ok).toBe(true);
    expect(out.seat.status).toBe('pending');
    const [calledUrl, opts] = fetchImpl.mock.calls[0];
    expect(calledUrl).toBe('https://suite.example/v1/brand/seats');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ email: 'x@y.com' });
  });

  it('surfaces a 409 as seat_cap_reached', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(409, { reason: 'seat_cap_reached' }));
    const client = createOwnerClient({ suiteUrl: URL, fetchImpl });
    expect(await client.createSeat('j', 'x@y.com')).toEqual({ ok: false, status: 409, reason: 'seat_cap_reached' });
  });

  it('FAILS CLOSED on a network error (no phantom invite)', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('down'));
    const client = createOwnerClient({ suiteUrl: URL, fetchImpl });
    expect((await client.createSeat('j', 'x@y.com')).ok).toBe(false);
  });
});

describe('issueInviteLink', () => {
  it('returns { url, active } from the spine', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(200, { url: 'https://train.aditor.ai/?token=brand_x', active: true }));
    const client = createOwnerClient({ suiteUrl: URL, fetchImpl });
    const out = await client.issueInviteLink('j');
    expect(out).toEqual({ ok: true, url: 'https://train.aditor.ai/?token=brand_x', active: true });
    expect(fetchImpl.mock.calls[0][1].method).toBe('POST');
  });
});

describe('removeSeat (kick)', () => {
  it('DELETEs /v1/brand/seats/:id and reports ok', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(200, {}));
    const client = createOwnerClient({ suiteUrl: URL, fetchImpl });
    const out = await client.removeSeat('j', 'seat_9');
    expect(out.ok).toBe(true);
    const [calledUrl, opts] = fetchImpl.mock.calls[0];
    expect(calledUrl).toBe('https://suite.example/v1/brand/seats/seat_9');
    expect(opts.method).toBe('DELETE');
  });

  it('FAILS CLOSED on a non-2xx', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(500, {}));
    const client = createOwnerClient({ suiteUrl: URL, fetchImpl });
    expect((await client.removeSeat('j', 's')).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/services/__tests__/ownerClient.test.js`
Expected: FAIL — `Cannot find module '../ownerClient.js'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/services/ownerClient.js`:

```js
// Aditor Suite spine — OWNER client. Seat management for a brand owner.
//
// Sibling of suite.js (the editor client): same transport (base URL + injected
// fetch, per-call JWT), same CONTRACT.md — but the OWNER surface: list / add /
// remove seats against the plan cap, and issue the brand invite link.
//
// KEY DIFFERENCE from the editor gate: management writes FAIL CLOSED. The editor
// entitlement check fails OPEN (a spine outage must never lock editors out of
// training). But add/remove touch billing-bounded seats — a spine error must
// surface as a FAILED op ({ ok:false }), never a phantom success, or the owner
// thinks they invited/kicked someone when they didn't.
//
// Separation invariant: imports nothing from airtable.js; never references the
// Players table. External seats live in the spine, never Players.

const DEFAULT_SUITE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUITE_URL) || '';

function joinUrl(base, path) {
  const b = String(base || '').replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${b}/${p}`;
}

export function createOwnerClient({
  suiteUrl = DEFAULT_SUITE_URL,
  fetchImpl = (typeof fetch !== 'undefined' ? fetch : undefined),
} = {}) {
  if (!suiteUrl || !String(suiteUrl).trim()) {
    throw new Error('[ownerClient] createOwnerClient called without VITE_SUITE_URL');
  }
  if (typeof fetchImpl !== 'function') {
    throw new Error('[ownerClient] no fetch implementation available');
  }

  async function request(method, path, { body, jwt } = {}) {
    const headers = {};
    if (jwt) headers.Authorization = `Bearer ${jwt}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    return fetchImpl(joinUrl(suiteUrl, path), {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  }

  return {
    // GET /v1/brand/seats → { ok, cap, used, seats }. Fail closed: on any error
    // return { ok:false } so the dashboard shows an error, not a fake-empty roster.
    async getSeats(jwt) {
      try {
        const res = await request('GET', '/v1/brand/seats', { jwt });
        if (!res.ok) return { ok: false, status: res.status };
        const data = await res.json();
        return { ok: true, cap: data.cap, used: data.used, seats: data.seats || [] };
      } catch {
        return { ok: false, status: 0 };
      }
    },

    // POST /v1/brand/seats { email } → { ok, seat } | { ok:false, reason }.
    // 409 → 'seat_cap_reached' so the UI can show the upsell.
    async createSeat(jwt, email) {
      try {
        const res = await request('POST', '/v1/brand/seats', { jwt, body: { email } });
        if (res.status === 409) return { ok: false, status: 409, reason: 'seat_cap_reached' };
        if (!res.ok) return { ok: false, status: res.status };
        const data = await res.json();
        return { ok: true, seat: data.seat || data };
      } catch {
        return { ok: false, status: 0 };
      }
    },

    // POST /v1/brand/invite-link → { ok, url, active }. active=false at cap.
    async issueInviteLink(jwt) {
      try {
        const res = await request('POST', '/v1/brand/invite-link', { jwt });
        if (!res.ok) return { ok: false, status: res.status };
        const data = await res.json();
        return { ok: true, url: data.url, active: data.active !== false };
      } catch {
        return { ok: false, status: 0 };
      }
    },

    // DELETE /v1/brand/seats/:seatId → { ok }. Kick. Fail closed.
    async removeSeat(jwt, seatId) {
      try {
        const res = await request('DELETE', `/v1/brand/seats/${encodeURIComponent(seatId)}`, { jwt });
        return { ok: res.ok, status: res.status };
      } catch {
        return { ok: false, status: 0 };
      }
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/services/__tests__/ownerClient.test.js`
Expected: PASS (all describe blocks green).

- [ ] **Step 5: Commit**

```bash
git add src/services/ownerClient.js src/services/__tests__/ownerClient.test.js
git commit -m "feat(suite): owner spine client (seat CRUD + invite link), fail-closed writes"
```

---

## Task 4: Owner dashboard UI (`OwnerDashboard.jsx`) + DEV preview

**Files:**
- Create: `src/pages/OwnerDashboard.jsx`
- Create: `src/services/ownerClient.fake.js`
- Modify: `src/App.jsx` (add imports + a DEV-only `/owner` route near the top of render)
- Create (if absent): `.claude/launch.json`

- [ ] **Step 1: Write the dashboard component**

Create `src/pages/OwnerDashboard.jsx`:

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Link as LinkIcon, Mail, Trash2, AlertTriangle, Check, Copy, RefreshCw,
} from 'lucide-react';
import { capFor, usage, hasFreeSeat } from '../services/seatCap';

// Brand-owner dashboard (Whop iframe surface). Manage editors up to the plan seat
// cap, see completion + who's overdue, invite by link/email, kick to free a seat.
// Pure consumer of the Aditor Suite spine via `client` (ownerClient) — holds no
// durable state, writes nothing to Airtable.
//
// Props:
//   client   — ownerClient (getSeats/createSeat/issueInviteLink/removeSeat)
//   jwt      — the owner's suite JWT (Whop iframe token; dev: a fake string)
//   planTier — 'course' | 'upgrade' (resolved from Whop entitlement)
//   brand    — { name, logoUrl } for the co-branded header

const STATUS_CHIP = {
  active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  removed: 'bg-white/5 text-gray-500 border-white/10',
};

function SeatMeter({ used, cap }) {
  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
  const full = used >= cap;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-semibold text-gray-300 flex items-center gap-2">
          <Users size={15} className="text-orange-400" /> {used} of {cap} seats used
        </span>
        {full && <span className="text-[12px] text-amber-300">At capacity — kick or upgrade</span>}
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${full ? 'bg-amber-400' : 'bg-gradient-to-r from-[#FF6B35] to-[#C44D1E]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CompletionBar({ pct }) {
  const v = Math.max(0, Math.min(100, Math.round(pct ?? 0)));
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${v}%` }} />
      </div>
      <span className="text-[12px] tabular-nums text-gray-400 w-9 text-right">{v}%</span>
    </div>
  );
}

export default function OwnerDashboard({ client, jwt, planTier = 'course', brand = {} }) {
  const cap = capFor(planTier);
  const [state, setState] = useState({ status: 'loading', seats: [], used: 0 });
  const [invite, setInvite] = useState({ url: null, active: true, copied: false });
  const [email, setEmail] = useState('');
  const [inviteError, setInviteError] = useState(null);
  const [confirmKick, setConfirmKick] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    const r = await client.getSeats(jwt);
    if (!r.ok) {
      setState({ status: 'error', seats: [], used: 0 });
      return;
    }
    setState({
      status: 'ready',
      seats: r.seats,
      used: typeof r.used === 'number' ? r.used : usage(r.seats),
    });
    const link = await client.issueInviteLink(jwt);
    if (link.ok) setInvite({ url: link.url, active: link.active, copied: false });
  }, [client, jwt]);

  useEffect(() => { load(); }, [load]);

  const free = hasFreeSeat({ cap, used: state.used });

  const onInvite = async (e) => {
    e.preventDefault();
    setInviteError(null);
    const addr = email.trim().toLowerCase();
    if (!addr || !addr.includes('@')) { setInviteError('Enter a valid email.'); return; }
    setBusy(true);
    const r = await client.createSeat(jwt, addr);
    setBusy(false);
    if (!r.ok) {
      setInviteError(
        r.reason === 'seat_cap_reached'
          ? "You're at your seat limit — kick an editor or upgrade."
          : 'Invite failed. Try again.',
      );
      return;
    }
    setEmail('');
    load();
  };

  const onKick = async (seatId) => {
    setBusy(true);
    const r = await client.removeSeat(jwt, seatId);
    setBusy(false);
    setConfirmKick(null);
    if (r.ok) load();
  };

  const copyLink = async () => {
    if (!invite.url) return;
    try {
      await navigator.clipboard.writeText(invite.url);
      setInvite((i) => ({ ...i, copied: true }));
    } catch { /* clipboard blocked — ignore */ }
  };

  // Slackers first: most-overdue on top, then least-complete.
  const roster = [...state.seats]
    .filter((s) => s.status !== 'removed')
    .sort((a, b) => (b.overdueDays || 0) - (a.overdueDays || 0) || (a.completionPct || 0) - (b.completionPct || 0));

  const linkUsable = free && invite.active;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white">
      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* Co-branded header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-orange-500/15 border border-orange-500/25 flex items-center justify-center font-black text-orange-400">
                {(brand.name || 'A')[0]}
              </div>
            )}
            <div>
              <h1 className="font-display text-[20px] leading-none tracking-tight">{brand.name || 'Your team'}</h1>
              <span className="text-[11px] text-gray-500">
                Powered by Aditor · {planTier === 'upgrade' ? 'Upgrade' : 'Course'} plan
              </span>
            </div>
          </div>
          <button onClick={load} className="text-gray-500 hover:text-gray-300 p-2" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Seat meter */}
        <div className="bg-[#17171B] rounded-2xl border border-white/10 p-5 mb-4">
          <SeatMeter used={state.used} cap={cap} />
        </div>

        {/* Invite controls */}
        <div className="bg-[#17171B] rounded-2xl border border-white/10 p-5 mb-6 space-y-4">
          <div>
            <label className="text-[12px] font-semibold text-gray-400 flex items-center gap-2 mb-2">
              <LinkIcon size={13} /> Share your team link
            </label>
            <div className={`flex items-center gap-2 ${linkUsable ? '' : 'opacity-40 pointer-events-none'}`}>
              <input readOnly value={invite.url || '…'} className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-gray-300 truncate" />
              <button onClick={copyLink} className="shrink-0 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[13px] flex items-center gap-1.5">
                {invite.copied ? <><Check size={14} className="text-emerald-400" /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            {!linkUsable && (
              <p className="text-[12px] text-amber-300/80 mt-2">
                Link paused — you're at {cap}/{cap} seats. Kick an editor to reactivate.
              </p>
            )}
          </div>

          <form onSubmit={onInvite}>
            <label className="text-[12px] font-semibold text-gray-400 flex items-center gap-2 mb-2">
              <Mail size={13} /> Or invite by email
            </label>
            <div className="flex items-center gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@email.com"
                disabled={!free || busy}
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={!free || busy}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#C44D1E] text-white font-bold text-[13px] disabled:opacity-40"
              >
                Invite
              </button>
            </div>
            {inviteError && <p className="text-[12px] text-red-400 mt-2">{inviteError}</p>}
          </form>
        </div>

        {/* Roster */}
        <h2 className="text-[13px] font-semibold text-gray-400 mb-3 px-1">Editors</h2>
        {state.status === 'loading' && (
          <div className="text-gray-500 text-sm px-1 py-8 text-center">Loading…</div>
        )}
        {state.status === 'error' && (
          <div className="text-amber-300/80 text-sm px-1 py-8 text-center flex flex-col items-center gap-2">
            <AlertTriangle size={20} /> Couldn't reach the suite.
            <button onClick={load} className="underline">Retry</button>
          </div>
        )}
        {state.status === 'ready' && roster.length === 0 && (
          <div className="text-gray-500 text-sm px-1 py-10 text-center border border-dashed border-white/10 rounded-2xl">
            No editors yet — share your link or invite by email above.
          </div>
        )}
        {state.status === 'ready' && roster.length > 0 && (
          <div className="bg-[#17171B] rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
            {roster.map((s) => (
              <div key={s.seatId} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium truncate">{s.name || s.email}</div>
                  <div className="text-[11px] text-gray-500 truncate">{s.email}</div>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_CHIP[s.status] || STATUS_CHIP.removed}`}>
                  {s.status}
                </span>
                <CompletionBar pct={s.completionPct} />
                <div className="w-16 text-right">
                  {s.overdueDays > 0 ? (
                    <span className="text-[12px] text-red-400 font-semibold flex items-center justify-end gap-1">
                      <AlertTriangle size={12} /> {s.overdueDays}d
                    </span>
                  ) : (
                    <span className="text-[12px] text-gray-600">—</span>
                  )}
                </div>
                {confirmKick === s.seatId ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => onKick(s.seatId)} disabled={busy} className="text-[12px] text-red-400 font-semibold px-2 py-1">Kick</button>
                    <button onClick={() => setConfirmKick(null)} className="text-[12px] text-gray-500 px-1">×</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmKick(s.seatId)} className="text-gray-600 hover:text-red-400 p-1.5" title="Kick editor">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the DEV fake client**

Create `src/services/ownerClient.fake.js`:

```js
// DEV-only fake ownerClient for previewing OwnerDashboard without a live spine.
// Mirrors the real client's return shapes. Only App.jsx's import.meta.env.DEV
// branch touches it → dropped from production builds.
export function createFakeOwnerClient(scenario = 'course') {
  const cap = scenario === 'upgrade' ? 12 : 2;
  let seats = [
    { seatId: 's1', email: 'mika@brand.com', name: 'Mika', status: 'active', completionPct: 100, overdueDays: 0 },
    { seatId: 's2', email: 'jonas@brand.com', name: 'Jonas', status: 'active', completionPct: 40, overdueDays: 6 },
  ];
  const live = () => seats.filter((s) => s.status !== 'removed').length;
  return {
    async getSeats() { return { ok: true, cap, used: live(), seats }; },
    async createSeat(_jwt, email) {
      if (live() >= cap) return { ok: false, status: 409, reason: 'seat_cap_reached' };
      const seat = { seatId: 's' + (seats.length + 1), email, name: null, status: 'pending', completionPct: 0, overdueDays: 0 };
      seats = [...seats, seat];
      return { ok: true, seat };
    },
    async issueInviteLink() {
      return { ok: true, url: 'https://train.aditor.ai/?token=brand_demo_link', active: live() < cap };
    },
    async removeSeat(_jwt, seatId) {
      seats = seats.map((s) => (s.seatId === seatId ? { ...s, status: 'removed' } : s));
      return { ok: true };
    },
  };
}
```

- [ ] **Step 3: Wire a DEV-only preview route in `App.jsx`**

Add the imports after the existing page imports (near `src/App.jsx:15`, after `import Admin from './pages/Admin';`):

```jsx
import OwnerDashboard from './pages/OwnerDashboard';
import { createFakeOwnerClient } from './services/ownerClient.fake';
```

Then add this guard as the FIRST statement inside the `App` component's render, immediately before `if (loading) {` (currently `src/App.jsx:217`):

```jsx
  // ponytail: DEV-only preview of the owner dashboard against a fake spine, so we
  // can screenshot it before P0 (live Whop owner identity = Task E). Bypasses the
  // auth gate below. import.meta.env.DEV is false in prod → whole branch (and the
  // fake) is tree-shaken out.
  if (import.meta.env.DEV && typeof window !== 'undefined' && window.location.pathname === '/owner') {
    return (
      <OwnerDashboard
        client={createFakeOwnerClient('course')}
        jwt="dev"
        planTier="course"
        brand={{ name: 'Demo Brand' }}
      />
    );
  }
```

- [ ] **Step 4: Ensure a dev-server launch config exists**

If `.claude/launch.json` does not exist, create it:

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "adlingo-dev", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 5173 }
  ]
}
```

- [ ] **Step 5: Build check (prod tree-shakes the DEV branch)**

Run: `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 6: Preview + screenshot the dashboard**

Use the preview MCP (NOT bash) to verify:
1. `preview_start` name `adlingo-dev`.
2. `preview_eval`: `window.location.href = window.location.origin + '/owner'` (then it reloads on the DEV route).
3. `preview_screenshot` — confirm you can SEE: co-branded header ("Demo Brand · Course plan"), seat meter reading **2 of 2 seats used** (Course is full with the 2 fake editors), the share-link row **paused/greyed** with the "Link paused — you're at 2/2 seats" note, the add-email input **disabled**, and the roster sorted **Jonas (40%, 6d overdue, red) above Mika (100%)**.
4. `preview_inspect` selector `input[readonly]` → confirm the paused link container computed `opacity` ≈ `0.4`.
5. Self-critique against `emil-design-eng` / `ui-ux-pro-max`: consistent 4/8px spacing, one type scale, real content (no lorem), restraint. Fix any spacing/contrast issues in `OwnerDashboard.jsx` and re-screenshot.

Expected: a screenshot proving the cap-lock behavior is visible and the design holds up. (Kick one fake editor via `preview_click` on a `[title="Kick editor"]` then the "Kick" confirm to confirm the link un-greys — optional but recommended.)

- [ ] **Step 7: Commit**

```bash
git add src/pages/OwnerDashboard.jsx src/services/ownerClient.fake.js src/App.jsx .claude/launch.json
git commit -m "feat(suite): owner dashboard UI + DEV preview route (cap meter, invite, kick)"
```

---

## Task 5: Extend the separation invariant

**Files:**
- Modify: `src/services/__tests__/separation.invariant.test.js`

- [ ] **Step 1: Add the new modules + a dashboard-page check to the test**

In `src/services/__tests__/separation.invariant.test.js`, extend `EXTERNAL_PATH_MODULES` (currently `src/services/__tests__/separation.invariant.test.js:16`) to include the two new service modules:

```js
const EXTERNAL_PATH_MODULES = ['suite.js', 'viewer.js', 'gate.js', 'completion.js', 'ownerClient.js', 'seatCap.js'];
```

Then append this block after the existing `describe(...)` (end of file), to cover the dashboard page (which lives in `src/pages/`, outside `servicesDir`):

```js
describe('separation invariant — the owner dashboard never reaches Players', () => {
  const dashboard = readFileSync(join(servicesDir, '..', 'pages', 'OwnerDashboard.jsx'), 'utf8');
  it('OwnerDashboard.jsx imports nothing from the Players service (airtable.js)', () => {
    expect(importsAirtable(dashboard), 'OwnerDashboard must not import airtable.js').toBe(false);
  });
  it('OwnerDashboard.jsx does not hardcode the Players table id', () => {
    expect(dashboard.includes(PLAYERS_TABLE_ID), 'OwnerDashboard must not reference the Players table').toBe(false);
  });
});
```

- [ ] **Step 2: Run the invariant (must be green — the new modules are clean)**

Run: `npm test -- src/services/__tests__/separation.invariant.test.js`
Expected: PASS — all modules (incl. `ownerClient.js`, `seatCap.js`, `OwnerDashboard.jsx`) free of any Players import or table id.

- [ ] **Step 3: Run the full suite + lint**

Run: `npm test && npm run lint`
Expected: all tests PASS; lint clean.

- [ ] **Step 4: Commit**

```bash
git add src/services/__tests__/separation.invariant.test.js
git commit -m "test(suite): extend separation invariant to owner client + dashboard"
```

---

## Self-Review

**1. Spec coverage (slice A–D):**
- Spec Task A (CONTRACT.md) → Plan Task 1. ✅
- Spec Task C (cap logic, pure) → Plan Task 2. ✅ (`hasFreeSeat` unifies the spec's `canInvite`/`linkEnabled` into one rule — the add button and the share link share it.)
- Spec Task B (owner client, fail-closed, fake-tested) → Plan Task 3. ✅
- Spec Task D (dashboard UI, flag-gated, screenshot) → Plan Task 4. ✅
- Spec Done: separation invariant extended → Plan Task 5. ✅ · flag-off byte-identity → the DEV route is `import.meta.env.DEV`-only and prod build is unchanged (Task 4 Step 5); internal paths in `App.jsx` are untouched. ✅
- Spec Tasks E–G (live Whop identity, reminder emails, incentives) → **out of this slice** (need P0: spine deployed + Whop app). Not in this plan by design.

**2. Placeholder scan:** No TBD/TODO in code; every step has complete code or an exact command. The only "later" markers are the explicit Task-E boundary comments (live owner identity), which is a real scope line, not a placeholder.

**3. Type consistency:** Seat shape `{ seatId, email, name, status, invitedAt, lastActive, completionPct, overdueDays }` is identical across CONTRACT.md, `ownerClient` tests, the fake, and `OwnerDashboard`. `status ∈ pending|active|removed` consistent. `createOwnerClient`/`getSeats`/`createSeat`/`issueInviteLink`/`removeSeat` names match between Task 3 impl, Task 4 usage, and the fake. `hasFreeSeat({cap,used})` / `usage(seats)` / `capFor(tier)` signatures consistent between Task 2 and Task 4.

**4. Known-simple choices (ponytail):** `hasFreeSeat` powers both the link and the add button (one rule). Kick confirm is an inline per-row toggle (no modal lib). UI verification is a screenshot, not a jsdom render test, because the repo's vitest env is `node` — matching the existing pattern where only pure logic is unit-tested.

---

## Execution Handoff

Plan complete. Two execution options:

1. **Subagent-Driven (recommended)** — a fresh subagent per task, review between tasks.
2. **Inline Execution** — execute here with checkpoints.
