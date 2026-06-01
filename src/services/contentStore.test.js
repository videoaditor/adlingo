import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchLiveContent } from './contentStore';

function mockFetchOnce(jsonValue, ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => jsonValue,
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('fetchLiveContent', () => {
  it('returns parsed worlds and disciplines from the live record', async () => {
    const blob = { worlds: [{ id: 'w1' }], disciplines: [{ id: 'd1' }] };
    mockFetchOnce({ records: [{ id: 'rec1', fields: { 'Content JSON': JSON.stringify(blob) } }] });

    const result = await fetchLiveContent();
    expect(result).toEqual(blob);
  });

  it('returns null when no record exists', async () => {
    mockFetchOnce({ records: [] });
    expect(await fetchLiveContent()).toBeNull();
  });

  it('returns null when Content JSON is malformed', async () => {
    mockFetchOnce({ records: [{ id: 'rec1', fields: { 'Content JSON': '{not json' } }] });
    expect(await fetchLiveContent()).toBeNull();
  });

  it('returns null on a network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline'));
    expect(await fetchLiveContent()).toBeNull();
  });
});
