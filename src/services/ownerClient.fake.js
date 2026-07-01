// DEV-only fake ownerClient for previewing OwnerDashboard without a live spine.
// Mirrors the real client's return shapes. Only App.jsx's import.meta.env.DEV
// branch touches it → dropped from production builds.
export function createFakeOwnerClient(scenario = 'course') {
  const cap = scenario === 'upgrade' ? 12 : 2;
  let seats = [
    { seatId: 's1', email: 'mika@brand.com', name: 'Mika', status: 'active', completionPct: 100, overdueDays: 0 },
    { seatId: 's2', email: 'jonas@brand.com', name: 'Jonas', status: 'active', completionPct: 40, overdueDays: 6 },
  ];
  const live = () => seats.filter((s) => s.status !== 'removed').length;
  return {
    async getSeats() { return { ok: true, cap, used: live(), seats }; },
    async createSeat(_jwt, email) {
      if (live() >= cap) return { ok: false, status: 409, reason: 'seat_cap_reached' };
      const seat = { seatId: 's' + (seats.length + 1), email, name: null, status: 'pending', completionPct: 0, overdueDays: 0 };
      seats = [...seats, seat];
      return { ok: true, seat };
    },
    async issueInviteLink() {
      return { ok: true, url: 'https://train.aditor.ai/?token=brand_demo_link', active: live() < cap };
    },
    async removeSeat(_jwt, seatId) {
      seats = seats.map((s) => (s.seatId === seatId ? { ...s, status: 'removed' } : s));
      return { ok: true };
    },
  };
}
