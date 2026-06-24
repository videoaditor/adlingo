import { describe, it, expect, beforeEach } from 'vitest'
import {
  SEED_WORLDS,
  lessonHasContent,
  getAllLessonIds,
} from '../courseData.js'

// Minimal in-memory localStorage shim so the localStorage-backed accessors
// (getWorlds/getDisciplines via getAllLessonIds) run in the node test env.
// Fresh per test → getWorlds() seeds the REAL SEED_WORLDS (stored version 0 <
// CURRENT_SEED_VERSION), giving deterministic real-data assertions.
beforeEach(() => {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  }
})

// The exact ordered world-lesson id set as authored in SEED_WORLDS (w1..w4).
// Derived from the seed so the test tracks the real data, not a hand-copied list.
// Copy before sorting — never mutate the shared SEED_WORLDS export.
const REAL_WORLD_LESSON_IDS = [...SEED_WORLDS]
  .sort((a, b) => a.order - b.order)
  .flatMap((w) => [...w.lessons].sort((a, b) => a.order - b.order).map((l) => l.id))

describe('lessonHasContent — placeholder predicate', () => {
  it('drops a "coming soon" placeholder (no videoUrl AND no questions)', () => {
    expect(lessonHasContent({ id: 'l18', videoUrl: null, questions: [] })).toBe(false)
    expect(lessonHasContent({ id: 'l18', videoUrl: null })).toBe(false)
  })

  it('keeps a lesson with a videoUrl', () => {
    expect(lessonHasContent({ id: 'l1', videoUrl: 'https://x', questions: [] })).toBe(true)
  })

  it('keeps a lesson with questions but no video', () => {
    expect(lessonHasContent({ id: 'lq', videoUrl: null, questions: [{ id: 'q1' }] })).toBe(true)
  })

  it('every real seed world lesson has content (current data is unaffected)', () => {
    for (const w of SEED_WORLDS) {
      for (const l of w.lessons) {
        expect(lessonHasContent(l)).toBe(true)
      }
    }
  })
})

describe('getAllLessonIds — denominator excludes placeholders', () => {
  it('returns the existing w1–w4 lesson-id set unchanged (15 real lessons)', () => {
    const ids = getAllLessonIds()
    // Every real world lesson id is present and in authored order.
    for (const id of REAL_WORLD_LESSON_IDS) {
      expect(ids).toContain(id)
    }
    // The world-lesson prefix equals the real set (disciplines append after).
    expect(ids.slice(0, REAL_WORLD_LESSON_IDS.length)).toEqual(REAL_WORLD_LESSON_IDS)
    expect(REAL_WORLD_LESSON_IDS).toHaveLength(15)
  })

  it('a null-video/no-questions placeholder lesson would be absent (mechanism mirrors getAllLessonIds filter)', () => {
    // Build a world set with a placeholder lesson and apply the same filter +
    // flatMap getAllLessonIds uses, proving the placeholder id never surfaces.
    const worldsWithPlaceholder = [
      {
        id: 'wX',
        order: 1,
        lessons: [
          { id: 'real', order: 1, videoUrl: 'https://x', questions: [] },
          { id: 'placeholder', order: 2, videoUrl: null, questions: [] },
        ],
      },
    ]
    const ids = worldsWithPlaceholder
      .sort((a, b) => a.order - b.order)
      .flatMap((w) =>
        w.lessons
          .filter(lessonHasContent)
          .sort((a, b) => a.order - b.order)
          .map((l) => l.id)
      )
    expect(ids).toContain('real')
    expect(ids).not.toContain('placeholder')
  })
})
