import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Link as LinkIcon, Mail, Trash2, AlertTriangle, Check, Copy, RefreshCw,
} from 'lucide-react';
import { capFor, usage, hasFreeSeat } from '../services/seatCap';

// Brand-owner dashboard (Whop iframe surface). Manage editors up to the plan seat
// cap, see completion + who's overdue, invite by link/email, kick to free a seat.
// Pure consumer of the Aditor Suite spine via `client` (ownerClient) — holds no
// durable state, writes nothing to Airtable.
//
// Props:
//   client   — ownerClient (getSeats/createSeat/issueInviteLink/removeSeat)
//   jwt      — the owner's suite JWT (Whop iframe token; dev: a fake string)
//   planTier — 'course' | 'upgrade' (resolved from Whop entitlement)
//   brand    — { name, logoUrl } for the co-branded header

const STATUS_CHIP = {
  active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  removed: 'bg-white/5 text-gray-500 border-white/10',
};

function SeatMeter({ used, cap }) {
  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
  const full = used >= cap;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-semibold text-gray-300 flex items-center gap-2">
          <Users size={15} className="text-orange-400" /> {used} of {cap} seats used
        </span>
        {full && <span className="text-[12px] text-amber-300">At capacity — kick or upgrade</span>}
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${full ? 'bg-amber-400' : 'bg-gradient-to-r from-[#FF6B35] to-[#C44D1E]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CompletionBar({ pct }) {
  const v = Math.max(0, Math.min(100, Math.round(pct ?? 0)));
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${v}%` }} />
      </div>
      <span className="text-[12px] tabular-nums text-gray-400 w-9 text-right">{v}%</span>
    </div>
  );
}

export default function OwnerDashboard({ client, jwt, planTier = 'course', brand = {} }) {
  const cap = capFor(planTier);
  const [state, setState] = useState({ status: 'loading', seats: [], used: 0 });
  const [invite, setInvite] = useState({ url: null, active: true, copied: false });
  const [email, setEmail] = useState('');
  const [inviteError, setInviteError] = useState(null);
  const [confirmKick, setConfirmKick] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    const r = await client.getSeats(jwt);
    if (!r.ok) {
      setState({ status: 'error', seats: [], used: 0 });
      return;
    }
    setState({
      status: 'ready',
      seats: r.seats,
      used: typeof r.used === 'number' ? r.used : usage(r.seats),
    });
    const link = await client.issueInviteLink(jwt);
    if (link.ok) setInvite({ url: link.url, active: link.active, copied: false });
  }, [client, jwt, setState, setInvite]);

  useEffect(() => { load(); }, [load]);

  const free = hasFreeSeat({ cap, used: state.used });

  const onInvite = async (e) => {
    e.preventDefault();
    setInviteError(null);
    const addr = email.trim().toLowerCase();
    if (!addr || !addr.includes('@')) { setInviteError('Enter a valid email.'); return; }
    setBusy(true);
    const r = await client.createSeat(jwt, addr);
    setBusy(false);
    if (!r.ok) {
      setInviteError(
        r.reason === 'seat_cap_reached'
          ? "You're at your seat limit — kick an editor or upgrade."
          : 'Invite failed. Try again.',
      );
      return;
    }
    setEmail('');
    load();
  };

  const onKick = async (seatId) => {
    setBusy(true);
    const r = await client.removeSeat(jwt, seatId);
    setBusy(false);
    setConfirmKick(null);
    if (r.ok) load();
  };

  const copyLink = async () => {
    if (!invite.url) return;
    try {
      await navigator.clipboard.writeText(invite.url);
      setInvite((i) => ({ ...i, copied: true }));
    } catch { /* clipboard blocked — ignore */ }
  };

  // Slackers first: most-overdue on top, then least-complete.
  const roster = [...state.seats]
    .filter((s) => s.status !== 'removed')
    .sort((a, b) => (b.overdueDays || 0) - (a.overdueDays || 0) || (a.completionPct || 0) - (b.completionPct || 0));

  const linkUsable = free && invite.active;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white">
      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* Co-branded header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-orange-500/15 border border-orange-500/25 flex items-center justify-center font-black text-orange-400">
                {(brand.name || 'A')[0]}
              </div>
            )}
            <div>
              <h1 className="font-display text-[20px] leading-none tracking-tight">{brand.name || 'Your team'}</h1>
              <span className="text-[11px] text-gray-500">
                Powered by Aditor · {planTier === 'upgrade' ? 'Upgrade' : 'Course'} plan
              </span>
            </div>
          </div>
          <button
            onClick={load}
            className="text-gray-500 hover:text-gray-300 active:scale-90 p-3 -m-1 cursor-pointer transition-transform duration-150"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Seat meter */}
        <div className="bg-[#17171B] rounded-2xl border border-white/10 p-5 mb-4">
          <SeatMeter used={state.used} cap={cap} />
        </div>

        {/* Invite controls */}
        <div className="bg-[#17171B] rounded-2xl border border-white/10 p-5 mb-6 space-y-4">
          <div>
            <label className="text-[12px] font-semibold text-gray-400 flex items-center gap-2 mb-2">
              <LinkIcon size={13} /> Share your team link
            </label>
            <div className={`flex items-center gap-2 ${linkUsable ? '' : 'opacity-40 pointer-events-none'}`}>
              <input readOnly value={invite.url || '…'} className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-gray-300 truncate" />
              <button
                onClick={copyLink}
                className="shrink-0 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-[13px] flex items-center gap-1.5 cursor-pointer transition-[background-color,transform] duration-150"
              >
                {invite.copied ? <><Check size={14} className="text-emerald-400" /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            {!linkUsable && (
              <p className="text-[12px] text-amber-300/80 mt-2">
                Link paused — you're at {cap}/{cap} seats. Kick an editor to reactivate.
              </p>
            )}
          </div>

          <form onSubmit={onInvite}>
            <label className="text-[12px] font-semibold text-gray-400 flex items-center gap-2 mb-2">
              <Mail size={13} /> Or invite by email
            </label>
            <div className="flex items-center gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@email.com"
                disabled={!free || busy}
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={!free || busy}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#C44D1E] text-white font-bold text-[13px] active:scale-95 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-transform duration-150"
              >
                Invite
              </button>
            </div>
            {inviteError && <p className="text-[12px] text-red-400 mt-2">{inviteError}</p>}
          </form>
        </div>

        {/* Roster */}
        <h2 className="text-[13px] font-semibold text-gray-400 mb-3 px-1">Editors</h2>
        {state.status === 'loading' && (
          <div className="text-gray-500 text-sm px-1 py-8 text-center">Loading…</div>
        )}
        {state.status === 'error' && (
          <div className="text-amber-300/80 text-sm px-1 py-8 text-center flex flex-col items-center gap-2">
            <AlertTriangle size={20} /> Couldn't reach the suite.
            <button onClick={load} className="underline">Retry</button>
          </div>
        )}
        {state.status === 'ready' && roster.length === 0 && (
          <div className="text-gray-500 text-sm px-1 py-10 text-center border border-dashed border-white/10 rounded-2xl">
            No editors yet — share your link or invite by email above.
          </div>
        )}
        {state.status === 'ready' && roster.length > 0 && (
          <div className="bg-[#17171B] rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
            {roster.map((s) => (
              <div key={s.seatId} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium truncate">{s.name || s.email}</div>
                  <div className="text-[11px] text-gray-500 truncate">{s.email}</div>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_CHIP[s.status] || STATUS_CHIP.removed}`}>
                  {s.status}
                </span>
                <CompletionBar pct={s.completionPct} />
                <div className="w-16 text-right">
                  {s.overdueDays > 0 ? (
                    <span className="text-[12px] text-red-400 font-semibold flex items-center justify-end gap-1">
                      <AlertTriangle size={12} /> {s.overdueDays}d
                    </span>
                  ) : (
                    <span className="text-[12px] text-gray-600">—</span>
                  )}
                </div>
                {confirmKick === s.seatId ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onKick(s.seatId)}
                      disabled={busy}
                      className="text-[12px] text-red-400 font-semibold px-3 py-2.5 cursor-pointer active:scale-95 disabled:cursor-not-allowed transition-transform duration-150"
                    >
                      Kick
                    </button>
                    <button
                      onClick={() => setConfirmKick(null)}
                      className="text-[14px] text-gray-500 hover:text-gray-300 px-2.5 py-2.5 cursor-pointer active:scale-90 transition-transform duration-150"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmKick(s.seatId)}
                    className="text-gray-600 hover:text-red-400 p-3 -m-1 cursor-pointer active:scale-90 transition-transform duration-150"
                    title="Kick editor"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
