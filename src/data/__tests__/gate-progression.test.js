import { describe, it, expect } from 'vitest'
import { SEED_WORLDS, lessonIsCompletable } from '../courseData.js'

// Regression: an empty-quiz placeholder lesson must not gate the next world.
// Bug reported by Mika (#bug-catchers): "How to Bill Your Work" (l18, questions:[])
// in the internal "Home Base" world could never be completed, so the world it
// gates ("Working Faster") — and everything after — stayed locked forever.

// Mirror the component gate (Course.jsx / WorldMap.jsx isWorldUnlocked).
function isWorldUnlocked(world, worlds, completedLessons) {
  if (!world.unlockAfterWorld) return true
  const prev = worlds.find((w) => w.id === world.unlockAfterWorld)
  if (!prev) return true
  return prev.lessons.filter(lessonIsCompletable).every((l) => completedLessons.includes(l.id))
}

describe('lessonIsCompletable', () => {
  it('is false for an empty-quiz placeholder (never enters completedLessons)', () => {
    expect(lessonIsCompletable({ id: 'l18', videoUrl: null, questions: [] })).toBe(false)
    // A video with no quiz still can not be checked off → not a gate.
    expect(lessonIsCompletable({ id: 'v', videoUrl: 'https://x', questions: [] })).toBe(false)
  })
  it('is true for a lesson with a real quiz', () => {
    expect(lessonIsCompletable({ id: 'q', questions: [{ id: 'q1' }] })).toBe(true)
  })
})

describe('world unlock ignores un-completable placeholders', () => {
  const worlds = SEED_WORLDS

  it('the reported placeholder l18 exists and is un-completable', () => {
    const homeBase = worlds.find((w) => w.lessons.some((l) => l.id === 'l18'))
    expect(homeBase).toBeTruthy()
    expect(lessonIsCompletable(homeBase.lessons.find((l) => l.id === 'l18'))).toBe(false)
  })

  it('unlocks a world once every COMPLETABLE lesson of its predecessor is done', () => {
    // For each gated world, complete only the completable lessons of its predecessor.
    for (const world of worlds) {
      if (!world.unlockAfterWorld) continue
      const prev = worlds.find((w) => w.id === world.unlockAfterWorld)
      if (!prev) continue
      const completed = prev.lessons.filter(lessonIsCompletable).map((l) => l.id)
      expect(isWorldUnlocked(world, worlds, completed)).toBe(true)
    }
  })

  it('a lone empty-quiz lesson in the predecessor never blocks the unlock', () => {
    const worldsWithPlaceholder = [
      { id: 'a', order: 1, unlockAfterWorld: null, lessons: [
        { id: 'a1', order: 1, questions: [{ id: 'q' }] },
        { id: 'a2', order: 2, videoUrl: null, questions: [] }, // placeholder
      ] },
      { id: 'b', order: 2, unlockAfterWorld: 'a', lessons: [] },
    ]
    // Only the real lesson completed; placeholder left undone.
    expect(isWorldUnlocked(worldsWithPlaceholder[1], worldsWithPlaceholder, ['a1'])).toBe(true)
  })
})
