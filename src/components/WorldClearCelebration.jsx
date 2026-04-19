import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy } from 'lucide-react';
import ConfettiBurst from './ConfettiBurst';
import { haptic } from '../services/haptics';

export default function WorldClearCelebration({ world, onDismiss }) {
  useEffect(() => {
    if (!world) return;
    haptic('celebrate');
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [world, onDismiss]);

  return (
    <AnimatePresence>
      {world && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div className="relative flex items-center justify-center">
            <ConfettiBurst count={36} spread={280} />

            <motion.div
              initial={{ scale: 0.5, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -20, opacity: 0 }}
              transition={{ type: 'spring', damping: 14, stiffness: 200 }}
              className="relative bg-gradient-to-br from-[#1a1f35] to-[#0f1328] rounded-3xl px-7 py-6 border-2 border-yellow-400/30 shadow-2xl shadow-yellow-500/20 text-center max-w-xs"
            >
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 160, delay: 0.1 }}
                className="w-20 h-20 rounded-3xl mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-amber-500 border-b-4 border-yellow-600 flex items-center justify-center shadow-xl shadow-yellow-500/40"
              >
                <Trophy size={40} className="text-yellow-900" strokeWidth={2.5} />
              </motion.div>

              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 mb-1">
                World Complete
              </div>
              <h3 className="text-xl font-black text-white leading-tight mb-2">
                {world.name}
              </h3>
              <p className="text-[13px] text-gray-400 font-medium">
                You mastered every lesson. On to the next one.
              </p>

              <div className="mt-4 flex items-center justify-center gap-1 text-yellow-400">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 10, delay: 0.3 + i * 0.12 }}
                  >
                    <Star size={22} fill="currentColor" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
