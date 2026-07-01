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
