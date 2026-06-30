import { describe, it, expect, vi } from 'vitest';
import { Buffer } from 'node:buffer';
import {
  resolveSuiteViewer,
  resolveInternalViewer,
  isInternalViewer,
  isReadOnly,
  decodeJwt,
} from '../viewer.js';

// Build a real (unsigned) JWT-shaped token so decodeJwt exercises base64url decode.
function makeJwt(payload) {
  const b64 = (obj) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.sig`;
}

describe('viewer resolver — external (suite) editor', () => {
  it('resolves a magic-link redemption to a brand_editor on the universal audience', () => {
    const jwt = makeJwt({ sub: 'seat_abc', brandId: 'brand_1', role: 'editor', email: 'e@brand.com' });
    const viewer = resolveSuiteViewer({ ok: true, token: jwt, seat: { id: 'seat_abc' } });

    expect(viewer.kind).toBe('brand_editor');
    expect(viewer.audience).toBe('universal');
    expect(viewer.email).toBe('e@brand.com');
    expect(viewer.seatId).toBe('seat_abc');
    expect(viewer.jwt).toBe(jwt);
    expect(viewer.readOnly).toBe(false);
  });

  it('a suite viewer carries NO Players record (no id, no progress)', () => {
    const jwt = makeJwt({ sub: 'seat_abc', email: 'e@brand.com' });
    const viewer = resolveSuiteViewer({ ok: true, token: jwt });
    expect(viewer.id).toBeUndefined();
    expect(viewer.progress).toBeUndefined();
  });

  it('flags readOnly when the JWT carries readOnly:true', () => {
    const jwt = makeJwt({ sub: 'seat_x', email: 'e@brand.com', readOnly: true });
    const viewer = resolveSuiteViewer({ ok: true, token: jwt });
    expect(viewer.readOnly).toBe(true);
    expect(isReadOnly(viewer)).toBe(true);
  });

  it('returns null when there is no token', () => {
    expect(resolveSuiteViewer({ ok: false })).toBeNull();
    expect(resolveSuiteViewer(null)).toBeNull();
  });

  it('is NOT an internal viewer (cannot touch Players)', () => {
    const jwt = makeJwt({ sub: 'seat_abc', email: 'e@brand.com' });
    const viewer = resolveSuiteViewer({ ok: true, token: jwt });
    expect(isInternalViewer(viewer)).toBe(false);
  });
});

describe('viewer resolver — internal editor', () => {
  it('wraps a Players record into an internal/internal viewer', () => {
    const player = { id: 'recX', email: 'staff@aditor.ai', progress: { completedLessons: [] } };
    const viewer = resolveInternalViewer(player);
    expect(viewer.kind).toBe('internal');
    expect(viewer.audience).toBe('internal');
    expect(viewer.id).toBe('recX');
    expect(isInternalViewer(viewer)).toBe(true);
    expect(isReadOnly(viewer)).toBe(false);
  });

  it('returns null for a missing player', () => {
    expect(resolveInternalViewer(null)).toBeNull();
  });

  it('treats an UNTAGGED legacy stored viewer (has Players id, no kind) as internal', () => {
    // Sessions stored before the cutover have no `kind` but carry a Players `id`.
    const legacy = { id: 'recLegacy', email: 's@aditor.ai', progress: {} };
    expect(isInternalViewer(legacy)).toBe(true);
  });

  it('never treats a jwt-bearing viewer as internal even without a kind', () => {
    expect(isInternalViewer({ jwt: 'x.y.z', email: 'ext@brand.com' })).toBe(false);
  });
});

describe('decodeJwt', () => {
  it('returns claims for a well-formed token', () => {
    const jwt = makeJwt({ sub: 's', email: 'a@b.com' });
    expect(decodeJwt(jwt)).toMatchObject({ sub: 's', email: 'a@b.com' });
  });
  it('returns {} for garbage', () => {
    expect(decodeJwt('not-a-jwt')).toEqual({});
    expect(decodeJwt(null)).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// SEPARATION INVARIANT — an external editor resolved through the suite path must
// NEVER reach Players. We prove it structurally: viewer.js imports none of the
// Airtable functions, and a suite viewer is never `isInternalViewer`, which is
// the single gate App.jsx checks before any Players call. Here we spy on the
// Airtable module and drive the resolver/predicate to assert ZERO Players calls.
// ---------------------------------------------------------------------------
import * as airtable from '../airtable.js';

describe('separation invariant — external editor never hits Players', () => {
  it('resolving + classifying a suite editor calls no Players function', () => {
    const findSpy = vi.spyOn(airtable, 'findPlayerByEmail');
    const allSpy = vi.spyOn(airtable, 'getAllPlayers');
    const saveSpy = vi.spyOn(airtable, 'savePlayerProgress');
    const saveRetrySpy = vi.spyOn(airtable, 'savePlayerProgressWithRetry');

    const jwt = makeJwt({ sub: 'seat_ext', brandId: 'b1', email: 'freelancer@brand.com' });
    const viewer = resolveSuiteViewer({ ok: true, token: jwt });

    // The ONLY gate the app consults before touching Players:
    expect(isInternalViewer(viewer)).toBe(false);

    expect(findSpy).not.toHaveBeenCalled();
    expect(allSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(saveRetrySpy).not.toHaveBeenCalled();
  });
});
