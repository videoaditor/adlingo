import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Flame, Trophy, Settings, LogOut, Map, BookOpen, User, BarChart3 } from 'lucide-react';

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const progress = user?.progress || {};
  const xp = progress.xp || 0;
  const streak = progress.streak || 0;

  return (
    <>
      {/* Top bar — iOS style */}
      <header className="sticky top-0 z-50 bg-[#0f1328]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Flame size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-[17px] tracking-tight text-white">
              AdLingo
            </span>
          </button>

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
              icon={BarChart3}
              label="Rank"
              active={false}
              onClick={() => {}}
              disabled
            />
            <TabItem
              icon={User}
              label="Profile"
              active={false}
              onClick={onLogout}
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
