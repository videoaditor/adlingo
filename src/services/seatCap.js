// Seat-cap math for a brand's editor roster. Pure — the ONE place the cap rule
// lives, so the dashboard's "add editor" button, the share link, and the meter
// all agree. Cap comes from the Whop plan tier (source of truth = Whop
// entitlement; this maps the resolved tier to a number).

export const PLAN_SEAT_CAPS = { course: 2, upgrade: 12 };

// Resolved plan tier → number of AdLingo editor seats. Unknown tier → 0 (deny).
export function capFor(planTier) {
  return PLAN_SEAT_CAPS[planTier] ?? 0;
}

// Occupied seats = pending + active memberships. Pending RESERVES a seat, so an
// unaccepted invite still counts (can't over-allocate past cap). 'removed'
// (kicked) frees the seat. Role-agnostic: an owner who seats himself counts too.
export function usage(seats = []) {
  return seats.filter((s) => s && (s.status === 'pending' || s.status === 'active')).length;
}

// The single rule the add-email button AND the share link share: is there a free
// seat? At cap → both go inactive; kick one → both come back.
export function hasFreeSeat({ cap, used } = {}) {
  return typeof cap === 'number' && typeof used === 'number' && used < cap;
}
