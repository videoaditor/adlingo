import { describe, it, expect, vi } from 'vitest';
import { createSuiteClient, suiteEnabled } from '../suite.js';

const URL = 'https://suite.example';

// Minimal fake Response.
function res(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

describe('suiteEnabled', () => {
  it('false when url empty/unset', () => {
    expect(suiteEnabled('')).toBe(false);
    expect(suiteEnabled(undefined)).toBe(false);
    expect(suiteEnabled('  ')).toBe(false);
  });
  it('true when url set', () => {
    expect(suiteEnabled(URL)).toBe(true);
  });
});

describe('checkEntitlement', () => {
  it('POSTs to /v1/entitlement/check with the bearer JWT and returns the decision', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      res(200, { allow: false, reason: 'training_soft_locked', gate: { state: 'soft_lock' } }),
    );
    const client = createSuiteClient({ suiteUrl: URL, fetchImpl });
    const out = await client.checkEntitlement('jwt123', 'adlingo');

    expect(out.reason).toBe('training_soft_locked');
    const [calledUrl, opts] = fetchImpl.mock.calls[0];
    expect(calledUrl).toBe('https://suite.example/v1/entitlement/check');
    expect(opts.method).toBe('POST');
    expect(opts.headers.Authorization).toBe('Bearer jwt123');
    expect(JSON.parse(opts.body)).toEqual({ tool: 'adlingo' });
  });

  it('includes capability when provided', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(200, { allow: true, reason: 'ok' }));
    const client = createSuiteClient({ suiteUrl: URL, fetchImpl });
    await client.checkEntitlement('j', 'adlingo', 'export');
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({ tool: 'adlingo', capability: 'export' });
  });

  it('fails OPEN (degraded_open) on a network error', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('down'));
    const client = createSuiteClient({ suiteUrl: URL, fetchImpl });
    const out = await client.checkEntitlement('j', 'adlingo');
    expect(out.allow).toBe(true);
    expect(out.reason).toBe('degraded_open');
  });

  it('fails OPEN on a non-2xx response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(500, {}));
    const client = createSuiteClient({ suiteUrl: URL, fetchImpl });
    const out = await client.checkEntitlement('j', 'adlingo');
    expect(out.reason).toBe('degraded_open');
  });
});

describe('reportTraining', () => {
  it('writes BOTH training/state and metrics/ingest (source adlingo)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(200, { ok: true }));
    const client = createSuiteClient({ suiteUrl: URL, fetchImpl });

    const out = await client.reportTraining('jwtZ', {
      trainingId: 'l1',
      completedAt: '2026-06-29T00:00:00Z',
      seatId: 'seat_1',
      completionPct: 42,
    });

    expect(out.ok).toBe(true);
    const urls = fetchImpl.mock.calls.map((c) => c[0]);
    expect(urls).toContain('https://suite.example/v1/training/state');
    expect(urls).toContain('https://suite.example/v1/metrics/ingest');

    const ingestCall = fetchImpl.mock.calls.find((c) => c[0].endsWith('/metrics/ingest'));
    const ingestBody = JSON.parse(ingestCall[1].body);
    expect(ingestBody.source).toBe('adlingo');
    expect(ingestBody.seatId).toBe('seat_1');
    expect(ingestBody.payload.completionPct).toBe(42);

    const stateCall = fetchImpl.mock.calls.find((c) => c[0].endsWith('/training/state'));
    expect(JSON.parse(stateCall[1].body).trainingId).toBe('l1');
  });

  it('never throws even if both calls fail', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('boom'));
    const client = createSuiteClient({ suiteUrl: URL, fetchImpl });
    const out = await client.reportTraining('j', { trainingId: 'l1', seatId: 's' });
    expect(out.ok).toBe(false);
  });
});

describe('redeemMagic', () => {
  it('GETs /v1/auth/magic and returns the suite-JWT envelope', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(res(200, { ok: true, token: 'suite-jwt', seat: { id: 'seat_1' } }));
    const client = createSuiteClient({ suiteUrl: URL, fetchImpl });
    const out = await client.redeemMagic('tok&special');

    expect(out.token).toBe('suite-jwt');
    expect(fetchImpl.mock.calls[0][0]).toBe('https://suite.example/v1/auth/magic?token=tok%26special');
  });

  it('returns {ok:false} on 401', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(401, {}));
    const client = createSuiteClient({ suiteUrl: URL, fetchImpl });
    expect(await client.redeemMagic('x')).toEqual({ ok: false });
  });
});

describe('createSuiteClient guardrails', () => {
  it('throws when suite url is unset (flag off)', () => {
    expect(() => createSuiteClient({ suiteUrl: '', fetchImpl: () => {} })).toThrow();
  });
});
