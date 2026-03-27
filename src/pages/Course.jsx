import React, { useState } from 'react';
import { Lock, CheckCircle, Play, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWorlds } from '../data/courseData';
import VideoPlayer from '../components/VideoPlayer';

export default function Course({ user }) {
  const worlds = getWorlds().sort((a, b) => a.order - b.order);
  const completedLessons = user?.progress?.completedLessons || [];
  const [activeLesson, setActiveLesson] = useState(null);

  function isWorldUnlocked(world) {
    if (!world.unlockAfterWorld) return true;
    const prevWorld = worlds.find((w) => w.id === world.unlockAfterWorld);
    if (!prevWorld) return true;
    return prevWorld.lessons.every((l) => completedLessons.includes(l.id));
  }

  function isLessonUnlocked(lesson, world) {
    if (!isWorldUnlocked(world)) return false;
    const worldLessons = world.lessons.sort((a, b) => a.order - b.order);
    const idx = worldLessons.findIndex((l) => l.id === lesson.id);
    if (idx === 0) return true;
    return completedLessons.includes(worldLessons[idx - 1].id);
  }

  // If a lesson is selected, show the video player full-screen style
  if (activeLesson) {
    const { lesson, world } = activeLesson;
    return (
      <div className="min-h-screen bg-[#0a0e1a] pb-24 hide-scrollbar">
        {/* Back + lesson info */}
        <div className="px-4 pt-4 pb-3">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setActiveLesson(null)}
              className="text-[13px] text-gray-500 hover:text-gray-300 transition mb-3 flex items-center gap-1"
            >
              <span className="text-lg leading-none">&larr;</span> Back to curriculum
            </button>
            <div className={`text-[10px] font-bold uppercase tracking-[0.15em] ${world.accentColor} mb-1`}>
              {world.name}
            </div>
            <h2 className="text-[20px] font-black text-white leading-tight">
              {lesson.title}
            </h2>
            {lesson.subtitle && (
              <p className="text-gray-400 text-[13px] mt-1">{lesson.subtitle}</p>
            )}
          </div>
        </div>

        {/* Video */}
        <div className="px-4">
          <div className="max-w-lg mx-auto">
            {lesson.videoUrl ? (
              <VideoPlayer url={lesson.videoUrl} title={lesson.title} />
            ) : (
              <div className="w-full aspect-video bg-[#141833] rounded-2xl flex flex-col items-center justify-center border border-white/5">
                <Play size={32} className="text-gray-600 mb-2" />
                <p className="text-gray-500 text-sm font-medium">Video coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Curriculum list
  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-24 hide-scrollbar">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="max-w-lg mx-auto">
          <h2 className="text-[20px] font-black text-white mb-1">Curriculum</h2>
          <p className="text-gray-500 text-[13px]">Learn the craft. Watch each lesson before your test.</p>
        </div>
      </div>

      {/* World sections */}
      <div className="px-4">
        <div className="max-w-lg mx-auto space-y-6">
          {worlds.map((world, wIdx) => {
            const unlocked = isWorldUnlocked(world);
            const sortedLessons = world.lessons.sort((a, b) => a.order - b.order);

            return (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: wIdx * 0.08 }}
              >
                {/* World label */}
                <div className="flex items-center gap-2 mb-2.5">
                  <div
                    className={`w-1.5 h-6 rounded-full ${unlocked
                      ? `bg-gradient-to-b ${world.themeColor}`
                      : 'bg-gray-700'}`}
                  />
                  <h3 className={`text-[13px] font-black uppercase tracking-wider ${unlocked ? 'text-white' : 'text-gray-600'}`}>
                    {world.name}
                  </h3>
                  {!unlocked && <Lock size={11} className="text-gray-600" />}
                </div>

                {/* Lesson rows */}
                <div className="space-y-1.5">
                  {sortedLessons.map((lesson, lIdx) => {
                    const isComplete = completedLessons.includes(lesson.id);
                    const lUnlocked = unlocked && isLessonUnlocked(lesson, world);
                    const hasVideo = !!lesson.videoUrl;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => lUnlocked && setActiveLesson({ lesson, world })}
                        disabled={!lUnlocked}
                        className={`
                          w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all
                          ${lUnlocked
                            ? 'hover:bg-white/[0.04] active:bg-white/[0.06]'
                            : 'opacity-40 cursor-not-allowed'}
                        `}
                      >
                        {/* Number / status */}
                        <div
                          className={`
                            w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black
                            ${isComplete
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : lUnlocked
                                ? 'bg-white/[0.06] text-gray-400'
                                : 'bg-white/[0.03] text-gray-600'}
                          `}
                        >
                          {isComplete ? (
                            <CheckCircle size={14} strokeWidth={2.5} />
                          ) : !lUnlocked ? (
                            <Lock size={12} />
                          ) : (
                            lIdx + 1
                          )}
                        </div>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <div className={`text-[14px] font-semibold truncate ${
                            isComplete ? 'text-emerald-300/80'
                            : lUnlocked ? 'text-white/90'
                            : 'text-gray-500'
                          }`}>
                            {lesson.title}
                          </div>
                        </div>

                        {/* Play indicator */}
                        {lUnlocked && !isComplete && (
                          <Play size={14} className="text-gray-500 shrink-0" fill="currentColor" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
