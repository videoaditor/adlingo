import { describe, it, expect, beforeEach } from 'vitest';
import { applyContent, getLocalContent, getWorlds, getDisciplines } from './courseData';

beforeEach(() => {
  localStorage.clear();
});

describe('applyContent', () => {
  it('writes worlds and disciplines into the cache so getters return them', () => {
    const worlds = [{ id: 'w9', name: 'Test World', order: 1, lessons: [] }];
    const disciplines = [{ id: 'd9', name: 'Test Disc', order: 1, videoUrl: 'x', questions: [] }];

    applyContent({ worlds, disciplines });

    expect(getWorlds()).toEqual(worlds);
    expect(getDisciplines()).toEqual(disciplines);
  });

  it('ignores non-array fields without throwing', () => {
    expect(() => applyContent({ worlds: undefined, disciplines: null })).not.toThrow();
  });
});

describe('getLocalContent', () => {
  it('returns the current worlds and disciplines as a single object', () => {
    const content = getLocalContent();
    expect(Array.isArray(content.worlds)).toBe(true);
    expect(Array.isArray(content.disciplines)).toBe(true);
  });
});
