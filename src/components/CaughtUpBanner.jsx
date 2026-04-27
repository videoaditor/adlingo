import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';

export default function CaughtUpBanner({ mode = 'caught-up' }) {
  const isAllClear = mode === 'all-clear';
  const tone = isAllClear
    ? { border: 'border-indigo-400/25', bg: 'from-indigo-500/15 via-indigo-500/5 to-transparent', chipBg: 'bg-indigo-500/20', chipBorder: 'border-indigo-400/30', icon: 'text-indigo-200', title: 'text-indigo-100', sub: 'text-indigo-200/70' }
    : { border: 'border-emerald-500/25', bg: 'from-emerald-500/10 via-emerald-500/5 to-transparent', chipBg: 'bg-emerald-500/20', chipBorder: 'border-emerald-400/30', icon: 'text-emerald-300', title: 'text-emerald-200', sub: 'text-emerald-300/70' };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 220 }}
      className={`relative overflow-hidden rounded-2xl border ${tone.border} bg-gradient-to-r ${tone.bg} p-3 pl-3.5`}
    >
      <motion.div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '400%' }}
        transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
      />
      <div className="relative flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${tone.chipBg} border ${tone.chipBorder} flex items-center justify-center shrink-0`}>
          {isAllClear ? (
            <Sparkles size={18} className={tone.icon} strokeWidth={2.5} />
          ) : (
            <Check size={18} className={tone.icon} strokeWidth={3} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-[14px] font-bold leading-tight tracking-tight ${tone.title}`}>
            {isAllClear ? "You've cleared every lesson" : "You're all caught up"}
          </div>
          <div className={`text-[11px] font-medium mt-0.5 ${tone.sub}`}>
            {isAllClear ? 'New content unlocks as it ships.' : 'Nice work — check back for new lessons.'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
