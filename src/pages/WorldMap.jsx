import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, ChevronRight, Flame, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWorlds, getAllLessonIds } from '../data/courseData';

// World-specific icons/emojis for visual variety
const WORLD_ICONS = {
  w1: '🎯', w2: '🏔️', w3: '⚡', w4: '🎬',
};

export default function WorldMap({ user }) {
  const navigate = useNavigate();
  const worlds = getWorlds().sort((a, b) => a.order - b.order);
  const allLessonIds = getAllLessonIds();
  const completedLessons = user?.progress?.completedLessons || [];
  const scores = user?.progress?.scores || {};

  function isWorldUnlocked(world) {
    if (!world.unlockAfterWorld) return true;
    const prevWorld = worlds.find((w) => w.id === world.unlockAfterWorld);
    if (!prevWorld) return true;
    return prevWorld.lessons.every((l) => completedLessons.includes(l.id));
  }

  function getWorldProgress(world) {
    const total = world.lessons.length;
    const done = world.lessons.filter((l) => completedLessons.includes(l.id)).length;
    return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }

  function isLessonUnlocked(lesson, world) {
    if (!isWorldUnlocked(world)) return false;
    const worldLessons = world.lessons.sort((a, b) => a.order - b.order);
    const idx = worldLessons.findIndex((l) => l.id === lesson.id);
    if (idx === 0) return true;
    return completedLessons.includes(worldLessons[idx - 1].id);
  }

  // Find the current active lesson (first unlocked incomplete)
  function getCurrentLesson() {
    for (const world of worlds) {
      if (!isWorldUnlocked(world)) continue;
      for (const lesson of world.lessons.sort((a, b) => a.order - b.order)) {
        if (!completedLessons.includes(lesson.id) && isLessonUnlocked(lesson, world)) {
          return lesson.id;
        }
      }
    }
    return null;
  }

  const currentLessonId = getCurrentLesson();
  const totalProgress = allLessonIds.length > 0
    ? Math.round((completedLessons.length / allLessonIds.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-24 hide-scrollbar">
      {/* XP Progress bar under header */}
      <div className="px-4 pt-3 pb-1">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-[#1a1f35] rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400"
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ boxShadow: '0 0 12px rgba(251,146,60,0.4)' }}
              />
            </div>
            <span className="text-xs font-black text-orange-400 tabular-nums min-w-[36px] text-right">
              {totalProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* World cards */}
      <div className="px-4 pt-2">
        <div className="max-w-lg mx-auto space-y-5">
          {worlds.map((world, wIdx) => {
            const unlocked = isWorldUnlocked(world);
            const wp = getWorldProgress(world);
            const isComplete = wp.percent === 100;
            const sortedLessons = world.lessons.sort((a, b) => a.order - b.order);
            const worldIcon = WORLD_ICONS[world.id] || '🌍';

            return (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: wIdx * 0.1 }}
              >
                <div
                  className={`
                    rounded-3xl overflow-hidden transition-all
                    ${unlocked
                      ? 'border-2 border-white/10'
                      : 'border border-white/[0.04] opacity-45'}
                  `}
                  style={unlocked ? {
                    background: 'linear-gradient(145deg, rgba(15,19,40,0.95), rgba(10,14,26,0.98))',
                  } : {
                    background: 'rgba(15,19,40,0.5)',
                  }}
                >
                  {/* World banner */}
                  <div className={`relative overflow-hidden ${unlocked ? 'p-4 pb-3' : 'p-4'}`}>
                    {/* Gradient background glow */}
                    {unlocked && (
                      <div
                        className={`absolute inset-0 opacity-20 bg-gradient-to-br ${world.themeColor}`}
                        style={{ filter: 'blur(30px)' }}
                      />
                    )}

                    {/* Cover image */}
                    {world.imageUrl && unlocked && (
                      <div className="absolute inset-0">
                        <img src={world.imageUrl} alt="" className="w-full h-full object-cover opacity-25" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/60 via-[#0a0e1a]/80 to-[#0a0e1a]" />
                      </div>
                    )}

                    <div className="relative flex items-center gap-3">
                      {/* World icon */}
                      <div
                        className={`
                          w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0
                          border-b-[3px] transition-all
                          ${unlocked
                            ? isComplete
                              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-600 shadow-lg shadow-yellow-500/30'
                              : `bg-gradient-to-br ${world.themeColor} border-black/30 shadow-lg`
                            : 'bg-[#1a1f35] border-[#12162a] text-gray-600'}
                        `}
                      >
                        {!unlocked ? (
                          <Lock size={22} className="text-gray-600" />
                        ) : isComplete ? (
                          <Star size={24} className="text-yellow-900" fill="currentColor" />
                        ) : (
                          <span>{worldIcon}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-black text-[17px] leading-tight ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                          {world.name}
                        </h3>
                        <p className={`text-[11px] font-bold uppercase tracking-[0.15em] mt-0.5 ${unlocked ? world.accentColor : 'text-gray-600'}`}>
                          {world.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {unlocked && (
                      <div className="relative mt-3 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${world.themeColor} transition-all duration-700`}
                            style={{
                              width: `${wp.percent}%`,
                              boxShadow: wp.percent > 0 ? `0 0 8px rgba(251,146,60,0.3)` : 'none',
                            }}
                          />
                        </div>
                        <span className={`text-[11px] font-black tabular-nums ${world.accentColor}`}>
                          {wp.done}/{wp.total}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Lesson nodes */}
                  {unlocked && (
                    <div className="px-3 pb-3 space-y-2">
                      {sortedLessons.map((lesson, lIdx) => {
                        const lComplete = completedLessons.includes(lesson.id);
                        const lUnlocked = isLessonUnlocked(lesson, world);
                        const isCurrent = lesson.id === currentLessonId;
                        const lScore = scores[lesson.id];

                        return (
                          <motion.button
                            key={lesson.id}
                            onClick={() => lUnlocked && navigate(`/lesson/${lesson.id}`)}
                            disabled={!lUnlocked}
                            whileTap={lUnlocked ? { scale: 0.97 } : {}}
                            className={`
                              w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left
                              ${isCurrent
                                ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/10 border-2 border-orange-500/40 shadow-lg shadow-orange-500/10'
                                : lComplete
                                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                                  : lUnlocked
                                    ? 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10'
                                    : 'bg-transparent border border-white/[0.03] cursor-not-allowed'}
                            `}
                          >
                            {/* Lesson circle */}
                            <div
                              className={`
                                w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                                border-b-[3px] font-black text-sm
                                ${lComplete
                                  ? 'bg-emerald-500 border-emerald-700 text-white shadow-md shadow-emerald-500/25'
                                  : isCurrent
                                    ? 'bg-gradient-to-br from-orange-400 to-red-500 border-orange-700 text-white shadow-md shadow-orange-500/30 animate-pulse-glow'
                                    : lUnlocked
                                      ? 'bg-[#222850] border-[#1a2040] text-gray-300'
                                      : 'bg-[#161b35] border-[#111530] text-gray-600'}
                              `}
                            >
                              {lComplete ? (
                                <CheckCircle size={18} strokeWidth={2.5} />
                              ) : !lUnlocked ? (
                                <Lock size={15} />
                              ) : (
                                <span className="text-base">{lIdx + 1}</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className={`text-[14px] font-bold ${
                                lComplete ? 'text-emerald-300'
                                : isCurrent ? 'text-white'
                                : lUnlocked ? 'text-white/80'
                                : 'text-gray-500'
                              }`}>
                                {lesson.title}
                              </div>
                              {lesson.subtitle && (
                                <div className={`text-[11px] mt-0.5 ${
                                  lComplete ? 'text-emerald-400/70'
                                  : isCurrent ? 'text-orange-300/80'
                                  : lUnlocked ? 'text-gray-400'
                                  : 'text-gray-600'
                                }`}>
                                  {lesson.subtitle}
                                </div>
                              )}
                            </div>

                            {/* Right side indicators */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {lScore && (
                                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-lg">
                                  {lScore.correct}/{lScore.total}
                                </span>
                              )}
                              {lesson.videoUrl && lUnlocked && !lComplete && (
                                <span className="text-[9px] font-bold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-md uppercase">
                                  Video
                                </span>
                              )}
                              {isCurrent && (
                                <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/30">
                                  <ChevronRight size={14} className="text-white" strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {/* Locked message */}
                  {!unlocked && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="flex items-center gap-2 text-gray-600 text-xs">
                        <Lock size={11} />
                        <span>Complete {worlds.find((w) => w.id === world.unlockAfterWorld)?.name} to unlock</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
