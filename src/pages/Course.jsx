import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, Play, BookOpen, ChevronRight } from 'lucide-react';
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

  // Auto-select first unlocked lesson on mount
  useEffect(() => {
    if (!activeLesson) {
      for (const world of worlds) {
        if (!isWorldUnlocked(world)) continue;
        for (const lesson of world.lessons.sort((a, b) => a.order - b.order)) {
          if (isLessonUnlocked(lesson, world)) {
            setActiveLesson({ lesson, world });
            return;
          }
        }
      }
    }
  }, []);

  const selectedLesson = activeLesson?.lesson;
  const selectedWorld = activeLesson?.world;

  // Sidebar content — shared between mobile and desktop
  const renderSidebar = (isMobile = false) => (
    <div className={`space-y-1 ${isMobile ? '' : ''}`}>
      {worlds.map((world) => {
        const unlocked = isWorldUnlocked(world);
        const sortedLessons = world.lessons.sort((a, b) => a.order - b.order);

        return (
          <div key={world.id} className="mb-1">
            {/* World heading */}
            <div className={`flex items-center gap-2.5 px-3 py-2.5 ${!unlocked ? 'opacity-40' : ''}`}>
              <div
                className={`w-1 h-5 rounded-full shrink-0 ${unlocked
                  ? `bg-gradient-to-b ${world.themeColor}`
                  : 'bg-gray-700'}`}
              />
              <span className={`text-[11px] font-black uppercase tracking-[0.12em] ${
                unlocked ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {world.name}
              </span>
              {!unlocked && <Lock size={10} className="text-gray-600 ml-auto" />}
            </div>

            {/* Lessons */}
            <div className="space-y-0.5">
              {sortedLessons.map((lesson, lIdx) => {
                const isComplete = completedLessons.includes(lesson.id);
                const lUnlocked = unlocked && isLessonUnlocked(lesson, world);
                const isActive = selectedLesson?.id === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => lUnlocked && setActiveLesson({ lesson, world })}
                    disabled={!lUnlocked}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all rounded-lg mx-0
                      ${isActive
                        ? 'bg-orange-500/15 border-l-2 border-orange-400'
                        : lUnlocked
                          ? 'hover:bg-white/[0.04] border-l-2 border-transparent'
                          : 'opacity-35 cursor-not-allowed border-l-2 border-transparent'}
                    `}
                  >
                    {/* Status icon */}
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-black
                      ${isComplete
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isActive
                          ? 'bg-orange-500/20 text-orange-400'
                          : lUnlocked
                            ? 'bg-white/[0.05] text-gray-500'
                            : 'text-gray-700'}
                    `}>
                      {isComplete ? (
                        <CheckCircle size={12} strokeWidth={2.5} />
                      ) : !lUnlocked ? (
                        <Lock size={10} />
                      ) : (
                        lIdx + 1
                      )}
                    </div>

                    <span className={`text-[13px] font-medium truncate flex-1 ${
                      isActive ? 'text-orange-200'
                      : isComplete ? 'text-emerald-300/70'
                      : lUnlocked ? 'text-gray-300'
                      : 'text-gray-600'
                    }`}>
                      {lesson.title}
                    </span>

                    {isActive && (
                      <Play size={10} className="text-orange-400 shrink-0" fill="currentColor" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ─── MOBILE LAYOUT (no lesson selected = show list, lesson selected = show video) ───
  // ─── DESKTOP LAYOUT (sidebar + main content side by side) ───

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* ═══ DESKTOP: sidebar + content ═══ */}
      <div className="hidden lg:flex min-h-[calc(100vh-60px)]">
        {/* Left sidebar */}
        <aside className="w-72 xl:w-80 shrink-0 bg-[#0c1024] border-r border-white/5 overflow-y-auto hide-scrollbar">
          <div className="px-3 pt-5 pb-3">
            <h2 className="text-[15px] font-black text-white px-3 mb-0.5">Curriculum</h2>
            <p className="text-gray-500 text-[11px] px-3 mb-4">Watch each lesson before your test.</p>
          </div>
          <nav className="px-2 pb-8">
            {renderSidebar()}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto hide-scrollbar">
          {selectedLesson ? (
            <div className="max-w-4xl mx-auto px-6 xl:px-10 py-8">
              {/* Lesson header */}
              <div className="mb-5">
                <div className={`text-[11px] font-bold uppercase tracking-[0.15em] ${selectedWorld.accentColor} mb-1.5`}>
                  {selectedWorld.name}
                </div>
                <h1 className="text-[28px] font-black text-white leading-tight">
                  {selectedLesson.title}
                </h1>
                {selectedLesson.subtitle && (
                  <p className="text-gray-400 text-[15px] mt-1.5">{selectedLesson.subtitle}</p>
                )}
              </div>

              {/* Video player */}
              <div className="mb-6">
                {selectedLesson.videoUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-white/5">
                    <VideoPlayer url={selectedLesson.videoUrl} title={selectedLesson.title} />
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-[#141833] rounded-2xl flex flex-col items-center justify-center border border-white/5">
                    <Play size={40} className="text-gray-600 mb-3" />
                    <p className="text-gray-500 text-sm font-medium">Video coming soon</p>
                  </div>
                )}
              </div>

              {/* Content area below video — space for future lesson notes/text */}
              <div className="border-t border-white/5 pt-6">
                <div className="text-gray-500 text-[13px] leading-relaxed">
                  {selectedLesson.subtitle && (
                    <p className="text-gray-400 text-[15px] font-medium mb-2">{selectedLesson.subtitle}</p>
                  )}
                  {/* Placeholder for future lesson description / notes */}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Select a lesson to start learning</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ═══ MOBILE: stacked layout ═══ */}
      <div className="lg:hidden pb-24">
        {activeLesson ? (
          /* Mobile: video view */
          <div>
            <div className="px-4 pt-4 pb-3">
              <button
                onClick={() => setActiveLesson(null)}
                className="text-[13px] text-gray-500 hover:text-gray-300 transition mb-3 flex items-center gap-1"
              >
                <span className="text-lg leading-none">&larr;</span> Back to curriculum
              </button>
              <div className={`text-[10px] font-bold uppercase tracking-[0.15em] ${selectedWorld.accentColor} mb-1`}>
                {selectedWorld.name}
              </div>
              <h2 className="text-[20px] font-black text-white leading-tight">
                {selectedLesson.title}
              </h2>
              {selectedLesson.subtitle && (
                <p className="text-gray-400 text-[13px] mt-1">{selectedLesson.subtitle}</p>
              )}
            </div>

            <div className="px-4">
              <div className="max-w-lg mx-auto">
                {selectedLesson.videoUrl ? (
                  <VideoPlayer url={selectedLesson.videoUrl} title={selectedLesson.title} />
                ) : (
                  <div className="w-full aspect-video bg-[#141833] rounded-2xl flex flex-col items-center justify-center border border-white/5">
                    <Play size={32} className="text-gray-600 mb-2" />
                    <p className="text-gray-500 text-sm font-medium">Video coming soon</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Mobile: curriculum list */
          <div>
            <div className="px-4 pt-4 pb-3">
              <div className="max-w-lg mx-auto">
                <h2 className="text-[20px] font-black text-white mb-1">Curriculum</h2>
                <p className="text-gray-500 text-[13px]">Learn the craft. Watch each lesson before your test.</p>
              </div>
            </div>

            <div className="px-2">
              <div className="max-w-lg mx-auto">
                {renderSidebar(true)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
