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

  it('any content-less seed lesson is a deliberate placeholder (no video AND no questions)', () => {
    for (const w of SEED_WORLDS) {
      for (const l of w.lessons) {
        if (!lessonHasContent(l)) {
          expect(l.videoUrl == null).toBe(true)
          expect((l.questions || []).length).toBe(0)
        }
      }
    }
  })
})

describe('getAllLessonIds — denominator excludes placeholders', () => {
  it('returns the content-bearing world lessons in authored order, excluding placeholders', () => {
    const ids = getAllLessonIds()
    // Content lessons (placeholders filtered out) in world→lesson order.
    const contentIds = [...SEED_WORLDS]
      .sort((a, b) => a.order - b.order)
      .flatMap((w) =>
        [...w.lessons].sort((a, b) => a.order - b.order).filter(lessonHasContent).map((l) => l.id)
      )
    // The world-lesson prefix equals the content set, in order (disciplines append after).
    expect(ids.slice(0, contentIds.length)).toEqual(contentIds)
    // Authored placeholders never surface in the denominator.
    const placeholderIds = SEED_WORLDS.flatMap((w) => w.lessons)
      .filter((l) => !lessonHasContent(l))
      .map((l) => l.id)
    for (const pid of placeholderIds) expect(ids).not.toContain(pid)
    // The Home Base autobilling lesson is the known placeholder.
    expect(placeholderIds).toContain('l18')
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
