// Gate decision — pure interpretation of the spine's /v1/entitlement/check
// response into what AdLingo should render. Kept separate from the React lock so
// the deny/allow logic is unit-testable with zero DOM.
//
// Per CONTRACT.md the spine's `reason` is the deciding factor and `gate.state`
// always carries the true training state. AdLingo gates the WHOLE tool on load
// (capability omitted): allow → render the universal curriculum; deny → render
// the value-first lock built from the `gate` object.

const ALLOW_REASONS = new Set(['ok', 'training_nudge', 'training_warning', 'degraded_open']);

// reason → human, value-first copy for the lock. Value-first = lead with what the
// editor gains by clearing it, not a bare error.
const LOCK_COPY = {
  brand_subscription_inactive: {
    title: 'Your team’s access is paused',
    body: 'Your brand’s Aditor subscription is inactive. Ask your owner to reactivate to get back into training.',
    cta: 'Talk to your brand owner',
  },
  tool_not_in_plan: {
    title: 'AdLingo isn’t on your plan yet',
    body: 'Training isn’t included in your current plan. Upgrade to unlock the full editor curriculum.',
    cta: 'See plans',
  },
  seat_unknown_or_revoked: {
    title: 'Your seat isn’t active',
    body: 'We couldn’t find an active seat for you. Ask your brand owner to (re)invite you.',
    cta: 'Request access',
  },
  training_soft_locked: {
    title: 'Finish your training to unlock the tools',
    body: 'You’re a little behind on required training. Knock it out and you’ll be back to creating in minutes.',
    cta: 'Resume training',
  },
  training_hard_locked: {
    title: 'Required training is overdue',
    body: 'Complete your overdue training to restore full access. It’s the fastest path back in.',
    cta: 'Start now',
  },
};

const DEFAULT_LOCK = {
  title: 'Access locked',
  body: 'Your access to AdLingo is currently locked. Contact your brand owner.',
  cta: 'Get help',
};

// Decide what to render from a /v1/entitlement/check decision.
//   → { allowed:true,  reason, gate }                      render curriculum
//   → { allowed:false, reason, gate, lock:{title,body,cta} } render value-first lock
export function decideGate(decision) {
  const reason = (decision && decision.reason) || 'seat_unknown_or_revoked';
  const gate = (decision && decision.gate) || null;
  // Honor explicit `allow` from the spine when present; otherwise derive from the
  // reason enum (allow-set vs deny-set per CONTRACT.md).
  const allowed =
    typeof decision?.allow === 'boolean' ? decision.allow : ALLOW_REASONS.has(reason);

  if (allowed) {
    return { allowed: true, reason, gate };
  }
  return {
    allowed: false,
    reason,
    gate,
    lock: LOCK_COPY[reason] || DEFAULT_LOCK,
  };
}
