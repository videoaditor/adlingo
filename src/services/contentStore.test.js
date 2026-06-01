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

import { saveLiveContent } from './contentStore';

describe('saveLiveContent', () => {
  it('backs up the previous blob BEFORE patching the live record', async () => {
    const calls = [];
    const prev = JSON.stringify({ worlds: [{ id: 'old' }], disciplines: [] });
    global.fetch = vi.fn((url, opts = {}) => {
      calls.push({ url, method: opts.method || 'GET', body: opts.body });
      // 1st call: fetchLiveRecord (GET) -> existing record with prior content
      if (!opts.method || opts.method === 'GET') {
        return Promise.resolve({
          ok: true, status: 200,
          json: async () => ({ records: [{ id: 'rec1', fields: { 'Content JSON': prev } }] }),
        });
      }
      // backup POST + live PATCH both succeed
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    const next = { worlds: [{ id: 'new' }], disciplines: [{ id: 'd1' }] };
    const ok = await saveLiveContent(next, 'alan@aditor.ai');

    expect(ok).toBe(true);
    // Order: GET live, POST backup, PATCH live
    expect(calls[0].method).toBe('GET');
    expect(calls[1].method).toBe('POST');
    expect(calls[1].url).toContain('AdLingo%20Content%20Backups');
    expect(JSON.parse(calls[1].body).fields['Snapshot JSON']).toBe(prev);
    expect(calls[2].method).toBe('PATCH');
    expect(calls[2].url).toContain('rec1');
    expect(JSON.parse(calls[2].body).fields['Content JSON']).toBe(JSON.stringify(next));
  });

  it('creates the live record (POST) when none exists and skips backup', async () => {
    const calls = [];
    global.fetch = vi.fn((url, opts = {}) => {
      calls.push({ url, method: opts.method || 'GET' });
      if (!opts.method || opts.method === 'GET') {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ records: [] }) });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    const ok = await saveLiveContent({ worlds: [], disciplines: [] }, 'seed');
    expect(ok).toBe(true);
    expect(calls.some((c) => c.method === 'POST' && c.url.includes('AdLingo%20Content%20Backups'))).toBe(false);
    const last = calls[calls.length - 1];
    expect(last.method).toBe('POST');
    expect(last.url).toContain('AdLingo%20Content');
  });

  it('returns false for invalid content', async () => {
    global.fetch = vi.fn();
    expect(await saveLiveContent(null)).toBe(false);
    expect(await saveLiveContent({ worlds: 'x', disciplines: [] })).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

import { bootstrapContent, persistContent } from './contentStore';

describe('bootstrapContent', () => {
  it('applies remote content to the cache when present', async () => {
    const blob = {
      worlds: [{ id: 'wR', name: 'Remote', order: 1, lessons: [] }],
      disciplines: [{ id: 'dR', name: 'Remote D', order: 1, videoUrl: 'x', questions: [] }],
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({ records: [{ id: 'rec1', fields: { 'Content JSON': JSON.stringify(blob) } }] }),
    });

    const result = await bootstrapContent();
    expect(result).toEqual(blob);
    // Cache was written
    expect(JSON.parse(localStorage.getItem('adlingo_course_data'))).toEqual(blob.worlds);
  });

  it('seeds Airtable from local content when no record exists', async () => {
    const posted = [];
    global.fetch = vi.fn((url, opts = {}) => {
      if (!opts.method || opts.method === 'GET') {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ records: [] }) });
      }
      posted.push({ url, body: opts.body });
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    const result = await bootstrapContent();
    // Local content (seed) was returned and pushed to Airtable
    expect(Array.isArray(result.worlds)).toBe(true);
    expect(result.worlds.length).toBeGreaterThan(0);
    expect(posted.some((p) => p.url.includes('AdLingo%20Content'))).toBe(true);
  });

  it('does NOT overwrite a present-but-invalid remote record', async () => {
    const writes = [];
    global.fetch = vi.fn((url, opts = {}) => {
      if (!opts.method || opts.method === 'GET') {
        return Promise.resolve({
          ok: true, status: 200,
          json: async () => ({ records: [{ id: 'rec1', fields: { 'Content JSON': '{bad json' } }] }),
        });
      }
      writes.push(opts.method);
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    const result = await bootstrapContent();
    expect(Array.isArray(result.worlds)).toBe(true); // falls back to local
    expect(writes).toHaveLength(0); // never wrote to Airtable
  });

  it('falls back to local content when Airtable is unreachable', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline'));
    const result = await bootstrapContent();
    expect(Array.isArray(result.worlds)).toBe(true);
  });
});

describe('persistContent', () => {
  it('writes the cache immediately and pushes to Airtable', async () => {
    global.fetch = vi.fn((url, opts = {}) => {
      if (!opts.method || opts.method === 'GET') {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ records: [] }) });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    const content = {
      worlds: [{ id: 'wP', name: 'P', order: 1, lessons: [] }],
      disciplines: [{ id: 'dP', name: 'PD', order: 1, videoUrl: 'x', questions: [] }],
    };
    const ok = await persistContent(content, 'alan@aditor.ai');
    expect(ok).toBe(true);
    expect(JSON.parse(localStorage.getItem('adlingo_course_data'))).toEqual(content.worlds);
  });
});
