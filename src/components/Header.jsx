import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Flame, Trophy, Settings, LogOut, Map, BookOpen, User, BarChart3, ArrowLeft, X } from 'lucide-react';

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const progress = user?.progress || {};
  const xp = progress.xp || 0;
  const streak = progress.streak || 0;
  const [showProfile, setShowProfile] = useState(false);

  const allLessons = Object.values(progress.scores || {}).length;
  const completedLessons = progress.completedLessons?.length || 0;

  return (
    <>
      {/* Top bar — iOS style */}
      <header className="sticky top-0 z-50 bg-[#0f1328]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo / Back to Hub link */}
          <a href="https://hub.aditor.ai" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Flame size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-[17px] tracking-tight text-white">
              AdLingo
            </span>
          </a>

          {/* Stats pills */}
          <div className="flex items-center gap-1.5">
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-orange-500/15 text-orange-400 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-orange-500/20">
                <Flame size={13} strokeWidth={2.5} />
                {streak}
              </div>
            )}
            <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-yellow-500/15">
              <Trophy size={13} strokeWidth={2.5} />
              {xp.toLocaleString()}
            </div>
            {user?.email?.endsWith('@aditor.ai') && location.pathname !== '/admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition border border-white/5"
              >
                <Settings size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-[#0f1328] rounded-t-3xl px-4 py-4 border-t border-white/5">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-black text-white">Profile</h3>
                <button
                  onClick={() => setShowProfile(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="px-3 py-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[11px] font-bold uppercase text-gray-500 mb-1">Editor Name</div>
                  <div className="text-[16px] font-semibold text-white">{user?.name || 'Anonymous'}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="px-3 py-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[11px] font-bold uppercase text-gray-500 mb-1">Rank</div>
                    <div className="text-[16px] font-semibold text-orange-400">{user?.rank || 'Unranked'}</div>
                  </div>
                  <div className="px-3 py-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[11px] font-bold uppercase text-gray-500 mb-1">Streak</div>
                    <div className="text-[16px] font-semibold text-orange-400">{streak}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="px-3 py-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[11px] font-bold uppercase text-gray-500 mb-1">Total XP</div>
                    <div className="text-[16px] font-semibold text-yellow-400">{xp.toLocaleString()}</div>
                  </div>
                  <div className="px-3 py-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[11px] font-bold uppercase text-gray-500 mb-1">Lessons</div>
                    <div className="text-[16px] font-semibold text-emerald-400">{completedLessons}</div>
                  </div>
                </div>

                <div className="px-3 py-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[11px] font-bold uppercase text-gray-500 mb-1">Email</div>
                  <div className="text-[14px] font-medium text-gray-300">{user?.email || 'N/A'}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowProfile(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-semibold transition border border-red-500/20"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar — iOS style */}
      {location.pathname !== '/admin' && !location.pathname.startsWith('/lesson') && !location.pathname.startsWith('/admin') && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1328]/98 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
            <TabItem
              icon={BookOpen}
              label="Course"
              active={location.pathname === '/course'}
              onClick={() => navigate('/course')}
            />
            <TabItem
              icon={Map}
              label="Test"
              active={location.pathname === '/'}
              onClick={() => navigate('/')}
            />
            <TabItem
              icon={User}
              label="Profile"
              active={false}
              onClick={() => setShowProfile(true)}
            />
          </div>
        </nav>
      )}
    </>
  );
}

function TabItem({ icon: Icon, label, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
        active
          ? 'text-orange-400'
          : disabled
            ? 'text-gray-700'
            : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-orange-500/15' : ''}`}>
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}
