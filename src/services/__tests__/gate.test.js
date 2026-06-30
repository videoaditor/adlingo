import { describe, it, expect } from 'vitest';
import { decideGate } from '../gate.js';

describe('decideGate — allow states render the curriculum', () => {
  for (const reason of ['ok', 'training_nudge', 'training_warning', 'degraded_open']) {
    it(`'${reason}' → allowed`, () => {
      const out = decideGate({ allow: true, reason, gate: { state: 'clear' } });
      expect(out.allowed).toBe(true);
      expect(out.lock).toBeUndefined();
    });
  }

  it('honors an explicit allow:true even when reason is unfamiliar', () => {
    expect(decideGate({ allow: true, reason: 'whatever' }).allowed).toBe(true);
  });
});

describe('decideGate — deny states render the value-first lock', () => {
  const denies = [
    'brand_subscription_inactive',
    'tool_not_in_plan',
    'seat_unknown_or_revoked',
    'training_soft_locked',
    'training_hard_locked',
  ];
  for (const reason of denies) {
    it(`'${reason}' → locked with title/body/cta`, () => {
      const out = decideGate({ allow: false, reason, gate: { state: 'soft_lock' } });
      expect(out.allowed).toBe(false);
      expect(out.lock.title).toBeTruthy();
      expect(out.lock.body).toBeTruthy();
      expect(out.lock.cta).toBeTruthy();
      expect(out.gate).toEqual({ state: 'soft_lock' });
    });
  }

  it('derives deny from the reason enum when allow is absent', () => {
    const out = decideGate({ reason: 'training_hard_locked', gate: { state: 'hard_lock' } });
    expect(out.allowed).toBe(false);
  });

  it('falls back to a generic lock for an unknown deny reason', () => {
    const out = decideGate({ allow: false, reason: 'mystery' });
    expect(out.allowed).toBe(false);
    expect(out.lock.title).toBeTruthy();
  });
});
