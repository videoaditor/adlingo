import { describe, it, expect } from 'vitest';
import { PLAN_SEAT_CAPS, capFor, usage, hasFreeSeat } from '../seatCap.js';

describe('capFor', () => {
  it('maps plan tiers to seat counts', () => {
    expect(capFor('course')).toBe(2);
    expect(capFor('upgrade')).toBe(12);
    expect(PLAN_SEAT_CAPS.course).toBe(2);
  });
  it('unknown tier → 0 (deny)', () => {
    expect(capFor('mystery')).toBe(0);
    expect(capFor(undefined)).toBe(0);
  });
});

describe('usage', () => {
  it('counts pending + active, ignores removed', () => {
    const seats = [
      { status: 'active' }, { status: 'pending' }, { status: 'removed' }, null,
    ];
    expect(usage(seats)).toBe(2);
  });
  it('empty/undefined → 0', () => {
    expect(usage()).toBe(0);
    expect(usage([])).toBe(0);
  });
});

describe('hasFreeSeat (the shared add-email + share-link rule)', () => {
  it('true below cap, false at/over cap', () => {
    expect(hasFreeSeat({ cap: 2, used: 1 })).toBe(true);
    expect(hasFreeSeat({ cap: 2, used: 2 })).toBe(false);
    expect(hasFreeSeat({ cap: 2, used: 3 })).toBe(false);
  });
  it('kicking a member frees a seat → flips back to true', () => {
    const seats = [{ status: 'active' }, { status: 'active' }]; // course, cap 2
    expect(hasFreeSeat({ cap: 2, used: usage(seats) })).toBe(false);
    const afterKick = seats.map((s, i) => (i === 0 ? { status: 'removed' } : s));
    expect(hasFreeSeat({ cap: 2, used: usage(afterKick) })).toBe(true);
  });
});
