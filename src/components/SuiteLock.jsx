import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AditorLogo from './AditorLogo';

// Value-first lock shown when the spine denies entitlement for a suite editor.
// Leads with what the editor gains by clearing it, not a bare error. Built from
// the `lock` copy that gate.decideGate() derived from the spine `gate` object.
export default function SuiteLock({ lock, gate, onCta }) {
  const overdueSince = gate && gate.overdueSince;
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 16 }}
        className="max-w-sm w-full bg-[#17171B] rounded-3xl p-7 border border-white/10 shadow-2xl text-center"
      >
        <div className="mx-auto mb-5 flex items-center justify-center">
          <AditorLogo size={64} />
        </div>

        <div className="mx-auto mb-5 w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
          <Lock size={22} className="text-orange-400" strokeWidth={2.5} />
        </div>

        <h1 className="font-display text-[26px] leading-tight tracking-tight text-white mb-3">
          {lock.title}
        </h1>
        <p className="text-gray-400 text-[14px] leading-relaxed mb-2">{lock.body}</p>

        {overdueSince && (
          <p className="text-gray-500 text-[12px] mb-2">Overdue since {overdueSince}</p>
        )}

        {onCta && (
          <motion.button
            type="button"
            onClick={onCta}
            whileTap={{ scale: 0.97, y: 3 }}
            className="mt-5 w-full py-4 bg-gradient-to-br from-[#FF6B35] to-[#C44D1E] text-white font-black rounded-2xl uppercase tracking-wider text-[13px] border-b-[4px] border-[#8A2F0F] active:border-b-0 active:translate-y-[4px] shadow-brand-glow flex items-center justify-center gap-2"
          >
            {lock.cta}
            <ArrowRight size={15} strokeWidth={2.5} />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
