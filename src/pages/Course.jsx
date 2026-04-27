import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle, Play, BookOpen, ChevronRight, ChevronDown, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWorlds } from '../data/courseData';
import VideoPlayer from '../components/VideoPlayer';
import { haptic } from '../services/haptics';

export default function Course({ user }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const worlds = getWorlds().sort((a, b) => a.order - b.order);
  const completedLessons = user?.progress?.completedLessons || [];
  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedWorlds, setExpandedWorlds] = useState(() => new Set(worlds.map((w) => w.id)));

  const toggleWorld = (worldId) => {
    haptic('light');
    setExpandedWorlds((prev) => {
      const next = new Set(prev);
      if (next.has(worldId)) next.delete(worldId); else next.add(worldId);
      return next;
    });
  };

  // Keep URL in sync when a lesson is selected (deep-linkable from WorldMap)
  const selectLesson = (lesson, world) => {
    setActiveLesson({ lesson, world });
    setSearchParams({ lesson: lesson.id }, { replace: true });
    setExpandedWorlds((prev) => {
      if (prev.has(world.id)) return prev;
      const next = new Set(prev);
      next.add(world.id);
      return next;
    });
  };

  function isWorldUnlocked(world) {
    if (!world.unlockAfterWorld) return true;
    const prevWorld = worlds.find((w) => w.id === world.unlockAfterWorld);
    if (!prevWorld) return true;
    return prevWorld.lessons.every((l) => completedLessons.includes(l.id));
  }

  function isLessonUnlocked(lesson, world) {
    // All lessons in an unlocked world are accessible
    return isWorldUnlocked(world);
  }

  // Auto-select: honor ?lesson=<id> if present, otherwise first unlocked lesson
  useEffect(() => {
    if (activeLesson) return;
    const queryLessonId = searchParams.get('lesson');
    if (queryLessonId) {
      for (const world of worlds) {
        const match = world.lessons.find((l) => l.id === queryLessonId);
        if (match && isWorldUnlocked(world)) {
          setActiveLesson({ lesson: match, world });
          return;
        }
      }
    }
    for (const world of worlds) {
      if (!isWorldUnlocked(world)) continue;
      for (const lesson of world.lessons.sort((a, b) => a.order - b.order)) {
        if (isLessonUnlocked(lesson, world)) {
          setActiveLesson({ lesson, world });
          return;
        }
      }
    }
  }, []);

  const selectedLesson = activeLesson?.lesson;
  const selectedWorld = activeLesson?.world;

  // Sidebar — editorial ToC with collapsible world cards
  const renderSidebar = () => (
    <div className="space-y-2.5">
      {worlds.map((world, wIdx) => {
        const unlocked = isWorldUnlocked(world);
        const sortedLessons = world.lessons.sort((a, b) => a.order - b.order);
        const isExpanded = expandedWorlds.has(world.id);
        const done = sortedLessons.filter((l) => completedLessons.includes(l.id)).length;
        const total = sortedLessons.length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;

        return (
          <section
            key={world.id}
            className={`rounded-xl overflow-hidden border ${unlocked ? 'border-white/[0.06] bg-white/[0.015]' : 'border-white/[0.03] bg-transparent'}`}
          >
            <button
              onClick={() => toggleWorld(world.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/[0.025] transition-colors"
            >
              <ChevronDown
                size={13}
                className={`text-gray-600 shrink-0 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
                strokeWidth={2.5}
              />
              <span className="meta-label text-gray-600 shrink-0 tabular-nums">
                W · {String(wIdx + 1).padStart(2, '0')}
              </span>
              <span className={`text-[12px] font-semibold tracking-tight truncate flex-1 ${unlocked ? 'text-[#F5F5F2]' : 'text-gray-600'}`}>
                {world.name}
              </span>
              {unlocked ? (
                <span className={`meta-label tabular-nums shrink-0 ${done === total && total > 0 ? world.accentColor : 'text-gray-600'}`}>
                  {done}/{total}
                </span>
              ) : (
                <Lock size={10} className="text-gray-700 shrink-0" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && unlocked && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/[0.05] pb-1">
                    {sortedLessons.map((lesson, lIdx) => {
                      const isComplete = completedLessons.includes(lesson.id);
                      const lUnlocked = unlocked && isLessonUnlocked(lesson, world);
                      const isActive = selectedLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => { if (lUnlocked) { haptic('light'); selectLesson(lesson, world); } }}
                          disabled={!lUnlocked}
                          className={`
                            w-full flex items-center gap-3 pl-3 pr-3 py-2 text-left transition-colors
                            ${isActive
                              ? 'bg-white/[0.04]'
                              : lUnlocked
                                ? 'hover:bg-white/[0.02]'
                                : 'opacity-35 cursor-not-allowed'}
                          `}
                        >
                          <span className={`meta-label tabular-nums shrink-0 w-6 ${
                            isActive ? 'text-[#FF6B35]' : 'text-gray-600'
                          }`}>
                            {String(lIdx + 1).padStart(2, '0')}
                          </span>

                          <span className={`text-[13px] truncate flex-1 transition-colors ${
                            isActive ? 'text-white font-semibold'
                            : isComplete ? 'text-[#A8A8A4] line-through decoration-[0.5px] decoration-[#6B6B68] decoration-skip-ink-none'
                            : lUnlocked ? 'text-gray-300 font-medium'
                            : 'text-gray-600'
                          }`}>
                            {lesson.title}
                          </span>

                          {isComplete && !isActive && (
                            <Check size={11} className="text-gray-500 shrink-0" strokeWidth={2.5} />
                          )}
                          {isActive && (
                            <span className="meta-label text-[#FF6B35] shrink-0">Now</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}
    </div>
  );

  // ─── MOBILE LAYOUT (no lesson selected = show list, lesson selected = show video) ───
  // ─── DESKTOP LAYOUT (sidebar + main content side by side) ───

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      {/* ═══ DESKTOP: sidebar + content ═══ */}
      <div className="hidden lg:flex min-h-[calc(100vh-60px)]">
        {/* Left sidebar */}
        <aside className="w-72 xl:w-80 shrink-0 bg-[#111114] border-r border-white/5 overflow-y-auto hide-scrollbar">
          <div className="px-3 pt-5 pb-3">
            <div className="meta-label text-gray-500 px-3 mb-1">Curriculum · Volume 01</div>
            <h2 className="text-[16px] font-bold text-white px-3 mb-0.5 tracking-tight">Editor training</h2>
            <p className="text-gray-500 text-[11px] px-3 mb-4">Watch each lesson before your test.</p>
          </div>
          <nav className="px-2 pb-8">
            {renderSidebar()}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto hide-scrollbar">
          {selectedLesson ? (
            <div className="max-w-4xl mx-auto px-6 xl:px-10 py-10">
              <LessonDetail
                world={selectedWorld}
                lesson={selectedLesson}
                completedLessons={completedLessons}
                onTakeTest={() => { haptic('nav'); navigate(`/lesson/${selectedLesson.id}`); }}
                size="desktop"
              />
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
            <div className="px-4 pt-4 pb-4">
              <button
                onClick={() => { haptic('light'); setActiveLesson(null); setSearchParams({}, { replace: true }); }}
                className="meta-label text-gray-500 hover:text-gray-300 transition mb-3 flex items-center gap-1"
              >
                <span className="text-base leading-none">&larr;</span> Curriculum
              </button>
            </div>
            <div className="px-4">
              <div className="max-w-lg mx-auto">
                <LessonDetail
                  world={selectedWorld}
                  lesson={selectedLesson}
                  completedLessons={completedLessons}
                  onTakeTest={() => { haptic('nav'); navigate(`/lesson/${selectedLesson.id}`); }}
                  size="mobile"
                />
              </div>
            </div>

            {/* Table of contents below the video */}
            <div className="px-4 mt-8">
              <div className="max-w-lg mx-auto border-t border-white/[0.06] pt-5">
                <div className="meta-label text-gray-600 mb-2">Table of contents</div>
                {renderSidebar()}
              </div>
            </div>
          </div>
        ) : (
          /* Mobile: curriculum list */
          <div>
            <div className="px-4 pt-4 pb-3">
              <div className="max-w-lg mx-auto">
                <div className="meta-label text-gray-500 mb-1">Curriculum · Volume 01</div>
                <h2 className="text-[22px] font-bold text-white mb-1 tracking-tight">Editor training</h2>
                <p className="text-gray-500 text-[13px]">Learn the craft. Watch each lesson before your test.</p>
              </div>
            </div>

            <div className="px-2">
              <div className="max-w-lg mx-auto">
                {renderSidebar()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Shared lesson detail view — editorial header, video, Take the test CTA
function LessonDetail({ world, lesson, completedLessons, onTakeTest, size }) {
  const lessonIndex = world.lessons.findIndex((l) => l.id === lesson.id) + 1;
  const worldIndex = lesson ? (world.order || 1) : 1;
  const isTested = completedLessons.includes(lesson.id);
  const isDesktop = size === 'desktop';
  const headingSize = isDesktop ? 'text-[32px]' : 'text-[22px]';

  return (
    <>
      {/* Editorial breadcrumb meta */}
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <span className="meta-label text-gray-500 tabular-nums">
          VOL · 01
        </span>
        <span className="text-gray-700 text-[10px]">·</span>
        <span className="meta-label text-gray-500 tabular-nums">
          W · {String(worldIndex).padStart(2, '0')} · {world.name.toUpperCase()}
        </span>
        <span className="text-gray-700 text-[10px]">·</span>
        <span className={`meta-label tabular-nums ${isTested ? 'text-emerald-400/70' : 'text-[#FF6B35]'}`}>
          Lesson · {String(lessonIndex).padStart(2, '0')}
        </span>
      </div>

      {/* Title */}
      <h1 className={`${headingSize} font-bold text-[#F5F5F2] leading-[1.1] tracking-tight mb-2`}>
        {lesson.title}
      </h1>
      {lesson.subtitle && (
        <p className="text-[#A8A8A4] text-[15px] leading-relaxed mb-6 max-w-2xl">
          {lesson.subtitle}
        </p>
      )}

      {/* Hairline */}
      <div className="h-px bg-white/[0.06] my-5" />

      {/* Video player */}
      <div className="mb-8">
        {lesson.videoUrl ? (
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <VideoPlayer url={lesson.videoUrl} title={lesson.title} />
          </div>
        ) : (
          <div className="w-full aspect-video bg-[#111114] rounded-xl flex flex-col items-center justify-center border border-white/[0.06]">
            <Play size={32} className="text-gray-700 mb-2" />
            <p className="text-gray-500 text-[13px] font-medium">Video not yet published</p>
          </div>
        )}
      </div>

      {/* Bridge to gamified quiz — only when not yet tested */}
      {!isTested && (
        <div className="border-t border-white/[0.06] pt-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="meta-label text-gray-500 mb-0.5">Next</div>
              <div className="text-[15px] font-semibold text-[#F5F5F2] tracking-tight">
                Test your knowledge
              </div>
              <div className="text-[12px] text-gray-500 mt-0.5">
                {lesson.questions?.length || 0} questions · ~{Math.max(1, Math.ceil((lesson.questions?.length || 0) * 0.5))} min
              </div>
            </div>
            <button
              onClick={onTakeTest}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#C44D1E] text-white font-bold text-[13px] uppercase tracking-wider border-b-[3px] border-[#8A2F0F] active:border-b-0 active:translate-y-[3px] shadow-brand-glow transition-all"
            >
              Take the test
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* Completed footer — quiet, bottom-right retake link */}
      {isTested && (
        <div className="border-t border-white/[0.06] pt-5 flex items-center justify-end gap-3">
          <span className="meta-label text-gray-500 flex items-center gap-1.5">
            <Check size={11} strokeWidth={2.5} className={world.accentColor} />
            Completed
          </span>
          <span className="text-gray-700">·</span>
          <button
            onClick={onTakeTest}
            className="meta-label text-gray-400 hover:text-[#FF6B35] transition-colors"
          >
            Retake test
          </button>
        </div>
      )}
    </>
  );
}
