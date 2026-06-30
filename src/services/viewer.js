// Viewer resolver — single source of identity for AdLingo.
//
// HARD INVARIANT (separation): an external / suite editor must NEVER reach the
// internal Players table. This module is the ONE place that decides which world a
// viewer belongs to, and it physically cannot call findPlayerByEmail /
// getAllPlayers / a Players write — it imports none of them. The suite path
// resolves identity purely from a magic-link / suite-JWT; the internal path
// resolves via a Players lookup that the CALLER (App.jsx) performs, never here.
//
//   external (suite editor) → { kind:'brand_editor', audience:'universal', … }
//   internal (Players)      → { kind:'internal',     audience:'internal',  … }
//
// `viewer.kind === 'internal'` is the ONLY value for which the caller is allowed
// to touch Players. Everything else stays out of Players/dispatch entirely.

// Decode a suite-JWT payload (no signature verification — the spine verifies on
// every call; the client only needs claims for UI: email, readOnly, seat). Pure,
// returns {} on any malformed token.
export function decodeJwt(jwt) {
  if (!jwt || typeof jwt !== 'string') return {};
  const parts = jwt.split('.');
  if (parts.length !== 3) return {};
  try {
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const json =
      typeof atob === 'function'
        ? atob(b64)
        : globalThis.Buffer.from(b64, 'base64').toString('utf8'); // node test env only
    return JSON.parse(json);
  } catch {
    return {};
  }
}

// Resolve a SUITE editor from a redeemed magic-link result / raw JWT into a
// brand_editor viewer. NO Players access. The returned viewer carries the JWT so
// downstream gate + reporting calls can authenticate, and `readOnly` so progress
// writes can be blocked for admin "view as" tokens.
//
//   redeemed = { ok, token, seat } (from suite.redeemMagic) OR a raw { token }.
export function resolveSuiteViewer(redeemed) {
  const jwt = redeemed && (redeemed.token || redeemed.jwt);
  if (!jwt) return null;
  const claims = decodeJwt(jwt);
  const seat = (redeemed && redeemed.seat) || {};
  return {
    kind: 'brand_editor',
    audience: 'universal', // external viewers never see internal worlds
    email: claims.email || seat.email || null,
    seatId: claims.sub || seat.id || null,
    brandId: claims.brandId || seat.brandId || null,
    role: claims.role || seat.role || 'editor',
    readOnly: claims.readOnly === true,
    jwt,
    // No `progress` here — suite editors persist via the spine, not Airtable, and
    // never carry a Players record.
  };
}

// Wrap an internal Players record (already fetched by the caller via
// findPlayerByEmail) into an internal viewer. This is the ONLY path that carries
// a Players `id`. Kept as a thin tag so the rest of the app reads `viewer.kind`
// / `viewer.audience` uniformly regardless of source.
export function resolveInternalViewer(player) {
  if (!player) return null;
  return {
    ...player,
    kind: 'internal',
    audience: 'internal', // internal sees Home Base + everything
    readOnly: false,
  };
}

// True iff this viewer is allowed to touch the internal Players table / dispatch.
// The single gate the caller checks before any findPlayerByEmail/getAllPlayers/
// savePlayerProgress call.
//   - kind:'internal'            → internal (explicit).
//   - kind:'brand_editor'/jwt    → NEVER internal (suite editor; hard stop).
//   - untagged legacy viewer     → treated as internal IFF it carries a Players
//     `id` (pre-cutover sessions stored without a `kind`). A suite viewer never
//     carries an `id`, so this back-compat path can't admit an external editor.
export function isInternalViewer(viewer) {
  if (!viewer) return false;
  if (viewer.kind === 'internal') return true;
  if (viewer.kind === 'brand_editor' || viewer.jwt) return false;
  return typeof viewer.id === 'string' && viewer.id.length > 0;
}

// True iff progress writes must be blocked for this viewer (read-only admin
// "view as" impersonation token). Applies to BOTH the suite report path and any
// Airtable path — a readOnly viewer writes nowhere.
export function isReadOnly(viewer) {
  return !!viewer && viewer.readOnly === true;
}
