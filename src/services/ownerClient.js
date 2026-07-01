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
