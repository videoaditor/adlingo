import { describe, it, expect } from 'vitest'
import { SEED_WORLDS, getCurriculumForAudience } from '../courseData.js'

// ---------------------------------------------------------------------------
// (a) NON-DISRUPTION — with the REAL current seeds, neither audience changes the
// world set. No internal world exists yet, so 'universal' and 'internal' both
// equal today's getWorlds() set. This proves production is byte-identical.
// ---------------------------------------------------------------------------
describe('getCurriculumForAudience — non-disruption with real seeds', () => {
  const realIds = SEED_WORLDS.map((w) => w.id)

  it("'universal' keeps every real world id (no internal world exists yet)", () => {
    const universal = getCurriculumForAudience('universal', { worlds: SEED_WORLDS })
    expect(universal.map((w) => w.id)).toEqual(realIds)
  })

  it("'internal' keeps every real world id", () => {
    const internal = getCurriculumForAudience('internal', { worlds: SEED_WORLDS })
    expect(internal.map((w) => w.id)).toEqual(realIds)
  })

  it("'universal' leaves every real world's unlockAfterWorld unchanged (chain is already linear)", () => {
    const universal = getCurriculumForAudience('universal', { worlds: SEED_WORLDS })
    const before = SEED_WORLDS.map((w) => [w.id, w.unlockAfterWorld])
    const after = universal.map((w) => [w.id, w.unlockAfterWorld])
    expect(after).toEqual(before)
  })

  it("'internal' returns the live world set unchanged (same reference contents)", () => {
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
