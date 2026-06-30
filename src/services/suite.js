// Aditor Suite spine client — pure, transport-injected.
//
// AdLingo-as-consumer: external (suite) editors authenticate + gate through the
// Aditor Suite spine instead of the internal Players table. This module is the
// ONLY place that talks to the spine. It is flag-gated by VITE_SUITE_URL:
//   - unset  → suite mode OFF; internal (Players) behavior is byte-unchanged.
//   - set    → suite mode ON for external editors.
//
// The contract this consumes is platform/suite/CONTRACT.md (v1):
//   POST /v1/entitlement/check   → the gate decision
//   POST /v1/training/state      → upsert training progress for the seat
//   POST /v1/metrics/ingest      → append-only completion metric (source 'adlingo')
//   GET  /v1/auth/magic?token=…  → redeem a single-use magic token → suite-JWT
//
// `fetch` is injected so the module is unit-testable against fakes with zero
// network. The spine is NOT deployed yet — tests inject a faked client/fetch.

const DEFAULT_SUITE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUITE_URL) || '';

// Whether suite-consumer mode is enabled at all. When false, callers fall back
// to the internal Players flow and this module's network methods are never hit.
export function suiteEnabled(suiteUrl = DEFAULT_SUITE_URL) {
  return typeof suiteUrl === 'string' && suiteUrl.trim().length > 0;
}

function joinUrl(base, path) {
  const b = String(base || '').replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${b}/${p}`;
}

// Factory: bind a base URL + fetch implementation once, get back the client.
// Defaults to the build-time VITE_SUITE_URL and the global fetch so production
// callers need no wiring; tests pass their own.
export function createSuiteClient({
  suiteUrl = DEFAULT_SUITE_URL,
  fetchImpl = (typeof fetch !== 'undefined' ? fetch : undefined),
} = {}) {
  if (!suiteEnabled(suiteUrl)) {
    throw new Error('[suite] createSuiteClient called without VITE_SUITE_URL');
  }
  if (typeof fetchImpl !== 'function') {
    throw new Error('[suite] no fetch implementation available');
  }

  async function postJson(path, body, jwt) {
    const headers = { 'Content-Type': 'application/json' };
    if (jwt) headers.Authorization = `Bearer ${jwt}`;
    const res = await fetchImpl(joinUrl(suiteUrl, path), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return res;
  }

  return {
    // POST /v1/entitlement/check — the single gate call. `capability` is optional
    // per contract. On any infra/transport error we fail OPEN (degraded_open) so a
    // spine outage never locks editors out of training.
    async checkEntitlement(jwt, tool, capability) {
      const body = { tool };
      if (capability) body.capability = capability;
      try {
        const res = await postJson('/v1/entitlement/check', body, jwt);
        if (!res.ok) {
          return degradedOpen(tool, capability);
        }
        return await res.json();
      } catch {
        return degradedOpen(tool, capability);
      }
    },

    // Report training progress for a suite editor. Writes BOTH the canonical
    // training state (POST /v1/training/state) and an append-only metric
    // (POST /v1/metrics/ingest, source 'adlingo'). Returns { ok, state, metric }.
    // Never throws — reporting failure must not break the lesson UX.
    async reportTraining(jwt, payload) {
      const { trainingId, dueAt = null, completedAt = null, seatId, completionPct } = payload || {};
      const result = { ok: false, state: null, metric: null };

      try {
        const stateRes = await postJson(
          '/v1/training/state',
          { trainingId, dueAt, completedAt },
          jwt,
        );
        result.state = stateRes.status;
      } catch {
        result.state = 'error';
      }

      try {
        // metrics/ingest is internal-signed; the spine attaches the secret. The
        // client forwards seatId + the adlingo payload per CONTRACT.md.
        const metricRes = await postJson(
          '/v1/metrics/ingest',
          {
            seatId,
            source: 'adlingo',
            payload:
              typeof completionPct === 'number'
                ? { completionPct, ...(payload.metric || {}) }
                : payload.metric || {},
          },
          jwt,
        );
        result.metric = metricRes.status;
      } catch {
        result.metric = 'error';
      }

      result.ok = result.state === 200 && result.metric === 200;
      return result;
    },

    // GET /v1/auth/magic?token=… — redeem a single-use magic token → suite-JWT.
    // Returns { ok, token, seat } on success or { ok:false } on 401/expired/error.
    async redeemMagic(token) {
      try {
        const res = await fetchImpl(
          joinUrl(suiteUrl, `/v1/auth/magic?token=${encodeURIComponent(token)}`),
          { method: 'GET' },
        );
        if (!res.ok) return { ok: false };
        const data = await res.json();
        if (data && data.ok && data.token) return data;
        return { ok: false };
      } catch {
        return { ok: false };
      }
    },
  };
}

// Synthetic fail-open decision per CONTRACT.md: spine couldn't evaluate → allow.
function degradedOpen(tool, capability) {
  return {
    allow: true,
    reason: 'degraded_open',
    tool,
    capability: capability || null,
    gate: { state: 'clear' },
  };
}
