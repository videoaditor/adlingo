import { describe, it, expect } from 'vitest'
import { SEED_WORLDS, getCurriculumForAudience } from '../courseData.js'

// ---------------------------------------------------------------------------
// (a) REAL SEEDS — Home Base (audience:'internal', order 3) now exists in the
// seeds, so 'internal' keeps it while 'universal' drops it and re-links the
// chain across the gap. (Before Home Base was seeded this block asserted both
// audiences were byte-identical; that non-disruption phase is over by design.)
// ---------------------------------------------------------------------------
describe('getCurriculumForAudience — real seeds with the internal Home Base world', () => {
  const realIds = SEED_WORLDS.map((w) => w.id)
  const internalIds = SEED_WORLDS.filter((w) => w.audience === 'internal').map((w) => w.id)

  it('the seeds contain at least one internal-only world', () => {
    expect(internalIds.length).toBeGreaterThan(0)
  })

  it("'internal' keeps every real world id, internal ones included", () => {
    const internal = getCurriculumForAudience('internal', { worlds: SEED_WORLDS })
    expect(internal.map((w) => w.id)).toEqual(realIds)
  })

  it("'universal' drops exactly the internal-audience worlds", () => {
    const universal = getCurriculumForAudience('universal', { worlds: SEED_WORLDS })
    expect(universal.map((w) => w.id)).toEqual(realIds.filter((id) => !internalIds.includes(id)))
    expect(universal.every((w) => w.audience !== 'internal')).toBe(true)
  })

  it("'universal' re-links so no surviving unlockAfterWorld points at a dropped world", () => {
    const universal = getCurriculumForAudience('universal', { worlds: SEED_WORLDS })
    const survivingIds = new Set(universal.map((w) => w.id))
    for (const w of universal) {
      if (w.unlockAfterWorld !== null) {
        expect(survivingIds.has(w.unlockAfterWorld)).toBe(true)
      }
    }
    expect(universal[0].unlockAfterWorld).toBeNull()
  })

  it("'internal' returns the live world set unchanged (same reference)", () => {
    const internal = getCurriculumForAudience('internal', { worlds: SEED_WORLDS })
    expect(internal).toBe(SEED_WORLDS)
  })
})

// ---------------------------------------------------------------------------
// (b) MECHANISM — a fixture with a mid-chain internal world proves the drop +
// re-link. The world after the dropped one must re-link to the nearest surviving
// predecessor, never to a dropped world (a dangling unlockAfterWorld would read
// as "unlocked" and wrongly open the curriculum for external viewers).
// ---------------------------------------------------------------------------
describe('getCurriculumForAudience — mechanism (fixture)', () => {
  // Chain: a -> b -> INTERNAL -> d -> e  (orders 1..5)
  const fixture = [
    { id: 'a', order: 1, audience: 'universal', unlockAfterWorld: null },
    { id: 'b', order: 2, audience: 'universal', unlockAfterWorld: 'a' },
    { id: 'secret', order: 3, audience: 'internal', unlockAfterWorld: 'b' },
    { id: 'd', order: 4, audience: 'universal', unlockAfterWorld: 'secret' },
    { id: 'e', order: 5, audience: 'universal', unlockAfterWorld: 'd' },
  ]

  it("'universal' excludes the internal world", () => {
    const universal = getCurriculumForAudience('universal', { worlds: fixture })
    expect(universal.map((w) => w.id)).toEqual(['a', 'b', 'd', 'e'])
    expect(universal.find((w) => w.id === 'secret')).toBeUndefined()
  })

  it("no surviving world's unlockAfterWorld points at a dropped world", () => {
    const universal = getCurriculumForAudience('universal', { worlds: fixture })
    const survivingIds = new Set(universal.map((w) => w.id))
    for (const w of universal) {
      if (w.unlockAfterWorld !== null) {
        expect(survivingIds.has(w.unlockAfterWorld)).toBe(true)
      }
    }
  })

  it("'d' re-links to the nearest surviving predecessor 'b' (not the dropped 'secret')", () => {
    const universal = getCurriculumForAudience('universal', { worlds: fixture })
    const d = universal.find((w) => w.id === 'd')
    expect(d.unlockAfterWorld).toBe('b')
  })

  it("the first surviving world keeps unlockAfterWorld null", () => {
    const universal = getCurriculumForAudience('universal', { worlds: fixture })
    expect(universal[0].id).toBe('a')
    expect(universal[0].unlockAfterWorld).toBeNull()
  })

  it("'internal' keeps the internal world in place", () => {
    const internal = getCurriculumForAudience('internal', { worlds: fixture })
    expect(internal.map((w) => w.id)).toEqual(['a', 'b', 'secret', 'd', 'e'])
    expect(internal.find((w) => w.id === 'secret')).toBeDefined()
  })
})
